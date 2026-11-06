import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL_MIGRATOR || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!url) {
  console.error('[setup-staging] No database connection string found.');
  process.exit(1);
}

const sql = neon(url);

async function setup() {
  console.log('[setup-staging] Creating isolated staging schema...');
  await sql`CREATE SCHEMA IF NOT EXISTS staging;`;

  console.log('[setup-staging] Creating staging tables...');

  // 1. users
  await sql`
    CREATE TABLE IF NOT EXISTS staging.users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor',
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      force_mfa_enrollment BOOLEAN NOT NULL DEFAULT FALSE,
      failed_login_count INT NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 2. accounts
  await sql`
    CREATE TABLE IF NOT EXISTS staging.accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES staging.users(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL DEFAULT 'credential',
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 3. sessions
  await sql`
    CREATE TABLE IF NOT EXISTS staging.sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES staging.users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      mfa_verified BOOLEAN NOT NULL DEFAULT FALSE,
      ip_address TEXT,
      user_agent TEXT,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 4. two_factors
  await sql`
    CREATE TABLE IF NOT EXISTS staging.two_factors (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES staging.users(id) ON DELETE CASCADE,
      secret_encrypted TEXT NOT NULL,
      backup_codes_encrypted TEXT NOT NULL,
      verified_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 5. password_reset_tokens
  await sql`
    CREATE TABLE IF NOT EXISTS staging.password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES staging.users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 6. content_documents
  await sql`
    CREATE TABLE IF NOT EXISTS staging.content_documents (
      scope_key TEXT PRIMARY KEY,
      draft_payload JSONB NOT NULL,
      draft_version BIGINT NOT NULL DEFAULT 1,
      draft_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      draft_updated_by TEXT,
      published_payload JSONB NOT NULL,
      published_version BIGINT NOT NULL DEFAULT 1,
      published_revision_id TEXT,
      published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      published_by TEXT
    );
  `;

  // 7. revisions
  await sql`
    CREATE TABLE IF NOT EXISTS staging.revisions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      revision_number BIGSERIAL,
      snapshot_payload JSONB NOT NULL,
      digest_sha256 TEXT NOT NULL,
      is_current_published BOOLEAN NOT NULL DEFAULT FALSE,
      summary TEXT,
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 8. media_assets
  await sql`
    CREATE TABLE IF NOT EXISTS staging.media_assets (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      current_version_id TEXT,
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 9. media_versions
  await sql`
    CREATE TABLE IF NOT EXISTS staging.media_versions (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL REFERENCES staging.media_assets(id) ON DELETE CASCADE,
      version_number INT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ready',
      public_state TEXT NOT NULL DEFAULT 'private',
      publish_attempt_id TEXT,
      mime_type TEXT NOT NULL,
      byte_size INT NOT NULL,
      sha256_hex TEXT NOT NULL,
      width INT NOT NULL,
      height INT NOT NULL,
      staging_key TEXT,
      private_original_key TEXT NOT NULL,
      variants_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
      promoted_at TIMESTAMPTZ,
      unreferenced_since TIMESTAMPTZ,
      trashed_at TIMESTAMPTZ,
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (asset_id, version_number)
    );
  `;

  // 10. form_submissions
  await sql`
    CREATE TABLE IF NOT EXISTS staging.form_submissions (
      id TEXT PRIMARY KEY,
      inquiry_type TEXT NOT NULL,
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
      rfq_details JSONB NOT NULL DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'QUALIFIED', 'CLOSED')),
      follow_up_note TEXT,
      assigned_to TEXT,
      next_follow_up_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '12 months')
    );
  `;

  // 11. audit_logs
  await sql`
    CREATE TABLE IF NOT EXISTS staging.audit_logs (
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
  `;

  // 12. system_heartbeats
  await sql`
    CREATE TABLE IF NOT EXISTS staging.system_heartbeats (
      job_name TEXT PRIMARY KEY,
      last_run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_success_at TIMESTAMPTZ,
      last_status TEXT NOT NULL,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 13. cache_purge_queue
  await sql`
    CREATE TABLE IF NOT EXISTS staging.cache_purge_queue (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      revision_id TEXT,
      cache_tags TEXT[] NOT NULL DEFAULT '{}',
      paths TEXT[] NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'pending',
      attempt_count INT NOT NULL DEFAULT 0,
      next_retry_at TIMESTAMPTZ,
      last_error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 14. email_notifications
  await sql`
    CREATE TABLE IF NOT EXISTS staging.email_notifications (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL REFERENCES staging.form_submissions(id) ON DELETE CASCADE,
      notification_type TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'RETRY')),
      provider_message_id TEXT,
      error_message TEXT,
      attempts INT NOT NULL DEFAULT 0,
      last_attempt_at TIMESTAMPTZ,
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log('[setup-staging] All staging tables created successfully in isolated staging schema!');
}

setup().catch((e) => {
  console.error('[setup-staging] Error:', e);
  process.exit(1);
});
