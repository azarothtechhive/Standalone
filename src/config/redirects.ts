/**
 * Single source of truth for all 301 permanent redirects and canonical public routes
 * per SEO-5 and RT-5.
 */

export interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
  statusCode: 301 | 302;
}

export const CANONICAL_PUBLIC_ROUTES = [
  '/',
  '/about',
  '/portfolio',
  '/products',
  '/products/white-label-banking-platform',
  '/products/white-label-crypto-exchange',
  '/products/liquidity-aggregation-engine',
  '/products/custody-treasury-operations',
  '/services',
  '/services/core-banking-ledger-engineering',
  '/services/exchange-matching-liquidity-connectivity',
  '/services/compliance-kyc-kyt-travel-rule-integration',
  '/services/cloud-sre-devops-hsm-infrastructure',
  '/technology-insights',
  '/testimonials',
  '/connect-with-us',
  '/privacy-policy',
  '/terms-of-service',
] as const;

export const REDIRECT_RULES: readonly RedirectRule[] = [
  { source: '/who-we-are', destination: '/about', permanent: true, statusCode: 301 },
  { source: '/values', destination: '/about#our-values', permanent: true, statusCode: 301 },
  { source: '/delivery-framework', destination: '/about#delivery-framework', permanent: true, statusCode: 301 },
  { source: '/how-we-work', destination: '/about#delivery-framework', permanent: true, statusCode: 301 },
  { source: '/service', destination: '/services', permanent: true, statusCode: 301 },
  { source: '/projects', destination: '/portfolio', permanent: true, statusCode: 301 },
  { source: '/insights', destination: '/technology-insights', permanent: true, statusCode: 301 },
  { source: '/resource-hub', destination: '/technology-insights', permanent: true, statusCode: 301 },
  { source: '/contact', destination: '/connect-with-us', permanent: true, statusCode: 301 },
  { source: '/connect', destination: '/connect-with-us', permanent: true, statusCode: 301 },
  { source: '/request-for-quote', destination: '/connect-with-us', permanent: true, statusCode: 301 },
  { source: '/rfq', destination: '/connect-with-us', permanent: true, statusCode: 301 },
  { source: '/quote', destination: '/connect-with-us', permanent: true, statusCode: 301 },
] as const;
