import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  redactSensitiveValue,
  formatStructuredLog,
  REDACTED_MARKER,
} from '../../src/server/core/logger.ts';
import {
  InMemoryCachePurgeAdapter,
  CACHE_CONTROL_POLICIES,
  CACHE_TAGS,
  type CachePurgePort,
} from '../../src/server/core/cache.ts';
import { VercelCachePurgeAdapter } from '../../src/server/adapters/vercel/cachePurgeAdapter.ts';
import {
  handleLivenessHealth,
  handleReadinessHealth,
} from '../../src/server/core/health.ts';
import {
  CmsUrlSchema,
  MediaSlotReferenceSchema,
  PageSeoSchema,
  ScopeKeySchema,
} from '../../src/schemas/content.ts';
import {
  SEED_MEDIA_SLOTS,
  SEED_PAGE_SEO,
  SEED_FIRST_ADMIN,
  buildSeedScopePayloads,
} from '../../src/seed/seedData.ts';
import { lintRuntimeBoundaries } from '../../scripts/lint-runtime-boundaries.mjs';
import { buildVercelConfigObject } from '../../scripts/generate-host-config.mjs';

describe('Phase 3 — Scope Correction, Data Model, Observability & Portability Verification', () => {
  describe('OBS-1: Structured JSON Logger & Recursive Secret Redaction', () => {
    it('redacts sensitive keys, Postgres URIs, Bearer tokens, AWS keys, presigned URLs, and cookies recursively', () => {
      const rawInput = {
        actorEmail: 'admin@azaroth.tech',
        password: 'SuperSecretPassword!123',
        totpCode: '492817',
        nested: {
          database_url: 'postgresql://azaroth_app:my_db_pass@ep-cool-frog.us-east-2.aws.neon.tech/neondb?sslmode=require',
          connectionInfo:
            'Failed connecting to postgres://user:secret123@host.neon.tech:5432/db during query',
          authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig',
          presignedPut:
            'https://acc.r2.cloudflarestorage.com/bucket/staging/ver_1/upload.bin?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20261101&X-Amz-Signature=deadbeef1234567890',
          cookieString: '__Host-better-auth.session_token=sec_tok_99887766; Path=/; HttpOnly',
          r2AccessKey: 'AKIAIOSFODNN7EXAMPLE',
        },
      };

      const redacted = redactSensitiveValue(rawInput) as Record<string, any>;
      assert.equal(redacted.actorEmail, 'admin@azaroth.tech');
      assert.equal(redacted.password, REDACTED_MARKER);
      assert.equal(redacted.totpCode, REDACTED_MARKER);
      assert.equal(redacted.nested.database_url, REDACTED_MARKER);
      assert.equal(redacted.nested.authHeader, REDACTED_MARKER);
      assert.equal(redacted.nested.cookieString, REDACTED_MARKER);
      assert.equal(redacted.nested.r2AccessKey, REDACTED_MARKER);
      assert.ok(!redacted.nested.connectionInfo.includes('secret123'));
      assert.ok(redacted.nested.connectionInfo.includes(`postgresql://${REDACTED_MARKER}`));
      assert.ok(!redacted.nested.presignedPut.includes('deadbeef1234567890'));
      assert.ok(!redacted.nested.presignedPut.includes('AKIAIOSFODNN7EXAMPLE'));

      const jsonLine = formatStructuredLog('info', 'auth.login.attempt', {
        route: '/api/auth/login',
        method: 'POST',
        statusCode: 200,
        meta: rawInput,
      });
      assert.ok(!jsonLine.includes('SuperSecretPassword!123'));
      assert.ok(!jsonLine.includes('my_db_pass'));
      assert.ok(!jsonLine.includes('deadbeef1234567890'));
      const parsed = JSON.parse(jsonLine);
      assert.equal(parsed.service, 'azaroth-cms');
      assert.equal(parsed.level, 'info');
    });
  });

  describe('RT-3 & RT-4: Single Cache Module & CachePurgePort Contract Tests', () => {
    async function runCachePurgeContractSuite(createAdapter: () => CachePurgePort) {
      const adapter = createAdapter();
      const res = await adapter.purge({
        tags: ['cms:scope:page:home', 'cms:scope:page:home', '  cms:sitemap  '],
        paths: ['/', 'about-us', '/'],
      });
      assert.equal(res.ok, true);
      assert.deepEqual(res.purgedTags, ['cms:scope:page:home', 'cms:sitemap']);
      assert.deepEqual(res.purgedPaths, ['/', '/about-us']);
    }

    it('passes CachePurgePort contract against InMemoryCachePurgeAdapter', async () => {
      await runCachePurgeContractSuite(() => new InMemoryCachePurgeAdapter());
    });

    it('passes CachePurgePort contract against VercelCachePurgeAdapter with mocked fetch', async () => {
      const calls: Array<{ url: string; init?: RequestInit }> = [];
      const mockFetch: typeof fetch = async (input, init) => {
        calls.push({ url: String(input), init });
        return new Response(JSON.stringify({ revalidated: true }), { status: 200 });
      };

      await runCachePurgeContractSuite(
        () =>
          new VercelCachePurgeAdapter({
            siteUrl: 'https://www.azaroth-techhive.com/',
            bypassToken: 'test_revalidate_token',
            fetchImpl: mockFetch,
          })
      );
      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, 'https://www.azaroth-techhive.com/api/internal/revalidate');
    });

    it('defines immutable media and SWR public HTML Cache-Control policies', () => {
      assert.equal(
        CACHE_CONTROL_POLICIES.immutablePublicMedia,
        'public, max-age=31536000, immutable'
      );
      assert.equal(
        CACHE_CONTROL_POLICIES.publicHtmlAndContent,
        'public, s-maxage=3600, stale-while-revalidate=86400'
      );
      assert.equal(CACHE_TAGS.forScope('page:home'), 'cms:scope:page:home');
    });
  });

  describe('OBS-2: Liveness (/api/health) and Readiness (/api/health/ready) Endpoints', () => {
    it('returns HTTP 200 and version from GET /api/health without touching database', async () => {
      const req = new Request('http://localhost:3000/api/health', { method: 'GET' });
      const res = handleLivenessHealth(req);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('cache-control'), CACHE_CONTROL_POLICIES.privateNoStore);
      const body = await res.json();
      assert.equal(body.status, 'ok');
      assert.equal(body.service, 'azaroth-cms');
    });

    it('rejects GET /api/health/ready without valid x-health-secret header (HTTP 401)', async () => {
      const req = new Request('http://localhost:3000/api/health/ready', {
        method: 'GET',
        headers: { 'x-health-secret': 'wrong-secret' },
      });
      const res = await handleReadinessHealth(req, { expectedSecret: 'correct-secret-123' });
      assert.equal(res.status, 401);
    });

    it('rejects GET /api/health/ready without x-health-secret (HTTP 401)', async () => {
      const req = new Request('http://localhost:3000/api/health/ready', { method: 'GET' });
      const res = await handleReadinessHealth(req, { expectedSecret: 'correct-secret-123' });
      assert.equal(res.status, 401);
    });

    it('returns HTTP 503 when readiness authentication is not configured', async () => {
      const req = new Request('http://localhost:3000/api/health/ready', {
        method: 'GET',
        headers: { 'x-health-secret': 'must-not-be-echoed' },
      });
      const res = await handleReadinessHealth(req, { expectedSecret: '' });
      assert.equal(res.status, 503);
      assert.ok(!(await res.text()).includes('must-not-be-echoed'));
    });

    it('returns HTTP 200 when x-health-secret matches and Neon + R2 probes succeed', async () => {
      const req = new Request('http://localhost:3000/api/health/ready', {
        method: 'GET',
        headers: { 'x-health-secret': 'correct-secret-123' },
      });
      const res = await handleReadinessHealth(req, {
        expectedSecret: 'correct-secret-123',
        checkNeon: async () => ({ ok: true, latencyMs: 4 }),
        checkR2: async () => ({ ok: true, latencyMs: 6 }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.status, 'ready');
      assert.equal(body.checks.neonPostgres.ok, true);
      assert.equal(body.checks.cloudflareR2.ok, true);
    });

    it('returns HTTP 503 when a dependency probe fails or times out', async () => {
      const req = new Request('http://localhost:3000/api/health/ready', {
        method: 'GET',
        headers: { 'x-health-secret': 'correct-secret-123' },
      });
      const res = await handleReadinessHealth(req, {
        expectedSecret: 'correct-secret-123',
        checkNeon: async () => ({ ok: false, latencyMs: 15, detail: 'Connection refused' }),
        checkR2: async () => ({ ok: true, latencyMs: 5 }),
      });
      assert.equal(res.status, 503);
      const body = await res.json();
      assert.equal(body.status, 'degraded');
    });

    it('returns HTTP 503 when no Neon connection is configured', async () => {
      const req = new Request('http://localhost:3000/api/health/ready', {
        method: 'GET',
        headers: { 'x-health-secret': 'correct-secret-123' },
      });
      const originalPublicUrl = process.env.DATABASE_URL_PUBLIC_RO;
      const originalAppUrl = process.env.DATABASE_URL_APP;
      delete process.env.DATABASE_URL_PUBLIC_RO;
      delete process.env.DATABASE_URL_APP;
      try {
        const res = await handleReadinessHealth(req, {
          expectedSecret: 'correct-secret-123',
          checkR2: async () => ({ ok: true, latencyMs: 1 }),
        });
        assert.equal(res.status, 503);
        assert.equal((await res.json()).checks.neonPostgres.ok, false);
      } finally {
        if (originalPublicUrl === undefined) delete process.env.DATABASE_URL_PUBLIC_RO;
        else process.env.DATABASE_URL_PUBLIC_RO = originalPublicUrl;
        if (originalAppUrl === undefined) delete process.env.DATABASE_URL_APP;
        else process.env.DATABASE_URL_APP = originalAppUrl;
      }
    });

    it('returns HTTP 503 by the deadline when a dependency ignores cancellation', async () => {
      const req = new Request('http://localhost:3000/api/health/ready', {
        method: 'GET',
        headers: { 'x-health-secret': 'correct-secret-123' },
      });
      const startedAt = Date.now();
      const res = await handleReadinessHealth(req, {
        expectedSecret: 'correct-secret-123',
        timeoutMs: 20,
        checkNeon: () => new Promise(() => { }),
        checkR2: async () => ({ ok: true, latencyMs: 1 }),
      });
      assert.equal(res.status, 503);
      assert.ok(Date.now() - startedAt < 3000);
      assert.equal((await res.json()).checks.neonPostgres.detail, 'Probe timed out');
    });
  });

  describe('RT-2: Import-Boundary Linter', () => {
    it('confirms zero Class A / adapter import boundary violations', () => {
      const result = lintRuntimeBoundaries();
      assert.ok(result.checkedClassACount >= 3);
      assert.deepEqual(result.violations, []);
    });
  });

  describe('RT-5, HOST-1, SEC-3 & SEO-5: Host Configuration Generation (vercel.json)', () => {
    it('generates valid vercel.json with security headers, CSP, 13 permanent redirects, and non-shadowing rewrites', () => {
      const config = buildVercelConfigObject();
      assert.equal(config.redirects.length, 13);
      assert.ok(
        config.redirects.some((r) => r.source === '/service' && r.destination === '/services' && r.permanent)
      );
      assert.ok(
        config.redirects.some(
          (r) => r.source === '/request-for-quote' && r.destination === '/connect-with-us'
        )
      );

      const globalHeaders = config.headers.find((h) => h.source === '/(.*)');
      assert.ok(globalHeaders);
      const cspHeader = globalHeaders.headers.find((h) => h.key === 'Content-Security-Policy');
      assert.ok(cspHeader);
      assert.ok(cspHeader.value.includes("default-src 'self'"));
      assert.ok(cspHeader.value.includes("frame-ancestors 'none'"));
      assert.ok(cspHeader.value.includes('https://images.unsplash.com'));
    });
  });

  describe('SEED-1, ALT-1..ALT-4 & CMS-3: Idempotent Seed & Shared Zod Schemas', () => {
    it('validates all 15 image slots (12 informative with non-empty alt, 3 decorative with empty alt)', () => {
      assert.equal(SEED_MEDIA_SLOTS.length, 15);
      const informative = SEED_MEDIA_SLOTS.filter((s) => s.classification === 'informative');
      const decorative = SEED_MEDIA_SLOTS.filter((s) => s.classification === 'decorative');
      assert.equal(informative.length, 12);
      assert.equal(decorative.length, 3);

      for (const slot of SEED_MEDIA_SLOTS) {
        const parsed = MediaSlotReferenceSchema.parse({
          slotId: slot.slotId,
          versionId: slot.versionId,
          classification: slot.classification,
          altText: slot.altText,
        });
        if (parsed.classification === 'informative') {
          assert.ok(parsed.altText.trim().length > 0);
        } else {
          assert.equal(parsed.altText, '');
        }
      }
    });

    it('blocks informative slots with empty alt text and decorative slots with non-empty alt text (ALT-2, ALT-3)', () => {
      const emptyInformative = MediaSlotReferenceSchema.safeParse({
        slotId: 'SLOT-06',
        versionId: 'ver_seed_06_home_hero_architecture',
        classification: 'informative',
        altText: '   ',
      });
      assert.equal(emptyInformative.success, false);

      const nonEmptyDecorative = MediaSlotReferenceSchema.safeParse({
        slotId: 'SLOT-05',
        versionId: 'ver_seed_05_home_hero_ambient',
        classification: 'decorative',
        altText: 'Should not have alt on decorative slot',
      });
      assert.equal(nonEmptyDecorative.success, false);
    });

    it('rejects javascript: and data: URLs while allowing http, https, mailto, tel, and internal routes (CMS-3)', () => {
      assert.equal(CmsUrlSchema.safeParse('/connect-with-us').success, true);
      assert.equal(CmsUrlSchema.safeParse('https://www.azaroth-techhive.com//docs').success, true);
      assert.equal(CmsUrlSchema.safeParse('mailto:info@azaroth.tech').success, true);
      assert.equal(CmsUrlSchema.safeParse('tel:+15550192834').success, true);
      assert.equal(CmsUrlSchema.safeParse('javascript:alert(1)').success, false);
      assert.equal(CmsUrlSchema.safeParse('JAVASCRIPT:evil()').success, false);
      assert.equal(CmsUrlSchema.safeParse('data:text/html,<script>alert(1)</script>').success, false);
    });

    it('validates all 18 seeded content scopes, 10 page SEO definitions, and forced-MFA initial Admin', () => {
      const payloads = buildSeedScopePayloads();
      const keys = Object.keys(payloads);
      assert.equal(keys.length, 18);
      for (const k of keys) {
        assert.equal(ScopeKeySchema.safeParse(k).success, true);
      }
      for (const seo of Object.values(SEED_PAGE_SEO)) {
        assert.equal(PageSeoSchema.safeParse(seo).success, true);
      }
      assert.equal(SEED_FIRST_ADMIN.role, 'admin');
      assert.equal(SEED_FIRST_ADMIN.forceMfaEnrollment, true);
    });
  });

  describe('SEC-2, PUB-3 & AUDIT-1a: SQL Migrations Verification', () => {
    it('verifies SQL migrations define least-privilege roles, append-only audit_logs, RLS, and transactional PL/pgSQL functions', () => {
      const m1 = fs.readFileSync(
        path.resolve(process.cwd(), 'db/migrations/001_roles_and_schema.sql'),
        'utf8'
      );
      const m2 = fs.readFileSync(
        path.resolve(process.cwd(), 'db/migrations/002_rls_policies.sql'),
        'utf8'
      );
      const m3 = fs.readFileSync(
        path.resolve(process.cwd(), 'db/migrations/003_publish_and_restore_functions.sql'),
        'utf8'
      );
      const m6 = fs.readFileSync(
        path.resolve(process.cwd(), 'db/migrations/007_rfq_details.sql'),
        'utf8'
      );
      const stagingSchema = fs.readFileSync(
        path.resolve(process.cwd(), 'scripts/setup-staging-schema.mjs'),
        'utf8'
      );

      assert.ok(m1.includes('azaroth_migrator'));
      assert.ok(m1.includes('azaroth_app'));
      assert.ok(m1.includes('azaroth_public_ro'));
      assert.ok(m1.includes('chk_med_inv_status_public_state'));

      assert.ok(m2.includes('CREATE OR REPLACE VIEW v_published_content'));
      assert.ok(m2.includes('REVOKE ALL ON audit_logs FROM azaroth_app'));
      assert.ok(m2.includes('GRANT SELECT, INSERT ON audit_logs TO azaroth_app'));
      assert.ok(m2.includes('ALTER TABLE content_documents ENABLE ROW LEVEL SECURITY'));

      assert.ok(m3.includes('CREATE OR REPLACE FUNCTION fn_commit_publish'));
      assert.ok(m3.includes('CREATE OR REPLACE FUNCTION fn_restore_revision_to_draft'));
      assert.ok(m3.includes('CREATE OR REPLACE FUNCTION fn_replace_asset_version_in_drafts'));
      assert.ok(m3.includes('WHERE r.is_current_published = FALSE'));
      assert.ok(m3.includes('OFFSET 19'));
      assert.match(m6, /ADD COLUMN IF NOT EXISTS rfq_details JSONB NOT NULL DEFAULT '\{\}'::jsonb/i);
      assert.match(stagingSchema, /rfq_details JSONB NOT NULL DEFAULT '\{\}'::jsonb/i);
    });
  });
});
