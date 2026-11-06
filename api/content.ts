import { logger } from '../src/server/core/logger';
import * as cmsService from '../src/server/services/cmsService';
import { productsCatalog } from '../src/data/productsData';
import { serviceOfferings } from '../src/data/servicesData';
import { SEED_INSIGHTS_ARTICLES } from '../src/seed/seedData';

/**
 * Public Content API
 * 
 * This endpoint provides read-only access to published CMS content for the public site.
 * It fetches content directly from the database and returns only published items.
 * No authentication required - this is for public consumption.
 * 
 * Deployed on the CMS deployment to allow the public site to fetch content via CORS.
 */

const CACHE_TTL = 300; // 5 minutes cache
const contentCache = new Map<string, { data: any; timestamp: number }>();

function getCachedData(key: string): any | null {
  const cached = contentCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL * 1000) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  contentCache.set(key, { data, timestamp: Date.now() });
}

function getCorsHeaders(request: Request): Headers {
  const origin = request.headers.get('origin');
  const headers = new Headers();
  
  // Allow requests from the public site
  const publicSiteUrl = process.env.PUBLIC_SITE_URL || 'https://test.azaroth-techhive.com';
  
  if (origin === publicSiteUrl || 
      origin?.includes('localhost') || 
      origin?.includes('127.0.0.1') ||
      origin?.includes('vercel.app')) {
    headers.set('Access-Control-Allow-Origin', origin || '*');
  } else {
    headers.set('Access-Control-Allow-Origin', publicSiteUrl);
  }
  
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  
  return headers;
}

export async function GET(request: Request): Promise<Response> {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'all';
  const slug = url.searchParams.get('slug');
  const cacheKey = `${type}-${slug || 'all'}`;

  try {
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      const headers = getCorsHeaders(request);
      headers.set('content-type', 'application/json');
      headers.set('X-Cache', 'HIT');
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers,
      });
    }

    let result: any;

    // Fetch content based on type
    switch (type) {
      case 'all':
        // Get all published content (read-only, no auth)
        result = await cmsService.getBundle();
        break;
        
      case 'page':
        if (!slug) {
          result = { success: false, message: 'Page slug is required' };
        } else {
          result = await cmsService.getPage(slug, null); // null = no auth, public only
        }
        break;
        
      case 'products':
        result = await cmsService.getCollection('products_catalog', productsCatalog, null);
        break;
        
      case 'services':
        result = await cmsService.getCollection('services_catalog', serviceOfferings, null);
        break;
        
      case 'portfolio':
        result = await cmsService.getCollection('portfolio_items', cmsService.getFallbackBundle().portfolio, null);
        break;
        
      case 'insights':
        result = await cmsService.getCollection('insights_articles', SEED_INSIGHTS_ARTICLES, null);
        break;
        
      case 'testimonials':
        result = await cmsService.getCollection('testimonials_catalog', cmsService.SEED_TESTIMONIALS, null);
        break;
        
      case 'navigation':
        result = await cmsService.getNavigation(null);
        break;
        
      case 'settings':
        result = await cmsService.getSettings(null);
        break;
        
      default:
        result = { success: false, message: 'Invalid content type' };
    }

    // Cache successful responses
    if (result.success) {
      setCachedData(cacheKey, result);
    }

    const statusCode = result.success ? 200 : 404;

    logger.info('content.api.request', {
      route: '/api/content',
      method: 'GET',
      statusCode,
      meta: { contentType: type, slug, cached: false },
    });

    const headers = getCorsHeaders(request);
    headers.set('content-type', 'application/json');
    headers.set('X-Cache', 'MISS');

    return new Response(JSON.stringify(result), {
      status: statusCode,
      headers,
    });
  } catch (error) {
    logger.error('content.api.error', {
      route: '/api/content',
      method: 'GET',
      statusCode: 500,
      meta: { contentType: type, slug, error: error instanceof Error ? error.message : 'Unknown error' },
    });

    const headers = getCorsHeaders(request);
    headers.set('content-type', 'application/json');

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch content',
      }),
      {
        status: 500,
        headers,
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
        '/api/content';
      const host = req.headers?.['x-forwarded-host'] || req.headers?.host || 'localhost';
      const proto = req.headers?.['x-forwarded-proto'] || req.protocol || 'https';

      let fullUrlPath = originalPath;
      if (req.query && typeof req.query === 'object' && Object.keys(req.query).length > 0 && !fullUrlPath.includes('?')) {
        const params = new URLSearchParams();
        for (const [_k, v] of Object.entries(req.query)) {
          if (v !== undefined) {
            params.set(_k, Array.isArray(v) ? v.join(',') : String(v));
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

      const webReq = new Request(url, {
        method: req.method,
        headers,
      });

      const webRes = await GET(webReq);
      res.status(webRes.status);
      webRes.headers.forEach((val, key) => res.setHeader(key, val));
      const resText = await webRes.text();
      return res.send(resText);
    } catch (err: any) {
      logger.error('content.handler.crash', {
        meta: { error: err instanceof Error ? err.message : String(err) },
      });
      return res.status(500).json({
        success: false,
        message: 'Internal content API error',
      });
    }
  }
  return GET(req);
}

handler.fetch = GET;
