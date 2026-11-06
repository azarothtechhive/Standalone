# Azaroth Tech-Hive - Comprehensive QA Test Strategy

**Assessment Date:** November 4, 2026  
**Application URL:** Local project; runtime verification used `http://127.0.0.1:3020`  
**Backend URL:** Same local Express server  
**Environment:** Local Development / production-mode smoke checks  
**Assessment Type:** Non-Invasive Read-Only QA Audit  

---

## 1. APPLICATION INVENTORY

### 1.1 Technology Stack (Verified)
- **Frontend:** React 19.0.1, TypeScript, Vite 8.3.0
- **Backend:** Node.js, Express 4.21.2
- **Styling:** Tailwind CSS 4.3.3
- **Routing:** React Router DOM 7.18.5
- **Animations:** Framer Motion 14.9.0, Motion 12.23.24
- **Icons:** Lucide React 0.546.0
- **Forms:** React Phone Number Input 3.4.18
- **Validation:** Zod 4.6.7
- **Database:** Neon PostgreSQL (via @neondatabase/serverless)
- **Storage:** Cloudflare R2 (via aws4fetch)
- **Security:** Custom scrypt-based password hashing, httpOnly cookies

### 1.2 Public Routes Inventory

| Route ID | Route Path | Route Type | Page Component | Status |
|----------|------------|------------|-----------------|---------|
| PUB-001 | `/` | Static | Home | Active |
| PUB-002 | `/about` | Static | About | Active |
| PUB-003 | `/who-we-are` | Redirect | → `/about` | Active |
| PUB-004 | `/values` | Static | Values | Active |
| PUB-005 | `/delivery-framework` | Static | DeliveryFramework | Active |
| PUB-006 | `/how-we-work` | Redirect | → `/delivery-framework` | Active |
| PUB-007 | `/products` | Static | Products | Active |
| PUB-008 | `/products/:slug` | Dynamic | ProductDetail | Active |
| PUB-009 | `/services` | Static | Services | Active |
| PUB-010 | `/service` | Redirect | → `/services` | Active |
| PUB-011 | `/portfolio` | Static | Portfolio | Active |
| PUB-012 | `/portfolio/:slug` | Dynamic | NotFound (intentional) | Active |
| PUB-013 | `/projects` | Redirect | → `/portfolio` | Active |
| PUB-014 | `/technology-insights` | Static | Insights | Active |
| PUB-015 | `/technology-insights/:slug` | Dynamic | InsightDetail | Active |
| PUB-016 | `/resource-hub` | Static | Insights (alias) | Active |
| PUB-017 | `/resource-hub/:slug` | Dynamic | InsightDetail (alias) | Active |
| PUB-018 | `/insights` | Redirect | → `/technology-insights` | Active |
| PUB-019 | `/testimonials` | Static | TestimonialsPage | Active |
| PUB-020 | `/connect-with-us` | Static | Connect | Active |
| PUB-021 | `/contact` | Redirect | → `/connect-with-us` | Active |
| PUB-022 | `/connect` | Redirect | → `/connect-with-us` | Active |
| PUB-023 | `/request-for-quote` | Redirect | → `/connect-with-us` | Active |
| PUB-024 | `/rfq` | Redirect | → `/connect-with-us` | Active |
| PUB-025 | `/quote` | Redirect | → `/connect-with-us` | Active |
| PUB-026 | `/privacy-policy` | Static | PrivacyPolicy | Active |
| PUB-027 | `/terms-of-service` | Static | TermsOfService | Active |
| PUB-028 | `/*` | Catch-all | NotFound | Active |

### 1.3 CMS Admin Routes Inventory

| Route ID | Route Path | Route Type | Page Component | Auth Required |
|----------|------------|------------|-----------------|---------------|
| CMS-001 | `/admin/login` | Static | AdminLogin | No |
| CMS-002 | `/admin` | Protected | AdminDashboard | Yes |
| CMS-003 | `/admin/pages` | Protected | AdminPagesManager | Yes |
| CMS-004 | `/admin/products` | Protected | AdminProductsManager | Yes |
| CMS-005 | `/admin/services` | Protected | AdminServicesManager | Yes |
| CMS-006 | `/admin/portfolio` | Protected | AdminPortfolioManager | Yes |
| CMS-007 | `/admin/insights` | Protected | AdminInsightsManager | Yes |
| CMS-008 | `/admin/testimonials` | Protected | AdminTestimonialsManager | Yes |
| CMS-009 | `/admin/navigation` | Protected | AdminNavigationManager | Yes |
| CMS-010 | `/admin/inquiries` | Protected | AdminCRMInquiries | Yes |
| CMS-011 | `/admin/media` | Protected | AdminMediaManager | Yes |
| CMS-012 | `/admin/settings` | Protected | AdminSettingsManager | Yes |
| CMS-013 | `/admin/audit-logs` | Protected | AdminAuditLogs | Yes |
| CMS-014 | `/admin/users` | Protected | AdminUsersManager | Yes (Super Admin only) |

### 1.4 API Endpoints Inventory

| Endpoint ID | Method | Endpoint | Purpose | Auth Required |
|-------------|--------|----------|---------|---------------|
| API-001 | GET | `/api/health` | Liveness health check | No |
| API-002 | GET | `/api/health/ready` | Readiness health check | Yes (`x-health-secret`) |
| API-003 | POST | `/api/auth/login` | User authentication | No |
| API-004 | POST | `/api/auth/logout` | Session termination | Yes |
| API-005 | POST | `/api/auth/change-password` | Password change | Yes |
| API-006 | GET | `/api/cms/all` | Fetch all CMS content | No |
| API-007 | GET | `/api/cms/stats` | Fetch CMS statistics | No |
| API-008 | PUT | `/api/cms/settings` | Update global settings | Yes |
| API-009 | GET | `/api/cms/pages/:slug` | Fetch page content | No |
| API-010 | PUT | `/api/cms/pages/:slug` | Update page content | Yes |
| API-011 | GET | `/api/cms/products` | Fetch products | No |
| API-012 | POST | `/api/cms/products` | Create product | Yes |
| API-013 | PUT | `/api/cms/products/:id` | Update product | Yes |
| API-014 | DELETE | `/api/cms/products/:id` | Delete product | Yes |
| API-015 | GET | `/api/cms/services` | Fetch services | No |
| API-016 | POST | `/api/cms/services` | Create service | Yes |
| API-017 | PUT | `/api/cms/services/:id` | Update service | Yes |
| API-018 | DELETE | `/api/cms/services/:id` | Delete service | Yes |
| API-019 | GET | `/api/cms/portfolio` | Fetch portfolio | No |
| API-020 | POST | `/api/cms/portfolio` | Create portfolio item | Yes |
| API-021 | PUT | `/api/cms/portfolio/:id` | Update portfolio item | Yes |
| API-022 | DELETE | `/api/cms/portfolio/:id` | Delete portfolio item | Yes |
| API-023 | GET | `/api/cms/insights` | Fetch insights | No |
| API-024 | POST | `/api/cms/insights` | Create insight | Yes |
| API-025 | PUT | `/api/cms/insights/:id` | Update insight | Yes |
| API-026 | DELETE | `/api/cms/insights/:id` | Delete insight | Yes |
| API-027 | GET | `/api/cms/testimonials` | Fetch testimonials | No |
| API-028 | POST | `/api/cms/testimonials` | Create testimonial | Yes |
| API-029 | PUT | `/api/cms/testimonials/:id` | Update testimonial | Yes |
| API-030 | DELETE | `/api/cms/testimonials/:id` | Delete testimonial | Yes |
| API-031 | GET | `/api/cms/navigation` | Fetch navigation | No |
| API-032 | POST | `/api/cms/navigation` | Create nav item | Yes |
| API-033 | PUT | `/api/cms/navigation/:id` | Update nav item | Yes |
| API-034 | DELETE | `/api/cms/navigation/:id` | Delete nav item | Yes |
| API-035 | GET | `/api/cms/enquiries` | Fetch enquiries | Yes |
| API-036 | PATCH | `/api/cms/enquiries/:id` | Update enquiry status | Yes |
| API-037 | DELETE | `/api/cms/enquiries/:id` | Delete enquiry | Yes |
| API-038 | GET | `/api/cms/rfqs` | Fetch RFQs | Yes |
| API-039 | PATCH | `/api/cms/rfqs/:id` | Update RFQ status | Yes |
| API-040 | DELETE | `/api/cms/rfqs/:id` | Delete RFQ | Yes |
| API-041 | GET | `/api/cms/media` | Fetch media library | No |
| API-042 | POST | `/api/cms/media/upload` | Upload media | Yes |
| API-043 | DELETE | `/api/cms/media/:id` | Delete media | Yes |
| API-044 | GET | `/api/cms/audit-logs` | Fetch audit logs | Yes |
| API-045 | POST | `/api/contact` | Submit contact form | No |
| API-046 | GET | `/api/users` | Fetch users | Yes (Super Admin) |
| API-047 | POST | `/api/users` | Create user | Yes (Super Admin) |
| API-048 | PUT | `/api/users/:id` | Update user | Yes (Super Admin) |
| API-049 | DELETE | `/api/users/:id` | Delete user | Yes (Super Admin) |

### 1.5 Module Inventory

| Module ID | Module Name | Submodules | Features Count |
|----------|-------------|------------|----------------|
| MOD-HOME | Homepage | Hero, About, Services, Products, Portfolio, Industry, Insights, FAQ, CTA | 9 |
| MOD-ABOUT | About Page | Company Info, Vision/Mission, Values, Delivery Framework | 4 |
| MOD-VALUES | Values Page | Core Values | 1 |
| MOD-DELIVERY | Delivery Framework | Process Timeline | 1 |
| MOD-PRODUCTS | Products Catalog | Product Listing, Product Detail, Specifications | 3 |
| MOD-SERVICES | Services Catalog | Service Listing, SLA Matrix | 2 |
| MOD-PORTFOLIO | Portfolio | Project Listing, Project Details | 2 |
| MOD-INSIGHTS | Technology Insights | Article Listing, Article Detail, Categories | 3 |
| MOD-TESTIMONIALS | Testimonials | Testimonial Cards | 1 |
| MOD-CONNECT | Connect With Us | Contact Form, Office Info, FAQ | 3 |
| MOD-LEGAL | Legal Pages | Privacy Policy, Terms of Service | 2 |
| MOD-HEADER | Global Header | Navigation, Logo, Mobile Menu | 3 |
| MOD-FOOTER | Global Footer | Contact Info, Social Links, Legal Links | 3 |
| MOD-CMS-DASH | CMS Dashboard | Stats, Recent Activity, Quick Links | 3 |
| MOD-CMS-PAGES | CMS Page Manager | Page Editing, Section Management, Preview | 3 |
| MOD-CMS-NAV | CMS Navigation Manager | Menu Items, Ordering, Visibility | 3 |
| MOD-CMS-MEDIA | CMS Media Library | Upload, Preview, Metadata | 3 |
| MOD-CMS-SETTINGS | CMS Settings | Branding, Theme, SEO, Global Config | 4 |
| MOD-CMS-ENQUIRIES | CMS Enquiries CRM | Listing, Status, Assignment, Follow-up | 4 |
| MOD-CMS-AUDIT | CMS Audit Logs | Event History, Filtering, User Tracking | 3 |
| MOD-CMS-USERS | CMS Users & Roles | User Management, Role Assignment | 2 |
| MOD-AUTH | Authentication | Login, Logout, Session Management, Password Change | 4 |

---

## 2. TEST COVERAGE MATRIX

### 2.1 Homepage (MOD-HOME)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-HOME-001 | Hero Section Rendering | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-HOME-002 | Hero CTAs Navigation | ✓ | ✓ | - | ✓ | Pending |
| TC-HOME-003 | About Section Display | ✓ | ✓ | - | - | Pending |
| TC-HOME-004 | Services Section Display | ✓ | ✓ | - | - | Pending |
| TC-HOME-005 | Products Section Display | ✓ | ✓ | - | - | Pending |
| TC-HOME-006 | Portfolio Section Display | ✓ | ✓ | - | - | Pending |
| TC-HOME-007 | Industry Expertise Display | ✓ | ✓ | - | - | Pending |
| TC-HOME-008 | Insights Section Display | ✓ | ✓ | - | - | Pending |
| TC-HOME-009 | FAQ Section Accordion | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-HOME-010 | Final CTA Navigation | ✓ | ✓ | - | - | Pending |
| TC-HOME-011 | Module Visibility Toggle | ✓ | ✓ | - | - | Pending |
| TC-HOME-012 | Responsive Layout | ✓ | - | - | - | Pending |

### 2.2 About Page (MOD-ABOUT)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-ABOUT-001 | Page Rendering | ✓ | ✓ | - | - | Pending |
| TC-ABOUT-002 | Company Story Display | ✓ | ✓ | - | - | Pending |
| TC-ABOUT-003 | Vision/Mission Display | ✓ | ✓ | - | - | Pending |
| TC-ABOUT-004 | Values Display | ✓ | ✓ | - | - | Pending |
| TC-ABOUT-005 | Delivery Framework Display | ✓ | ✓ | - | - | Pending |
| TC-ABOUT-006 | Anchor Navigation | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-ABOUT-007 | Responsive Layout | ✓ | - | - | - | Pending |

### 2.3 Products (MOD-PRODUCTS)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-PROD-001 | Product Listing | ✓ | ✓ | - | - | Pending |
| TC-PROD-002 | Product Card Rendering | ✓ | ✓ | - | - | Pending |
| TC-PROD-003 | Product Detail Navigation | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-PROD-004 | Dynamic Slug Handling | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-PROD-005 | Specifications Display | ✓ | ✓ | - | - | Pending |
| TC-PROD-006 | Status Badge Display | ✓ | ✓ | - | - | Pending |
| TC-PROD-007 | Empty Catalog Handling | ✓ | - | - | - | Pending |
| TC-PROD-008 | Invalid Slug Handling | ✓ | - | - | - | Pending |
| TC-PROD-009 | Responsive Grid | ✓ | - | - | - | Pending |

### 2.4 Services (MOD-SERVICES)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-SERV-001 | Service Listing | ✓ | ✓ | - | - | Pending |
| TC-SERV-002 | Service Card Rendering | ✓ | ✓ | - | - | Pending |
| TC-SERV-003 | SLA Matrix Display | ✓ | ✓ | - | - | Pending |
| TC-SERV-004 | Capabilities Display | ✓ | ✓ | - | - | Pending |
| TC-SERV-005 | Responsive Layout | ✓ | - | - | - | Pending |

### 2.5 Portfolio (MOD-PORTFOLIO)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-PORT-001 | Portfolio Listing | ✓ | ✓ | - | - | Pending |
| TC-PORT-002 | Project Card Rendering | ✓ | ✓ | - | - | Pending |
| TC-PORT-003 | Category Filtering | ✓ | ✓ | - | - | Pending |
| TC-PORT-004 | Project Details Display | ✓ | ✓ | - | - | Pending |
| TC-PORT-005 | Empty Portfolio Handling | ✓ | - | - | - | Pending |
| TC-PORT-006 | Responsive Grid | ✓ | - | - | - | Pending |

### 2.6 Technology Insights (MOD-INSIGHTS)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-INS-001 | Article Listing | ✓ | ✓ | - | - | Pending |
| TC-INS-002 | Article Card Rendering | ✓ | ✓ | - | - | Pending |
| TC-INS-003 | Article Detail Navigation | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-INS-004 | Dynamic Slug Handling | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-INS-005 | Category Display | ✓ | ✓ | - | - | Pending |
| TC-INS-006 | Read Time Display | ✓ | - | - | - | Pending |
| TC-INS-007 | Invalid Slug Handling | ✓ | - | - | - | Pending |
| TC-INS-008 | Responsive Layout | ✓ | - | - | - | Pending |

### 2.7 Testimonials (MOD-TESTIMONIALS)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-TST-001 | Testimonial Listing | ✓ | ✓ | - | - | Pending |
| TC-TST-002 | Testimonial Card Rendering | ✓ | ✓ | - | - | Pending |
| TC-TST-003 | Avatar Display | ✓ | ✓ | - | - | Pending |
| TC-TST-004 | Rating Display | ✓ | - | - | - | Pending |
| TC-TST-005 | Empty State Handling | ✓ | - | - | - | Pending |
| TC-TST-006 | Responsive Layout | ✓ | - | - | - | Pending |

### 2.8 Connect With Us (MOD-CONNECT)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-CONN-001 | Page Rendering | ✓ | ✓ | - | - | Pending |
| TC-CONN-002 | Office Info Display | ✓ | ✓ | - | - | Pending |
| TC-CONN-003 | Contact Form Rendering | ✓ | ✓ | - | - | Pending |
| TC-CONN-004 | Name Validation | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-CONN-005 | Email Validation | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-CONN-006 | Phone Validation | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-CONN-007 | Country Selection | ✓ | ✓ | - | - | Pending |
| TC-CONN-008 | Message Validation | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-CONN-009 | Consent Checkbox | ✓ | ✓ | - | - | Pending |
| TC-CONN-010 | File Upload Validation | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-CONN-011 | Submit Button State | ✓ | ✓ | - | - | Pending |
| TC-CONN-012 | Honeypot Field | ✓ | - | - | - | Pending |
| TC-CONN-013 | FAQ Display | ✓ | ✓ | - | - | Pending |
| TC-CONN-014 | Responsive Layout | ✓ | - | - | - | Pending |

### 2.9 Legal Pages (MOD-LEGAL)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-LEGAL-001 | Privacy Policy Rendering | ✓ | ✓ | - | - | Pending |
| TC-LEGAL-002 | Terms of Service Rendering | ✓ | ✓ | - | - | Pending |
| TC-LEGAL-003 | Section Navigation | ✓ | - | - | - | Pending |
| TC-LEGAL-004 | Responsive Layout | ✓ | - | - | - | Pending |

### 2.10 Global Header (MOD-HEADER)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-HDR-001 | Logo Navigation | ✓ | ✓ | - | - | Pending |
| TC-HDR-002 | Primary Navigation | ✓ | ✓ | - | - | Pending |
| TC-HDR-003 | Dropdown Menus | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-HDR-004 | Active State | ✓ | - | - | - | Pending |
| TC-HDR-005 | Mobile Menu Toggle | ✓ | ✓ | - | - | Pending |
| TC-HDR-006 | Mobile Menu Navigation | ✓ | ✓ | - | - | Pending |
| TC-HDR-007 | Keyboard Navigation | ✓ | - | - | - | Pending |
| TC-HDR-008 | Sticky Header | ✓ | - | - | - | Pending |

### 2.11 Global Footer (MOD-FOOTER)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-FTR-001 | Contact Info Display | ✓ | ✓ | - | - | Pending |
| TC-FTR-002 | Social Links | ✓ | ✓ | - | - | Pending |
| TC-FTR-003 | Legal Links | ✓ | ✓ | - | - | Pending |
| TC-FTR-004 | Copyright Display | ✓ | - | - | - | Pending |
| TC-FTR-005 | Responsive Layout | ✓ | - | - | - | Pending |

### 2.12 CMS Authentication (MOD-AUTH)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-AUTH-001 | Login Page Rendering | ✓ | ✓ | - | - | Pending |
| TC-AUTH-002 | Valid Credentials | ✓ | - | - | - | Pending |
| TC-AUTH-003 | Invalid Credentials | ✓ | - | - | - | Pending |
| TC-AUTH-004 | Empty Fields | ✓ | - | - | - | Pending |
| TC-AUTH-005 | Rate Limiting | ✓ | - | - | - | Pending |
| TC-AUTH-006 | Session Management | ✓ | - | - | - | Pending |
| TC-AUTH-007 | Logout | ✓ | - | - | - | Pending |
| TC-AUTH-008 | Password Change | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-AUTH-009 | Protected Route Access | ✓ | - | - | - | Pending |

### 2.13 CMS Dashboard (MOD-CMS-DASH)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-DASH-001 | Dashboard Rendering | ✓ | ✓ | - | - | Pending |
| TC-DASH-002 | Stats Cards Display | ✓ | ✓ | - | - | Pending |
| TC-DASH-003 | Recent Activity Display | ✓ | ✓ | - | - | Pending |
| TC-DASH-004 | Quick Links Navigation | ✓ | - | - | - | Pending |
| TC-DASH-005 | Refresh Functionality | ✓ | - | - | - | Pending |
| TC-DASH-006 | Empty State Handling | ✓ | - | - | - | Pending |

### 2.14 CMS Page Manager (MOD-CMS-PAGES)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-PAGE-001 | Page Listing | ✓ | ✓ | - | - | Pending |
| TC-PAGE-002 | Page Selection | ✓ | - | - | - | Pending |
| TC-PAGE-003 | Section Editing | ✓ | ✓ | - | - | Pending |
| TC-PAGE-004 | Section Ordering | ✓ | - | - | - | Pending |
| TC-PAGE-005 | Section Visibility | ✓ | - | - | - | Pending |
| TC-PAGE-006 | Validation | ✓ | ✓ | - | - | Pending |
| TC-PAGE-007 | Preview | ✓ | - | - | - | Pending |

### 2.15 CMS Navigation Manager (MOD-CMS-NAV)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-NAV-001 | Navigation Listing | ✓ | ✓ | - | - | Pending |
| TC-NAV-002 | Item Creation | ✓ | ✓ | - | - | Pending |
| TC-NAV-003 | Item Editing | ✓ | ✓ | - | - | Pending |
| TC-NAV-004 | Item Deletion | ✓ | - | - | - | Pending |
| TC-NAV-005 | Ordering | ✓ | - | - | - | Pending |
| TC-NAV-006 | Visibility Toggle | ✓ | - | - | - | Pending |
| TC-NAV-007 | URL Validation | ✓ | ✓ | ✓ | ✓ | Pending |

### 2.16 CMS Media Library (MOD-CMS-MEDIA)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-MED-001 | Media Listing | ✓ | ✓ | - | - | Pending |
| TC-MED-002 | Image Preview | ✓ | - | - | - | Pending |
| TC-MED-003 | Metadata Display | ✓ | - | - | - | Pending |
| TC-MED-004 | File Type Validation | ✓ | ✓ | - | - | Pending |
| TC-MED-005 | File Size Validation | ✓ | ✓ | ✓ | ✓ | Pending |
| TC-MED-006 | Alt Text Validation | ✓ | ✓ | - | - | Pending |
| TC-MED-007 | Empty State Handling | ✓ | - | - | - | Pending |

### 2.17 CMS Settings (MOD-CMS-SETTINGS)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-SET-001 | Settings Rendering | ✓ | ✓ | - | - | Pending |
| TC-SET-002 | Brand Settings | ✓ | ✓ | - | - | Pending |
| TC-SET-003 | Theme Settings | ✓ | ✓ | - | - | Pending |
| TC-SET-004 | SEO Settings | ✓ | ✓ | - | - | Pending |
| TC-SET-005 | Contact Info Validation | ✓ | ✓ | - | - | Pending |
| TC-SET-006 | Social URL Validation | ✓ | ✓ | - | - | Pending |

### 2.18 CMS Enquiries CRM (MOD-CMS-ENQUIRIES)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-ENQ-001 | Enquiry Listing | ✓ | ✓ | - | - | Pending |
| TC-ENQ-002 | Enquiry Detail View | ✓ | - | - | - | Pending |
| TC-ENQ-003 | Status Update | ✓ | ✓ | - | - | Pending |
| TC-ENQ-004 | Assignment | ✓ | - | - | - | Pending |
| TC-ENQ-005 | Follow-up Note | ✓ | - | - | - | Pending |
| TC-ENQ-006 | Filtering | ✓ | - | - | - | Pending |
| TC-ENQ-007 | Empty State Handling | ✓ | - | - | - | Pending |

### 2.19 CMS Audit Logs (MOD-CMS-AUDIT)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-AUD-001 | Audit Log Listing | ✓ | ✓ | - | - | Pending |
| TC-AUD-002 | Event Details | ✓ | - | - | - | Pending |
| TC-AUD-003 | Timestamp Display | ✓ | - | - | - | Pending |
| TC-AUD-004 | User Reference | ✓ | - | - | - | Pending |
| TC-AUD-005 | Filtering | ✓ | - | - | - | Pending |
| TC-AUD-006 | Empty State Handling | ✓ | - | - | - | Pending |

### 2.20 CMS Users & Roles (MOD-CMS-USERS)

| Test ID | Feature | Positive | Negative | Boundary | Edge | Status |
|---------|---------|----------|----------|----------|------|--------|
| TC-USR-001 | User Listing | ✓ | ✓ | - | - | Pending |
| TC-USR-002 | Role Display | ✓ | - | - | - | Pending |
| TC-USR-003 | Permission Visibility | ✓ | - | - | - | Pending |
| TC-USR-004 | User Status | ✓ | - | - | - | Pending |
| TC-USR-005 | Access Restrictions | ✓ | - | - | - | Pending |

---

## 3. BUSINESS WORKFLOW TEST SCENARIOS

### Workflow A: Public Enquiry
**Workflow ID:** WF-A-001  
**Starting Point:** Homepage CTA  
**Steps:**
1. User clicks "Connect With Us" from homepage
2. Navigate to Connect page
3. Fill contact form with valid data
4. Submit form
5. Verify backend receives submission
6. Check CRM for new enquiry
7. Verify audit log entry

**Test Cases:** TC-HOME-010, TC-CONN-001 to TC-CONN-014, TC-ENQ-001 to TC-ENQ-007

### Workflow B: Product Discovery
**Workflow ID:** WF-B-001  
**Starting Point:** Homepage  
**Steps:**
1. User navigates to Products section from homepage
2. View product catalogue
3. Click on specific product
4. View product details
5. Click CTA to connect

**Test Cases:** TC-HOME-005, TC-PROD-001 to TC-PROD-009, TC-CONN-001

### Workflow C: Service Discovery
**Workflow ID:** WF-C-001  
**Starting Point:** Homepage  
**Steps:**
1. User navigates to Services section from homepage
2. View service offerings
3. Review SLA matrix
4. Click CTA to connect

**Test Cases:** TC-HOME-004, TC-SERV-001 to TC-SERV-005, TC-CONN-001

### Workflow D: Portfolio Discovery
**Workflow ID:** WF-D-001  
**Starting Point:** Homepage  
**Steps:**
1. User navigates to Portfolio from homepage
2. View project listings
3. Filter by category
4. View project details
5. Click CTA to connect

**Test Cases:** TC-HOME-006, TC-PORT-001 to TC-PORT-006, TC-CONN-001

### Workflow E: Insights Discovery
**Workflow ID:** WF-E-001  
**Starting Point:** Homepage  
**Steps:**
1. User navigates to Insights from homepage
2. View article listings
3. Filter by category
4. Click on article
5. Read article content
6. Navigate to related articles

**Test Cases:** TC-HOME-007, TC-INS-001 to TC-INS-008

### Workflow F: CMS Content Lifecycle
**Workflow ID:** WF-F-001  
**Starting Point:** CMS Login  
**Steps:**
1. Admin logs in
2. Navigate to Page Manager
3. Select page to edit
4. Modify section content
5. Preview changes
6. Save draft
7. Publish changes
8. Verify public website update
9. Check audit log

**Test Cases:** TC-AUTH-001 to TC-AUTH-009, TC-PAGE-001 to TC-PAGE-007, TC-AUD-001 to TC-AUD-006

### Workflow G: Authentication & Authorization
**Workflow ID:** WF-G-001  
**Starting Point:** Admin Login  
**Steps:**
1. Admin logs in with valid credentials
2. Access dashboard
3. Navigate to protected modules
4. Verify role-based permissions
5. Attempt to access restricted route
6. Logout
7. Attempt to access protected route without session

**Test Cases:** TC-AUTH-001 to TC-AUTH-009

---

## 4. SECURITY TEST SCENARIOS

| Test ID | Scenario | Type | Status |
|---------|----------|------|--------|
| SEC-001 | HTTPS Enforcement | Passive | Pending |
| SEC-002 | Security Headers | Passive | Pending |
| SEC-003 | Cookie Attributes | Passive | Pending |
| SEC-004 | Session Handling | Passive | Pending |
| SEC-005 | Authentication Behavior | Passive | Pending |
| SEC-006 | Authorization Boundaries | Passive | Pending |
| SEC-007 | Exposed Configuration | Passive | Pending |
| SEC-008 | Error Message Leakage | Passive | Pending |
| SEC-009 | CORS Configuration | Passive | Pending |
| SEC-010 | CSP Configuration | Passive | Pending |
| SEC-011 | Input Validation | Passive | Pending |
| SEC-012 | XSS Prevention | Passive | Pending |
| SEC-013 | CSRF Protection | Passive | Pending |
| SEC-014 | Rate Limiting | Passive | Pending |
| SEC-015 | Password Strength | Passive | Pending |
| SEC-016 | Token Storage | Passive | Pending |
| SEC-017 | Sensitive Data in Storage | Passive | Pending |
| SEC-018 | API Documentation Exposure | Passive | Pending |

---

## 5. PERFORMANCE TEST SCENARIOS

| Test ID | Metric | Target | Status |
|---------|--------|--------|--------|
| PERF-001 | Initial Page Load | < 2.5s | Pending |
| PERF-002 | LCP (Largest Contentful Paint) | < 2.5s | Pending |
| PERF-003 | INP (Interaction to Next Paint) | < 200ms | Pending |
| PERF-004 | CLS (Cumulative Layout Shift) | < 0.1 | Pending |
| PERF-005 | FCP (First Contentful Paint) | < 1.8s | Pending |
| PERF-006 | TTFB (Time to First Byte) | < 600ms | Pending |
| PERF-007 | JavaScript Bundle Size | < 500KB | Pending |
| PERF-008 | CSS Loading | < 100KB | Pending |
| PERF-009 | Image Optimization | WebP/AVIF | Pending |
| PERF-010 | Lazy Loading | Implemented | Pending |

---

## 6. ACCESSIBILITY TEST SCENARIOS

| Test ID | WCAG Criterion | Status |
|---------|----------------|--------|
| A11Y-001 | Semantic HTML | Pending |
| A11Y-002 | Heading Hierarchy | Pending |
| A11Y-003 | Accessible Names | Pending |
| A11Y-004 | Image Alt Text | Pending |
| A11Y-005 | Keyboard Navigation | Pending |
| A11Y-006 | Focus Visibility | Pending |
| A11Y-007 | Color Contrast | Pending |
| A11Y-008 | Form Labels | Pending |
| A11Y-009 | Error Identification | Pending |
| A11Y-010 | Input Instructions | Pending |
| A11Y-011 | ARIA Usage | Pending |
| A11Y-012 | Modal Focus Handling | Pending |
| A11Y-013 | Link Purpose | Pending |
| A11Y-014 | Touch Target Size | Pending |
| A11Y-015 | Reduced Motion | Pending |

---

## 7. RESPONSIVE TEST VIEWPORTS

| Viewport ID | Width | Height | Device Type | Status |
|-------------|-------|--------|-------------|--------|
| RSP-001 | 320px | 568px | Small Mobile | Pending |
| RSP-002 | 360px | 640px | Mobile | Pending |
| RSP-003 | 375px | 667px | Standard Mobile | Pending |
| RSP-004 | 430px | 932px | Large Mobile | Pending |
| RSP-005 | 667px | 375px | Phone Landscape | Pending |
| RSP-006 | 768px | 1024px | Tablet Portrait | Pending |
| RSP-007 | 900px | 1440px | Tablet | Pending |
| RSP-008 | 1024px | 768px | Tablet Landscape | Pending |
| RSP-009 | 1280px | 720px | Small Laptop | Pending |
| RSP-010 | 1366px | 768px | Desktop | Pending |
| RSP-011 | 1440px | 900px | Large Desktop | Pending |
| RSP-012 | 1920px | 1080px | Wide Desktop | Pending |
| RSP-013 | 2560px | 1440px | Ultra-Wide | Pending |

---

## 8. CROSS-BROWSER TEST MATRIX

| Browser ID | Browser | Version | OS | Status |
|------------|---------|---------|-----|--------|
| BRW-001 | Chrome | Latest | Windows | Pending |
| BRW-002 | Edge | Latest | Windows | Pending |
| BRW-003 | Firefox | Latest | Windows | Pending |
| BRW-004 | Safari | Latest | macOS | Not Available |

---

## 9. EXECUTION PLAN

### Phase 1: Public Website Testing (Priority: HIGH)
- Execute all public route test cases
- Test navigation and routing
- Validate forms and inputs
- Check responsive layouts
- Collect console errors

### Phase 2: CMS Testing (Priority: HIGH)
- Test authentication flow
- Validate protected routes
- Inspect CMS modules
- Test CRUD operations (read-only inspection)
- Verify audit logging

### Phase 3: API Testing (Priority: HIGH)
- Test GET endpoints
- Validate response structures
- Check error handling
- Verify authentication requirements
- Test rate limiting

### Phase 4: Security Assessment (Priority: HIGH)
- Passive security inspection
- Header analysis
- Cookie attribute verification
- Input validation review
- Configuration exposure check

### Phase 5: Performance Testing (Priority: MEDIUM)
- Measure core web vitals
- Analyze bundle sizes
- Check image optimization
- Verify lazy loading

### Phase 6: Accessibility Testing (Priority: MEDIUM)
- Automated accessibility scan
- Manual keyboard navigation
- Color contrast verification
- Screen reader compatibility check

### Phase 7: Source Code Inspection (Priority: MEDIUM)
- Static code analysis
- Dependency review
- Security pattern inspection
- Code quality assessment

### Phase 8: Evidence Collection (Priority: HIGH)
- Capture screenshots
- Collect console logs
- Record network activity
- Document findings

### Phase 9: Report Generation (Priority: HIGH)
- Compile defect register
- Create test execution summary
- Generate management report
- Prepare deliverables

---

## 10. TEST EXECUTION STATUS SUMMARY

| Phase | Total Tests | Executed | Passed | Failed | Blocked | Not Tested |
|-------|-------------|----------|--------|--------|---------|-------------|
| Phase 1: Public Website | 85 | 7 | 6 | 1 | 0 | 78 |
| Phase 2: CMS | 42 | 1 | 1 | 0 | 0 | 41 |
| Phase 3: API | 49 | 15 | 13 | 1 | 1 | 34 |
| Phase 4: Security | 18 | 8 | 3 | 1 | 4 | 10 |
| Phase 5: Performance | 10 | 2 | 1 | 1 | 0 | 8 |
| Phase 6: Accessibility | 15 | 0 | 0 | 0 | 0 | 15 |
| Phase 7: Source Code | 0 | 0 | 0 | 0 | 0 | 0 |
| **TOTAL** | **219** | **33** | **24** | **4** | **5** | **186** |

---

**Document Version:** 1.1  
**Last Updated:** November 4, 2026  
**Prepared By:** QA Assessment Team
