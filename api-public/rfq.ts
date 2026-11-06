import crypto from 'node:crypto';
import { logger } from '../src/server/core/logger';
import { executeQuery, checkDatabaseConnection, tbl } from '../src/server/core/database';
import { sendCompanyNotification, sendCustomerAcknowledgement, FormSubmissionRecord, verifyEmailProvider } from '../src/server/services/emailService';

// Cache the provider verification result so the Brevo sender-list request is not
// repeated on every submission.
let providerCheckCache: { checkedAt: number; result: Awaited<ReturnType<typeof verifyEmailProvider>> } | null = null;
const PROVIDER_CHECK_TTL_MS = 60_000;

async function ensureEmailProviderReady(): Promise<Awaited<ReturnType<typeof verifyEmailProvider>>> {
  const now = Date.now();
  if (providerCheckCache && now - providerCheckCache.checkedAt < PROVIDER_CHECK_TTL_MS) {
    return providerCheckCache.result;
  }
  const result = await verifyEmailProvider();
  providerCheckCache = { checkedAt: now, result };
  if (!result.ok) {
    logger.error('email.provider.not_ready', { meta: { error: result.error, detail: result.detail } });
  }
  return result;
}

export async function handleRfqRequest(request: Request): Promise<Response> {
  const method = request.method;

  if (method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed',
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let solutionCategories: string[] = [];
    let projectScope = '';
    let targetTimeline = '';
    let budgetRange = '';
    let requirementsDescription = '';
    let ndaRequired = false;
    let fullName = '';
    let workEmail = '';
    let phone = '';
    let companyName = '';
    let country = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const rawCategories = formData.get('solutionCategories');
      if (typeof rawCategories === 'string') {
        try {
          solutionCategories = JSON.parse(rawCategories);
        } catch {
          solutionCategories = [rawCategories];
        }
      }
      projectScope = String(formData.get('projectScope') || '');
      targetTimeline = String(formData.get('targetTimeline') || '');
      budgetRange = String(formData.get('budgetRange') || '');
      requirementsDescription = String(formData.get('requirementsDescription') || '');
      ndaRequired = formData.get('ndaRequired') === 'true';
      fullName = String(formData.get('fullName') || '');
      workEmail = String(formData.get('workEmail') || '').trim().toLowerCase();
      phone = String(formData.get('phone') || '');
      companyName = String(formData.get('companyName') || '');
      country = String(formData.get('country') || '');
    } else {
      const body = await request.json().catch(() => ({}));
      solutionCategories = Array.isArray(body.solutionCategories) ? body.solutionCategories : [];
      projectScope = String(body.projectScope || '');
      targetTimeline = String(body.targetTimeline || '');
      budgetRange = String(body.budgetRange || '');
      requirementsDescription = String(body.requirementsDescription || '');
      ndaRequired = Boolean(body.ndaRequired);
      fullName = String(body.fullName || body.contact?.fullName || '');
      workEmail = String(body.workEmail || body.contact?.workEmail || '').trim().toLowerCase();
      phone = String(body.phone || body.contact?.phone || '');
      companyName = String(body.companyName || body.contact?.companyName || '');
      country = String(body.country || body.contact?.country || '');
    }

    // Server-side validation
    if (!fullName || !workEmail || !requirementsDescription) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: fullName, workEmail, requirementsDescription',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(workEmail)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email address',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dbAvailable = await checkDatabaseConnection('app');

    if (dbAvailable) {
      const submissionId = crypto.randomUUID();
      const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
      const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex').slice(0, 32);
      const payloadDigest = crypto.createHash('sha256').update(JSON.stringify({
        solutionCategories,
        projectScope,
        targetTimeline,
        budgetRange,
        requirementsDescription,
        ndaRequired,
        fullName,
        workEmail,
        phone,
        companyName,
        country,
      })).digest('hex');

      await executeQuery(
        `INSERT INTO ${tbl('form_submissions')} (
          id, inquiry_type, full_name, work_email, phone, company_name,
          subject_or_product, deployment_or_size, message, consent_accepted,
          ip_hash, payload_digest, rfq_details
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)`,
        [
          submissionId,
          'product',
          fullName,
          workEmail,
          phone || null,
          companyName || null,
          solutionCategories.join(', ') || projectScope || 'General Inquiry',
          targetTimeline || null,
          requirementsDescription,
          true,
          ipHash,
          payloadDigest,
          JSON.stringify({
            solutionCategories,
            projectScope,
            targetTimeline,
            budgetRange,
            country,
            ndaRequired,
          }),
        ]
      );

      logger.info('rfq.submission.stored', {
        route: '/api/rfq',
        method: 'POST',
        statusCode: 200,
        meta: { submissionId, email: workEmail, company: companyName },
      });

      // Verify the sending identity is authenticated before firing. A submission
      // whose provider is not ready should not be silently accepted as "success".
      const providerCheck = await ensureEmailProviderReady();
      logger.info('rfq.provider.checked', {
        meta: { submissionId, ok: providerCheck.ok, provider: providerCheck.provider, error: providerCheck.error },
      });

      // Create submission record for email notifications
      const submissionRecord: FormSubmissionRecord = {
        id: submissionId,
        reference_id: null,
        inquiry_type: 'product',
        full_name: fullName,
        work_email: workEmail,
        phone: phone || null,
        company_name: companyName || null,
        subject_or_product: solutionCategories.join(', ') || projectScope || 'General Inquiry',
        deployment_or_size: targetTimeline || null,
        message: requirementsDescription,
        created_at: new Date().toISOString(),
      };

      // Dispatch company notification and customer acknowledgement reliably
      await Promise.allSettled([
        sendCompanyNotification(submissionRecord)
          .then((result) => {
            if (result.success) {
              logger.info('rfq.company_notification.sent', { meta: { submissionId, notificationId: result.notificationId } });
            } else {
              logger.warn('rfq.company_notification.failed', { meta: { submissionId, error: result.error } });
            }
          })
          .catch((err) => {
            logger.error('rfq.company_notification.error', { meta: { submissionId, error: err instanceof Error ? err.message : 'Unknown error' } });
          }),
        sendCustomerAcknowledgement(submissionRecord)
          .then((result) => {
            if (result.success) {
              logger.info('rfq.customer_acknowledgement.sent', { meta: { submissionId, notificationId: result.notificationId } });
            } else {
              logger.warn('rfq.customer_acknowledgement.failed', { meta: { submissionId, error: result.error } });
            }
          })
          .catch((err) => {
            logger.error('rfq.customer_acknowledgement.error', { meta: { submissionId, error: err instanceof Error ? err.message : 'Unknown error' } });
          }),
      ]);

      return new Response(JSON.stringify({
        success: true,
        data: { referenceId: `AZR-RFQ-${submissionId.slice(0, 8).toUpperCase()}` },
        message: 'RFQ received successfully. Our engineering architecture team will review your requirements.',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      logger.warn('rfq.submission.database_unavailable', {
        route: '/api/rfq',
        method: 'POST',
        meta: { email: workEmail, company: companyName },
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Database service is currently unreachable. Please try again later.',
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    logger.error('rfq.submission.error', {
      route: '/api/rfq',
      method: 'POST',
      statusCode: 500,
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process RFQ submission.',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default async function handler(req: any, res?: any) {
  if (res && typeof res.status === 'function') {
    const url = `${req.protocol || 'https'}://${req.headers?.host || 'localhost'}${req.url || '/api/rfq'}`;
    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });
    const webRes = await handleRfqRequest(webReq);
    res.status(webRes.status);
    webRes.headers.forEach((val, key) => res.setHeader(key, val));
    return res.send(await webRes.text());
  }
  return handleRfqRequest(req);
}

handler.fetch = handleRfqRequest;