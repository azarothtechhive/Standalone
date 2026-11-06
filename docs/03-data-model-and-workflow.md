# Phase 2 Deliverable — Data Model, Atomic Publish, Media Integrity & Reconciliation Design (`/docs/03-data-model-and-workflow.md`)

Covers requirements: `CMS-1`–`CMS-7`, `ALT-1`–`ALT-4`, `PUB-1`–`PUB-8`, `MED-1`–`MED-11`, `MED-INV`, `AUDIT-1a`, `BAK-2`, `BAK-3`.

---

## 1. Neon Postgres Schema Design

### 1.1 Enumerations & Domain Types

```sql
CREATE TYPE user_role AS ENUM ('admin', 'editor');
CREATE TYPE asset_version_status AS ENUM ('pending', 'ready', 'failed', 'trashed', 'purging');
CREATE TYPE asset_public_state AS ENUM ('private', 'promoting', 'public', 'demoting');
CREATE TYPE slot_classification AS ENUM ('informative', 'decorative');
CREATE TYPE slot_ref_owner_type AS ENUM ('draft', 'published', 'revision');
CREATE TYPE publish_attempt_status AS ENUM ('promoting', 'committed', 'aborted', 'compensated');
```

### 1.2 Identity, Sessions & Mandatory TOTP MFA (`users`, `sessions`, `accounts`, `verifications`, `two_factors`)
Compatible with **Better Auth** (`better-auth` + `twoFactor` plugin) stored in Neon Postgres:

| Table | Columns & Constraints | Purpose |
|---|---|---|
| `users` | `id TEXT PRIMARY KEY`, `email TEXT UNIQUE NOT NULL`, `name TEXT NOT NULL`, `role user_role NOT NULL DEFAULT 'editor'`, `email_verified BOOLEAN NOT NULL DEFAULT FALSE`, `two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE`, `force_mfa_enrollment BOOLEAN NOT NULL DEFAULT TRUE`, `failed_login_count INT NOT NULL DEFAULT 0`, `locked_until TIMESTAMPTZ`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` | 1–5 CMS users (`admin` or `editor`). `admin` accounts always require verified TOTP MFA (`AUTH-1a`). |
| `sessions` | `id TEXT PRIMARY KEY`, `user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `token TEXT UNIQUE NOT NULL`, `mfa_verified BOOLEAN NOT NULL DEFAULT FALSE`, `ip_address TEXT`, `user_agent TEXT`, `expires_at TIMESTAMPTZ NOT NULL`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Server-side database sessions (`httpOnly`, `Secure`, `SameSite=Lax` cookie). `mfa_verified` must be `TRUE` for any `admin` session to access admin handlers. |
| `accounts` | `id TEXT PRIMARY KEY`, `user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `account_id TEXT NOT NULL`, `provider_id TEXT NOT NULL DEFAULT 'credential'`, `password_hash TEXT NOT NULL`, `created_at TIMESTAMPTZ NOT NULL`, `updated_at TIMESTAMPTZ NOT NULL` | Stores `argon2id` / `scrypt` password hashes. |
| `two_factors` | `id TEXT PRIMARY KEY`, `user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `secret_encrypted TEXT NOT NULL`, `backup_codes_encrypted TEXT NOT NULL`, `verified_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Stores encrypted TOTP secret and single-use recovery codes (`AUTH-1a`). |
| `password_reset_tokens` | `id TEXT PRIMARY KEY`, `user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `token_hash TEXT UNIQUE NOT NULL`, `expires_at TIMESTAMPTZ NOT NULL`, `used_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Single-use, short-lived (15 min) hashed reset tokens. |

### 1.3 Content Documents, Optimistic Locking & Revisions (`content_documents`, `revisions`, `publish_attempts`)

Rather than scattering public copy across disconnected tables with partial coverage, the CMS uses a unified, strongly-typed document store (`content_documents`) validated on read and write by shared per-scope Zod schemas (`src/schemas/content.ts`), paired with explicit relational slot usage tracking (`media_slot_usages`).

| Table | Columns & Constraints | Purpose |
|---|---|---|
| `content_documents` | `scope_key TEXT PRIMARY KEY` (e.g., `'global:header'`, `'global:footer'`, `'global:settings'`, `'page:home'`, `'page:about'`, `'page:portfolio'`, `'page:products'`, `'page:services'`, `'page:insights'`, `'page:testimonials'`, `'page:connect'`, `'page:privacy'`, `'page:terms'`, `'collection:products'`, `'collection:services'`, `'collection:industries'`, `'collection:insights'`, `'collection:testimonials'`),<br>`draft_payload JSONB NOT NULL`,<br>`draft_version BIGINT NOT NULL DEFAULT 1`,<br>`draft_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,<br>`draft_updated_by TEXT REFERENCES users(id)`,<br>`published_payload JSONB NOT NULL`,<br>`published_version BIGINT NOT NULL DEFAULT 1`,<br>`published_revision_id UUID`,<br>`published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,<br>`published_by TEXT REFERENCES users(id)` | Holds separate `draft_payload` and `published_payload` per scope (`PUB-1`, `PUB-2`) with integer optimistic lock versions (`draft_version`, `PUB-4`). Public read role (`azaroth_public_ro`) is restricted via column/view/RLS to `published_payload`, `published_version`, and `published_at` only (`SEC-2`). |
| `publish_attempts` | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,<br>`actor_user_id TEXT REFERENCES users(id)`,<br>`status publish_attempt_status NOT NULL DEFAULT 'promoting'`,<br>`scope_keys TEXT[] NOT NULL`,<br>`expected_draft_versions JSONB NOT NULL`,<br>`promoted_version_ids TEXT[] NOT NULL DEFAULT '{}'`,<br>`error_detail TEXT`,<br>`started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,<br>`completed_at TIMESTAMPTZ` | Tracks in-flight publish operations (`MED-7`, `MED-INV` M2). Allows `RECON-CORE` (`MED-9`) to identify abandoned `promoting` attempts older than 1 hour and demote their M2 objects. |
| `revisions` | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,<br>`revision_number BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE`,<br>`publish_attempt_id UUID UNIQUE REFERENCES publish_attempts(id)`,<br>`snapshot_payload JSONB NOT NULL` (full map of `scope_key -> { payload, draft_version }`),<br>`digest_sha256 TEXT NOT NULL`,<br>`is_current_published BOOLEAN NOT NULL DEFAULT FALSE`,<br>`summary TEXT`,<br>`created_by TEXT REFERENCES users(id)`,<br>`created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Immutable snapshots created on each atomic publish (`PUB-3`). Retained up to 20 revisions; pruning runs inside the publish transaction and **never** deletes the row where `is_current_published = TRUE`. |

### 1.4 Media Assets, Immutable Versions & Per-Slot Alt/Classification (`media_assets`, `media_versions`, `media_slot_usages`)

| Table | Columns & Constraints | Purpose |
|---|---|---|
| `media_assets` | `id TEXT PRIMARY KEY` (e.g., `'asset_logo_primary'`, `'asset_hero_workspace'`),<br>`display_name TEXT NOT NULL`,<br>`current_version_id TEXT` (FK added after `media_versions`),<br>`created_by TEXT REFERENCES users(id)`,<br>`created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,<br>`updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Logical asset identity (`MED-1`). Content **never** references `media_assets.id` directly for rendering; content always references an immutable `media_versions.id`. |
| `media_versions` | `id TEXT PRIMARY KEY` (unguessable 128-bit Base32/UUIDv4 token, e.g., `'ver_01j9...'`),<br>`asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT`,<br>`version_number INT NOT NULL`,<br>`status asset_version_status NOT NULL DEFAULT 'pending'`,<br>`public_state asset_public_state NOT NULL DEFAULT 'private'`,<br>`publish_attempt_id UUID REFERENCES publish_attempts(id) ON DELETE SET NULL`,<br>`mime_type TEXT NOT NULL` (`image/jpeg`, `image/png`, `image/webp`, `image/svg+xml` at P0),<br>`byte_size INT NOT NULL CHECK (byte_size > 0 AND byte_size <= 5242880)`,<br>`sha256_hex TEXT NOT NULL`,<br>`width INT NOT NULL CHECK (width > 0)`,<br>`height INT NOT NULL CHECK (height > 0)`,<br>`aspect_ratio NUMERIC(8,4) GENERATED ALWAYS AS (ROUND((width::numeric / height::numeric), 4)) STORED`,<br>`staging_key TEXT`,<br>`private_original_key TEXT NOT NULL` (`versions/{id}/original.{ext}`),<br>`variants_meta JSONB NOT NULL DEFAULT '{}'` (map of variant name $\rightarrow$ `{ privateKey, publicKey, width, height, byteSize, sha256, mimeType }`),<br>`promoted_at TIMESTAMPTZ`,<br>`unreferenced_since TIMESTAMPTZ` (for M4 7-day grace period),<br>`trashed_at TIMESTAMPTZ`,<br>`created_by TEXT REFERENCES users(id)`,<br>`created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,<br>`UNIQUE (asset_id, version_number)` | Immutable media version record (`MED-1`, `MED-6`, `MED-INV`). Check constraint enforces that when `status IN ('pending', 'failed', 'trashed', 'purging')`, `public_state` must be `'private'` or `'demoting'`. |
| `media_slot_definitions` | `slot_id TEXT PRIMARY KEY` (e.g., `'SLOT-01'` .. `'SLOT-15'`, plus dynamic item slot IDs),<br>`scope_key TEXT NOT NULL REFERENCES content_documents(scope_key)`,<br>`json_path TEXT NOT NULL`,<br>`label TEXT NOT NULL`,<br>`classification slot_classification NOT NULL`,<br>`expected_aspect_ratio NUMERIC(8,4)`,<br>`aspect_ratio_tolerance NUMERIC(5,4) NOT NULL DEFAULT 0.15`,<br>`updated_by TEXT REFERENCES users(id)`,<br>`updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Stores the Phase 1 `informative` vs `decorative` classification per slot (`ALT-1`, `ALT-4`). Changing `classification` is Admin-only, requires confirmation, and writes an audit entry (`AUDIT-1a`). |
| `media_slot_usages` | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,<br>`slot_id TEXT NOT NULL REFERENCES media_slot_definitions(slot_id)`,<br>`owner_type slot_ref_owner_type NOT NULL` (`'draft'`, `'published'`, `'revision'`),<br>`scope_key TEXT NOT NULL`,<br>`revision_id UUID REFERENCES revisions(id) ON DELETE CASCADE`,<br>`version_id TEXT NOT NULL REFERENCES media_versions(id) ON DELETE RESTRICT`,<br>`alt_text TEXT NOT NULL DEFAULT ''`,<br>`created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Relational index of every usage of every `version_id` across drafts, published state, and retained revisions (`MED-3`, `ALT-1`). Notice `ON DELETE RESTRICT` on `version_id`: Postgres physically prevents deleting any `media_versions` row while referenced by any draft, published document, or retained revision. |

### 1.5 Append-Only Audit Log, Operational Heartbeats, Cache Purge Queue & P1 Form Submissions

| Table | Columns & Constraints | Purpose |
|---|---|---|
| `audit_logs` | `id BIGSERIAL PRIMARY KEY`,<br>`event_type TEXT NOT NULL`,<br>`actor_user_id TEXT`,<br>`actor_email TEXT`,<br>`actor_role TEXT`,<br>`ip_address TEXT`,<br>`user_agent TEXT`,<br>`target_type TEXT NOT NULL`,<br>`target_id TEXT`,<br>`metadata JSONB NOT NULL DEFAULT '{}'`,<br>`created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Append-only audit table (`AUDIT-1a`). Application database role (`azaroth_app`) has `INSERT, SELECT` only (`REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM azaroth_app`). |
| `system_heartbeats` | `job_name TEXT PRIMARY KEY` (`'recon_core'`, `'backup_pg_dump'`, `'backup_r2_sync'`, `'cache_purge'`),<br>`last_run_at TIMESTAMPTZ NOT NULL`,<br>`last_success_at TIMESTAMPTZ`,<br>`last_status TEXT NOT NULL` (`'ok'`, `'error'`, `'running'`),<br>`details JSONB NOT NULL DEFAULT '{}'`,<br>`updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Tracks cron and backup heartbeats (`MED-9`, `BAK-2`, `BAK-3`, `PUB-7`) displayed on the System Status screen. |
| `cache_purge_queue` | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,<br>`revision_id UUID REFERENCES revisions(id)`,<br>`cache_tags TEXT[] NOT NULL`,<br>`paths TEXT[] NOT NULL`,<br>`status TEXT NOT NULL DEFAULT 'pending'` (`'pending'`, `'succeeded'`, `'failed'`),<br>`attempt_count INT NOT NULL DEFAULT 0`,<br>`next_retry_at TIMESTAMPTZ`,<br>`last_error TEXT`,<br>`created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,<br>`updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Tracks post-commit cache invalidation (`PUB-7`). If invalidation fails after DB commit, the failure is recorded here, surfaced on System Status and the publish UI, and retried with exponential backoff or manual retry. |
| `form_submissions` *(P1 — `CMS-7`)* | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,<br>`inquiry_type TEXT NOT NULL` (`'general'`, `'product'`),<br>`full_name TEXT NOT NULL`,<br>`work_email TEXT NOT NULL`,<br>`phone TEXT`,<br>`company_name TEXT`,<br>`subject_or_product TEXT`,<br>`deployment_or_size TEXT`,<br>`message TEXT NOT NULL`,<br>`consent_accepted BOOLEAN NOT NULL DEFAULT TRUE`,<br>`ip_hash TEXT`,<br>`payload_digest TEXT NOT NULL`,<br>`created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,<br>`expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '12 months')` | Stores `/connect-with-us` submissions at P1 (`CMS-7`) with duplicate-submit digest check and 12-month retention policy. |

---

## 2. Media Exposure Invariant (`[MED-INV]`) & Bucket Layout (`[MED-6]`)

### 2.1 Exposure-Class Table (`[MED-INV]`)

| Exposure Class | Definition | Allowed `status` | Allowed `public_state` | In Private Bucket (`R2_PRIVATE_BUCKET`)? | In Public Bucket (`R2_PUBLIC_BUCKET`)? | Time Bound / Lifecycle Rule |
|---|---|---|---|---|---|---|
| **M1 — Private** | Draft-only, newly uploaded (`pending`/`failed`), `trashed`, `purging`, or `ready` but not referenced by published content and not in an open publish attempt's promotion set. | `pending`, `ready`, `failed`, `trashed`, `purging` | `private` | Yes (`staging/{id}` or `versions/{id}/...` or `trash/{id}/...`) | **Never** | Remains private indefinitely while referenced only by drafts/revisions; `pending`/`failed` > 1h cleaned by `RECON-CORE`; `trashed` > 30d purged by Admin (`MED-4a`). |
| **M2 — In-flight Promotion** | Version is in the promotion set (`promoted_version_ids`) of an open `publish_attempts` row (`status = 'promoting'`). | `ready` | `promoting` $\rightarrow$ `public` (with active `publish_attempt_id`) | Yes (`versions/{id}/...`) | **Transiently Yes** (`pub/{id}/{variant}.{ext}`) | Exists only until Step 3 (Commit) succeeds (transitions to M3) or fails (immediate best-effort compensation deletes public copy and resets `public_state = 'private'`). If process crashes mid-promotion, `RECON-CORE` demotes any M2 version older than `1 hour`. **Worst-case stranded exposure bound = `scheduler interval + 1 hour`.** |
| **M3 — Published** | Referenced by current committed `published_payload` (`media_slot_usages` with `owner_type = 'published'`). | `ready` | `public` | Yes (`versions/{id}/...`) | **Yes** (`pub/{id}/{variant}.{ext}`) | Remains in public bucket as long as referenced by at least one published slot. |
| **M4 — Grace Period** | Previously M3 (`public`), now unreferenced by current published content (e.g., superseded by a newer publish) and not `trashed`. | `ready` | `public` (with `unreferenced_since IS NOT NULL`) $\rightarrow$ `demoting` $\rightarrow$ `private` | Yes (`versions/{id}/...`) | **Temporarily Yes** (`pub/{id}/{variant}.{ext}`) | Kept public for `GRACE_PERIOD = 7 days` ($\ge$ max HTML/edge cache TTL + 24h) so cached HTML pages referencing the old version never 404. After 7 days, `RECON-CORE` deletes `pub/{id}/*` and sets `public_state = 'private'` (version remains in private bucket if referenced by a retained revision). **Exception:** If an unreferenced version is moved to Trash (`MED-4a`), its public object is deleted **immediately** before `status` becomes `'trashed'`. |

### 2.2 Dual R2 Bucket Key Layout (`[MED-6]`)
- **Private Bucket (`R2_PRIVATE_BUCKET` — zero public access):**
  - `staging/{versionId}/upload.bin` — Raw presigned upload target before verification.
  - `versions/{versionId}/original.{ext}` — Verified, sanitized original asset.
  - `versions/{versionId}/{variant}.{ext}` — Generated responsive variants (`sm` 640w, `md` 1024w, `lg` 1600w, plus `webp` equivalents for raster images).
  - `trash/{versionId}/...` — Logical marker/prefix when `status = 'trashed'`.
- **Public Bucket (`R2_PUBLIC_BUCKET` — read-only public delivery via custom domain):**
  - `pub/{versionId}/{variant}.{ext}` — Immutable object with `Cache-Control: public, max-age=31536000, immutable` and `Content-Type` matching verified MIME type.
  - Version IDs use 128-bit cryptographically random tokens (`ver_` + 26-char Crockford Base32) so keys are unguessable.

---

## 3. Atomic Publish, Promotion & Restore Design (`[PUB-1]`–`[PUB-7]`, `[MED-7]`)

### 3.1 Four-Step Publish Sequence (`[MED-7]`)

```text
[Step 1: Pre-flight (Read-Only)]
  ├── Validate all target draft documents against shared Zod schemas (required fields, URL schemes: http/https/mailto/tel/internal route, reject javascript:).
  ├── Verify every informative slot (classification = 'informative') has non-empty trimmed alt_text (ALT-2, PUB-6).
  ├── Verify every decorative slot has alt_text = '' (ALT-3).
  ├── Verify optimistic lock versions (expected_draft_versions == content_documents.draft_version).
  ├── Compute digest_sha256 of combined draft payloads; if identical to current published revision's digest_sha256, return idempotent success without creating a duplicate revision (PUB-4).
  └── Identify all referenced media version_ids:
      ├── Reject if any version is missing, status != 'ready', or status IN ('trashed', 'purging', 'failed', 'pending').
      ├── Partition referenced versions into:
      │   ├── Already Public (M3/M4: public_state = 'public') -> verify public R2 HEAD exists.
      │   └── Needs Promotion (M1: public_state = 'private') -> verify private R2 HEAD exists for original + all variants.
      └── If any check fails -> abort before touching R2 or DB; return structured field/slot error list (PUB-6).

[Step 2: Promote M1 -> M2 (R2 Copy Before DB Commit)]
  ├── Insert publish_attempts row (status = 'promoting', promoted_version_ids = M1 set).
  ├── Mark M1 versions: SET public_state = 'promoting', publish_attempt_id = attempt.id.
  ├── For each version in M1 set (and each variant in variants_meta):
  │   ├── Copy from R2_PRIVATE_BUCKET (versions/{id}/{variant}.{ext}) to R2_PUBLIC_BUCKET (pub/{id}/{variant}.{ext}) with If-None-Match: "*" (no-overwrite) and Cache-Control: public, max-age=31536000, immutable.
  │   └── Verify destination object via HeadObject (byte_size and sha256 metadata/ETag match).
  ├── Mark promoted versions: SET public_state = 'public', promoted_at = NOW(), unreferenced_since = NULL.
  └── Compensation on any Step 2 failure:
      ├── Delete any pub/{id}/* objects copied during this attempt.
      ├── Reset affected versions to public_state = 'private', publish_attempt_id = NULL.
      └── Update publish_attempts SET status = 'compensated', error_detail = ... and return error.

[Step 3: Atomic Commit (Single PL/pgSQL Transaction — fn_commit_publish)]
  ├── Lock target content_documents rows FOR UPDATE.
  ├── Re-verify draft_version matches expected_draft_versions (optimistic lock check; RAISE EXCEPTION 'VERSION_CONFLICT' on mismatch).
  ├── Re-verify every referenced media_versions row has status = 'ready' AND public_state = 'public' (RAISE EXCEPTION 'MEDIA_NOT_PUBLIC' on mismatch).
  ├── Re-verify informative slot alt_text non-empty.
  ├── Copy draft_payload -> published_payload, increment published_version, set published_at = NOW(), published_by = actor.
  ├── Rebuild media_slot_usages for owner_type = 'published'.
  ├── Insert new revisions row (is_current_published = TRUE) and clear is_current_published on previous revision.
  ├── Insertmedia_slot_usages for owner_type = 'revision' linked to the new revision_id.
  ├── Mark previously published media_versions that are no longer referenced by any owner_type = 'published' row:
  │   SET unreferenced_since = COALESCE(unreferenced_since, NOW()), publish_attempt_id = NULL (transitions M3 -> M4 grace).
  ├── Clear unreferenced_since = NULL on all currently published versions (M3).
  ├── Prune old revisions beyond the most recent 20 (WHERE is_current_published = FALSE ORDER BY revision_number DESC OFFSET 19):
  │   DELETE old revisions (cascading their owner_type = 'revision' slot usages) in the same transaction (PUB-3).
  ├── Insert append-only audit_logs row (event_type = 'content.publish', metadata = { revision_id, scopes, promoted_version_ids }).
  ├── Update publish_attempts SET status = 'committed', completed_at = NOW().
  └── Compensation if Step 3 rolls back:
      └── Catch error in orchestrator -> delete newly promoted M2 objects from R2_PUBLIC_BUCKET, reset their public_state = 'private', mark publish_attempts status = 'compensated'.

[Step 4: Post-Commit Cache Invalidation & SEO Refresh (PUB-7)]
  ├── Enqueue cache_purge_queue entry for affected paths and tags (including '/', '/sitemap.xml', and modified route tags).
  ├── Call CacheAdapter.purge({ tags, paths }).
  ├── If purge succeeds -> mark cache_purge_queue 'succeeded' and update system_heartbeats('cache_purge').
  └── If purge fails -> content remains published; log structured error, record in cache_purge_queue with next_retry_at (exponential backoff: 10s, 60s, 300s), surface warning banner on Publish UI & System Status screen with manual "Retry Cache Purge" button.
```

### 3.2 Restore-to-Draft Transaction (`[PUB-5a]`, `[MED-1]`)
- Restoring a historical revision runs as a single PL/pgSQL function `fn_restore_revision_to_draft(p_revision_id, p_actor_user_id, p_expected_draft_versions)`:
  1. Verifies optimistic lock versions on `content_documents`.
  2. Verifies all media versions referenced by `p_revision_id` still exist and have `status = 'ready'`. (Because `media_slot_usages` has `ON DELETE RESTRICT` for retained revisions, any media version in the last 20 revisions is guaranteed to remain in `R2_PRIVATE_BUCKET` even if its public copy was demoted after the 7-day M4 grace period!)
  3. Loads `snapshot_payload` into `draft_payload` only (`published_payload` is untouched; never auto-publishes per `PUB-5a`), increments `draft_version`, updates `media_slot_usages` (`owner_type = 'draft'`), and writes an `audit_logs` entry (`content.restore_to_draft`).
  4. When the restored draft is later published, Step 2 of `MED-7` automatically re-promotes any private (`M1`) historical media versions back to the public bucket (`M2` $\rightarrow$ `M3`).

---

## 4. Staged, Verified Upload Pipeline (`[MED-8]`) & Asset Replacement (`[MED-1]`–`[MED-3]`)

### 4.1 Why Direct-to-R2 Presigned PUT is Required (`COST-1` / Vercel 4.5 MB Limit)
Vercel Serverless and Edge Functions enforce a hard **4.5 MB** request body limit on both Hobby and Pro plans, whereas `MED-5a` allows up to **5 MB** for images (and **50 MB** for video at P1). Therefore, file bytes **never** upload through the Vercel function payload; instead, the browser uploads directly to `R2_PRIVATE_BUCKET` (`staging/{versionId}/upload.bin`) via a single-key, short-lived presigned `PUT` URL.

### 4.2 Five-Step Upload Pipeline (`[MED-8]`)
1. **Initiate (`POST /api/admin/media/upload-init` — Class A):**
   - Authenticates user (`admin` or `editor`), validates declared filename, MIME type (`image/jpeg`, `image/png`, `image/webp`, `image/svg+xml` at P0), and `byteSize <= 5,242,880` via Zod.
   - Inserts `media_versions` row with `status = 'pending'`, `public_state = 'private'`, `staging_key = 'staging/' || versionId || '/upload.bin'`.
   - Generates an S3-compatible R2 presigned `PUT` URL scoped strictly to `staging/{versionId}/upload.bin`, `Content-Length`, and 10-minute expiry.
2. **Client Direct PUT to Private Bucket:**
   - Admin browser uploads directly to `R2_PRIVATE_BUCKET` (`staging/{versionId}/upload.bin`). R2 CORS allows `PUT` only from `SITE_URL` admin origin.
3. **Server-Side Verification & Variant Generation (`POST /api/admin/media/upload-complete` — Class B Node Function with `sharp`):**
   - Runs `HeadObject` on `staging/{versionId}/upload.bin` to verify actual byte size $\le 5\text{ MB}$ BEFORE downloading bytes into memory.
   - Streams object and inspects magic bytes (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `RIFF....WEBP` for WebP, XML/SVG root for SVG) — never trusts `Content-Type` header or file extension.
   - **For SVG (`SEC-4`):** Parses and sanitizes via strict allow-list (`svg`, `g`, `path`, `circle`, `rect`, `line`, `polyline`, `polygon`, `ellipse`, `defs`, `linearGradient`, `radialGradient`, `stop`, `clipPath`, `mask`, `text`, `tspan`); strips `<script>`, `<foreignObject>`, `on*` event attributes, external `href`/`xlink:href`, and `javascript:`/`data:` URIs.
   - **For Raster Images (JPEG/PNG/WebP):** Decodes full image buffer via `sharp` (rejecting corrupt/polyglot payloads or decompression bombs > `8192x8192`), strips EXIF metadata, extracts exact `width` and `height`, computes SHA-256 checksum, and generates responsive variants (`original`, `lg` 1600w, `md` 1024w, `sm` 640w in original format + `.webp`).
   - Checks slot aspect ratio against `media_slot_definitions.expected_aspect_ratio` (`MED-2a`); if difference exceeds tolerance (`15%`), returns `aspectRatioWarning: true` requiring explicit user confirmation before slot assignment.
4. **Immutable Private Storage & Atomic DB Transition:**
   - Writes verified original and variants to `versions/{versionId}/...` in `R2_PRIVATE_BUCKET` (never `R2_PUBLIC_BUCKET`).
   - Deletes `staging/{versionId}/upload.bin`.
   - In a single DB transaction, updates `media_versions` (`status = 'ready'`, `sha256_hex`, `width`, `height`, `variants_meta`) and updates `media_assets.current_version_id`.
5. **Best-Effort Failure Cleanup:**
   - If any check or decode fails in Step 3 or 4, the handler deletes `staging/{versionId}/upload.bin` and any partial `versions/{versionId}/*` objects, marks the DB row `status = 'failed'`, and leaves `RECON-CORE` as the safety net.

### 4.3 Replacing a Shared Asset (`[MED-1]`, `[MED-2a]`)
- When replacing an asset used across multiple slots, the UI queries `media_slot_usages` to list every page and slot where the asset is used (`MED-3`) and warns that replacing updates all draft usages (`MED-2a`).
- On confirmation, a single DB transaction creates the new `media_versions` reference across all `owner_type = 'draft'` rows for that `asset_id` and bumps `draft_version` on each affected document, while `owner_type = 'published'` and `owner_type = 'revision'` rows continue referencing the previous immutable `version_id`.
- The Media Library displays the list of affected unpublished pages and provides an Admin **"Publish All Affected Pages"** button that executes the atomic `MED-7` publish sequence across those scopes in one transaction (`MED-1`).

---

## 5. Reconciliation-Core (`[MED-9]`) & Stranded-Exposure Bound

### 5.1 `RECON-CORE` Operations (`POST /api/internal/reconcile` — Class A)
Authenticated via `Authorization: Bearer ${CRON_SECRET}` (scheduled trigger) or an Admin session with verified MFA (manual trigger on System Status / Media Library):

1. **Expire Abandoned Uploads (`pending` / `failed` > 1 hour):**
   - Selects `media_versions` where `status IN ('pending', 'failed') AND created_at < NOW() - INTERVAL '1 hour'`.
   - Deletes `staging/{id}/*` and any partial `versions/{id}/*` from `R2_PRIVATE_BUCKET`, then deletes the unreferenced `media_versions` row.
2. **Demote Stranded In-Flight Promotions (`M2` > 1 hour):**
   - Selects `publish_attempts` where `status = 'promoting' AND started_at < NOW() - INTERVAL '1 hour'` (or `media_versions` where `public_state = 'promoting' AND updated_at < NOW() - INTERVAL '1 hour'`).
   - Marks `public_state = 'demoting'`, deletes `pub/{id}/*` from `R2_PUBLIC_BUCKET`, resets `public_state = 'private'`, `publish_attempt_id = NULL`, and marks the abandoned `publish_attempts` row `status = 'aborted'`.
3. **Demote Expired Grace-Period Versions (`M4` > 7 days):**
   - Selects `media_versions` where `public_state = 'public' AND unreferenced_since < NOW() - INTERVAL '7 days'` and `NOT EXISTS (SELECT 1 FROM media_slot_usages WHERE version_id = media_versions.id AND owner_type = 'published')`.
   - Marks `public_state = 'demoting'`, deletes `pub/{id}/*` from `R2_PUBLIC_BUCKET`, and sets `public_state = 'private'`.
4. **Complete Retried Purges (`MED-4a` — `status = 'purging'` or `trashed` > 30 days):**
   - For versions marked `purging` (or Admin-triggered purge of `trashed` versions older than 30 days with zero references in `media_slot_usages`):
   - Enforces strict deletion order: **1.** Mark `status = 'purging'`, **2.** Delete `pub/{id}/*` from `R2_PUBLIC_BUCKET`, **3.** Delete `versions/{id}/*` and `trash/{id}/*` from `R2_PRIVATE_BUCKET`, **4.** Delete the `media_versions` row in Neon last.
5. **Retry Pending Cache Purges (`PUB-7`):**
   - Retries due rows in `cache_purge_queue` where `status != 'succeeded' AND next_retry_at <= NOW()`.
6. **Record Heartbeat:**
   - Upserts `system_heartbeats` (`job_name = 'recon_core'`, `last_run_at = NOW()`, `last_success_at = NOW()`, `last_status = 'ok'`, `details = { expiredUploads, demotedM2, demotedM4, purgedVersions }`).

### 5.2 Worst-Case Stranded-Exposure Bound (`[MED-9]`)
$$\text{Worst-Case Stranded M2 Exposure} = \text{Scheduler Interval} + 1\text{ hour}$$
- **With GitHub Actions hourly cron (`0 * * * *`, scheduler interval = `1 hour`):** Worst-case stranded exposure of an aborted/crashed M2 promotion is **$1\text{ hour} + 1\text{ hour} = 2\text{ hours}$**.
- **With Vercel Hobby daily cron (`0 3 * * *`) alone (if GitHub Actions cron is not enabled):** Scheduler interval is `24 hours`, yielding a worst-case bound of **$24\text{ hours} + 1\text{ hour} = 25\text{ hours}$** (plus immediate manual Admin trigger on System Status). Both schedules are wired so GitHub Actions provides the 2-hour bound on free tiers while Vercel cron acts as a secondary daily fallback.
