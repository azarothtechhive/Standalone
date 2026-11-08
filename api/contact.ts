import crypto from 'node:crypto';
import { executeQuery, checkDatabaseConnection, tbl } from '../src/server/core/database';
import { logger } from '../src/server/core/logger';
import { sendCompanyNotification, sendCustomerAcknowledgement, FormSubmissionRecord, verifyEmailProvider } from '../src/server/services/emailService';

// Cache the provider verification result so the (relatively expensive) Brevo
// sender-list request is not repeated on every submission.
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

export async function handleContactRequest(request: Request): Promise<Response> {
  const method = request.method;

  if (method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      message: 'Method Not Allowed'
    }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const {
      fullName,
      workEmail,
      phone,
      companyName,
      enquiryAbout,
      country,
      attachments,
      message,
      consent,
    } = body;

    // Validate required fields
    if (!fullName || !workEmail || !companyName || !message || !consent) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: fullName, workEmail, companyName, message, consent',
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(workEmail)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email address',
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Check if database is available
    const dbAvailable = await checkDatabaseConnection('app');

    if (dbAvailable) {
      const submissionId = crypto.randomUUID();
      const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
      const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex').slice(0, 32);
      const payloadDigest = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');

      const rfqDetails = {
        country: country || null,
        attachments: Array.isArray(attachments) ? attachments : [],
      };

      await executeQuery(
        `INSERT INTO ${tbl('form_submissions')} (
          id, inquiry_type, full_name, work_email, phone, company_name,
          subject_or_product, deployment_or_size, message, consent_accepted,
          ip_hash, payload_digest, rfq_details
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )`,
        [
          submissionId,
          'general',
          fullName,
          workEmail.trim().toLowerCase(),
          phone || null,
          companyName,
          enquiryAbout || null,
          country || null,
          message,
          Boolean(consent),
          ipHash,
          payloadDigest,
          JSON.stringify(rfqDetails),
        ]
      );

      logger.info('contact.submission.stored', {
        route: '/api/contact',
        method: 'POST',
        statusCode: 200,
        meta: { submissionId, email: workEmail, company: companyName },
      });

      // Create submission record for email notifications
      const submissionRecord: FormSubmissionRecord = {
        id: submissionId,
        reference_id: null,
        inquiry_type: 'general',
        full_name: fullName,
        work_email: workEmail.trim().toLowerCase(),
        phone: phone || null,
        company_name: companyName,
        subject_or_product: enquiryAbout || null,
        deployment_or_size: null,
        message,
        created_at: new Date().toISOString(),
      };

      // Verify the sending identity is authenticated before firing. A submission
      // whose provider is not ready should not be silently accepted as "success".
      const providerCheck = await ensureEmailProviderReady();
      logger.info('contact.provider.checked', {
        meta: { submissionId, ok: providerCheck.ok, provider: providerCheck.provider, error: providerCheck.error },
      });

      // Dispatch company notification and customer acknowledgement reliably
      await Promise.allSettled([
        sendCompanyNotification(submissionRecord)
          .then((result) => {
            if (result.success) {
              logger.info('contact.company_notification.sent', { meta: { submissionId, notificationId: result.notificationId } });
            } else {
              logger.warn('contact.company_notification.failed', { meta: { submissionId, error: result.error } });
            }
          })
          .catch((err) => {
            logger.error('contact.company_notification.error', { meta: { submissionId, error: err instanceof Error ? err.message : 'Unknown error' } });
          }),
        sendCustomerAcknowledgement(submissionRecord)
          .then((result) => {
            if (result.success) {
              logger.info('contact.customer_acknowledgement.sent', { meta: { submissionId, notificationId: result.notificationId } });
            } else {
              logger.warn('contact.customer_acknowledgement.failed', { meta: { submissionId, error: result.error } });
            }
          })
          .catch((err) => {
            logger.error('contact.customer_acknowledgement.error', { meta: { submissionId, error: err instanceof Error ? err.message : 'Unknown error' } });
          }),
      ]);

      return new Response(JSON.stringify({
        success: true,
        data: { submissionId },
        message: 'Contact submission received successfully',
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } else {
      // Database unavailable - return honest error
      logger.warn('contact.submission.database_unavailable', {
        route: '/api/contact',
        method: 'POST',
        meta: { email: workEmail, company: companyName },
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Database service is currently unreachable. Please try again later.',
      }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      });
    }
  } catch (error) {
    logger.error('contact.submission.error', {
      route: '/api/contact',
      method: 'POST',
      statusCode: 500,
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return new Response(JSON.stringify({
      success: false,
      message: 'Internal Server Error'
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export default async function handler(req: any, res?: any) {
  if (res && typeof res.status === 'function') {
    const url = `${req.protocol || 'https'}://${req.headers?.host || 'localhost'}${req.url || '/api/contact'}`;
    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });
    const webRes = await handleContactRequest(webReq);
    res.status(webRes.status);
    webRes.headers.forEach((val, key) => res.setHeader(key, val));
    return res.send(await webRes.text());
  }
  return handleContactRequest(req);
}

handler.fetch = handleContactRequest;