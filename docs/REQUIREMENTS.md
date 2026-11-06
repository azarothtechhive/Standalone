# Requirements Checklist (`REQUIREMENTS.md`)

Single authoritative checklist per Section 0 and Section 5 of `/docs/SPEC.md`.
Allowed statuses:
- `Not started`
- `In progress`
- `Done and verified` (with evidence from a command actually run)
- `Done but not verified`
- `Deferred` (with reason)

---

## Section 6 — Approved Brand Color Change (`[BRAND]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `BRAND-1` | P0 | Define plum (`#8E4585`) once as a primary brand token (CSS variable or theme value) and use the token everywhere. | In progress | Phase 2 design completed in `/docs/04-brand-and-visual-plan.md` §1; Phase 4 implementation |
| `BRAND-2` | P0 | Replace every maroon (`#7A0C16`) use: `theme-color` meta tag, buttons, links, borders, icons, gradients, highlights, hover/focus states, shadows, glows, selection colors, SVG fills/strokes. | In progress | Phase 1 inventory (`/docs/01-inventory.md` §5.1) + Phase 2 token mapping (`/docs/04-brand-and-visual-plan.md` §1.2); Phase 4 implementation |
| `BRAND-3` | P0 | Derive tints and shades of plum for every tint, shade, and opacity the original uses, keeping the same relative lightness steps and opacities. | In progress | Full relative lightness & 23-step opacity derivation table delivered in `/docs/04-brand-and-visual-plan.md` §1.2; Phase 4 implementation |
| `BRAND-4` | P0 | Keep text readable (target WCAG AA; white on `#8E4585` is ~6.3:1); check plum on dark backgrounds; report any failure in Phase 2 with smallest fix, never change silently. | In progress | Phase 2 WCAG 2.1 contrast audit completed & 2 contrast findings with smallest fixes reported in `/docs/04-brand-and-visual-plan.md` §2 |
| `BRAND-5` | P0 | Change no other color, layout, typography, spacing, or effect. | In progress | Enforced across all phases (`/docs/04-brand-and-visual-plan.md` & `/docs/09-architecture-change-log-and-scope.md`) |
| `BRAND-6` | P0 | List maroon baked into raster images or media in Phase 1 so user can supply replacements. | Done and verified | Verified via Playwright `<canvas>` pixel sampling & `sha256sum` on all 29 repo media files + inline WebP in `/docs/01-inventory.md` §5.2 |
| `BRAND-7` | P0 | Brand color is a code token, not a CMS field; no color picker in CMS. | Done and verified | Deleted `src/data/themePresets.ts` and removed CMS color picker & runtime CSS variable mutations from `AdminSettingsManager.tsx` and `CMSContext.tsx` (`ARCH-05`); verified via `npm run lint` and `npm run build` |
| `BRAND-8` | P0 | Test palette: token file holds production plum scale and test-only "legacy maroon" scale selected by compile-time flag (`VISUAL_TEST_PALETTE=legacy`); never runtime-settable; build check proves legacy scale is absent from prod bundle. | In progress | Designed in `/docs/04-brand-and-visual-plan.md` §1.3; Phase 4 implementation & Phase 7 build verification |

---

## Section 8 — Runtime and Portability (`[RT]`, Mode: `minimal`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `RT-1` | P0 | Vercel adapter and Vercel build in CI. | In progress | `/api/health.ts`, `/api/health/ready.ts`, and `/src/server/adapters/vercel/cachePurgeAdapter.ts` created in Phase 3; full CMS endpoints wired in Phase 4 |
| `RT-2` | P0 | Import-boundary lint: Class A imports no Class B or Node built-ins; no Vercel-specific API imported outside the adapter folder. | Done and verified | `/scripts/lint-runtime-boundaries.mjs` implemented & verified via `npm run lint:boundaries` and `npm test` (`3 Class A modules, 92 total src files verified; 0 boundary violations`) |
| `RT-3` | P0 | One cache module defining every `Cache-Control`, cache key, and tag, and one `purge` interface, with the Vercel adapter implemented. | Done and verified | `/src/server/core/cache.ts` and `/src/server/adapters/vercel/cachePurgeAdapter.ts` implemented & verified via `npm test` |
| `RT-4` | P0 | Contract tests for the `purge` interface against the Vercel adapter and an in-memory fake. | Done and verified | Contract tests in `/tests/phase3/phase3.test.ts` executed & passed via `npm test` (`passes CachePurgePort contract against InMemoryCachePurgeAdapter` & `VercelCachePurgeAdapter`) |
| `RT-5` | P0 | Headers, redirects, and CSP generated from a single source of truth (Vercel output). | Done and verified | `/src/config/securityHeaders.ts`, `/src/config/redirects.ts`, and `/scripts/generate-host-config.mjs` executed via `npm run generate:config` producing `/vercel.json`; verified in `npm test` |
| `RT-6` | P2 | Cloudflare adapter implementation and Cloudflare purge adapter (`minimal` portability mode -> P2). | Deferred | Deferred to R3 (P2) per Section 8 `minimal` mode |
| `RT-7` | P2 | Cloudflare output from generator, `wrangler` config, `_headers`, `_redirects` (`minimal` mode -> P2). | Deferred | Deferred to R3 (P2) per Section 8 `minimal` mode |
| `RT-8` | P2 | Wrangler dry-run build and both adapters in CI (`minimal` mode -> P2). | Deferred | Deferred to R3 (P2) per Section 8 `minimal` mode |
| `RT-9` | P2 | Cloudflare deployment guide (`minimal` mode -> P2). | Deferred | Deferred to R3 (P2) per Section 8 `minimal` mode |

---

## Section 10 — CMS, Publishing, and Media (`[CMS]`, `[ALT]`, `[PUB]`, `[MED]`)

### Content Editing (`[CMS]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `CMS-1` | P0 | Admin navigation mirrors the real site: one editor per page and per section (named as on original); shared editors for navigation, footer, and Site Settings. | In progress | Unmounted RFQ and 8 dead duplicate admin screens removed in Phase 3 (`ARCH-07`); full site-mirrored editor wiring in Phase 4 |
| `CMS-2` | P0 | Plain-text fields, or minimal rich-text editor only where original has formatting; server-side sanitization with allow-list of only tags/attributes original uses. | In progress | Designed in `/docs/02-audit-matrix.md` & `/docs/05-auth-security-and-runtime.md`; Phase 4 implementation |
| `CMS-3` | P0 | Links and buttons: label, destination (internal route or external URL), open-in-new-tab, visibility toggle only where original has one; validate URLs (`http`, `https`, `mailto`, `tel`, internal routes; reject `javascript:`); icons only from existing icon set. | In progress | Shared `CmsUrlSchema` and `CmsLinkOrButtonSchema` implemented in `/src/schemas/content.ts` & verified via `npm test` (rejects `javascript:` and `data:`); editor UI wired in Phase 4 |
| `CMS-4` | P0 | Repeatable items (cards, lists, slides, tabs, accordion, menu items): add, remove, drag-to-reorder within min/max counts accommodated by design. | In progress | Mapped per section in `/docs/02-audit-matrix.md`; Phase 4 implementation |
| `CMS-5` | P0 | Navigation and footer (menus, submenus, mobile menu, CTA, columns, links, socials, copyright) editable. | In progress | Seeded in `global:header` and `global:footer` scopes in `/src/seed/seedData.ts`; Phase 4 UI/API wiring |
| `CMS-6` | P0 | Existing third-party scripts and embeds (only if original has them): IDs and URLs configurable in Site Settings; add none that are missing. | In progress | Seeded in `global:settings` (`thirdPartyScripts.enabled = false`); Phase 4 Site Settings wiring |
| `CMS-7` | P1 | Forms (only if original has them; P1): validation, honeypot, rate limiting, duplicate-submit prevention, states, DB storage, read-only submissions view with CSV export (escape `=`, `+`, `-`, `@`; CSV polish P2), 12-month retention with Admin purge, privacy docs. Add none if original has none. | Deferred | P1 (R2) per Section 4 & Section 10 (`form_submissions` table created in `/db/migrations/001_roles_and_schema.sql`) |

### Alt Text and Decorative Images (`[ALT]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `ALT-1` | P0 | Classify every image slot in Phase 1 as informative or decorative; store alt text per usage (slot), not per file. | In progress | `media_slot_definitions` & `media_slot_usages` tables in `001_roles_and_schema.sql` and all 15 slots seeded in `/src/seed/seedData.ts`; verified via `npm test` |
| `ALT-2` | P0 | Informative slots: meaningful alt required, publish blocked if empty; images acting as links/buttons are informative and describe destination/action. | In progress | Enforced in `MediaSlotReferenceSchema` (`/src/schemas/content.ts`) and `fn_commit_publish` (`003_publish_and_restore_functions.sql`); verified via `npm test` |
| `ALT-3` | P0 | Decorative slots: render `alt=""` (present, empty), hidden from accessibility tree, shown in CMS as "Decorative image" indicator with no alt field; CSS backgrounds decorative unless informative with nearby text alternative. | In progress | Enforced in `MediaSlotReferenceSchema` and `MediaRenderer.tsx` (`decorative` prop rendering `alt=""` and `aria-hidden="true"`); CMS indicator wired in Phase 4 |
| `ALT-4` | P0 | Classification comes from original; changing classification is Admin-only with confirmation; list informative images lacking alt in Phase 1 for user to supply. | In progress | Admin+MFA RLS policy `p_app_slot_definitions_write` in `002_rls_policies.sql`; UI confirmation modal wired in Phase 4 |

### Workflow and Atomic Publish (`[PUB]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `PUB-1` | P0 | Separate draft and published content; authenticated non-public Live Preview serving draft media from private bucket via authenticated handler or short-lived signed GET, never from public bucket. | In progress | `content_documents` schema (`draft_payload` vs `published_payload`) created in `001_roles_and_schema.sql`; Live Preview handler wired in Phase 4 |
| `PUB-2` | P0 | One-click Publish; public site reads published, committed state only. | In progress | `v_published_content` view & `azaroth_public_ro` grants/RLS created in `002_rls_policies.sql`; public read handler wired in Phase 4 |
| `PUB-3` | P0 | Publish, restore, and revision pruning each run as a single DB transaction (e.g., PL/pgSQL function): validate draft, snapshot revision, update published content, prune beyond last 20 revisions (never current published); rollback on any failure. | Done but not verified | `fn_commit_publish` and `fn_restore_revision_to_draft` written in `/db/migrations/003_publish_and_restore_functions.sql` and verified structurally via `npm run db:migrate` & `npm test`; live Neon execution pending `DATABASE_URL_MIGRATOR` |
| `PUB-4` | P0 | Optimistic locking (version on each draft and page): reject stale writes with clear conflict message; idempotent publish (same draft version creates no duplicate revision). | Done but not verified | Implemented in `fn_commit_publish` (`VERSION_CONFLICT` exception & `digest_sha256` idempotent no-op return) in `003_publish_and_restore_functions.sql`; live DB test in Phase 7 |
| `PUB-5a` | P0 | Restoring a revision loads it into draft only (never auto-publishes); P0 minimal Admin-only restore-to-draft. | In progress | `fn_restore_revision_to_draft` implemented in `003_publish_and_restore_functions.sql`; API/UI wired in Phase 4 |
| `PUB-5b` | P1 | Revision list, view, and diff UI (no scheduled publishing). | Deferred | P1 (R2) per Section 4 & Section 10 |
| `PUB-6` | P0 | Publish-time validation blocks and names problem when: required field empty, URL invalid, referenced media version missing/trashed/not `ready`/not `public`, or informative image has empty alt. | In progress | Enforced in `/src/schemas/content.ts` and `fn_commit_publish` (`MEDIA_NOT_PUBLIC`, `MISSING_INFORMATIVE_ALT`); orchestrator wired in Phase 4 |
| `PUB-7` | P0 | Cache invalidation and SEO refresh run only after commit; on failure content stays published, failure is logged, shown on System Status & publish screen, and retried with backoff + manual retry. | In progress | `cache_purge_queue` table in `001_roles_and_schema.sql` & `CachePurgePort` adapters in `/src/server/core/cache.ts`; post-commit orchestrator wired in Phase 4 |
| `PUB-8` | P0 | Failure-injection tests for publish and restore run on disposable Neon branch or test DB, never production. | Not started | Phase 7 test execution |

### Media Integrity (`[MED]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `MED-1` | P0 | Immutable versions: content references version ID (never asset); Replace creates new version and moves draft references in one transaction while published/revisions keep earlier version; Media Library shows affected unpublished pages and allows Admin batch publish in one transaction. | In progress | `media_assets`, `media_versions`, and `fn_replace_asset_version_in_drafts` created in `/db/migrations/`; Phase 4 R2 & UI integration |
| `MED-2a` | P0 | Warn on significant aspect-ratio change and require confirmation; shared asset shows all usages and warns every draft usage changes. | In progress | `expected_aspect_ratio` & `aspect_ratio_tolerance` defined in `media_slot_definitions`; Phase 4 upload/replace handler |
| `MED-2b` | P1 | Admin can revert an asset to an earlier retained version (draft references only; history never edited). | Deferred | P1 (R2) per Section 10 |
| `MED-3` | P0 | Record every use of each version (drafts, published, revisions); Media Library shows "used in"; referenced version cannot be permanently deleted (offer replacement). | In progress | `media_slot_usages` with `ON DELETE RESTRICT` on `version_id` created in `001_roles_and_schema.sql`; Phase 4 UI/API integration |
| `MED-4a` | P0 | Soft delete & purge logic (part of reconciliation-core): unreferenced version goes to Trash, purged after 30 days by Admin; purge order marks `purging` -> deletes R2 private & public objects -> deletes DB record (retries on failure, never deletes DB record first). | In progress | Schema states (`trashed`, `purging`) created in `001_roles_and_schema.sql`; `RECON-CORE` handler wired in Phase 4 |
| `MED-4b` | P1 | Trash and purge Admin UI. | Deferred | P1 (R2) per Section 4 & Section 10 |
| `MED-5a` | P0 | Server-side validation of allowed types/sizes (max 5 MB image, 50 MB video); at P0 enable only media types the original site actually uses; auto-optimize/resize responsive variants; lazy-load below fold (never LCP); preserve slot dimensions/ratio/cropping; manage static assets (logos, favicon, inline SVGs). | In progress | DB constraint & `UploadInitRequestSchema` restrict P0 MIME types to `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml` and `byte_size <= 5242880`; `MediaRenderer.tsx` query-string bug fixed; Class B `sharp` processor wired in Phase 4 |
| `MED-5b` | P1 | Remaining allowed media types not used at launch (MP4, PDF). | Deferred | P1 (R2) per Section 4 & Section 10 (neither MP4 nor PDF used at launch) |
| `MED-6` | P0 | Bucket layout (`staging/`, `versions/{versionId}/...`, `trash/` in private; `pub/{versionId}/{variant}.{ext}` in public with unguessable version ID and immutable cache headers) and version states (`status` and `public_state`); published content references only `public_state = public`. | In progress | `chk_med_inv_status_public_state` constraint in `001_roles_and_schema.sql` & `CACHE_CONTROL_POLICIES.immutablePublicMedia` in `cache.ts`; R2 client wired in Phase 4 |
| `MED-INV` | P0 | Media exposure invariant: every version is M1 Private, M2 In-flight, M3 Published, or M4 Grace; public bucket contains only M2, M3, M4 within time bounds; draft-only/trashed/staging never in public bucket; trashing demotes public copy first. | In progress | Enforced in DB constraints (`001_roles_and_schema.sql`), RLS (`002_rls_policies.sql`), and `fn_commit_publish` (`003_publish_and_restore_functions.sql`); R2 promotion/reconcile wired in Phase 4 |
| `MED-7` | P0 | Publish sequence: 1. Pre-flight (read-only + private HEAD check), 2. Promote M1->M2 (`publish_attempt_id`, `promoting`, copy private->public without overwrite, verify HEAD+checksum, set `public`; compensate on failure), 3. Commit (atomic DB tx re-checking `public` and lock version; compensate on rollback), 4. Invalidate after commit. | In progress | Step 3 (`fn_commit_publish`) and Step 4 (`CachePurgePort`) implemented in Phase 3; full 4-step orchestrator wired in Phase 4 |
| `MED-8` | P0 | Staged, verified, compensated upload pipeline: `pending` record under `staging/`, short-lived presigned PUT (admin CORS only), server-side HEAD size check, magic-byte type check, SVG sanitization, image decode, checksum, variants, copy to `versions/{versionId}/...`, atomic `ready` update, best-effort cleanup on failure. | In progress | Schema & Zod schemas created in Phase 3; R2 presigned upload & `sharp` verification handlers wired in Phase 4 |
| `MED-9` | P0 | `RECON-CORE`: removes `pending`/`failed` records and `staging/` objects > 1h; demotes `promoting` > 1h and unreferenced `public` versions past grace period; retries `purging`; emits cron heartbeat; Admin manual trigger; `CRON_SECRET` auth; documents worst-case bound = scheduler interval + 1h. | In progress | `publish_attempts` & `system_heartbeats` tables created in `001_roles_and_schema.sql` and cron route configured in `/vercel.json`; handler wired in Phase 4 |
| `MED-10` | P1 | `RECON-REPORT`: detects R2 orphans and DB records with missing objects; reports in Media Library and System Status; evaluates R2 lifecycle rule expiring `staging/`. | Deferred | P1 (R2) per Section 4 & Section 10 |
| `MED-11` | P0 | Required media and publish test suite (delete referenced/unreferenced, replace shared asset, restore & re-promote superseded version, upload failure cleanup, mid/post-promotion failure injection & crash reconciliation, idempotent publish, MED-INV public bucket assertion, blocked publish checks). | Not started | Phase 7 test execution |

---

## Section 11 — Security Baseline (`[SEC]`, `[AUTH]`, `[AUDIT]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `SEC-1` | P0 | Deny by default; no DB/R2/service secrets in browser; every handler authenticates, checks role (and verified MFA for Admin), validates input with shared Zod schemas before touching Neon or R2. | In progress | Hardcoded plaintext credentials (`DEFAULT_ADMIN_USERS`) and `localStorage` JWTs removed from `src/services/authService.ts`; shared Zod schemas in `src/schemas/content.ts`; Better Auth handlers wired in Phase 4 |
| `SEC-2` | P0 | Least-privilege Postgres roles (migration, application, restricted read-only public role reading published data only); enable RLS on content tables as defense in depth and document exact RLS vs app enforcement matrix. | Done but not verified | Implemented in `/db/migrations/001_roles_and_schema.sql` and `/db/migrations/002_rls_policies.sql` (`azaroth_migrator`, `azaroth_app`, `azaroth_public_ro`, `v_published_content`, RLS policies); verified structurally in `npm test` (`live DB execution pending DATABASE_URL_MIGRATOR`) |
| `SEC-3` | P0 | CSP and standard security headers (`HSTS`, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`) compatible with original 3P scripts and R2 public domain. | Done and verified | Implemented in `/src/config/securityHeaders.ts`, generated into `/vercel.json`, mounted in `/server.ts`, and verified via `npm test` |
| `SEC-4` | P0 | Sanitized rich text and SVG; escape all output; CSRF-safe, origin-checked handlers. | In progress | `javascript:`/`data:` URL rejection verified in `npm test`; SVG & HTML sanitizer wired in Phase 4 |
| `SEC-5` | P0 | Rate limiting on login, password reset, MFA, uploads, and public form endpoints. | In progress | Specified in `/docs/05-auth-security-and-runtime.md` §1.2; Phase 4 implementation |
| `SEC-6` | P0 | Secrets only in host env vars; documented rotation for all keys/tokens; minimum-scoped R2/Cloudflare tokens; separate backup credentials; short-lived single-key presigned URLs. | In progress | Documented in `/.env.example` (`HOST-3`) and `/docs/07-observability-backup-and-recovery.md` §5 |
| `AUTH-1a` | P0 | Mandatory Admin MFA: Admin reaches no admin screen until TOTP MFA is enrolled and verified in session; seeded first admin forced to enroll on first login; recovery codes + documented audited lost-authenticator break-glass procedure; login throttling/backoff, server-side password policy, session expiry/revocation. | In progress | `users`, `sessions`, `accounts`, `two_factors`, `password_reset_tokens` tables in `001_roles_and_schema.sql` and `SEED_FIRST_ADMIN` (`forceMfaEnrollment = true`) in `src/seed/seedData.ts`; Better Auth + TOTP UI/API wired in Phase 4 |
| `AUTH-1b` | P1 | Editor MFA toggle in Site Settings. | Deferred | P1 (R2) per Section 4 & Section 11 |
| `AUDIT-1a` | P0 | Append-only audit table (enforced by DB permissions) with writes at P0 for login, MFA changes, publish, restore, delete, role/user changes, permanent media deletion, classification changes, and Site Settings changes. | In progress | `audit_logs` table + `REVOKE ALL ON audit_logs FROM azaroth_app; GRANT SELECT, INSERT ON audit_logs TO azaroth_app` in `001`/`002` + transactional writes in `003`; verified in `npm test` |
| `AUDIT-1b` | P1 | Audit Log UI screen in Admin panel. | Deferred | P1 (R2) per Section 4 & Section 11 |
| `SEC-7` | P0 | `npm audit` executed and reported in final report. | Not started | Phase 7 |

---

## Section 12 — Hosting and Deployment Files (`[HOST]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `HOST-1` | P0 | Vercel `vercel.json` with security headers, CSP, 301 redirects, non-shadowing rewrites, cache headers, `crons` within confirmed plan; justified Node function config; documented build settings and env vars. | Done and verified | `/vercel.json` generated via `npm run generate:config` from `/scripts/generate-host-config.mjs` and verified via `npm test` |
| `HOST-2` | P2 | Cloudflare config files (`wrangler.jsonc`, `public/_headers`, `public/_redirects`, R2 CORS JSON, custom-domain/cache settings, purge call, cron triggers, Workers limitations). | Deferred | P2 (R3) under `minimal` portability mode |
| `HOST-3` | P0 | Shared `.env.example` listing every variable with description and no values, server-only marked. | Done and verified | Written to `/.env.example` with `[SERVER-ONLY]` annotations and empty string values |
| `HOST-4a` | P0 | `/docs/deployment-vercel.md` covering Neon setup, migrations, idempotent seed, R2 buckets/CORS/custom domain, env vars, first admin forced MFA, DNS, rollback. | In progress | Architecture designed in `/docs/06-hosting-and-deployment.md`; full operational guide written in Phase 4 |
| `HOST-4b` | P2 | `/docs/deployment-cloudflare.md` deployment guide. | Deferred | P2 (R3) under `minimal` portability mode |
| `HOST-5` | P0 | Never claim a deployment works unless actually deployed and checked. | In progress | Enforced rule (`HR-6`) |

---

## Section 13 — Observability, Alerting, and Cost Risk (`[OBS]`, `[COST]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `OBS-1` | P0 | Shared structured JSON logger for every handler and job with default secret/PII redaction and redaction unit tests; document log viewing and retention per plan. | Done and verified | Implemented in `/src/server/core/logger.ts` and verified by unit tests in `/tests/phase3/phase3.test.ts` (`npm test` -> `ok 1 - OBS-1: Structured JSON Logger & Recursive Secret Redaction`) |
| `OBS-2` | P0 | Health endpoints: `GET /api/health` (cheap liveness, build version) and `GET /api/health/ready` (deep: Neon trivial query + R2 HEAD with timeout, protected by secret header); document monitor intervals and Neon scale-to-zero cost impact. | Done and verified | Implemented in `/src/server/core/health.ts`, `/api/health.ts`, `/api/health/ready.ts`, and `/server.ts`; verified by 4 unit tests in `/tests/phase3/phase3.test.ts` (`npm test` -> `ok 3 - OBS-2`) |
| `OBS-3` | P1 | Error monitoring (Sentry free tier or approved equivalent) for server and admin panel only, with PII scrubbing and sourcemaps; never on public site. | Deferred | P1 (R2) per Section 4 & Section 13 (designed in `/docs/07-observability-backup-and-recovery.md` §3) |
| `OBS-4` | P1 | Alerting on two independent channels (Resend email + `ALERT_WEBHOOK_URL`) with deduplication and rate limiting. | Deferred | P1 (R2) per Section 4 & Section 13 (designed in `/docs/07-observability-backup-and-recovery.md` §3) |
| `COST-1` | P0 | Cost and plan risk register (`/docs/08-cost-and-plan-risks.md` in Phase 2) with verified findings, cited official docs, impact, fallback, and monthly cost estimates. | Done and verified | Delivered in `/docs/08-cost-and-plan-risks.md` with official vendor citations for Vercel (`4.5 MB` body limit, Hobby daily cron, Hobby non-commercial restriction), Neon (`100 CU-hrs/mo`, `6h` / `1 GB` WAL PITR), and Cloudflare R2 (no native S3 versioning, custom domain DNS zone requirement) |

---

## Section 14 — Backup and Recovery (`[BAK-1]`..`[BAK-5]`, `[REC]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `BAK-1` | P0 | Verify and document Neon PITR window for confirmed plan from official docs; RPO claim may not exceed it. | Done and verified | Verified from official Neon Plan documentation (`6 hours` history window capped at `1 GB` WAL on Neon Free Tier) in `/docs/07-observability-backup-and-recovery.md` §4.1 and `/docs/08-cost-and-plan-risks.md` (`RISK-05`) |
| `BAK-2` | P0 | Scheduled logical dump of Neon (`pg_dump` on runner with binary, e.g., GitHub Actions), encrypted, stored in backup destination with separate credentials, retention policy, and success heartbeat. | In progress | Designed in `/docs/07-observability-backup-and-recovery.md` §4.2; workflow implemented in Phase 4 |
| `BAK-3` | P0 | Scheduled sync of private bucket (`versions/`) to backup destination using separate credentials (verify R2 native versioning from official docs), with success heartbeat. | In progress | Verified R2 lacks native S3 versioning (`PutBucketVersioning` unsupported) and designed append-only `versions/` sync to `BACKUP_R2_BUCKET` in `/docs/07-observability-backup-and-recovery.md` §4.1 & §4.3; implemented in Phase 4 |
| `BAK-4` | P0 | R1 Go-Live Gate: Execute one restore drill before go-live (restore dump to disposable Neon branch, verify row counts/boot/publish, restore sample R2 objects & reconcile, record time in `/docs/runbook.md`), or mark Not verified and downgrade recovery claim. | In progress | Step-by-step drill procedure designed in `/docs/07-observability-backup-and-recovery.md` §4.4; executed in Phase 7 |
| `BAK-5` | P1 | Alerts on stale/failed backups, scheduled recurring drill, and encryption key rotation. | Deferred | P1 (R2) per Section 4 & Section 14 |
| `REC-1` | P0 | Recovery runbook (`/docs/runbook.md`) written against implemented backups with owner roles and verification steps for all 7 failure scenarios. | In progress | Outlined in `/docs/07-observability-backup-and-recovery.md` §5; `/docs/runbook.md` written in Phase 4 & finalized in Phase 7 |
| `REC-2` | P0 | Verified-claims rule: RTO and RPO figures labelled "verified" only if measured in drill or derived from documented plan limit; otherwise "target, unverified". Proposed in Phase 2. | In progress | Proposed RTO (`<= 30m`, `target, unverified`) and RPO (`<= 1m` within 6h/1GB WAL window `derived from documented Neon Free Tier plan limit`; `<= 6h` catastrophic dump RPO `target, unverified`) in `/docs/07-observability-backup-and-recovery.md` §4.5 |

---

## Section 15 — SEO and Crawler-Visible Rendering (`[SEO]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `SEO-1` | P0 | Per-page title, meta description, OG tags, robots directive, and favicon CMS-managed and seeded from verified facts; `theme-color` uses plum token; canonical URLs derived from `SITE_URL` + path. | In progress | Designed in `/docs/06-hosting-and-deployment.md` §1.2; Phase 4 implementation |
| `SEO-2` | P0 | Choose, document, and implement one crawler-visible HTML metadata/content strategy (prefer Option A: edge/function injection with `s-maxage` + `stale-while-revalidate` and purge on publish). | In progress | Option A chosen and documented in `/docs/06-hosting-and-deployment.md` §1.2; Phase 4 implementation |
| `SEO-3` | P0 | Document purge-path delay and no-purge worst-case TTL delay; measure median and worst of >=10 trials on primary host when deployed. | In progress | Documented both delay numbers (Purge-path target `<= 2s` unverified; No-purge `s-maxage=3600s` / `1h` freshness + `86400s` SWR = `25h` max expiry) in `/docs/06-hosting-and-deployment.md` §1.3; trials in Phase 7 |
| `SEO-4` | P0 | Short SEO strategy note covering crawler HTML delivery, freshness numbers, post-commit cache invalidation, draft isolation, and verification steps. | Done and verified | Delivered in `/docs/06-hosting-and-deployment.md` §1.1–1.4, backed by baseline `/qa-tools/verify-seo-html.mjs` execution |
| `SEO-5` | P0 | Preserve every existing URL of live site (301 for any change); provide `robots.txt` and auto-generated `sitemap.xml` of published pages with accurate `lastmod`. | In progress | All 12 permanent 301 redirects implemented in `/src/config/redirects.ts`, `/vercel.json`, and `/server.ts`; dynamic `sitemap.xml` wired in Phase 4 |
| `SEO-6` | P0 | Verification script (`curl` with crawler and social-bot user agents) confirming raw HTML metadata on public pages + tests proving published updates appear and drafts never do. | In progress | Baseline `/qa-tools/verify-seo-html.mjs` executed in Phase 1; post-CMS publish/draft isolation assertions added in Phase 4/7 |

---

## Section 16 — Performance (`[PERF]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `PERF-1` | P0 | Phase 1 standalone script and Lighthouse CI config in `/qa-tools/` measuring `https://standalone-omega-one.vercel.app/` and all public URLs found, with exact settings. | Done but not verified | Delivered `/qa-tools/measure-baseline.mjs`, `lighthouserc.mobile.json`, `lighthouserc.desktop.json`, `verify-seo-html.mjs` (executed & verified), and `README.md`; `lighthouse` CLI not installed in container (`Config provided, not run`) |
| `PERF-2` | P1 | Comparison runs under identical conditions (mobile Slow 4G 4x CPU and desktop, >=5 runs per page/preset, cold/warm cache + cold Neon start, logged out). | Deferred | P1 (R2) per Section 4 ("Lighthouse comparison runs") |
| `PERF-3` | P1 | Meet performance targets (LCP, TBT, transfer size within 10% of baseline; CLS <= 0.1; CWV thresholds; LH score within 5 pts). | Deferred | P1 (R2) per Section 4 |
| `PERF-4` | P0 | Public bundle excludes all admin code (route-level splitting, bundle size reported); batched edge-cacheable content request per page with no waterfalls/CLS; R2 custom domain immutable cache headers; preload LCP image and fonts where original does. | In progress | Route-level `React.lazy` code-splitting of all 14 `/admin/*` screens implemented in `src/App.tsx` and verified in `npm run build` chunk manifest; batched content fetch wired in Phase 4 |
| `PERF-5` | P0 | Mark each performance target Verified (measured, with figures), Config provided not run, or Not verified. | In progress | Tracked in Phase 1 (`/docs/01-inventory.md` §8) and Phase 7 final report |

---

## Section 17 — Seed, Operations, and Code Quality (`[SEED]`, `[OPS]`, `[CODE]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `SEED-1` | P0 | Idempotent seed loading exact content and media from live site and source into Neon and R2 (`ready` and `public` via promotion code path, with Phase 1 alt/decorative classification) + documented first-admin forced MFA step. | Done but not verified | Implemented in `/src/seed/seedData.ts` and `/scripts/db-seed.mjs` (18 content scopes, 15 media slots, `ed8b925f9c0d185d4053d8782fb45a815a98e1a5b3c8a100369a3f60b135bef2` SHA-256 digest, `SEED_FIRST_ADMIN.forceMfaEnrollment = true`); validated locally via `npm run db:seed` & `npm test` (live DB upsert pending `DATABASE_URL_MIGRATOR`) |
| `OPS-1` | P0 | Custom 404 matching design with text editable in Site Settings; error boundaries and skeletons; no client secrets; semantic HTML, keyboard nav, visible focus, contrast, iOS safe areas, responsive public + admin. | In progress | Mapped in `/docs/02-audit-matrix.md`; Phase 4/6 implementation |
| `CODE-1` | P0 | Feature-based folders separating public UI, admin UI, server handlers/adapters, data access, storage, media, schemas, types, migrations, observability; centralized data layer; shared Zod schemas; HR-7 preservation. | In progress | Architecture and `HR-7` change log documented in `/docs/05-auth-security-and-runtime.md` §3.1 & `/docs/09-architecture-change-log-and-scope.md` §1; Phase 3–7 |
| `CODE-2` | P0 | Comprehensive `README.md` covering architecture, setup, seeding, deployment, backups/recovery, publish/promotion, media integrity, upload pipeline, SEO, security, observability, and adding editable fields. | Not started | Phase 7 |

---

## Section 18 — Testing and Visual Review (`[QA]`, `[VIS]`)

| ID | Tier | Requirement Summary | Status | Evidence / Notes |
|---|---|---|---|---|
| `QA-1a` | P0 | Playwright smoke suite (public pages, login with forced MFA, edit, preview, publish, persistence after refresh) configured for Chromium, Firefox, and WebKit. | Not started | Phase 7 |
| `QA-1b` | P1 | Playwright full suites beyond smoke (every button and link, forms if any, revision restore, media replacement, role permissions). | Deferred | P1 (R2) per Section 4 & Section 18 |
| `QA-2` | P0 | Publish-integrity and media-integrity tests from Section 10 against disposable Neon branch and separate test R2 bucket. | Not started | Phase 7 |
| `QA-3` | P0 | Security test suite (unauthenticated access, Admin MFA enforcement, Editor role limits, public DB role draft isolation, upload type/size rejection, presigned URL scope/expiry, XSS/SVG/URL sanitization, cookies/session fixation, log redaction). | Not started | Phase 7 |
| `QA-4` | P0 | Runtime tests per `minimal` portability mode (import-boundary lint, purge contract tests, header/redirect generation, legacy-palette absence from prod bundle). | Not started | Phase 7 |
| `QA-5` | P0 | Run lint, type-check, production build, and `npm audit` and report results with bundle size; run `vercel build` if possible or mark "Config provided, not run". | Not started | Phase 7 |
| `QA-6` | P1 | Manual real-device checklist, social-share preview check, and screen-reader spot check of informative vs decorative images (extras in P2). | Deferred | P1 (R2) / P2 (R3) per Section 4 & Section 18 |
| `VIS-1` | P0 | Visual regression workflow & human visual-review gate (baselines at 1920, 1440, 1024, 768, 390 px; legacy maroon palette comparison; masked-regions registry; HTML diff report; plum code scan, contrast check & screenshots; human approval before Phase 6 closes; visual-regression polish is P2). | In progress | Visual-regression plan & masked-regions registry delivered in `/docs/04-brand-and-visual-plan.md` §5; executed in Phase 6 |
| `QA-7` | P0 | Final report marking every requirement ID as Verified (how), Written but not run, or Not verified. | Not started | Phase 7 |
