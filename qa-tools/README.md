# QA Tools — Standalone Baseline & Verification Scripts (`/qa-tools/`)

All files in `/qa-tools/` strictly comply with **HR-8 (Pre-Approval Boundary)** and **PERF-1 / SEO-6**:
- They are completely standalone and never import from or alter application code.
- They are excluded from application builds (`src/` and `dist/`).
- They perform only low-volume read-only `GET` requests against `https://standalone-omega-one.vercel.app/` (no form submissions, no logins).

---

## 1. Files Included

1. `lighthouserc.mobile.json` — Lighthouse CI configuration for the **Mobile** preset:
   - Form factor: `mobile` (`390x844`, `deviceScaleFactor: 3`)
   - Throttling: Simulated Slow 4G (`rttMs: 150`, `throughputKbps: 1638.4`, `downloadThroughputKbps: 1474.56`, `uploadThroughputKbps: 675`) + `4x` CPU slowdown
   - Runs per URL: `5` (median aggregation)
   - Target URLs: All 17 public routes discovered on `https://standalone-omega-one.vercel.app/`
2. `lighthouserc.desktop.json` — Lighthouse CI configuration for the **Desktop** preset:
   - Form factor: `desktop` (`1440x900`, `deviceScaleFactor: 1`)
   - Throttling: Simulated desktop (`rttMs: 40`, `throughputKbps: 10240`, `1x` CPU)
   - Runs per URL: `5` (median aggregation)
   - Target URLs: All 17 public routes discovered on `https://standalone-omega-one.vercel.app/`
3. `measure-baseline.mjs` — Standalone Node.js script that invokes `lighthouse` across all 17 public routes for both `mobile` and `desktop` presets (`5` runs each, cold or warm cache mode) and computes the median Performance Score, LCP, TBT, CLS, and Total Byte Weight.
4. `verify-seo-html.mjs` — Standalone Node.js script (`SEO-6`) that fetches raw initial HTML with crawler (`Googlebot`) and social-bot (`Twitterbot`) User-Agents to verify crawler-visible `<title>`, `<meta name="description">`, `<meta property="og:*">`, `<meta name="robots">`, `<meta name="theme-color">`, and `<link rel="canonical">`.

---

## 2. Exact Run Instructions

### A. Run Lighthouse CI Configs (Mobile & Desktop)
Requires `lighthouse` and `@lhci/cli` on `PATH` plus a local Chromium/Chrome binary:
```bash
# Install globally on your runner / machine (outside project dependencies)
npm install -g lighthouse @lhci/cli

# Mobile preset (Slow 4G, 4x CPU, 5 runs per URL)
lhci collect --config=./qa-tools/lighthouserc.mobile.json
lhci assert --config=./qa-tools/lighthouserc.mobile.json

# Desktop preset (1440x900, 1x CPU, 5 runs per URL)
lhci collect --config=./qa-tools/lighthouserc.desktop.json
lhci assert --config=./qa-tools/lighthouserc.desktop.json
```

### B. Run Standalone Median Baseline Script (`measure-baseline.mjs`)
```bash
# Cold cache (default, 5 runs per URL and preset)
BASE_URL="https://standalone-omega-one.vercel.app" LH_RUNS=5 CACHE_MODE=cold node qa-tools/measure-baseline.mjs

# Warm cache (5 runs per URL and preset with storage reset disabled after run 1)
BASE_URL="https://standalone-omega-one.vercel.app" LH_RUNS=5 CACHE_MODE=warm node qa-tools/measure-baseline.mjs
```

### C. Run Raw HTML Crawler SEO Verification (`verify-seo-html.mjs`)
Can run in any Node 18+ environment without external binaries:
```bash
BASE_URL="https://standalone-omega-one.vercel.app" node qa-tools/verify-seo-html.mjs
```

---

## 3. Execution Status in Agent Container (`HR-6`, `PERF-1`, `PERF-5`)
- `verify-seo-html.mjs`: **Executed and verified** against `https://standalone-omega-one.vercel.app/`.
- `measure-baseline.mjs`, `lighthouserc.mobile.json`, `lighthouserc.desktop.json`: **Config and script provided, Lighthouse not run in container** (`lighthouse` CLI is not pre-installed in the container image, and `HR-8` forbids adding project dependencies prior to Gate 2). Zero Lighthouse figures are invented.
