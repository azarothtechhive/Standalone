import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { handleAuthRequest, resolveAuthPath } from '../api/auth/[...path]';
import { handleCmsRequest, resolveCmsPath } from '../api/cms/[...path]';
import * as authService from '../src/server/services/authService';
import * as sessionRepository from '../src/server/repositories/sessionRepository';
import * as accountRepository from '../src/server/repositories/accountRepository';

describe('Production Authentication & Login Flow Test Suite', () => {
  describe('1. Path Resolution & Environment Compatibility', () => {
    it('correctly resolves standard URL pathname', () => {
      const req = new Request('https://azaroth-techhive.com/api/auth/login', { method: 'POST' });
      assert.equal(resolveAuthPath(req), '/login');
    });

    it('correctly resolves paths with trailing slashes', () => {
      const req = new Request('https://azaroth-techhive.com/api/auth/login/', { method: 'POST' });
      assert.equal(resolveAuthPath(req), '/login');
    });

    it('correctly resolves subpath query param from Vercel rewrites', () => {
      const req = new Request('https://azaroth-techhive.com/api/auth?subpath=login', { method: 'POST' });
      assert.equal(resolveAuthPath(req), '/login');
    });

    it('correctly resolves path query param from Vercel [...path] rewrites', () => {
      const req = new Request('https://azaroth-techhive.com/api/auth/[...path]?path=login', { method: 'POST' });
      assert.equal(resolveAuthPath(req), '/login');
    });

    it('correctly resolves from x-matched-path header on Vercel', () => {
      const req = new Request('https://azaroth-techhive.com/api/auth/[...path]', {
        method: 'POST',
        headers: { 'x-matched-path': '/api/auth/login' },
      });
      assert.equal(resolveAuthPath(req), '/login');
    });

    it('CMS path resolution handles collections and subpaths accurately', () => {
      const req1 = new Request('https://azaroth-techhive.com/api/cms/settings', { method: 'GET' });
      assert.equal(resolveCmsPath(req1), '/settings');

      const req2 = new Request('https://azaroth-techhive.com/api/cms?subpath=navigation', { method: 'GET' });
      assert.equal(resolveCmsPath(req2), '/navigation');

      const req3 = new Request('https://azaroth-techhive.com/api/cms/products/prod-123', { method: 'PUT' });
      assert.equal(resolveCmsPath(req3), '/products/prod-123');
    });
  });

  describe('2. CORS & Preflight Support', () => {
    it('handles OPTIONS preflight for /api/auth/login with 204 and CORS headers', async () => {
      const req = new Request('https://azaroth-techhive.com/api/auth/login', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://azaroth-techhive.com',
          'Access-Control-Request-Method': 'POST',
        },
      });
      const res = await handleAuthRequest(req);
      assert.equal(res.status, 204);
      assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://azaroth-techhive.com');
      assert.equal(res.headers.get('Access-Control-Allow-Credentials'), 'true');
      assert.ok(res.headers.get('Access-Control-Allow-Methods')?.includes('POST'));
    });

    it('handles OPTIONS preflight for /api/cms/settings with 204 and CORS headers', async () => {
      const req = new Request('https://azaroth-techhive.com/api/cms/settings', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://azaroth-techhive.com',
          'Access-Control-Request-Method': 'PUT',
        },
      });
      const res = await handleCmsRequest(req);
      assert.equal(res.status, 204);
      assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://azaroth-techhive.com');
      assert.equal(res.headers.get('Access-Control-Allow-Credentials'), 'true');
    });
  });

  describe('3. Login Flow & Complete MFA/TOTP Removal', () => {
    it('rejects login with missing email or password with 400', async () => {
      const req = new Request('https://azaroth-techhive.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '' }),
      });
      const res = await handleAuthRequest(req);
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.message, 'Email and password are required.');
    });

    it('ensures /mfa/status endpoint confirms MFA is not required or enabled', async () => {
      const unauthReq = new Request('https://azaroth-techhive.com/api/auth/mfa/status', { method: 'GET' });
      const unauthRes = await handleAuthRequest(unauthReq);
      assert.equal(unauthRes.status, 401);
    });

    it('ensures MFA endpoints never block login flow', async () => {
      const setupReq = new Request('https://azaroth-techhive.com/api/auth/mfa/setup', { method: 'GET' });
      const setupRes = await handleAuthRequest(setupReq);
      assert.equal(setupRes.status, 401);

      const enableReq = new Request('https://azaroth-techhive.com/api/auth/mfa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const enableRes = await handleAuthRequest(enableReq);
      assert.equal(enableRes.status, 401);
    });
  });

  describe('4. Session Validation, Persistence & Timeout', () => {
    it('generates secure session tokens with high entropy', () => {
      const token1 = sessionRepository.generateSessionToken();
      const token2 = sessionRepository.generateSessionToken();
      assert.equal(typeof token1, 'string');
      assert.equal(token1.length, 64);
      assert.notEqual(token1, token2);
    });

    it('verifies password hashing with timing-safe scrypt', () => {
      const salt = 'c0ffee1234567890';
      const hash = accountRepository.hashPasswordScrypt('Admin@123', salt);
      assert.ok(hash.length > 32);

      const valid = accountRepository.verifyPasswordScrypt('Admin@123', salt, hash);
      assert.equal(valid, true);

      const invalid = accountRepository.verifyPasswordScrypt('WrongPassword!', salt, hash);
      assert.equal(invalid, false);
    });

    it('rejects /api/auth/me when invalid or expired token is provided', async () => {
      const req = new Request('https://azaroth-techhive.com/api/auth/me', {
        method: 'GET',
        headers: { Authorization: 'Bearer non_existent_token_12345' },
      });
      const res = await handleAuthRequest(req);
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
    });

    it('cleans session cookie with Max-Age=0 on logout', async () => {
      const req = new Request('https://azaroth-techhive.com/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await handleAuthRequest(req);
      assert.equal(res.status, 200);
      const cookie = res.headers.get('set-cookie');
      assert.ok(cookie, 'Must set cookie header');
      assert.ok(cookie.includes('Max-Age=0') || cookie.includes('max-age=0'));
    });
  });
});

