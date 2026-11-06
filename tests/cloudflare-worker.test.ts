import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import worker, { handleCloudflareFetch, Env } from '../src/server/worker';
import { REDIRECT_RULES } from '../src/config/redirects';

describe('Cloudflare Worker Entrypoint Test Suite', () => {
  it('should redirect canonical legacy routes with HTTP 301 and destination', async () => {
    for (const rule of REDIRECT_RULES.slice(0, 5)) {
      const request = new Request(`https://azaroth-techhive.com${rule.source}`);
      const response = await handleCloudflareFetch(request, {});

      assert.equal(response.status, 301);
      const location = response.headers.get('location');
      assert.ok(location, `Expected location header for redirect ${rule.source}`);
      assert.ok(
        location.endsWith(rule.destination) || location.includes(rule.destination),
        `Expected destination ${rule.destination}, got ${location}`
      );
    }
  });

  it('should attach hardened security headers to worker responses', async () => {
    const mockAssets = {
      fetch: async (req: Request) =>
        new Response('<html><body>Mock SPA</body></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
    };

    const request = new Request('https://azaroth-techhive.com/');
    const response = await handleCloudflareFetch(request, { ASSETS: mockAssets });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
    assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.ok(response.headers.get('Strict-Transport-Security'));
    assert.ok(response.headers.get('Content-Security-Policy'));
    assert.ok(
      response.headers.get('Content-Security-Policy')?.includes("default-src 'self'"),
      'CSP should contain default-src self'
    );
  });

  it('should delegate /api/health to handleHealthRequest', async () => {
    const request = new Request('https://azaroth-techhive.com/api/health');
    const response = await handleCloudflareFetch(request, {});

    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.status, 'ok');
  });

  it('should dispatch unknown non-API routes to env.ASSETS.fetch', async () => {
    let assetsFetched = false;
    let requestedUrl = '';

    const mockAssets = {
      fetch: async (req: Request) => {
        assetsFetched = true;
        requestedUrl = req.url;
        return new Response('Mock SPA Root', { status: 200 });
      },
    };

    const request = new Request('https://azaroth-techhive.com/products');
    const response = await handleCloudflareFetch(request, { ASSETS: mockAssets });

    assert.ok(assetsFetched, 'Expected env.ASSETS.fetch to be called');
    assert.equal(requestedUrl, 'https://azaroth-techhive.com/products');
    assert.equal(response.status, 200);
  });

  it('should return 404 when ASSETS binding is missing on non-API routes', async () => {
    const request = new Request('https://azaroth-techhive.com/some-page-without-assets');
    const response = await handleCloudflareFetch(request, {});

    assert.equal(response.status, 404);
    const body = await response.json();
    assert.ok(body.error.includes('Assets binding ASSETS is not configured'));
  });

  it('should execute scheduled cron task and handle CRON_SECRET authentication', async () => {
    let waitUntilCalled = false;
    const mockCtx = {
      waitUntil: (promise: Promise<any>) => {
        waitUntilCalled = true;
      },
      passThroughOnException: () => {},
    };

    // Scheduled event without secret
    await worker.scheduled(
      { cron: '0 3 * * *', scheduledTime: Date.now(), type: 'cron' },
      { CRON_SECRET: '' },
      mockCtx as any
    );
    assert.equal(waitUntilCalled, false);

    // Scheduled event with secret
    await worker.scheduled(
      { cron: '0 3 * * *', scheduledTime: Date.now(), type: 'cron' },
      { CRON_SECRET: 'test-cron-secret-123' },
      mockCtx as any
    );
    assert.equal(waitUntilCalled, true);
  });
});
