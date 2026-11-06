# Project Progress, Decisions, Assumptions & Open Questions (`PROGRESS.md`)

## Current State
- **Phase:** Phase 3 — Scope Correction and Data Model (**Completed; awaiting user acceptance before starting Phase 4 — CMS Integration**).
- **Gate 1 & Gate 2 Status:** Both Gate 1 (`"proceed"`) and Gate 2 (`"approved"`) approved by user.

---

## 1. Environment Capabilities (Verified via Shell on 2026-10-31 / 2026-11-01)

| Capability | Status in Agent Container | Details / Verification Evidence |
|---|---|---|
| **Shell (`bash`)** | **Can run** | Linux container (`/app/applet`), `node v22.23.4`, `npm 10.9.9`, `bun 1.4.4`, `npx`/`tsx` available. |
| **Live Site & GitHub Repo Access** | **Can run** | `https://standalone-omega-one.vercel.app/` (`HTTP/2 200`) and `https://github.com/yasrahgroup/Standalone.git` (`026b300`) synced into `/app/applet`. |
| **Headless Browser & `playwright-cli`** | **Can run (Chromium only)** | `/usr/local/bin/playwright-cli` (`0.1.22`) + headless Chromium (`/ms-playwright/chrome-headless-shell-linux64`) executed against `https://standalone-omega-one.vercel.app/`. |
| **Playwright Multi-Browser (`firefox`, `webkit`)** | **Cannot run locally** | Container only has headless Chromium installed; Firefox and WebKit binaries are not installed in the container image. |
| **Lighthouse / `@lhci/cli`** | **Not installed in container** | `command -v lighthouse` not found. Delivered standalone `/qa-tools/measure-baseline.mjs`, `lighthouserc.mobile.json`, and `lighthouserc.desktop.json` with exact run instructions in `/qa-tools/README.md`. |
| **Live Neon Postgres / Cloudflare R2 Credentials** | **Not configured in container env** | `DATABASE_URL_*` and `R2_*` env vars are not set in the local preview container. `npm run db:migrate` and `npm run db:seed` execute structural/schema validation in dry-run mode locally (`HR-6`) and execute live SQL when `DATABASE_URL_MIGRATOR` is provided. |
| **`pg_dump` / Postgres Client CLI** | **Cannot run locally (not installed)** | `command -v pg_dump` not found. `BAK-2` logical dump automation targets GitHub Actions runners (`postgresql-client`). |
| **Deploys (`vercel`, `wrangler`)** | **Cannot run locally** | Neither CLI nor deployment credentials are present in the container. |

---

## 2. Confirmed Pre-Flight Settings & Recorded Assumptions (Section 1)

1. **Portability Mode:** `minimal` (default). Class A / Class B boundary lint, single cache module + `purge` contract tests, and single source of truth for headers/redirects/CSP are **P0 (R1)**; Cloudflare adapter, `wrangler.jsonc`, `_headers`, `_redirects`, and Cloudflare deployment guide are **P2 (R3)**.
2. **Primary Production Host:** **Vercel**; image processing runs on a **Vercel Node function** (Class B, `sharp`).
3. **Repository Host & CI:** **GitHub** (used for CI and scheduled `BAK-2`/`BAK-3`/`RECON-CORE` runner).
4. **Neon, Vercel, and Cloudflare Plans:** Assumed lowest/free tiers; limits and commercial-use terms verified from official docs with cited sources in `/docs/08-cost-and-plan-risks.md`.
5. **Production Domain:** Undecided -> All canonical URLs, sitemap URLs, OG URLs, CORS origins, and CSP entries derived from a single `SITE_URL` environment variable.
6. **R2 Public Bucket Domain:** Served on a custom domain on a Cloudflare zone in production (`r2.dev` for development/staging only).
7. **CMS Users:** 1 to 5 users.
8. **Backup Destination:** A **separate R2 bucket under separate credentials** (`BACKUP_R2_BUCKET`).
9. **Error Monitoring:** Pre-approved for server code and Admin panel only (P1); never on the public site.
10. **Alert Channels:** Two independent channels (P1): email via Resend to `NOTIFY_EMAIL` + `ALERT_WEBHOOK_URL`.
11. **Authentication Trade-offs:** Pre-decided per Section 7 (vetted library `better-auth` + `twoFactor` plugin with Neon DB sessions, email/password + single-use reset tokens, mandatory TOTP MFA with recovery codes for Admin at P0, `argon2id`/`scrypt`, `httpOnly`/`Secure`/`SameSite=Lax` cookies, Node-only Class B endpoints on Vercel pre-approved).

---

## 3. Running Log of Work Completed

- **2026-10-31 (Phase 1 — Anchoring & Inventory Complete; Approved by User at Gate 1):**
  - Created `/docs/SPEC.md` verbatim (`sha256: e0e4e630807b2496cfceeee78a7054590dfdecca9ace5a70fcefc2bebfbcdef3`).
  - Created `/docs/00-rules-card.md` (31 lines), `/docs/REQUIREMENTS.md`, `/docs/PROGRESS.md`, `/docs/01-inventory.md`, and `/qa-tools/`.
  - User approved Gate 1 (`"proceed"`).
- **2026-11-01 (Phase 2 — Design and Audit Complete; Approved by User at Gate 2):**
  - Delivered `/docs/02-audit-matrix.md` through `/docs/09-architecture-change-log-and-scope.md`.
  - User approved Gate 2 (`"approved"`).
- **2026-11-01 (Phase 3 — Scope Correction and Data Model Complete):**
  - Synced `https://github.com/yasrahgroup/Standalone.git` (`026b300`) into `/app/applet` while preserving `/docs/` and `/qa-tools/`.
  - **Scope Correction & Dead/Disallowed Code Removal (`ARCH-05`, `ARCH-07`, `BRAND-7`, `SEC-1`, `PERF-4`):**
    - Removed unmounted legacy RFQ module (`RequestQuote.tsx`, `RfqWizard.tsx`, `AdminCRMRfqs.tsx`, `AdminRFQs.tsx`) and `/admin/rfqs` route/links.
    - Removed 8 duplicate dead admin files (`AdminEnquiries.tsx`, `AdminInsights.tsx`, `AdminNavigation.tsx`, `AdminPortfolio.tsx`, `AdminProducts.tsx`, `AdminServices.tsx`, `AdminSettings.tsx`, `AdminTestimonials.tsx`) and legacy Vitest files (`src/test/`, `SlaMatrix.test.tsx`).
    - Removed `src/data/themePresets.ts`, runtime CSS variable overrides (`root.style.setProperty`), and the CMS color picker (`BRAND-7`).
    - Removed all 5 hardcoded plaintext passwords (`DEFAULT_ADMIN_USERS`) and `localStorage` JWT tokens from `src/services/authService.ts` (`SEC-1`, `SEC-6`).
    - Converted all 14 `/admin/*` screens in `src/App.tsx` to `React.lazy` + `<Suspense>` (`PERF-4`) and changed `/service` to `<Navigate to="/services" replace />` (`SEO-5`).
    - Fixed `MediaRenderer.tsx` query-string URL extension bug and added `decorative` prop (`alt=""` and `aria-hidden="true"`, `ALT-3`).
  - **Migrations, Roles, RLS & Transactional PL/pgSQL Functions (`SEC-2`, `PUB-3`–`PUB-6`, `MED-1`–`MED-7`, `AUDIT-1a`):**
    - Created `/db/migrations/001_roles_and_schema.sql`, `/db/migrations/002_rls_policies.sql`, `/db/migrations/003_publish_and_restore_functions.sql`, and `/scripts/db-migrate.mjs`.
  - **Idempotent Seed & Shared Zod Schemas (`SEED-1`, `ALT-1`–`ALT-4`, `CMS-3`):**
    - Created `/src/schemas/content.ts`, `/src/seed/seedData.ts`, and `/scripts/db-seed.mjs` covering all 18 content scopes, all 15 media slots (`SLOT-01`–`SLOT-15`, 12 informative + 3 decorative), 10 page SEO definitions, and forced-MFA initial Admin (`SEED_FIRST_ADMIN.forceMfaEnrollment = true`).
  - **Observability, Health, Cache & Runtime Boundaries (`OBS-1`, `OBS-2`, `RT-2`–`RT-5`, `HOST-1`, `HOST-3`):**
    - Created `/src/server/core/logger.ts` (recursive secret/URI/Bearer/AWS/presigned/cookie redaction), `/src/server/core/cache.ts`, `/src/server/adapters/vercel/cachePurgeAdapter.ts`, `/src/server/core/health.ts`, `/api/health.ts`, `/api/health/ready.ts`, `/server.ts`, `/scripts/lint-runtime-boundaries.mjs`, `/scripts/generate-host-config.mjs`, `/vercel.json`, and `/.env.example`.
  - **Verification Commands Executed & Passed (`HR-6`):**
    - `npm run generate:config` -> Generated `/vercel.json` (12 301 redirects, 4 header rule sets, non-shadowing rewrites, daily Hobby cron).
    - `npm run db:migrate` -> Verified 3 SQL migration files on disk (dry-run mode; live execution requires `DATABASE_URL_MIGRATOR`).
    - `npm run db:seed` -> Validated 18 content scopes, 15 media slots, and initial Admin user (`sha256: ed8b925f9c0d185d4053d8782fb45a815a98e1a5b3c8a100369a3f60b135bef2`; dry-run mode; live DB upsert requires `DATABASE_URL_MIGRATOR`).
    - `npm run lint` (`npm run lint:boundaries && npm run typecheck`) -> Passed with 0 boundary violations and 0 TypeScript errors.
    - `npm test` (`node --import tsx --test tests/phase3/phase3.test.ts`) -> Passed all 15 tests across 8 suites (`0 failures`).
    - `npm run build` (`vite build`) -> Built production bundle in `1.44s` with all 14 Admin screens split into separate lazy chunks.
