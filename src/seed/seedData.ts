import {
  companyInfo,
  companyVisionMission,
  ourValuesPrinciples,
} from '../data/companyData';
import {
  deliveryFrameworkMeta,
  deliveryStages,
} from '../data/deliveryData';
import { industryExpertiseData } from '../data/industryData';
import { productsCatalog } from '../data/productsData';
import { serviceOfferings } from '../data/servicesData';
import type { ScopeKey, PageSeo } from '../schemas/content';

export const SEED_INSIGHTS_ARTICLES = [
  {
    id: 'art-1',
    slug: 'scaling-event-streaming-zero-data-loss',
    title: 'Architecting Event-Driven Streaming Pipelines with Zero Data Loss at 10M Events/Sec',
    category: 'System Architecture',
    imageVersionId: 'ver_seed_13_insights_featured_cover',
    readTime: '6 min read',
    publishedDate: 'October 2026',
    author: {
      name: 'Faizur Rahman',
      role: 'Principal Solutions Architect',
    },
    excerpt:
      'How we engineered a fault-tolerant event processing architecture using partitioned streaming buffers, exactly-once deduplication keys, and distributed cold-storage syncing.',
    content: [
      'In high-concurrency transactional architectures, even a 0.001% data packet drop rate translates to thousands of lost financial records or broken downstream microservices. Building systems that pursue exactly-once delivery at massive volume requires abandoning simplistic queues in favor of distributed partitioned log structures.',
      'Our approach leverages distributed append-only journals combined with client-side idempotency hashing. When upstream clients push transactional payloads, an idempotent SHA-256 fingerprint is immediately assigned and stored in an ultra-fast in-memory Bloom filter before persisting into partitioned write-ahead logs.',
      'By decoupling ingestion buffers from analytical consumers, the architecture can pursue illustrative targets such as low-double-digit millisecond P99 latency while remaining resilient through regional node outages without dropping in-flight events.',
      'When designing for enterprise scale, remember: simplicity in contract boundaries yields predictability in distributed fault domains.',
    ],
    sections: [
      { id: 'overview', title: 'Overview' },
      { id: 'architecture', title: 'Architecture Pattern' },
      { id: 'takeaways', title: 'Key Takeaways' },
    ],
    tags: ['Architecture', 'Kafka', 'Streaming', 'Microservices', 'Zero-Loss'],
  },
  {
    id: 'art-2',
    slug: 'private-enterprise-ai-rag-architectures',
    title: 'Building Air-Gapped Enterprise AI: Zero Data Leakage RAG Systems in Regulated Environments',
    category: 'Enterprise AI',
    imageVersionId: 'ver_seed_13_insights_featured_cover',
    readTime: '8 min read',
    publishedDate: 'September 2026',
    author: {
      name: 'V. Sundar',
      role: 'Director of Cloud & AI Systems',
    },
    excerpt:
      'A blueprint for deploying private large language models with real-time vector search inside strict SOC 2 and HIPAA security boundaries without public API exposure.',
    content: [
      'Enterprise adoption of generative AI has frequently stalled at the security boundary. Corporate legal and compliance teams rightfully reject sending proprietary intellectual property and customer records across multi-tenant commercial LLM endpoints.',
      'The modern enterprise solution is private RAG (Retrieval-Augmented Generation) hosted entirely within dedicated VPC or on-premise Kubernetes clusters using quantized open-weights models and hardware-accelerated inference engines.',
      'In this architecture, document ingestion pipelines automatically tokenize, redact PII via local transformer models, and index vector embeddings into dedicated Qdrant or Milvus clusters with granular row-level access permissions.',
      'The result is enterprise-grade contextual intelligence that operates under strict data-retention controls, supporting both regulatory standards and executive velocity goals.',
    ],
    sections: [
      { id: 'risk', title: 'Security Risk' },
      { id: 'architecture', title: 'Private RAG Design' },
      { id: 'outcome', title: 'Operational Outcome' },
    ],
    tags: ['AI', 'RAG', 'VectorDB', 'Zero-Trust', 'HIPAA'],
  },
  {
    id: 'art-3',
    slug: 'zero-downtime-monolith-to-microservice-migration',
    title: 'The Strangler Fig Pattern: Migrating Core Monoliths to Microservices with Zero Downtime',
    category: 'Cloud Modernization',
    imageVersionId: 'ver_seed_13_insights_featured_cover',
    readTime: '7 min read',
    publishedDate: 'August 2026',
    author: {
      name: 'A. K. Sharma',
      role: 'Head of Pod Engineering',
    },
    excerpt:
      'Step-by-step strategies for deconstructing multi-gigabyte monolithic databases and application cores using dynamic reverse proxy routing and dual-write synchronizations.',
    content: [
      'The most dangerous decision an enterprise can make is a "Big Bang" rewrite of an active production monolith. Systems that took a decade to build contain countless undocumented domain edge cases that cannot be cleanly replicated in a single simultaneous cutover.',
      'The Strangler Fig design pattern provides an incremental, zero-risk pathway. By placing an intelligent API gateway at the edge, individual functional domains (e.g., Auth, Inventory, Billing) are systematically intercepted and directed to modern microservices while the legacy core continues operating seamlessly.',
      'Dual-write data synchronization with automated reconciliation background workers maintains parity between legacy relational tables and new distributed event streams during the multi-month transition period.',
      'Only once the new services meet agreed high-availability reliability targets under production load is the legacy module permanently retired.',
    ],
    sections: [
      { id: 'risk', title: 'Migration Risk' },
      { id: 'strategy', title: 'Fallback Strategy' },
      { id: 'migration', title: 'Controlled Migration' },
    ],
    tags: ['Modernization', 'Microservices', 'DevOps', 'Cloud', 'Kubernetes'],
  },
] as const;

/**
 * Idempotent Seed Specification per SEED-1, ALT-1..ALT-4, HR-4, and SEO-1.
 *
 * - Every image slot (SLOT-01..SLOT-15) carries its Phase 1 informative vs decorative
 *   classification and per-slot alt text.
 * - Every media asset has an immutable version ID (`ver_seed_...`) promoted to
 *   `status = 'ready'` and `public_state = 'public'` via the seed promotion flow.
 * - Initial Admin user is seeded with `force_mfa_enrollment = TRUE` (AUTH-1a).
 */

export interface SeedMediaSlotSpec {
  slotId: string;
  assetId: string;
  versionId: string;
  scopeKey: ScopeKey;
  jsonPath: string;
  label: string;
  classification: 'informative' | 'decorative';
  altText: string;
  sourcePublicPath: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/svg+xml';
  width: number;
  height: number;
  expectedAspectRatio: number;
}

export const SEED_MEDIA_SLOTS: readonly SeedMediaSlotSpec[] = [
  {
    slotId: 'SLOT-01',
    assetId: 'asset_logo_header_primary',
    versionId: 'ver_seed_01_logo_header_primary',
    scopeKey: 'global:header',
    jsonPath: '$.logo.versionId',
    label: 'Header Primary Brand Logo (Link to Home)',
    classification: 'informative',
    altText: 'Azaroth Tech-Hive — Home',
    sourcePublicPath: '/Logo.png',
    mimeType: 'image/png',
    width: 512,
    height: 160,
    expectedAspectRatio: 3.2,
  },
  {
    slotId: 'SLOT-02',
    assetId: 'asset_logo_mobile_drawer',
    versionId: 'ver_seed_02_logo_mobile_drawer',
    scopeKey: 'global:header',
    jsonPath: '$.mobileLogo.versionId',
    label: 'Mobile Navigation Drawer Brand Logo (Link to Home)',
    classification: 'informative',
    altText: 'Azaroth Tech-Hive — Home',
    sourcePublicPath: '/Logo.png',
    mimeType: 'image/png',
    width: 512,
    height: 160,
    expectedAspectRatio: 3.2,
  },
  {
    slotId: 'SLOT-03',
    assetId: 'asset_logo_footer_transparent',
    versionId: 'ver_seed_03_logo_footer_transparent',
    scopeKey: 'global:footer',
    jsonPath: '$.logo.versionId',
    label: 'Footer Brand Logo (Link to Home)',
    classification: 'informative',
    altText: 'Azaroth Tech-Hive — Home',
    sourcePublicPath: '/images/logo-footer-transparent.png',
    mimeType: 'image/png',
    width: 512,
    height: 160,
    expectedAspectRatio: 3.2,
  },
  {
    slotId: 'SLOT-04',
    assetId: 'asset_site_favicon',
    versionId: 'ver_seed_04_site_favicon',
    scopeKey: 'global:settings',
    jsonPath: '$.favicon.versionId',
    label: 'Site Favicon & App Icon',
    classification: 'informative',
    altText: 'Azaroth Tech-Hive Icon',
    sourcePublicPath: '/Favicon.png',
    mimeType: 'image/png',
    width: 256,
    height: 256,
    expectedAspectRatio: 1.0,
  },
  {
    slotId: 'SLOT-05',
    assetId: 'asset_home_hero_ambient',
    versionId: 'ver_seed_05_home_hero_ambient',
    scopeKey: 'page:home',
    jsonPath: '$.hero.ambientBackdrop.versionId',
    label: 'Home Hero Ambient Backdrop Texture',
    classification: 'decorative',
    altText: '',
    sourcePublicPath: '/images/hero-workspace.jpg',
    mimeType: 'image/jpeg',
    width: 1600,
    height: 900,
    expectedAspectRatio: 1.7778,
  },
  {
    slotId: 'SLOT-06',
    assetId: 'asset_home_hero_architecture',
    versionId: 'ver_seed_06_home_hero_architecture',
    scopeKey: 'page:home',
    jsonPath: '$.hero.primaryMedia.versionId',
    label: 'Home Hero Enterprise Engineering Preview',
    classification: 'informative',
    altText:
      'Azaroth Tech-Hive enterprise software engineering and systems architecture workspace',
    sourcePublicPath: '/images/hero-workspace.jpg',
    mimeType: 'image/jpeg',
    width: 1600,
    height: 1000,
    expectedAspectRatio: 1.6,
  },
  {
    slotId: 'SLOT-07',
    assetId: 'asset_home_capability_visual',
    versionId: 'ver_seed_07_home_capability_visual',
    scopeKey: 'page:home',
    jsonPath: '$.capabilities.featureMedia.versionId',
    label: 'Home Capabilities Enterprise Stack Visual',
    classification: 'informative',
    altText:
      'Enterprise software engineering architecture showing modular platforms and systems integration layers',
    sourcePublicPath: '/images/services-engineering.jpg',
    mimeType: 'image/jpeg',
    width: 1200,
    height: 800,
    expectedAspectRatio: 1.5,
  },
  {
    slotId: 'SLOT-08',
    assetId: 'asset_home_cta_pattern',
    versionId: 'ver_seed_08_home_cta_pattern',
    scopeKey: 'page:home',
    jsonPath: '$.ctaSection.backgroundPattern.versionId',
    label: 'Home CTA Decorative Grid Accent',
    classification: 'decorative',
    altText: '',
    sourcePublicPath: '/images/pattern-grid.svg',
    mimeType: 'image/svg+xml',
    width: 1440,
    height: 480,
    expectedAspectRatio: 3.0,
  },
  {
    slotId: 'SLOT-09',
    assetId: 'asset_about_hero_team',
    versionId: 'ver_seed_09_about_hero_team',
    scopeKey: 'page:about',
    jsonPath: '$.hero.media.versionId',
    label: 'About Us Engineering Team Visual',
    classification: 'informative',
    altText:
      'Azaroth Tech-Hive leadership and software engineering team collaborating on enterprise systems',
    sourcePublicPath: '/images/about-team.jpg',
    mimeType: 'image/jpeg',
    width: 1400,
    height: 900,
    expectedAspectRatio: 1.5556,
  },
  {
    slotId: 'SLOT-10',
    assetId: 'asset_portfolio_case_fintech',
    versionId: 'ver_seed_10_portfolio_case_fintech',
    scopeKey: 'page:portfolio',
    jsonPath: '$.caseStudies[0].media.versionId',
    label: 'Portfolio Case Study — Enterprise Platform Showcase',
    classification: 'informative',
    altText:
      'Enterprise platform dashboard and operational system engineered by Azaroth Tech-Hive',
    sourcePublicPath: '/images/products/fms-cover.jpg',
    mimeType: 'image/jpeg',
    width: 1200,
    height: 750,
    expectedAspectRatio: 1.6,
  },
  {
    slotId: 'SLOT-11',
    assetId: 'asset_products_platform_preview',
    versionId: 'ver_seed_11_products_platform_preview',
    scopeKey: 'page:products',
    jsonPath: '$.hero.media.versionId',
    label: 'Products Overview — Enterprise Software Platforms',
    classification: 'informative',
    altText:
      'Enterprise software platforms including Fitness Management System and multi-location administration overview',
    sourcePublicPath: '/images/products/fms-cover.jpg',
    mimeType: 'image/jpeg',
    width: 1280,
    height: 800,
    expectedAspectRatio: 1.6,
  },
  {
    slotId: 'SLOT-12',
    assetId: 'asset_services_engineering_preview',
    versionId: 'ver_seed_12_services_engineering_preview',
    scopeKey: 'page:services',
    jsonPath: '$.hero.media.versionId',
    label: 'Services Overview — Enterprise Digital Transformation & Engineering',
    classification: 'informative',
    altText:
      'Dedicated engineering teams delivering solution architecture, application modernization, and enterprise integration',
    sourcePublicPath: '/images/services-engineering.jpg',
    mimeType: 'image/jpeg',
    width: 1280,
    height: 800,
    expectedAspectRatio: 1.6,
  },
  {
    slotId: 'SLOT-13',
    assetId: 'asset_insights_featured_cover',
    versionId: 'ver_seed_13_insights_featured_cover',
    scopeKey: 'page:insights',
    jsonPath: '$.featuredCover.versionId',
    label: 'Insights & Research Featured Publication Cover',
    classification: 'informative',
    altText:
      'Technical research publication on event-driven streaming pipelines, private enterprise AI RAG, and cloud modernization',
    sourcePublicPath: '/images/insights-cover.jpg',
    mimeType: 'image/jpeg',
    width: 1200,
    height: 675,
    expectedAspectRatio: 1.7778,
  },
  {
    slotId: 'SLOT-14',
    assetId: 'asset_testimonials_partner_badge',
    versionId: 'ver_seed_14_testimonials_partner_badge',
    scopeKey: 'page:testimonials',
    jsonPath: '$.heroBadgeMedia.versionId',
    label: 'Client Testimonials Verification Graphic',
    classification: 'informative',
    altText: 'Verified enterprise technology delivery partner badge',
    sourcePublicPath: '/Logo.png',
    mimeType: 'image/png',
    width: 512,
    height: 160,
    expectedAspectRatio: 3.2,
  },
  {
    slotId: 'SLOT-15',
    assetId: 'asset_connect_decorative_backdrop',
    versionId: 'ver_seed_15_connect_decorative_backdrop',
    scopeKey: 'page:connect',
    jsonPath: '$.hero.decorativeBackdrop.versionId',
    label: 'Connect With Us Decorative Ambient Backdrop',
    classification: 'decorative',
    altText: '',
    sourcePublicPath: '/images/pattern-grid.svg',
    mimeType: 'image/svg+xml',
    width: 1440,
    height: 480,
    expectedAspectRatio: 3.0,
  },
] as const;

export const SEED_PAGE_SEO: Record<string, PageSeo> = {
  'page:home': {
    title: 'Azaroth Tech-Hive — Enterprise Technology Solutions & Engineering',
    description: companyInfo.description,
    ogTitle: 'Azaroth Tech-Hive — Enterprise Technology Solutions & Engineering',
    ogDescription: companyInfo.description,
    ogImageVersionId: 'ver_seed_06_home_hero_architecture',
    robots: 'index, follow',
    canonicalPath: '/',
  },
  'page:about': {
    title: 'About Us | Azaroth Tech-Hive',
    description:
      'Discover Azaroth Tech-Hive’s vision, mission, core engineering values, and four-stage delivery framework for enterprise software.',
    ogTitle: 'About Us | Azaroth Tech-Hive',
    ogDescription:
      'Discover Azaroth Tech-Hive’s vision, mission, core engineering values, and delivery framework.',
    ogImageVersionId: 'ver_seed_09_about_hero_team',
    robots: 'index, follow',
    canonicalPath: '/about-us',
  },
  'page:portfolio': {
    title: 'Portfolio | Azaroth Tech-Hive',
    description:
      'Explore enterprise software platforms, custom engineering services, and industry solutions delivered by Azaroth Tech-Hive.',
    ogTitle: 'Portfolio | Azaroth Tech-Hive',
    ogDescription:
      'Enterprise software platforms, custom engineering services, and industry solutions by Azaroth Tech-Hive.',
    ogImageVersionId: 'ver_seed_10_portfolio_case_fintech',
    robots: 'index, follow',
    canonicalPath: '/portfolio',
  },
  'page:products': {
    title: 'Software Products & Platforms | Azaroth Tech-Hive',
    description:
      'Enterprise software platforms engineered for reliability, multi-location operations, and seamless integration.',
    ogTitle: 'Software Products & Platforms | Azaroth Tech-Hive',
    ogDescription:
      'Enterprise software platforms engineered for reliability and seamless integration.',
    ogImageVersionId: 'ver_seed_11_products_platform_preview',
    robots: 'index, follow',
    canonicalPath: '/products',
  },
  'page:services': {
    title: 'Enterprise Engineering Services | Azaroth Tech-Hive',
    description:
      'Digital transformation, custom software engineering, strategic consulting, and application modernization services by Azaroth Tech-Hive.',
    ogTitle: 'Enterprise Engineering Services | Azaroth Tech-Hive',
    ogDescription:
      'Digital transformation, custom software engineering, and application modernization services.',
    ogImageVersionId: 'ver_seed_12_services_engineering_preview',
    robots: 'index, follow',
    canonicalPath: '/services',
  },
  'page:insights': {
    title: 'Insights & Research | Azaroth Tech-Hive',
    description:
      'Technical articles, system architecture blueprints, and enterprise engineering insights from Azaroth Tech-Hive.',
    ogTitle: 'Insights & Research | Azaroth Tech-Hive',
    ogDescription:
      'Technical articles and system architecture blueprints from Azaroth Tech-Hive.',
    ogImageVersionId: 'ver_seed_13_insights_featured_cover',
    robots: 'index, follow',
    canonicalPath: '/insights-research',
  },
  'page:testimonials': {
    title: 'Client Testimonials | Azaroth Tech-Hive',
    description:
      'Read verified feedback and project endorsements from enterprise partners working with Azaroth Tech-Hive.',
    ogTitle: 'Client Testimonials | Azaroth Tech-Hive',
    ogDescription:
      'Verified feedback and project endorsements from Azaroth Tech-Hive enterprise partners.',
    ogImageVersionId: 'ver_seed_14_testimonials_partner_badge',
    robots: 'index, follow',
    canonicalPath: '/client-testimonials',
  },
  'page:connect': {
    title: 'Connect With Us | Azaroth Tech-Hive',
    description:
      'Connect with Azaroth Tech-Hive to discuss software products, custom engineering projects, or technical consultations.',
    ogTitle: 'Connect With Us | Azaroth Tech-Hive',
    ogDescription:
      'Connect with Azaroth Tech-Hive to discuss software products or custom engineering projects.',
    ogImageVersionId: 'ver_seed_06_home_hero_architecture',
    robots: 'index, follow',
    canonicalPath: '/connect-with-us',
  },
  'page:privacy': {
    title: 'Privacy Policy | Azaroth Tech-Hive',
    description:
      'Privacy policy governing inquiries, data handling, and security practices at Azaroth Tech-Hive.',
    ogTitle: 'Privacy Policy | Azaroth Tech-Hive',
    ogDescription: 'Privacy policy and data handling practices at Azaroth Tech-Hive.',
    robots: 'index, follow',
    canonicalPath: '/privacy-policy',
  },
  'page:terms': {
    title: 'Terms of Service | Azaroth Tech-Hive',
    description:
      'Terms of service and legal notices governing use of the Azaroth Tech-Hive website and services.',
    ogTitle: 'Terms of Service | Azaroth Tech-Hive',
    ogDescription: 'Terms of service governing the Azaroth Tech-Hive website.',
    robots: 'index, follow',
    canonicalPath: '/terms-of-service',
  },
};

export const SEED_NAVIGATION_ITEMS = [
  { id: 'nav-1', label: 'Home', path: '/', order: 1, isVisible: true },
  { id: 'nav-2', label: 'About Us', path: '/about-us', order: 2, isVisible: true },
  { id: 'nav-3', label: 'Portfolio', path: '/portfolio', order: 3, isVisible: true },
  { id: 'nav-4', label: 'Insights & Research', path: '/insights-research', order: 4, isVisible: true },
  { id: 'nav-5', label: 'Client Testimonials', path: '/client-testimonials', order: 5, isVisible: true },
  { id: 'nav-6', label: 'Connect With Us', path: '/connect-with-us', order: 6, isVisible: true },
] as const;

export const SEED_TESTIMONIALS = [
  {
    id: 'test-1',
    clientName: 'Aravind Krishnan',
    role: 'Director of Operations',
    company: 'Apex Multi-Location Fitness Group',
    quote:
      'Azaroth Tech-Hive delivered a unified fitness management platform that replaced four disconnected legacy tools across our branches with zero operational downtime.',
    rating: 5,
    industry: 'Fitness & Wellness',
  },
  {
    id: 'test-2',
    clientName: 'Meera Sundaram',
    role: 'VP of Digital Commerce',
    company: 'Vanguard Retail Enterprises',
    quote:
      'Their engineering team brought clarity to our omnichannel inventory and order management integration, significantly reducing fulfillment delays.',
    rating: 5,
    industry: 'Retail & Digital Commerce',
  },
  {
    id: 'test-3',
    clientName: 'Karthik Natarajan',
    role: 'Chief Technology Officer',
    company: 'MedBridge Health Systems',
    quote:
      'From architectural discovery to deployment, Azaroth demonstrated disciplined code quality, transparent communication, and dependable execution.',
    rating: 5,
    industry: 'Healthcare Technology',
  },
] as const;

export function buildSeedScopePayloads(): Record<ScopeKey, Record<string, unknown>> {
  return {
    'global:header': {
      navigation: SEED_NAVIGATION_ITEMS,
      ctaButton: {
        label: 'Connect With Us',
        href: '/connect-with-us',
        openInNewTab: false,
        visible: true,
      },
      logoSlot: SEED_MEDIA_SLOTS[0],
      mobileLogoSlot: SEED_MEDIA_SLOTS[1],
      accessibility: {
        mainNavAriaLabel: 'Main site navigation',
        openMobileMenuAriaLabel: 'Open navigation menu',
        closeMobileMenuAriaLabel: 'Close navigation menu',
      },
    },
    'global:footer': {
      companyName: companyInfo.name,
      description: companyInfo.description,
      headquarters: companyInfo.headquarters,
      copyrightText: 'All rights reserved © 2026 Azaroth Tech-Hive',
      logoSlot: SEED_MEDIA_SLOTS[2],
      quickLinks: SEED_NAVIGATION_ITEMS,
      legalLinks: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms of Service', href: '/terms-of-service' },
      ],
      accessibility: {
        footerNavAriaLabel: 'Footer navigation',
      },
    },
    'global:settings': {
      settings: {
        siteName: companyInfo.name,
        tagline: 'Enterprise software engineering for complex systems.',
        contactEmail: companyInfo.headquarters.email,
        contactPhone: companyInfo.headquarters.phone,
        whatsapp: companyInfo.headquarters.whatsapp,
        address: companyInfo.headquarters.address,
        mapsUrl: companyInfo.headquarters.mapsUrl,
        socialLinks: companyInfo.socialLinks,
      },
      faviconSlot: SEED_MEDIA_SLOTS[3],
      notFoundPage: {
        badge: 'Error 404',
        heading: 'Page Not Found',
        description:
          'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
        primaryCta: {
          label: 'Back to Home',
          href: '/',
          openInNewTab: false,
          visible: true,
        },
      },
      thirdPartyScripts: {
        enabled: false,
        analyticsId: '',
      },
    },
    'page:home': {
      seo: SEED_PAGE_SEO['page:home'],
      hero: {
        title: 'Enterprise Software Engineering for Complex Systems',
        subtitle: companyInfo.description,
        primaryCta: { label: 'Explore Our Portfolio', href: '/portfolio', openInNewTab: false, visible: true },
        secondaryCta: { label: 'Connect With Us', href: '/connect-with-us', openInNewTab: false, visible: true },
      },
      visionMission: companyVisionMission,
      values: ourValuesPrinciples,
      deliveryFramework: {
        meta: deliveryFrameworkMeta,
        stages: deliveryStages,
      },
      slots: {
        ambientBackdrop: SEED_MEDIA_SLOTS[4],
        primaryMedia: SEED_MEDIA_SLOTS[5],
        capabilityVisual: SEED_MEDIA_SLOTS[6],
        ctaPattern: SEED_MEDIA_SLOTS[7],
      },
    },
    'page:about': {
      seo: SEED_PAGE_SEO['page:about'],
      companyInfo,
      visionMission: companyVisionMission,
      values: ourValuesPrinciples,
      deliveryFramework: {
        meta: deliveryFrameworkMeta,
        stages: deliveryStages,
      },
      slots: {
        heroMedia: SEED_MEDIA_SLOTS[8],
      },
    },
    'page:portfolio': {
      seo: SEED_PAGE_SEO['page:portfolio'],
      hero: {
        badge: 'Our Portfolio',
        title: 'Software Platforms, Enterprise Services & Industry Expertise',
        description:
          'Explore our turnkey software platforms, custom engineering services, and domain-specific solutions built for reliability and scale.',
      },
      slots: {
        featuredCaseMedia: SEED_MEDIA_SLOTS[9],
      },
    },
    'page:products': {
      seo: SEED_PAGE_SEO['page:products'],
      heroSlot: SEED_MEDIA_SLOTS[10],
      detailDrawerLabels: {
        overviewHeading: 'Platform Architecture Overview',
        capabilitiesHeading: 'Core Capabilities',
        specificationsHeading: 'Technical Specifications',
        requestBriefingCtaLabel: 'Request a Product Walkthrough',
      },
    },
    'page:services': {
      seo: SEED_PAGE_SEO['page:services'],
      heroSlot: SEED_MEDIA_SLOTS[11],
      detailLabels: {
        deliverablesHeading: 'Key Engineering Deliverables',
        engagementModelHeading: 'Engagement & Delivery Model',
        speakWithArchitectCtaLabel: 'Speak With Our Engineering Team',
      },
    },
    'page:insights': {
      seo: SEED_PAGE_SEO['page:insights'],
      featuredCoverSlot: SEED_MEDIA_SLOTS[12],
      labels: {
        readArticleLabel: 'Read Technical Article',
        backToInsightsLabel: 'Back to All Insights',
        filterAllLabel: 'All Categories',
      },
    },
    'page:testimonials': {
      seo: SEED_PAGE_SEO['page:testimonials'],
      heroBadgeSlot: SEED_MEDIA_SLOTS[13],
      labels: {
        verifiedPartnerBadge: 'Verified Client Engagement',
        ctaHeading: 'Ready to Build Your Next Software Platform?',
        ctaButtonLabel: 'Connect With Us',
        ctaButtonHref: '/connect-with-us',
      },
    },
    'page:connect': {
      seo: SEED_PAGE_SEO['page:connect'],
      headquarters: companyInfo.headquarters,
      decorativeBackdropSlot: SEED_MEDIA_SLOTS[14],
      formLabels: {
        generalTabLabel: 'General / Services Inquiry',
        productTabLabel: 'Product Inquiry',
        submitButtonLabel: 'Submit Inquiry',
      },
    },
    'page:privacy': {
      seo: SEED_PAGE_SEO['page:privacy'],
      title: 'Privacy Policy',
      lastUpdated: 'October 2026',
      contactEmail: companyInfo.headquarters.email,
    },
    'page:terms': {
      seo: SEED_PAGE_SEO['page:terms'],
      title: 'Terms of Service',
      lastUpdated: 'October 2026',
      contactEmail: companyInfo.headquarters.email,
    },
    'collection:products': {
      items: productsCatalog,
    },
    'collection:services': {
      items: serviceOfferings,
    },
    'collection:industries': {
      items: industryExpertiseData,
    },
    'collection:insights': {
      items: SEED_INSIGHTS_ARTICLES,
    },
    'collection:testimonials': {
      items: SEED_TESTIMONIALS,
    },
  };
}

export const SEED_FIRST_ADMIN = {
  id: 'usr_seed_initial_admin',
  email: process.env.INITIAL_ADMIN_EMAIL || 'admin@azaroth-techhive.com',
  name: process.env.INITIAL_ADMIN_NAME || (process.env.INITIAL_ADMIN_EMAIL ? process.env.INITIAL_ADMIN_EMAIL.split('@')[0] : 'admin'),
  role: 'admin' as const,
  emailVerified: true,
  twoFactorEnabled: false,
  forceMfaEnrollment: true, // AUTH-1a: forced to enroll TOTP MFA on first login
};
