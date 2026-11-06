import * as authService from '../../src/server/services/authService';
import { logger } from '../../src/server/core/logger';

export async function handleAuthRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  let path = url.pathname.replace(/^\/api\/auth/, '') || '/';
  if (path.endsWith('.ts') || path.endsWith('.js')) {
    path = path.replace(/\.(ts|js)$/, '');
  }
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
      bearerToken = authHeader.slice('Bearer '.length).trim();
    }

    if (cookieHeader) {
      const parts = cookieHeader.split(';');
      for (const part of parts) {
        const [rawName, ...rest] = part.trim().split('=');
        if (rawName === 'azaroth_session' || rawName === 'session_token') {
          cookieToken = decodeURIComponent(rest.join('='));
          break;
        }
      }
    }

    let token: string | null = null;
    const tokenCandidates = [...new Set(
      [cookieToken, bearerToken].filter(
        (candidate): candidate is string => Boolean(candidate),
      ),
    )];
    for (const candidate of tokenCandidates) {
      if (await authService.getAuthenticatedAccount(candidate, true)) {
        token = candidate;
        break;
      }
    }

    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
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
        result = { success: false, message: 'No session token provided' };
      } else {
        result = await authService.handleLogout(token);
      }
    } else if (path === '/me' && method === 'GET') {
      if (!token) {
        result = { success: false, message: 'Not authenticated' };
      } else {
        // Allow unverified MFA so the user knows if MFA enrollment is required
        const account = await authService.getAuthenticatedAccount(token, true);
        if (!account) {
          result = { success: false, message: 'Not authenticated' };
        } else {
          result = {
            success: true,
            token,
            user: {
              id: account.id,
              email: account.email,
              name: (!account.name || account.name === 'Principal System Administrator')
                ? (account.email ? account.email.split('@')[0] : 'admin')
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
      if (!token) {
        result = { success: false, message: 'Authentication required.' };
      } else {
        result = await authService.generateTotpSetup(token);
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
        const account = await authService.getAccountFromSession(token);
        if (!account) {
          result = { success: false, message: 'Invalid session.' };
        } else {
          result = {
            success: true,
            twoFactorEnabled: false,
            mfaVerified: true,
            forceMfaEnrollment: false,
          };
        }
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

    const responseHeaders = new Headers({ 'content-type': 'application/json' });
    if (path === '/login' && result.success && result.token) {
      const secure = new URL(request.url).protocol === 'https:';
      responseHeaders.append(
        'set-cookie',
        `azaroth_session=${encodeURIComponent(result.token)}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${secure ? '; Secure' : ''}`
      );
    } else if (path === '/logout' && method === 'POST') {
      const secure = new URL(request.url).protocol === 'https:';
      responseHeaders.append(
        'set-cookie',
        `azaroth_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`
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

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal Server Error',
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }
    );
  }
}

export default async function handler(req: any, res?: any) {
  if (res && typeof res.status === 'function') {
    try {
      const url = `${req.protocol || 'https'}://${req.headers?.host || 'localhost'}${req.url || '/api/auth'}`;
      
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
