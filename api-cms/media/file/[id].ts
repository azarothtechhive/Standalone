import { getMediaAssetForStreaming } from '../../../src/server/repositories/cmsRepository';
import { getFromR2 } from '../../../src/server/services/r2Service';
import { logger } from '../../../src/server/core/logger';

function extractMediaId(pathname: string): string | null {
  const match = pathname.match(/\/api\/media\/file\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function handleMediaFileRequest(request: Request): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const id = extractMediaId(url.pathname);
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'Media id is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const asset = await getMediaAssetForStreaming(id);
    if (!asset) {
      return new Response(JSON.stringify({ success: false, error: 'Media asset not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }

    const publicKey = asset.stagingKey || '';
    const privateKey = asset.privateOriginalKey || '';
    const contentType = asset.mimeType || 'application/octet-stream';

    if (!publicKey && !privateKey) {
      return new Response(JSON.stringify({ success: false, error: 'Media file key is missing' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }

    let downloaded = publicKey ? await getFromR2(publicKey, 'public') : { success: false as const };
    if (!downloaded.success && privateKey && privateKey !== publicKey) {
      downloaded = await getFromR2(privateKey, 'private');
    }
    if (!downloaded.success && publicKey) {
      downloaded = await getFromR2(publicKey, 'private');
    }

    if (!downloaded.success || !downloaded.body) {
      return new Response(JSON.stringify({ success: false, error: 'Media file could not be loaded' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(request.method === 'HEAD' ? null : downloaded.body, {
      status: 200,
      headers: {
        'content-type': downloaded.contentType || contentType,
        'content-length': String(downloaded.contentLength || downloaded.body.byteLength),
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    logger.error('media.file.error', {
      route: '/api/media/file',
      method: request.method,
      statusCode: 500,
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return new Response(JSON.stringify({ success: false, error: 'Failed to load media file' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export default async function handler(req: any, res?: any) {
  if (res && typeof res.status === 'function') {
    const url = `${req.protocol || 'https'}://${req.headers?.host || 'localhost'}${req.url || '/api/media/file'}`;
    const webReq = new Request(url, { method: req.method, headers: req.headers });
    const webRes = await handleMediaFileRequest(webReq);
    res.status(webRes.status);
    webRes.headers.forEach((value: string, key: string) => res.setHeader(key, value));
    return res.send(Buffer.from(await webRes.arrayBuffer()));
  }
  return handleMediaFileRequest(req);
}

handler.fetch = handleMediaFileRequest;
