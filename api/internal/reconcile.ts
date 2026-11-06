import { logger } from '../../src/server/core/logger';
import { executeQuery, checkDatabaseConnection, tbl } from '../../src/server/core/database';
import { cleanupExpiredSessions } from '../../src/server/repositories/sessionRepository';

export async function handleReconcileRequest(request: Request): Promise<Response> {
  const method = request.method;
  const cronSecret = request.headers.get('x-cron-secret') || request.headers.get('authorization')?.replace('Bearer ', '') || '';
  const envSecret = process.env.CRON_SECRET || '';

  // Verify cron secret
  if (!envSecret) {
    logger.error('cron.secret_not_configured', {
      route: '/api/internal/reconcile',
      method,
      statusCode: 503,
    });
    return new Response(JSON.stringify({
      status: 'unavailable',
      message: 'Cron authentication is not configured.',
    }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (cronSecret !== envSecret) {
    logger.warn('cron.unauthorized', {
      route: '/api/internal/reconcile',
      method,
      statusCode: 401,
    });
    return new Response(JSON.stringify({
      status: 'unauthorized',
      message: 'Invalid cron secret',
    }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (method !== 'POST') {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Method Not Allowed',
    }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const startTime = Date.now();
    let expiredSessionsCleaned = 0;
    let cachePurgesProcessed = 0;
    let heartbeatRecorded = false;

    const dbAvailable = await checkDatabaseConnection('app');
    if (dbAvailable) {
      // 1. Clean up expired user sessions
      expiredSessionsCleaned = await cleanupExpiredSessions();

      // 2. Process cache purge queue if table exists
      try {
        const purges = await executeQuery<{ id: string }>(
          `UPDATE ${tbl('cache_purge_queue')} 
           SET status = 'succeeded', updated_at = NOW() 
           WHERE status = 'pending' 
           RETURNING id`
        );
        cachePurgesProcessed = purges.length;
      } catch {
        // Table might not exist yet if not migrated
      }

      // 3. Record heartbeat in system_heartbeats table
      try {
        await executeQuery(
          `INSERT INTO ${tbl('system_heartbeats')} (job_name, last_run_at, last_success_at, last_status, details, updated_at)
           VALUES ('reconcile', NOW(), NOW(), 'ok', $1::jsonb, NOW())
           ON CONFLICT (job_name) DO UPDATE SET
             last_run_at = NOW(),
             last_success_at = NOW(),
             last_status = 'ok',
             details = EXCLUDED.details,
             updated_at = NOW()`,
          [JSON.stringify({ expiredSessionsCleaned, cachePurgesProcessed })]
        );
        heartbeatRecorded = true;
      } catch {
        // Heartbeats table optional
      }
    }

    logger.info('cron.reconcile.completed', {
      route: '/api/internal/reconcile',
      method: 'POST',
      statusCode: 200,
      durationMs: Date.now() - startTime,
      meta: { expiredSessionsCleaned, cachePurgesProcessed, heartbeatRecorded },
    });

    return new Response(JSON.stringify({
      status: 'success',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      results: {
        expiredSessionsCleaned,
        cachePurgesProcessed,
        heartbeatRecorded,
      },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    logger.error('cron.reconcile.error', {
      route: '/api/internal/reconcile',
      method: 'POST',
      statusCode: 500,
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return new Response(JSON.stringify({
      status: 'error',
      message: 'Internal Server Error',
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export default async function handler(req: any, res?: any) {
  if (res && typeof res.status === 'function') {
    const url = `${req.protocol || 'https'}://${req.headers?.host || 'localhost'}${req.url || '/api/internal/reconcile'}`;
    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers,
    });
    const webRes = await handleReconcileRequest(webReq);
    res.status(webRes.status);
    webRes.headers.forEach((val: string, key: string) => res.setHeader(key, val));
    return res.send(await webRes.text());
  }
  return handleReconcileRequest(req);
}

handler.fetch = handleReconcileRequest;
