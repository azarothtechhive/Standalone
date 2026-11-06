-- =============================================================================
-- Migration 001: Least-Privilege Roles, Enumerations & Core Schema
-- Covers: SEC-2, AUTH-1a, CMS-1..CMS-7, ALT-1..ALT-4, PUB-1..PUB-7,
--         MED-1..MED-9, MED-INV, AUDIT-1a
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Least-Privilege Database Roles (SEC-2)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'azaroth_migrator') THEN
    CREATE ROLE azaroth_migrator NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'azaroth_app') THEN
    CREATE ROLE azaroth_app NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'azaroth_public_ro') THEN
    CREATE ROLE azaroth_public_ro NOLOGIN;
  END IF;
END
$$;

-- 2. Enumerations & Domain Types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'editor');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_version_status') THEN
    CREATE TYPE asset_version_status AS ENUM ('pending', 'ready', 'failed', 'trashed', 'purging');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_public_state') THEN
    CREATE TYPE asset_public_state AS ENUM ('private', 'promoting', 'public', 'demoting');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'slot_classification') THEN
    CREATE TYPE slot_classification AS ENUM ('informative', 'decorative');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'slot_ref_owner_type') THEN
    CREATE TYPE slot_ref_owner_type AS ENUM ('draft', 'published', 'revision');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publish_attempt_status') THEN
    CREATE TYPE publish_attempt_status AS ENUM ('promoting', 'committed', 'aborted', 'compensated');
  END IF;
END
$$;

-- 3. Identity, Sessions & Mandatory TOTP MFA (Better Auth + twoFactor compatible)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'editor',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  force_mfa_enrollment BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_count INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  mfa_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL DEFAULT 'credential',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS two_factors (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  backup_codes_encrypted TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Content Documents, Publish Attempts & Revisions (PUB-1..PUB-7)
CREATE TABLE IF NOT EXISTS content_documents (
  scope_key TEXT PRIMARY KEY,
  draft_payload JSONB NOT NULL,
  draft_version BIGINT NOT NULL DEFAULT 1,
  draft_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  draft_updated_by TEXT REFERENCES users(id),
  published_payload JSONB NOT NULL,
  published_version BIGINT NOT NULL DEFAULT 1,
  published_revision_id UUID,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_by TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS publish_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id TEXT REFERENCES users(id),
  status publish_attempt_status NOT NULL DEFAULT 'promoting',
  scope_keys TEXT[] NOT NULL,
  expected_draft_versions JSONB NOT NULL,
  promoted_version_ids TEXT[] NOT NULL DEFAULT '{}',
  error_detail TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_number BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
  publish_attempt_id UUID UNIQUE REFERENCES publish_attempts(id),
  snapshot_payload JSONB NOT NULL,
  digest_sha256 TEXT NOT NULL,
  is_current_published BOOLEAN NOT NULL DEFAULT FALSE,
  summary TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Media Assets, Immutable Versions & Per-Slot Alt/Classification (MED-1..MED-9, MED-INV, ALT-1..ALT-4)
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  current_version_id TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_versions (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  version_number INT NOT NULL,
  status asset_version_status NOT NULL DEFAULT 'pending',
  public_state asset_public_state NOT NULL DEFAULT 'private',
  publish_attempt_id UUID REFERENCES publish_attempts(id) ON DELETE SET NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/svg+xml')),
  byte_size INT NOT NULL CHECK (byte_size > 0 AND byte_size <= 5242880),
  sha256_hex TEXT NOT NULL,
  width INT NOT NULL CHECK (width > 0),
  height INT NOT NULL CHECK (height > 0),
  aspect_ratio NUMERIC(8,4) GENERATED ALWAYS AS (ROUND((width::numeric / height::numeric), 4)) STORED,
  staging_key TEXT,
  private_original_key TEXT NOT NULL,
  variants_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  promoted_at TIMESTAMPTZ,
  unreferenced_since TIMESTAMPTZ,
  trashed_at TIMESTAMPTZ,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (asset_id, version_number),
  -- MED-INV constraint: non-ready versions may NEVER be in 'public' or 'promoting' state
  CONSTRAINT chk_med_inv_status_public_state CHECK (
    (status = 'ready') OR (public_state IN ('private', 'demoting'))
  )
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_media_assets_current_version'
  ) THEN
    ALTER TABLE media_assets
      ADD CONSTRAINT fk_media_assets_current_version
      FOREIGN KEY (current_version_id) REFERENCES media_versions(id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS media_slot_definitions (
  slot_id TEXT PRIMARY KEY,
  scope_key TEXT NOT NULL REFERENCES content_documents(scope_key) ON DELETE CASCADE,
  json_path TEXT NOT NULL,
  label TEXT NOT NULL,
  classification slot_classification NOT NULL,
  expected_aspect_ratio NUMERIC(8,4),
  aspect_ratio_tolerance NUMERIC(5,4) NOT NULL DEFAULT 0.1500,
  updated_by TEXT REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_slot_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id TEXT NOT NULL REFERENCES media_slot_definitions(slot_id) ON DELETE CASCADE,
  owner_type slot_ref_owner_type NOT NULL,
  scope_key TEXT NOT NULL,
  revision_id UUID REFERENCES revisions(id) ON DELETE CASCADE,
  version_id TEXT NOT NULL REFERENCES media_versions(id) ON DELETE RESTRICT,
  alt_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_slot_usages_version ON media_slot_usages(version_id, owner_type);
CREATE INDEX IF NOT EXISTS idx_media_slot_usages_scope ON media_slot_usages(scope_key, owner_type);

-- 6. Append-Only Audit Log, Operational Heartbeats, Cache Purge Queue & P1 Form Submissions
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_user_id TEXT,
  actor_email TEXT,
  actor_role TEXT,
  ip_address TEXT,
  user_agent TEXT,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_heartbeats (
  job_name TEXT PRIMARY KEY,
  last_run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_success_at TIMESTAMPTZ,
  last_status TEXT NOT NULL CHECK (last_status IN ('ok', 'error', 'running')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cache_purge_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id UUID REFERENCES revisions(id) ON DELETE SET NULL,
  cache_tags TEXT[] NOT NULL,
  paths TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  attempt_count INT NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('general', 'product')),
  full_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  subject_or_product TEXT,
  deployment_or_size TEXT,
  message TEXT NOT NULL,
  consent_accepted BOOLEAN NOT NULL DEFAULT TRUE,
  ip_hash TEXT,
  payload_digest TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '12 months')
);
