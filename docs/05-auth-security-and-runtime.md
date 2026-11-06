# Phase 2 Deliverable — Authentication, Security Baseline & Runtime Portability Design (`/docs/05-auth-security-and-runtime.md`)

Covers requirements: `RT-1`–`RT-9` (Mode: `minimal`), `SEC-1`–`SEC-7`, `AUTH-1a`, `AUTH-1b`, `AUDIT-1a`, `AUDIT-1b`.

---

## 1. Authentication Design & Vetted Library Comparison (`[AUTH-1a]`, `[AUTH-1b]`)

### 1.1 Evaluation of Vetted Libraries Against Section 7 Requirements

| Requirement | **Better Auth (`better-auth` v1.x + `twoFactor` plugin)** *(Selected)* | **Auth.js (`@auth/core` v0.37+)** | **Lucia v3 + `@oslojs/crypto` / `@oslojs/otp`** |
|---|---|---|---|
| **Active Maintenance Status (Verified)** | **Actively maintained** (official successor ecosystem recommended by Lucia's creator; native TypeScript). | Actively maintained, but oriented around OAuth providers; Credentials + custom DB sessions + TOTP require manual wiring. | **Deprecated** (Lucia v3 was officially deprecated in late 2024 / March 2025 in favor of documentation/Better Auth). |
| **Neon Postgres Database Sessions** | **Built-in** (`session` table in Postgres via Drizzle/Kysely/pg pool; server-side revocation & expiry). | Supported via adapter, but defaults to stateless JWE unless overridden in callbacks. | Custom implementation required. |
| **Email & Password (`argon2id` / `scrypt`)** | **Built-in** (`scrypt` default or custom `argon2id` hash/verify hook in Node Class B). | Requires manual password hashing and credential authorize hook. | Requires manual implementation. |
| **Mandatory TOTP MFA + Recovery Codes (`AUTH-1a`)** | **Built-in first-party `twoFactor` plugin** (`totpURI` generation, `verifyTotp`, encrypted secret storage, and single-use `backupCodes` generation/verification). | Not built-in; requires custom TOTP tables, crypto, and middleware state machine. | Requires manual implementation with `@oslojs/otp`. |
| **Cookie Security (`httpOnly`, `Secure`, `SameSite=Lax`)** | **Built-in** with CSRF origin verification and session rotation on login/MFA elevation. | Built-in. | Manual cookie serialization. |
| **Vercel Class B Node Compatibility (`minimal` mode)** | Runs cleanly inside our pre-approved **Class B Node auth handler** (`/api/auth/[...all]`). | Compatible. | Compatible. |

**Recommendation for Gate 2 Confirmation:** **Better Auth (`better-auth` with `twoFactor` plugin)** backed by Neon Postgres and running in the pre-approved Class B Node auth endpoint on Vercel.

### 1.2 Mandatory Admin MFA Enforcement State Machine (`[AUTH-1a]`)
1. **First Login of Seeded Admin:**
   - `SEED-1` creates the initial `admin` user with `two_factor_enabled = FALSE` and `force_mfa_enrollment = TRUE`.
   - Upon valid email + password login, the server creates a restricted pre-MFA session (`mfa_verified = FALSE`) valid for 10 minutes and permits **only** `/api/auth/mfa/setup` and `/api/auth/mfa/verify-setup`.
   - The admin UI redirects to `/admin/mfa-setup`, displays the TOTP QR code (`otpauth://totp/Azaroth%20CMS:...`) and secret, verifies one live 6-digit TOTP code before enabling MFA (`two_factor_enabled = TRUE`, `mfa_verified = TRUE`), displays **10 single-use recovery codes** once for download/copy, and writes an `audit_logs` entry (`auth.mfa_enrolled`).
2. **Subsequent Admin Logins:**
   - Password verification creates a session with `mfa_verified = FALSE`.
   - Every `/api/admin/*` handler runs `requireAuthenticatedSession()` which checks:
     - Session exists in Neon and `expires_at > NOW()`.
     - If `user.role === 'admin'`, **both** `user.two_factor_enabled === TRUE` **and** `session.mfa_verified === TRUE` are strictly enforced server-side (`HTTP 403 MFA_REQUIRED` if either is false).
     - At P1 (`AUTH-1b`), if Site Settings `requireEditorMfa = true`, the same check applies to `role === 'editor'`.
3. **Login Throttling, Password Policy & Session Expiry:**
   - **Password Policy (Server-side Zod + handler check):** Minimum 12 characters, max 128 characters, must not contain user email or common breached passwords.
   - **Throttling & Lockout (`SEC-5`):** Per-IP and per-account rate limiting (`5` failed attempts within 15 minutes locks the account for 15 minutes with exponential backoff and logs `auth.lockout` to `audit_logs`).
   - **Session Lifecycle:** Idle timeout `8 hours`, absolute expiry `24 hours` for `admin` (`7 days` for `editor`), immediate server-side deletion of `sessions` rows on logout, password change, role change, or MFA reset.
4. **Lost-Authenticator Break-Glass Procedure (`[AUTH-1a]`):**
   - **Tier 1 (Self-Service via Single-Use Recovery Code):** Admin selects *"Use a recovery code"* at the MFA prompt; the server verifies and consumes the single-use code, marks `mfa_verified = TRUE`, logs `auth.mfa_recovery_code_used` to `audit_logs`, and prompts to rotate TOTP if needed.
   - **Tier 2 (Another Admin):** If 2+ admins exist, an active MFA-verified Admin can trigger *"Require MFA Re-Enrollment"* for the locked user in `/admin/users` (revokes all sessions, clears `two_factors`, sets `force_mfa_enrollment = TRUE`, and writes `auth.mfa_reset_by_admin` to `audit_logs`).
   - **Tier 3 (Sole-Admin CLI Break-Glass Runbook):** If the sole Admin loses both their authenticator device and recovery codes, an operator with Neon migration credentials runs `npm run auth:break-glass -- --email <admin@domain> --reason "<ticket>"`, which connects to Neon, revokes all sessions for that user, deletes their `two_factors` row, sets `force_mfa_enrollment = TRUE`, and inserts a non-deletable `audit_logs` record (`auth.break_glass_cli_reset`).

---

## 2. Security Baseline, Least-Privilege Postgres Roles & RLS Matrix (`[SEC-1]`–`[SEC-6]`)

### 2.1 Three Least-Privilege Postgres Roles (`[SEC-2]`)

| Postgres Role | Connection Env Var | Granted Permissions | Used By |
|---|---|---|---|
| `azaroth_migrator` | `DATABASE_URL_MIGRATOR` | DDL (`CREATE`, `ALTER`, `DROP`), role/policy management, owns tables and PL/pgSQL `SECURITY DEFINER` publish/restore functions. | CI/CD migrations (`npm run db:migrate`) and Tier 3 break-glass CLI only. Never present in Vercel runtime env vars. |
| `azaroth_app` | `DATABASE_URL_APP` | `SELECT, INSERT, UPDATE, DELETE` on application tables; `SELECT, INSERT` **only** on `audit_logs` (no `UPDATE`, `DELETE`, or `TRUNCATE`); `EXECUTE` on transactional publish/restore functions. | Authenticated `/api/admin/*`, `/api/auth/*`, and `/api/internal/reconcile` handlers. |
| `azaroth_public_ro` | `DATABASE_URL_PUBLIC` | `SELECT` **only** on `v_published_content` (or RLS-filtered `content_documents` published columns) and `media_versions` where `status = 'ready' AND public_state = 'public'`. Zero access to `users`, `sessions`, `two_factors`, `audit_logs`, `publish_attempts`, `revisions`, or `draft_payload`. | Public content read API (`/api/public/*`), SEO HTML injection, and `/sitemap.xml`. |

### 2.2 Exact RLS vs. Application Enforcement Matrix (`[SEC-2]`)

Because `content_documents` stores both `draft_payload` and `published_payload` on the same row (and Postgres Row-Level Security filters rows while Column-Level Privileges + Secure Views filter columns), our defense-in-depth enforcement combines **Column-Level Grants + RLS Policies + Session Context Variables (`app.current_user_role`, `app.mfa_verified`)**:

| Security Rule / Invariant | Enforced in Postgres (Grants / RLS / PL/pgSQL Constraints) | Enforced in Application Code (Middleware / Handlers / Zod) |
|---|---|---|
| **Public visitors can never read drafts, revisions, users, or private media** | **Yes (Hard DB Boundary):** `azaroth_public_ro` has `SELECT` granted **only** on columns `(scope_key, published_payload, published_version, published_at)` of `content_documents`, and an RLS policy on `media_versions` (`USING (status = 'ready' AND public_state = 'public')`). `azaroth_public_ro` has zero table grants on `users`, `sessions`, `revisions`, `publish_attempts`, or `audit_logs`. | **Yes:** Public handlers (`/api/public/*`, SEO injector) instantiate a dedicated read-only pool using `DATABASE_URL_PUBLIC` (`azaroth_public_ro`). |
| **Published content can only reference `ready` + `public` media versions (`MED-6`)** | **Yes (PL/pgSQL Commit Check):** `fn_commit_publish` checks inside the transaction that every referenced `version_id` has `status = 'ready' AND public_state = 'public'`, raising an exception and rolling back otherwise. | **Yes:** Step 1 Pre-flight (`MED-7`) validates every slot reference and R2 HEAD before promotion. |
| **Referenced media versions cannot be deleted (`MED-3`)** | **Yes (Foreign Key Constraint):** `media_slot_usages.version_id REFERENCES media_versions(id) ON DELETE RESTRICT` prevents deleting any version referenced by any draft, published document, or retained revision. | **Yes:** Media delete handler checks `media_slot_usages` count and returns affected locations. |
| **`audit_logs` is strictly append-only (`AUDIT-1a`)** | **Yes (Table Grants):** `REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM azaroth_app, azaroth_public_ro`. Even a compromised app connection cannot alter or delete audit history. | **Yes:** Only `insertAuditLog()` helper exists in data layer. |
| **Admin role required for Publish, Restore, User/Role Mgmt, Permanent Media Purge, Slot Classification Changes, and Site Settings** | **Yes (RLS + PL/pgSQL Session Check):** `withDbSessionContext` sets `SET LOCAL app.current_role = ...` and `SET LOCAL app.mfa_verified = ...`; RLS policies on `users`, `revisions`, and `media_slot_definitions` + `fn_commit_publish` assert `current_setting('app.current_role') = 'admin'` and `current_setting('app.mfa_verified') = 'true'`. | **Yes:** `requireAdminWithMfa()` middleware rejects requests (`403`) before querying Neon. |
| **Editor role can edit and save drafts & upload media, but cannot publish or change settings/users** | **Yes (RLS Policy on `content_documents`):** Editors pass RLS for `UPDATE` on draft columns when `current_setting('app.current_role') IN ('admin', 'editor')`, while `fn_commit_publish` requires `'admin'`. | **Yes:** `requireEditorOrAdmin()` middleware + Zod schema validation per route. |

### 2.3 Content Security Policy (CSP) & Security Headers (`[SEC-3]`, `[RT-5]`)
Generated from `src/config/securityHeaders.ts` (single source of truth):
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options`: `nosniff`
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `X-Frame-Options`: `DENY` (and `frame-ancestors 'none'` for public routes; `'self'` for authenticated `/admin/preview` iframe)
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=(), payment=()`
- `Content-Security-Policy`:
  - `default-src 'self'`
  - `script-src 'self'` (zero 3P scripts per `CMS-6`)
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` (`'unsafe-inline'` required because original React components use `style={{ ... }}` and embedded `<style>` blocks per `HR-1`/`HR-7`)
  - `font-src 'self' https://fonts.gstatic.com data:`
  - `img-src 'self' data: blob: ${R2_PUBLIC_ORIGIN} ${R2_PRIVATE_S3_ENDPOINT_FOR_ADMIN_ONLY} https://images.unsplash.com https://flagcdn.com`
  - `connect-src 'self' ${R2_PRIVATE_S3_ENDPOINT_FOR_ADMIN_UPLOAD}`
  - `frame-ancestors 'self'`
  - `base-uri 'self'`; `form-action 'self'`; `object-src 'none'`

---

## 3. Runtime Boundary Design (`[RT-1]`–`[RT-5]`, Mode: `minimal`)

### 3.1 Class A vs. Class B Module Inventory (`[RT-2]`)

| Class | Allowed APIs & Imports | Modules in Codebase |
|---|---|---|
| **Class A (Portable Web-Standard Core)** | Web Fetch `Request` / `Response`, `URL`, `Headers`, `crypto.subtle`, `TextEncoder`, `@neondatabase/serverless` (HTTP/WebSocket driver), `zod`, `aws4fetch` (Web-crypto S3/R2 signing & `fetch`-based `HeadObject` / `CopyObject` / `DeleteObject`). **Zero Node built-ins (`fs`, `path`, `crypto`, `stream`, `buffer`), zero `sharp`, zero Vercel-specific packages.** | - `src/server/core/publicRead.ts` (`GET /api/public/page`, `GET /api/public/bootstrap`)<br>- `src/server/core/seoInjector.ts` (HTML metadata + initial payload injection, `/sitemap.xml`, `/robots.txt`)<br>- `src/server/core/cmsCrud.ts` (Draft read/save, optimistic lock check, preview handler)<br>- `src/server/core/publishOrchestrator.ts` (4-step `MED-7` publish, restore-to-draft)<br>- `src/server/core/r2Storage.ts` (Presigned PUT/GET URL generation, `HeadObject`, `CopyObject`, `DeleteObject`)<br>- `src/server/core/reconcileCore.ts` (`RECON-CORE` `MED-9`)<br>- `src/server/core/health.ts` (`/api/health`, `/api/health/ready`)<br>- `src/server/core/cache.ts` (`Cache-Control` builder, keys/tags, `CachePurgePort` interface)<br>- `src/server/core/logger.ts` (Structured JSON logger with redaction) |
| **Class B (Node-Only Approved Endpoints)** | Node.js runtime (`nodejs22.x` on Vercel), `sharp`, `better-auth` (with Node `crypto`/`scrypt`/`argon2id`). | - `src/server/node/mediaProcessor.ts` (`POST /api/admin/media/upload-complete` — magic-byte verification, SVG sanitization, `sharp` decode & responsive variant generation)<br>- `src/server/node/authHandler.ts` (`/api/auth/[...all]` — Better Auth + TOTP MFA + session management) |
| **Host Adapters (`src/server/adapters/`)** | Host-specific glue only. | - `src/server/adapters/vercel/` (Vercel Serverless/Edge entrypoints + `VercelCachePurgeAdapter` + `InMemoryCachePurgeAdapter` for contract tests `RT-4`)<br>- `src/server/adapters/cloudflare/` *(Deferred to P2 / R3 per `minimal` portability mode)* |

### 3.2 Import-Boundary Lint Rule (`[RT-2]`)
Enforced via `scripts/lint-runtime-boundaries.mjs` (executed in `npm run lint` at P0):
1. Parses AST/imports of every file under `src/server/core/**`, `src/schemas/**`, and `src/config/**` (Class A).
2. Fails the build if any Class A file imports:
   - Any `node:*` built-in (`fs`, `path`, `crypto`, `buffer`, `stream`, `os`, `child_process`, etc.)
   - Any file under `src/server/node/**` (Class B) or `src/server/adapters/**`
   - `sharp`, `better-auth/node`, `@vercel/*`, or `express`.
3. Fails the build if any file outside `src/server/adapters/vercel/**` imports `@vercel/*`.

### 3.3 Single Cache Module & `purge` Interface (`[RT-3]`, `[RT-4]`)
Defined in `src/server/core/cache.ts`:
- **Cache Policies:**
  - `PUBLIC_HTML`: `public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`
  - `PUBLIC_API`: `public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`
  - `PRIVATE_ADMIN_OR_PREVIEW`: `private, no-store, no-cache, must-revalidate`
  - `IMMUTABLE_MEDIA`: `public, max-age=31536000, immutable`
- **Cache Tags:** `tagForScope(scopeKey)` (e.g., `cms:page:home`, `cms:global:header`) and `tagForRoute(pathname)` (e.g., `route:/`, `route:/about`, `route:/sitemap.xml`).
- **`CachePurgePort` Interface:**
  ```ts
  export interface CachePurgeRequest {
    tags: string[];
    paths: string[];
    reason: string;
  }
  export interface CachePurgeResult {
    ok: boolean;
    purgedTags: string[];
    purgedPaths: string[];
    provider: 'vercel' | 'memory';
    error?: string;
  }
  export interface CachePurgePort {
    purge(req: CachePurgeRequest): Promise<CachePurgeResult>;
  }
  ```
- **Contract Tests (`RT-4`):** Shared test suite (`tests/runtime/cache-purge.contract.test.ts`) runs identical assertions against both `InMemoryCachePurgeAdapter` and `VercelCachePurgeAdapter` (using a mocked Fetch transport verifying headers, endpoint, tag/path payload formatting, timeout handling, and structured error return for `PUB-7` retry queueing).
