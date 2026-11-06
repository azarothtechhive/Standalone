# Master Defect Register — Azaroth Tech-Hive

| Defect ID | Component / Resource | Severity | Root Cause | Business Impact | Required Correction | Final Status |
|---|---|---|---|---|---|---|
| DEFECT-001 | Auth / `authService.ts` | Critical | Hardcoded credentials and insecure `localStorage` token storage | Unauthorized access to admin CMS, session hijacking | Implement secure session cookies, scrypt password hashing, and server-side verification | Open |
| DEFECT-002 | CMS / Serverless Integration | High | Backend API routes not mounted in Vercel serverless entrypoints | CMS changes are lost or not persisted globally; local fallback only | Implement Express / Vercel API functions for auth and CMS linked to Neon PostgreSQL | Open |
| DEFECT-003 | Contact Form / `/api/contact` | High | Missing server-side contact submission workflow and database persistence | Contact submissions are not received or stored durably | Implement robust server-side handling, validation, rate limiting, and Neon storage | Open |
| DEFECT-004 | Media / Cloudflare R2 | Medium | Missing dual private/public bucket configuration and presigned upload flow | Media asset management is incomplete and vulnerable | Configure R2 staging buckets, CORS, and secure upload/download pipelines | Open |
| DEFECT-005 | Security / CSP Headers | Medium | Lax Content-Security-Policy or missing headers in certain runtime environments | Potential XSS and injection vulnerabilities | Strengthen CSP, HSTS, and other security headers across Vercel and Cloudflare | Open |
| DEFECT-006 | Brand / Color Tokens | Low | Dual color schemes (`#7A0C16` vs `#49243F`) in code and configs | Inconsistent visual identity | Unify brand colors to primary plum token `#8E4585` | Open |
| DEFECT-007 | SEO / Metadata | Low | Static identical HTML metadata served for all routes to crawlers | Sub-optimal SEO and incorrect social preview rendering | Implement dynamic server-side or Edge metadata injection per route | Open |
