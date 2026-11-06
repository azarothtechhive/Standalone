/**
 * Single source of truth for Content-Security-Policy (CSP) and HTTP security headers
 * per SEC-3 and RT-5.
 *
 * Used by:
 * - /scripts/generate-host-config.mjs to generate vercel.json (and P2 Cloudflare _headers)
 * - Class A / Class B API responses and HTML rendering handlers
 */

export interface SecurityHeadersOptions {
  siteUrl?: string;
  r2PublicBaseUrl?: string;
  r2PrivateEndpoint?: string;
  /** When true, relax the CSP for local Vite dev servers (HMR inline scripts + ws). */
  devCsp?: boolean;
}

export function buildContentSecurityPolicy(options: SecurityHeadersOptions = {}): string {
  const r2PublicOrigin = normalizeOrigin(
    options.r2PublicBaseUrl || process.env.R2_PUBLIC_BASE_URL || 'https://*.r2.dev'
  );
  const r2PrivateOrigin = normalizeOrigin(
    options.r2PrivateEndpoint ||
      process.env.R2_S3_ENDPOINT ||
      'https://*.r2.cloudflarestorage.com'
  );

  const imgSources = ["'self'", 'data:', 'blob:', r2PublicOrigin, 'https://images.unsplash.com']
    .filter(Boolean)
    .join(' ');
  const mediaSources = ["'self'", r2PublicOrigin].filter(Boolean).join(' ');
  const connectSources = [
    "'self'",
    'ws:',
    'https:',
    r2PublicOrigin,
    r2PrivateOrigin,
  ].filter(Boolean).join(' ');

  const directives = [
    "default-src 'self'",
    options.devCsp
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://localhost https://*.localhost"
      : "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    `img-src ${imgSources}`,
    `media-src ${mediaSources}`,
    `connect-src ${connectSources}`,
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(options.devCsp ? [] : ['upgrade-insecure-requests']),
  ];

  return directives.join('; ');
}

export function getSecurityHeadersMap(options: SecurityHeadersOptions = {}): Record<string, string> {
  return {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Content-Security-Policy': buildContentSecurityPolicy(options),
  };
}

function normalizeOrigin(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (trimmed.includes('*')) {
    return trimmed.replace(/\/+$/, '');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed.replace(/\/+$/, '');
  }
}
