# Phase 2 Deliverable — Plum Recolor Plan, Contrast Audit, Alt/Decorative Specification, Performance & Visual-Regression Plan (`/docs/04-brand-and-visual-plan.md`)

Covers requirements: `BRAND-1`–`BRAND-8`, `ALT-1`–`ALT-4`, `PERF-1`–`PERF-5`, `VIS-1`.

---

## 1. Plum Brand Token Architecture (`[BRAND-1]`–`[BRAND-8]`)

### 1.1 Single Source of Truth Token Architecture (`[BRAND-1]`, `[BRAND-7]`)
- All brand color definitions are consolidated into `src/styles/tokens.css` (and referenced by `src/styles/global.css` and component styles via CSS custom properties, with a read-only TypeScript constant export `BRAND_TOKENS` in `src/config/brandTokens.ts` for inline SVG/canvas attributes that require a string value).
- Per `BRAND-7`, `src/data/themePresets.ts` and the runtime theme/color picker in `AdminSettingsManager.tsx` and `CMSContext.tsx` are **removed**. Brand color is strictly a code token, never a CMS field.

### 1.2 Relative Lightness & Opacity Derivation: Legacy Scale vs. Production Plum (`#8E4585`) (`[BRAND-2]`, `[BRAND-3]`)

The primary approved brand token is **Plum `#8E4585`** (`rgb(142, 69, 133)`, HSL `307°, 35%, 41%`, relative luminance $L \approx 0.119$).

As documented in `/docs/01-inventory.md` §5.1, the repository contains two legacy brand layers:
- **Layer A:** Literal Maroon `#7A0C16` (`index.html` `theme-color`, `site.webmanifest`, `themePresets.ts`, and `--color-maroon-950..50` in `global.css`).
- **Layer B:** Existing dark plum/maroon-alias `#49243F` (`rgb(73, 36, 63)`, HSL `316°, 34%, 21%`) mapped to `--color-primary`, `--color-primary-maroon`, `CRIMSON_DEEP`, and `CRIMSON_ACCENT` across `tokens.css` and 20+ components.

Under **Option 1A (Full Unification to `#8E4585` — Recommended)**, every brand token is derived from `#8E4585` preserving relative lightness steps and exact alpha opacities:

| Semantic Token Name | Legacy Value (`VISUAL_TEST_PALETTE=legacy`) | Production Plum Value (`#8E4585` Scale) | Relative Step / Derivation |
|---|---|---|---|
| `--color-brand-primary` (`--color-primary`, `--color-primary-button`, `--color-primary-maroon`, `CRIMSON_DEEP`, `theme-color`) | `#49243F` (and `#7A0C16` in `index.html` / `site.webmanifest`) | **`#8E4585`** (`rgb(142, 69, 133)`) | Primary Brand Token (`HSL 307°, 35%, 41%`) |
| `--color-brand-primary-rgb` | `73, 36, 63` | **`142, 69, 133`** | Base RGB triplet used for all 23 `rgba(var(--color-brand-primary-rgb), <alpha>)` opacity steps |
| `--color-brand-hover` (`--color-primary-hover`, `--color-primary-button-hover`) | `#35182E` (`L=15%`, `-6%` lightness from base) | **`#73366B`** (`rgb(115, 54, 107)`, `HSL 308°, 36%, 33%`) | Darker hover shade (`-8%` lightness; white contrast `8.45:1`) |
| `--color-brand-active` (`--color-primary-button-active`, `--color-dark-maroon`) | `#281224` (`L=11%`) | **`#592853`** (`rgb(89, 40, 83)`, `HSL 307°, 38%, 25%`) | Active/pressed shade (`-16%` lightness; white contrast `11.3:1`) |
| `--color-brand-mid-hover` (`.featured-product-learn:hover`) | `#603453` (`L=29%`) | **`#A35699`** (`rgb(163, 86, 153)`, `HSL 308°, 31%, 59%`) | Lighter interactive accent (`+8%` lightness) |
| `--color-brand-gradient-mid` (`FeaturedSolutions` `--ath-plum`, gradient stop 55%) | `#8A315D` (`L=37%`) | **`#A8559E`** (`rgb(168, 85, 158)`, `HSL 307°, 33%, 50%`) | Mid gradient stop |
| `--color-brand-gradient-end` (gradient stop 100%) | `#C04472` (`L=51%`) | **`#C46FB9`** (`rgb(196, 111, 185)`, `HSL 308°, 42%, 60%`) | Bright gradient end stop |
| `--gradient-button` / `--gradient-primary` / `--gradient-heading` | `linear-gradient(110deg, #49243F 0%, #8A315D 55%, #C04472 100%)` | **`linear-gradient(110deg, #8E4585 0%, #A8559E 55%, #C46FB9 100%)`** | 3-stop 110° brand gradient |
| `--gradient-button-hover` | `linear-gradient(110deg, #35182E 0%, #49243F 55%, #8A315D 100%)` | **`linear-gradient(110deg, #73366B 0%, #8E4585 55%, #A8559E 100%)`** | Hover 3-stop gradient |
| `--color-plum-950` (replaces `--color-maroon-950`) | `#3e0a0a` | **`#2D122A`** | Deepest tint/shade (`L=12%`) |
| `--color-plum-900` (replaces `--color-maroon-900`) | `#7a1414` | **`#4A1F45`** | `L=21%` |
| `--color-plum-800` (replaces `--color-maroon-800`) | `#991a1a` | **`#6B2F64`** | `L=30%` |
| `--color-plum-700` (replaces `--color-maroon-700`) | `#b82020` | **`#7D3B75`** | `L=36%` |
| `--color-plum-600` (replaces `--color-maroon-600`) | `#cc2929` | **`#8E4585`** | Primary Base (`L=41%`) |
| `--color-plum-500` (replaces `--color-maroon-500`) | `#d63e3e` | **`#A65C9D`** | `L=51%` |
| `--color-plum-400` (replaces `--color-maroon-400`) | `#e16767` | **`#BD7DB5`** | `L=62%` |
| `--color-plum-300` (replaces `--color-maroon-300`) | `#ec9090` | **`#D3A3CD`** | `L=73%` |
| `--color-plum-200` (replaces `--color-maroon-200` & `#FECDD3`) | `#f3c4c4` | **`#E6C8E2`** | `L=84%` |
| `--color-plum-100` (replaces `--color-maroon-100` & `#FFE4E6`) | `#fae6e6` | **`#F3E4F1`** | `L=92%` |
| `--color-plum-50` (replaces `--color-maroon-50` & `#FDF2F4`/`#FFF1F2`) | `#fdf3f3` | **`#FAF3F9`** | Softest surface tint (`L=97%`) |
| **All 23 Opacity Steps** (`0.03`, `0.035`, `0.04`, `0.05`, `0.06`, `0.08`, `0.09`, `0.10`, `0.12`, `0.14`, `0.15`, `0.16`, `0.18`, `0.20`, `0.22`, `0.24`, `0.25`, `0.28`, `0.30`, `0.35`, `0.40`, `0.45`, `0.50`, `0.55`, `0.65`, `0.88`) | `rgba(73, 36, 63, <alpha>)` | **`rgba(142, 69, 133, <alpha>)`** (via `rgba(var(--color-brand-primary-rgb), <alpha>)`) | Identical opacity multipliers across all borders, badges, glows, shadows, and selection highlights |

### 1.3 Compile-Time Test Palette Flag (`VISUAL_TEST_PALETTE=legacy`) (`[BRAND-8]`)
- In `vite.config.ts`, `define: { __LEGACY_PALETTE__: JSON.stringify(process.env.VISUAL_TEST_PALETTE === 'legacy') }` selects between `src/styles/palette-plum.css` (default production) and `src/styles/palette-legacy.css` (used **only** during Phase 6 automated visual-regression baseline comparison against `https://standalone-omega-one.vercel.app/`).
- No URL parameter, cookie, `localStorage` key, or runtime switch can activate the legacy palette.
- **Automated Production Build Verification (`BRAND-8`, `QA-4`):** A post-build test script (`scripts/verify-no-legacy-palette.mjs`) scans all files in `dist/` to assert zero occurrences of `#7A0C16`, `#7a0c16`, `#49243F`, `#49243f`, `#3e0a0a`, `#B80F2E`, `#D3163C`, or `palette-legacy` in the production bundle.

---

## 2. WCAG AA Contrast Audit & Smallest Fixes (`[BRAND-4]`)

Per `BRAND-4`, we computed exact WCAG 2.1 relative luminance and contrast ratios for `#8E4585` ($L = 0.1190$) across every background and text pairing on the site:

| Pairing / UI Location | Foreground | Background | Computed Contrast Ratio | WCAG AA Requirement | Status & Action (`BRAND-4`) |
|---|---|---|---|---|---|
| **Primary Buttons & Solid Badges** (`btn-primary`, header CTA, submit buttons) | White `#FFFFFF` ($L=1.000$) | Plum `#8E4585` ($L=0.119$) | **6.34 : 1** | $\ge 4.5:1$ (normal text) | **PASS** (exceeds WCAG AA `4.5:1`) |
| **Primary Buttons with Warm Cream Inverse Text** (`--color-text-inverse: #FAF8F4`) | `#FAF8F4` ($L=0.947$) | Plum `#8E4585` ($L=0.119$) | **5.99 : 1** | $\ge 4.5:1$ | **PASS** |
| **Hover State Buttons** (`--color-brand-hover: #73366B`) | White `#FFFFFF` ($L=1.000$) | `#73366B` ($L=0.074$) | **8.45 : 1** | $\ge 4.5:1$ | **PASS** (exceeds WCAG AAA) |
| **Plum Text / Links / Kickers on White Card Surface** (`#FFFFFF`) | Plum `#8E4585` ($L=0.119$) | White `#FFFFFF` ($L=1.000$) | **6.34 : 1** | $\ge 4.5:1$ | **PASS** |
| **Plum Text / Links / Kickers on Warm Cream Canvas** (`--color-canvas-bg: #FAF8F4`) | Plum `#8E4585` ($L=0.119$) | `#FAF8F4` ($L=0.947$) | **5.99 : 1** | $\ge 4.5:1$ | **PASS** |
| **Plum Text / Links on Soft Surface** (`--color-surface-soft: #F7F2EB`) | Plum `#8E4585` ($L=0.119$) | `#F7F2EB` ($L=0.896$) | **5.69 : 1** | $\ge 4.5:1$ | **PASS** |
| **Plum Text / Badges on Muted Surface** (`--color-surface-muted: #F1EBE3`) | Plum `#8E4585` ($L=0.119$) | `#F1EBE3` ($L=0.844$) | **5.38 : 1** | $\ge 4.5:1$ | **PASS** |
| **Plum Pill Text on 8%–12% Translucent Plum Badge** (effective bg `#F6EEF5` on white) | Plum `#8E4585` ($L=0.119$) | `#F6EEF5` ($L=0.880$) | **5.59 : 1** | $\ge 4.5:1$ | **PASS** |
| **⚠️ CONTRAST ISSUE 1: 3-Stop Gradient Button End (`#C46FB9`) with White Text** (`--gradient-button` right edge) | White `#FFFFFF` ($L=1.000$) | `#C46FB9` ($L=0.256$) | **3.27 : 1** | $\ge 4.5:1$ for normal text on button | **FAILS WCAG AA at right edge of gradient (`3.27:1 < 4.5:1`).**<br>**Smallest Proposed Fix:** Cap the 100% gradient stop on buttons (`--gradient-button`) at **`#9E4F94`** ($L=0.151$, contrast with white = **5.21 : 1**) while keeping the brighter `#C46FB9` stop only for decorative/large heading text gradients (`--gradient-heading` on light backgrounds where contrast is **4.98 : 1**). |
| **⚠️ CONTRAST ISSUE 2: Plum `#8E4585` on Dark Footer Background (`#211A23`)** | Plum `#8E4585` ($L=0.119$) | Dark Footer `#211A23` ($L=0.014$) | **2.65 : 1** | $\ge 3.0:1$ (UI components/icons) / $\ge 4.5:1$ (text) | **Note:** On the original site, footer text and icons use `#FAF8F4` (`15.2:1`) and antique gold `#C99B52` (`6.8:1`), not primary maroon/plum. However, if any focus ring, hover accent, or badge uses the brand token on `--color-footer-bg` (`#211A23`), `#8E4585` is only `2.65:1`.<br>**Smallest Proposed Fix:** Define `--color-brand-on-dark: #D3A3CD` (`--color-plum-300`, $L=0.456$, contrast on `#211A23` = **7.94 : 1**) for any brand-colored text/focus indicator rendered inside dark surfaces (`#211A23`). |

*(Both contrast findings and their smallest fixes above are surfaced for your approval at Gate 2 per `BRAND-4`.)*

---

## 3. Alt Text & Decorative Slot Specification (`[ALT-1]`–`[ALT-4]`)

| Slot ID | Component & Location | Classification (`ALT-1`) | Seeded `alt_text` in Neon (`ALT-2` / `ALT-3`) | CMS Editor Behavior |
|---|---|---|---|---|
| `SLOT-01` | `Header.tsx` (Primary Brand Logo inside `<Link to="/">`) | **Informative** | `"Azaroth Tech-Hive — Home"` | Required text field; publish blocked if empty (`ALT-2`). |
| `SLOT-02` | `Footer.tsx` (Footer Brand Logo next to `"Azaroth Tech-Hive"` heading) | **Decorative** *(default unless overridden at Gate 2)* | `""` (empty) | Renders `alt=""` (`aria-hidden="true"`); CMS displays `"Decorative image"` badge with no alt input (`ALT-3`). |
| `SLOT-03` | `Hero.tsx` (Homepage Hero Main Visual — LCP Image) | **Informative** | `"Azaroth Tech-Hive Enterprise Engineering Workspace"` | Required text field; publish blocked if empty. |
| `SLOT-04` | `AboutSection.tsx` (Homepage About Us Image) | **Informative** | `"Azaroth Tech-Hive Engineering Team"` | Required text field; publish blocked if empty. |
| `SLOT-05` | `FeaturedSolutions.tsx` (Homepage Our Services Intro Logo Mark next to wordmark) | **Decorative** | `""` (empty; parent `.ath-logo` carries `aria-label`) | Renders `alt=""`; CMS displays `"Decorative image"` badge. |
| `SLOT-06` | `ProductsSection.tsx` (Homepage Products Background Float Image, `z-index: -1`) | **Decorative** | `""` (empty) | Renders `alt=""` and `aria-hidden="true"`; CMS displays `"Decorative image"` badge. |
| `SLOT-07` | `ProductsSection.tsx` (Homepage 4 Product Platform Cards) | **Informative** | Seeded from `productsData.ts` `coverAlt`:<br>1. `"Modern gym floor with strength and cardio equipment"`<br>2. `"Retail checkout counter with point-of-sale terminal"`<br>3. `"Instructor leading a digital classroom training session"`<br>4. `"Clinician reviewing patient records at a hospital workstation"` | Required per-card slot alt field; publish blocked if empty. |
| `SLOT-08` | `StrategicSolutions.tsx` (Homepage Featured Solutions 4 Slider Cards) | **Informative** | 1. `"Omnichannel retail storefront and inventory management interface"`<br>2. `"Mobile banking application displaying account analytics and biometric security"`<br>3. `"Enterprise business intelligence dashboard with real-time telemetry charts"`<br>4. `"Digital agency portfolio showcase interface on desktop display"` | Required per-slide slot alt field; publish blocked if empty. |
| `SLOT-09` | `BlogSection.tsx` (Homepage Resource Hub 3 Article Cards) | **Informative** | 1. `"Distributed server cluster and real-time event streaming architecture visualization"`<br>2. `"Secure enterprise AI neural retrieval and air-gapped data governance diagram"`<br>3. `"Cloud-native microservice mesh and zero-downtime migration topology"` | Required per-card slot alt field; publish blocked if empty. |
| `SLOT-10` | `FAQSection.tsx` (Homepage FAQ Right Sticky Support Card) | **Informative** | `"Azaroth technical consulting team collaborating on system architecture"` | Required text field; publish blocked if empty. |
| `SLOT-11` | `About.tsx` (`/about` Story Section Image) | **Informative** | `"Azaroth Tech-Hive workspace"` | Required text field; publish blocked if empty. |
| `SLOT-12` | `Products.tsx` & `Portfolio.tsx` (4 Product Platform Cards) | **Informative** | Same 4 descriptive `coverAlt` strings as `SLOT-07` (stored per slot so `/products` and `/` can be edited independently). | Required per-card slot alt field; publish blocked if empty. |
| `SLOT-13` | `Insights.tsx` (`/technology-insights` 3 Article Cards) | **Informative** | Same 3 descriptive article thumbnail alt strings as `SLOT-09`. | Required per-card slot alt field; publish blocked if empty. |
| `SLOT-14` | `TestimonialCard.tsx` (`/testimonials` Client Avatar next to printed client name) | **Decorative** | `""` (empty; avoids double announcement of client name by screen readers) | Renders `alt=""`; CMS displays `"Decorative image"` badge. |
| `SLOT-15` | `Connect.tsx` (`/connect-with-us` Full-Bleed Hero Background, `z-index: -1`) | **Decorative** | `""` (empty) | Renders `alt=""` and `aria-hidden="true"`; CMS displays `"Decorative image"` badge. |

---

## 4. Performance Preservation Plan (`[PERF-1]`–`[PERF-5]`)

1. **Strict Route-Level Bundle Splitting (`PERF-4`):**
   - `src/App.tsx` loads all `/admin/*` screens via `React.lazy(() => import('./pages/admin/...'))` inside a dedicated admin chunk boundary.
   - Public routes never import `AdminAuthContext` heavy dependencies, rich-text sanitizers, or admin components. Post-build verification reports exact gzipped byte sizes of the public vendor/main chunks vs. admin chunks.
2. **Single Batched Edge-Cached Public Content Payload (`PERF-4`):**
   - Each public page fetches its published content via a single edge-cached request (`GET /api/public/page?path=/...`, `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`), eliminating client-side request waterfalls.
   - Server/Edge HTML injection (`SEO-2` Option A) embeds the initial route's published payload into `window.__INITIAL_CMS_DATA__` inside the HTML response so first paint requires **zero** additional client-side fetch on initial page load and causes **zero** CLS (`CLS = 0`).
3. **Media & Font Optimization (`PERF-4`, `MED-5a`):**
   - `Hero.tsx` LCP image (`SLOT-03`) renders with `loading="eager"`, `fetchpriority="high"`, explicit `width`/`height`, and `<link rel="preload" as="image">` injected in `<head>` on `/`.
   - All below-the-fold images (`SLOT-04` through `SLOT-15`) use `loading="lazy"` and `decoding="async"` with explicit `width`/`height` or `aspect-ratio` containers.
   - R2 public objects (`pub/{versionId}/{variant}.{ext}`) are served with `Cache-Control: public, max-age=31536000, immutable`.

---

## 5. Visual-Regression & Human Visual-Review Gate Plan (`[VIS-1]`)

### 5.1 Automated Baseline & Comparison Workflow (`Chromium`, 5 Viewports)
Executed via Playwright (`playwright-cli` / `@playwright/test` in Chromium, which is installed and verified in the container):
1. **Viewports:** `1920x1080`, `1440x900`, `1024x768`, `768x1024`, and `390x844`.
2. **Target Routes:** All 17 canonical public routes (`/`, `/about`, `/portfolio`, `/products`, `/products/*` [4], `/services`, `/technology-insights`, `/technology-insights/*` [3], `/testimonials`, `/connect-with-us`, `/privacy-policy`, `/terms-of-service`).
3. **Deterministic Capture Conditions:**
   - Emulate `prefers-reduced-motion: reduce` and inject deterministic test CSS disabling CSS transitions/animations so scroll-reveal elements settle immediately.
   - Wait for `document.fonts.ready` and all visible `<img>` elements to complete loading.
4. **Two-Pass Verification:**
   - **Pass 1 (1:1 Structural & Layout Identity under `VISUAL_TEST_PALETTE=legacy`):** Compare our CMS-driven build compiled with `VISUAL_TEST_PALETTE=legacy` against baseline screenshots captured from `https://standalone-omega-one.vercel.app/` across all 17 routes $\times$ 5 viewports (85 screenshot pairs). Generate an HTML side-by-side + pixel-diff report (`pixelmatch`).
   - **Pass 2 (Production Plum `#8E4585` Verification):** Compile without the legacy flag (production plum `#8E4585`), run the bundle scan (`verify-no-legacy-palette.mjs`), run automated contrast assertions, and capture full-page screenshots at all 5 viewports across all public pages for human review.

### 5.2 Masked-Regions Registry (`[VIS-1]`)
Only genuinely dynamic/time-dependent regions may be masked during pixel comparison, and each must be listed with a concrete reason:

| Selector | Page(s) | Justification |
|---|---|---|
| `[data-testid="strategic-solutions-slider-viewport"]` (only if timer not frozen) | `/` | Auto-advancing 3.5s 3D coverflow carousel (frozen at slide index `0` in Playwright clock before masking is ever needed). |
| None other expected | All pages | Because `SEED-1` seeds the exact copy and images from the live site and `prefers-reduced-motion: reduce` freezes reveal transitions, zero layout or content masks should be needed. |

### 5.3 Human Visual-Review Gate Rule (`HR-6`, `VIS-1`)
- In Phase 6, the agent will report only **"automated pass (with pixel-diff percentages and screenshot artifacts)"** and will **never** claim the site is "visually identical" until you inspect the diff report and plum screenshots and approve the Visual-Review Gate.
