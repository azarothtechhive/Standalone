# Azaroth Tech-Hive Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Free or Pro tier
2. **Neon PostgreSQL** - Database hosting
3. **Cloudflare R2** - Object storage (for media assets)
4. **Git Repository** - Vercel connected to your Git provider

## Environment Variables

### Required for Production

```bash
# Database (Neon PostgreSQL)
DATABASE_URL_MIGRATOR=postgres://user:password@ep-xxx.aws.neon.tech/azaroth_prod?sslmode=require
DATABASE_URL_APP=postgres://user:password@ep-xxx.aws.neon.tech/azaroth_prod?sslmode=require
DATABASE_URL_PUBLIC_RO=postgres://readonly:password@ep-xxx.aws.neon.tech/azaroth_prod?sslmode=require

# Authentication
BETTER_AUTH_SECRET=<random-32-char-string>
BETTER_AUTH_URL=https://your-domain.vercel.app
INITIAL_ADMIN_EMAIL=admin@azaroth.tech
INITIAL_ADMIN_PASSWORD=<strong-password>
MFA_ENCRYPTION_KEY=<random-32-char-string>

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_PRIVATE_BUCKET=azaroth-private-media
R2_PUBLIC_BUCKET=azaroth-public-media
R2_PUBLIC_BASE_URL=https://pub-<bucket-id>.r2.dev

# Health & Monitoring
HEALTH_READY_SECRET=<random-secret-for-health-checks>
CRON_SECRET=<random-secret-for-cron-jobs>

# Site Configuration
SITE_URL=https://your-domain.vercel.app

# Email (Optional - for notifications)
RESEND_API_KEY=re_<your-resend-api-key>
NOTIFY_EMAIL=admin@azaroth.tech

# Error Tracking (Optional)
SENTRY_DSN=https://<your-sentry-dsn>@sentry.io/<project-id>

# Vercel Integration
VERCEL_REVALIDATE_TOKEN=<random-token-for-cache-revalidation>
```

### Required for Staging

Same as production, but with staging-specific values:

```bash
DATABASE_URL_MIGRATOR=postgres://user:password@ep-xxx.aws.neon.tech/azaroth_staging?sslmode=require
DATABASE_URL_APP=postgres://user:password@ep-xxx.aws.neon.tech/azaroth_staging?sslmode=require
DATABASE_URL_PUBLIC_RO=postgres://readonly:password@ep-xxx.aws.neon.tech/azaroth_staging?sslmode=require
BETTER_AUTH_URL=https://your-staging-domain.vercel.app
SITE_URL=https://your-staging-domain.vercel.app
R2_PRIVATE_BUCKET=azaroth-staging-private-media
R2_PUBLIC_BUCKET=azaroth-staging-public-media
```

## Deployment Steps

### 1. Prepare Neon Database

1. Create a Neon project at https://console.neon.tech
2. Create three databases or use separate roles:
   - `azaroth_prod` (main database)
   - Ensure migration role has CREATE/DROP privileges
3. Copy connection strings for each role
4. Add to Vercel environment variables

### 2. Configure Cloudflare R2

1. Go to Cloudflare Dashboard → R2
2. Create two buckets:
   - `azaroth-private-media` (for original uploads)
   - `azaroth-public-media` (for published assets)
3. Create R2 API Token with S3-compatible access
4. Copy Account ID, Access Key ID, Secret Access Key
5. Add to Vercel environment variables

### 3. Deploy to Vercel

#### Option A: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Option B: Via Vercel Dashboard

1. Import project from Git repository
2. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables in project settings
4. Deploy

### 4. Run Database Migrations

After first deployment, run migrations:

```bash
# Via Vercel CLI
vercel env pull .env.local
npm run db:migrate
vercel env push .env.local

# Or via Vercel Dashboard:
# Set DATABASE_URL_MIGRATOR in environment variables
# Then redeploy - migrations run automatically on deploy
```

### 5. Create Initial Admin Account

The first admin account is created automatically on first startup if it doesn't exist, using:
- `INITIAL_ADMIN_EMAIL`
- `INITIAL_ADMIN_PASSWORD`

Set these before first deployment.

### 6. Configure MFA

After first login:
1. Navigate to `/admin/login`
2. Login with initial admin credentials
3. Complete MFA setup (TOTP app + backup codes)
4. MFA is enforced for all admin operations

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://your-domain.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-05T...",
  "uptime": 123.45,
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful"
    },
    "r2": {
      "status": "configured",
      "message": "R2 storage configured"
    }
  }
}
```

### 2. Readiness Check (with secret)

```bash
curl -H "x-health-secret: YOUR_SECRET" \
  https://your-domain.vercel.app/api/health?type=ready
```

### 3. Test Admin Login

1. Navigate to `/admin/login`
2. Login with initial admin credentials
3. Complete MFA verification
4. Verify dashboard loads

### 4. Test Contact Form

1. Navigate to `/connect-with-us`
2. Submit test form
3. Verify submission succeeds (check database or logs)

### 5. Test Media Upload

1. Login to admin
2. Navigate to Media Manager
3. Upload test image
4. Verify upload succeeds and appears in list

## Monitoring

### Logs

- Vercel Dashboard → Logs
- Filter by API routes: `/api/*`
- Monitor for errors in authentication, database, R2

### Alerts

Configure Vercel alerts for:
- HTTP 5xx errors
- Response time > 500ms
- Edge function errors

### Backup Strategy

**Database (Neon):**
- Neon provides automatic point-in-time recovery
- Enable branch creation for staging snapshots
- Export dumps regularly

**R2 Storage:**
- R2 provides 99.999999999% durability
- Enable lifecycle policies for old media versions
- Use backup R2 bucket for critical assets

## Security Checklist

- [ ] All environment variables set in Vercel
- [ ] `BETTER_AUTH_SECRET` is cryptographically random
- [ ] `HEALTH_READY_SECRET` is not public
- [ ] `MFA_ENCRYPTION_KEY` is cryptographically random
- [ ] Initial admin password changed from default
- [ ] MFA enabled for all admin accounts
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Security headers configured (in vercel.json)
- [ ] CSP headers configured for R2 domains
- [ ] Database uses SSL (sslmode=require)
- [ ] R2 bucket access restricted by IP (optional)

## Rollback Procedure

If deployment fails:

1. **Vercel Dashboard**:
   - Go to Deployments
   - Find previous successful deployment
   - Click "Promote to Production"

2. **Database Rollback**:
   - Use Neon's Time Travel feature
   - Or restore from manual backup

3. **Asset Rollback**:
   - R2 has versioning (if enabled)
   - Or restore from backup bucket

## Troubleshooting

### Database Connection Failed

- Verify `DATABASE_URL_APP` is correct
- Check Neon database is active
- Ensure SSL mode is enabled
- Check IP whitelist (if configured)

### R2 Upload Failed

- Verify R2 credentials are correct
- Check bucket names match environment variables
- Ensure bucket permissions allow writes
- Check file size limits (max 5MB enforced)

### MFA Not Working

- Verify `MFA_ENCRYPTION_KEY` is set
- Check TOTP time sync (device time)
- Use backup codes if TOTP fails
- Re-enroll MFA for user

### Health Check Returns 503

- Database not configured or unreachable
- R2 credentials missing
- Check Vercel function logs
- Verify environment variables are set

## Performance Optimization

### Bundle Size

Current bundle is ~1.3MB. To optimize:

1. Enable code splitting in `vite.config.ts`
2. Lazy load admin routes (already done in `App.tsx`)
3. Consider moving admin to separate deployment
4. Use dynamic imports for heavy libraries

### Caching

- Vercel Edge Caching for static assets
- Vercel KV for session storage (optional)
- CDN for R2 public assets

### Database

- Use connection pooling
- Enable query caching
- Optimize frequently accessed queries
- Add indexes as needed

## Cloudflare Workers & Wrangler Deployment (Production Grade)

The platform supports deployment to Cloudflare Workers using the native **Workers with Static Assets** architecture (`wrangler.toml` / `wrangler.jsonc`), delivering ultra-low edge latency, automated 301 redirects, hardened security headers (CSP), R2 object storage bindings, and scheduled cron triggers.

### 1. Architecture Overview

```
                      Client Request
                            │
                            ▼
              ┌───────────────────────────┐
              │ Cloudflare Global Network │
              └─────────────┬─────────────┘
                            │
               ┌────────────┴────────────┐
               │  Edge Security & CSP    │
               │  Redirect Engine (301)  │
               └────────────┬────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
  API Endpoints                           Static Assets / SPA
  (/api/health, /api/contact,             (Cloudflare ASSETS binding:
   /api/rfq, /api/auth, /api/cms)          ./dist with SPA routing)
        │
  ┌─────┴─────────────────────┐
  │                           │
  ▼                           ▼
Neon PostgreSQL         Cloudflare R2 Bucket
(Serverless pooled)     (azaroth-cms-media)
```

### 2. Wrangler Setup & Authentication

Install Wrangler and authenticate:

```bash
# Log in to Cloudflare
npx wrangler login

# Verify active account
npx wrangler whoami
```

### 3. Production Environment Secrets Checklist

Set all sensitive credentials securely via Wrangler Secrets (these are encrypted at rest and never checked into source control):

```bash
# Database Connections (Neon Serverless PostgreSQL)
npx wrangler secret put DATABASE_URL
npx wrangler secret put DATABASE_URL_APP
npx wrangler secret put DATABASE_URL_MIGRATOR
npx wrangler secret put DATABASE_URL_PUBLIC_RO

# Email Delivery (Brevo Transactional API)
npx wrangler secret put BREVO_API_KEY

# Cloudflare R2 Media Storage Credentials
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put R2_ACCOUNT_ID

# Security, Cron & MFA
npx wrangler secret put CRON_SECRET
npx wrangler secret put MFA_ENCRYPTION_KEY
npx wrangler secret put TOTP_ENCRYPTION_KEY
npx wrangler secret put HEALTH_READY_SECRET
```

### 4. Build & Local Edge Simulation

Build the production client distribution and test with local Wrangler runtime:

```bash
# 1. Build client bundle into ./dist
npm run build:cf

# 2. Preview locally using Wrangler edge runtime
npm run preview:cf
```

### 5. Production Zero-Downtime Deployment

To deploy to Cloudflare Workers:

```bash
# Safe, non-destructive deployment command:
npx wrangler deploy
```

> [!NOTE]
> When `npx wrangler deploy` runs:
> 1. Static assets from `./dist` are uploaded directly to Cloudflare's global edge network.
> 2. `src/server/worker.ts` is compiled with `nodejs_compat` runtime flags.
> 3. Cloudflare R2 bucket binding `R2_BUCKET` is linked.
> 4. Scheduled trigger `0 3 * * *` is registered for automated nightly reconciliation.

---

## Support

For issues with:
- **Vercel**: https://vercel.com/support
- **Neon**: https://neon.tech/support
- **Cloudflare R2**: https://developers.cloudflare.com/r2/

## Appendix: Environment Variable Generator

Generate secure secrets:

```bash
# Generate random 32-char string for secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use:
openssl rand -hex 32
```
