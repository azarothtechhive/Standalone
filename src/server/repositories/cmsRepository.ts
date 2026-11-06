/**
 * CMS Content Repository
 * Handles persistent storage and retrieval of CMS content
 * Replaces in-memory cmsState with database operations
 */

import { executeQuery, executeQueryOne, tbl } from '../core/database';
import { logger } from '../core/logger';
import { FormSubmissionRecord } from '../services/emailService';
import { SEED_MEDIA_SLOTS } from '../../seed/seedData';

export interface ContentDocument {
  scopeKey: string;
  draftPayload: any;
  draftVersion: number;
  draftUpdatedAt: string;
  draftUpdatedBy: string | null;
  publishedPayload: any;
  publishedVersion: number;
  publishedRevisionId: string | null;
  publishedAt: string;
  publishedBy: string | null;
}

export interface MediaAsset {
  id: string;
  displayName: string;
  currentVersionId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaVersion {
  id: string;
  assetId: string;
  versionNumber: number;
  status: 'pending' | 'ready' | 'failed' | 'trashed' | 'purging';
  publicState: 'private' | 'promoting' | 'public' | 'demoting';
  publishAttemptId: string | null;
  mimeType: string;
  byteSize: number;
  sha256Hex: string;
  width: number;
  height: number;
  stagingKey: string | null;
  privateOriginalKey: string;
  variantsMeta: any;
  promotedAt: string | null;
  unreferencedSince: string | null;
  trashedAt: string | null;
  createdBy: string | null;
  createdAt: string;
}

/**
 * Get content document by scope key
 */
export async function getContentDocument(scopeKey: string): Promise<ContentDocument | null> {
  try {
    const result = await executeQueryOne<ContentDocument>(
      `SELECT 
        scope_key as "scopeKey",
        draft_payload as "draftPayload",
        draft_version as "draftVersion",
        draft_updated_at as "draftUpdatedAt",
        draft_updated_by as "draftUpdatedBy",
        published_payload as "publishedPayload",
        published_version as "publishedVersion",
        published_revision_id as "publishedRevisionId",
        published_at as "publishedAt",
        published_by as "publishedBy"
      FROM ${tbl('content_documents')} 
      WHERE scope_key = $1`,
      [scopeKey]
    );
    
    return result;
  } catch (error) {
    logger.error('cms_repository.get_document.error', {
      meta: { scopeKey, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Get all content documents
 */
export async function getAllContentDocuments(): Promise<ContentDocument[]> {
  try {
    const results = await executeQuery<ContentDocument>(
      `SELECT 
        scope_key as "scopeKey",
        draft_payload as "draftPayload",
        draft_version as "draftVersion",
        draft_updated_at as "draftUpdatedAt",
        draft_updated_by as "draftUpdatedBy",
        published_payload as "publishedPayload",
        published_version as "publishedVersion",
        published_revision_id as "publishedRevisionId",
        published_at as "publishedAt",
        published_by as "publishedBy"
      FROM ${tbl('content_documents')}`
    );
    
    return results;
  } catch (error) {
    logger.error('cms_repository.get_all_documents.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

export async function getPublishedContentDocuments(): Promise<ContentDocument[]> {
  try {
    return await executeQuery<ContentDocument>(
      `SELECT
        scope_key as "scopeKey",
        published_payload as "publishedPayload",
        published_version as "publishedVersion",
        published_at as "publishedAt",
        published_by as "publishedBy"
      FROM ${tbl('content_documents')}
      WHERE published_version >= 1`,
      [],
      'public_ro'
    );
  } catch (error) {
    logger.error('cms_repository.get_published_documents.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Update draft content (upsert)
 */
export async function updateDraftContent(
  scopeKey: string,
  draftPayload: any,
  updatedBy: string
): Promise<ContentDocument | null> {
  try {
    const payloadJson = typeof draftPayload === 'string' ? draftPayload : JSON.stringify(draftPayload);
    const result = await executeQueryOne<ContentDocument>(
      `INSERT INTO ${tbl('content_documents')} (
        scope_key, draft_payload, draft_version, draft_updated_at, draft_updated_by,
        published_payload, published_version, published_at, published_by
      )
      VALUES ($1, $2::jsonb, 1, NOW(), $3, '{}'::jsonb, 0, NOW(), NULL)
      ON CONFLICT (scope_key) DO UPDATE SET
        draft_payload = $2::jsonb,
        draft_version = ${tbl('content_documents')}.draft_version + 1,
        draft_updated_at = NOW(),
        draft_updated_by = $3
      RETURNING 
        scope_key as "scopeKey",
        draft_payload as "draftPayload",
        draft_version as "draftVersion",
        draft_updated_at as "draftUpdatedAt",
        draft_updated_by as "draftUpdatedBy",
        published_payload as "publishedPayload",
        published_version as "publishedVersion",
        published_revision_id as "publishedRevisionId",
        published_at as "publishedAt",
        published_by as "publishedBy"`,
      [scopeKey, payloadJson, updatedBy]
    );
    
    if (result) {
      logger.info('cms_repository.draft_updated', {
        meta: { scopeKey, updatedBy },
      });
    }
    
    return result;
  } catch (error) {
    logger.error('cms_repository.update_draft.error', {
      meta: { scopeKey, updatedBy, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Publish content
 */
export async function publishContent(
  scopeKey: string,
  publishedBy: string
): Promise<ContentDocument | null> {
  try {
    const result = await executeQueryOne<ContentDocument>(
      `UPDATE ${tbl('content_documents')} 
      SET published_payload = draft_payload,
          published_version = draft_version,
          published_at = NOW(),
          published_by = $1
      WHERE scope_key = $2
      RETURNING 
        scope_key as "scopeKey",
        draft_payload as "draftPayload",
        draft_version as "draftVersion",
        draft_updated_at as "draftUpdatedAt",
        draft_updated_by as "draftUpdatedBy",
        published_payload as "publishedPayload",
        published_version as "publishedVersion",
        published_revision_id as "publishedRevisionId",
        published_at as "publishedAt",
        published_by as "publishedBy"`,
      [publishedBy, scopeKey]
    );
    
    if (result) {
      logger.info('cms_repository.content_published', {
        meta: { scopeKey, publishedBy },
      });
    }
    
    return result;
  } catch (error) {
    logger.error('cms_repository.publish.error', {
      meta: { scopeKey, publishedBy, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Create content document
 */
export async function createContentDocument(
  scopeKey: string,
  initialPayload: any,
  createdBy: string
): Promise<ContentDocument | null> {
  try {
    const payloadJson = typeof initialPayload === 'string' ? initialPayload : JSON.stringify(initialPayload);
    const result = await executeQueryOne<ContentDocument>(
      `INSERT INTO ${tbl('content_documents')} (scope_key, draft_payload, published_payload, draft_updated_by)
      VALUES ($1, $2::jsonb, '{}'::jsonb, $3)
      ON CONFLICT (scope_key) DO UPDATE SET
        draft_payload = $2::jsonb,
        draft_updated_at = NOW(),
        draft_updated_by = $3
      RETURNING 
        scope_key as "scopeKey",
        draft_payload as "draftPayload",
        draft_version as "draftVersion",
        draft_updated_at as "draftUpdatedAt",
        draft_updated_by as "draftUpdatedBy",
        published_payload as "publishedPayload",
        published_version as "publishedVersion",
        published_revision_id as "publishedRevisionId",
        published_at as "publishedAt",
        published_by as "publishedBy"`,
      [scopeKey, payloadJson, createdBy]
    );
    
    return result;
  } catch (error) {
    logger.error('cms_repository.create.error', {
      meta: { scopeKey, createdBy, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Get media asset by ID
 */
export async function getMediaAsset(id: string): Promise<MediaAsset | null> {
  try {
    const result = await executeQueryOne<MediaAsset>(
      `SELECT 
        id,
        display_name as "displayName",
        current_version_id as "currentVersionId",
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM ${tbl('media_assets')} 
      WHERE id = $1`,
      [id]
    );
    
    return result;
  } catch (error) {
    logger.error('cms_repository.get_media_asset.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Get all media assets
 */
export async function getAllMediaAssets(): Promise<any[]> {
  try {
    const results = await executeQuery<any>(
      `SELECT
        a.id,
        a.display_name as "displayName",
        a.current_version_id as "currentVersionId",
        a.created_by as "createdBy",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt",
        v.mime_type as "mimeType",
        v.byte_size as "sizeBytes",
        v.width,
        v.height,
        v.staging_key as "stagingKey",
        v.private_original_key as "privateOriginalKey",
        v.variants_meta as "variantsMeta"
      FROM ${tbl('media_assets')} a
      LEFT JOIN ${tbl('media_versions')} v ON a.current_version_id = v.id
      ORDER BY a.created_at DESC`
    );

    const resolveUrl = (row: any) => {
      try {
        const meta = typeof row.variantsMeta === 'string' ? JSON.parse(row.variantsMeta) : row.variantsMeta;
        if (meta?.original?.sourcePublicPath) {
          return meta.original.sourcePublicPath;
        }
      } catch {}
      if (row.stagingKey && (row.stagingKey.startsWith('http://') || row.stagingKey.startsWith('https://') || row.stagingKey.startsWith('/'))) {
        return row.stagingKey;
      }
      const slot = SEED_MEDIA_SLOTS.find(s => s.assetId === row.id || s.versionId === row.currentVersionId);
      if (slot?.sourcePublicPath) {
        return slot.sourcePublicPath;
      }
      return `/api/media/file/${row.id}`;
    };

    // Transform to match CmsMedia interface expected by frontend
    return results.map(row => ({
      id: row.id,
      displayName: row.displayName || row.id,
      filename: row.displayName || row.id,
      originalName: row.displayName || row.id,
      mimeType: row.mimeType || 'application/octet-stream',
      sizeBytes: Number(row.sizeBytes) || 0,
      width: row.width || 0,
      height: row.height || 0,
      stagingKey: row.stagingKey || '',
      privateOriginalKey: row.privateOriginalKey || '',
      url: resolveUrl(row),
      altText: row.displayName || '',
      category: 'general',
      createdAt: row.createdAt,
      isLocal: false,
    }));
  } catch (error) {
    logger.error('cms_repository.get_all_media_assets.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Get a single media asset with its current version storage keys.
 * Used by the media streaming proxy to resolve an asset id to an object key.
 */
export async function getMediaAssetForStreaming(id: string): Promise<{
  id: string;
  displayName: string;
  mimeType: string;
  byteSize: number;
  stagingKey: string | null;
  privateOriginalKey: string | null;
} | null> {
  try {
    return await executeQueryOne(
      `SELECT
        a.id,
        a.display_name as "displayName",
        v.mime_type as "mimeType",
        v.byte_size as "byteSize",
        v.staging_key as "stagingKey",
        v.private_original_key as "privateOriginalKey"
      FROM ${tbl('media_assets')} a
      LEFT JOIN ${tbl('media_versions')} v ON a.current_version_id = v.id
      WHERE a.id = $1
      LIMIT 1`,
      [id]
    );
  } catch (error) {
    logger.error('cms_repository.get_media_asset_for_streaming.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Create media asset
 */
export async function createMediaAsset(
  id: string,
  displayName: string,
  createdBy: string
): Promise<MediaAsset | null> {
  try {
    const result = await executeQueryOne<MediaAsset>(
      `INSERT INTO ${tbl('media_assets')} (id, display_name, created_by)
      VALUES ($1, $2, $3)
      RETURNING 
        id,
        display_name as "displayName",
        current_version_id as "currentVersionId",
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [id, displayName, createdBy]
    );
    
    return result;
  } catch (error) {
    logger.error('cms_repository.create_media_asset.error', {
      meta: { id, displayName, createdBy, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Create media version
 */
export async function createMediaVersion(
  version: Omit<MediaVersion, 'createdAt'>
): Promise<MediaVersion | null> {
  try {
    const variantsJson = typeof version.variantsMeta === 'string' ? version.variantsMeta : JSON.stringify(version.variantsMeta || {});
    const result = await executeQueryOne<MediaVersion>(
      `INSERT INTO ${tbl('media_versions')} (
        id, asset_id, version_number, status, public_state,
        publish_attempt_id, mime_type, byte_size, sha256_hex,
        width, height, staging_key, private_original_key, variants_meta,
        promoted_at, unreferenced_since, trashed_at, created_by
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15, $16, $17, $18
      )
      RETURNING 
        id,
        asset_id as "assetId",
        version_number as "versionNumber",
        status,
        public_state as "publicState",
        publish_attempt_id as "publishAttemptId",
        mime_type as "mimeType",
        byte_size as "byteSize",
        sha256_hex as "sha256Hex",
        width,
        height,
        staging_key as "stagingKey",
        private_original_key as "privateOriginalKey",
        variants_meta as "variantsMeta",
        promoted_at as "promotedAt",
        unreferenced_since as "unreferencedSince",
        trashed_at as "trashedAt",
        created_by as "createdBy",
        created_at as "createdAt"`,
      [
        version.id,
        version.assetId,
        version.versionNumber,
        version.status,
        version.publicState,
        version.publishAttemptId || null,
        version.mimeType,
        version.byteSize,
        version.sha256Hex,
        version.width,
        version.height,
        version.stagingKey || null,
        version.privateOriginalKey,
        variantsJson,
        version.promotedAt || null,
        version.unreferencedSince || null,
        version.trashedAt || null,
        version.createdBy || null,
      ]
    );
    
    return result;
  } catch (error) {
    logger.error('cms_repository.create_media_version.error', {
      meta: { version: version.id, assetId: version.assetId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Update media asset current version
 */
export async function updateMediaAssetCurrentVersion(
  assetId: string,
  versionId: string
): Promise<MediaAsset | null> {
  try {
    const result = await executeQueryOne<MediaAsset>(
      `UPDATE ${tbl('media_assets')} 
      SET current_version_id = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING 
        id,
        display_name as "displayName",
        current_version_id as "currentVersionId",
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [versionId, assetId]
    );
    
    return result;
  } catch (error) {
    logger.error('cms_repository.update_media_version.error', {
      meta: { assetId, versionId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Delete media asset
 */
export async function deleteMediaAsset(id: string): Promise<boolean> {
  try {
    const result = await executeQueryOne<{ id: string }>(
      `DELETE FROM ${tbl('media_assets')} WHERE id = $1 RETURNING id`,
      [id]
    );
    return result !== null;
  } catch (error) {
    logger.error('cms_repository.delete_media_asset.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Get form submissions (enquiries & RFQs)
 */
export async function getFormSubmissions(
  limit: number = 50,
  offset: number = 0,
  inquiryType?: 'general' | 'product'
): Promise<any[]> {
  try {
    const results = await executeQuery(
      `SELECT 
        id,
        inquiry_type as "inquiryType",
        full_name as "fullName",
        work_email as "workEmail",
        phone,
        company_name as "companyName",
        subject_or_product as "subjectOrProduct",
        deployment_or_size as "deploymentOrSize",
        message,
        status,
        follow_up_note as "followUpNote",
        assigned_to as "assignedTo",
        next_follow_up_at as "nextFollowUpAt",
        consent_accepted as "consentAccepted",
        ip_hash as "ipHash",
        payload_digest as "payloadDigest",
        rfq_details as "rfqDetails",
        created_at as "createdAt",
        expires_at as "expiresAt"
      FROM ${tbl('form_submissions')}
      WHERE ($3::text IS NULL OR inquiry_type = $3)
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset, inquiryType ?? null]
    );
    
    return results;
  } catch (error) {
    logger.error('cms_repository.get_form_submissions.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

export async function countFormSubmissions(status?: 'NEW' | 'IN_PROGRESS' | 'QUALIFIED' | 'CLOSED'): Promise<number> {
  const result = await executeQueryOne<{ count: string | number }>(
    `SELECT COUNT(*) AS count
     FROM ${tbl('form_submissions')}
     WHERE ($1::text IS NULL OR status = $1)`,
    [status ?? null]
  );
  return Number(result?.count ?? 0);
}

export type EnquiryStatus =
  | 'NEW'
  | 'OPEN'
  | 'CONTACTED'
  | 'IN_PROGRESS'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'CLOSED';

export async function updateFormSubmission(
  id: string,
  metadata: {
    status?: EnquiryStatus;
    followUpNote?: string | null;
    assignedTo?: string | null;
    nextFollowUpAt?: string | null;
  },
  inquiryType?: 'general' | 'product'
): Promise<boolean> {
  const result = await executeQueryOne<{ id: string }>(
    `UPDATE ${tbl('form_submissions')}
     SET status = COALESCE($2, status),
         follow_up_note = COALESCE($3, follow_up_note),
         assigned_to = COALESCE($4, assigned_to),
         next_follow_up_at = COALESCE($5::timestamptz, next_follow_up_at)
     WHERE id = $1 AND ($6::text IS NULL OR inquiry_type = $6)
     RETURNING id`,
    [
      id,
      metadata.status ?? null,
      metadata.followUpNote ?? null,
      metadata.assignedTo ?? null,
      metadata.nextFollowUpAt ?? null,
      inquiryType ?? null,
    ]
  );
  return result !== null;
}

/**
 * Delete form submission
 */
export async function deleteFormSubmission(id: string, inquiryType?: 'general' | 'product'): Promise<boolean> {
  try {
    const result = await executeQueryOne<{ id: string }>(
      `DELETE FROM ${tbl('form_submissions')}
       WHERE id = $1 AND ($2::text IS NULL OR inquiry_type = $2)
       RETURNING id`,
      [id, inquiryType ?? null]
    );
    return result !== null;
  } catch (error) {
    logger.error('cms_repository.delete_form_submission.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Record an append-only audit log
 */
export async function recordAuditLogEntry(log: {
  eventType: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  targetType: string;
  targetId?: string | null;
  metadata?: any;
}): Promise<void> {
  try {
    const metaJson = typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata || {});
    await executeQuery(
      `INSERT INTO ${tbl('audit_logs')} (
        event_type, actor_user_id, actor_email, actor_role,
        ip_address, user_agent, target_type, target_id, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())`,
      [
        log.eventType,
        log.actorUserId || null,
        log.actorEmail || null,
        log.actorRole || null,
        log.ipAddress || null,
        log.userAgent || null,
        log.targetType,
        log.targetId || null,
        metaJson,
      ]
    );
  } catch (error) {
    logger.error('cms_repository.record_audit_log.error', {
      meta: { eventType: log.eventType, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Get audit logs
 */
export async function getAuditLogs(limit: number = 100, offset: number = 0): Promise<any[]> {
  try {
    const results = await executeQuery(
      `SELECT
        id,
        event_type as "eventType",
        actor_user_id as "actorUserId",
        actor_email as "actorEmail",
        actor_role as "actorRole",
        ip_address as "ipAddress",
        user_agent as "userAgent",
        target_type as "targetType",
        target_id as "targetId",
        metadata,
        created_at as "createdAt"
      FROM ${tbl('audit_logs')}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return results;
  } catch (error) {
    logger.error('cms_repository.get_audit_logs.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

export interface EmailNotificationRecord {
  id: string;
  submissionId: string;
  notificationType: 'COMPANY_NOTIFICATION' | 'CUSTOMER_ACKNOWLEDGEMENT';
  recipientEmail: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'RETRY';
  providerMessageId?: string | null;
  errorMessage?: string | null;
  attempts: number;
  lastAttemptAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

/**
 * Get email notifications for a form submission
 */
export async function getEmailNotifications(submissionId: string): Promise<EmailNotificationRecord[]> {
  try {
    const results = await executeQuery<EmailNotificationRecord>(
      `SELECT
        id,
        submission_id as "submissionId",
        notification_type as "notificationType",
        recipient_email as "recipientEmail",
        subject,
        status,
        provider_message_id as "providerMessageId",
        error_message as "errorMessage",
        attempts,
        last_attempt_at as "lastAttemptAt",
        sent_at as "sentAt",
        created_at as "createdAt"
      FROM ${tbl('email_notifications')}
      WHERE submission_id = $1
      ORDER BY created_at DESC`,
      [submissionId]
    );
    return results;
  } catch (error) {
    logger.error('cms_repository.get_email_notifications.error', {
      meta: { submissionId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return [];
  }
}

/**
 * Retry failed email notifications for a submission
 */
export async function retryFailedEmailNotifications(submissionId: string): Promise<{ retried: number; failed: number }> {
  try {
    const { sendCompanyNotification, sendCustomerAcknowledgement } = await import('../services/emailService');

    const notifications = await executeQuery<EmailNotificationRecord>(
      `SELECT * FROM ${tbl('email_notifications')}
       WHERE submission_id = $1 AND status IN ('FAILED', 'RETRY')
       ORDER BY created_at`,
      [submissionId]
    );

    let retried = 0;
    let failed = 0;

    for (const notification of notifications) {
      // Get the submission record
      const submission = await executeQueryOne<FormSubmissionRecord>(
        `SELECT * FROM ${tbl('form_submissions')} WHERE id = $1`,
        [submissionId]
      );

      if (!submission) {
        failed++;
        continue;
      }

      // Update status to RETRY
      await executeQuery(
        `UPDATE ${tbl('email_notifications')} SET status = 'RETRY', attempts = attempts + 1 WHERE id = $1`,
        [notification.id]
      );

      let success = false;
      if (notification.notificationType === 'COMPANY_NOTIFICATION') {
        const result = await sendCompanyNotification(submission);
        success = result.success;
      } else if (notification.notificationType === 'CUSTOMER_ACKNOWLEDGEMENT') {
        const result = await sendCustomerAcknowledgement(submission);
        success = result.success;
      }

      if (success) {
        retried++;
      } else {
        failed++;
      }
    }

    return { retried, failed };
  } catch (error) {
    logger.error('cms_repository.retry_failed_email_notifications.error', {
      meta: { submissionId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { retried: 0, failed: 0 };
  }
}
