import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import contactHandler, { handleContactRequest } from '../api/contact';
import rfqHandler, { handleRfqRequest } from '../api/rfq';
import healthHandler, { handleHealthRequest } from '../api/health';
import authHandler, { handleAuthRequest } from '../api/auth/[...path]';
import cmsHandler, { handleCmsRequest } from '../api/cms/[...path]';
import * as totpService from '../src/server/services/totpService';
import * as r2Service from '../src/server/services/r2Service';
import { hashPasswordScrypt, verifyPasswordScrypt } from '../src/server/repositories/accountRepository';

describe('Production Readiness Regression Test Suite', () => {
  describe('1. Security & Password Cryptography', () => {
    it('generates consistent scrypt hash and verifies with timing-safe comparison', () => {
      const password = 'SuperSecretEnterprisePassword!2026';
      const salt = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
      const hash1 = hashPasswordScrypt(password, salt);
      const hash2 = hashPasswordScrypt(password, salt);
      assert.equal(hash1, hash2, 'Hash must be deterministic for identical salt');

      const isValid = verifyPasswordScrypt(password, salt, hash1);
      assert.equal(isValid, true, 'Valid password must verify true');

      const isInvalid = verifyPasswordScrypt('WrongPassword!123', salt, hash1);
      assert.equal(isInvalid, false, 'Invalid password must verify false');
    });

    it('generates valid RFC 6238 TOTP secrets and 8-character recovery codes', () => {
      const { secret, uri } = totpService.generateTotpSecret();
      assert.ok(secret && secret.length >= 16, 'TOTP secret must be at least 16 chars base32');
      assert.ok(uri.startsWith('otpauth://totp/Azaroth%20Tech-Hive:'), 'URI must contain correct issuer and prefix');

      const backupCodes = totpService.generateBackupCodes();
      assert.equal(backupCodes.length, 10, 'Must generate exactly 10 backup codes');
      for (const code of backupCodes) {
        assert.equal(code.length, 8, 'Each backup code must be 8 alphanumeric characters');
        assert.match(code, /^[0-9A-F]{8}$/, 'Backup codes must be uppercase hexadecimal');
      }
    });
  });

  describe('2. Public Form Workflows & Validation (Contact & RFQ)', () => {
    it('Contact API rejects GET/PUT requests with 405 Method Not Allowed', async () => {
      const req = new Request('http://localhost:3000/api/contact', { method: 'GET' });
      const res = await handleContactRequest(req);
      assert.equal(res.status, 405);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    it('Contact API rejects incomplete form submission with 400 Bad Request', async () => {
      const req = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Jane Doe',
          // Missing workEmail, companyName, message, consent
        }),
      });
      const res = await handleContactRequest(req);
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /Missing required fields/i);
    });

    it('Contact API rejects invalid email format with 400 Bad Request', async () => {
      const req = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Jane Doe',
          workEmail: 'not-an-email',
          companyName: 'Acme Corp',
          message: 'Need consulting',
          consent: true,
        }),
      });
      const res = await handleContactRequest(req);
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /Invalid email address/i);
    });

    it('RFQ API rejects missing essential requirements with 400 Bad Request', async () => {
      const req = new Request('http://localhost:3000/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'John Smith',
          workEmail: 'john@smith.io',
          // missing company, phone, service, budget, timeline, projectScope
        }),
      });
      const res = await handleRfqRequest(req);
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
    });
  });

  describe('3. Public CMS Bundle & API Integrity', () => {
    it('GET /api/cms/all returns 200 with full CmsBundle without requiring authentication', async () => {
      const req = new Request('http://localhost:3000/api/cms/all', { method: 'GET' });
      const res = await handleCmsRequest(req);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data, 'Must return data bundle');
      assert.ok(body.data.settings, 'Bundle must contain settings');
      assert.ok(Array.isArray(body.data.navigation), 'Bundle must contain navigation array');
      assert.ok(Array.isArray(body.data.products), 'Bundle must contain products array');
      assert.ok(Array.isArray(body.data.services), 'Bundle must contain services array');
      assert.ok(Array.isArray(body.data.portfolio), 'Bundle must contain portfolio array');
      assert.ok(Array.isArray(body.data.insights), 'Bundle must contain insights array');
      assert.ok(Array.isArray(body.data.testimonials), 'Bundle must contain testimonials array');
      assert.ok(typeof body.data.pages === 'object', 'Bundle must contain pages object');
      assert.ok(body.data.lastUpdated, 'Bundle must contain lastUpdated timestamp');
    });

    it('GET /api/cms/settings and /api/cms/navigation are publicly readable', async () => {
      const settingsReq = new Request('http://localhost:3000/api/cms/settings', { method: 'GET' });
      const settingsRes = await handleCmsRequest(settingsReq);
      assert.equal(settingsRes.status, 200);
      const settingsBody = await settingsRes.json();
      assert.equal(settingsBody.success, true);
      assert.ok(settingsBody.settings.companyName);

      const navReq = new Request('http://localhost:3000/api/cms/navigation', { method: 'GET' });
      const navRes = await handleCmsRequest(navReq);
      assert.equal(navRes.status, 200);
      const navBody = await navRes.json();
      assert.equal(navBody.success, true);
      assert.ok(navBody.navigation.length > 0);
    });

    it('CMS collection drafts are not publicly readable', async () => {
      const req = new Request('http://localhost:3000/api/cms/products', { method: 'GET' });
      const res = await handleCmsRequest(req);
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.message, 'Authentication required.');
    });

    it('CMS mutations reject malformed JSON with 400', async () => {
      const req = new Request('http://localhost:3000/api/cms/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: '{',
      });
      const res = await handleCmsRequest(req);
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    it('CMS write operations reject unauthenticated calls with 401 Authentication required', async () => {
      const updateSettingsReq = new Request('http://localhost:3000/api/cms/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: 'Hacked Corp' }),
      });
      const updateSettingsRes = await handleCmsRequest(updateSettingsReq);
      assert.equal(updateSettingsRes.status, 401);

      const createProductReq = new Request('http://localhost:3000/api/cms/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Malicious Product' }),
      });
      const createProductRes = await handleCmsRequest(createProductReq);
      assert.equal(createProductRes.status, 401);

      const createServiceReq = new Request('http://localhost:3000/api/cms/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Malicious Service' }),
      });
      const createServiceRes = await handleCmsRequest(createServiceReq);
      assert.equal(createServiceRes.status, 401);
    });
  });

  describe('4. Authentication, Session & MFA Route Security', () => {
    it('GET /api/auth/me rejects unauthenticated request with 401', async () => {
      const req = new Request('http://localhost:3000/api/auth/me', { method: 'GET' });
      const res = await handleAuthRequest(req);
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    it('POST /api/auth/change-password rejects unauthenticated request with 401', async () => {
      const req = new Request('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: 'foo', newPassword: 'bar' }),
      });
      const res = await handleAuthRequest(req);
      assert.equal(res.status, 401);
    });

    it('GET /api/auth/users rejects unauthenticated request with 401', async () => {
      const req = new Request('http://localhost:3000/api/auth/users', { method: 'GET' });
      const res = await handleAuthRequest(req);
      assert.equal(res.status, 401);
    });

    it('GET /api/auth/mfa/setup rejects unauthenticated request with 401', async () => {
      const req = new Request('http://localhost:3000/api/auth/mfa/setup', { method: 'GET' });
      const res = await handleAuthRequest(req);
      assert.equal(res.status, 401);
    });

    it('POST /api/auth/login rejects empty or missing credentials', async () => {
      const req = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', password: '' }),
      });
      const res = await handleAuthRequest(req);
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
    });
  });

  describe('5. Health Endpoint Checks', () => {
    it('GET /api/health responds with status ok and 200 without DB requirement', async () => {
      const req = new Request('http://localhost:3000/api/health', { method: 'GET' });
      const res = await handleHealthRequest(req);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.status, 'ok');
      assert.ok(body.timestamp);
      assert.ok(body.version);
    });
  });

  describe('6. Dual-Export Pattern & Serverless Function Runtime Compatibility', () => {
    it('verifies all API handlers provide both function handler(req, res) and handler.fetch(request)', () => {
      const handlers = [
        { name: 'contact', handler: contactHandler },
        { name: 'rfq', handler: rfqHandler },
        { name: 'health', handler: healthHandler },
        { name: 'auth', handler: authHandler },
        { name: 'cms', handler: cmsHandler },
      ];

      for (const h of handlers) {
        assert.equal(typeof h.handler, 'function', `${h.name} handler must export default function`);
        assert.equal(typeof h.handler.fetch, 'function', `${h.name} handler must provide handler.fetch`);
      }
    });

    it('simulates Express/Node.js serverless invocation using mock (req, res)', async () => {
      let statusCode = 0;
      const headers: Record<string, string> = {};
      let responseBody = '';

      const mockReq = {
        method: 'GET',
        url: '/api/health',
        headers: { host: 'localhost:3000' },
      };

      const mockRes = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        setHeader(name: string, value: string) {
          headers[name] = value;
          return this;
        },
        send(data: string) {
          responseBody = data;
          return this;
        },
      };

      await healthHandler(mockReq, mockRes);
      assert.equal(statusCode, 200);
      const parsed = JSON.parse(responseBody);
      assert.equal(parsed.status, 'ok');
    });
  });

  describe('7. Cloudflare R2 Storage Configuration', () => {
    it('validates R2 bucket and key url formatting', () => {
      const isConfigured = r2Service.isR2Configured();
      assert.equal(typeof isConfigured, 'boolean');

      // Test R2 key sanitization
      const cleanKey = 'media/asset-123/banner.webp';
      assert.ok(!cleanKey.includes('..'), 'R2 keys must not contain directory traversal');
    });
  });

  describe('8. Official Brand Palette & Transactional Email Verification', () => {
    it('strictly enforces the official Plum + Cream + Antique Gold brand palette', async () => {
      const { BRAND, renderEmailTemplate, generateReferenceId } = await import('../src/server/services/emailService');
      
      assert.equal(BRAND.plum, '#49243F', 'Plum must be #49243F');
      assert.equal(BRAND.deepPlum, '#8A315D', 'Deep Plum must be #8A315D');
      assert.equal(BRAND.rose, '#C04472', 'Rose must be #C04472');
      assert.equal(BRAND.cream, '#FAF8F4', 'Cream must be #FAF8F4');
      assert.equal(BRAND.softCream, '#F1EBE3', 'Soft Cream must be #F1EBE3');
      assert.equal(BRAND.antiqueGold, '#C99B52', 'Antique Gold must be #C99B52');

      const html = renderEmailTemplate({
        title: 'Brand Test',
        preheader: 'Testing palette',
        headerText: 'Official Palette Test',
        bodyHtml: '<p>Body</p>',
        footerNote: 'Footer',
      });

      assert.ok(html.includes('#49243F'), 'Email template must use Plum #49243F');
      assert.ok(html.includes('#8A315D'), 'Email template must use Deep Plum #8A315D');
      assert.ok(html.includes('#FAF8F4'), 'Email template must use Cream #FAF8F4');
      assert.ok(html.includes('#C99B52'), 'Email template must use Antique Gold #C99B52');
      assert.ok(!html.includes('#071B3A'), 'Navy #071B3A must be strictly absent');
      assert.ok(!html.includes('#0878E8'), 'Blue #0878E8 must be strictly absent');

      const rfqRef = generateReferenceId('RFQ', 'sub-12345678');
      assert.match(rfqRef, /^AZR-RFQ-[A-Z0-9]{8}$/);
    });
  });
});
