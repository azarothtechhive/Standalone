# Phase 2 Deliverable — Observability, Alerting, Backup & Recovery Plan (`/docs/07-observability-backup-and-recovery.md`)

Covers requirements: `OBS-1`–`OBS-4`, `BAK-1`–`BAK-5`, `REC-1`, `REC-2`.

---

## 1. Structured Logging & Default Secret/PII Redaction (`[OBS-1]`)

### 1.1 Logger Architecture (`src/server/core/logger.ts` — Class A)
Every server handler, auth flow, publish step, upload verification step, and reconciliation run logs structured single-line JSON to `stdout` / `stderr`:
```json
{
  "timestamp": "2026-11-01T09:00:00.000Z",
  "level": "info",
  "event": "publish.commit.succeeded",
  "requestId": "req_01j9...",
  "actorId": "usr_01...",
  "durationMs": 142,
  "context": { "revisionNumber": 12, "scopes": ["page:home"] }
}
```

### 1.2 Recursive Default Redaction Engine & Unit Tests (`[OBS-1]`, `[QA-3]`)
Before any log entry is serialized, `redactLogPayload()` recursively traverses objects, arrays, Error causes, URL query strings, and headers:
1. **Key-Name Pattern Matching (Case-Insensitive):** Any key matching `/(password|passphrase|secret|token|authorization|cookie|set-cookie|totp|otp|recovery_?code|backup_?code|api_?key|access_?key|private_?key|connection_?string|database_?url|x-health-secret|signature)/i` has its value replaced with `"[REDACTED]"`.
2. **Value Pattern Matching (Regex Scrubbing inside Strings):**
   - Postgres URIs (`postgres(?:ql)?:\/\/[^\s"']+`) $\rightarrow$ `"postgresql://[REDACTED]"`
   - Presigned R2/S3 query parameters (`X-Amz-Signature=[^&\s]+`, `X-Amz-Credential=[^&\s]+`, `X-Amz-Security-Token=[^&\s]+`) $\rightarrow$ `"X-Amz-*=[REDACTED]"`
   - Bearer tokens (`Bearer\s+[A-Za-z0-9._~+/-]+=*`) $\rightarrow$ `"Bearer [REDACTED]"`
   - `otpauth://totp/...` URIs (`secret=[A-Z2-7]+`) $\rightarrow$ `"secret=[REDACTED]"`
3. **Required Redaction Unit Tests (`tests/security/logger-redaction.test.ts`):** Verifies that passwords, session cookies, `CRON_SECRET`, `HEALTH_READY_SECRET`, TOTP secrets, recovery codes, Neon connection strings, and presigned R2 URLs never appear in serialized log output even when passed inside nested Error objects.
4. **Log Retention on Vercel:** On Vercel Hobby, runtime logs are streamable live (`vercel logs`) and retained for **1 hour** (Pro retains up to **1–3 days** without a log drain). All security-critical and operational events are therefore also persisted to Neon (`audit_logs` and `system_heartbeats`).

---

## 2. Health Endpoints & Neon Compute Budget Analysis (`[OBS-2]`)

### 2.1 Liveness (`GET /api/health` — Public, Cheap, Zero DB/R2 Calls)
- **Behavior:** Touches neither Neon nor R2. Returns `HTTP 200 OK` with `{ "status": "ok", "version": "<git-sha>", "timestamp": "..." }`.
- **Safe Monitoring Interval:** Can be polled every **1 to 5 minutes** by uptime monitors with **zero** Neon compute usage.

### 2.2 Readiness (`GET /api/health/ready` — Deep Check, Secret-Protected)
- **Authentication:** Requires request header `x-health-secret: ${HEALTH_READY_SECRET}`. If the secret is unset the endpoint returns `HTTP 503`; missing or invalid credentials return `HTTP 401` without probing dependencies (`OBS-2`).
- **Behavior (3,000 ms hard deadline):**
  1. Executes `SELECT 1 AS ok` against Neon using the pooled `DATABASE_URL_PUBLIC_RO` connection (falling back to `DATABASE_URL_APP`).
  2. Verifies R2 endpoint and bucket configuration is present; this check does not currently make a remote R2 request.
  3. Returns `HTTP 200` only when both configured dependency checks pass, or `HTTP 503` with a component breakdown when configuration, connectivity, or the deadline check fails.
  4. Probes receive an abort signal; the handler also enforces its response deadline if a dependency does not honor cancellation.
- **Neon Scale-to-Zero Cost Impact (`OBS-2`, `COST-1`):**
  - Neon Free Tier provides **100 CU-hours/month** (`0.25 CU` minimum autoscaling size) and suspends compute after **5 minutes** of inactivity.
  - If an external monitor hits `/api/health/ready` every **5 minutes**, Neon compute will **never suspend**, consuming $730\text{ hours} \times 0.25\text{ CU} = \mathbf{182.5\text{ CU-hours/month}}$, which **exhausts the 100 CU-hour free tier around day 16 of the month!**
  - **Mandatory Operational Rule:** External uptime monitors must poll `/api/health` (liveness) every 5 minutes, and poll `/api/health/ready` at most **once every 6 hours** (consuming only $4 \times 30 \times \frac{5}{60} \times 0.25 = \mathbf{2.5\text{ CU-hours/month}}$) plus on-demand when an Admin opens the System Status page.

---

## 3. P1 Error Monitoring & Dual-Channel Alerting (`[OBS-3]`, `[OBS-4]`)

*(Designed now, implemented after P0 is complete per Section 4 & Section 13)*
1. **Error Monitoring (`OBS-3` — P1):** Sentry (`@sentry/node` in server handlers and `@sentry/react` dynamically imported **only** inside `/admin/*` routes, with `beforeSend` scrubbing cookies, headers, emails, and IPs). Zero Sentry code is bundled into public routes (`HR-3`, `PERF-4`).
2. **Dual-Channel Alerting (`OBS-4` — P1):**
   - Triggers on: publish rollback/failure, post-commit cache purge failure after retries, `RECON-CORE` failure or missed heartbeat (> 3 hours), backup failure or stale heartbeat (`BAK-5` > 30 hours), and repeated auth lockouts.
   - Dispatches concurrently to **Channel 1:** Email via Resend API to `NOTIFY_EMAIL` and **Channel 2:** Signed JSON POST to `ALERT_WEBHOOK_URL`.
   - Deduplicated via Neon (`alert_dedup_state` keyed by `alert_key` with a 1-hour cooldown window).

---

## 4. Backup Architecture, Verified Plan Limits & Restore Drill (`[BAK-1]`–`[BAK-5]`, `[REC-1]`, `[REC-2]`)

### 4.1 Verified Provider Capabilities from Official Documentation (`[BAK-1]`, `[BAK-3]`)
1. **Neon Free Tier Point-in-Time Restore (`BAK-1` — Verified):**
   - Per official Neon Plan documentation, the **Neon Free Tier retains PITR history for `6 hours`, capped at `1 GB` of WAL history** (Launch plan supports up to 7 days; Scale supports up to 30 days).
   - Therefore, any RPO claim relying on Neon PITR on the Free Tier cannot exceed a **6-hour window** (and if a bulk write exceeds 1 GB of WAL within 6 hours, the window shrinks).
2. **Cloudflare R2 Native Object Versioning (`BAK-3` — Verified):**
   - Per official Cloudflare R2 S3 API compatibility documentation, **Cloudflare R2 does NOT support native S3 Bucket Versioning (`PutBucketVersioning` / `GetObjectVersion`)**.
   - Why our architecture remains safe and how `BAK-3` protects it:
     - First, `MED-1` and `MED-6` use immutable version keys (`versions/{versionId}/...`) written with `If-None-Match: "*"` (no-overwrite), so application code never overwrites an existing key.
     - Second, to protect against accidental credential misuse or bucket-level deletion, `BAK-3` runs a scheduled append-only sync of `versions/` from `R2_PRIVATE_BUCKET` to a **separate backup bucket (`BACKUP_R2_BUCKET`) under separate credentials (`BACKUP_R2_ACCESS_KEY_ID`)** that never deletes existing objects during sync (`rclone copy` / S3 no-overwrite sync).

### 4.2 Scheduled Logical Database Backup (`[BAK-2]` — P0)
- **Runner:** Because Vercel Serverless functions do not include the `pg_dump` binary, `BAK-2` runs in `.github/workflows/backup-and-reconcile.yml` on GitHub Actions (`ubuntu-latest` with `postgresql-client` 16/17 and `age` encryption).
- **Schedule:** Every **6 hours** (`0 */6 * * *`) plus manual `workflow_dispatch`.
- **Pipeline Steps:**
  1. `pg_dump --format=custom --no-owner --no-acl "$DATABASE_URL_MIGRATOR" > dump.pgcustom`
  2. Verify dump integrity with `pg_restore --list dump.pgcustom` (fails immediately if dump is empty or corrupt).
  3. Encrypt archive using `age -r "$BACKUP_ENCRYPTION_PUBLIC_KEY" -o dump.pgcustom.age dump.pgcustom` (or `openssl enc -aes-256-cbc -pbkdf2`).
  4. Upload to `s3://${BACKUP_R2_BUCKET}/db-backups/YYYY/MM/DD/azaroth-db-<timestamp>-<sha256>.pgcustom.age` using `BACKUP_R2_ACCESS_KEY_ID`.
  5. Apply retention policy (keep all 6-hourly dumps for 7 days, daily dumps for 30 days, weekly dumps for 90 days).
  6. POST heartbeat to `/api/internal/heartbeat` (`job_name = 'backup_pg_dump'`, `last_status = 'ok'`, `details = { key, byteSize, sha256 }`).

### 4.3 Scheduled Private R2 Media Sync (`[BAK-3]` — P0)
- **Runner & Schedule:** Runs in `.github/workflows/backup-and-reconcile.yml` every **6 hours** (`0 */6 * * *`) immediately after `BAK-2`.
- **Pipeline Steps:**
  1. Enumerates `versions/` in `R2_PRIVATE_BUCKET` and copies any new immutable version objects to `s3://${BACKUP_R2_BUCKET}/media-versions/` without deleting or overwriting existing backup objects.
  2. Verifies object count and total byte size match all `status = 'ready'` rows in `media_versions`.
  3. POSTs heartbeat to `/api/internal/heartbeat` (`job_name = 'backup_r2_sync'`, `last_status = 'ok'`).

### 4.4 `BAK-4` Pre-Launch Restore Drill Procedure (R1 Go-Live Gate)
Per `BAK-4`, before R1 go-live (in Phase 7), the following scripted restore drill (`scripts/run-restore-drill.mjs`) must be executed against a disposable Neon branch and test R2 prefix (or, if credentials/binaries are unavailable in the current environment, explicitly marked `Not verified` with the recovery claim downgraded per `REC-2`):
1. Create a disposable Neon branch (`neonctl branches create --name drill-<timestamp>`) or empty test database.
2. Download the latest encrypted dump from `BACKUP_R2_BUCKET`, decrypt it, and run `pg_restore --clean --if-exists --no-owner -d "$DRILL_DATABASE_URL"`.
3. Verify row counts across `content_documents`, `revisions`, `media_assets`, `media_versions`, `media_slot_usages`, `users`, and `audit_logs` match the source database.
4. Boot the application pointing at `$DRILL_DATABASE_URL`, verify `/` and `/about` render HTTP `200`, and execute one test draft edit + atomic publish cycle.
5. Restore a sample `versions/{versionId}/*` object from `BACKUP_R2_BUCKET` into a test R2 bucket and run `RECON-CORE` (`MED-9`), verifying zero invariant violations.
6. Record exact elapsed wall-clock time (measured RTO) and dump timestamp gap in `/docs/runbook.md` and destroy the disposable branch.

### 4.5 Proposed RTO & RPO Figures (`[REC-2]`)

Per `REC-2` (*"Label any RTO and RPO figures 'verified' only if measured in the drill or derived from a documented plan limit; otherwise label them 'target, unverified'"*):

| Metric | Failure Scenario | Proposed Figure | Label Status (`REC-2`) | Basis / Derivation |
|---|---|---|---|---|
| **RPO (Database — Recent < 6h Corruption/Deletion)** | Accidental row deletion or bad migration within Neon PITR window | **$\le 1\text{ minute}$ (within trailing 6-hour / 1 GB WAL window)** | **Derived from documented Neon Free Tier plan limit** (`6h` PITR history window) | Neon instant branch restore from WAL within the 6-hour Free Tier retention window. |
| **RPO (Database — Catastrophic Loss / > 6h Ago)** | Full Neon project loss or corruption discovered > 6 hours later | **$\le 6\text{ hours}$** | **Target, unverified** (bound by 6-hour `BAK-2` GitHub Actions schedule) | Maximum interval between scheduled `BAK-2` encrypted `pg_dump` runs to `BACKUP_R2_BUCKET`. |
| **RPO (Media Assets in R2)** | Accidental deletion of `R2_PRIVATE_BUCKET` or `R2_PUBLIC_BUCKET` | **$\le 6\text{ hours}$** (`0` for assets uploaded before last 6h `BAK-3` sync) | **Target, unverified** | `BAK-3` syncs immutable `versions/` every 6 hours; public bucket (`pub/`) can be reconstructed at any time from `R2_PRIVATE_BUCKET` via promotion. |
| **RTO (Full Database + R2 Recovery)** | Complete restore from `BACKUP_R2_BUCKET` into a fresh Neon branch + R2 bucket | **$\le 30\text{ minutes}$** | **Target, unverified** (will only be relabelled `Verified` after `BAK-4` drill is executed and timed in Phase 7) | Estimated ~5 min branch creation + ~5 min `pg_restore` + ~10 min R2 object copy + ~10 min env switch & smoke check. |

---

## 5. Recovery Runbook Structure (`[REC-1]`)
`/docs/runbook.md` (delivered in Phase 4 and finalized with drill timings in Phase 7) covers step-by-step commands, owner roles, and verification checks for all 7 required scenarios:
1. Bad content publish (instant Admin restore-to-draft + atomic re-publish of prior revision).
2. Accidental media deletion or corruption (restore `versions/{versionId}` from `BACKUP_R2_BUCKET` + re-promote).
3. Database corruption or accidental table drop (Neon PITR branch switch if $<6\text{h}$, or `BAK-2` decrypted `pg_restore` if $>6\text{h}$).
4. Bad code deploy on Vercel (instant Vercel deployment rollback + schema compatibility check).
5. Compromised credential or leaked secret (step-by-step rotation for `BETTER_AUTH_SECRET`, `DATABASE_URL_*`, `R2_*`, `CRON_SECRET`, `HEALTH_READY_SECRET`).
6. Locked-out sole Admin / lost TOTP device & recovery codes (Tier 1 recovery code, Tier 2 co-admin reset, Tier 3 audited CLI break-glass).
7. Neon or Cloudflare R2 regional outage (edge cache stale-while-revalidate survival window + read-only fallback verification).
