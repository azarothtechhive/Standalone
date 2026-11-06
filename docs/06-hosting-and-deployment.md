# Phase 2 Deliverable — Hosting, SEO Strategy & Deployment Configuration Design (`/docs/06-hosting-and-deployment.md`)

Covers requirements: `HOST-1`–`HOST-5`, `SEO-1`–`SEO-6`, `RT-5`.
*(Per `HR-8`, no `vercel.json` or `.env.example` files are modified in the repository until Gate 2 is approved; this document specifies their exact design for Phase 3.)*

---

## 1. SEO & Crawler-Visible Rendering Strategy (`[SEO-1]`–`[SEO-6]`)

### 1.1 Why Client-Only `react-helmet-async` Fails Crawler & Social-Bot Requirements
As verified by running `/qa-tools/verify-seo-html.mjs` against `https://standalone-omega-one.vercel.app/` in Phase 1 (`/docs/01-inventory.md` §8), the current live deployment serves the exact same static `index.html` on every route (`/about`, `/products`, `/services`, `/portfolio`, `/technology-insights`, `/connect-with-us`), with:
- Identical homepage `<title>` and `<meta name="description">` on all 17 routes.
- Missing `<link rel="canonical">` (`null`) in raw HTML.
- `<meta name="theme-color" content="#7A0C16" />` hardcoded in `index.html`.
- Non-JS social bots (`Slackbot`, `Twitterbot`, `facebookexternalhit`, `LinkedInBot`, `WhatsApp`) and `curl` never execute `react-helmet-async`, seeing only the static homepage tags.

### 1.2 Chosen Strategy: Option A — Edge/Function HTML Metadata & Payload Injection (`[SEO-2]`, `[SEO-4]`)
We select **Option A** (Section 15 preferred strategy):
1. **How Crawlers & Visitors Receive Metadata and Content in Initial HTML (`src/server/core/seoInjector.ts` — Class A):**
   - Public page requests (`GET /`, `/about`, `/portfolio`, `/products`, `/products/:slug`, `/services`, `/technology-insights`, `/technology-insights/:slug`, `/testimonials`, `/connect-with-us`, `/privacy-policy`, `/terms-of-service`) are served by the Class A HTML handler.
   - Using the restricted read-only database role (`azaroth_public_ro`, `DATABASE_URL_PUBLIC`), the handler queries **only** committed `published_payload` from Neon for the requested route plus global settings/header/footer.
   - It injects into the compiled `index.html` template before sending the HTTP response:
     - `<title>` (escaped, per-page CMS title)
     - `<meta name="description" content="...">`
     - `<link rel="canonical" href="${SITE_URL}${canonicalPath}">`
     - `<meta property="og:title">`, `og:description`, `og:url`, `og:type`, `og:site_name`, and `og:image` (resolved to the `public` R2 URL of the page's social image or site default logo)
     - `<meta name="twitter:card" content="summary_large_image">`, `twitter:title`, `twitter:description`, `twitter:image`
     - `<meta name="robots" content="${page.robots || 'index, follow'}">`
     - `<meta name="theme-color" content="#8E4585">` (plum brand token, `BRAND-2`, `SEO-1`)
     - `<link rel="icon" href="${publishedFaviconPublicUrl}">`
     - Semantic crawler-visible `<noscript>` / initial hydration content block (`<h1>`, summary, and canonical links) + `<script id="__INITIAL_CMS_DATA__" type="application/json">` containing the published route payload so React hydrates synchronously on first paint with **zero client-side fetch waterfall** and **zero CLS** (`PERF-4`).
   - If a requested dynamic slug (`/products/:slug` or `/technology-insights/:slug`) or unknown path does not exist in published content, the handler returns **HTTP `404`** with `<meta name="robots" content="noindex, nofollow">` and the CMS-managed 404 copy (`OPS-1`).
2. **Draft Isolation Guarantee (`SEO-4`, Invariant #1):**
   - The HTML injector connects exclusively with `azaroth_public_ro` (which has zero database permission on `draft_payload`, `revisions`, or non-`public` media versions) and sets `Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400` along with `Vercel-Cache-Tag` / `Cache-Tag` headers (`cms:page:{slug}`, `cms:global`).
   - Authenticated Live Preview (`/admin/preview?path=...`) is served on a separate `/admin/*` route that requires a valid session cookie, sets `Cache-Control: private, no-store, no-cache, must-revalidate` and `X-Robots-Tag: noindex, nofollow`, and streams draft media via `/api/admin/media/preview/{versionId}` from `R2_PRIVATE_BUCKET`.

### 1.3 Freshness Delays: Purge-Path vs. No-Purge Worst-Case TTL Bound (`[SEO-3]`, `[SEO-4]`)
Per `SEO-3`, we explicitly document both freshness bounds:
1. **Purge-Path Delay (Normal Operation when Step 4 Cache Purge Succeeds):**
   - Immediately after Step 3 (`fn_commit_publish`) commits in Neon, Step 4 calls `VercelCachePurgeAdapter.purge({ tags, paths })`.
   - **Target Purge-Path Delay:** **$\le 2\text{ seconds}$** globally across Vercel Edge PoPs (`target, unverified` until measured across $\ge 10$ publish trials on the deployed Vercel host in Phase 7 per `SEO-3` / `HR-6`).
2. **No-Purge Worst-Case TTL Bound (Fallback if Purge Call Fails or No Purge Token Configured):**
   - With `Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`:
     - Freshness lifetime at the shared edge cache (`s-maxage`) is **`3600 seconds` (1 hour)**.
     - If an edge PoP serves a stale entry during the `stale-while-revalidate` window (`86400 seconds` = 24 hours), the first request after `3600s` triggers an asynchronous background revalidation that updates the cache within ~1–2 seconds; if a PoP receives zero traffic for up to **`90,000 seconds` (25 hours = `3600s + 86400s`)**, the entry expires completely.
     - Meanwhile, `RECON-CORE` and the background retry worker retry failed purges at `10s`, `60s`, and `300s` (`PUB-7`).
     - Note that M4 media grace period (`7 days` = `604,800 seconds`) is strictly greater than `max cache TTL (25 hours) + 24 hours` (`49 hours`), guaranteeing that even a stale cached HTML page can never reference a deleted public R2 image (`MED-INV`).

### 1.4 URL Preservation, 301 Redirects, `robots.txt` & Dynamic `sitemap.xml` (`[SEO-5]`)
- **All 17 Canonical Public URLs Preserved:** `/`, `/about`, `/portfolio`, `/products`, `/products/fitness-management-platform`, `/products/omnichannel-commerce-platform`, `/products/learning-management-platform`, `/products/healthcare-management-system`, `/services`, `/technology-insights`, `/technology-insights/scaling-event-streaming-zero-data-loss`, `/technology-insights/private-enterprise-ai-rag-architectures`, `/technology-insights/zero-downtime-monolith-to-microservice-migration`, `/testimonials`, `/connect-with-us`, `/privacy-policy`, `/terms-of-service` (plus `/resource-hub` and `/resource-hub/:slug` supported seamlessly).
- **Server-Level 301 Permanent Redirects (Generated from `src/config/redirects.ts` into `vercel.json`):**
  - `/who-we-are` $\rightarrow$ `/about` (`301`)
  - `/values` $\rightarrow$ `/about#our-values` (`301`)
  - `/delivery-framework` $\rightarrow$ `/about#delivery-framework` (`301`)
  - `/how-we-work` $\rightarrow$ `/about#delivery-framework` (`301`)
  - `/service` $\rightarrow$ `/services` (`301`)
  - `/projects` $\rightarrow$ `/portfolio` (`301`)
  - `/insights` $\rightarrow$ `/technology-insights` (`301`)
  - `/contact`, `/connect` $\rightarrow$ `/connect-with-us` (`301`)
  - `/request-for-quote`, `/rfq`, `/quote` $\rightarrow$ `/connect-with-us` (`301`)
- **Dynamic `/sitemap.xml` & `/robots.txt`:**
  - `GET /sitemap.xml` queries `azaroth_public_ro` for all published pages, published product slugs, and published insight article slugs, outputting `<loc>${SITE_URL}${path}</loc>` and accurate `<lastmod>` timestamps from `content_documents.published_at`.
  - `GET /robots.txt` outputs `Allow: /`, `Disallow: /admin`, `Disallow: /api/`, and `Sitemap: ${SITE_URL}/sitemap.xml`.

---

## 2. Vercel Configuration Design (`vercel.json` — `[HOST-1]`, `[RT-5]`)

Generated from our single source of truth (`scripts/generate-host-config.mjs` reading `src/config/securityHeaders.ts` and `src/config/redirects.ts`):

1. **Non-Shadowing Route Ordering (`HOST-1`):**
   - Static hashed Vite assets (`/assets/(.*)`) served directly with `Cache-Control: public, max-age=31536000, immutable`.
   - API routes (`/api/auth/(.*)`, `/api/admin/media/upload-complete`, `/api/(.*)`) routed to their respective functions **before** the HTML rewrite.
   - `/sitemap.xml` and `/robots.txt` routed to `/api/public/sitemap` and `/api/public/robots`.
   - `/admin` and `/admin/(.*)` served with `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow`.
   - Public page routes rewritten to `/api/public/render?path=$1` (Option A HTML/SEO injection).
2. **Function Runtime & Resource Justification (`HOST-1`):**
   - `api/admin/media/upload-complete.ts` (Class B `sharp` image verification & variant generator): `runtime: nodejs22.x`, `memory: 1024` MB, `maxDuration: 30` seconds (justified because decoding 5 MB images via `sharp` and encoding 3 responsive WebP + original variants requires native `libvips` and ~250–400 MB peak RSS).
   - `api/auth/[...all].ts` (Class B Better Auth + `argon2id`/`scrypt` + TOTP MFA): `runtime: nodejs22.x`, `memory: 512` MB, `maxDuration: 15` seconds (justified for memory-hard password hashing).
   - All other handlers (`api/public/*`, `api/admin/cms/*`, `api/internal/reconcile`, `api/health/*`): Class A Web-standard handlers (`maxDuration: 15` seconds).
3. **Scheduled Cron (`crons` in `vercel.json`):**
   - `{ "path": "/api/internal/reconcile", "schedule": "0 3 * * *" }` (once daily at 03:00 UTC to comply with Vercel Hobby plan limits, paired with hourly GitHub Actions cron `0 * * * *` for the 2-hour `MED-9` bound — see `/docs/08-cost-and-plan-risks.md`).

---

## 3. Environment Variables Specification (`.env.example` — `[HOST-3]`, `[SEC-6]`)

Every environment variable required by the application (to be written to `.env.example` in Phase 3 with descriptions and empty/placeholder values only):

| Variable Name | Scope | Description |
|---|---|---|
| `SITE_URL` | Server & Build | Canonical base URL (e.g., `https://standalone-omega-one.vercel.app`), no trailing slash. Used for canonical tags, OG URLs, sitemap, CORS, and CSP. |
| `DATABASE_URL_MIGRATOR` | **CI / CLI Only (Never in Runtime)** | Neon Postgres connection string for `azaroth_migrator` role (DDL migrations, seed, break-glass CLI). |
| `DATABASE_URL_APP` | **Server-Only** | Neon Postgres pooled connection string for `azaroth_app` role (authenticated CMS CRUD, auth sessions, atomic publish/restore, append-only audit writes). |
| `DATABASE_URL_PUBLIC` | **Server-Only** | Neon Postgres pooled connection string for `azaroth_public_ro` role (read-only published content and public media metadata). |
| `BETTER_AUTH_SECRET` | **Server-Only** | High-entropy 256-bit secret (min 32 bytes base64/hex) used to sign session tokens and encrypt TOTP secrets & backup codes in `two_factors`. |
| `R2_ACCOUNT_ID` | **Server-Only** | Cloudflare Account ID hosting the R2 buckets. |
| `R2_PRIVATE_BUCKET` | **Server-Only** | Name of the private R2 bucket (`staging/`, `versions/`, `trash/`). |
| `R2_PUBLIC_BUCKET` | **Server-Only** | Name of the public R2 bucket (`pub/{versionId}/{variant}.{ext}`). |
| `R2_ACCESS_KEY_ID` | **Server-Only** | S3 API Access Key ID scoped ONLY to `R2_PRIVATE_BUCKET` and `R2_PUBLIC_BUCKET` (Object Read & Write). |
| `R2_SECRET_ACCESS_KEY` | **Server-Only** | S3 API Secret Access Key for `R2_ACCESS_KEY_ID`. |
| `R2_PUBLIC_BASE_URL` | Server & Client | Public custom domain URL serving `R2_PUBLIC_BUCKET` (e.g., `https://media.example.com`). |
| `BACKUP_R2_BUCKET` | **Backup Runner Only** | Separate R2 bucket for `BAK-2` encrypted DB dumps and `BAK-3` private media sync. |
| `BACKUP_R2_ACCESS_KEY_ID` | **Backup Runner Only** | Separate R2 Access Key ID scoped ONLY to `BACKUP_R2_BUCKET` (and read-only on `R2_PRIVATE_BUCKET`). |
| `BACKUP_R2_SECRET_ACCESS_KEY` | **Backup Runner Only** | Separate R2 Secret Access Key for backup runner (`SEC-6`). |
| `BACKUP_ENCRYPTION_PUBLIC_KEY` | **Backup Runner Only** | `age` public key (or AES-256 passphrase in secret store) used to encrypt `pg_dump` archives before uploading to `BACKUP_R2_BUCKET` (`BAK-2`). |
| `CRON_SECRET` | **Server-Only** | 256-bit bearer secret authenticating `/api/internal/reconcile` (`MED-9`). |
| `HEALTH_READY_SECRET` | **Server-Only** | 256-bit secret passed in `x-health-secret` header to authorize `/api/health/ready` (`OBS-2`). |
| `VERCEL_PURGE_TOKEN` | **Server-Only** | Token/credential used by `VercelCachePurgeAdapter` to invalidate edge cache tags/paths on publish (`RT-3`, `PUB-7`). |
| `SEED_INITIAL_ADMIN_EMAIL` | **Seed CLI Only** | Email address for the initial seeded Admin user (`SEED-1`). |
| `SEED_INITIAL_ADMIN_PASSWORD` | **Seed CLI Only** | Initial bootstrap password for the seeded Admin user (forced to enroll TOTP MFA on first login per `AUTH-1a`). |
| `RESEND_API_KEY` | **Server-Only (P1)** | Resend API key for password-reset emails and P1 `OBS-4` operational alerts. |
| `NOTIFY_EMAIL` | **Server-Only (P1)** | Recipient email for P1 operational alerts (`OBS-4`). |
| `ALERT_WEBHOOK_URL` | **Server-Only (P1)** | Secondary independent webhook URL (Slack/Discord/PagerDuty) for P1 alerts (`OBS-4`). |
| `SENTRY_DSN` | **Server & Admin Only (P1)** | Error monitoring DSN loaded strictly in server handlers and `/admin/*` bundle (`OBS-3`; never in public bundle). |

---

## 4. R2 CORS Policy & Custom Domain Setup (`[HOST-4a]`, `[MED-8]`)

### 4.1 Private Bucket (`R2_PRIVATE_BUCKET`) CORS Policy
Allows presigned `PUT` uploads (`staging/*`) and authenticated preview `GET` only from `SITE_URL`:
```json
[
  {
    "AllowedOrigins": ["https://standalone-omega-one.vercel.app"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length", "If-None-Match"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 4.2 Public Bucket (`R2_PUBLIC_BUCKET`) CORS & Cache Settings
- Read-only `GET` / `HEAD` for `pub/*` with `Cache-Control: public, max-age=31536000, immutable`.
- **Gate 2 Risk Flag (Documented in `/docs/08-cost-and-plan-risks.md`):** Attaching a custom domain (`R2_PUBLIC_BASE_URL`) to an R2 bucket in Cloudflare requires a domain zone active on Cloudflare DNS. For development/preview before a custom domain is attached, `r2.dev` can be used, but Cloudflare rate-limits `r2.dev` and disallows it for production CDN caching.
