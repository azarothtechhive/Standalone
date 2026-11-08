#!/usr/bin/env node
/**
 * Host Configuration Generator (/scripts/generate-host-config.mjs)
 * Covers: RT-5, HOST-1, SEC-3, SEO-5
 *
 * Generates `/vercel.json` from the single source of truth modules:
 * - `/src/config/securityHeaders.ts`
 * - `/src/config/redirects.ts`
 * - `/src/server/core/cache.ts`
 */

import fs from 'node:fs';
import path from 'node:path';
import { getSecurityHeadersMap } from '../src/config/securityHeaders.ts';
import { REDIRECT_RULES } from '../src/config/redirects.ts';
import { CACHE_CONTROL_POLICIES } from '../src/server/core/cache.ts';

export function buildVercelConfigObject() {
  const securityHeadersMap = getSecurityHeadersMap({
    r2PublicBaseUrl: 'https://*.r2.dev',
    r2PrivateEndpoint: 'https://*.r2.cloudflarestorage.com',
  });

  const securityHeaderList = Object.entries(securityHeadersMap).map(([key, value]) => ({
    key,
    value,
  }));

  return {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    framework: 'vite',
    functions: {
      'api/**/*': {
        runtime: 'nodejs20.x',
      },
    },
    crons: [
      {
        path: '/api/internal/reconcile',
        schedule: '0 3 * * *',
      },
    ],
    redirects: REDIRECT_RULES.map((rule) => ({
      source: rule.source,
      destination: rule.destination,
      permanent: rule.permanent,
    })),
    headers: [
      {
        source: '/(.*)',
        headers: securityHeaderList,
      },
      {
        source: '/api/admin/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: CACHE_CONTROL_POLICIES.privateNoStore,
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive',
          },
        ],
      },
      {
        source: '/admin/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: CACHE_CONTROL_POLICIES.privateNoStore,
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive',
          },
        ],
      },
      {
        source: '/api/health(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: CACHE_CONTROL_POLICIES.privateNoStore,
          },
        ],
      },
    ],
    rewrites: [
      {
        source: '/((?!api/|assets/|images/|favicon\\.ico|Favicon\\.png|Logo\\.png|robots\\.txt|sitemap\\.xml).*)',
        destination: '/index.html',
      },
    ],
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = buildVercelConfigObject();
  const outPath = path.resolve(process.cwd(), 'vercel.json');
  fs.writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  console.log(
    `[generate:config] Generated vercel.json (${config.redirects.length} 301 redirects, ${config.headers.length} header rule sets, non-shadowing rewrites, and daily Hobby-compatible cron).`
  );
}
