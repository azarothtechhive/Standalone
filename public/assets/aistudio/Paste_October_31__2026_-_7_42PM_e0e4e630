# 0. HOW TO USE THIS SPECIFICATION (read first)

- Save this entire specification verbatim as `/docs/SPEC.md` at the start of Phase 1. Do not paraphrase it.
- **Context budget rule:** do not re-read this whole document every phase. At the start of each phase and each new session, read only (1) `/docs/00-rules-card.md`, (2) the `/docs/REQUIREMENTS.md` rows in scope for the phase, (3) `/docs/PROGRESS.md`, and (4) the sections of `/docs/SPEC.md` the current phase needs. Open other sections only when a requirement points to them.
- Every bullet under a section header with a prefix tag (for example `[MED]`, `[PUB]`, `[AUTH]`) is a requirement. In Phase 1, assign IDs in order of appearance (MED-1, MED-2, and so on) and record them in `REQUIREMENTS.md` with tier and status. `REQUIREMENTS.md` is the only checklist: do not create a second one.
- If two parts of this specification conflict, stop, name the conflict, and ask which wins. Do not pick silently.

# 1. USER PRE-FLIGHT ANSWERS (I edit these before sending; treat as confirmed)

If a value is blank, use the default, record it as an assumption in Phase 1, and do not ask. Ask only about items marked REQUIRED.

- Source code access: REQUIRED. If no repository or files are connected, stop and ask me to import them.
- PORTABILITY mode: **minimal** (default). Options: `none` (Vercel only, no Cloudflare portability work), `minimal`, `full` (see section 8).
- Primary production host: **Vercel**. Image processing host: **a Vercel Node function**.
- Repository host and CI: **GitHub** (assumed; used for CI and as a scheduler or backup runner where needed). If not GitHub, I will name the CI.
- Neon, Vercel and Cloudflare plans: unknown. Assume the lowest tiers, design fallbacks, and verify every limit from official documentation with a cited source.
- Production domain: undecided. Derive every canonical URL, sitemap URL, OG URL, CORS origin and CSP entry from one `SITE_URL` variable.
- R2 public bucket: served on a custom domain on a Cloudflare zone in production (`r2.dev` for development only). If I have no zone, flag a blocker in Phase 2.
- CMS users: 1 to 5.
- Backup destination: a **separate R2 bucket under separate credentials** (default). I may name a different account or provider: [optional].
- Error monitoring: **pre-approved for server code and the admin panel only** (Sentry free tier or an equivalent chosen at Gate 2). Never on the public site.
- Alert channels: **two independent channels**: email via Resend to `NOTIFY_EMAIL`, plus a secondary channel that does not depend on Resend (`ALERT_WEBHOOK_URL`, for example Slack, Discord, Telegram or ntfy; default: the external uptime monitor's own alerting).
- Auth trade-offs: **pre-decided** (see section 7).
- RTO and RPO: propose values in Phase 2 for my confirmation (see section 14, claims must be verified).
- Agent environment: state at the start of Phase 1 what you can and cannot run (shell, browser, Lighthouse, Playwright, deploys).

# 2. ROLE AND GOAL

You are a senior full-stack engineer. Convert the existing static corporate website of **Azaroth Tech-Hive** (live at https://standalone-omega-one.vercel.app/) into a production-ready, fully CMS-managed web application.

The result must look and behave identically to the original, with every public piece of content, media, link and button editable from an admin panel. The only permitted visual changes are the animation improvements allowed by HR-2 and the approved brand color change in section 6.

If a partial CMS implementation already exists in the project, audit and correct it instead of rebuilding. Otherwise build from scratch.

# 3. INPUTS (source of truth)

- Live site: https://standalone-omega-one.vercel.app/ (hosted on Vercel)
- Source code: the connected repository or files
- Screenshots: any I attach; otherwise work from source and the live site

Verified facts (use exactly, except where the brand color change overrides them):
- Page title: "Azaroth Tech-Hive — Enterprise Technology Solutions & Engineering"
- Meta description: "Azaroth Tech-Hive architects mission-critical digital systems, resilient microservice ecosystems, high-availability software platforms, and dedicated engineering pods for global enterprises."
- OG description: "Architecting mission-critical digital systems, resilient microservice ecosystems, and dedicated engineering pods for global enterprises."
- OG type: website. OG site name: "Azaroth Tech-Hive". OG title: same as page title.
- Robots: index, follow
- Viewport: width=device-width, initial-scale=1.0, viewport-fit=cover (respect iOS safe areas)

Everything else (pages, routes, sections, copy, media, fonts, spacing, breakpoints, forms, interactions, third-party scripts) must be **extracted by you from the source and https://standalone-omega-one.vercel.app/ in Phase 1**. Do not assume any section exists because it is typical. If the live site is JavaScript-rendered and unreadable, use source and screenshots. If something is unreadable or missing, ask me rather than guess. Report fonts, colors, spacing scale and breakpoints for my confirmation. Language: English unless the original shows otherwise.

# 4. PRIORITY TIERS AND RELEASES

Tiers map to releases. **R1 (P0) is the go-live candidate. R2 (P1) and R3 (P2) follow.** Never sacrifice a P0 item for a P1 or P2 item. State deferred items at every gate. The tier lists below, the section requirements and `REQUIREMENTS.md` must agree; on conflict, stop and report.

**P0 (R1, launch-blocking):**
- Design-identical public site rendered from the database; plum recolor
- Authentication via a vetted library; server-enforced roles; **mandatory Admin MFA**
- Draft and publish with atomic publish, snapshot on publish, and **minimal Admin restore-to-draft**
- Media pipeline with immutable versions on R2, **including promotion, compensation and reconciliation-core** (section 10)
- Media types limited to those the original actually uses at launch
- SEO crawler-visible metadata; idempotent seed
- Security baseline; structured logging with redaction; liveness and readiness health checks
- **Backup foundation: Neon PITR verified, scheduled logical dumps, R2 backup sync, and one executed restore drill** (section 14)
- Recovery runbook written against the implemented backups
- Audit-log table and writes (UI is P1)
- Vercel deployment files and `.env.example`; minimal-mode portability checks (section 8)
- Requirement-tracking files and an honest final report

**P1 (R2):** optional Editor MFA setting; revision list, view and diff UI; forms handling (if the original has forms); reconciliation reporting (orphans and broken-record reports); trash and purge UI; Audit Log screen; alert routing on both channels; error-monitoring integration; remaining media types; Playwright suites beyond smoke; Lighthouse comparison runs; automated backup alerts and scheduled drills.

**P2 (R3):** Cloudflare adapter, config files and guide; visual-regression polish; CSV export polish; manual QA extras; admin UI refinements.

**R1 go-live gate:** R1 may not be called production-ready until BAK-4 (restore drill) is executed and recorded, or the recovery claim is explicitly downgraded to "unverified".

# 5. APPROVAL GATES AND CONTEXT ANCHORING

- **Gate 1:** after Phase 1 (inventory only), STOP for my written approval.
- **Gate 2:** after Phase 2 (design and audit), STOP for my written approval.
- Until Gate 2 is approved, do not modify or add application code, configuration, database schema or dependencies. This includes `vercel.json`, `wrangler` files, `_headers`, `_redirects` and `.env.example`, which are only designed in `/docs/` before Gate 2. You may create Markdown under `/docs/` and standalone read-only scripts under `/qa-tools/` (HR-8).
- Any later change to the approved architecture needs an architecture-change-log entry and my approval.

Create from the start of Phase 1 (allowed pre-Gate 2):
1. `/docs/SPEC.md`: this specification, verbatim.
2. `/docs/00-rules-card.md`: under 60 lines: Hard Rules, gates, tiers, portability mode, the media exposure invariant (MED-INV), and "never claim unverified".
3. `/docs/REQUIREMENTS.md`: every requirement with ID, tier, and status: Not started, In progress, Done and verified (with evidence from a command actually run), Done but not verified, or Deferred (with reason).
4. `/docs/PROGRESS.md`: running log of work, decisions, assumptions and open questions.

Begin every phase and session reply with a **re-anchor block**: phase, relevant Hard Rules, requirement IDs in scope, and deferrals so far. End every phase by updating the tracking files.

# 6. APPROVED BRAND COLOR CHANGE (the only design exception)

Original brand maroon **#7A0C16** becomes plum **#8E4585** everywhere.

- [BRAND] Define plum once as a primary brand token (CSS variable or theme value) and use the token everywhere
- [BRAND] Replace every maroon use: `theme-color` meta tag, buttons, links, borders, icons, gradients, highlights, hover and focus states, shadows, glows, selection colors, SVG fills and strokes
- [BRAND] Derive tints and shades of the plum for every tint, shade and opacity the original uses, keeping the same relative lightness steps and opacities
- [BRAND] Keep text readable (target WCAG AA; white on #8E4585 is about 6.3:1); check plum on dark backgrounds; report any failure in Phase 2 with the smallest fix, never change silently
- [BRAND] Change no other color, layout, typography, spacing or effect
- [BRAND] List maroon baked into raster images or media in Phase 1 so I can supply replacements
- [BRAND] The brand color is a code token, not a CMS field; no color picker
- [BRAND] **Test palette:** the token file holds the production plum scale and, separately, a test-only "legacy maroon" scale with the exact original values (every tint, shade, opacity). A compile-time flag (for example `VISUAL_TEST_PALETTE=legacy`) selects it. The flag must never be settable at runtime, and a build check must prove the legacy scale is absent from the production bundle

# 7. TECH STACK AND DECISIONS ALREADY MADE

- React + Vite + TypeScript (strict), keeping what the original already uses where it differs
- **Public styling:** keep the original CSS approach. If the original is plain HTML/CSS/JS, port markup and styles into components faithfully (same class names, same CSS), not re-styled with Tailwind. Tailwind is allowed for the admin panel
- **Database: Neon Postgres.** The browser never connects to it. Pooled connection for the app, direct (unpooled) for migrations, plain versioned SQL migrations (or a justified tool). Use a driver mode that executes the publish function atomically (verify)
- **Storage: Cloudflare R2** via the S3-compatible API using a fetch-based client that runs on Node (and Workers where feasible). Two buckets: private and public (section 10)
- **Authentication, pre-decided trade-offs:**
  - Use a vetted, maintained library (compare candidates such as Better Auth and Auth.js from official docs and recent releases; do not choose an unmaintained one)
  - **Must-have:** Postgres/Neon database sessions; email and password with single-use expiring reset tokens; TOTP MFA with recovery codes (built in, or through a separate vetted TOTP library; never hand-rolled); rate limiting or a way to add it; argon2id or justified scrypt hashing; httpOnly, Secure, SameSite cookies; session revocation and expiry; no public sign-up
  - **Nice-to-have only:** Web-standard runtime and Workers compatibility
  - **Pre-approved:** authentication endpoints may be Node-only (Class B) on Vercel. Cloudflare portability of auth is out of scope and must be stated plainly in the docs
  - If no candidate meets the must-haves, stop and escalate at Gate 2 with options. Custom authentication is an exception needing written justification and my approval. Never hand-roll cryptographic primitives
- **Server handlers:** Web-standard `Request`/`Response`, thin per-host adapters; a framework only if justified
- **Email:** Resend (`RESEND_API_KEY`, `NOTIFY_EMAIL`); if unconfigured, Admin-initiated password reset is the fallback and form submissions go to the database only
- **Image processing:** a Node function (for example `sharp`), never Edge or Workers; runs on Vercel
- Only dependencies that are actually needed

# 8. RUNTIME AND PORTABILITY

Classify every server module as **Class A** (Web-standard APIs only: public read API, HTML and metadata injection, sitemap and robots, content CRUD, publish orchestration, R2 operations, health, cron endpoints) or **Class B** (Node-only: image processing, authentication endpoints, anything native).

Portability modes (set in pre-flight):

| Check | none | minimal (default) | full |
|---|---|---|---|
| [RT] Vercel adapter, Vercel build in CI | P0 | P0 | P0 |
| [RT] Import-boundary lint: Class A imports no Class B or Node built-ins; no Vercel-specific API imported outside the adapter folder | not required | **P0** | P0 |
| [RT] One cache module defining every `Cache-Control`, cache key and tag, and one `purge` interface, with the Vercel adapter implemented | P0 (single module only) | **P0** | P0 |
| [RT] Contract tests for the purge interface against the Vercel adapter and an in-memory fake | not required | **P0** | P0 |
| [RT] Headers, redirects and CSP generated from a single source of truth (Vercel output) | P0 | **P0** | P0 |
| [RT] Cloudflare adapter implementation and Cloudflare purge adapter | not required | P2 | P1 |
| [RT] Cloudflare output from the generator, `wrangler` config, `_headers`, `_redirects` | not required | P2 | P1 |
| [RT] Wrangler dry-run build and both adapters in CI | not required | P2 | P1 |
| [RT] Cloudflare deployment guide | not required | P2 | P1 |

If the site is ever served from Cloudflare, Class B work is called over HTTPS on the Vercel Node service with a signed, short-lived, replay-resistant request, short timeouts and clean failure (uploads fail visibly, never partially). Document prominently that a Cloudflare deployment still needs a Vercel project (or paid Cloudflare Images, which needs my approval).

# 9. HARD RULES

- **HR-1 Design lock.** Layout, typography, spacing, effects and desktop, tablet and mobile appearance match the original exactly. The only color change is maroon to plum. Never alter design to simplify CMS integration.
- **HR-2 Animation.** Allowed: subtle scroll-reveal fades and slides, hover and focus transitions, page transitions. Not allowed: anything that changes layout, adds visual elements, or breaks accessibility. Respect `prefers-reduced-motion`. No CLS impact; never hide content from crawlers or screen readers.
- **HR-3 Scope lock.** The CMS contains only content that exists on the site; every CMS field maps to a visible element or real behavior. No generic modules (blog, testimonials, team) unless the original has them. No new public pages, sections, forms or third-party public scripts (including monitoring). Permitted infrastructure screens: Login, Media Library, Users, Revision History, Form Submissions (only if the original has forms), Audit Log, System Status (minimal, read-only: health, last cron runs, backup status, failed cache purges with retry, reconciliation reports) and Site Settings (favicon, SEO defaults, 404 text). Keep them minimal.
- **HR-4 Hardcoding rule (clarified).**
  - **Must come from the database:** all public website content: every heading, paragraph, label, number, button and link text and destination, navigation, footer, media, alt text, SEO metadata, 404 text, form labels, placeholders and validation messages shown to visitors, cookie-banner text, and visitor-facing accessibility strings (for example aria-labels such as a menu button label)
  - **May remain in code, in one clearly named strings module:** fixed admin-interface labels and navigation, admin system messages (toasts, confirmations, conflict and error messages), API error messages, technical identifiers (route paths, class names, enum values), design tokens including the brand color, and a minimal generic fallback shown only when the database is unreachable (document it)
  - If unsure whether a string is public content, treat it as public content and put it in the database, then list it in the Phase 2 audit
- **HR-5 No fake controls.** Save, Preview, Publish, Revert and Delete use real backend operations.
- **HR-6** Never claim something is tested, deployed or working unless it was actually run. List what you could not verify.
- **HR-7 Existing-code preservation.** Reuse the original components, styles, responsive behavior and working functionality. Modify only what CMS integration, the approved branding, security or verified defects require. Log every architectural change in an architecture change log and get approval first.
- **HR-8 Pre-approval boundary.** Before Gate 2 you may create only Markdown under `/docs/` and standalone scripts under `/qa-tools/` that: only read from https://standalone-omega-one.vercel.app/ (low-volume GETs, no form submissions, no logins); never import from or alter application code and are excluded from builds; are documented in `/qa-tools/README.md` with exact run instructions. If you cannot run a script, say so and deliver it unrun. Never invent output.

# 10. CMS, PUBLISHING AND MEDIA

## [CMS] Content editing (P0 unless noted)
- Admin navigation mirrors the real site: one editor per page and per section, named as on the original; shared editors for navigation, footer and Site Settings
- Plain-text fields, or a minimal rich-text editor only where the original has formatting; rich-text output sanitized server-side with an allow-list of only the tags and attributes the original uses
- Links and buttons: label, destination (internal route or external URL), open-in-new-tab, visibility toggle only where the original has one; validate URLs (http, https, mailto, tel and internal routes only; reject `javascript:` and other schemes); icons only from the icon set already used
- Repeatable items (cards, lists, slides, tabs, accordion, menu items): add, remove, drag-to-reorder within the min and max counts the design accommodates
- Navigation and footer (menus, submenus, mobile menu, CTA, columns, links, socials, copyright) editable
- Existing third-party scripts and embeds (only if the original has them): IDs and URLs configurable in Site Settings; add none that are missing
- Forms (only if the original has them; P1): validation, honeypot, rate limiting, duplicate-submit prevention, loading, success and error states, database storage, read-only submissions view with CSV export (escape leading `=`, `+`, `-`, `@`), retention default 12 months configurable with Admin purge, documented privacy handling. If the original has no forms, add none

## [ALT] Alt text and decorative images (P0)
- In Phase 1 classify every image slot as informative or decorative (purely visual, or repeating adjacent text); store alt text **per usage (slot)**, not per file
- Informative slots: meaningful alt required, publish blocked if empty; images acting as links or buttons are informative and describe the destination or action
- Decorative slots: render `alt=""` (present, empty), hidden from the accessibility tree, shown in the CMS as a "Decorative image" indicator with no alt field. CSS backgrounds are decorative unless informative, in which case a nearby text alternative must exist
- Classification comes from the original; changing it is Admin-only with confirmation. Seed alt text from the original; list informative images lacking alt in Phase 1 for me to supply

## [PUB] Workflow and atomic publish (P0 unless noted)
- Separate draft and published content; authenticated non-public Live Preview. **Preview serves draft media from the private bucket through an authenticated handler or short-lived signed GET, never from the public bucket**
- One-click Publish; the public site reads published, committed state only
- **Publish, restore and revision pruning each run as a single database transaction** (for example one PL/pgSQL function called once). Inside: validate the draft, snapshot a revision, update published content, prune beyond the last 20 revisions (never the currently published one). Any failure rolls everything back and published content is unchanged
- Optimistic locking (version on each draft and page): stale writes are rejected with a clear conflict message, never silently overwritten. Publishing is idempotent (same draft version creates no duplicate revision)
- Restoring a revision loads it into the draft only; it never auto-publishes. P0 is a minimal Admin-only restore-to-draft; the revision list, view and diff UI is P1. No scheduled publishing
- Publish-time validation blocks and names the problem when: a required field is empty; a URL is invalid; a referenced media version is missing, trashed, not `ready`, or **not public**; or an informative image has no alt
- Cache invalidation and SEO refresh run **only after commit**. If they fail, content stays published and the failure is logged, shown on System Status and the publish screen, and retried automatically with backoff and manually (alerts via section 14, P1)
- Failure-injection tests for publish and restore run on a disposable Neon branch or test database, never production

## [MED] Media integrity (P0 unless noted)

**Immutable versions.** An asset is the logical Media Library item; each asset has immutable versions. Content (drafts, published content, revision snapshots) references a version ID, never the asset. A version's file, dimensions, checksum and variants never change after `ready`.
- Replace creates a new version; on success, draft references move to it in one transaction, while published content and past revisions keep their earlier version. The live site changes only on publish; the Media Library shows pages with unpublished changes caused by a replacement, and an Admin may publish all affected pages in one transaction
- Warn on significant aspect-ratio change and require confirmation; a shared asset shows all usages and warns that every draft usage changes. An Admin can revert an asset to an earlier retained version (draft references only; history never edited) (P1)
- Record every use of each version (drafts, published, revisions); the Media Library shows "used in". A version referenced anywhere cannot be permanently deleted; offer replacement
- Soft delete: an unreferenced version goes to Trash and is purged only after 30 days, by an Admin. Purge order: mark `purging`, delete R2 objects (private and any public copy), then delete the database record; on failure stay `purging` and retry. Never delete the record first (Trash UI P1; the purge logic is part of reconciliation-core)
- Allowed types: JPG, PNG, WebP, SVG (sanitized), MP4, PDF; max 5 MB images and 50 MB video; validated server-side. **At P0 enable only the types the original actually uses**; the rest are P1. Auto-optimize and resize with responsive sizes where the original uses them; lazy-load below the fold, never the LCP image; replacement preserves slot dimensions, ratio, cropping and responsive behavior; static assets (logos, favicon, inline SVGs) are manageable too

**Bucket layout and states.**
- Private bucket: `staging/`, `versions/{versionId}/...` (canonical original and variants of every `ready` version), `trash/`
- Public bucket: `pub/{versionId}/{variant}.{ext}`: immutable keys containing an unguessable version ID, long-lived immutable cache headers
- Each version has `status` (`pending`, `ready`, `failed`, `trashed`, `purging`) and `public_state` (`private`, `promoting`, `public`, `demoting`). Drafts may reference any `ready` version; **published content may reference only `public_state = public`**

**[MED-INV] Media exposure invariant (this resolves "draft media never public" versus "promoted but unpublished media may be public").** Every version falls into exactly one exposure class:

| Class | Meaning | In public bucket? | Time bound |
|---|---|---|---|
| M1 Private | Draft-only, pending, failed, trashed or purging versions, and any version not in an open publish attempt and not published | **Never** | n/a |
| M2 In-flight | Versions in the promotion set of an open publish attempt (the admin is publishing them right now) | **Yes, transiently** | Until commit or compensation; reconciliation demotes after at most 1 hour |
| M3 Published | Referenced by current published content | Yes | While referenced |
| M4 Grace | Previously published, no longer referenced by published content | Yes, temporarily | Grace period (default 7 days, at least max cache TTL plus 24 hours), then demoted |

The invariant: **the public bucket contains only M2, M3 and M4 versions within their time bounds. Draft-only, trashed and staging media are never there. Being in a draft never causes promotion; only an actual publish attempt does.** Documentation and tests must use this exact distinction, and no document may claim "unpublished media is never publicly reachable" without it. State the residual exposure honestly: M2 objects are retrievable by anyone who knows their random key, and after a failed publish remain so until compensation or reconciliation runs; keys are never listed or linked. Trashing a version requires demoting any public copy first.

**Publish sequence: validate, promote, commit, invalidate** (Neon and R2 cannot share a transaction; only step 3 changes live content; every other step is idempotent and compensatable):
1. **Pre-flight (read-only):** read draft at version N, compute referenced version set R, run all validations including a private-bucket HEAD existence check. Fail early with a named problem
2. **Promote (M1 to M2):** per version in R not yet public, record a `publish_attempt_id`, set `promoting`, copy private to public at the immutable key (server-side cross-bucket copy if the R2 S3 API supports it, else streamed get and put; verify from official docs), never overwrite (if the key exists, verify size and checksum), verify by HEAD and checksum, then set `public` in a small transaction. On any promotion failure: abort, demote what this attempt promoted (unless referenced by published content), report; published content untouched
3. **Commit:** the single atomic transaction, re-checking that all of R is `public` and the lock version still matches. On failure, roll back, then compensate by demoting this attempt's promotions that are not referenced by published content. On success, versions become M3 and any unreferenced earlier ones become M4
4. **Invalidate:** only after commit; retry with backoff on failure

**Upload pipeline** (staged, verified, compensated; never claim uploads are atomic):
1. Create a `pending` version record with a unique immutable key under private `staging/`; never overwrite objects
2. Upload by a short-lived presigned PUT scoped to that key (direct browser to R2, because serverless request bodies have size limits; verify Vercel's current limit against the 50 MB cap). R2 CORS allows the admin origin only
3. Verify server-side: actual size by HEAD (presigned PUTs cannot enforce size; delete oversize objects immediately), type from content bytes (not extension or declared Content-Type), SVG sanitization, image decodes, checksum, variants generated
4. Finalize: copy to `versions/{versionId}/...` in the private bucket, then one transaction sets `ready` with checksum, dimensions and variant keys
5. On any failure: delete staged and final objects best-effort, mark `failed`, show a clear error

**Reconciliation.**
- **RECON-CORE (P0):** removes `pending` and `failed` records and staged objects older than 1 hour; demotes `promoting` states older than 1 hour and public versions that are unreferenced after the grace period; retries `purging` records; emits a cron heartbeat; **also has an Admin-triggered manual run**. Scheduler: Vercel Cron if the confirmed plan's frequency suffices, else a GitHub Actions schedule or a minimal Cloudflare cron Worker calling the endpoint; choose the cheapest option that meets the frequency, with evidence. Cron endpoints authenticate with `CRON_SECRET`. Do not rely on `pg_cron` (scale-to-zero computes do not run scheduled jobs while suspended). **State the worst-case stranded-exposure bound = scheduler interval + 1 hour**
- **RECON-REPORT (P1):** detects R2 orphans and records with missing objects, and reports them in the Media Library and System Status. Evaluate an R2 lifecycle rule expiring `staging/` as a safety net. Never delete anything referenced

## Media and publish tests required
- Delete a referenced version (rejected) and an unreferenced one (to Trash, public copy demoted)
- Replace a shared asset: drafts update; published content and old revisions unchanged until publish
- Restore a revision that uses a superseded version, then publish it (re-promotion works)
- Interrupted upload, failed verification and failed finalize leave no orphan object or record
- Failure injected mid-promotion; failure injected after promotion (rollback plus compensation); simulated crash between promote and commit (reconciliation demotes after the bound); repeated publish reuses promoted objects with no duplicate revision or object
- **MED-INV test:** after every outcome above plus a reconciliation run, list the public bucket and assert every object is M2, M3 or M4 within its time bound, and that no draft-only, trashed, failed or staging object is present
- Publish blocked for a missing, non-`ready` or unpromoted version; informative image with empty alt blocks publish; decorative image renders `alt=""`; preview never reads from the public bucket

# 11. SECURITY BASELINE (P0 unless noted)

- [SEC] Deny by default. The browser never receives database credentials, R2 secrets or service secrets. Every handler authenticates, checks role (and verified MFA state for Admin), validates input with shared Zod schemas, then touches Neon or R2
- [SEC] Least-privilege Postgres roles: migration, application, and a restricted read-only public role that reads published data only. Enable RLS on content tables as defense in depth and document exactly what RLS enforces versus application code; never claim RLS protects something only the application enforces
- [SEC] CSP and standard headers (HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors) compatible with the original's third-party scripts and the R2 public domain
- [SEC] Sanitized rich text and SVG; escape all output; CSRF-safe, origin-checked handlers
- [SEC] Rate limiting on login, password reset, MFA, uploads and public form endpoints
- [SEC] Secrets only in host environment variables; document rotation for Neon strings, R2 keys, session secret, Resend key, alert webhook, backup credentials, `CRON_SECRET`, image-service signing key, Cloudflare token. R2 and Cloudflare tokens are minimum-scoped; backup credentials differ from application credentials; presigned URLs are short-lived and single-key
- [AUTH] **Admin MFA is mandatory (P0):** an Admin reaches no admin screen until MFA is enrolled and verified in the session; the seeded first admin is forced to enroll on first login; recovery codes plus a documented, audited recovery procedure for a lost authenticator (second Admin or a break-glass database procedure as last resort). Editor MFA is a Site Settings toggle (P1). Login throttling and backoff; server-side password policy; session expiry and revocation
- [AUDIT] Append-only audit table (enforced by database permissions) with writes at P0 for login, MFA changes, publish, restore, delete, role and user changes, permanent media deletion, classification changes and Site Settings changes; the Audit Log screen is P1. Operational logs are separate
- [SEC] `npm audit` reported in the final report

# 12. HOSTING AND DEPLOYMENT FILES

Design in `/docs/06-hosting-and-deployment.md` in Phase 2; create files only after Gate 2.
- [HOST] **Vercel (P0):** `vercel.json` with security headers and CSP, 301 redirects for changed URLs, rewrites that do not shadow API routes, cache headers, `crons` within the confirmed plan; Node function config justified; build settings and the Vercel environment variable list documented
- [HOST] **Cloudflare (P2 under `minimal`):** `wrangler.jsonc`, `public/_headers`, `public/_redirects`, R2 CORS JSON, public-bucket custom-domain and cache settings, the purge call (`CLOUDFLARE_ZONE_ID`, scoped `CLOUDFLARE_API_TOKEN`; verify which purge methods the plan allows), cron triggers, and what cannot run on Workers. Mark "Config provided, not deployed" unless I confirm a deployment was checked
- [HOST] **Shared (P0):** `.env.example` listing every variable with description and no values, server-only ones marked (for example `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `SESSION_SECRET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_PUBLIC`, `R2_BUCKET_PRIVATE`, `R2_PUBLIC_BASE_URL`, `BACKUP_*`, `RESEND_API_KEY`, `NOTIFY_EMAIL`, `ALERT_WEBHOOK_URL`, `CRON_SECRET`, `IMAGE_SERVICE_URL`, `IMAGE_SERVICE_SIGNING_KEY`, `SITE_URL`, plus Cloudflare variables if delivered)
- [HOST] `/docs/deployment-vercel.md` (P0) covering Neon project and branch setup, migrations and idempotent seed, R2 buckets, CORS and custom domain, environment variables, first admin with forced MFA, DNS, rollback; `/docs/deployment-cloudflare.md` is P2
- [HOST] Never claim a deployment works unless it was actually deployed and checked

# 13. OBSERVABILITY, ALERTING AND COST RISK

- [OBS] **Structured logging (P0):** one shared JSON logger for every handler and job: timestamp, level, request ID, route, user ID and role, status, duration, error class. Never log secrets, passwords, tokens, session IDs, TOTP codes, presigned URLs or form contents; redact by default and test redaction. Log publish, promotion, commit, purge, upload verification, auth failures, lockouts, MFA events, and cron and backup runs with counts. Document where logs are viewed and retention limits per plan
- [OBS] **Health (P0):** `GET /api/health` (cheap liveness, build version only) and `GET /api/health/ready` (deep: Neon trivial query and R2 lightweight HEAD, each with a timeout, protected by a secret header, per-dependency status without internals). Point the external uptime monitor at liveness frequently and at readiness rarely (recommend an interval and state the Neon compute-cost implication, since readiness pings keep a scale-to-zero compute awake)
- [OBS] **Error monitoring (P1):** pre-approved service for server and admin panel only, with PII scrubbing and sourcemap handling; nothing added to the public site
- [OBS] **Alerting (P1), two independent channels** (Resend email and `ALERT_WEBHOOK_URL`): publish failure; purge failure after retries; missed or failed cron (dead-man's-switch heartbeat); backup job failure or stale backup; referenced-but-missing objects; failed-login or lockout spikes; elevated 5xx; Neon or R2 connectivity failure. Deduplicate and rate-limit. A failure of either channel must be detectable from the other or from the uptime monitor
- [COST] **Cost and plan risk register (Phase 2 deliverable, `/docs/08-cost-and-plan-risks.md`):** for each risk give the verified finding with a cited official source, impact, fallback, and an estimated monthly cost at expected traffic. Cover at least: Neon scale-to-zero cold starts versus health pings and compute hours; Neon PITR window on the assumed tier; Vercel plan terms (flag whether the assumed tier permits commercial use) and cron frequency; function body and duration limits; R2 operation and egress costs and the custom-domain requirement; Resend limits; image-processing function limits; backup storage cost. Flag any blocker for my decision at Gate 2

# 14. BACKUP AND RECOVERY (a working foundation, not just a document)

Public bucket contents are derived data: they can be regenerated from the private bucket by re-promotion, so they are not backed up. The private bucket and the database are the sources of truth.

- [BAK-1] (P0) Verify and document the Neon point-in-time-restore window for the confirmed plan from official docs; the RPO claim may not exceed it
- [BAK-2] (P0) A scheduled logical dump of Neon (`pg_dump`, run on a runner that has the binary, for example a GitHub Actions workflow), encrypted, stored outside Neon in the backup destination using separate credentials, with a retention policy and a success heartbeat
- [BAK-3] (P0) A scheduled sync of the private bucket (`versions/`, the canonical objects) to the backup destination using separate credentials (verify from official docs that R2 has no native versioning; do not assume), with a success heartbeat
- [BAK-4] (P0, **R1 go-live gate**) Execute one restore drill before go-live and record the results in `/docs/runbook.md`: restore the latest dump to a disposable Neon branch, verify row counts and that the app boots and publishes against it; restore a sample of objects from the backup bucket and re-run reconciliation; record the measured time. If it cannot be run, mark Not verified and downgrade the recovery claim
- [BAK-5] (P1) Alerts on stale or failed backups, a scheduled recurring drill, and encryption key rotation
- [REC] **Recovery runbook (P0)** `/docs/runbook.md`, written against the backups actually implemented, with owner roles and verification steps for: bad publish (restore previous revision to draft, publish, confirm); failed cache purge (retry, manual purge, or wait out the maximum staleness stated); Neon outage or corruption (restore to a new branch, verify, repoint `DATABASE_URL`); R2 loss (restore from backup bucket, re-promote, reconcile); lost authenticator or all Admins locked out; suspected secret leak (rotate that credential, revoke sessions, review audit log); failed deployment (roll back the Vercel deployment)
- [REC] **Verified-claims rule:** RTO and RPO figures in the runbook are labelled "verified" only if measured in a drill or derived directly from a documented plan limit; otherwise they are labelled "target, unverified". Propose them in Phase 2 for my confirmation

# 15. SEO AND CRAWLER-VISIBLE RENDERING (P0)

- [SEO] Per-page title, meta description, Open Graph title, description, type and image, robots directive and favicon are CMS-managed, seeded from the verified facts with sensible fallbacks. `theme-color` uses the plum token. Canonical URLs come from `SITE_URL` plus the path and are not a CMS field
- [SEO] Choose, document and implement **one** strategy so crawlers and social previews get correct metadata in the initial HTML. Prefer **Option A** (a function or edge handler injecting published metadata and, where practical, primary content, cached with `s-maxage` and `stale-while-revalidate`, purged on publish). Choose Option B (build-time pre-render with revalidation or redeploy) only with Phase 1 evidence that A is infeasible, stating B's delay honestly
- [SEO] The 60-second goal is **conditional**: achievable only if the plan supports the purge method used and the purge succeeds. Document two numbers: the purge-path delay and the no-purge worst case bounded by the TTL settings. Measure median and worst of at least 10 trials on the primary host and report actuals; if over 60 seconds, state the real delay
- [SEO] Deliver a short strategy note: how content reaches crawler HTML; how fresh changes appear (both numbers); how and when caches are invalidated (only after commit); that drafts are never exposed to crawlers, previews or caches; known limitations and how to verify them
- [SEO] Preserve every existing URL of https://standalone-omega-one.vercel.app/ (301 for any change); provide `robots.txt` and an auto-generated `sitemap.xml` of published pages with accurate `lastmod`
- [SEO] A verification script (for example `curl` with a crawler user agent and a social-bot user agent) that fetches each public page starting at https://standalone-omega-one.vercel.app/, confirms title, description and Open Graph tags are in the raw HTML, plus tests that a publish appears there and that unpublished drafts never do

# 16. PERFORMANCE (measured, never assumed)

- [PERF] In Phase 1, provide a standalone script and Lighthouse CI config in `/qa-tools/` that measure https://standalone-omega-one.vercel.app/ and every other public URL found, with exact settings. If Lighthouse cannot run, say so and invent no figures
- [PERF] Identical conditions for original and converted: same pages and region, mobile preset (simulated Slow 4G, 4x CPU) and desktop, at least 5 runs per page and preset, compare the median, cold and warm cache, plus cold Neon start for the converted site, logged out
- [PERF] Targets: LCP, Total Blocking Time and total transfer size each within 10% of baseline; CLS at most 0.1 and no worse than the original; where the original meets Core Web Vitals "good" thresholds (LCP at most 2.5 s, CLS at most 0.1, INP at most 200 ms) the converted site must too; Lighthouse Performance score within 5 points
- [PERF] Public bundle excludes all admin code (route-level splitting), size reported from the production build; each page's published content in one batched, edge-cacheable request with no waterfalls and no content-less layout shift; public media from the R2 custom domain with immutable cache headers; preload the LCP image and fonts where the original does
- [PERF] Mark each target Verified (measured, with figures), Config provided not run, or Not verified

# 17. SEED, OPERATIONS AND CODE QUALITY

- [SEED] (P0) An idempotent seed (safe to re-run without duplicate rows or objects) loads the exact current content and media from https://standalone-omega-one.vercel.app/ and source into Neon and R2 so the site renders identically on day one apart from the plum recolor. Seeded media enter as `ready` and, for published content, `public` through the same promotion code path, with alt and decorative classification from Phase 1. Includes the documented first-admin step with forced MFA enrollment
- [OPS] Custom 404 matching the design with text editable in Site Settings; error boundaries and design-matching skeletons; no secrets in client code; semantic HTML, keyboard navigation, visible focus, sufficient contrast; respect iOS safe areas; fully responsive public site and admin (portrait and landscape); the admin may use the plum token but stays simple
- [CODE] Feature-based folders separating public UI, admin UI, server handlers and adapters, data access, storage, media handling, validation schemas, shared types, migrations and observability; one centralized data layer and reusable hooks; shared Zod schemas; small single-purpose modules; consistent error handling; no dead code or unused packages; touch original working components only as HR-7 allows
- [CODE] README covering architecture, setup, seeding, deployment, backups and recovery, publish and promotion design, media integrity, upload pipeline, SEO strategy, security baseline, observability, and how to add a new editable field

# 18. TESTING AND VISUAL REVIEW (honest scope)

- [QA] Write standards-based, cross-browser code. Provide Playwright projects for Chromium, Firefox and WebKit: P0 smoke (public pages, login with forced MFA, edit, preview, publish, persistence after refresh) and P1 full suites (every button and link, forms if any, revision restore, media replacement, role permissions)
- [QA] Provide the publish-integrity and media-integrity tests from section 10 against a disposable Neon branch and a separate test R2 bucket
- [QA] Security tests: unauthenticated access denied; Admin without verified MFA denied; Editors cannot publish or manage users; public database role cannot read drafts; drafts not publicly readable; disallowed upload types and sizes rejected; presigned URLs expire and are key-scoped; rich-text and SVG script payloads sanitized; `javascript:` URLs rejected; cookie flags and session fixation; log redaction
- [QA] Runtime tests (per the portability mode): import-boundary lint, purge-interface contract tests, header and redirect generation, legacy-palette absence from the production bundle
- [QA] Run lint, type-check, production build and `npm audit` and report results with bundle size. Run `vercel build` if possible; otherwise mark "Config provided, not run"
- [QA] Provide a manual real-device checklist (Chrome, Edge, Firefox and Safari on macOS; Safari and Chrome on iPhone and iPad; Chrome on Android), a social-share preview check, and a screen-reader spot check of informative versus decorative images
- [VIS] **Visual regression with a human gate.** Automated checks cannot certify visual identity alone:
  1. Capture baselines from https://standalone-omega-one.vercel.app/ at 1920, 1440, 1024, 768 and 390 px with animations disabled or `prefers-reduced-motion: reduce`, fonts and images loaded, time frozen, and video replaced by its poster frame
  2. Build the converted site with the legacy maroon test palette and compare against baseline with strict tolerances; any difference is then unintended
  3. Maintain a **masked-regions registry**: every mask lists its reason, owner and screenshot; masks are reviewed by me
  4. Produce a categorized HTML diff report with side-by-side images
  5. Separately verify plum: a code scan showing no maroon values in the production build, contrast checks, and plum screenshots for my approval
  6. **I review the diff report and plum screenshots in a visual-review gate before Phase 6 closes.** The agent may report "automated pass", never "visually identical", until I approve
- [QA] Final report: for every requirement ID, mark Verified (how), Written but not run, or Not verified

# 19. PHASED DELIVERY

**Phase 1: Inventory (analysis only; HR-8).** Create the four anchoring files. State what your environment can and cannot run and list assumptions from the pre-flight defaults. Inspect https://standalone-omega-one.vercel.app/ and the source: every page, route, section, component, text element, media asset, button, link, form, interactive behavior, third-party script, font, color token and breakpoint; the original framework, styling approach and current Vercel deployment. Classify every image slot (informative or decorative) with existing alt text; list informative images lacking alt; list every place maroon appears with every original tint, shade and opacity, and raster or SVG assets needing manual replacement. Assign requirement IDs. Provide the baseline performance script and config under `/qa-tools/`. Write `/docs/01-inventory.md`. **STOP at Gate 1.**

**Phase 2: Design and audit (no application code).** Deliver the audit matrix, built only from what you inspected (mark current-CMS columns "N/A" if building fresh):

| Original page | Section | Component (source ref) | Current CMS mapping | Status (present / missing / altered / unnecessary) | CMS coverage (complete / partial / missing) | Functional status | Action (preserve / restore / connect / fix / remove) |

Also deliver, each in its `/docs/` file: data model (users, sessions, MFA, assets, versions with `status` and `public_state`, usage references, publish attempts, revisions, audit log, cron and backup heartbeats); admin navigation tree; plum recolor plan with legacy test palette and contrast issues; architecture change log; atomic publish and promotion design with the exposure-class table; media integrity and upload pipeline design; reconciliation design with the stranded-exposure bound; auth design with the library comparison and evidence; runtime boundary design (Class A and B module list, adapters, cache contract, portability mode checks); security design with the Postgres roles and RLS matrix; observability and alerting design; backup and recovery plan with proposed RTO and RPO and the BAK-4 drill procedure; cost and plan risk register; alt and decorative list; SEO strategy with evidence and both delay numbers; hosting design; hardcoding audit list under HR-4; performance plan; visual-regression plan; and a **P0 size estimate by phase with a proposed cut list** (what moves to P1 if P0 is too heavy, for my approval). **STOP at Gate 2.**

**Phase 3: Scope correction and data model.** Remove unrelated modules, restore anything missing; migrations, roles and RLS, transactional publish function, seed, logger, health endpoints, first `vercel.json` and `.env.example`.

**Phase 4: CMS integration.** Connect every text, media, link, button, repeatable item, navigation, footer and SEO field; auth with enforced Admin MFA; roles; audit writes; workflow; the R2 pipeline with promotion and reconciliation-core; SEO rendering; System Status; backup jobs (BAK-2, BAK-3); apply the plum token and legacy test palette; finish Vercel config; P1 and P2 items only after P0 is complete.

**Phase 5: Functional repair.** Navigation, buttons, forms, interactive components, publishing flows.

**Phase 6: Responsive and compatibility pass, plus the visual-review gate.**

**Phase 7: Cleanup, tests and release.** Clean up code you introduced, add tests, run lint, type-check, build and audit, execute the BAK-4 restore drill, complete the runbook, produce the final report keyed to `REQUIREMENTS.md`.

# 20. CRITICAL INVARIANTS (must hold at R1; everything else is in REQUIREMENTS.md)

1. The public site reads published, committed state only; drafts never reach crawlers, previews or caches
2. MED-INV holds: the public bucket contains only M2, M3 or M4 versions within their time bounds; draft-only, trashed and staging media are never public; published content references only `public` versions
3. Publish, restore and pruning are each one database transaction; injected failures leave published content unchanged
4. Admin MFA is enforced server-side; roles are enforced on every handler
5. All public content comes from the database (HR-4); only admin labels, system messages and technical identifiers live in code
6. Plum is one token; no maroon values and no legacy palette in the production bundle
7. Informative images have alt text; decorative images render `alt=""`
8. Backups exist (BAK-2, BAK-3) and BAK-4 has been executed, or the recovery claim is explicitly downgraded
9. Logs contain no secrets; redaction is tested
10. Nothing is reported verified unless a command was actually run; visual identity is reported only as "automated pass" until I approve it

# 21. FIRST ACTION AND PHASE PROMPTS

Begin with Phase 1 only. Create `/docs/SPEC.md`, `/docs/00-rules-card.md`, `/docs/REQUIREMENTS.md` and `/docs/PROGRESS.md`. State what your environment can and cannot run and your assumptions. Then deliver the Phase 1 outputs. Do not modify or add application code, deployment configuration, database schema or dependencies. Give a short chat summary and STOP at Gate 1.

**Prompts I will paste later:**

After Gate 1: "Gate 1 approved. Corrections: [list or none]. Re-anchor from the rules card, REQUIREMENTS.md rows in scope and PROGRESS.md, then execute Phase 2 only. Write every deliverable under /docs/, update REQUIREMENTS.md, summarize in chat, and STOP at Gate 2. No application code or deployment config."

After Gate 2: "Gate 2 approved with these decisions: [auth choice, cuts, plan or cost decisions]. Re-anchor, then execute Phase 3 only, P0 first. Run what exists (migrations, tests, build), report only what you actually ran, update the tracking files, and wait."

Before Phases 4 to 7: "Phase [N-1] accepted. Re-anchor, then execute Phase [N] only, P0 first. Any architectural deviation needs a change-log entry and my approval first. At the end run lint, type-check, the build and existing tests, report actual results, update the tracking files, list deferred items, and wait."

Drift check, any time: "Pause. Re-read 00-rules-card.md. List which Hard Rules and requirement IDs your last changes touched, confirm none were violated, and report anything marked done that was not actually run."

Context reset, new session: "New session. Read 00-rules-card.md, PROGRESS.md and the REQUIREMENTS.md rows for the current phase, give the re-anchor block, and continue. Open SPEC.md sections only as needed."

END OF SPECIFICATION