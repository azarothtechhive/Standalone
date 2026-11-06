-- =============================================================================
-- Migration 003: Single-Transaction PL/pgSQL Publish, Restore & Asset Replacement
-- Covers: PUB-3, PUB-4, PUB-5a, PUB-6, MED-1, MED-3, MED-7, MED-INV, ALT-2, AUDIT-1a
-- =============================================================================

-- 1. Atomic Commit Publish Function (Step 3 of MED-7 / PUB-3)
CREATE OR REPLACE FUNCTION fn_commit_publish(
  p_attempt_id UUID,
  p_actor_user_id TEXT,
  p_actor_email TEXT,
  p_scope_keys TEXT[],
  p_expected_draft_versions JSONB,
  p_digest_sha256 TEXT,
  p_summary TEXT DEFAULT 'Published changes'
)
RETURNS TABLE (
  revision_id UUID,
  revision_number BIGINT,
  idempotent_noop BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_scope TEXT;
  v_doc RECORD;
  v_expected_ver BIGINT;
  v_current_rev RECORD;
  v_new_rev_id UUID;
  v_new_rev_num BIGINT;
  v_invalid_media_count INT;
  v_missing_alt_count INT;
  v_snapshot JSONB := '{}'::jsonb;
BEGIN
  -- 1. Check idempotency against current published revision (PUB-4)
  SELECT id, revisions.revision_number, digest_sha256
    INTO v_current_rev
    FROM revisions
   WHERE is_current_published = TRUE
   LIMIT 1;

  IF FOUND AND v_current_rev.digest_sha256 = p_digest_sha256 THEN
    UPDATE publish_attempts
       SET status = 'committed',
           completed_at = NOW()
     WHERE id = p_attempt_id;

    RETURN QUERY SELECT v_current_rev.id, v_current_rev.revision_number, TRUE;
    RETURN;
  END IF;

  -- 2. Lock target content_documents rows FOR UPDATE and verify optimistic lock versions (PUB-4)
  FOREACH v_scope IN ARRAY p_scope_keys LOOP
    SELECT *
      INTO v_doc
      FROM content_documents
     WHERE scope_key = v_scope
       FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'SCOPE_NOT_FOUND:%', v_scope;
    END IF;

    v_expected_ver := (p_expected_draft_versions ->> v_scope)::BIGINT;
    IF v_expected_ver IS NOT NULL AND v_doc.draft_version <> v_expected_ver THEN
      RAISE EXCEPTION 'VERSION_CONFLICT:scope=% expected=% actual=%',
        v_scope, v_expected_ver, v_doc.draft_version;
    END IF;
  END LOOP;

  -- 3. Verify all draft media slot usages for target scopes reference ready + public versions (PUB-6, MED-7, MED-INV)
  SELECT COUNT(*)
    INTO v_invalid_media_count
    FROM media_slot_usages u
    JOIN media_versions mv ON mv.id = u.version_id
   WHERE u.owner_type = 'draft'
     AND u.scope_key = ANY(p_scope_keys)
     AND (mv.status <> 'ready' OR mv.public_state <> 'public');

  IF v_invalid_media_count > 0 THEN
    RAISE EXCEPTION 'MEDIA_NOT_PUBLIC:% referenced media version(s) are not ready and public',
      v_invalid_media_count;
  END IF;

  -- 4. Verify all informative slots in target scopes have non-empty trimmed alt_text (ALT-2, PUB-6)
  SELECT COUNT(*)
    INTO v_missing_alt_count
    FROM media_slot_usages u
    JOIN media_slot_definitions d ON d.slot_id = u.slot_id
   WHERE u.owner_type = 'draft'
     AND u.scope_key = ANY(p_scope_keys)
     AND d.classification = 'informative'
     AND LENGTH(BTRIM(u.alt_text)) = 0;

  IF v_missing_alt_count > 0 THEN
    RAISE EXCEPTION 'MISSING_INFORMATIVE_ALT:% informative slot(s) have empty alt text',
      v_missing_alt_count;
  END IF;

  -- 5. Copy draft_payload -> published_payload for target scopes
  UPDATE content_documents
     SET published_payload = draft_payload,
         published_version = published_version + 1,
         published_at = NOW(),
         published_by = p_actor_user_id
   WHERE scope_key = ANY(p_scope_keys);

  -- 6. Build full snapshot payload across all published scopes for immutable revision history
  SELECT jsonb_object_agg(
           scope_key,
           jsonb_build_object(
             'payload', published_payload,
             'draftVersion', draft_version,
             'publishedVersion', published_version
           )
         )
    INTO v_snapshot
    FROM content_documents;

  -- 7. Clear previous current published revision flag and insert new revision (PUB-3)
  UPDATE revisions
     SET is_current_published = FALSE
   WHERE is_current_published = TRUE;

  INSERT INTO revisions (
    publish_attempt_id,
    snapshot_payload,
    digest_sha256,
    is_current_published,
    summary,
    created_by
  )
  VALUES (
    p_attempt_id,
    COALESCE(v_snapshot, '{}'::jsonb),
    p_digest_sha256,
    TRUE,
    p_summary,
    p_actor_user_id
  )
  RETURNING id, revisions.revision_number INTO v_new_rev_id, v_new_rev_num;

  UPDATE content_documents
     SET published_revision_id = v_new_rev_id
   WHERE scope_key = ANY(p_scope_keys);

  -- 8. Rebuild published media_slot_usages for target scopes and snapshot revision usages (MED-3)
  DELETE FROM media_slot_usages
   WHERE owner_type = 'published'
     AND scope_key = ANY(p_scope_keys);

  INSERT INTO media_slot_usages (slot_id, owner_type, scope_key, version_id, alt_text)
  SELECT slot_id, 'published'::slot_ref_owner_type, scope_key, version_id, alt_text
    FROM media_slot_usages
   WHERE owner_type = 'draft'
     AND scope_key = ANY(p_scope_keys);

  INSERT INTO media_slot_usages (slot_id, owner_type, scope_key, revision_id, version_id, alt_text)
  SELECT slot_id, 'revision'::slot_ref_owner_type, scope_key, v_new_rev_id, version_id, alt_text
    FROM media_slot_usages
   WHERE owner_type = 'published';

  -- 9. Update media exposure timestamps (M3 active vs M4 7-day grace period — MED-INV)
  UPDATE media_versions mv
     SET unreferenced_since = NULL,
         publish_attempt_id = NULL
   WHERE EXISTS (
     SELECT 1 FROM media_slot_usages u
      WHERE u.version_id = mv.id
        AND u.owner_type = 'published'
   );

  UPDATE media_versions mv
     SET unreferenced_since = COALESCE(mv.unreferenced_since, NOW()),
         publish_attempt_id = NULL
   WHERE mv.public_state = 'public'
     AND NOT EXISTS (
       SELECT 1 FROM media_slot_usages u
        WHERE u.version_id = mv.id
          AND u.owner_type = 'published'
     );

  -- 10. Prune revisions beyond most recent 20 (NEVER deleting is_current_published = TRUE — PUB-3)
  DELETE FROM revisions
   WHERE id IN (
     SELECT r.id
       FROM revisions r
      WHERE r.is_current_published = FALSE
      ORDER BY r.revision_number DESC
      OFFSET 19
   );

  -- 11. Mark publish_attempt committed and write append-only audit log (AUDIT-1a)
  UPDATE publish_attempts
     SET status = 'committed',
         completed_at = NOW()
   WHERE id = p_attempt_id;

  INSERT INTO audit_logs (
    event_type,
    actor_user_id,
    actor_email,
    actor_role,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    'content.publish',
    p_actor_user_id,
    p_actor_email,
    'admin',
    'revision',
    v_new_rev_id::TEXT,
    jsonb_build_object(
      'attemptId', p_attempt_id,
      'revisionNumber', v_new_rev_num,
      'scopeKeys', p_scope_keys,
      'digestSha256', p_digest_sha256
    )
  );

  RETURN QUERY SELECT v_new_rev_id, v_new_rev_num, FALSE;
END;
$$;

-- 2. Atomic Restore Revision to Draft Only (PUB-5a, PUB-3)
CREATE OR REPLACE FUNCTION fn_restore_revision_to_draft(
  p_revision_id UUID,
  p_actor_user_id TEXT,
  p_actor_email TEXT,
  p_expected_draft_versions JSONB
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_rev RECORD;
  v_scope TEXT;
  v_scope_entry JSONB;
  v_expected_ver BIGINT;
  v_doc RECORD;
  v_missing_media_count INT;
  v_restored_count INT := 0;
BEGIN
  SELECT * INTO v_rev FROM revisions WHERE id = p_revision_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'REVISION_NOT_FOUND:%', p_revision_id;
  END IF;

  -- Verify all media versions referenced by this revision are still 'ready' in private storage
  SELECT COUNT(*)
    INTO v_missing_media_count
    FROM media_slot_usages u
    LEFT JOIN media_versions mv ON mv.id = u.version_id
   WHERE u.owner_type = 'revision'
     AND u.revision_id = p_revision_id
     AND (mv.id IS NULL OR mv.status <> 'ready');

  IF v_missing_media_count > 0 THEN
    RAISE EXCEPTION 'REVISION_MEDIA_UNAVAILABLE:% media version(s) are not ready',
      v_missing_media_count;
  END IF;

  -- Restore each scope in snapshot_payload into draft_payload ONLY (never published_payload — PUB-5a)
  FOR v_scope, v_scope_entry IN SELECT * FROM jsonb_each(v_rev.snapshot_payload) LOOP
    SELECT * INTO v_doc FROM content_documents WHERE scope_key = v_scope FOR UPDATE;
    IF FOUND THEN
      v_expected_ver := (p_expected_draft_versions ->> v_scope)::BIGINT;
      IF v_expected_ver IS NOT NULL AND v_doc.draft_version <> v_expected_ver THEN
        RAISE EXCEPTION 'VERSION_CONFLICT:scope=% expected=% actual=%',
          v_scope, v_expected_ver, v_doc.draft_version;
      END IF;

      UPDATE content_documents
         SET draft_payload = v_scope_entry -> 'payload',
             draft_version = draft_version + 1,
             draft_updated_at = NOW(),
             draft_updated_by = p_actor_user_id
       WHERE scope_key = v_scope;

      v_restored_count := v_restored_count + 1;
    END IF;
  END LOOP;

  -- Rebuild draft media_slot_usages from the revision's usages
  DELETE FROM media_slot_usages WHERE owner_type = 'draft';
  INSERT INTO media_slot_usages (slot_id, owner_type, scope_key, version_id, alt_text)
  SELECT slot_id, 'draft'::slot_ref_owner_type, scope_key, version_id, alt_text
    FROM media_slot_usages
   WHERE owner_type = 'revision'
     AND revision_id = p_revision_id;

  -- Write append-only audit log entry
  INSERT INTO audit_logs (
    event_type,
    actor_user_id,
    actor_email,
    actor_role,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    'content.restore_to_draft',
    p_actor_user_id,
    p_actor_email,
    'admin',
    'revision',
    p_revision_id::TEXT,
    jsonb_build_object(
      'restoredScopesCount', v_restored_count,
      'revisionNumber', v_rev.revision_number
    )
  );

  RETURN v_restored_count;
END;
$$;

-- 3. Atomic Shared Asset Replacement Across Drafts Only (MED-1)
CREATE OR REPLACE FUNCTION fn_replace_asset_version_in_drafts(
  p_asset_id TEXT,
  p_old_version_id TEXT,
  p_new_version_id TEXT,
  p_actor_user_id TEXT,
  p_actor_email TEXT
)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  v_affected_scopes TEXT[];
BEGIN
  -- Verify new version belongs to p_asset_id and is ready
  IF NOT EXISTS (
    SELECT 1 FROM media_versions
     WHERE id = p_new_version_id
       AND asset_id = p_asset_id
       AND status = 'ready'
  ) THEN
    RAISE EXCEPTION 'NEW_VERSION_NOT_READY:%', p_new_version_id;
  END IF;

  SELECT ARRAY_AGG(DISTINCT scope_key)
    INTO v_affected_scopes
    FROM media_slot_usages
   WHERE owner_type = 'draft'
     AND version_id = p_old_version_id;

  IF v_affected_scopes IS NULL THEN
    v_affected_scopes := '{}'::TEXT[];
  END IF;

  -- Update draft slot usages to reference new immutable version_id
  UPDATE media_slot_usages
     SET version_id = p_new_version_id
   WHERE owner_type = 'draft'
     AND version_id = p_old_version_id;

  -- Update media_assets pointer and bump draft_version on affected documents
  UPDATE media_assets
     SET current_version_id = p_new_version_id,
         updated_at = NOW()
   WHERE id = p_asset_id;

  UPDATE content_documents
     SET draft_payload = regexp_replace(draft_payload::TEXT, p_old_version_id, p_new_version_id, 'g')::JSONB,
         draft_version = draft_version + 1,
         draft_updated_at = NOW(),
         draft_updated_by = p_actor_user_id
   WHERE scope_key = ANY(v_affected_scopes);

  INSERT INTO audit_logs (
    event_type,
    actor_user_id,
    actor_email,
    actor_role,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    'media.replace_draft_references',
    p_actor_user_id,
    p_actor_email,
    'admin',
    'media_asset',
    p_asset_id,
    jsonb_build_object(
      'oldVersionId', p_old_version_id,
      'newVersionId', p_new_version_id,
      'affectedScopes', v_affected_scopes
    )
  );

  RETURN v_affected_scopes;
END;
$$;
