# Phase 1 Deliverable — Complete Source & Live Site Inventory (`/docs/01-inventory.md`)

## 1. Sources of Truth & Environment Summary

### 1.1 Inspected Sources
- **Live Site:** `https://standalone-omega-one.vercel.app/` (HTTP/2 200 on Vercel; static Vite SPA bundle `/assets/index-CBaZQS9s.js` and `/assets/index-E6FT0SKN.css`).
- **Source Code Repository:** `https://github.com/yasrahgroup/Standalone.git` (`HEAD` commit `026b300` — *"fix: resolve TypeScript build errors for Vercel deployment"*). Verified that the live site's compiled CSS (`88,194` bytes) and JS bundles match this repository state.

### 1.2 Original Framework, Styling Approach & Current Vercel Deployment
- **Frontend Framework:** React `18.3.1` + Vite `8.3.4` + TypeScript `5.6.3` + `react-router-dom` `7.18.4` + `framer-motion` `14.1.0` + `lucide-react` `0.468.0` + `react-helmet-async` `3.0.0` + `@headlessui/react` `2.2.10` + `react-phone-number-input` `3.4.18`.
- **Styling Approach:** Hybrid CSS architecture (must be preserved faithfully per `HR-1` and `HR-7`):
  1. **CSS Custom Properties & Semantic Design Tokens:** `src/styles/tokens.css` (285 lines) defines brand gradients, surfaces, typography, spacing (`--space-0` to `--space-32`), radii (`--radius-none` to `--radius-full`), transitions, and shadows.
  2. **Global Styles & Responsive Overrides:** `src/styles/global.css` (3,735 lines) imports `@import "tailwindcss";` and `@import "./tokens.css";`, defines `@theme` variables, base typography, custom cursor rules, product card classes (`.featured-products-grid`, `.featured-product-card`), metrics grid (`.about-metrics-grid`), and cross-device media queries.
  3. **Home Utility Styles:** `src/styles/home.css` (175 lines) defines `.section`, `.card`, `.grid-2col`, `.btn-primary`, `.btn-secondary`, `.badge`, and modal classes.
  4. **Component-Scoped Inline Styles & `<style>` Blocks:** Public pages and components extensively use React `style={{ ... }}` objects and embedded `<style>` tags (e.g., `Header.tsx`, `FeaturedSolutions.tsx`, `ContactForm.tsx`, `Portfolio.tsx`, `Services.tsx`, `About.tsx`).
- **Current Vercel Deployment (`vercel.json`):**
  - Contains only a catch-all SPA rewrite: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
  - **What is NOT deployed on Vercel currently:** The `backend/` folder (`backend/server.js`, Express + Postgres on port `3001`) is not wired as Vercel Serverless/Edge functions. Consequently, on `https://standalone-omega-one.vercel.app/`:
    - `cmsService.ts` defaults to `http://localhost:3001`, fails network requests in visitor browsers, and falls back to `localStorage` and static TypeScript files (`src/data/*.ts`).
    - All public routes return the exact same static `index.html` to crawlers and social bots (verified via `/qa-tools/verify-seo-html.mjs`), with no `<link rel="canonical">` in initial HTML and identical homepage `<title>` / `<meta>` tags on every route until client-side `react-helmet-async` executes.

### 1.3 Existing Partial CMS Overview (Baseline for Phase 2 Audit)
Per Section 2 (*"If a partial CMS implementation already exists in the project, audit and correct it instead of rebuilding"*), the repository contains an existing partial CMS:
- **Client Context & Services:** `src/context/CMSContext.tsx`, `src/context/AdminAuthContext.tsx`, `src/services/cmsService.ts`, `src/services/authService.ts`, `src/services/api.ts`.
- **Admin UI Screens (`src/pages/admin/`):** `AdminLogin.tsx`, `AdminLayout.tsx`, `AdminDashboard.tsx`, `AdminPagesManager.tsx`, `AdminProductsManager.tsx`, `AdminServicesManager.tsx`, `AdminPortfolioManager.tsx`, `AdminInsightsManager.tsx`, `AdminTestimonialsManager.tsx`, `AdminNavigationManager.tsx`, `AdminCRMInquiries.tsx`, `AdminCRMRfqs.tsx`, `AdminMediaManager.tsx`, `AdminSettingsManager.tsx`, `AdminAuditLogs.tsx`, `AdminUsersManager.tsx` (plus legacy duplicates `AdminEnquiries.tsx`, `AdminInsights.tsx`, `AdminNavigation.tsx`, `AdminPortfolio.tsx`, `AdminProducts.tsx`, `AdminRFQs.tsx`, `AdminServices.tsx`, `AdminSettings.tsx`, `AdminTestimonials.tsx`).
- **Backend (`backend/`):** `server.js`, `routes/auth.js`, `routes/cms.js`, `middleware/auth.js`, `storage-service.js` (`aws-sdk` v2 / local disk fallback), `scripts/schema.sql`, `scripts/init-cms-db.js`.
- **Major Specification Gaps Identified in Existing Partial CMS:**
  1. **Security & Auth:** `src/services/authService.ts` bundles 5 hardcoded plaintext admin passwords into the client bundle and stores JWTs in `localStorage`; `backend/scripts/init-cms-db.js` contains a hardcoded Neon connection string; no database sessions, no TOTP MFA (`AUTH-1a`), no least-privilege Postgres roles or RLS (`SEC-2`).
  2. **Workflow & Atomic Publish:** No draft vs. published state separation, no live preview from private bucket, no single-transaction PL/pgSQL publish/restore/prune function (`PUB-1`–`PUB-7`), no optimistic locking conflict enforcement.
  3. **Media Pipeline:** No dual private/public R2 bucket architecture, no immutable `versions/{versionId}` or `pub/{versionId}` keys, no M1–M4 exposure states (`MED-INV`), no staged presigned upload verification or `RECON-CORE` (`MED-1`–`MED-9`).
  4. **Hardcoded Public Content (`HR-4`):** Large portions of public pages (`Hero.tsx`, `AboutSection.tsx`, `FeaturedSolutions.tsx`, `StrategicSolutions.tsx`, `IndustryExpertise.tsx`, `FinalCTA.tsx`, `About.tsx`, `Services.tsx`, `Portfolio.tsx`, `NotFound.tsx`) remain hardcoded in JSX or static `src/data/*.ts` files rather than reading from published database state.
  5. **Disallowed CMS Color Picker (`BRAND-7`):** `AdminSettingsManager.tsx` and `CMSContext.tsx` include a runtime theme/color picker (`themePresets.ts`) that mutates CSS variables at runtime.

---

## 2. Complete Route & URL Inventory

### 2.1 Canonical Public Routes (17 URLs)

| Route Path | Component (`src/pages/`) | Dynamic Slugs / Notes | In `public/sitemap.xml`? |
|---|---|---|---|
| `/` | `Home.tsx` | Canonical homepage (9 sections) | Yes |
| `/about` | `About.tsx` | Company story, Vision/Mission, `#our-values`, `#delivery-framework`, CTA | Yes |
| `/products` | `Products.tsx` | Software Platforms catalog with category filter & specification modal | Yes |
| `/products/fitness-management-platform` | `ProductDetail.tsx` | Product detail (`prod-fms`) | No (missing in static sitemap) |
| `/products/omnichannel-commerce-platform` | `ProductDetail.tsx` | Product detail (`prod-commerce`) | No (missing in static sitemap) |
| `/products/learning-management-platform` | `ProductDetail.tsx` | Product detail (`prod-lmp`) | No (missing in static sitemap) |
| `/products/healthcare-management-system` | `ProductDetail.tsx` | Product detail (`prod-hms`) | No (missing in static sitemap) |
| `/services` | `Services.tsx` | Enterprise Services, 4 core practices, industry grid, engagement models (`SlaMatrix.tsx`), process steps | Yes |
| `/portfolio` | `Portfolio.tsx` | Combined Software Products (`#products`) & Engineering Services (`#services`) showcase with detail modals | Yes |
| `/technology-insights` | `Insights.tsx` | Resource Hub / Technical articles with category filter & search | Yes |
| `/technology-insights/scaling-event-streaming-zero-data-loss` | `InsightDetail.tsx` | Article detail (`art-1`) | No (missing in static sitemap) |
| `/technology-insights/private-enterprise-ai-rag-architectures` | `InsightDetail.tsx` | Article detail (`art-2`) | No (missing in static sitemap) |
| `/technology-insights/zero-downtime-monolith-to-microservice-migration` | `InsightDetail.tsx` | Article detail (`art-3`) | No (missing in static sitemap) |
| `/testimonials` | `Testimonials.tsx` | Client Testimonials page (`PageHeader` + `Testimonials` grid + `FinalCTA`) | Yes |
| `/connect-with-us` | `Connect.tsx` | Office info (Address, WhatsApp, Email) + `ContactFaq` accordion + `ContactForm` (General Inquiry & Product Inquiry tabs) | Yes |
| `/privacy-policy` | `PrivacyPolicy.tsx` | Privacy Policy (4 sections) | Yes |
| `/terms-of-service` | `TermsOfService.tsx` | Terms of Service (4 sections) | Yes |

### 2.2 Alias Routes, Client-Side Redirects & Catch-All (`src/App.tsx`)

| Path in `src/App.tsx` | Current Behavior | Notes for `SEO-5` / `HOST-1` |
|---|---|---|
| `/who-we-are` | `<Navigate to="/about" replace />` | Convert/preserve as 301 redirect + router fallback |
| `/values` | Renders `Values.tsx` $\rightarrow$ `<Navigate to="/about#our-values" replace />` | Note: listed in static `sitemap.xml` despite redirecting to `/about#our-values` |
| `/delivery-framework` | Renders `DeliveryFramework.tsx` $\rightarrow$ `<Navigate to="/about#delivery-framework" replace />` | Note: listed in static `sitemap.xml` despite redirecting to `/about#delivery-framework` |
| `/how-we-work` | `<Navigate to="/delivery-framework" replace />` | Chains to `/about#delivery-framework` |
| `/service` | Renders `<Services />` (duplicate mount) | Should 301 redirect to `/services` for canonical consistency |
| `/projects` | `<Navigate to="/portfolio" replace />` | Preserve 301 redirect |
| `/portfolio/:slug` | Renders `<NotFound />` | Intentional 404 for nonexistent sub-routes |
| `/resource-hub` | Renders `<Insights />` (alias used in Header/Footer nav) | Header/Footer link to `/resource-hub`; `SEOHead` canonical is `/technology-insights` |
| `/resource-hub/:slug` | Renders `<InsightDetail />` | Alias for `/technology-insights/:slug` |
| `/insights` | `<Navigate to="/technology-insights" replace />` | Preserve 301 redirect |
| `/contact`, `/connect` | `<Navigate to="/connect-with-us" replace />` | Preserve 301 redirects |
| `/request-for-quote`, `/rfq`, `/quote` | `<Navigate to="/connect-with-us" replace />` | Note: `src/pages/RequestQuote.tsx` and `src/components/rfq/RfqWizard.tsx` exist in repo but `/request-for-quote` redirects to `/connect-with-us` |
| `*` | Renders `<NotFound />` | Custom 404 page (`Status 404 — Route Not Found`) |

---

## 3. Page, Section, Component, Content & Interaction Inventory

### 3.1 Global Layout & Shared Components (`src/layouts/PublicLayout.tsx`, `src/components/common/`)
1. **Skip Link (`PublicLayout.tsx`):** `"Skip to main content"` (`href="#main-content"`), visible on focus.
2. **Header (`src/components/common/Header.tsx`):**
   - **Brand Logo & Wordmark (`#nav-brand-logo`):** Links to `/`. Renders `Logo.png` + wordmark `"Azaroth"` (bold, `CRIMSON_DEEP` `#49243F`) + `"Tech-Hive"` (gold `#C99B52`).
   - **Desktop Navigation (`nav[aria-label="Primary Navigation"]`):**
     - `Home` (`/`)
     - `About Us` (`/about`) — dropdown with 3 sub-items:
       - `Who We Are` (`/about#who-we-are`, desc: *"Our story, vision & mission"*)
       - `Our Values` (`/about#our-values`, desc: *"Core principles that guide our work"*)
       - `Delivery Framework` (`/about#delivery-framework`, desc: *"From discovery to ongoing support"*)
     - `Portfolio` (`/portfolio`) — dropdown with 2 sub-items:
       - `Products` (`/portfolio#products`, desc: *"Enterprise-ready software platforms"*)
       - `Services` (`/portfolio#services`, desc: *"Custom engineering & technology services"*)
     - `Resource Hub` (`/resource-hub`)
   - **Header CTA Button:** `"Connect With Us"` $\rightarrow$ `/connect-with-us`.
   - **Mobile Navigation (`#mobile-navigation`, `role="dialog"`, `aria-label="Mobile navigation menu"`):** Hamburger toggle button (`aria-label="Open main menu"` / `"Close main menu"`), expandable accordion submenus for `About Us` and `Portfolio`, full-width `"Connect With Us"` CTA button.
3. **Footer (`src/components/common/Footer.tsx`):**
   - **Column 1 (Brand & Socials):** `logo-footer-transparent.png`, wordmark `"Azaroth Tech-Hive"`, tagline (*"Engineering dependable software and digital solutions built for long-term business value."*), `"Follow Us"` label + 5 social icon links (LinkedIn, X, Facebook, Instagram, YouTube) with hover tooltips.
   - **Column 2 (`Quick Links`):** `Home` (`/`), `About Us` (`/about`), `Products` (`/portfolio#products`), `Services` (`/portfolio#services`), `Resource Hub` (`/resource-hub`), `Connect With Us` (`/connect-with-us`).
   - **Column 3 (`Products`):** `Fitness Management System` (`/portfolio#products`), `Omnichannel Commerce Platform` (`/portfolio#products`), `Learning Management Platform` (`/portfolio#products`), `Healthcare Management System` (`/portfolio#products`).
   - **Column 4 (`Services`):** `Digital Transformation & Technology Solutions` (`/portfolio#services`), `Strategic Partnership & Consulting` (`/portfolio#services`), `On-Demand Engineering Workforce Solutions` (`/portfolio#services`), `Business Process Management & Operations` (`/portfolio#services`).
   - **Column 5 (`Contact Info`):** Address (`Malaviya Avenue, Thiruvanmiyur, Chennai, India`), Phone (`tel:+916379480931`, `+91 6379480931`), Email (`mailto:hello@azaroth-techhive.com`).
   - **Bottom Bar:** Copyright `"© {year} Azaroth Tech-Hive. All rights reserved."` and link `"Cookies Settings"` (`/privacy-policy#cookies`).
4. **Interactive Site Guide Widget (`src/components/common/Chatbot.tsx`):**
   - Rule-based deterministic knowledge-base widget (no LLM API calls) at bottom-right.
   - Floating trigger button (`aria-label="Open site guide"` / `"Close site guide"`), header (`"Azaroth AI Guide"`, subtitle `"Automated engineering assistant"`), welcome message, 4 quick-prompt chips (`"Explore Products"`, `"Explore Services"`, `"Request a Quote"`, `"Connect With Us"`), deterministic keyword matcher (`KNOWLEDGE_BASE` entries for products, services, delivery framework, pricing/quote, contact/location), text input + send button, reset conversation button.
5. **BackToTop (`src/components/common/BackToTop.tsx`):** Appears when `window.scrollY > 400`; smooth scrolls to top (`aria-label="Back to top"`).
6. **CustomCursor (`src/components/common/CustomCursor.tsx`):** Desktop-only (`@media (hover: none), (pointer: coarse)` hides it) dot + trailing dashed ring.
7. **AdminFloatingBadge (`src/components/common/AdminFloatingBadge.tsx`):** Renders only when an admin session is authenticated on public routes (`"CMS Active | Edit Section | Portal"`).

---

### 3.2 Homepage (`/`, `src/pages/Home.tsx`) — 9 Sections

| Order | Section / Component | Key Copy, Repeatable Items, Links & Interactive Behavior |
|---|---|---|
| 1 | **Hero Banner (`src/components/home/Hero.tsx`)** | Heading: `"Building Smart, Scalable Software for a Connected World"` (`"Smart, Scalable Software"` in gold gradient `#c18b40`). Subtitle paragraph. Primary CTA button: `"Explore Our Solutions"` $\rightarrow$ `/portfolio#services`. Right column visual: central image (`hero_workspace_laptop_1791822839480.jpg`), SVG dashed connector traces, and **7 floating tech squircle badges** (`Web Development`, `Cloud & DevOps`, `Database Systems`, `Cybersecurity`, `AI & Automation`, `Mobile Apps`, `Analytics & BI`) plus **1 bottom glassmorphic status pill** (`"Enterprise-Ready Solutions"` / `"Scalable • Secure • Modern Architecture"`). |
| 2 | **About Us (`src/components/home/AboutSection.tsx`)** | Left image (`hero_workspace_laptop_1791822839480.jpg`). Right column: Kicker `"- ABOUT US -"`, Heading `"Driven by Innovation. Defined by Excellence."`, 2 body paragraphs describing Azaroth Tech-Hive. (Metrics grid commented out per client instruction in source). |
| 3 | **Our Services (`src/components/home/FeaturedSolutions.tsx`)** | Left column: Azaroth Tech-Hive logo (`AZAROTH_LOGO` inline WebP + wordmark), Heading `"From Innovation to Excellence"` / `"Your Technology Growth Partner"`, description paragraph, CTA link `"Explore Services"` $\rightarrow$ `/services`. Right column timeline (`.ath-timeline`): **4 repeatable service cards** (`Digital Transformation & Technology Solutions`, `Strategic Partnership & Consulting`, `On-Demand Engineering Workforce Solutions`, `Business Process Management & Operations`) with custom SVG icons. |
| 4 | **Software Platforms (`src/components/home/ProductsSection.tsx`)** | Heading `"Enterprise Software Solutions"`, subtitle paragraph. **4 repeatable product cards** (`.featured-product-card`, 4-col desktop / 2-col tablet / 1-col mobile): cover image, `ProductStatusBadge` (`Under Development`), title, short description, 3 bullet features (`⊙`), `"Explore Platform"` link $\rightarrow$ `/portfolio#products`. Bottom CTA button: `"View Complete Platform Catalog"` $\rightarrow$ `/portfolio#products`. |
| 5 | **Featured Product Slider (`src/components/home/StrategicSolutions.tsx`)** | Heading `"Featured Solutions"`, subtitle paragraph. Interactive **3D Coverflow / Carousel Slider** of 4 showcase items (`E-Commerce Platform`, `Mobile Banking App`, `Analytics Dashboard`, `Creative Portfolio`) repeated 5x (20 slides total) for infinite loop: category badge, title, description, `"Explore Solution"` link $\rightarrow$ `/portfolio#products`, previous/next arrow buttons (`aria-label="Previous project"` / `"Next project"`), pagination dots (`aria-label="Go to project N"`), auto-play every 3.5s (pauses on hover). Bottom CTA: `"View All Projects"` $\rightarrow$ `/portfolio`. |
| 6 | **Industrial Expertise (`src/components/home/IndustryExpertise.tsx`)** | Heading `"Solutions Across Industries"`, subtitle paragraph. **5 repeatable industry cards** (from `industryData.ts`: `Retail & Digital Commerce`, `Education & Digital Learning`, `Healthcare & Health Technology`, `Supply Chain & Logistics`, `ERP & Business Management Systems`) in a 3+2 centered responsive flex/grid with Lucide icon, title, subtitle, and description. |
| 7 | **Resource Hub (`src/components/home/BlogSection.tsx`)** | Heading `"Insights, Ideas & Tech Perspectives"`, subtitle paragraph. **3 repeatable insight article cards** (from `insightsData.ts` / CMS): cover image, category badge, published date, read time, title, excerpt, `"Read Article"` link $\rightarrow$ `/technology-insights/:slug`. Bottom CTA: `"Explore Resource Hub"` $\rightarrow$ `/technology-insights`. |
| 8 | **FAQ (`src/components/home/FAQSection.tsx`)** | Kicker `"- CLARITY & TRANSPARENCY -"`, Heading `"Frequently Asked Questions"`, subtitle. Left column: **6 repeatable accordion items** (expand/collapse via `aria-expanded`, first item open by default). Right column sticky card: image (`faq_support_card_1792254392707.jpg`), `"Need More Clarity?"` overlay, 3 value points (`Quick Response`, `Practical Guidance`, `Tailored Solutions`), CTA `"Connect With Us"` $\rightarrow$ `/connect-with-us`. |
| 9 | **Final CTA (`src/components/home/FinalCTA.tsx`)** | Heading `"Let's Build the Right Digital Solution."`, description paragraph, primary CTA button `"Plan Your Next Move"` $\rightarrow$ `/connect-with-us`. |

---

### 3.3 Inner Public Pages

1. **`/about` (`src/pages/About.tsx` + `src/components/framework/ProcessTimeline.tsx`):**
   - **PageHeader:** Kicker `"- ABOUT US -"`, Title `"Engineering Reliable Software for Modern Businesses"`, subtitle.
   - **Section 1 (`#who-we-are` — Story & Vision/Mission):** Heading `"Building Practical Technology That Moves Businesses Forward"`, 3 narrative paragraphs, right-side workspace image (`hero_workspace_laptop_1791822839480.jpg`) + **2 cards** (`Our Vision`, `Our Mission`).
   - **Section 2 (`#our-values` — Core Values):** Kicker `"- OUR CORE VALUES -"`, Heading `"Our Core Values"`, subtitle, **6 repeatable value cards** (`01 Purpose-Driven Innovation`, `02 Engineering Excellence`, `03 Simplicity by Design`, `04 Trust & Accountability`, `05 Collaborative Partnership`, `06 Continuous Evolution`).
   - **Section 3 (`#delivery-framework` — Delivery Framework):** Kicker `"- HOW WE WORK -"`, Heading `"A Clear Path from Idea to Impact"`, subtitle, **6 interactive delivery stage cards / timeline** (`01 Discovery`, `02 Planning`, `03 Development`, `04 Testing`, `05 Deployment`, `06 Support`).
   - **Section 4:** `<FinalCTA />`.

2. **`/portfolio` (`src/pages/Portfolio.tsx`):**
   - **PageHeader:** Kicker `"- OUR PORTFOLIO -"`, Title `"Software Solutions & Engineering Services Built for Growth."`, subtitle.
   - **Section 1 (`#products` — Software Products & Platforms):** Heading `"Software Products & Platforms"`, **4 repeatable product cards** (`Fitness Management System`, `Omnichannel Commerce Platform`, `Learning Management Platform`, `Healthcare Management System`) with cover image, status badge, overview, key features, and two actions: `"View Specifications"` (opens interactive **Product Specification Modal** with Overview, Key Capabilities, Target Audience, and `"Inquire About This Platform"` link to `/connect-with-us?type=product&product=...`) and `"Inquire Now"` ($\rightarrow$ `/connect-with-us?type=product&product=...`).
   - **Section 2 (`#services` — Services & Engineering Practices):** Heading `"Services & Engineering Practices"`, **4 repeatable service cards** (`Digital Transformation & Technology Solutions`, `Strategic Partnership & Consulting`, `On-Demand Engineering Workforce Solutions`, `Business Process Management & Operations`) with capabilities list, `"View Service Details"` button (opens interactive **Service Detail Modal** with Overview, Core Capabilities, Key Outcomes, Deliverables, and `"Start a Conversation"` CTA), and `"Discuss Your Needs"` link.
   - **Section 3:** `<FinalCTA />`.

3. **`/products` (`src/pages/Products.tsx`) & `/products/:slug` (`src/pages/ProductDetail.tsx`):**
   - `Products.tsx`: PageHeader (`"- SOFTWARE PLATFORMS -"`), category filter bar (`All`, `Enterprise Solutions`, `Digital Commerce`, `EdTech & Training`, `HealthTech`), search input, product cards with `"Explore Architecture"` modal trigger (`role="dialog"`, `aria-labelledby="modal-product-title"`) and `"Request Custom Demo"` link ($\rightarrow$ `/connect-with-us`), plus `<FinalCTA />`.
   - `ProductDetail.tsx`: Breadcrumb back to `/products`, status badge, title, tagline, description, `"Request Platform Demo"` button ($\rightarrow$ `/connect-with-us`), `"Back to All Platforms"` button, 4 tech spec cards (`Target Latency`, `Throughput / Concurrency`, `Compliance Posture`, `Supported Protocols`), `Key Architectural Capabilities` list, `Enterprise Integration Features` list, and `<FinalCTA />`.

4. **`/services` (`src/pages/Services.tsx` + `src/components/services/SlaMatrix.tsx`):**
   - Hero section (`"Engineering Services Built Around Your Business Goals."`) with quick-jump anchor pills (`#practices`, `#industries`, `#engagement-models`, `#how-we-start`).
   - `#practices`: **4 service practice detail blocks** with expandable/tabbed capabilities, outcomes, and deliverables.
   - `#industries`: **5 industry expertise cards** (`industryExpertiseData`).
   - `#engagement-models` (`SlaMatrix.tsx`): **3 engagement model cards** (`Project Delivery`, `Dedicated Engineering Pod`, `Advisory & Architecture Retainer`) + **3-tier SLA comparison matrix table** (`Standard`, `Business`, `Mission-Critical Enterprise`).
   - `#how-we-start`: 3-step onboarding flow (`1. Share your context`, `2. Architecture & scope call`, `3. Written next-step plan`) + `<FinalCTA />`.

5. **`/technology-insights` (`src/pages/Insights.tsx`) & `/technology-insights/:slug` (`src/pages/InsightDetail.tsx`):**
   - `Insights.tsx`: PageHeader (`"- RESOURCE HUB -"`), category filter pills (`All`, `System Architecture`, `Enterprise AI`, `Cloud Modernization`, `Case Study`), search input (`aria-label="Search articles by keyword"`), **3 repeatable article cards** linking to `/technology-insights/:slug`, plus `<FinalCTA />`.
   - `InsightDetail.tsx`: Back link to `/technology-insights`, category badge, title, author metadata (`name`, `role`, `publishedDate`, `readTime`), table of contents sidebar (`sections`), article paragraphs (`content`), tags, and `<FinalCTA />`.

6. **`/testimonials` (`src/pages/Testimonials.tsx` + `src/components/home/Testimonials.tsx` + `src/components/testimonials/TestimonialCard.tsx`):**
   - PageHeader (`"- CLIENT TESTIMONIALS -"`), grid of client testimonial cards (star rating, quote, client avatar/initials, client name, role, organization), and `<FinalCTA />`.

7. **`/connect-with-us` (`src/pages/Connect.tsx` + `src/components/contact/ContactForm.tsx` + `src/components/contact/ContactFaq.tsx`):**
   - **Left Column:** Heading `"Connect With Our Engineering Team"`, Office Credentials Card (Address, WhatsApp link `https://wa.me/916379480931`, Email link `mailto:hello@azaroth-techhive.com`), and `ContactFaq.tsx` (**4 accordion FAQ items**).
   - **Right Column (`ContactForm.tsx`):** Interactive form with **2 mode tabs**:
     1. **`General Inquiry` tab:** Full Name (required), Email Address (required), Phone Number with international country selector (`react-phone-number-input`, defaults to `IN`), Company / Organization, Service / Area of Interest dropdown (`Digital Transformation & Technology Solutions`, `Strategic Partnership & Consulting`, `On-Demand Engineering Workforce Solutions`, `Business Process Management & Operations`, `General / Other`), Project Details / Message (required, min 10 chars), Privacy Policy consent checkbox (required), hidden honeypot (`website_url`), Submit button (`"Send Message"`).
     2. **`Product Inquiry` tab (also auto-selected via `?type=product&product=...`):** Adds Product Platform multi/single selection (`Fitness Management System`, `Omnichannel Commerce Platform`, `Learning Management Platform`, `Healthcare Management System`), Deployment Preference / Organization Size, and message fields.
     - Submits to `POST /api/cms/enquiries` (via `cmsService.submitEnquiry`) and `apiService.submitContactForm` (`/api/contact`).

8. **`/privacy-policy` (`PrivacyPolicy.tsx`) & `/terms-of-service` (`TermsOfService.tsx`):**
   - `PrivacyPolicy.tsx`: PageHeader (`"Legal & Compliance"` / `"Privacy Policy"`), 4 sections (`1. Commitment to Data Governance`, `2. Information Collection & Usage`, `3. Zero-Knowledge & AI Safeguards`, `4. Data Inquiries & Contact`), supports CMS override via `pages['privacy']`.
   - `TermsOfService.tsx`: PageHeader (`"Legal Framework"` / `"Terms of Service"`), 4 sections (`1. Scope of Engagement`, `2. Intellectual Property Ownership`, `3. Service Level Commitments (SLAs)`, `4. Governing Law & Jurisdiction`), supports CMS override via `pages['terms']`.

9. **Catch-All 404 (`src/pages/NotFound.tsx`):**
   - Badge `"Status 404"`, Heading `"Route Not Found"`, description paragraph, 2 buttons (`"Return to Homepage"` $\rightarrow$ `/`, `"Browse Resource Hub"` $\rightarrow$ `/technology-insights`), plus `<FinalCTA />`.

---

## 4. Media Asset Inventory & Image Slot Classification (`[ALT-1]`–`[ALT-4]`, `[MED-5a]`)

### 4.1 Media Types Used at Launch (`MED-5a`)
- **Used on the original site at launch (Enable at P0):**
  1. **JPEG (`.jpg`)** — 21 files in repo (`public/images/hero/*`, `public/images/products/*`, `src/assets/images/*`) + 2 Unsplash URLs.
  2. **PNG (`.png`)** — 8 files in repo (4 unique SHA-256 hashes across `Logo.png`, `Favicon.png`, `logo-footer.png`, `logo-footer-transparent.png`).
  3. **WebP (`image/webp`)** — 1 inline base64 WebP (`AZAROTH_LOGO` in `src/components/home/FeaturedSolutions.tsx` line 558).
  4. **SVG (`image/svg+xml`)** — Inline SVGs (`Hero.tsx`, `FeaturedSolutions.tsx`, `Connect.tsx`, `ContactForm.tsx`, `global.css`) and Lucide icons.
- **Not used on the original site at launch (Defer to P1 per `MED-5b`):**
  - **MP4 (`video/mp4`)** and **PDF (`application/pdf`)** — zero `.mp4` or `.pdf` files exist in the repository or on the live site.

### 4.2 Complete Slot-by-Slot Image Classification (`[ALT-1]`, `[ALT-4]`)

Per `[ALT]`, every image slot is classified below as **Informative** or **Decorative**, with its current `alt` value in source/live site and whether user input or slot-level correction is needed:

| Slot ID | Page / Component (`source:line`) | Asset Source | Current `alt` Attribute | Classification (`[ALT-1]`) | Rationale & `[ALT-4]` Audit Status |
|---|---|---|---|---|---|
| `SLOT-01` | `Header.tsx:266` (Navbar Brand Link to `/`) | `src/assets/Logo.png` (`/Logo.png`) | `"Azaroth Tech-Hive"` (via `settings.companyName \|\| "Azaroth Tech-Hive Logo"`) | **Informative** (inside `<Link to="/" aria-label="Azaroth Tech-Hive home">`) | Valid; parent `<Link>` has `aria-label="Azaroth Tech-Hive home"`. Seed slot alt as `"Azaroth Tech-Hive — Home"`. |
| `SLOT-02` | `Footer.tsx:171` (Footer Brand Column) | `src/assets/logo-footer-transparent.png` | `"Azaroth Tech-Hive Logo"` | **Decorative** (adjacent to visible `"Azaroth Tech-Hive"` wordmark text) or **Informative** | Adjacent text repeats `"Azaroth Tech-Hive"`. Recommend classifying as **Informative** (`"Azaroth Tech-Hive Logo"`) or **Decorative** (`alt=""`) — **see Confirmation Item #2 below**. |
| `SLOT-03` | `Hero.tsx:238` (Homepage Hero Main Visual) | `src/assets/images/hero_workspace_laptop_1791822839480.jpg` | `"Azaroth Tech-Hive Enterprise Engineering Workspace"` | **Informative** (LCP image, `loading="eager"`) | Meaningful alt present in source; seed as-is. |
| `SLOT-04` | `AboutSection.tsx:70` (Homepage About Us Image) | `src/assets/images/hero_workspace_laptop_1791822839480.jpg` | `"Azaroth Tech-Hive Engineering Team"` | **Informative** | Meaningful alt present in source; seed as-is. |
| `SLOT-05` | `FeaturedSolutions.tsx:985` (Homepage Our Services Intro Logo Mark) | Inline `data:image/webp;base64,...` (`AZAROTH_LOGO`) | `"Azaroth Tech-Hive logo"` | **Decorative** (inside `<div className="ath-logo" aria-label="Azaroth Tech-Hive">` next to `"Azaroth Tech-Hive"` text) | Parent container already carries `aria-label="Azaroth Tech-Hive"`. Can be seeded as Informative (`"Azaroth Tech-Hive logo"`) or Decorative (`alt=""`). |
| `SLOT-06` | `ProductsSection.tsx:56` (Homepage Products Background Float Image) | `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80` | `"Technology platform"` | **Decorative** (`position: absolute`, `zIndex: -1`, `opacity: 0.1`) | Purely decorative background accent (`ALT-3`: must render `alt=""` and `aria-hidden="true"`). Note: currently broken in `MediaRenderer.tsx` due to query-string URL extension parsing. |
| `SLOT-07` | `ProductsSection.tsx:146` (Homepage Software Platforms 4 Cards) | `/images/products/fms-cover.jpg`, `commerce-cover.jpg`, `lmp-cover.jpg`, `hms-cover.jpg` | `alt={productName}` (e.g. `"Fitness Management System"`) | **Informative** | **ISSUE (`ALT-4`):** In `ProductsSection.tsx:146`, `alt` is set to `productName`, which duplicates the adjacent `<h3>{productName}</h3>` instead of using `product.coverAlt` from `productsData.ts`! `productsData.ts` already has descriptive `coverAlt` values for all 4 products (see `SLOT-12`). Recommend seeding `SLOT-07` with `product.coverAlt`. |
| `SLOT-08` | `StrategicSolutions.tsx:540` (Homepage Featured Solutions Slider — 4 Projects) | `ecommerce_platform_*.jpg`, `mobile_banking_app_*.jpg`, `analytics_dashboard_*.jpg`, `creative_portfolio_*.jpg` | `alt={proj.title}` (`"E-Commerce Platform"`, `"Mobile Banking App"`, `"Analytics Dashboard"`, `"Creative Portfolio"`) | **Informative** | **ISSUE (`ALT-4`):** Current `alt={proj.title}` merely repeats the card heading right below it. Meaningful descriptive alt texts are needed for these 4 showcase images (proposed defaults provided in Section 4.3 for your confirmation). |
| `SLOT-09` | `BlogSection.tsx:139` (Homepage Resource Hub 3 Cards) | `real_system_arch_*.jpg`, `real_enterprise_ai_*.jpg`, `real_cloud_mod_*.jpg` | `alt={article.title}` | **Informative** (or **Decorative** since card title `<h3>` is identical) | **ISSUE (`ALT-4`):** Current `alt={article.title}` repeats the adjacent `<h3>{article.title}</h3>`. Either classify card thumbnail as **Decorative** (`alt=""`) OR supply distinct descriptive alt text for the 3 article thumbnails (proposed in Section 4.3). |
| `SLOT-10` | `FAQSection.tsx:265` (Homepage FAQ Right Sticky Support Card) | `src/assets/images/faq_support_card_1792254392707.jpg` | `"Azaroth technical consulting team collaborating on system architecture"` | **Informative** | Meaningful alt present in source; seed as-is. |
| `SLOT-11` | `About.tsx:989` (`/about` Story Section Image) | `src/assets/images/hero_workspace_laptop_1791822839480.jpg` | `"Azaroth Tech-Hive workspace"` | **Informative** | Meaningful alt present in source; seed as-is. |
| `SLOT-12` | `Products.tsx:236` & `Portfolio.tsx:239` (4 Product Cards on `/products` & `/portfolio`) | `/images/products/fms-cover.jpg`, `commerce-cover.jpg`, `lmp-cover.jpg`, `hms-cover.jpg` | `product.coverAlt` from `productsData.ts` | **Informative** | Meaningful `coverAlt` values present in `productsData.ts`:<br>1. FMS: `"Modern gym floor with strength and cardio equipment"`<br>2. Commerce: `"Retail checkout counter with point-of-sale terminal"`<br>3. LMP: `"Instructor leading a digital classroom training session"`<br>4. HMS: `"Clinician reviewing patient records at a hospital workstation"` |
| `SLOT-13` | `Insights.tsx:142` (`/technology-insights` 3 Article Cards) | `real_system_arch_*.jpg`, `real_enterprise_ai_*.jpg`, `real_cloud_mod_*.jpg` | `alt={article.title}` | **Informative** (or **Decorative**) | **ISSUE (`ALT-4`):** Same as `SLOT-09` — `alt` duplicates `article.title`. See Section 4.3. |
| `SLOT-14` | `TestimonialCard.tsx:133` (`/testimonials` Client Avatar) | `testimonial.avatarUrl` (`testimonial_ahmed_1791822983699.jpg` or fallback) | `alt={testimonial.clientName}` | **Decorative** (adjacent to visible `testimonial.clientName` text, with initials fallback) | Repeating `clientName` in `alt` causes screen readers to announce the client's name twice. Recommend classifying avatar thumbnail next to the printed name as **Decorative** (`alt=""`) or Informative (`"Portrait of {clientName}, {role}"`). |
| `SLOT-15` | `Connect.tsx:43` (`/connect-with-us` Hero Background) | `https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80` | `"Communication background"` | **Decorative** (`position: absolute`, `zIndex: -1`, full-bleed background behind `PageHeader`) | Purely decorative background (`ALT-3`: must render `alt=""` and `aria-hidden="true"`). |

### 4.3 Informative Images Lacking Distinct Alt Text — Action Needed at Gate 1 (`[ALT-4]`)
Please confirm whether to use the proposed descriptive alt texts below (or supply your preferred text) for the slots where the original source currently duplicates the adjacent heading:
1. **`SLOT-07` (`ProductsSection.tsx` on `/`):** Use existing `product.coverAlt` from `productsData.ts` (instead of repeating `productName`).
2. **`SLOT-08` (`StrategicSolutions.tsx` 4 Slider Cards on `/`):**
   - `E-Commerce Platform`: *"Omnichannel retail storefront and inventory management interface"*
   - `Mobile Banking App`: *"Mobile banking application displaying account analytics and biometric security"*
   - `Analytics Dashboard`: *"Enterprise business intelligence dashboard with real-time telemetry charts"*
   - `Creative Portfolio`: *"Digital agency portfolio showcase interface on desktop display"*
3. **`SLOT-09` & `SLOT-13` (`BlogSection.tsx` & `Insights.tsx` — 3 Article Cards):**
   - `art-1` (*Scaling Event-Driven Streaming*): *"Distributed server cluster and real-time event streaming architecture visualization"*
   - `art-2` (*Private Enterprise AI RAG*): *"Secure enterprise AI neural retrieval and air-gapped data governance diagram"*
   - `art-3` (*Strangler Fig Monolith to Microservices*): *"Cloud-native microservice mesh and zero-downtime migration topology"*

---

## 5. Brand Color & Maroon Inventory (`[BRAND-1]`–`[BRAND-8]`)

### 5.1 Critical Discovery: Two Brand Color Families in the Repository
Inspecting `https://standalone-omega-one.vercel.app/` and `https://github.com/yasrahgroup/Standalone.git` (`026b300`) reveals that the codebase contains **two distinct brand color layers**:

#### Layer A — Literal Maroon `#7A0C16` & Crimson/Maroon Scales (Still Present in Config/Theme/CSS)
1. `index.html:26` — `<meta name="theme-color" content="#7A0C16" />`
2. `public/site.webmanifest:16` — `"theme_color": "#7A0C16"`
3. `src/data/themePresets.ts:28-41` — `crimson-red` preset:
   - `primaryColor`: `#7A0C16`
   - `secondaryColor`: `#B80F2E`
   - `accentColor`: `#D3163C`
   - `borderColor`: `#FFE4E6`
4. `src/pages/admin/AdminSettingsManager.tsx:57,89-93` — Admin theme preset references to `#7A0C16`, `#B80F2E`, `#D3163C`.
5. `src/styles/global.css:73-84` — `@theme` Maroon scale (`--color-maroon-*`):
   - `--color-maroon-950`: `#3e0a0a`
   - `--color-maroon-900`: `#7a1414`
   - `--color-maroon-800`: `#991a1a`
   - `--color-maroon-700`: `#b82020`
   - `--color-maroon-600`: `#cc2929`
   - `--color-maroon-500`: `#d63e3e`
   - `--color-maroon-400`: `#e16767`
   - `--color-maroon-300`: `#ec9090`
   - `--color-maroon-200`: `#f3c4c4`
   - `--color-maroon-100`: `#fae6e6`
   - `--color-maroon-50`: `#fdf3f3`
6. `src/styles/global.css:47-58` — `@theme` Coral Rose scale (`#4c0519`, `#881337`, `#9f1239`, `#be123c`, `#e11d48`, `#f43f5e`, `#fb7185`, `#fca5a5`, `#fecdd3`, `#ffe4e6`, `#fff1f2`) and rose hover/tint remnants in components (`#FDF2F4`, `#FFF1F2`, `#FFE4E6`, `#FECDD3`, `.hover:text-rose-700`).

#### Layer B — Existing Dark Plum / Maroon-Alias Scale (`#49243F` / `rgb(73, 36, 63)`) Currently Active Across UI
In `src/styles/tokens.css` and across 20+ components, the variables named `--color-primary-maroon`, `--color-dark-maroon`, `CRIMSON_DEEP`, and `CRIMSON_ACCENT` are currently set to a dark eggplant/plum `#49243F` (`rgb(73, 36, 63)`):
- **Primary Solid & Shades:**
  - Base (`--color-primary`, `--color-primary-button`, `--color-primary-maroon`, `CRIMSON_DEEP`, `CRIMSON_ACCENT`): `#49243F` (199 occurrences across `src/`)
  - Hover (`--color-primary-hover`, `--color-primary-button-hover`, `--color-dark-forest`): `#35182E` (`rgb(53, 24, 46)`, 13 occurrences)
  - Active / Darkest (`--color-primary-button-active`, `--color-dark-maroon`): `#281224` (`rgb(40, 18, 36)`, 2 occurrences)
  - Mid Hover (`.featured-product-learn:hover` in `global.css:3524`): `#603453` (1 occurrence)
  - Gradient Stops (`--gradient-button`, `--gradient-heading`, `--gradient-primary`, `--gradient-brand`): `linear-gradient(110deg, #49243F 0%, #8A315D 55%, #C04472 100%)`
  - Hover Gradient (`--gradient-button-hover`): `linear-gradient(110deg, #35182E 0%, #49243F 55%, #8A315D 100%)`
  - `FeaturedSolutions.tsx` local scoped plum/crimson tokens (`lines 667-871`): `--ath-plum: #8a315d`, `--ath-plum-dark: #87013f`, `#a64a70`, `#9d2457`, `#7d003b`, `#800039`, `#a31f5c`, `#750036`.
- **All 23 Opacity Steps of `rgba(73, 36, 63, <alpha>)` Used in Source:**
  - `0.03`, `0.035`, `0.04`, `0.05`, `0.06`, `0.08`, `0.09`, `0.10`, `0.12`, `0.14`, `0.15`, `0.16`, `0.18`, `0.20`, `0.22`, `0.24`, `0.25`, `0.28`, `0.30`, `0.35`, `0.40`, `0.45`, `0.50`, `0.55`, `0.65`, `0.88`, plus `rgba(53, 24, 46, 0.22)`.
- **Neutral Plum-Tinted Surfaces & Typography (`tokens.css`):**
  - `--color-text-primary`: `#2B232D` (shadows `rgba(43, 35, 45, 0.05..0.18)`), `--color-text-secondary`: `#5D545E`, `--color-text-tertiary`: `#746B75`, `--color-footer-bg`: `#211A23`, `--color-footer-border`: `#493B49`.

> **Gate 1 Confirmation Question #1 (Brand Color Scope — Section 0 & Section 6):**
> Since the live site has `#7A0C16` in `index.html` / `site.webmanifest` / `themePresets.ts` (`--color-maroon-*` in `global.css`) while its CSS tokens (`--color-primary`, `--color-primary-maroon`, `CRIMSON_DEEP`) were already partially migrated to `#49243F` (`rgb(73, 36, 63)`):
> - **Option 1A (Full Unification to `#8E4585`):** Replace **both** `#7A0C16` (and `--color-maroon-*` / rose remnants) **and** the primary brand `#49243F` (`rgb(73, 36, 63)`) scale with the new primary plum token **`#8E4585`** (`rgb(142, 69, 133)`) and its derived tints, shades, and 23 opacity steps across the entire site, while keeping the exact current live site values (`#7A0C16` + `#49243F` scale) in the `VISUAL_TEST_PALETTE=legacy` test palette so Phase 6 baseline visual regression against `https://standalone-omega-one.vercel.app/` passes with zero unintended diff.
> - **Option 1B (Literal `#7A0C16` Only):** Replace only `#7A0C16` / `--color-maroon-*` / crimson remnants with `#8E4585`, leaving `#49243F` untouched.
> *(We recommend **Option 1A** as it fulfills `[BRAND-1]`–`[BRAND-8]` — "Define plum `#8E4585` once as a primary brand token and use the token everywhere" — while `VISUAL_TEST_PALETTE=legacy` preserves 1:1 baseline diffing against the current live deployment.)*

### 5.2 Raster Images & Embedded Assets with Baked-In Maroon / Deep-Crimson Pixels (`[BRAND-6]`)
Pixel analysis via headless Chromium `<canvas>` sampling (`rgb(48,0,32)`, `rgb(80,0,48)`, `rgb(128,16,80)`, `rgb(144,16,96)`) confirmed that the following raster brand assets have deep maroon/crimson-berry hues baked into their pixels:
1. **`public/Logo.png` & `src/assets/Logo.png`** (identical SHA-256 `1eef96ec...`, `603,444` bytes) — Used in `Header.tsx`, `AdminLogin.tsx`, `AdminLayout.tsx`, `SEOHead.tsx` (`og:image`).
2. **`assets/Logo.png`** (SHA-256 `0ff8bad6...`, `1,233,198` bytes) — Root unreferenced copy.
3. **`public/Favicon.png` & `src/assets/Favicon.png`** (identical SHA-256 `b4ea040f...`, `1,184,351` bytes) — Browser favicon (`index.html`). *(Note: `index.html` also links `/favicon-32x32.png`, `/favicon-16x16.png`, `/apple-touch-icon.png`, and `site.webmanifest` links `/favicon-192x192.png`, `/favicon-512x512.png`, which do not exist in `public/` and currently fall through to the SPA rewrite!)*
4. **`assets/Favicon.png`** (SHA-256 `649b9591...`, `1,243,697` bytes) — Root unreferenced copy.
5. **`src/assets/logo-footer-transparent.png`** (SHA-256 `1afedbbf...`, `747,559` bytes, `1277x1232`) — Used in `Footer.tsx`.
6. **`src/assets/logo-footer.png`** (SHA-256 `c6dbcede...`, `1,369,658` bytes) — Legacy footer logo in `src/assets/`.
7. **`AZAROTH_LOGO` in `src/components/home/FeaturedSolutions.tsx:558`** — Inline `data:image/webp;base64,...` (`~81 KB`) logo mark in the Homepage "Our Services" section.

*(All other 21 `.jpg` photographic assets in `public/images/` and `src/assets/images/` are photographs/mockups without brand maroon logos baked in.)*

---

## 6. Fonts, Colors, Spacing Scale & Breakpoints (Reported for Confirmation per Section 3)

### 6.1 Fonts
- **Google Fonts stylesheet loaded in `index.html`:**
  - `Plus Jakarta Sans` (weights `300, 400, 500, 600, 700, 800`, plus `400 italic`).
- **Font stacks declared in CSS (`global.css` & `tokens.css`):**
  - `--font-body`: `"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (note: `tokens.css:229` also declares `--font-sans: "DM Sans", "Segoe UI", Arial, sans-serif`, and `FeaturedSolutions.tsx` references `'DM Sans', Arial, sans-serif`, though neither `Outfit` nor `DM Sans` is loaded in `index.html`).
  - `--font-heading`: `"Outfit", "Plus Jakarta Sans", sans-serif` (falls back to `Plus Jakarta Sans` in browsers without local `Outfit`).
  - `--font-mono`: `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
- **Base Typography Scale:**
  - `html`: `16px`
  - `body`: `0.9375rem` (`15px`), line-height `1.6`, weight `400`
  - `h1`: `clamp(1.85rem, 3.2vw, 2.5rem)`, weight `600`, line-height `1.25`, letter-spacing `-0.02em`
  - `h2`: `clamp(1.45rem, 2.4vw, 1.95rem)`, weight `600`
  - `h3`: `clamp(1.15rem, 1.6vw, 1.45rem)`, weight `600`

### 6.2 Color Palette Summary (`tokens.css` & `global.css`)
- **Surfaces & Canvas:** `--color-white: #FFFFFF`, `--color-canvas-bg: #FAF8F4` (Warm Cream), `--color-surface-soft: #F7F2EB`, `--color-surface-muted: #F1EBE3`, `--color-footer-bg: #211A23`.
- **Typography:** `--color-text-primary: #2B232D` (plus `#0F172A` / `#1E293B` / `#18181B` in components), `--color-text-secondary: #5D545E` (plus `#475569` / `#64748B`), `--color-text-tertiary: #746B75`, `--color-text-inverse: #FAF8F4`.
- **Secondary / Antique Gold Accent:** `--color-brand-gold: #C99B52`, hover `#A97B36`, light `#F7EAD2`, lighter `#FCF6EB`, text `#7A5422`, border `#E3C58E`, hero highlight `#F0D6A7` (plus `#C18B40` / `#D4AF37` in components).
- **Borders:** `--color-border: #E3DACF`, `--color-border-medium: #CFC2B4`, `--color-border-strong: #A99AAB` (plus `#E2E8F0` / `#F1F5F9` slate borders).
- **Semantic Status Colors:**
  - Success: `#1F5132` (hover `#174126`, light `#E8F2E8`, border `#B9D6BD`)
  - Warning: `#6D4410` (hover `#55350C`, light `#FDF1DF`, border `#E2C08C`)
  - Alert / Danger: `#A3332B` (hover `#85251F`, light `#FBECEB`, text `#7D231D`, border `#E7B4AE`)

### 6.3 Spacing Scale & Container Metrics (`tokens.css`)
- **Spacing tokens:**
  - `--space-0`: `0` | `--space-1`: `0.25rem` (`4px`) | `--space-2`: `0.5rem` (`8px`) | `--space-3`: `0.75rem` (`12px`) | `--space-4`: `1rem` (`16px`) | `--space-5`: `1.25rem` (`20px`) | `--space-6`: `1.5rem` (`24px`) | `--space-7`: `1.75rem` (`28px`) | `--space-8`: `2rem` (`32px`) | `--space-10`: `2.5rem` (`40px`) | `--space-12`: `3rem` (`48px`) | `--space-16`: `4rem` (`64px`) | `--space-20`: `5rem` (`80px`) | `--space-24`: `6rem` (`96px`) | `--space-32`: `8rem` (`128px`).
- **Section padding:** `.section` uses `padding: 5.5rem 0` (`88px` top/bottom).
- **Container:** `.container` max-width `1280px` (`1440px` at `@media (min-width: 1920px)`), horizontal padding `1.25rem` desktop $\rightarrow$ `1rem` (`<=1024px`) $\rightarrow$ `0.75rem` (`<=480px`) $\rightarrow$ `0.625rem` (`<=375px`).

### 6.4 Breakpoints Used Across CSS & Components
- **`1920px`** (`min-width: 1920px`): Ultra-wide container max-width `1440px`.
- **`1350px` / `1100px`** (`FeaturedSolutions.tsx`): Desktop compact timeline adjustments (`1100px–1350px`) and single-column stack (`max-width: 1099px`).
- **`1024px`** (`min-width: 1024px` / `max-width: 1024px` / `1023px`): Primary Desktop vs. Tablet/Mobile navigation drawer breakpoint (`Header.tsx`), 2-column grids (`.grid-2col`, `.featured-products-grid`, `.about-metrics-grid`, `.our-values-grid`, `.contact-layout`).
- **`768px`** (`max-width: 768px`): Tablet portrait typography scaling & iOS `16px` form input zoom prevention.
- **`640px` / `620px`** (`max-width: 640px` / `620px`): Mobile 1-column card stack (`.featured-products-grid`, `.our-values-grid`, modal sizing, `FeaturedSolutions.tsx` compact cards).
- **`480px`** (`max-width: 480px`): Small mobile typography and metrics stack.
- **`380px` / `375px`** (`max-width: 380px` / `375px`): Compact mobile padding.
- **Visual Regression Target Widths (`VIS-1`):** `1920px`, `1440px`, `1024px`, `768px`, `390px`.

---

## 7. Forms & Third-Party Scripts Inventory (`[CMS-6]`, `[CMS-7]`)

### 7.1 Forms Present on the Original Site (`[CMS-7]`)
1. **`ContactForm.tsx` on `/connect-with-us` (Active in navigation):**
   - Two tabs (`General Inquiry` and `Product Inquiry`).
   - Fields: `fullName`, `workEmail`, `phone` (with `react-phone-number-input`), `companyName`, `enquiryAbout` / `selectedProduct`, `deploymentType` / `orgSize`, `message`, `consent` checkbox, and `website_url` honeypot.
2. **`RfqWizard.tsx` in `src/components/rfq/RfqWizard.tsx` (Unmounted in `App.tsx`):**
   - 5-step wizard (`Select Architecture & Engineering Focus`, `Project Scope & Target Timeline`, `Budget Allocation & Architectural Requirements`, `Share Your Project Documents`, `Contact & Verification Details`).
   - Note: `/request-for-quote`, `/rfq`, and `/quote` all redirect to `/connect-with-us` in `src/App.tsx`. At Gate 1, please confirm whether `RfqWizard` stays redirected/unmounted or if only `ContactForm` on `/connect-with-us` is in scope for P1 (`CMS-7`).

### 7.2 Third-Party Scripts & External Connections (`[CMS-6]`)
- **Third-Party JavaScript Scripts:** **None.** Neither `index.html` nor any component loads Google Analytics, GTM, Meta Pixel, Intercom, or any third-party `<script>`. Per `HR-3` and `CMS-6`, no third-party public scripts will be added.
- **External Stylesheets / Fonts:** Google Fonts (`https://fonts.googleapis.com`, `https://fonts.gstatic.com`).
- **External Image Requests Found in Code:**
  - `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80` (`ProductsSection.tsx:56`)
  - `https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80` (`Connect.tsx:43`)
  - `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80` (`CMSContext.tsx` default testimonial avatar fallback)
  - `https://flagcdn.com` or inline SVG flags via `react-phone-number-input` on `/connect-with-us`.

---

## 8. Baseline Verification Evidence (`/qa-tools/`)

1. **Crawler & Social-Bot Raw HTML Check (`/qa-tools/verify-seo-html.mjs` — Executed):**
   - Ran `node qa-tools/verify-seo-html.mjs` against `https://standalone-omega-one.vercel.app/`.
   - **Verified Baseline Result:** Every public path (`/`, `/about`, `/products`, `/services`, `/portfolio`, `/technology-insights`, `/testimonials`, `/connect-with-us`, `/privacy-policy`, `/terms-of-service`) returns HTTP `200` with identical static HTML:
     - `title`: `"Azaroth Tech-Hive — Enterprise Technology Solutions & Engineering"`
     - `description`: `"Azaroth Tech-Hive architects mission-critical digital systems, resilient microservice ecosystems, high-availability software platforms, and dedicated engineering pods for global enterprises."`
     - `ogTitle`: `"Azaroth Tech-Hive — Enterprise Technology Solutions & Engineering"`
     - `ogDescription`: `"Architecting mission-critical digital systems, resilient microservice ecosystems, and dedicated engineering pods for global enterprises."`
     - `ogType`: `"website"`, `ogSiteName`: `"Azaroth Tech-Hive"`, `robots`: `"index, follow"`, `themeColor`: `"#7A0C16"`, `canonical`: `null`.
   - This confirms why **Option A** (server/edge HTML metadata injection per route, cached with `s-maxage` + `stale-while-revalidate` and purged on publish) is required at Phase 4 (`SEO-2`).
2. **Lighthouse CI & Median Performance Script (`/qa-tools/lighthouserc.mobile.json`, `/qa-tools/lighthouserc.desktop.json`, `/qa-tools/measure-baseline.mjs`):**
   - Delivered in `/qa-tools/` with `README.md`.
   - Executed `node qa-tools/measure-baseline.mjs` in container: verified clean exit (`code 2`) reporting that `lighthouse` CLI is not pre-installed in the container image (`PERF-1`, `PERF-5`: marked *"Config and script provided, not run in container"*).
