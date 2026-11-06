# Cloudflare Monitoring and Operations Report — Azaroth Tech-Hive

## 1. Executive Summary
This report covers operational visibility, alerting, and runbook documentation for the Cloudflare infrastructure supporting Azaroth Tech-Hive.

## 2. Monitoring Coverage
- **DNS:** Zone health checks and propagation verification via Cloudflare dashboard and API.
- **SSL/TLS:** Certificate expiry alerts (30/14/7-day warnings) and edge certificate status monitoring.
- **WAF & Security:** Security Events dashboard configured; alerts on rule trigger spikes for login, CMS, and contact endpoints.
- **Rate Limiting:** Rate limit analytics and block event monitoring.
- **R2 Storage:** Bucket usage, request counts, and error rates tracked via Cloudflare R2 analytics.
- **Cache:** Cache hit ratio, bandwidth savings, and purge success metrics.
- **Origin Health:** Vercel origin error rates and latency via Cloudflare Load Balancing / Health Checks (where applicable).

## 3. Alerting
- **Critical:** WAF block spikes on admin/auth endpoints, R2 bucket unavailability, DNS resolution failures.
- **Warning:** Rate limit near-thresholds, cache hit ratio degradation, SSL certificate < 14 days expiry.

## 4. Operational Documentation
- Runbooks for: DNS failover, WAF rule tuning, R2 bucket recovery, cache purge manual trigger, HSTS preload submission.

## 5. Conclusion
Operational visibility and alerting meet production readiness standards.