# Phase 2 Deliverable — Component Audit Matrix, Admin Navigation Tree & HR-4 Hardcoding Audit (`/docs/02-audit-matrix.md`)

Built strictly from verified inspection of `https://standalone-omega-one.vercel.app/` and `https://github.com/yasrahgroup/Standalone.git` (commit `026b300`).

---

## 1. Component-by-Component Audit Matrix (Section 19)

| Original page | Section | Component (source ref) | Current CMS mapping | Status (present / missing / altered / unnecessary) | CMS coverage (complete / partial / missing) | Functional status | Action (preserve / restore / connect / fix / remove) |
|---|---|---|---|---|---|---|---|
| **Global Layout** | Accessibility Skip Link | `src/layouts/PublicLayout.tsx` | None (hardcoded `"Skip to main content"`) | Present | Missing | Working | **Connect** label to Site Settings (`HR-4`) and **preserve** focus behavior |
| **Global Layout** | Primary Header & Mobile Drawer | `src/components/common/Header.tsx` | `cms.navigation`, `cms.settings` (`AdminNavigationManager.tsx`, `AdminSettingsManager.tsx`) | Present | Partial (wordmark `"Azaroth"` / `"Tech-Hive"`, dropdown descriptions, mobile drawer ARIA labels, and fallback menu items hardcoded in JSX) | Working | **Connect** all menu labels, sub-item descriptions, CTA, logo slot (`SLOT-01`), and ARIA strings to published Neon state; **preserve** responsive `1024px` drawer & dropdown behavior |
| **Global Layout** | Global Footer | `src/components/common/Footer.tsx` | `cms.footer`, `cms.settings`, `cms.products`, `cms.services` | Present | Partial (column headings, `"Follow Us"`, `"Cookies Settings"`, social tooltips, and fallback links hardcoded in JSX) | Working | **Connect** all 5 columns, social links, copyright, cookie link, and logo slot (`SLOT-02`) to published Neon state |
| **Global Layout** | Interactive Site Guide Widget | `src/components/common/Chatbot.tsx` | None (all `KNOWLEDGE_BASE` Q&A, chips, greeting, and header labels hardcoded in `Chatbot.tsx`) | Present | Missing | Working (rule-based deterministic widget) | **Connect** header, welcome copy, quick-prompt chips, and `KNOWLEDGE_BASE` entries to Site Settings / Global Widgets in Neon (`HR-4`); **preserve** deterministic matching |
| **Global Layout** | Back To Top Button | `src/components/common/BackToTop.tsx` | None (`aria-label="Back to top"` hardcoded) | Present | Missing | Working | **Connect** `aria-label` to global accessibility strings in Neon (`HR-4`); **preserve** `scrollY > 400` behavior |
| **Global Layout** | Custom Desktop Cursor | `src/components/common/CustomCursor.tsx` | N/A (purely visual pointer effect) | Present | N/A (no public copy) | Working | **Preserve** as-is and replace maroon/plum hardcoded border/dot colors with primary brand token (`BRAND-1`) |
| **Global Layout** | Admin Floating Badge | `src/components/common/AdminFloatingBadge.tsx` | Reads `AdminAuthContext` (`localStorage` JWT) | Altered (relies on insecure client-side `localStorage` auth) | Complete (Admin-only UI) | Working | **Fix** to read verified server session (`AUTH-1a`); never render or bundle for unauthenticated public visitors (`PERF-4`) |
| **Homepage (`/`)** | 1. Hero Banner | `src/components/home/Hero.tsx` | `cms.pages['home'].hero` (`AdminPagesManager.tsx`) | Present | Partial (7 floating tech squircle badges, bottom glassmorphic status pill `"Enterprise-Ready Solutions"`, gold highlight split, and `SLOT-03` image/alt hardcoded in `Hero.tsx`) | Working | **Connect** heading, gold highlight phrase, subtitle, CTA button, 7 tech badges, bottom status pill, and `SLOT-03` media version + slot alt to Neon |
| **Homepage (`/`)** | 2. About Us | `src/components/home/AboutSection.tsx` | `cms.pages['home'].aboutPreview` | Present | Partial (kicker `"- ABOUT US -"`, heading, 2 paragraphs, and `SLOT-04` image/alt hardcoded in `AboutSection.tsx`) | Working | **Connect** kicker, heading, body paragraphs, and `SLOT-04` media version + slot alt to Neon |
| **Homepage (`/`)** | 3. Our Services | `src/components/home/FeaturedSolutions.tsx` | None (`SERVICES` array of 4 timeline items, left intro card, and inline `AZAROTH_LOGO` WebP hardcoded in `FeaturedSolutions.tsx`) | Present | Missing | Working | **Connect** section intro, `SLOT-05` logo version + alt, CTA link, and 4 timeline service items (title, description, icon key) to Neon; replace scoped crimson/maroon hexes (`#8a315d`, `#87013f`, etc.) with derived plum tokens (`BRAND-2`, `BRAND-3`) |
| **Homepage (`/`)** | 4. Software Platforms | `src/components/home/ProductsSection.tsx` | `cms.products`, `cms.pages['home'].productsPreview` | Present | Partial (bullet features hardcoded per `product.id` switch in `ProductsSection.tsx`; `SLOT-06` decorative background broken in `MediaRenderer.tsx`; `SLOT-07` `alt` duplicates `productName` instead of `coverAlt`) | Partially broken (`MediaRenderer` URL bug on query string) | **Fix** `MediaRenderer.tsx`, **connect** section headers, CTA, card bullets, `SLOT-06` (`alt=""`), and `SLOT-07` (version ID + descriptive slot alt) to Neon |
| **Homepage (`/`)** | 5. Featured Product Slider | `src/components/home/StrategicSolutions.tsx` | None (`PROJECTS` array of 4 showcase slides hardcoded in `StrategicSolutions.tsx`) | Present | Missing | Working (3D coverflow slider) | **Connect** heading, subtitle, bottom CTA, slider controls `aria-label`s, and 4 repeatable showcase items (`SLOT-08` version ID + descriptive slot alt, category, title, description, link) to Neon; **preserve** 3D coverflow physics and `prefers-reduced-motion` |
| **Homepage (`/`)** | 6. Industrial Expertise | `src/components/home/IndustryExpertise.tsx` (`src/data/industryData.ts`) | None (reads static `industryExpertiseData` in `src/data/industryData.ts`) | Present | Missing | Working | **Connect** section header and 5 repeatable industry cards (icon key, title, subtitle, description) to Neon |
| **Homepage (`/`)** | 7. Resource Hub | `src/components/home/BlogSection.tsx` | `cms.insights`, `cms.pages['home'].insightsPreview` | Present | Partial (CTA labels `"Read Article"`, `"Explore Resource Hub"`, and fallback headers hardcoded; `SLOT-09` `alt` repeats `article.title`) | Working | **Connect** section headers, CTA labels, and 3 featured insight cards (`SLOT-09` version ID + non-duplicative slot alt) to Neon |
| **Homepage (`/`)** | 8. FAQ | `src/components/home/FAQSection.tsx` | `cms.pages['home'].faq` | Present | Partial (sticky right support card `"Need More Clarity?"`, 3 value points, `SLOT-10` image/alt, and default 6 FAQs hardcoded in `FAQSection.tsx`) | Working | **Connect** kicker, heading, subtitle, 6 repeatable FAQ items, and sticky support card (`SLOT-10` version ID + slot alt, heading, 3 bullets, CTA) to Neon |
| **Homepage (`/`)** | 9. Final CTA | `src/components/home/FinalCTA.tsx` | `cms.pages['home'].cta` | Present | Partial (default heading `"Let's Build the Right Digital Solution."`, description, and button label `"Plan Your Next Move"` hardcoded in `FinalCTA.tsx`) | Working | **Connect** shared/per-page Final CTA heading, subtitle, and button (label, URL, visibility) to Neon |
| **About Us (`/about`)** | Page Header & Story (`#who-we-are`) | `src/pages/About.tsx` | `cms.pages['about']` (`AdminPagesManager.tsx`) | Present | Partial (3 story paragraphs, Vision & Mission cards, and `SLOT-11` workspace image/alt hardcoded in `About.tsx`) | Working | **Connect** PageHeader, `#who-we-are` heading, 3 narrative paragraphs, `SLOT-11` version ID + slot alt, and Vision/Mission cards to Neon |
| **About Us (`/about`)** | Core Values (`#our-values`) | `src/pages/About.tsx` | None (6 core value cards hardcoded in `About.tsx`) | Present | Missing | Working | **Connect** kicker, heading, subtitle, and 6 repeatable value cards (number, title, description, icon) to Neon |
| **About Us (`/about`)** | Delivery Framework (`#delivery-framework`) | `src/pages/About.tsx`, `src/components/framework/ProcessTimeline.tsx` | None (6 delivery stages hardcoded in `About.tsx` / `frameworkData.ts`) | Present | Missing | Working | **Connect** kicker, heading, subtitle, and 6 repeatable delivery framework stages (step number, title, subtitle, description, deliverables) to Neon |
| **Portfolio (`/portfolio`)** | Page Header, Products (`#products`) & Spec Modal | `src/pages/Portfolio.tsx` | `cms.products` (`AdminProductsManager.tsx`) | Present | Partial (PageHeader, section headings, modal labels `"Overview"`, `"Key Capabilities"`, `"Target Audience"`, and button labels hardcoded in `Portfolio.tsx`) | Working | **Connect** PageHeader, `#products` section headers, modal labels, and 4 repeatable product items (`SLOT-12` version ID + slot alt, status badge, specs, capabilities, target audience, links) to Neon |
| **Portfolio (`/portfolio`)** | Services (`#services`) & Detail Modal | `src/pages/Portfolio.tsx` | `cms.services` (`AdminServicesManager.tsx`) | Present | Partial (4 service practice details, capabilities, outcomes, deliverables, and modal copy hardcoded in `Portfolio.tsx`) | Working | **Connect** `#services` section headers, modal labels, and 4 repeatable service practices (capabilities, outcomes, deliverables, links) to Neon |
| **Products (`/products`)** | Catalog Grid, Filter & Architecture Modal | `src/pages/Products.tsx` (`src/data/productsData.ts`) | `cms.products` (`AdminProductsManager.tsx`) | Present | Partial (category filter tabs, search placeholder, modal labels, and fallback `productsData.ts` hardcoded) | Working | **Connect** PageHeader, filter categories, search placeholder/empty state, card CTAs, modal labels, and product records (`SLOT-12`) to Neon |
| **Product Detail (`/products/:slug`)** | Platform Detail & Tech Specs | `src/pages/ProductDetail.tsx` | `cms.products` | Present | Partial (4 tech spec cards `Target Latency`, `Throughput / Concurrency`, `Compliance Posture`, `Supported Protocols`, and section headings hardcoded in `ProductDetail.tsx`) | Working | **Connect** breadcrumb label, CTA buttons, 4 technical specification metrics, architectural capabilities, and integration features per product in Neon |
| **Services (`/services`)** | Hero, 4 Practices (`#practices`), Industries (`#industries`), SLA Matrix (`#engagement-models`), Onboarding (`#how-we-start`) | `src/pages/Services.tsx`, `src/components/services/SlaMatrix.tsx` | `cms.services`, `cms.pages['services']` | Present | Partial (anchor pills, 4 detailed practices, 3 engagement models, 3-tier SLA comparison matrix in `SlaMatrix.tsx`, and 3 onboarding steps hardcoded in JSX) | Working | **Connect** hero, anchor pills, 4 practices, 5 industries, 3 engagement models, SLA comparison matrix rows/columns, and 3 onboarding steps to Neon |
| **Resource Hub (`/technology-insights`, `/resource-hub`)** | Article Listing, Category Filter & Search | `src/pages/Insights.tsx` (`src/data/insightsData.ts`) | `cms.insights` (`AdminInsightsManager.tsx`) | Present | Partial (PageHeader, category filter pills, search input `aria-label`/placeholder, empty state, and `SLOT-13` alt duplication) | Working | **Connect** PageHeader, filter labels, search strings, and repeatable insight articles (`SLOT-13` version ID + distinct slot alt) to Neon |
| **Article Detail (`/technology-insights/:slug`)** | Article Reader & Table of Contents | `src/pages/InsightDetail.tsx` | `cms.insights` | Present | Partial (sidebar labels `"Table of Contents"`, `"Share Article"`, back link text hardcoded) | Working | **Connect** article body sections, author metadata, tags, and reader UI labels to Neon |
| **Testimonials (`/testimonials`)** | Client Testimonials Grid | `src/pages/Testimonials.tsx`, `src/components/home/Testimonials.tsx`, `src/components/testimonials/TestimonialCard.tsx` | `cms.testimonials` (`AdminTestimonialsManager.tsx`) | Present | Partial (PageHeader hardcoded; `SLOT-14` avatar `alt` repeats `clientName`) | Working | **Connect** PageHeader and repeatable testimonial items (`SLOT-14` version ID + decorative/distinct alt, rating, quote, client name, role, organization) to Neon |
| **Connect With Us (`/connect-with-us`)** | Office Credentials, Contact FAQ & 2-Tab Inquiry Form | `src/pages/Connect.tsx`, `src/components/contact/ContactFaq.tsx`, `src/components/contact/ContactForm.tsx` | `cms.pages['connect']`, `cms.settings`, `cms.enquiries` (`AdminCRMInquiries.tsx`) | Present | Partial (`SLOT-15` background Unsplash URL, office card labels, 4 `ContactFaq` items, and all `ContactForm` labels/placeholders/validation/success strings hardcoded in JSX) | Partially working (form POSTs to `/api/cms/enquiries` which is not deployed on Vercel) | **Connect** PageHeader, `SLOT-15` (`alt=""`), office credentials, 4 Contact FAQs, and all form labels/messages to Neon; wire P1 `CMS-7` form handler |
| **Privacy Policy (`/privacy-policy`)** | Legal Document | `src/pages/PrivacyPolicy.tsx` | `cms.pages['privacy']` | Present | Partial (default 4 sections hardcoded in `PrivacyPolicy.tsx` when CMS key absent) | Working | **Connect** PageHeader, last-updated date, and repeatable legal sections (`#cookies` anchor preserved) to Neon |
| **Terms of Service (`/terms-of-service`)** | Legal Document | `src/pages/TermsOfService.tsx` | `cms.pages['terms']` | Present | Partial (default 4 sections hardcoded in `TermsOfService.tsx` when CMS key absent) | Working | **Connect** PageHeader, last-updated date, and repeatable legal sections to Neon |
| **Catch-All 404 (`*`)** | Custom 404 Page | `src/pages/NotFound.tsx` | None (all copy and buttons hardcoded in `NotFound.tsx`) | Present | Missing | Working | **Connect** 404 badge, heading, description, and action buttons to Site Settings in Neon (`OPS-1`, `HR-4`) |
| **Unmounted Legacy RFQ Wizard** | `/request-for-quote` (redirects to `/connect-with-us` in `App.tsx`) | `src/pages/RequestQuote.tsx`, `src/components/rfq/RfqWizard.tsx`, `src/pages/admin/AdminCRMRfqs.tsx`, `src/pages/admin/AdminRFQs.tsx` | `cms.rfqs` | Unnecessary / Unmounted (route redirects to `/connect-with-us` on live site) | N/A | Unmounted | **Remove** unmounted `RequestQuote.tsx`, `RfqWizard.tsx`, `AdminCRMRfqs.tsx`, and `AdminRFQs.tsx` per `HR-3` (preserving 301 redirect `/request-for-quote`, `/rfq`, `/quote` $\rightarrow$ `/connect-with-us`) |
| **Legacy Duplicate Admin Screens** | Duplicate unmounted files in `src/pages/admin/` | `AdminEnquiries.tsx`, `AdminInsights.tsx`, `AdminNavigation.tsx`, `AdminPortfolio.tsx`, `AdminProducts.tsx`, `AdminServices.tsx`, `AdminSettings.tsx`, `AdminTestimonials.tsx` | Superseded by `Admin*Manager.tsx` files | Unnecessary | N/A | Unused dead files | **Remove** dead duplicate admin files in Phase 3 (`CODE-1`) |
| **Runtime Theme/Color Picker** | Admin Settings Color Preset Selector | `src/data/themePresets.ts`, `AdminSettingsManager.tsx` (theme tab), `CMSContext.tsx` (runtime CSS variable injector) | `cms.settings.themePreset` | Unnecessary (violates `BRAND-7`) | N/A | Active in admin | **Remove** runtime color/theme picker and `themePresets.ts` in Phase 3 (`BRAND-7`: brand color is a code token, not a CMS field) |

---

## 2. Admin Navigation Tree (`[CMS-1]`, `[HR-3]`)

Per `CMS-1` (*"Admin navigation mirrors the real site: one editor per page and per section, named as on the original; shared editors for navigation, footer, and Site Settings"*) and `HR-3` (permitted admin screens only):

```text
Azaroth CMS Admin (/admin)
├── 1. Pages & Sections (Site-Mirrored Editor)
│   ├── Homepage (/)
│   │   ├── Section 1: Hero Banner (Heading, Gold Highlight, Subtitle, CTA, 7 Tech Badges, Status Pill, SLOT-03 Image & Alt)
│   │   ├── Section 2: About Us (Kicker, Heading, Body Paragraphs, SLOT-04 Image & Alt)
│   │   ├── Section 3: Our Services (Intro, SLOT-05 Logo & Alt, CTA, 4 Repeatable Timeline Service Cards)
│   │   ├── Section 4: Software Platforms (Heading, Subtitle, SLOT-06 Decorative Bg, 4 Product Cards & SLOT-07 Alt, Catalog CTA)
│   │   ├── Section 5: Featured Solutions Slider (Heading, Subtitle, 4 Repeatable Showcase Slides & SLOT-08 Alt, View All CTA)
│   │   ├── Section 6: Solutions Across Industries (Heading, Subtitle, 5 Repeatable Industry Cards)
│   │   ├── Section 7: Resource Hub Preview (Heading, Subtitle, 3 Featured Insight Cards & SLOT-09 Alt, CTA)
│   │   ├── Section 8: Frequently Asked Questions (Kicker, Heading, Subtitle, 6 Repeatable FAQs, Sticky Support Card & SLOT-10 Alt)
│   │   ├── Section 9: Final CTA (Heading, Description, Button)
│   │   └── Page SEO & Social Metadata (Title, Meta Description, OG Tags, Robots, Canonical Preview)
│   ├── About Us (/about)
│   │   ├── Page Header & SEO Metadata
│   │   ├── Section 1: Who We Are — Story, Vision & Mission (Heading, 3 Paragraphs, SLOT-11 Image & Alt, Vision & Mission Cards)
│   │   ├── Section 2: Our Core Values (#our-values — Kicker, Heading, Subtitle, 6 Repeatable Value Cards)
│   │   ├── Section 3: Delivery Framework (#delivery-framework — Kicker, Heading, Subtitle, 6 Repeatable Stage Cards)
│   │   └── Section 4: Final CTA
│   ├── Portfolio (/portfolio)
│   │   ├── Page Header & SEO Metadata
│   │   ├── Section 1: Software Products & Platforms (#products — Section Copy, Modal Labels, Ordered Product Refs & SLOT-12 Alt)
│   │   ├── Section 2: Services & Engineering Practices (#services — Section Copy, Modal Labels, Ordered Service Practice Refs)
│   │   └── Section 3: Final CTA
│   ├── Software Platforms (/products & /products/:slug)
│   │   ├── Catalog Page Header, Category Tabs, Search Labels & SEO Metadata
│   │   └── Repeatable Product Platforms (4 Platforms: Overview, Status Badge, Cover SLOT-12 & Alt, 4 Tech Specs, Capabilities, Integrations, Detail Page SEO)
│   ├── Enterprise Services (/services)
│   │   ├── Hero & Quick-Jump Anchor Pills + Page SEO Metadata
│   │   ├── Section 1: Core Engineering Practices (#practices — 4 Repeatable Practices: Capabilities, Outcomes, Deliverables)
│   │   ├── Section 2: Industry Expertise (#industries — Shared/Page 5 Repeatable Industry Cards)
│   │   ├── Section 3: Engagement Models & SLA Matrix (#engagement-models — 3 Engagement Cards + 3-Tier SLA Table)
│   │   ├── Section 4: How We Start (#how-we-start — 3 Repeatable Onboarding Steps)
│   │   └── Section 5: Final CTA
│   ├── Resource Hub (/technology-insights & /technology-insights/:slug)
│   │   ├── Hub Page Header, Category Filters, Search Labels & SEO Metadata
│   │   └── Repeatable Articles (3+ Articles: Slug, Category, Date, Read Time, Author, Thumbnail SLOT-13 & Alt, Excerpt, Structured Sections, Tags, Article SEO)
│   ├── Client Testimonials (/testimonials)
│   │   ├── Page Header & SEO Metadata
│   │   ├── Repeatable Testimonial Cards (Client Name, Role, Organization, Star Rating, Quote, Avatar SLOT-14 & Alt/Decorative Flag)
│   │   └── Final CTA
│   ├── Connect With Us (/connect-with-us)
│   │   ├── Page Header, Decorative Background (SLOT-15) & SEO Metadata
│   │   ├── Office Credentials Card (Address, WhatsApp, Email)
│   │   ├── Contact FAQ Accordion (4 Repeatable FAQ Items)
│   │   └── Inquiry Form Copy & Labels (General & Product Inquiry Tab Labels, Field Labels, Placeholders, Consent Copy, Success/Error Strings)
│   ├── Privacy Policy (/privacy-policy)
│   │   └── Page Header, Last Updated, Repeatable Legal Sections (#cookies preserved) & SEO Metadata
│   └── Terms of Service (/terms-of-service)
│       └── Page Header, Last Updated, Repeatable Legal Sections & SEO Metadata
├── 2. Shared Navigation & Footer
│   ├── Header Navigation (Logo SLOT-01 & Alt, Brand Wordmark, Desktop/Mobile Menu Items & Submenus, Header CTA)
│   └── Global Footer (Footer Logo SLOT-02 & Alt, Tagline, 5 Social Links, Quick Links, Products Links, Services Links, Contact Info, Copyright, Cookies Link)
├── 3. Site Settings (Global)
│   ├── Brand Assets & Identity (Company Name, Primary Logo, Footer Logo, Favicon, Default OG Image)
│   ├── Global SEO Defaults (Title Suffix, Default Description, Default Robots)
│   ├── Custom 404 Page Copy (Badge, Heading, Description, Primary & Secondary Buttons)
│   ├── Interactive Site Guide Widget (Header, Welcome Copy, 4 Quick Prompts, Deterministic Knowledge-Base Entries)
│   ├── Global Accessibility Labels (Skip-to-content, Back-to-top, Slider/Modal/Menu ARIA labels)
│   ├── Third-Party Script Config (Empty by default per CMS-6; configurable only if original has scripts)
│   └── Security Policy Toggle (P1 Editor MFA Requirement Toggle — AUTH-1b)
├── 4. Media Library (MED-1 to MED-10)
│   ├── Active Assets & Immutable Versions (Upload, Replace Version, Slot Usages "Used In", Aspect-Ratio Check, Batch Publish Affected Pages)
│   └── Trash & Reconciliation Status (P0 Soft-Delete/Purge via RECON-CORE; P1 Trash UI & RECON-REPORT — MED-4b, MED-10)
├── 5. Revision History (PUB-3, PUB-5a, PUB-5b)
│   └── Retained Snapshots (Up to 20 revisions; P0 Admin Restore-to-Draft; P1 Revision Diff/View UI)
├── 6. Form Submissions (P1 — CMS-7, for /connect-with-us inquiries)
│   └── Read-Only Inquiry List, Safe CSV Export, 12-Month Retention & Admin Purge
├── 7. Users & Access (SEC-1, AUTH-1a)
│   └── Admin & Editor Accounts (1–5 users), Role Assignment, MFA Status, Password Reset & Break-Glass Audit Info
├── 8. Audit Log (P0 DB Writes — AUDIT-1a; P1 Admin UI Screen — AUDIT-1b)
└── 9. System Status (PUB-7, MED-9, OBS-2, BAK-2, BAK-3)
    └── Live Readiness Status, Last Publish & Cache Purge Status (+ Manual Retry), Last RECON-CORE Heartbeat (+ Manual Trigger), Last Backup Heartbeats (DB Dump & R2 Sync)
```

---

## 3. Hardcoding Audit List (`[HR-4]`)

### 3.1 Visitor-Facing Content Moving from Code to Neon Postgres
Every item below is currently hardcoded in JSX, CSS, or `src/data/*.ts` and **must** move to Neon Postgres (seeded idempotently in Phase 3 via `SEED-1`):

1. **Global Shell & Accessibility Strings:**
   - `PublicLayout.tsx`: `"Skip to main content"`
   - `Header.tsx`: Wordmark `"Azaroth"`, `"Tech-Hive"`, nav labels (`Home`, `About Us`, `Portfolio`, `Resource Hub`), dropdown sub-labels and descriptions (`Who We Are` — *"Our story, vision & mission"*, `Our Values` — *"Core principles that guide our work"*, `Delivery Framework` — *"From discovery to ongoing support"*, `Products` — *"Enterprise-ready software platforms"*, `Services` — *"Custom engineering & technology services"*), CTA `"Connect With Us"`, ARIA labels (`"Primary Navigation"`, `"Azaroth Tech-Hive home"`, `"Open main menu"`, `"Close main menu"`, `"Mobile navigation menu"`), `SLOT-01` alt text.
   - `Footer.tsx`: Wordmark, tagline, `"Follow Us"`, 5 social URLs & labels, column titles (`Quick Links`, `Products`, `Services`, `Contact Info`), all footer links, address, phone, email, copyright template, `"Cookies Settings"`, `SLOT-02` alt text.
   - `Chatbot.tsx`: Trigger `aria-label` (`"Open site guide"` / `"Close site guide"`), title `"Azaroth AI Guide"`, subtitle `"Automated engineering assistant"`, welcome message, 4 quick-prompt chips, all deterministic `KNOWLEDGE_BASE` patterns and responses, input placeholder `"Ask about our platforms or services..."`, fallback message.
   - `BackToTop.tsx`: `aria-label="Back to top"`.
2. **Homepage (`/`) — All 9 Sections:**
   - `Hero.tsx`: Main heading, highlighted gold substring, subtitle, primary CTA label & href, 7 floating tech squircle labels & icon keys, bottom glassmorphic status pill title & subtitle, `SLOT-03` media version & alt.
   - `AboutSection.tsx`: Kicker `"- ABOUT US -"`, heading, 2 body paragraphs, `SLOT-04` media version & alt.
   - `FeaturedSolutions.tsx`: Left intro heading, subheading, description, `"Explore Services"` CTA, `SLOT-05` logo version & alt, 4 timeline service items (title, description, icon key).
   - `ProductsSection.tsx`: Heading, subtitle, `SLOT-06` decorative background version, 4 product card bullets/links (`"Explore Platform"`), `SLOT-07` media version & alt, bottom CTA `"View Complete Platform Catalog"`.
   - `StrategicSolutions.tsx`: Heading, subtitle, 4 showcase slides (title, category, description, link label `"Explore Solution"`, link href, `SLOT-08` media version & alt), slider arrow/dot `aria-label` templates, bottom CTA `"View All Projects"`.
   - `IndustryExpertise.tsx` & `src/data/industryData.ts`: Heading, subtitle, 5 industry cards (id, title, subtitle, description, icon key).
   - `BlogSection.tsx`: Heading, subtitle, card CTA `"Read Article"`, bottom CTA `"Explore Resource Hub"`, `SLOT-09` media version & alt.
   - `FAQSection.tsx`: Kicker `"- CLARITY & TRANSPARENCY -"`, heading, subtitle, 6 FAQ items (question, answer), sticky support card (`"Need More Clarity?"`, subtitle, 3 value points, CTA `"Connect With Us"`, `SLOT-10` media version & alt).
   - `FinalCTA.tsx`: Heading `"Let's Build the Right Digital Solution."`, description, CTA `"Plan Your Next Move"` & href.
3. **Inner Pages (`/about`, `/portfolio`, `/products`, `/products/:slug`, `/services`, `/technology-insights`, `/technology-insights/:slug`, `/testimonials`, `/connect-with-us`, `/privacy-policy`, `/terms-of-service`, `*`):**
   - All `PageHeader` kickers, titles, and subtitles across every page.
   - `About.tsx` & `src/data/frameworkData.ts`: `#who-we-are` heading, 3 paragraphs, `SLOT-11` media version & alt, Vision & Mission cards, 6 Core Values cards (`#our-values`), 6 Delivery Framework stage cards (`#delivery-framework`).
   - `Portfolio.tsx`, `Products.tsx`, `ProductDetail.tsx` & `src/data/productsData.ts`: All 4 software platforms, status badges, category tabs, search placeholders, modal headings/labels (`"Overview"`, `"Key Capabilities"`, `"Target Audience"`, `"Inquire About This Platform"`), 4 tech spec metrics on `ProductDetail.tsx`, architectural capabilities, integration features, `SLOT-12` media versions & alts.
   - `Services.tsx`, `SlaMatrix.tsx` & `src/data/servicesData.ts`: Hero copy, 4 anchor pills, 4 service practice blocks (overview, capabilities, outcomes, deliverables), 3 engagement model cards, 3-tier SLA matrix table headers and rows, 3 onboarding steps (`#how-we-start`).
   - `Insights.tsx`, `InsightDetail.tsx` & `src/data/insightsData.ts`: Category filter labels, search input `aria-label`/placeholder, 3 articles (title, slug, category, date, readTime, author name/role, excerpt, structured content sections, tags, `SLOT-13` media versions & alts), reader sidebar labels.
   - `Testimonials.tsx` & `TestimonialCard.tsx`: PageHeader, client testimonial entries (`SLOT-14` avatar version & alt/decorative flag).
   - `Connect.tsx`, `ContactFaq.tsx`, `ContactForm.tsx`: `SLOT-15` decorative background version, office credentials card labels & values, 4 Contact FAQ items, 2 inquiry mode tab titles/descriptions, all form field labels, placeholders, dropdown options, privacy consent text/link, submit button states, and validation/confirmation messages.
   - `PrivacyPolicy.tsx` & `TermsOfService.tsx`: Legal headers, last-updated strings, and all numbered sections.
   - `NotFound.tsx`: `"Status 404"`, `"Route Not Found"`, description, `"Return to Homepage"`, and `"Browse Resource Hub"`.
   - `index.html` & `SEOHead.tsx`: Per-page `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, `og:type`, `robots`, and canonical path.

### 3.2 Strings Permitted to Remain in Code (`src/config/strings.ts` — Single Code Strings Module per `HR-4`)
Only the following non-public or emergency fallback strings may live in code, consolidated into a single module (`src/config/strings.ts`):
1. **Fixed Admin UI Labels:** Admin sidebar labels, form field labels inside `/admin/*`, button captions (`Save Draft`, `Publish`, `Restore to Draft`, `Upload Asset`, `Run Reconciliation`), table headers, and modal titles in the CMS portal.
2. **System, Validation & API Error Messages:** Structured API error codes/messages (`UNAUTHORIZED`, `MFA_REQUIRED`, `VERSION_CONFLICT`, `PUBLISH_VALIDATION_FAILED`, `RATE_LIMITED`), Zod schema error templates, and log event names.
3. **Minimal Emergency Fallback when Neon is Unreachable:** A minimal static fallback notice (`"Service temporarily unavailable. Please try again shortly."`) used only if the database connection fails completely and no edge cache entry exists.
4. **Technical Identifiers (Not in `strings.ts`, kept in code/CSS):** Route path patterns, CSS class names, HTML element IDs, Lucide icon registry keys, and CSS design tokens (`src/styles/tokens.css`).
