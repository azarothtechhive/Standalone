import crypto from 'node:crypto';
import { logger } from '../core/logger';
import { executeQuery, executeQueryOne, tbl } from '../core/database';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'BREVO').toUpperCase();
// Recipient for internal admin notifications. Falls back to ADMIN_EMAIL, then
// SUPPORT_EMAIL, then NOTIFY_EMAIL so a misconfigured NOTIFY_EMAIL never silently
// drops the notification to a non-existent mailbox.
const NOTIFY_EMAIL =
  process.env.NOTIFY_EMAIL ||
  process.env.ADMIN_EMAIL ||
  process.env.SUPPORT_EMAIL ||
  process.env.EMAIL_ADMIN ||
  '';
const SITE_URL = process.env.SITE_URL || 'https://www.azaroth-techhive.com/';
const EMAIL_FROM = process.env.EMAIL_FROM || 'hello@azaroth-techhive.com';
// Where customers should reply to. Defaults to the same address as EMAIL_FROM
// so replies do not bounce back to a generic no-reply mailbox.
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL || EMAIL_FROM;

// Lazy-loaded values
const getBREVO_API_KEY = () => process.env.BREVO_API_KEY;
const getEMAIL_PROVIDER = () => (process.env.EMAIL_PROVIDER || 'BREVO').toUpperCase();
const getNOTIFY_EMAIL = () => process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || process.env.EMAIL_ADMIN || '';
const getEMAIL_FROM = () => process.env.EMAIL_FROM || 'hello@azaroth-techhive.com';
const getEMAIL_REPLY_TO = () => process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL || EMAIL_FROM;

// Official Azaroth Tech-Hive Brand Palette: Plum + Cream + Antique Gold
export const BRAND = {
  plum: '#49243F',
  deepPlum: '#8A315D',
  rose: '#C04472',
  cream: '#FAF8F4',
  softCream: '#F1EBE3',
  antiqueGold: '#C99B52',
  white: '#FFFFFF',
  textPrimary: '#2B232D',
  textSecondary: '#5D545E',
  border: '#E3DACF',
};

/**
 * Email address for admin notifications. Used for internal alerts and monitoring.
 * This must match a verified sender in the email provider's sender list.
 */
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_EMAIL || process.env.NOTIFY_EMAIL || EMAIL_FROM;

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateEnv() {
  const missing: string[] = [];
  const resendKey = process.env.RESEND_API_KEY;
  const hasResend = resendKey && !resendKey.startsWith('re_xxxx');
  const hasBrevo = Boolean(getBREVO_API_KEY());

  if (!hasResend && !hasBrevo) {
    missing.push('RESEND_API_KEY or BREVO_API_KEY');
  }
  if (!getNOTIFY_EMAIL()) missing.push('NOTIFY_EMAIL');
  if (!SITE_URL) missing.push('SITE_URL');

  if (missing.length > 0) {
    logger.warn('email.service.env_missing', { meta: { missing } });
    return false;
  }
  return true;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Transactional email dispatcher supporting both Brevo API and Resend
 */
export async function sendTransactionalEmail(params: SendEmailParams): Promise<{ id: string; provider: string }> {
  if (!validateEmail(params.to)) {
    throw new Error(`Invalid recipient email: ${params.to}`);
  }

  const brevoKey = getBREVO_API_KEY();
  const hasResend = Boolean(brevoKey && !brevoKey.startsWith('re_xxxx'));
  const hasBrevo = getEMAIL_PROVIDER() === 'BREVO' && brevoKey !== undefined;

  // Preferred provider resolution
  if (getEMAIL_PROVIDER() === 'BREVO' && hasBrevo) {
    return await sendBrevoEmail(params);
  } else if (hasResend) {
    return await sendResendEmail(params);
  } else if (hasBrevo) {
    return await sendBrevoEmail(params);
  } else {
    throw new Error('No valid transactional email provider configured (checked Resend and Brevo).');
  }
}

/**
 * Retry a transactional email send with exponential backoff.
 *
 * Brevo occasionally throttles or transiently rejects during burst traffic.
 * Retrying is what turns a "Deliverable" status into an actually-delivered
 * email, because a single failed attempt is logged and then never retried.
 */
export async function sendTransactionalEmailWithRetry(
  params: SendEmailParams,
  options: { maxAttempts?: number; baseDelayMs?: number } = {}
): Promise<{ id: string; provider: string }> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1500;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await sendTransactionalEmail(params);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      logger.warn('email.service.retry_attempt', {
        meta: { to: params.to, attempt, maxAttempts, error: lastError.message },
      });
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt));
      }
    }
  }

  throw lastError || new Error('Email send failed after retries');
}

/**
 * Verify that the configured sending identity is actually authenticated with
 * the provider. This is the check that catches "Brevo says Deliverable but
 * the email never leaves" - an unauthenticated sender is accepted by the API
 * and silently dropped by receiving mail servers.
 */
export async function verifyEmailProvider(): Promise<{
  ok: boolean;
  provider: string;
  from: string;
  replyTo: string;
  error?: string;
  detail?: string;
}> {
  const resendKey = process.env.RESEND_API_KEY;
  const brevoKey = getBREVO_API_KEY();
  const hasResend = resendKey && !resendKey.startsWith('re_xxxx');
  const hasBrevo = Boolean(brevoKey);

  if (hasBrevo) {
    try {
      const response = await fetch('https://api.brevo.com/v3/senders', {
        headers: { 'api-key': brevoKey!, 'Accept': 'application/json' },
      });
      if (!response.ok) {
        return {
          ok: false, provider: 'brevo', from: getEMAIL_FROM(), replyTo: getEMAIL_REPLY_TO(),
          error: `Brevo sender list request failed (${response.status})`
        };
      }
      const data = await response.json().catch(() => ({}));
      const senders: Array<{ email?: string; active?: boolean }> = data.senders || [];
      const fromEmail = getEMAIL_FROM().toLowerCase();
      const match = senders.find((s) => s.email?.toLowerCase() === fromEmail);
      if (!match) {
        return {
          ok: false, provider: 'brevo', from: getEMAIL_FROM(), replyTo: getEMAIL_REPLY_TO(),
          error: `Sending email ${getEMAIL_FROM()} is NOT registered/active in Brevo`,
          detail: `Registered senders: ${senders.map((s) => s.email).join(', ') || 'none'}`
        };
      }
      if (match.active === false) {
        return {
          ok: false, provider: 'brevo', from: getEMAIL_FROM(), replyTo: getEMAIL_REPLY_TO(),
          error: `Sending email ${getEMAIL_FROM()} is registered but INACTIVE in Brevo`
        };
      }
      return { ok: true, provider: 'brevo', from: getEMAIL_FROM(), replyTo: getEMAIL_REPLY_TO() };
    } catch (err) {
      return {
        ok: false, provider: 'brevo', from: EMAIL_FROM, replyTo: EMAIL_REPLY_TO,
        error: err instanceof Error ? err.message : 'Brevo verification request failed'
      };
    }
  }

  if (hasResend) {
    try {
      const response = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
      });
      if (!response.ok) {
        return {
          ok: false, provider: 'resend', from: EMAIL_FROM, replyTo: EMAIL_REPLY_TO,
          error: `Resend domain list request failed (${response.status})`
        };
      }
      const data = await response.json().catch(() => ({}));
      const domain = new URL(EMAIL_FROM).hostname;
      const match = (data.data || []).find((d: { domain?: string }) => d.domain === domain);
      if (!match) {
        return {
          ok: false, provider: 'resend', from: EMAIL_FROM, replyTo: EMAIL_REPLY_TO,
          error: `Domain ${domain} is NOT verified in Resend`
        };
      }
      if (match.status !== 'verified') {
        return {
          ok: false, provider: 'resend', from: EMAIL_FROM, replyTo: EMAIL_REPLY_TO,
          error: `Domain ${domain} is registered but status is ${match.status}, not verified`
        };
      }
      return { ok: true, provider: 'resend', from: EMAIL_FROM, replyTo: EMAIL_REPLY_TO };
    } catch (err) {
      return {
        ok: false, provider: 'resend', from: EMAIL_FROM, replyTo: EMAIL_REPLY_TO,
        error: err instanceof Error ? err.message : 'Resend verification request failed'
      };
    }
  }

  return {
    ok: false, provider: 'none', from: EMAIL_FROM, replyTo: EMAIL_REPLY_TO,
    error: 'No transactional email provider configured'
  };
}

async function sendBrevoEmail(params: SendEmailParams): Promise<{ id: string; provider: string }> {
  const url = 'https://api.brevo.com/v3/smtp/email';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const brevoKey = getBREVO_API_KEY();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': brevoKey!,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Azaroth Tech-Hive',
          email: getEMAIL_FROM(),
        },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.html,
        textContent: params.text,
        // Without replyTo, customer "reply" buttons bounce to the no-reply
        // sending mailbox. Always route replies to the support inbox.
        replyTo: { email: getEMAIL_REPLY_TO(), name: 'Azaroth Tech-Hive Support' },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      logger.error('email.service.brevo_error', { meta: { status: response.status, error: errText, to: params.to } });
      throw new Error(`Brevo API error ${response.status}: ${errText}`);
    }

    const data = await response.json().catch(() => ({}));
    logger.info('email.service.brevo_sent', { meta: { to: params.to, subject: params.subject, messageId: data?.messageId } });
    return { id: data?.messageId || `brevo-${Date.now()}`, provider: 'brevo' };
  } catch (err) {
    clearTimeout(timeout);
    logger.error('email.service.brevo_failed', { meta: { to: params.to, subject: params.subject, error: err instanceof Error ? err.message : String(err) } });
    throw err;
  }
}

async function sendResendEmail(params: SendEmailParams): Promise<{ id: string; provider: string }> {
  const url = 'https://api.resend.com/emails';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Azaroth Tech-Hive <${EMAIL_FROM}>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: EMAIL_REPLY_TO,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      logger.error('email.service.resend_error', { meta: { status: response.status, error: errText, to: params.to } });
      throw new Error(`Resend API error ${response.status}: ${errText}`);
    }

    const data = await response.json().catch(() => ({}));
    logger.info('email.service.resend_sent', { meta: { to: params.to, subject: params.subject, id: data?.id } });
    return { id: data?.id || `resend-${Date.now()}`, provider: 'resend' };
  } catch (err) {
    clearTimeout(timeout);
    logger.error('email.service.resend_failed', { meta: { to: params.to, subject: params.subject, error: err instanceof Error ? err.message : String(err) } });
    throw err;
  }
}

/**
 * Renders professional responsive email with official Plum + Cream + Antique Gold palette
 *
 * `logoUrl` lets callers (e.g. the staging environment) override the branding image
 * instead of always resolving it from SITE_URL. `ctaUrl` is the destination used by
 * the "Next Steps" call-to-action button in the customer acknowledgement.
 */
export function renderEmailTemplate({
  title,
  preheader,
  headerText,
  bodyHtml,
  footerNote,
  logoUrl,
  ctaUrl,
  ctaLabel,
}: {
  title: string;
  preheader: string;
  headerText: string;
  bodyHtml: string;
  footerNote: string;
  logoUrl?: string;
  ctaUrl?: string;
  ctaLabel?: string;
}): string {
  const resolvedLogoUrl = logoUrl || `${SITE_URL.replace(/\/$/, '')}/Logo.png`;
  const resolvedCtaUrl = ctaUrl || `${SITE_URL.replace(/\/$/, '')}/connect-with-us`;
  const resolvedCtaLabel = ctaLabel || 'Reply with your Reference ID';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.textPrimary};">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.cream};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.white};border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(73,36,63,0.08);border:1px solid ${BRAND.border};">
          <!-- Header with Plum gradient and Antique Gold border -->
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.plum} 0%, ${BRAND.deepPlum} 100%);padding:36px 32px 28px;text-align:center;border-bottom:3px solid ${BRAND.antiqueGold};">
              <img src="${resolvedLogoUrl}" alt="Azaroth Tech-Hive" style="height:44px;width:auto;display:block;margin:0 auto 12px;"/>
              <h1 style="margin:0;color:${BRAND.cream};font-size:22px;font-weight:600;letter-spacing:-0.2px;">${headerText}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;background-color:${BRAND.white};">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer with Soft Cream surface -->
          <tr>
            <td style="background-color:${BRAND.softCream};padding:24px 32px;border-top:1px solid ${BRAND.border};">
              <p style="margin:0 0 8px;font-size:13px;color:${BRAND.textSecondary};line-height:1.5;">${footerNote}</p>
              <p style="margin:0;font-size:12px;color:${BRAND.antiqueGold};font-weight:600;">Azaroth Tech-Hive &bull; ${SITE_URL}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface FormSubmissionRecord {
  id: string;
  reference_id?: string | null;
  inquiry_type: string;
  full_name: string;
  work_email: string;
  phone?: string | null;
  company_name?: string | null;
  subject_or_product?: string | null;
  deployment_or_size?: string | null;
  message: string;
  created_at?: string;
}

export interface EmailNotificationRecord {
  id: string;
  submission_id: string;
  notification_type: 'COMPANY_NOTIFICATION' | 'CUSTOMER_ACKNOWLEDGEMENT';
  recipient_email: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'RETRY';
  provider_message_id?: string | null;
  error_message?: string | null;
  attempts: number;
  last_attempt_at?: string | null;
  sent_at?: string | null;
  created_at: string;
}

export function generateReferenceId(type: 'INQ' | 'RFQ', submissionId: string): string {
  const shortId = submissionId.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `AZR-${type}-${shortId}`;
}

function buildCompanyNotificationHtml(record: FormSubmissionRecord, referenceId: string): string {
  const inquiryTypeLabel = record.inquiry_type === 'product' ? 'Quote Request (RFQ)' : 'General Enquiry';
  const createdAt = record.created_at
    ? new Date(record.created_at).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
    : 'N/A';

  const detailsHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Reference ID</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:${BRAND.plum};">${referenceId}</td></tr>
      <tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Source Form</td><td style="padding:8px 0;font-size:14px;font-weight:500;color:${BRAND.textPrimary};">${inquiryTypeLabel}</td></tr>
      <tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Submitted</td><td style="padding:8px 0;font-size:14px;color:${BRAND.textPrimary};">${createdAt}</td></tr>
      <tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Full Name</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:${BRAND.textPrimary};">${record.full_name}</td></tr>
      <tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Email</td><td style="padding:8px 0;font-size:14px;color:${BRAND.plum};"><a href="mailto:${record.work_email}" style="color:${BRAND.plum};font-weight:600;text-decoration:none;">${record.work_email}</a></td></tr>
      ${record.phone ? `<tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Phone</td><td style="padding:8px 0;font-size:14px;color:${BRAND.textPrimary};">${record.phone}</td></tr>` : ''}
      ${record.company_name ? `<tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Company</td><td style="padding:8px 0;font-size:14px;color:${BRAND.textPrimary};">${record.company_name}</td></tr>` : ''}
      ${record.subject_or_product ? `<tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Subject / Product</td><td style="padding:8px 0;font-size:14px;color:${BRAND.textPrimary};">${record.subject_or_product}</td></tr>` : ''}
      ${record.deployment_or_size ? `<tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Timeline / Scope</td><td style="padding:8px 0;font-size:14px;color:${BRAND.textPrimary};">${record.deployment_or_size}</td></tr>` : ''}
    </table>
  `;

  const messageHtml = `
    <div style="margin-top:16px;padding:16px;background:${BRAND.softCream};border-radius:8px;border-left:4px solid ${BRAND.antiqueGold};">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:${BRAND.deepPlum};text-transform:uppercase;letter-spacing:0.5px;">Message Details</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.textPrimary};white-space:pre-wrap;">${record.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>
  `;

  return `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.textPrimary};">A new <strong>${inquiryTypeLabel.toLowerCase()}</strong> has been submitted on Azaroth Tech-Hive.</p>
    ${detailsHtml}
    ${messageHtml}
    <p style="margin:24px 0 0;font-size:13px;color:${BRAND.textSecondary};">View and manage this enquiry in the <a href="${SITE_URL}/admin/crm" style="color:${BRAND.plum};font-weight:600;text-decoration:underline;">Admin CRM</a>.</p>
  `;
}

function buildCompanyNotificationText(record: FormSubmissionRecord, referenceId: string): string {
  const inquiryTypeLabel = record.inquiry_type === 'product' ? 'Quote Request (RFQ)' : 'General Enquiry';
  const createdAt = record.created_at ? new Date(record.created_at).toLocaleString('en-GB') : 'N/A';

  return `
New ${inquiryTypeLabel} Received
==============================

Reference ID: ${referenceId}
Source: ${inquiryTypeLabel}
Submitted: ${createdAt}

Customer Details:
- Name: ${record.full_name}
- Email: ${record.work_email}
${record.phone ? `- Phone: ${record.phone}` : ''}
${record.company_name ? `- Company: ${record.company_name}` : ''}
${record.subject_or_product ? `- Subject/Product: ${record.subject_or_product}` : ''}
${record.deployment_or_size ? `- Timeline/Scope: ${record.deployment_or_size}` : ''}

Message:
${record.message}

---
View in Admin CRM: ${SITE_URL}/admin/crm
Azaroth Tech-Hive
  `.trim();
}

function buildCustomerAcknowledgementHtml(record: FormSubmissionRecord, referenceId: string): string {
  const inquiryTypeLabel = record.inquiry_type === 'product' ? 'quote request' : 'enquiry';
  const createdAt = record.created_at
    ? new Date(record.created_at).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    : 'N/A';

  return `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.textPrimary};">Dear <strong>${record.full_name}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.textPrimary};">Thank you for reaching out to Azaroth Tech-Hive. We have received your ${inquiryTypeLabel} and our solution engineering team is reviewing your requirements.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">
      <tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Reference ID</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:${BRAND.plum};">${referenceId}</td></tr>
      <tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Inquiry Type</td><td style="padding:8px 0;font-size:14px;color:${BRAND.textPrimary};">${inquiryTypeLabel.charAt(0).toUpperCase() + inquiryTypeLabel.slice(1)}</td></tr>
      <tr><td style="padding:8px 0;font-size:13px;color:${BRAND.textSecondary};">Date Logged</td><td style="padding:8px 0;font-size:14px;color:${BRAND.textPrimary};">${createdAt}</td></tr>
    </table>

    <div style="padding:18px;background:${BRAND.softCream};border-radius:8px;border:1px solid ${BRAND.border};">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:${BRAND.deepPlum};text-transform:uppercase;letter-spacing:0.5px;">Next Steps</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:${BRAND.textPrimary};">
        <li>Our enterprise software architects will evaluate your technical requirements within 1 business day.</li>
        <li>You will receive a tailored response directly at this email address.</li>
        <li>If your request involves sensitive system integration, an NDA can be executed prior to technical discovery.</li>
      </ul>
    </div>

    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${BRAND.textPrimary};">If you need to provide additional architecture specifications, simply reply directly to this email referencing <strong>${referenceId}</strong>.</p>

    <p style="margin:24px 0 0;">
      <a href="${SITE_URL.replace(/\/$/, '')}/connect-with-us" style="display:inline-block;background:linear-gradient(135deg, ${BRAND.plum} 0%, ${BRAND.deepPlum} 100%);color:${BRAND.cream};text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.2px;">Reply with your Reference ID</a>
    </p>

    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${BRAND.textPrimary};">Best regards,<br/><strong>The Azaroth Tech-Hive Team</strong></p>
  `;
}

function buildCustomerAcknowledgementText(record: FormSubmissionRecord, referenceId: string): string {
  const inquiryTypeLabel = record.inquiry_type === 'product' ? 'quote request' : 'enquiry';
  const createdAt = record.created_at ? new Date(record.created_at).toLocaleString('en-GB') : 'N/A';

  return `
Dear ${record.full_name},

Thank you for reaching out to Azaroth Tech-Hive. We have received your ${inquiryTypeLabel} and our team will review it shortly.

Reference ID: ${referenceId}
Type: ${inquiryTypeLabel.charAt(0).toUpperCase() + inquiryTypeLabel.slice(1)}
Submitted: ${createdAt}

What happens next?
- Our enterprise software architects will evaluate your requirements within 1 business day.
- You will receive a tailored response directly at this email address.
- For urgent matters, you can reply directly to this email referencing ${referenceId}.

Best regards,
The Azaroth Tech-Hive Team
${SITE_URL}
  `.trim();
}

/**
 * Send internal notification email to NOTIFY_EMAIL with duplicate protection
 */
export async function sendCompanyNotification(
  record: FormSubmissionRecord
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    const notifyEmail = getNOTIFY_EMAIL();
    if (!notifyEmail) {
      logger.warn('email.service.notify_email_missing', { meta: { submissionId: record.id } });
      return { success: false, error: 'NOTIFY_EMAIL not configured' };
    }

    const referenceId = generateReferenceId(
      record.inquiry_type === 'product' ? 'RFQ' : 'INQ',
      record.id
    );

    // Duplicate check: check if already successfully sent
    try {
      const existing = await executeQueryOne<EmailNotificationRecord>(
        `SELECT id, status FROM ${tbl('email_notifications')}
         WHERE submission_id = $1 AND notification_type = 'COMPANY_NOTIFICATION' AND status = 'SENT'`,
        [record.id]
      );
      if (existing) {
        logger.info('email.company_notification.already_sent', { meta: { submissionId: record.id, notificationId: existing.id } });
        return { success: true, notificationId: existing.id };
      }
    } catch {
      // Table may not exist yet if DB is connecting
    }

    const notificationId = crypto.randomUUID();

    // Use the lazy-loaded notify email value
    const adminNotifyEmail = notifyEmail;

    // Create record in database
    await executeQuery(
      `INSERT INTO ${tbl('email_notifications')} (
        id, submission_id, notification_type, recipient_email, subject, status, attempts
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        notificationId,
        record.id,
        'COMPANY_NOTIFICATION',
        adminNotifyEmail,
        `New ${record.inquiry_type === 'product' ? 'RFQ' : 'Enquiry'}: ${referenceId} - ${record.full_name}`,
        'PENDING',
        0,
      ]
    ).catch(() => { });

    const html = renderEmailTemplate({
      title: `New ${record.inquiry_type === 'product' ? 'RFQ' : 'Enquiry'} - ${referenceId}`,
      preheader: `New ${record.inquiry_type === 'product' ? 'quote request' : 'enquiry'} from ${record.full_name} (${record.company_name || 'No company'})`,
      headerText: `📥 New ${record.inquiry_type === 'product' ? 'Quote Request' : 'Enquiry'} Received`,
      bodyHtml: buildCompanyNotificationHtml(record, referenceId),
      footerNote: 'This is an automated notification from the Azaroth Tech-Hive platform.',
    });

    const text = buildCompanyNotificationText(record, referenceId);

    const result = await sendTransactionalEmailWithRetry({
      to: adminNotifyEmail,
      subject: `New ${record.inquiry_type === 'product' ? 'RFQ' : 'Enquiry'}: ${referenceId} - ${record.full_name}`,
      html,
      text,
    });

    await executeQuery(
      `UPDATE ${tbl('email_notifications')}
       SET status = 'SENT', provider_message_id = $1, sent_at = NOW(), attempts = attempts + 1, last_attempt_at = NOW()
       WHERE id = $2`,
      [result.id, notificationId]
    ).catch(() => { });

    logger.info('email.company_notification.sent', {
      meta: { submissionId: record.id, notificationId, referenceId, to: adminNotifyEmail, provider: result.provider },
    });

    return { success: true, notificationId };
  } catch (error) {
    logger.error('email.company_notification.failed', {
      meta: { submissionId: record.id, error: error instanceof Error ? error.message : 'Unknown error' },
    });

    await executeQuery(
      `UPDATE ${tbl('email_notifications')}
       SET status = 'FAILED', error_message = $1, attempts = attempts + 1, last_attempt_at = NOW()
       WHERE submission_id = $2 AND notification_type = 'COMPANY_NOTIFICATION'`,
      [error instanceof Error ? error.message : 'Unknown error', record.id]
    ).catch(() => { });

    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send customer acknowledgement email with duplicate protection
 */
export async function sendCustomerAcknowledgement(
  record: FormSubmissionRecord
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    if (!validateEmail(record.work_email)) {
      logger.warn('email.service.invalid_customer_email', { meta: { submissionId: record.id, email: record.work_email } });
      return { success: false, error: 'Invalid customer email' };
    }

    const referenceId = generateReferenceId(
      record.inquiry_type === 'product' ? 'RFQ' : 'INQ',
      record.id
    );

    // Duplicate check
    try {
      const existing = await executeQueryOne<EmailNotificationRecord>(
        `SELECT id, status FROM ${tbl('email_notifications')}
         WHERE submission_id = $1 AND notification_type = 'CUSTOMER_ACKNOWLEDGEMENT' AND status = 'SENT'`,
        [record.id]
      );
      if (existing) {
        logger.info('email.customer_acknowledgement.already_sent', { meta: { submissionId: record.id, notificationId: existing.id } });
        return { success: true, notificationId: existing.id };
      }
    } catch {
      // Table may not exist yet if DB is connecting
    }

    const notificationId = crypto.randomUUID();

    await executeQuery(
      `INSERT INTO ${tbl('email_notifications')} (
        id, submission_id, notification_type, recipient_email, subject, status, attempts
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        notificationId,
        record.id,
        'CUSTOMER_ACKNOWLEDGEMENT',
        record.work_email,
        `Thank you for contacting Azaroth Tech-Hive - ${referenceId}`,
        'PENDING',
        0,
      ]
    ).catch(() => { });

    const html = renderEmailTemplate({
      title: `Thank you for contacting Azaroth Tech-Hive - ${referenceId}`,
      preheader: `We have received your ${record.inquiry_type === 'product' ? 'quote request' : 'enquiry'} and our architecture team will review it within one business day.`,
      headerText: '✅ Thank You for Contacting Us',
      bodyHtml: buildCustomerAcknowledgementHtml(record, referenceId),
      footerNote: 'This is an automated confirmation of your request.',
      ctaUrl: `${SITE_URL.replace(/\/$/, '')}/connect-with-us`,
      ctaLabel: 'Reply with your Reference ID',
    });

    const text = buildCustomerAcknowledgementText(record, referenceId);

    const result = await sendTransactionalEmailWithRetry({
      to: record.work_email,
      subject: `Thank you for contacting Azaroth Tech-Hive - ${referenceId}`,
      html,
      text,
    });

    await executeQuery(
      `UPDATE ${tbl('email_notifications')}
       SET status = 'SENT', provider_message_id = $1, sent_at = NOW(), attempts = attempts + 1, last_attempt_at = NOW()
       WHERE id = $2`,
      [result.id, notificationId]
    ).catch(() => { });

    logger.info('email.customer_acknowledgement.sent', {
      meta: { submissionId: record.id, notificationId, referenceId, to: record.work_email, provider: result.provider },
    });

    return { success: true, notificationId };
  } catch (error) {
    logger.error('email.customer_acknowledgement.failed', {
      meta: { submissionId: record.id, error: error instanceof Error ? error.message : 'Unknown error' },
    });

    await executeQuery(
      `UPDATE ${tbl('email_notifications')}
       SET status = 'FAILED', error_message = $1, attempts = attempts + 1, last_attempt_at = NOW()
       WHERE submission_id = $2 AND notification_type = 'CUSTOMER_ACKNOWLEDGEMENT'`,
      [error instanceof Error ? error.message : 'Unknown error', record.id]
    ).catch(() => { });

    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getEmailNotifications(submissionId: string): Promise<EmailNotificationRecord[]> {
  try {
    const results = await executeQuery<EmailNotificationRecord>(
      `SELECT
        id,
        submission_id as "submissionId",
        notification_type as "notificationType",
        recipient_email as "recipientEmail",
        subject,
        status,
        provider_message_id as "providerMessageId",
        error_message as "errorMessage",
        attempts,
        last_attempt_at as "lastAttemptAt",
        sent_at as "sentAt",
        created_at as "createdAt"
      FROM ${tbl('email_notifications')}
      WHERE submission_id = $1
      ORDER BY created_at DESC`,
      [submissionId]
    );
    return results;
  } catch (error) {
    logger.error('email.get_notifications.error', {
      meta: { submissionId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return [];
  }
}
