import crypto from 'node:crypto';
import { logger } from '../../src/server/core/logger';
import * as authService from '../../src/server/services/authService';
import * as cmsService from '../../src/server/services/cmsService';

export async function handleUploadRequest(request: Request): Promise<Response> {
    const method = request.method;

    if (method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const assetId = formData.get('assetId') as string;
      const displayName = formData.get('displayName') as string;

      if (!file) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No file provided',
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get session token from authorization header (Bearer) or cookies
      const cookieHeader = request.headers.get('cookie') || '';
      const authHeader = request.headers.get('authorization') || '';
      let bearerToken: string | null = null;
      let cookieToken: string | null = null;

      if (authHeader.startsWith('Bearer ')) {
        bearerToken = authHeader.slice('Bearer '.length).trim().replace(/^"(.*)"$/, '$1');
      }

      if (cookieHeader) {
        const parts = cookieHeader.split(';');
        for (const part of parts) {
          const [rawName, ...rest] = part.trim().split('=');
          if (rawName === 'azaroth_session' || rawName === 'session_token') {
            cookieToken = decodeURIComponent(rest.join('=')).trim().replace(/^"(.*)"$/, '$1');
            break;
          }
        }
      }

      if (!bearerToken && !cookieToken) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Authentication required',
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get authenticated account
      let account = bearerToken ? await authService.getAuthenticatedAccount(bearerToken) : null;
      if (!account && cookieToken && cookieToken !== bearerToken) {
        account = await authService.getAuthenticatedAccount(cookieToken);
      }
      if (!account) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Not authenticated',
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Validate file type. Images are the primary media assets; PDFs and
      // common document formats are also supported for whitepapers.
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid file type. Allowed: images (JPEG, PNG, WebP, SVG, GIF) and PDF/DOC/DOCX',
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Validate file size (max 20MB)
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        return new Response(JSON.stringify({
          success: false,
          error: 'File too large. Maximum size: 20MB',
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get image dimensions
      const buffer = await file.arrayBuffer();
      const dimensions = await getImageDimensions(buffer, file.type);

      // Create asset if not provided
      let finalAssetId = assetId;
      if (!finalAssetId) {
        const createResult = await cmsService.createMediaAsset(displayName || file.name, account);
        if (!createResult.success) {
          return new Response(JSON.stringify({
            success: false,
            error: createResult.message,
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        finalAssetId = createResult.asset?.id || '';
      }

      // Upload file
      const uploadResult = await cmsService.uploadMediaFile(
        finalAssetId,
        Buffer.from(buffer),
        file.name,
        file.type,
        dimensions.width,
        dimensions.height,
        account
      );

      if (!uploadResult.success) {
        return new Response(JSON.stringify({
          success: false,
          error: uploadResult.message,
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      logger.info('media.upload.success', {
        route: '/api/media/upload',
        method: 'POST',
        statusCode: 200,
        meta: { assetId: finalAssetId, fileName: file.name, size: file.size },
      });

      const mediaItem = {
        id: finalAssetId,
        filename: file.name,
        originalName: displayName || file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        url: uploadResult.url || `/api/media/file/${finalAssetId}`,
        altText: displayName || file.name,
        category: 'general',
        createdAt: new Date().toISOString(),
        dimensions,
      };

      return new Response(JSON.stringify({
        success: true,
        media: mediaItem,
        data: {
          assetId: finalAssetId,
          versionId: uploadResult.version?.id,
          fileName: file.name,
          size: file.size,
          mimeType: file.type,
          width: dimensions.width,
          height: dimensions.height,
          url: mediaItem.url,
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      logger.error('media.upload.error', {
        route: '/api/media/upload',
        method: 'POST',
        statusCode: 500,
        meta: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to upload media',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
}

export default async function handler(req: any, res?: any) {
  if (res && typeof res.status === 'function') {
    const url = `${req.protocol || 'https'}://${req.headers?.host || 'localhost'}${req.url || '/api/media/upload'}`;
    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
    const webRes = await handleUploadRequest(webReq);
    res.status(webRes.status);
    webRes.headers.forEach((val: string, key: string) => res.setHeader(key, val));
    return res.send(await webRes.text());
  }
  return handleUploadRequest(req);
}

handler.fetch = handleUploadRequest;

/**
 * Get image dimensions from buffer
 */
async function getImageDimensions(buffer: ArrayBuffer, mimeType: string): Promise<{ width: number; height: number }> {
  // For SVG, return default dimensions
  if (mimeType === 'image/svg+xml') {
    return { width: 800, height: 600 };
  }

  // For raster images, use a simple approach
  // In production, you'd use a proper image processing library like sharp
  // For now, return default dimensions
  return { width: 1920, height: 1080 };
}
