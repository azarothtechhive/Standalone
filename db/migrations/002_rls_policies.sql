-- =============================================================================
-- Migration 002: Least-Privilege Role Grants & Row-Level Security (RLS)
-- Covers: SEC-2, AUDIT-1a, PUB-1, PUB-2, MED-INV
-- =============================================================================

-- 1. Public Read-Only View for Published State Only (SEC-2)
CREATE OR REPLACE VIEW v_published_content AS
SELECT
  scope_key,
  published_payload,
  published_version,
  published_at
FROM content_documents;

-- 2. Role Grants for azaroth_public_ro (Public Read-Only Role — SEC-2)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM azaroth_public_ro;
GRANT USAGE ON SCHEMA public TO azaroth_public_ro;
GRANT SELECT ON v_published_content TO azaroth_public_ro;
GRANT SELECT (scope_key, published_payload, published_version, published_at)
  ON content_documents TO azaroth_public_ro;
GRANT SELECT (id, asset_id, mime_type, width, height, aspect_ratio, variants_meta, status, public_state)
  ON media_versions TO azaroth_public_ro;
GRANT SELECT (slot_id, scope_key, classification)
  ON media_slot_definitions TO azaroth_public_ro;
GRANT SELECT (slot_id, owner_type, scope_key, version_id, alt_text)
  ON media_slot_usages TO azaroth_public_ro;

-- 3. Role Grants for azaroth_app (Authenticated CMS / Server Role — SEC-2, AUDIT-1a)
GRANT USAGE ON SCHEMA public TO azaroth_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  users,
  sessions,
  accounts,
  two_factors,
  password_reset_tokens,
  content_documents,
  publish_attempts,
  revisions,
  media_assets,
  media_versions,
  media_slot_definitions,
  media_slot_usages,
  system_heartbeats,
  cache_purge_queue,
  form_submissions
TO azaroth_app;

-- AUDIT-1a: Append-only permissions on audit_logs (UPDATE, DELETE, TRUNCATE strictly revoked)
REVOKE ALL ON audit_logs FROM azaroth_app;
GRANT SELECT, INSERT ON audit_logs TO azaroth_app;
GRANT USAGE, SELECT ON SEQUENCE audit_logs_id_seq TO azaroth_app;

-- 4. Enable Row-Level Security (RLS) as Defense-in-Depth (SEC-2)
ALTER TABLE content_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_slot_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_slot_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Public Read-Only Role (azaroth_public_ro)
DROP POLICY IF EXISTS p_public_ro_content_documents ON content_documents;
CREATE POLICY p_public_ro_content_documents
  ON content_documents
  FOR SELECT
  TO azaroth_public_ro
  USING (published_version >= 1);

DROP POLICY IF EXISTS p_public_ro_media_versions ON media_versions;
CREATE POLICY p_public_ro_media_versions
  ON media_versions
  FOR SELECT
  TO azaroth_public_ro
  USING (status = 'ready' AND public_state = 'public');

DROP POLICY IF EXISTS p_public_ro_media_slot_definitions ON media_slot_definitions;
CREATE POLICY p_public_ro_media_slot_definitions
  ON media_slot_definitions
  FOR SELECT
  TO azaroth_public_ro
  USING (TRUE);

DROP POLICY IF EXISTS p_public_ro_media_slot_usages ON media_slot_usages;
CREATE POLICY p_public_ro_media_slot_usages
  ON media_slot_usages
  FOR SELECT
  TO azaroth_public_ro
  USING (owner_type = 'published');

-- 6. RLS Policies for Application Role (azaroth_app) using request-scoped session GUC variables:
--    app.current_user_role ('admin' | 'editor' | 'system')
--    app.mfa_verified ('true' | 'false')
DROP POLICY IF EXISTS p_app_content_documents_select ON content_documents;
CREATE POLICY p_app_content_documents_select
  ON content_documents
  FOR SELECT
  TO azaroth_app
  USING (
    current_setting('app.current_user_role', TRUE) IN ('admin', 'editor', 'system')
  );

DROP POLICY IF EXISTS p_app_content_documents_write ON content_documents;
CREATE POLICY p_app_content_documents_write
  ON content_documents
  FOR ALL
  TO azaroth_app
  USING (
    current_setting('app.current_user_role', TRUE) = 'system'
    OR (
      current_setting('app.current_user_role', TRUE) = 'admin'
      AND current_setting('app.mfa_verified', TRUE) = 'true'
    )
    OR current_setting('app.current_user_role', TRUE) = 'editor'
  )
  WITH CHECK (
    current_setting('app.current_user_role', TRUE) = 'system'
    OR (
      current_setting('app.current_user_role', TRUE) = 'admin'
      AND current_setting('app.mfa_verified', TRUE) = 'true'
    )
    OR (
      current_setting('app.current_user_role', TRUE) = 'editor'
      AND scope_key <> 'global:settings'
    )
  );

-- Slot classification changes are Admin+MFA only (ALT-4)
DROP POLICY IF EXISTS p_app_slot_definitions_select ON media_slot_definitions;
CREATE POLICY p_app_slot_definitions_select
  ON media_slot_definitions
  FOR SELECT
  TO azaroth_app
  USING (TRUE);

DROP POLICY IF EXISTS p_app_slot_definitions_write ON media_slot_definitions;
CREATE POLICY p_app_slot_definitions_write
  ON media_slot_definitions
  FOR ALL
  TO azaroth_app
  USING (
    current_setting('app.current_user_role', TRUE) = 'system'
    OR (
      current_setting('app.current_user_role', TRUE) = 'admin'
      AND current_setting('app.mfa_verified', TRUE) = 'true'
    )
  )
  WITH CHECK (
    current_setting('app.current_user_role', TRUE) = 'system'
    OR (
      current_setting('app.current_user_role', TRUE) = 'admin'
      AND current_setting('app.mfa_verified', TRUE) = 'true'
    )
  );

DROP POLICY IF EXISTS p_app_media_versions_all ON media_versions;
CREATE POLICY p_app_media_versions_all
  ON media_versions
  FOR ALL
  TO azaroth_app
  USING (
    current_setting('app.current_user_role', TRUE) IN ('admin', 'editor', 'system')
  );

DROP POLICY IF EXISTS p_app_media_slot_usages_all ON media_slot_usages;
CREATE POLICY p_app_media_slot_usages_all
  ON media_slot_usages
  FOR ALL
  TO azaroth_app
  USING (
    current_setting('app.current_user_role', TRUE) IN ('admin', 'editor', 'system')
  );

DROP POLICY IF EXISTS p_app_revisions_select ON revisions;
CREATE POLICY p_app_revisions_select
  ON revisions
  FOR SELECT
  TO azaroth_app
  USING (
    current_setting('app.current_user_role', TRUE) IN ('admin', 'editor', 'system')
  );

DROP POLICY IF EXISTS p_app_revisions_write ON revisions;
CREATE POLICY p_app_revisions_write
  ON revisions
  FOR ALL
  TO azaroth_app
  USING (
    current_setting('app.current_user_role', TRUE) = 'system'
    OR (
      current_setting('app.current_user_role', TRUE) = 'admin'
      AND current_setting('app.mfa_verified', TRUE) = 'true'
    )
  );

DROP POLICY IF EXISTS p_app_users_all ON users;
CREATE POLICY p_app_users_all
  ON users
  FOR ALL
  TO azaroth_app
  USING (
    current_setting('app.current_user_role', TRUE) = 'system'
    OR (
      current_setting('app.current_user_role', TRUE) = 'admin'
      AND current_setting('app.mfa_verified', TRUE) = 'true'
    )
    OR id = current_setting('app.current_user_id', TRUE)
  );
