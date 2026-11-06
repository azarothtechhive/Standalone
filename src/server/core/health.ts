/**
 * Class A Core Module — Liveness (`GET /api/health`) and Readiness (`GET /api/health/ready`)
 * Covers: OBS-2, RT-2 (Pure Web-standard Request/Response; zero Node built-ins or Class B imports)
 *
 * - `GET /api/health`: Cheap liveness check returning HTTP 200 and build version without waking
 *   Neon Postgres (protects Neon Free Tier 100 CU-hr/month budget per /docs/07-observability-backup-and-recovery.md §2).
 * - `GET /api/health/ready`: Deep readiness check protected by `x-health-secret` header,
 *   executing a 3,000 ms bounded check against Neon Postgres (`SELECT 1`) and R2 configuration.
 */

import { CACHE_CONTROL_POLICIES } from './cache';
import { logger } from './logger';
import { SYSTEM_STRINGS } from '../../config/strings';
import { neon } from '@neondatabase/serverless';

export interface ReadinessProbeDeps {
  expectedSecret?: string;
  checkNeon?: (signal: AbortSignal) => Promise<{ ok: boolean; latencyMs: number; detail?: string }>;
  checkR2?: (signal: AbortSignal) => Promise<{ ok: boolean; latencyMs: number; detail?: string }>;
  timeoutMs?: number;
}

export function handleLivenessHealth(request: Request): Response {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(JSON.stringify({ status: 'error', message: 'Method Not Allowed' }), {
      status: 405,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': CACHE_CONTROL_POLICIES.privateNoStore,
      },
    });
  }

  const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env || {};
  const payload = {
    status: 'ok',
    service: 'azaroth-cms',
    version: env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || env.APP_VERSION || '1.0.0-r1',
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': CACHE_CONTROL_POLICIES.privateNoStore,
    },
  });
}

export async function handleReadinessHealth(
  request: Request,
  deps: ReadinessProbeDeps = {}
): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ status: 'error', message: 'Method Not Allowed' }), {
      status: 405,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': CACHE_CONTROL_POLICIES.privateNoStore,
      },
    });
  }

  const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env || {};
  const expectedSecret = deps.expectedSecret ?? env.HEALTH_READY_SECRET;
  const providedSecret = request.headers.get('x-health-secret') || '';

  if (!expectedSecret) {
    logger.error('health.ready.secret_not_configured', {
      route: '/api/health/ready',
      method: request.method,
      statusCode: 503,
    });
    return new Response(
      JSON.stringify({
        status: 'unavailable',
        message: 'Readiness authentication is not configured.',
      }),
      {
        status: 503,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': CACHE_CONTROL_POLICIES.privateNoStore,
        },
      }
    );
  }

  if (!constantTimeEqual(providedSecret, expectedSecret)) {
    logger.warn('health.ready.unauthorized', {
      route: '/api/health/ready',
      method: request.method,
      statusCode: 401,
    });
    return new Response(
      JSON.stringify({
        status: 'unauthorized',
        message: SYSTEM_STRINGS.apiErrors.healthUnauthorized,
      }),
      {
        status: 401,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': CACHE_CONTROL_POLICIES.privateNoStore,
        },
      }
    );
  }

  const timeoutMs = deps.timeoutMs ?? 3000;
  const controller = new AbortController();
  const startedAt = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const checkNeon = deps.checkNeon || defaultNeonProbe;
    const checkR2 = deps.checkR2 || defaultR2Probe;

    const checksPromise = Promise.all([
      runTimedCheck(() => checkNeon(controller.signal)),
      runTimedCheck(() => checkR2(controller.signal)),
    ]);
    const timeoutPromise = new Promise<null>((resolve) => {
      timer = setTimeout(() => {
        controller.abort(new Error('Readiness probe timed out'));
        resolve(null);
      }, timeoutMs);
    });
    const results = await Promise.race([checksPromise, timeoutPromise]);
    const [neonResult, r2Result] = results || [
      { ok: false, latencyMs: timeoutMs, detail: 'Probe timed out' },
      { ok: false, latencyMs: timeoutMs, detail: 'Probe timed out' },
    ];

    const allReady = neonResult.ok && r2Result.ok;
    const statusCode = allReady ? 200 : 503;

    const body = {
      status: allReady ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      checks: {
        neonPostgres: neonResult,
        cloudflareR2: r2Result,
      },
    };

    logger.info('health.ready.completed', {
      route: '/api/health/ready',
      method: 'GET',
      statusCode,
      durationMs: body.durationMs,
      meta: { neonOk: neonResult.ok, r2Ok: r2Result.ok },
    });

    return new Response(JSON.stringify(body), {
      status: statusCode,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': CACHE_CONTROL_POLICIES.privateNoStore,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function runTimedCheck(
  fn: () => Promise<{ ok: boolean; latencyMs: number; detail?: string }>
): Promise<{ ok: boolean; latencyMs: number; detail?: string }> {
  const start = Date.now();
  try {
    return await fn();
  } catch {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      detail: 'Probe failed',
    };
  }
}

async function defaultNeonProbe(
  _signal: AbortSignal
): Promise<{ ok: boolean; latencyMs: number; detail?: string }> {
  const start = Date.now();
  const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env || {};
  const dbUrl = env.DATABASE_URL_PUBLIC_RO || env.DATABASE_URL_APP;
  if (!dbUrl) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      detail: 'Database connection is not configured',
    };
  }

  await neon(dbUrl).query('SELECT 1 AS ok', [], {
    fetchOptions: { signal: _signal },
  });
  return { ok: true, latencyMs: Date.now() - start };
}

async function defaultR2Probe(
  _signal: AbortSignal
): Promise<{ ok: boolean; latencyMs: number; detail?: string }> {
  const start = Date.now();
  const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env || {};
  if (!env.R2_S3_ENDPOINT || !env.R2_PRIVATE_BUCKET || !env.R2_PUBLIC_BUCKET) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      detail: 'R2_S3_ENDPOINT / bucket variables not configured',
    };
  }
  return {
    ok: true,
    latencyMs: Date.now() - start,
    detail: 'configured',
  };
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
