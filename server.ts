import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { Readable } from 'node:stream';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import { handleLivenessHealth, handleReadinessHealth } from './src/server/core/health';
import { getSecurityHeadersMap, type SecurityHeadersOptions } from './src/config/securityHeaders';
import { REDIRECT_RULES } from './src/config/redirects';
import contactHandler from './api/contact.ts';
import authHandler from './api/auth/[...path].ts';
import cmsHandler from './api/cms/[...path].ts';
import { handleRfqRequest } from './api/rfq.ts';
import { handleUploadRequest } from './api/media/upload.ts';
import { handleMediaFileRequest } from './api/media/file/[id].ts';

type FetchApiHandler = {
  fetch(request: Request): Promise<Response>;
};

function bridgeApiHandler(handler: FetchApiHandler): express.RequestHandler {
  return async (req, res) => {
    try {
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
          headers.set(name, Array.isArray(value) ? value.join(', ') : value);
        }
      }

      const isMultipart = req.is('multipart/form-data');
      if (!isMultipart) {
        headers.delete('content-length');
      }

      const hasBody = !['GET', 'HEAD'].includes(req.method);
      const hasJsonPayload = req.body !== undefined && typeof req.body === 'object' && Object.keys(req.body).length > 0;
      const body = isMultipart
        ? (Readable.toWeb(req) as ReadableStream<Uint8Array>)
        : hasBody && (hasJsonPayload || typeof req.body === 'string')
          ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
          : undefined;

      const webRequest = new Request(
        `${req.protocol}://${req.get('host') || 'localhost'}${req.originalUrl}`,
        {
          method: req.method,
          headers,
          ...(body !== undefined ? { body } : {}),
          ...(isMultipart ? { duplex: 'half' } : {}),
        }
      );
      const webResponse = await handler.fetch(webRequest);

      res.status(webResponse.status);
      webResponse.headers.forEach((value, name) => res.setHeader(name, value));
      res.send(await webResponse.text());
    } catch (error) {
      console.error('API adapter failed', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const port = Number(process.env.PORT || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '5mb' }));

  // Apply standard security headers (SEC-3, RT-5).
  // In dev mode, relax the CSP so Vite's HMR (inline scripts + ws) is not blocked.
  const securityHeaders = isProd
    ? getSecurityHeadersMap()
    : getSecurityHeadersMap({
        // Dev-only: allow Vite HMR client inline scripts and websocket.
        devCsp: true,
      } as SecurityHeadersOptions);
  app.use((_req, res, next) => {
    for (const [key, value] of Object.entries(securityHeaders)) {
      res.setHeader(key, value);
    }
    next();
  });

  // Apply 301 permanent redirects from single source of truth (SEO-5, RT-5)
  for (const rule of REDIRECT_RULES) {
    app.get(rule.source, (_req, res) => {
      res.redirect(rule.statusCode, rule.destination);
    });
  }

  // Liveness health check (OBS-2)
  app.all('/api/health', async (req, res) => {
    const url = `${req.protocol}://${req.get('host') || 'localhost:3000'}${req.originalUrl}`;
    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
    });
    const webRes = handleLivenessHealth(webReq);
    res.status(webRes.status);
    webRes.headers.forEach((val, key) => res.setHeader(key, val));
    res.send(await webRes.text());
  });

  // Readiness health check (OBS-2)
  app.all('/api/health/ready', async (req, res) => {
    const url = `${req.protocol}://${req.get('host') || 'localhost:3000'}${req.originalUrl}`;
    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
    });
    const webRes = await handleReadinessHealth(webReq);
    res.status(webRes.status);
    webRes.headers.forEach((val, key) => res.setHeader(key, val));
    res.send(await webRes.text());
  });

  // Mount Contact Form API (DEFECT-011)
  app.post('/api/contact', async (req, res) => {
    try {
      const webReq = new Request(`${req.protocol}://${req.get('host') || 'localhost:3000'}${req.originalUrl}`, {
        method: 'POST',
        headers: req.headers as Record<string, string>,
        body: JSON.stringify(req.body),
      });
      const webRes = await contactHandler.fetch(webReq);
      res.status(webRes.status);
      webRes.headers.forEach((val, key) => res.setHeader(key, val));
      res.send(await webRes.text());
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

  // Keep the local Node server on the same handlers used by Vercel functions.
  app.use('/api/auth', bridgeApiHandler(authHandler));
  app.use('/api/cms/media/upload', bridgeApiHandler({ fetch: handleUploadRequest }));
  app.use('/api/media/upload', bridgeApiHandler({ fetch: handleUploadRequest }));
  app.use('/api/media/file', bridgeApiHandler({ fetch: handleMediaFileRequest }));
  app.use('/api/cms', bridgeApiHandler(cmsHandler));
  app.use('/api/rfq', bridgeApiHandler({ fetch: handleRfqRequest }));

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Azaroth Tech-Hive server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
