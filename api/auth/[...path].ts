import * as authService from '../../src/server/services/authService';
import { logger } from '../../src/server/core/logger';

function getCorsHeaders(request: Request): Headers {
  const origin = request.headers.get('origin') || '*';
  const headers = new Headers();

  const isAllowedOrigin =
    origin === '*' ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.includes('azaroth-techhive.com') ||
    origin.includes('vercel.app');

  if (isAllowedOrigin && origin !== '*') {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
  } else {
    headers.set('Access-Control-Allow-Origin', '*');
  }

  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie');
  headers.set('Access-Control-Max-Age', '86400');
  return headers;
}

export function resolveAuthPath(request: Request): string {
  const url = new URL(request.url);

  // 1. Check query parameter overrides (subpath or path) e.g. from Vercel rewrites
  const subpath = url.searchParams.get('subpath') || url.searchParams.get('path');
  if (subpath) {
    const clean = subpath.startsWith('/') ? subpath : `/${subpath}`;
    if (!clean.includes('[...')) {
      return clean.replace(/\.(ts|js)$/, '').replace(/\/+$/, '') || '/';
    }
  }

  // 2. Check matched path headers from Vercel / Cloudflare / reverse proxies
  const matched =
    request.headers.get('x-matched-path') ||
    request.headers.get('x-invoke-path') ||
    request.headers.get('x-forwarded-uri');
  if (matched && matched.includes('/api/auth')) {
    const fromHeader = matched.replace(/^.*?\/api\/auth/, '');
    if (fromHeader && !fromHeader.includes('[...')) {
      return fromHeader.replace(/\.(ts|js)$/, '').replace(/\/+$/, '') || '/';
    }
  }

  // 3. Fallback to standard url.pathname
  const fromPathname = url.pathname.replace(/^.*?\/api\/auth/, '');
  if (fromPathname && !fromPathname.includes('[...')) {
    return fromPathname.replace(/\.(ts|js)$/, '').replace(/\/+$/, '') || '/';
  }

  return '/';
}

export async function handleAuthRequest(request: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }

  const path = resolveAuthPath(request);
  const method = request.method;

  try {
    let body: any = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      body = await request.json().catch(() => null);
    }

    // Extract session token from cookie or authorization header
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization') || '';
    let bearerToken: string | null = null;
    let cookieToken: string | null = null;

    if (authHeader.startsWith('Bearer ')) {
      bearerToken = authHeader.slice('Bearer '.length).trim().replace(/^"(.*)"$/, '$1');
    }

    if (cookieHeader) {
      const parts = cookieHeader.split(';');
      for (const part of parts) {
        const [rawName, ...rest] = part.trim().split('=');
        if (rawName === 'azaroth_session' || rawName === 'session_token') {
          cookieToken = decodeURIComponent(rest.join('=')).trim().replace(/^"(.*)"$/, '$1');
          break;
        }
      }
    }

    // Check bearer token first, fallback to cookie token
    const token = bearerToken || cookieToken || null;

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('cf-connecting-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    let result: any;

    if (path === '/login' && method === 'POST') {
      result = await authService.handleLogin({
        email: body?.email,
        password: body?.password,
        ipAddress,
        userAgent,
      });
    } else if (path === '/logout' && method === 'POST') {
      if (!token) {
        result = { success: true, message: 'Logged out.' };
      } else {
        result = await authService.handleLogout(token);
      }
    } else if (path === '/me' && method === 'GET') {
      if (!token) {
        result = { success: false, message: 'Not authenticated' };
      } else {
        const account = await authService.getAuthenticatedAccount(token);
        if (!account) {
          result = { success: false, message: 'Not authenticated' };
        } else {
          result = {
            success: true,
            token,
            user: {
              id: account.id,
              email: account.email,
              name:
                !account.name || account.name === 'Principal System Administrator'
                  ? account.email ? account.email.split('@')[0] : 'admin'
                  : account.name,
              role: account.role,
              twoFactorEnabled: false,
              mfaVerified: true,
              forceMfaEnrollment: false,
              isActive: account.isActive,
              lastLoginAt: account.lastLoginAt,
              createdAt: account.createdAt,
            },
          };
        }
      }
    } else if (path === '/change-password' && method === 'POST') {
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        result = await authService.handleChangePassword(
          token,
          body?.currentPassword,
          body?.newPassword
        );
      }
    } else if (path === '/users' && method === 'GET') {
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        result = await authService.listUsers(token);
      }
    } else if (path === '/users' && method === 'POST') {
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        result = await authService.createUser(token, body);
      }
    } else if (path.startsWith('/users/') && method === 'GET') {
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        const userId = path.split('/')[2];
        result = await authService.getUser(token, userId);
      }
    } else if (path.startsWith('/users/') && method === 'PUT') {
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        const userId = path.split('/')[2];
        result = await authService.updateUser(token, userId, body);
      }
    } else if (path.startsWith('/users/') && method === 'DELETE') {
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        const userId = path.split('/')[2];
        result = await authService.deleteUser(token, userId);
      }
    } else if ((path === '/me' || path === '/profile') && (method === 'PUT' || method === 'PATCH')) {
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        result = await authService.updateProfile(token, body);
      }
    } else if (path === '/mfa/setup' && method === 'GET') {
      // MFA is removed; return 401 if unauthenticated, else inform that MFA is disabled
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        result = { success: false, message: 'MFA is not enabled on this platform.' };
      }
    } else if (path === '/mfa/enable' && method === 'POST') {
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        result = { success: true, message: 'MFA is disabled.' };
      }
    } else if (path === '/mfa/verify' && method === 'POST') {
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        result = { success: true, message: 'MFA is disabled.' };
      }
    } else if (path === '/mfa/status' && method === 'GET') {
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        result = {
          success: true,
          twoFactorEnabled: false,
          mfaVerified: true,
          forceMfaEnrollment: false,
        };
      }
    } else {
      result = {
        success: false,
        message: 'Endpoint not found',
      };
    }

    const statusCode = result.success
      ? 200
      : result.message === 'Not authenticated' || result.message === 'Authentication required.'
        ? 401
        : result.message?.includes('privileges required') || result.message?.includes('Insufficient permissions')
          ? 403
          : result.message === 'Endpoint not found'
            ? 404
            : 400;

    logger.info('auth.request', {
      route: `/api/auth${path}`,
      method,
      statusCode,
    });

    const responseHeaders = getCorsHeaders(request);
    responseHeaders.set('content-type', 'application/json');

    const isHttps =
      new URL(request.url).protocol === 'https:' ||
      request.headers.get('x-forwarded-proto') === 'https';

    if (path === '/login' && result.success && result.token) {
      responseHeaders.append(
        'set-cookie',
        `azaroth_session=${encodeURIComponent(result.token)}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isHttps ? '; Secure' : ''}`
      );
    } else if (path === '/logout' && method === 'POST') {
      responseHeaders.append(
        'set-cookie',
        `azaroth_session=; HttpOnly; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${isHttps ? '; Secure' : ''}`
      );
    }

    return new Response(JSON.stringify(result), {
      status: statusCode,
      headers: responseHeaders,
    });
  } catch (error) {
    logger.error('auth.error', {
      route: `/api/auth${path}`,
      method,
      statusCode: 500,
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    const errHeaders = getCorsHeaders(request);
    errHeaders.set('content-type', 'application/json');

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal Server Error',
      }),
      {
        status: 500,
        headers: errHeaders,
      }
    );
  }
}

export default async function handler(req: any, res?: any) {
  if (res && typeof res.status === 'function') {
    try {
      const originalPath =
        req.headers?.['x-matched-path'] ||
        req.headers?.['x-invoke-path'] ||
        req.headers?.['x-forwarded-uri'] ||
        req.url ||
        '/api/auth';
      const host = req.headers?.['x-forwarded-host'] || req.headers?.host || 'localhost';
      const proto = req.headers?.['x-forwarded-proto'] || req.protocol || 'https';

      let fullUrlPath = originalPath;
      if (req.query && typeof req.query === 'object' && Object.keys(req.query).length > 0 && !fullUrlPath.includes('?')) {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(req.query)) {
          if (v !== undefined) {
            params.set(k, Array.isArray(v) ? v.join(',') : String(v));
          }
        }
        const qs = params.toString();
        if (qs) {
          fullUrlPath = `${fullUrlPath}?${qs}`;
        }
      }
      const url = `${proto}://${host}${fullUrlPath}`;

      const headers = new Headers();
      if (req.headers && typeof req.headers === 'object') {
        for (const [key, value] of Object.entries(req.headers)) {
          if (value !== undefined && key.toLowerCase() !== 'content-length') {
            headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
          }
        }
      }

      let bodyString: string | undefined = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (typeof req.body === 'string') {
          bodyString = req.body;
        } else if (Buffer.isBuffer(req.body)) {
          bodyString = req.body.toString('utf8');
        } else if (req.body !== undefined && req.body !== null) {
          bodyString = JSON.stringify(req.body);
        }
      }

      const webReq = new Request(url, {
        method: req.method,
        headers,
        body: bodyString,
      });

      const webRes = await handleAuthRequest(webReq);
      res.status(webRes.status);
      webRes.headers.forEach((val, key) => res.setHeader(key, val));
      const resText = await webRes.text();
      return res.send(resText);
    } catch (err: any) {
      logger.error('auth.handler.crash', {
        meta: { error: err instanceof Error ? err.message : String(err) },
      });
      return res.status(500).json({
        success: false,
        message: 'Internal authentication server error',
      });
    }
  }
  return handleAuthRequest(req);
}

handler.fetch = handleAuthRequest;
