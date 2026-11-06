# 00 — Rules Card (Context Anchor)

## 1. Hard Rules (HR-1 to HR-8)
- **HR-1 Design Lock:** Public layout, typography, spacing, effects, and responsive behavior must match `https://standalone-omega-one.vercel.app/` exactly. Only approved visual change: maroon `#7A0C16` -> plum `#8E4585` (via single CSS/theme token; legacy maroon kept only behind compile-time test flag `VISUAL_TEST_PALETTE=legacy` and stripped from prod bundle).
- **HR-2 Animation:** Only subtle scroll-reveal fades/slides, hover/focus, and page transitions. Must respect `prefers-reduced-motion`, cause zero CLS, and never hide content from crawlers/screen readers.
- **HR-3 Scope Lock:** CMS manages only content existing on the original site. No extra public pages, sections, forms, or public 3P scripts. Permitted admin screens: Login, Media Library, Users, Revision History, Form Submissions (only if original has forms), Audit Log, System Status, Site Settings.
- **HR-4 Hardcoding Rule:** All public website content, SEO metadata, 404 copy, form strings, and visitor-facing accessibility strings (`aria-label`, `alt`) MUST come from Neon Postgres. Fixed admin UI labels, system/API messages, route/class identifiers, design tokens, and minimal DB-unreachable fallback stay in one code strings module.
- **HR-5 No Fake Controls:** Save, Preview, Publish, Revert, and Delete must execute real backend operations.
- **HR-6 Honest Verification:** Never claim anything is tested, deployed, or working unless the command was actually executed. Explicitly state what could not be verified. Never claim "visually identical" until user approves Gate in Phase 6.
- **HR-7 Existing-Code Preservation:** Reuse original components, styles, and working behavior. Log any architectural change in the change log and obtain approval first.
- **HR-8 Pre-Approval Boundary:** Before Gate 2 approval, create ONLY Markdown in `/docs/` and standalone read-only scripts in `/qa-tools/` (low-volume GETs only, excluded from build, documented in `/qa-tools/README.md`). Touch NO app code, config, schema, or dependencies.

## 2. Approval Gates & Releases
- **Pre-Flight Blocker Rule:** Source code access is REQUIRED. If no repository or files are connected, stop and ask user to import them.
- **Gate 1 (End of Phase 1 — Inventory):** Deliver anchoring files, `/docs/01-inventory.md`, and `/qa-tools/` baseline config. STOP for written approval.
- **Gate 2 (End of Phase 2 — Design & Audit):** Deliver full `/docs/` architecture & audit deliverables. STOP for written approval before touching code/config.
- **Visual-Review Gate (Phase 6) & R1 Go-Live Gate (Phase 7):** R1 requires human visual approval and executed `BAK-4` restore drill (or explicit downgrade to "unverified").
- **Tiers:** **P0 (R1)** = launch-blocking core; **P1 (R2)** = secondary ops/UI/suites; **P2 (R3)** = Cloudflare adapter & polish. Never sacrifice P0 for P1/P2.

## 3. Portability Mode: `minimal` (Confirmed Default)
- Primary host: **Vercel**; Image processing: **Vercel Node function** (`sharp`, Class B); Auth: **Node-only (Class B)** pre-approved on Vercel.
- **Class A** (Web-standard `Request`/`Response`: public read, HTML/SEO injection, CRUD, publish orchestration, R2, health, cron) must NEVER import Class B or Node built-ins or Vercel-specific APIs outside the adapter folder (enforced by P0 lint).
- Single cache module (`Cache-Control`, keys/tags, `purge` interface + contract tests) and single source of truth for headers/redirects/CSP (P0). Cloudflare adapter/files are P2.

## 4. Media Exposure Invariant (`MED-INV`)
- **M1 Private:** Draft-only, pending, failed, trashed, purging, or not in an open publish attempt and not published -> **NEVER in public bucket.**
- **M2 In-flight:** In promotion set of an open publish attempt -> **Public transiently** (until commit/compensation; RECON-CORE demotes after <= 1h; worst-case bound = scheduler interval + 1h).
- **M3 Published:** Referenced by current published content -> **Public while referenced.**
- **M4 Grace:** Previously published, now unreferenced -> **Public temporarily** (default 7d >= max cache TTL + 24h, then demoted).
- **Rule:** Public bucket holds ONLY M2, M3, M4 within time bounds. Draft edits never promote media; only publish attempts promote. Preview serves draft media from private bucket via auth handler/signed GET.
