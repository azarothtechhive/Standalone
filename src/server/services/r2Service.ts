/**
 * R2 Storage Service
 * Handles Cloudflare R2 operations for media asset storage
 * Uses aws4fetch for S3-compatible API calls
 */

import { AwsClient } from 'aws4fetch';
import { logger } from '../core/logger';

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  privateBucket: string;
  publicBucket: string;
  publicBaseUrl: string;
  s3BaseUrl: string;
}

let r2Client: AwsClient | null = null;
let r2Config: R2Config | null = null;

/**
 * Clean account ID by stripping scheme and host if full URL was provided
 */
function cleanAccountId(rawId?: string): string {
  if (!rawId) return '';
  return rawId
    .replace(/^https?:\/\//, '')
    .replace(/\.r2\.cloudflarestorage\.com.*$/, '')
    .trim();
}

/**
 * Initialize R2 client from environment variables
 */
export function initializeR2Client(): boolean {
  const rawAccountId = process.env.R2_ACCOUNT_ID;
  const accountId = cleanAccountId(rawAccountId);
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const defaultBucket = process.env.R2_BUCKET || 'azaroth-cms-media';
  const privateBucket = process.env.R2_PRIVATE_BUCKET || defaultBucket;
  const publicBucket = process.env.R2_PUBLIC_BUCKET || defaultBucket;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL || (accountId ? `https://pub-${accountId.slice(0, 16)}.r2.dev` : '');

  if (!accountId || !accessKeyId || !secretAccessKey) {
    logger.warn('r2_service.missing_config', {
      meta: { hasAccountId: !!accountId, hasAccessKeyId: !!accessKeyId, hasSecret: !!secretAccessKey },
    });
    r2Client = null;
    r2Config = null;
    return false;
  }

  const s3BaseUrl = process.env.R2_S3_ENDPOINT?.replace(/\/$/, '') || `https://${accountId}.r2.cloudflarestorage.com`;

  r2Config = {
    accountId,
    accessKeyId,
    secretAccessKey,
    privateBucket,
    publicBucket,
    publicBaseUrl: publicBaseUrl.replace(/\/$/, ''),
    s3BaseUrl,
  };

  r2Client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    region: 'auto',
    service: 's3',
  });

  logger.info('r2_service.initialized', {
    meta: { accountId, privateBucket, publicBucket },
  });

  return true;
}

/**
 * Check if R2 is configured
 */
export function isR2Configured(): boolean {
  if (!r2Client || !r2Config) {
    return initializeR2Client();
  }
  return true;
}

/**
 * Upload file to R2
 */
export async function uploadToR2(
  key: string,
  file: Buffer | Uint8Array,
  contentType: string,
  bucket: 'private' | 'public' = 'private'
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isR2Configured() || !r2Client || !r2Config) {
    return { success: false, error: 'R2 not configured' };
  }

  const bucketName = bucket === 'public' ? r2Config.publicBucket : r2Config.privateBucket;
  const cleanKey = key.replace(/^\//, '');
  const endpoint = `${r2Config.s3BaseUrl}/${bucketName}/${cleanKey}`;

  try {
    const bodyData = file instanceof Buffer ? new Uint8Array(file) : file;
    const response = await r2Client.fetch(endpoint, {
      method: 'PUT',
      body: bodyData as any,
      headers: {
        'Content-Type': contentType,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('r2_service.upload.error', {
        meta: { key: cleanKey, bucket, status: response.status, error: errorText },
      });
      return { success: false, error: `Upload failed: ${response.status} ${errorText}` };
    }

    const url = bucket === 'public'
      ? `${r2Config.publicBaseUrl}/${cleanKey}`
      : endpoint;

    logger.info('r2_service.upload.success', {
      meta: { key: cleanKey, bucket, url },
    });

    return { success: true, url };
  } catch (error) {
    logger.error('r2_service.upload.exception', {
      meta: { key, bucket, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(
  key: string,
  bucket: 'private' | 'public' = 'private'
): Promise<{ success: boolean; error?: string }> {
  if (!isR2Configured() || !r2Client || !r2Config) {
    return { success: false, error: 'R2 not configured' };
  }

  const bucketName = bucket === 'public' ? r2Config.publicBucket : r2Config.privateBucket;
  const cleanKey = key.replace(/^\//, '');
  const endpoint = `${r2Config.s3BaseUrl}/${bucketName}/${cleanKey}`;

  try {
    const response = await r2Client.fetch(endpoint, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      logger.error('r2_service.delete.error', {
        meta: { key: cleanKey, bucket, status: response.status, error: errorText },
      });
      return { success: false, error: `Delete failed: ${response.status}` };
    }

    logger.info('r2_service.delete.success', {
      meta: { key: cleanKey, bucket },
    });

    return { success: true };
  } catch (error) {
    logger.error('r2_service.delete.exception', {
      meta: { key, bucket, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Fetch an object from R2. Used by the media proxy so private buckets can be
 * displayed without exposing credentials or relying on a public bucket URL.
 */
export async function getFromR2(
  key: string,
  bucket: 'private' | 'public' = 'private'
): Promise<{
  success: boolean;
  body?: ArrayBuffer;
  contentType?: string;
  contentLength?: number;
  error?: string;
}> {
  if (!isR2Configured() || !r2Client || !r2Config) {
    return { success: false, error: 'R2 not configured' };
  }

  const bucketName = bucket === 'public' ? r2Config.publicBucket : r2Config.privateBucket;
  const cleanKey = key.replace(/^\//, '');
  const endpoint = `${r2Config.s3BaseUrl}/${bucketName}/${cleanKey}`;

  try {
    const response = await r2Client.fetch(endpoint, { method: 'GET' });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      logger.error('r2_service.get.error', {
        meta: { key: cleanKey, bucket, status: response.status, error: errorText },
      });
      return { success: false, error: `Fetch failed: ${response.status}` };
    }

    const body = await response.arrayBuffer();
    const contentLength = Number(response.headers.get('content-length')) || body.byteLength;
    return {
      success: true,
      body,
      contentType: response.headers.get('content-type') || 'application/octet-stream',
      contentLength,
    };
  } catch (error) {
    logger.error('r2_service.get.exception', {
      meta: { key, bucket, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(key: string): string | null {
  if (!isR2Configured() || !r2Config) {
    return null;
  }
  const cleanKey = key.replace(/^\//, '');
  return `${r2Config.publicBaseUrl}/${cleanKey}`;
}

/**
 * Copy file from private to public bucket
 */
export async function copyToPublic(
  sourceKey: string,
  destKey: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isR2Configured() || !r2Client || !r2Config) {
    return { success: false, error: 'R2 not configured' };
  }

  const cleanSource = sourceKey.replace(/^\//, '');
  const cleanDest = destKey.replace(/^\//, '');
  const sourceEndpoint = `${r2Config.s3BaseUrl}/${r2Config.privateBucket}/${cleanSource}`;
  const destEndpoint = `${r2Config.s3BaseUrl}/${r2Config.publicBucket}/${cleanDest}`;

  try {
    // Get file from private bucket
    const getResponse = await r2Client.fetch(sourceEndpoint, {
      method: 'GET',
    });

    if (!getResponse.ok) {
      logger.error('r2_service.copy.get_error', {
        meta: { sourceKey: cleanSource, status: getResponse.status },
      });
      return { success: false, error: `Failed to fetch source: ${getResponse.status}` };
    }

    const file = await getResponse.arrayBuffer();
    const contentType = getResponse.headers.get('Content-Type') || 'application/octet-stream';

    // Put to public bucket
    const putResponse = await r2Client.fetch(destEndpoint, {
      method: 'PUT',
      body: Buffer.from(file),
      headers: {
        'Content-Type': contentType,
      },
    });

    if (!putResponse.ok) {
      logger.error('r2_service.copy.put_error', {
        meta: { destKey: cleanDest, status: putResponse.status },
      });
      return { success: false, error: `Failed to upload to public: ${putResponse.status}` };
    }

    const url = `${r2Config.publicBaseUrl}/${cleanDest}`;

    logger.info('r2_service.copy.success', {
      meta: { sourceKey: cleanSource, destKey: cleanDest, url },
    });

    return { success: true, url };
  } catch (error) {
    logger.error('r2_service.copy.exception', {
      meta: { sourceKey, destKey, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Initialize on module load
initializeR2Client();
