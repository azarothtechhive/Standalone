import { handleLivenessHealth, handleReadinessHealth } from '../src/server/core/health';

export async function handleHealthRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const isReady = url.pathname.includes('/ready') || url.searchParams.get('type') === 'ready';

  if (isReady) {
    return handleReadinessHealth(request);
  }

  return handleLivenessHealth(request);
}

export default async function handler(req: any, res?: any) {
  if (res && typeof res.status === 'function') {
    const url = `${req.protocol || 'https'}://${req.headers?.host || 'localhost'}${req.url || '/api/health'}`;
    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers,
    });
    const webRes = await handleHealthRequest(webReq);
    res.status(webRes.status);
    webRes.headers.forEach((val, key) => res.setHeader(key, val));
    return res.send(await webRes.text());
  }
  return handleHealthRequest(req);
}

handler.fetch = handleHealthRequest;
