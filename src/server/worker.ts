/**
 * Cloudflare Worker Entrypoint
 * Bridges Cloudflare Workers runtime (with Assets binding) to Azaroth APIs,
 * edge redirects, security headers, and cron reconciliations.
 */

import { REDIRECT_RULES } from '../config/redirects';
import { getSecurityHeadersMap } from '../config/securityHeaders';
import { handleHealthRequest } from '../../api/health';
import { handleContactRequest } from '../../api/contact';
import { handleRfqRequest } from '../../api/rfq';
import { handleAuthRequest } from '../../api/auth/[...path]';
import { handleCmsRequest } from '../../api/cms/[...path]';
import { handleUploadRequest } from '../../api/media/upload';
import { handleMediaFileRequest } from '../../api/media/file/[id]';
import { handleReconcileRequest } from '../../api/internal/reconcile';

export interface Env {
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
  R2_BUCKET?: any;
  DATABASE_URL?: string;
  BREVO_API_KEY?: string;
  CRON_SECRET?: string;
  SITE_URL?: string;
  [key: string]: any;
}

interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
  type: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

/**
 * Propagate environment bindings into process.env for Node.js compat layers
 */
function syncEnvironmentVariables(env: Env): void {
  if (env && typeof env === 'object') {
    for (const [key, val] of Object.entries(env)) {
      if (typeof val === 'string' && val !== '' && !process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

/**
 * Append canonical HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
 */
function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  const securityHeaders = getSecurityHeadersMap();

  for (const [key, value] of Object.entries(securityHeaders)) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Match incoming request path against canonical 301/302 redirects
 */
function matchRedirect(url: URL): Response | null {
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const matched = REDIRECT_RULES.find(
    (rule) => rule.source.toLowerCase() === pathname.toLowerCase()
  );

  if (!matched) return null;

  const destination = matched.destination.startsWith('http')
    ? matched.destination
    : `${url.origin}${matched.destination}`;

  return Response.redirect(destination, matched.statusCode || 301);
}

export async function handleCloudflareFetch(
  request: Request,
  env: Env = {},
  ctx?: ExecutionContext
): Promise<Response> {
  // 1. Sync Cloudflare worker bindings to process.env
  syncEnvironmentVariables(env);

  const url = new URL(request.url);
  const pathname = url.pathname;

  // 2. Check Edge redirects (e.g. /who-we-are -> /about, /rfq -> /connect-with-us)
  const redirectResponse = matchRedirect(url);
  if (redirectResponse) {
    return applySecurityHeaders(redirectResponse);
  }

  // 3. Dispatch API routes
  let response: Response;

  try {
    if (pathname === '/api/health' || pathname === '/api/health/ready' || pathname.startsWith('/api/health/')) {
      response = await handleHealthRequest(request);
    } else if (pathname === '/api/contact') {
      response = await handleContactRequest(request);
    } else if (pathname === '/api/rfq') {
      response = await handleRfqRequest(request);
    } else if (pathname.startsWith('/api/auth')) {
      response = await handleAuthRequest(request);
    } else if (pathname.startsWith('/api/cms')) {
      response = await handleCmsRequest(request);
    } else if (pathname === '/api/media/upload') {
      response = await handleUploadRequest(request);
    } else if (pathname.startsWith('/api/media/file/')) {
      response = await handleMediaFileRequest(request);
    } else if (pathname === '/api/internal/reconcile') {
      response = await handleReconcileRequest(request);
    } else {
      // 4. Static assets and Single Page Application fallback via Cloudflare Assets binding
      if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        response = await env.ASSETS.fetch(request);
      } else {
        response = new Response(
          JSON.stringify({
            error: 'Assets binding ASSETS is not configured on this Worker.',
          }),
          { status: 404, headers: { 'content-type': 'application/json' } }
        );
      }
    }
  } catch (error: any) {
    response = new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Internal Server Error',
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  // 5. Apply hardened security headers
  return applySecurityHeaders(response);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handleCloudflareFetch(request, env, ctx);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    syncEnvironmentVariables(env);

    const cronSecret = env.CRON_SECRET || process.env.CRON_SECRET;
    if (!cronSecret) {
      return;
    }

    const reconcileRequest = new Request('https://worker.local/api/internal/reconcile', {
      method: 'POST',
      headers: {
        'x-cron-secret': cronSecret,
        'content-type': 'application/json',
      },
    });

    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(handleReconcileRequest(reconcileRequest));
    } else {
      await handleReconcileRequest(reconcileRequest);
    }
  },
};

