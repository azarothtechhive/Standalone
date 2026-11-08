import { logger } from '../../src/server/core/logger';
import * as authService from '../../src/server/services/authService';
import * as cmsService from '../../src/server/services/cmsService';
import { productsCatalog } from '../../src/data/productsData';
import { serviceOfferings } from '../../src/data/servicesData';
import { SEED_INSIGHTS_ARTICLES } from '../../src/seed/seedData';

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

export function resolveCmsPath(request: Request): string {
  const url = new URL(request.url);

  const subpath = url.searchParams.get('subpath') || url.searchParams.get('path');
  if (subpath) {
    const clean = subpath.startsWith('/') ? subpath : `/${subpath}`;
    if (!clean.includes('[...')) {
      return clean.replace(/\.(ts|js)$/, '').replace(/\/+$/, '') || '/';
    }
  }

  const matched =
    request.headers.get('x-matched-path') ||
    request.headers.get('x-invoke-path') ||
    request.headers.get('x-forwarded-uri');
  if (matched && matched.includes('/api/cms')) {
    const fromHeader = matched.replace(/^.*?\/api\/cms/, '');
    if (fromHeader && !fromHeader.includes('[...')) {
      return fromHeader.replace(/\.(ts|js)$/, '').replace(/\/+$/, '') || '/';
    }
  }

  const fromPathname = url.pathname.replace(/^.*?\/api\/cms/, '');
  if (fromPathname && !fromPathname.includes('[...')) {
    return fromPathname.replace(/\.(ts|js)$/, '').replace(/\/+$/, '') || '/';
  }

  return '/';
}

export async function handleCmsRequest(request: Request): Promise<Response> {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }

  const url = new URL(request.url);
  const path = resolveCmsPath(request);
  const method = request.method;

  try {
    let body: any = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.json();
      } catch {
        const badReqHeaders = getCorsHeaders(request);
        badReqHeaders.set('content-type', 'application/json');
        return new Response(JSON.stringify({ success: false, message: 'A valid JSON request body is required.' }), {
          status: 400,
          headers: badReqHeaders,
        });
      }
    }

    // Extract session token from authorization header (Bearer) or cookies
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

    // Authenticated account (Bearer token first, then cookie token)
    let account = bearerToken ? await authService.getAuthenticatedAccount(bearerToken) : null;
    if (!account && cookieToken && cookieToken !== bearerToken) {
      account = await authService.getAuthenticatedAccount(cookieToken);
    }

    let result: any;

    if (path === '/all' && method === 'GET') {
      result = account ? await cmsService.getAdminBundle(account) : await cmsService.getBundle();
    } else if (path === '/stats' && method === 'GET') {
      result = await cmsService.getStats(account);
    } else if (path === '/settings' && method === 'GET') {
      result = await cmsService.getSettings(account);
    } else if (path === '/settings' && method === 'PUT') {
      result = await cmsService.updateSettings(body, account);
    } else if (path === '/navigation' && method === 'GET') {
      result = await cmsService.getNavigation(account);
    } else if (path === '/navigation' && method === 'PUT') {
      result = await cmsService.updateNavigation(body, account);
    } else if (path === '/navigation' && method === 'POST') {
      result = await cmsService.createCollectionItem(
        'navigation',
        cmsService.SEED_NAVIGATION_ITEMS,
        body,
        'navigation item',
        account
      );
    } else if (path.startsWith('/navigation/') && method === 'PUT') {
      const id = decodeURIComponent(path.replace('/navigation/', ''));
      result = await cmsService.updateCollectionItem(
        'navigation',
        cmsService.SEED_NAVIGATION_ITEMS,
        id,
        body,
        'navigation item',
        account
      );
    } else if (path.startsWith('/navigation/') && method === 'DELETE') {
      const id = decodeURIComponent(path.replace('/navigation/', ''));
      result = await cmsService.deleteCollectionItem(
        'navigation',
        cmsService.SEED_NAVIGATION_ITEMS,
        id,
        'navigation item',
        account
      );
    } else if (path.startsWith('/pages/') && method === 'GET') {
      const slug = path.replace('/pages/', '');
      result = await cmsService.getPage(slug, account);
    } else if (path.startsWith('/pages/') && method === 'PUT') {
      const slug = path.replace('/pages/', '');
      result = await cmsService.updatePage(slug, body, account);
    } else if (path.startsWith('/pages/') && method === 'POST') {
      const slug = path.replace('/pages/', '');
      result = await cmsService.publishPage(slug, account);
    }
    // Products Collection
    else if (path === '/products' && method === 'GET') {
      result = await cmsService.getCollection('products_catalog', productsCatalog, account);
    } else if (path === '/products' && method === 'POST') {
      result = await cmsService.createCollectionItem('products_catalog', productsCatalog, body, 'product', account);
    } else if (path.startsWith('/products/') && method === 'PUT') {
      const id = path.replace('/products/', '');
      result = await cmsService.updateCollectionItem('products_catalog', productsCatalog, id, body, 'product', account);
    } else if (path.startsWith('/products/') && method === 'DELETE') {
      const id = path.replace('/products/', '');
      result = await cmsService.deleteCollectionItem('products_catalog', productsCatalog, id, 'product', account);
    }
    // Services Collection
    else if (path === '/services' && method === 'GET') {
      result = await cmsService.getCollection('services_catalog', serviceOfferings, account);
    } else if (path === '/services' && method === 'POST') {
      result = await cmsService.createCollectionItem('services_catalog', serviceOfferings, body, 'service', account);
    } else if (path.startsWith('/services/') && method === 'PUT') {
      const id = path.replace('/services/', '');
      result = await cmsService.updateCollectionItem('services_catalog', serviceOfferings, id, body, 'service', account);
    } else if (path.startsWith('/services/') && method === 'DELETE') {
      const id = path.replace('/services/', '');
      result = await cmsService.deleteCollectionItem('services_catalog', serviceOfferings, id, 'service', account);
    }
    // Portfolio Collection
    else if (path === '/portfolio' && method === 'GET') {
      result = await cmsService.getCollection('portfolio_items', cmsService.getFallbackBundle().portfolio, account);
    } else if (path === '/portfolio' && method === 'POST') {
      result = await cmsService.createCollectionItem('portfolio_items', cmsService.getFallbackBundle().portfolio, body, 'portfolio', account);
    } else if (path.startsWith('/portfolio/') && method === 'PUT') {
      const id = path.replace('/portfolio/', '');
      result = await cmsService.updateCollectionItem('portfolio_items', cmsService.getFallbackBundle().portfolio, id, body, 'portfolio', account);
    } else if (path.startsWith('/portfolio/') && method === 'DELETE') {
      const id = path.replace('/portfolio/', '');
      result = await cmsService.deleteCollectionItem('portfolio_items', cmsService.getFallbackBundle().portfolio, id, 'portfolio', account);
    }
    // Insights Collection
    else if (path === '/insights' && method === 'GET') {
      result = await cmsService.getCollection('insights_articles', SEED_INSIGHTS_ARTICLES, account);
    } else if (path === '/insights' && method === 'POST') {
      result = await cmsService.createCollectionItem('insights_articles', SEED_INSIGHTS_ARTICLES, body, 'insight', account);
    } else if (path.startsWith('/insights/') && method === 'PUT') {
      const id = path.replace('/insights/', '');
      result = await cmsService.updateCollectionItem('insights_articles', SEED_INSIGHTS_ARTICLES, id, body, 'insight', account);
    } else if (path.startsWith('/insights/') && method === 'DELETE') {
      const id = path.replace('/insights/', '');
      result = await cmsService.deleteCollectionItem('insights_articles', SEED_INSIGHTS_ARTICLES, id, 'insight', account);
    }
    // Testimonials Collection
    else if (path === '/testimonials' && method === 'GET') {
      result = await cmsService.getCollection('testimonials_catalog', cmsService.SEED_TESTIMONIALS, account);
    } else if (path === '/testimonials' && method === 'POST') {
      result = await cmsService.createCollectionItem('testimonials_catalog', cmsService.SEED_TESTIMONIALS, body, 'testimonial', account);
    } else if (path.startsWith('/testimonials/') && method === 'PUT') {
      const id = path.replace('/testimonials/', '');
      result = await cmsService.updateCollectionItem('testimonials_catalog', cmsService.SEED_TESTIMONIALS, id, body, 'testimonial', account);
    } else if (path.startsWith('/testimonials/') && method === 'DELETE') {
      const id = path.replace('/testimonials/', '');
      result = await cmsService.deleteCollectionItem('testimonials_catalog', cmsService.SEED_TESTIMONIALS, id, 'testimonial', account);
    }
    // Media Management
    else if (path === '/media' && method === 'GET') {
      result = await cmsService.getAllMedia(account);
    } else if (path === '/media' && method === 'POST') {
      result = await cmsService.createMediaAsset(body?.displayName || 'Untitled', account);
    } else if (path.startsWith('/media/') && method === 'DELETE') {
      const id = path.replace('/media/', '');
      result = await cmsService.deleteMediaAsset(id, account);
    }
    // Form Enquiries & Submissions
    else if (path === '/enquiries' && method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      result = await cmsService.getEnquiries(limit, offset, account);
    } else if (path.startsWith('/enquiries/') && method === 'PATCH') {
      const id = path.replace('/enquiries/', '');
      result = await cmsService.updateEnquiry(id, body, account);
    } else if (path.startsWith('/enquiries/') && method === 'DELETE') {
      const id = path.replace('/enquiries/', '');
      result = await cmsService.deleteEnquiry(id, account);
    } else if (path === '/rfqs' && method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      result = await cmsService.getRfqs(limit, offset, account);
    } else if (path.startsWith('/rfqs/') && method === 'PATCH') {
      const id = decodeURIComponent(path.replace('/rfqs/', ''));
      result = await cmsService.updateRfq(id, body, account);
    } else if (path.startsWith('/rfqs/') && method === 'DELETE') {
      const id = decodeURIComponent(path.replace('/rfqs/', ''));
      result = await cmsService.deleteRfq(id, account);
    }
    // Audit Logs
    else if (path === '/audit-logs' && method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '100', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      result = await cmsService.getAuditLogs(limit, offset, account);
    } else {
      result = {
        success: false,
        message: 'Endpoint not found',
      };
    }

    const statusCode = result.success
      ? 200
      : result.message === 'Authentication required.' || result.message?.includes('Authentication required')
        ? 401
        : result.message === 'Insufficient permissions.' || result.message?.includes('privileges required')
          ? 403
          : result.message === 'Content not found.' || result.message === 'Endpoint not found' || result.message?.includes('not found')
            ? 404
            : result.message === 'A valid JSON request body is required.'
              ? 400
            : 500;

    logger.info('cms.request', {
      route: `/api/cms${path}`,
      method,
      statusCode,
    });

    const responseHeaders = getCorsHeaders(request);
    responseHeaders.set('content-type', 'application/json');

    return new Response(JSON.stringify(result), {
      status: statusCode,
      headers: responseHeaders,
    });
  } catch (error) {
    logger.error('cms.error', {
      route: `/api/cms${path}`,
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
        '/api/cms';
      const host = req.headers?.['x-forwarded-host'] || req.headers?.host || 'localhost';
      const proto = req.headers?.['x-forwarded-proto'] || req.protocol || 'https';

      let fullUrlPath = originalPath;
      if (req.query && typeof req.query === 'object' && Object.keys(req.query).length > 0 && !fullUrlPath.includes('?')) {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(req.query)) {
          if (v !== undefined) {
            params.set(k, Array.isArray(v) ? v.join('/') : String(v));
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

      const webRes = await handleCmsRequest(webReq);
      res.status(webRes.status);
      webRes.headers.forEach((val, key) => res.setHeader(key, val));
      const resText = await webRes.text();
      return res.send(resText);
    } catch (err: any) {
      logger.error('cms.handler.crash', {
        meta: { error: err instanceof Error ? err.message : String(err) },
      });
      return res.status(500).json({
        success: false,
        message: 'Internal CMS server error',
      });
    }
  }
  return handleCmsRequest(req);
}

handler.fetch = handleCmsRequest;
