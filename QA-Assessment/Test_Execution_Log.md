# Azaroth Tech-Hive - Test Execution Log

**Assessment Date:** November 4, 2026  
**Environment:** Local project, production-mode server on `http://127.0.0.1:3020`  
**Data Safety:** Read-only GET checks plus invalid/empty test requests; no production data or accounts were modified. A temporary QA-only readiness credential was used and is not recorded here.

## 1. Scope and accounting

The original strategy defines 219 scenarios: 85 public website, 42 CMS, 49 API, 18 security, 10 performance, and 15 accessibility scenarios. Results below retain that denominator. A page/API smoke check is not counted as completing the other scenarios in its module.

The public feature matrix contains 84 unique `TC-*` IDs although the strategy's phase summary allocates 85 public scenarios. The unitemized scenario is included in the 219 denominator and counted as not tested; no ID was invented.

## 2. Readiness investigation

### Findings

- The earlier broad API timeout was consistent with the server/dependencies not running; it was not evidence that every API handler had timed out.
- The previous readiness implementation did not query Neon. It returned success when a connection URL merely existed.
- Readiness authentication was bypassed when `HEALTH_READY_SECRET` was unset.
- Aborting an `AbortController` alone did not bound a probe that ignored its signal.
- This local environment has no configured `HEALTH_READY_SECRET`, `DATABASE_URL_PUBLIC_RO`, `DATABASE_URL_APP`, or R2 endpoint/bucket values. Only variable names in `.env.example` are present; no credential values were available for a live dependency check.

### Results

| Check | Result | Response time | Evidence |
|---|---:|---:|---|
| `GET /api/health` | PASS - HTTP 200 | 18 ms (sample) | Live local HTTP request |
| `GET /api/health/ready`, missing request header | PASS - HTTP 401 | 11 ms (sample) | Live local HTTP request |
| `GET /api/health/ready`, invalid request header | PASS - HTTP 401 | 4 ms (sample) | Live local HTTP request |
| `GET /api/health/ready`, valid temporary QA header | BLOCKED - HTTP 503 | 6 ms (sample) | Live request; Neon and R2 configuration absent |
| Correct secret, dependency probes simulated healthy | PASS - HTTP 200 | 1-54 ms in unit-test runs | Injected probes; not a live Neon/R2 test |
| Correct secret, Neon probe simulated unavailable | PASS - HTTP 503 | 0-26 ms in unit-test runs | Injected probes |
| Correct secret, Neon URL absent | PASS - HTTP 503 | 0-53 ms in unit-test runs | Default Neon probe path |
| Probe that ignores cancellation | PASS - HTTP 503 returned | 20 ms configured test deadline; bounded in test | Unit test; handler races probes against its deadline |
| Unconfigured server readiness secret | PASS - HTTP 503 | Unit test | Does not run dependency probes |

No readiness secret was included in any response or logged value. Unauthorized logs contain only route, method, and status. A live HTTP 200 readiness result remains blocked pending approved Neon/R2 configuration.

## 3. API runtime checks

All measurements are single local samples and are not performance percentiles. Mutating CMS/API operations were not issued.

| Request | Status | Response time |
|---|---:|---:|
| `GET /api/health` | 200 | 134 ms |
| `GET /api/health/ready` (missing / invalid / valid temporary auth) | 401 / 401 / 503 | 11 / 4 / 6 ms |
| `GET /api/cms/all` | 200 | 6 ms |
| `GET /api/cms/stats` | 200 | 2 ms |
| `GET /api/cms/products` | 200 | 12 ms |
| `GET /api/cms/services` | 200 | 6 ms |
| `GET /api/cms/portfolio` | 200 | 4 ms |
| `GET /api/cms/insights` | 200 | 5 ms |
| `GET /api/cms/testimonials` | 200 | 3 ms |
| `GET /api/cms/navigation` | 200 | 4 ms |
| `GET /api/cms/media` | 200 | 2 ms |
| `GET /api/cms/pages/home` | 200 | 3 ms |
| `GET /api/cms/enquiries` without session | 401 | 2 ms |
| `GET /api/cms/audit-logs` without session | 401 | 2 ms |
| `GET /api/auth/me` without session | 401 | 1 ms |
| `POST /api/auth/login` with an unknown test account | 401 | 44 ms |
| `POST /api/contact` with empty JSON | 404 | 4 ms |

The CMS GET endpoints return the server's current local seed/in-memory data. These responses do not establish Neon persistence or live production content. The contact endpoint is absent. The contact UI currently falls back to browser local storage after the HTTP failure and returns a success-shaped response; this is not durable server delivery.

## 4. Public and CMS browser smoke checks

Production-mode local browser checks returned HTTP 200 and rendered a page heading for:

- PASS (render smoke only): `TC-PROD-001`, `TC-SERV-001`, `TC-PORT-001`, `TC-INS-001`, `TC-TST-001`, `TC-CONN-001`.
- PASS (login page renders, no credential autofill controls): `TC-AUTH-001`.
- FAIL: `TC-HOME-001` did not meet the full image-render check; at a 375 px viewport, three completed local image elements had no natural image dimensions. The heading rendered and the document width did not overflow. External image availability was not established.

The full positive/negative/boundary/edge checks for these pages were not completed. No contact form was submitted with user data.

## 5. Security, responsiveness, performance, accessibility

- Production-mode responses for `/`, `/api/health`, and `/api/health/ready` included all six configured security headers. CSP allows the application's known Unsplash image source; no HTTPS enforcement test was possible over local HTTP.
- Anonymous requests to `/api/auth/me`, `/api/cms/enquiries`, and `/api/cms/audit-logs` returned 401. Role-specific authorization, valid-session handling, cookie attributes, CSRF, and rate limits were not fully exercised because no authorized account or HTTPS test origin was provisioned.
- Hard-coded default administrator accounts and login autofill controls were removed. The client/server now require `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` to provision an initial account. The application still requires authorized provisioning and MFA verification before release.
- Source inspection found that login marks sessions MFA-verified without verifying a second factor; recorded as open release blocker DEFECT-012.
- Responsive smoke check of `/admin/login` at widths 320, 375, 768, and 1440 px found no horizontal overflow. This does not substitute for the 13-viewport matrix or full page-by-page responsive checks.
- One keyboard Tab reached a visible-focus input on the admin login form. Keyboard navigation across the site and WCAG 2.2 AA/screen-reader review were not completed.
- Production build output: JavaScript entry bundle 1,049.39 KB (FAIL against the 500 KB scenario target); CSS bundle 84.35 KB (PASS against the 100 KB target). Core Web Vitals were not measured. Lighthouse CLI was unavailable; no Lighthouse dependency was installed and no metrics were fabricated.

## 6. Automated validation

| Command/check | Result |
|---|---|
| `npm run lint` | PASS |
| `npm run build` | PASS; existing Vite config and >500 KB chunk warnings remain |
| `npm test` | PASS - 19 tests total, 19 passed, 0 failed |
| Existing host-config assertion | Corrected the stale expected redirect count from 12 to the generated 13; suite then passed. |

## 7. Original 219-scenario status

| Phase | Total | Executed | Passed | Failed | Blocked | Not Tested |
|---|---:|---:|---:|---:|---:|---:|
| Public website | 85 | 7 | 6 | 1 | 0 | 78 |
| CMS | 42 | 1 | 1 | 0 | 0 | 41 |
| API | 49 | 15 | 13 | 1 | 1 | 34 |
| Security | 18 | 8 | 3 | 1 | 4 | 10 |
| Performance | 10 | 2 | 1 | 1 | 0 | 8 |
| Accessibility | 15 | 0 | 0 | 0 | 0 | 15 |
| **TOTAL** | **219** | **33** | **24** | **4** | **5** | **186** |

**Failed scenario IDs:** `TC-HOME-001`, `API-045`, `SEC-011`, `PERF-007`.  
**Blocked scenario IDs:** `API-002`, `SEC-001`, `SEC-003`, `SEC-004`, `SEC-006`.  
**Passed scenario IDs:** `TC-PROD-001`, `TC-SERV-001`, `TC-PORT-001`, `TC-INS-001`, `TC-TST-001`, `TC-CONN-001`, `TC-AUTH-001`, `API-001`, `API-006`, `API-007`, `API-009`, `API-011`, `API-015`, `API-019`, `API-023`, `API-027`, `API-031`, `API-035`, `API-041`, `API-044`, `SEC-002`, `SEC-005`, `SEC-010`, `PERF-008`.  
All other scenarios in the original strategy are accounted for as not tested; see the phase totals above.

---

**Last Updated:** November 4, 2026  
**Document Version:** 2.0
