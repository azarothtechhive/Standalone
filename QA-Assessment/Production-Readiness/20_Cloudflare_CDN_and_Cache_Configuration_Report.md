# Cloudflare CDN and Cache Configuration Report — Azaroth Tech-Hive

## 1. Executive Summary
This report details the Cloudflare CDN caching strategy for the Azaroth Tech-Hive application, balancing performance with content freshness.

## 2. Cache Rules
- **Immutable Assets (`/assets/*`, `/images/*`):** `Cache-Control: public, max-age=31536000, immutable` — Edge cached for 1 year.
- **HTML / Public Content:** `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` — Edge cached with SWR.
- **Admin / Authenticated Routes (`/admin/*`, `/api/auth/*`, `/api/cms/*`):** `Cache-Control: private, no-store, no-cache, must-revalidate` — Never cached publicly.
- **R2 Public Media:** Cached per R2 bucket policy and Cloudflare cache rules.

## 3. Cache Invalidation
- **Cache Purge API:** Integrated via `VercelCachePurgeAdapter` to purge tags (`cms:scope:page:*`) and paths on publish.
- **Cache Tagging:** Applied via `Cache-Tag` header for granular invalidation.

## 4. Conclusion
Cache configuration prevents stale public content while ensuring authenticated and dynamic data is never cached.