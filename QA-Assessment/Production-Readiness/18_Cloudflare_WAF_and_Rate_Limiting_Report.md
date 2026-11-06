# Cloudflare WAF and Rate Limiting Report — Azaroth Tech-Hive

## 1. Executive Summary
This report documents the Web Application Firewall (WAF) rules and rate limiting policies configured in Cloudflare for the Azaroth Tech-Hive application.

## 2. WAF Configuration
- **Managed Rulesets:** Cloudflare Managed Ruleset (core WAF rules) and OWASP Core Rule Set (CRS 3.3+) enabled.
- **Custom Rules:** Narrowly-scoped rules for:
  - SQL injection protection on `/api/auth/*`, `/api/cms/*`, `/api/contact`.
  - XSS protection on form submissions.
  - Path traversal protection.
  - Admin login/MFA endpoints restricted to known IP ranges where applicable.

## 3. Rate Limiting Policies
| Endpoint | Threshold | Action |
|---|---|---|
| `/api/auth/login` | 15 req/min per IP | Challenge / Block |
| `/api/auth/mfa/*` | 10 req/min per IP | Challenge |
| `/api/contact` | 5 req/min per IP | Challenge |
| `/api/cms/media/upload` | 10 req/min per IP | Challenge |

## 4. Conclusion
WAF and rate limiting provide layered protection without blocking legitimate traffic or Playwright test execution.