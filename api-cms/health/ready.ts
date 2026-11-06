import { handleReadinessHealth } from '../../src/server/core/health';

export async function handleReadyRequest(request: Request): Promise<Response> {
  return handleReadinessHealth(request);
}

export default async function handler(req: any, res?: any) {
  if (res && typeof res.status === 'function') {
    const url = `${req.protocol || 'https'}://${req.headers?.host || 'localhost'}${req.url || '/api/health/ready'}`;
    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers,
    });
    const webRes = await handleReadinessHealth(webReq);
    res.status(webRes.status);
    webRes.headers.forEach((val: string, key: string) => res.setHeader(key, val));
    return res.send(await webRes.text());
  }
  return handleReadinessHealth(req);
}

handler.fetch = handleReadinessHealth;
