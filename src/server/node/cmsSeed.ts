import {
  SEED_MEDIA_SLOTS,
  SEED_NAVIGATION_ITEMS,
  SEED_TESTIMONIALS,
  SEED_INSIGHTS_ARTICLES,
  buildSeedScopePayloads,
} from '../../seed/seedData';
import { companyInfo, companyVisionMission, ourValuesPrinciples } from '../../data/companyData';
import { deliveryFrameworkMeta, deliveryStages } from '../../data/deliveryData';
import { industryExpertiseData } from '../../data/industryData';
import { productsCatalog } from '../../data/productsData';
import { serviceOfferings } from '../../data/servicesData';

const seedPayloads = buildSeedScopePayloads();

export interface CmsSeedState {
  settings: Record<string, any>;
  navigation: Array<Record<string, any>>;
  products: Array<Record<string, any>>;
  services: Array<Record<string, any>>;
  portfolio: Array<Record<string, any>>;
  insights: Array<Record<string, any>>;
  testimonials: Array<Record<string, any>>;
  pages: Record<string, any>;
  enquiries: Array<Record<string, any>>;
  media: Array<Record<string, any>>;
  auditLogs: Array<Record<string, any>>;
  lastUpdated: string;
}

export const initialCmsState: CmsSeedState = {
  settings: {
    id: 'global',
    companyName: companyInfo.name,
    tagline: 'Enterprise software engineering for complex systems.',
    supportEmail: companyInfo.headquarters.email,
    phone: companyInfo.headquarters.phone,
    headquarters: companyInfo.headquarters.address,
    linkedinUrl: 'https://linkedin.com/company/azaroth-tech-hive',
    twitterUrl: 'https://twitter.com/azarothtech',
    githubUrl: 'https://github.com/azaroth-tech',
    metaTitle: 'Azaroth Tech-Hive — Enterprise Technology Solutions & Engineering',
    metaDescription: companyInfo.description,
    logoUrl: '',
    headquarters_address: companyInfo.headquarters.address,
    primary_phone: companyInfo.headquarters.phone,
    primary_email: companyInfo.headquarters.email,
    whatsapp_number: companyInfo.headquarters.whatsapp,
    linkedin_url: 'https://linkedin.com/company/azaroth-tech-hive',
    copyright_text: 'All rights reserved © 2026 Azaroth Tech-Hive ',
    footerLayout: 'standard',
  },
  navigation: [...SEED_NAVIGATION_ITEMS],
  products: productsCatalog.map((p, idx) => ({
    ...p,
    order: idx + 1,
    ctaText: 'Request Architecture Walkthrough',
    ctaLink: '/connect-with-us',
  })),
  services: serviceOfferings.map((s, idx) => ({
    ...s,
    summary: s.bestFor,
    order: idx + 1,
  })),
  portfolio: [
    {
      id: 'e-commerce-platform',
      name: 'E-Commerce Platform',
      slug: 'e-commerce-platform',
      clientName: 'Omnichannel Retail Enterprise',
      clientType: 'Enterprise',
      industry: 'Retail & Digital Commerce',
      category: 'Web Development · E-Commerce',
      summary: 'High-concurrency headless digital storefront with sub-second checkout and real-time inventory synchronization.',
      challenge: 'Disconnected sales channels, inconsistent inventory visibility, and manual order processing created friction across the customer journey.',
      solution: 'Engineered a headless commerce storefront connecting inventory, order management, and payment gateways in real time.',
      outcomes: ['Sub-second checkout response', 'Real-time multi-store inventory sync'],
      technologies: ['React', 'Node.js', 'PostgreSQL', 'GraphQL'],
      coverImage: '/images/products/commerce-cover.jpg',
      isFeatured: true,
      order: 1,
    },
    {
      id: 'mobile-banking-app',
      name: 'Mobile Banking App',
      slug: 'mobile-banking-app',
      clientName: 'Digital Financial Services',
      clientType: 'Enterprise',
      industry: 'Financial Technology',
      category: 'Mobile Apps · Fintech',
      summary: 'Biometric-secured iOS and Android banking app featuring instant payments, budget analytics, and multi-currency accounts.',
      challenge: 'Legacy mobile banking workflows lacked biometric security, real-time notifications, and multi-currency settlement visibility.',
      solution: 'Built a cross-platform mobile banking suite with hardware-backed biometric authentication and event-driven ledger streaming.',
      outcomes: ['99.99% transaction availability', 'Instant multi-currency transfers'],
      technologies: ['React Native', 'TypeScript', 'Go', 'Kafka'],
      coverImage: '/images/products/fms-cover.jpg',
      isFeatured: true,
      order: 2,
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      slug: 'analytics-dashboard',
      clientName: 'Global Logistics Network',
      clientType: 'Enterprise',
      industry: 'Supply Chain & Logistics',
      category: 'Web App · Business Intelligence',
      summary: 'Real-time telemetry and executive data warehouse dashboard processing millions of events per minute.',
      challenge: 'Siloed operational data delayed executive reporting and hid supply chain bottlenecks across regional hubs.',
      solution: 'Architected a streaming telemetry ingestion pipeline and interactive executive analytics console.',
      outcomes: ['Real-time KPI observability', 'Automated anomaly alerting'],
      technologies: ['React', 'ClickHouse', 'Kafka', 'TypeScript'],
      coverImage: '/images/products/lmp-cover.jpg',
      isFeatured: true,
      order: 3,
    },
    {
      id: 'creative-portfolio',
      name: 'Creative Portfolio',
      slug: 'creative-portfolio',
      clientName: 'Aetherius Design Studio',
      clientType: 'Brand & Media',
      industry: 'Digital Media',
      category: 'UI/UX Design · Branding',
      summary: 'Bespoke design portfolio and digital asset exhibition engineered with fluid micro-interactions and spatial design.',
      challenge: 'Standard templates failed to showcase high-resolution media assets without sacrificing page load speed.',
      solution: 'Designed a custom hardware-accelerated web experience with progressive asset streaming and accessible motion controls.',
      outcomes: ['Sub-second Largest Contentful Paint', 'Fluid 60fps micro-interactions'],
      technologies: ['React', 'Framer Motion', 'Tailwind CSS', 'Vite'],
      coverImage: '/images/products/hms-cover.jpg',
      isFeatured: true,
      order: 4,
    },
  ],
  insights: SEED_INSIGHTS_ARTICLES.map((a) => ({
    ...a,
    imageUrl: '/images/insights-cover.jpg',
    status: 'PUBLISHED',
  })),
  testimonials: SEED_TESTIMONIALS.map((t, idx) => ({
    ...t,
    organization: t.company,
    authorName: t.clientName,
    authorRole: t.role,
    companyName: t.company,
    isFeatured: true,
    order: idx + 1,
    status: 'PUBLISHED',
  })),
  pages: {
    home: {
      ...seedPayloads['page:home'],
      hero: {
        badge: '- DRIVING DIGITAL EXCELLENCE -',
        titlePart1: 'Intelligence Engineered',
        titleHighlight: 'Innovation Unleashed.',
        title: 'Intelligence Engineered Innovation Unleashed.',
        subtitle:
          'Azaroth Tech-Hive engineers, evolves, and sustains intelligent software solutions, delivering end-to-end engineering excellence that empowers businesses to innovate, adapt, and scale with confidence.',
        primaryCtaText: 'Explore Services',
        primaryCtaLink: '/portfolio#services',
        secondaryCtaText: 'Connect With Us',
        secondaryCtaLink: '/connect-with-us',
        metrics: [
          { value: '95%', label: 'Client Satisfaction' },
          { value: '100%', label: 'Commitment to Quality' },
          { value: '90%', label: 'On-Time Delivery' },
          { value: '98%', label: 'System Reliability' },
        ],
      },
      aboutSection: {
        badge: 'Who We Are',
        titlePart1: 'Turning Ideas into',
        titleHighlight: 'Digital Reality',
        title: 'Turning Ideas into Digital Reality',
        paragraph1:
          'Azaroth Tech-Hive delivers practical software engineering solutions that help businesses overcome technical challenges, improve operations, and transform ideas into dependable digital products. We support the software lifecycle, from requirements analysis and solution design to application development, integration, and modernisation.',
        paragraph2:
          'Each stage focuses on business objectives, engineering quality, and practical outcomes. We prioritise reliability, security, performance, usability, and maintainability, delivering lasting value without unnecessary complexity. Whether developing new applications or enhancing existing systems, we help businesses leverage technology effectively and prepare for future growth.',
      },
      servicesSection: {
        badge: 'OUR SERVICES',
        titlePart1: 'From Innovation to Excellence',
        titleHighlight: 'Your Technology Growth Partner',
        title: 'From Innovation to Excellence — Your Technology Growth Partner',
        subtitle:
          'At Azaroth Tech-Hive, we turn technology into a catalyst for business transformation. By bringing together strategic vision, engineering excellence, and operational intelligence, we help organizations navigate complexity, modernize their digital capabilities, and scale with confidence. Our focus is on building future-ready solutions that drive efficiency, accelerate innovation, and create lasting business impact.',
        ctaText: 'Explore Services',
        ctaLink: '/portfolio#services',
      },
      productsSection: {
        badge: 'Our Software Platforms',
        titlePart1: 'Enterprise Software',
        titleHighlight: 'Solutions',
        title: 'Enterprise Software Solutions',
        subtitle:
          'Purpose-engineered software platforms designed for scalable multi-location operations, omnichannel digital commerce, healthcare informatics, and enterprise workforce learning.',
        ctaText: 'View Complete Platform Catalog',
        ctaLink: '/portfolio#products',
      },
      featuredProjectsSection: {
        badge: 'FEATURED WORK',
        title: 'Featured Projects',
        subtitle:
          'Explore some of our latest projects and see how we turn ideas into impactful digital solutions.',
        projects: [
          {
            id: 'e-commerce-platform',
            title: 'E-Commerce Platform',
            categories: 'Web Development · E-Commerce',
            description:
              'High-concurrency headless digital storefront with sub-second checkout and real-time inventory synchronization.',
            link: '/portfolio#products',
          },
          {
            id: 'mobile-banking-app',
            title: 'Mobile Banking App',
            categories: 'Mobile Apps · Fintech',
            description:
              'Biometric-secured iOS and Android banking app featuring instant payments, budget analytics, and multi-currency accounts.',
            link: '/portfolio#services',
          },
          {
            id: 'analytics-dashboard',
            title: 'Analytics Dashboard',
            categories: 'Web App · Business Intelligence',
            description:
              'Real-time telemetry and executive data warehouse dashboard processing millions of events per minute.',
            link: '/portfolio#services',
          },
          {
            id: 'creative-portfolio',
            title: 'Creative Portfolio',
            categories: 'UI/UX Design · Branding',
            description:
              'Bespoke design portfolio and digital asset exhibition engineered with fluid micro-interactions and spatial design.',
            link: '/portfolio#services',
          },
        ],
      },
      industrySection: {
        badge: 'INDUSTRIAL EXPERTISE',
        titlePart1: 'Our Specialised Engineering Across',
        titleHighlight: 'Diverse Industries',
        title: 'Our Specialised Engineering Across Diverse Industries',
        subtitle:
          'We engineer for the operating realities of each industry: we learn the business and operational challenge first, then shape architecture, integrations, and automation around it.',
        industries: industryExpertiseData,
      },
      insightsSection: {
        badge: 'RESOURCE HUB',
        titlePart1: 'Practical Engineering Insight',
        titleHighlight: 'for Enterprise Teams',
        title: 'Practical Engineering Insight for Enterprise Teams',
        subtitle:
          'The Resource Hub collects what our engineers publish on system architecture, enterprise AI, and cloud modernization — the same material we work through when a technical decision needs grounding.',
        ctaText: 'View All Articles',
        ctaLink: '/technology-insights',
      },
      faqSection: {
        badge: 'Technical Consultation',
        titlePart1: 'Questions Teams Ask',
        titleHighlight: 'Before Starting',
        title: 'Questions Teams Ask Before Starting',
        subtitle:
          'Direct answers on how we scope, run, and support enterprise engagements — and where to go when your question is not listed here.',
        cardBadge: 'Technical Consultation',
        cardTitle: 'Have a Specific Question About Your Tech Stack?',
        cardDescription:
          'Speak directly with our technical leads. We evaluate system constraints, integration feasibility, and deployment roadmaps before any commitment.',
        cardPerks: [
          '24-hour scoping & feasibility turnaround',
          'Strict enterprise NDA & confidentiality protection',
          'Direct discussion with Principal Systems Architects',
        ],
        faqs: [
          {
            question: 'What industries do you build for?',
            answer:
              'We build for retail and digital commerce, education and digital learning, healthcare and health technology, supply chain and logistics, and ERP and business management systems. Industry context shapes the architecture, so we begin by learning which constraints apply to your environment before proposing a solution.',
          },
          {
            question: 'How do engagements start?',
            answer:
              'Every engagement starts with discovery: your goals, user needs, existing systems, and technical challenges. That stage produces a written requirements and scope specification, an architecture feasibility assessment, and an agreed delivery horizon, so the build begins against a shared definition of the work.',
          },
          {
            question: 'Can you work with our existing systems and vendors?',
            answer:
              'Yes. Discovery includes a review of legacy systems, integrations, and API constraints, and we plan around the third-party platforms and vendors you already depend on. Integration mapping and interface contracts are defined during solution design so the new work fits the landscape you have.',
          },
          {
            question: 'How do you keep scope and communication under control?',
            answer:
              'Scope is documented at discovery with explicit boundaries, and changes are assessed against that specification rather than absorbed silently. Communication runs through sprint reviews and iterative builds, with progress, blockers, and decisions surfaced as they happen instead of at the end of a phase.',
          },
          {
            question: 'What happens after launch?',
            answer:
              'Deployment is followed by a support stage: monitoring and health checks, issue resolution within the agreed operating model, dependency and framework maintenance, performance tuning, and feature iterations prioritized with you. Coverage is defined in the operating model agreed for your engagement.',
          },
          {
            question: 'How is pricing structured?',
            answer:
              'Pricing is scoped per engagement after discovery, once the scope, constraints, and delivery approach are clear. Share your requirements through our Connect portal and our engineering leadership will return a scoped proposal.',
          },
        ],
      },
      finalCta: {
        titlePart1: "Let's Build the",
        titleHighlight: 'Right Digital Solution.',
        title: "Let's Build the Right Digital Solution.",
        subtitle:
          'Whether you need to engineer a mission-critical platform, modernize legacy systems, or deploy a dedicated engineering pod, we partner with you to turn ambitious roadmaps into resilient digital reality.',
        primaryCtaText: 'Plan Your Next Move',
        primaryCtaLink: '/connect-with-us',
      },
    },
    about: {
      ...seedPayloads['page:about'],
      badge: '- WHO WE ARE -',
      heroTitle: 'Engineering Meaningful Solutions Building Lasting Value',
      heroDescription:
        'At Azaroth Techhive, we are passionate about technology and driven by a simple goal to help businesses build smarter, stronger and more innovative digital solutions with a client-first approach.',
      storyBadge: '— OUR STORY —',
      storyTitle: 'Turning Ideas into Digital Reality',
      storyParagraph1:
        'Azaroth Techhive delivers practical software engineering solutions that help businesses overcome complex technical bottlenecks, modernise legacy operations, and turn high-stakes ideas into dependable digital products.',
      storyParagraph2:
        'With dedicated engineering pods, cloud modernisation, and custom application development, we bring your vision to life, one line of clean, tested code at a time.',
      vision: companyVisionMission.vision,
      mission: companyVisionMission.mission,
      valuesBadge: '— CORE VALUES —',
      valuesTitle: 'Our Core Values',
      valuesSubtitle: 'The principles that guide how we think, engineer, collaborate, and deliver.',
      values: ourValuesPrinciples,
      frameworkBadge: '— DISCIPLINED METHODOLOGY —',
      frameworkTitle: 'Our Delivery Framework — A Clear Path from Idea to Impact',
      frameworkSubtitle:
        'A structured, collaborative approach that brings clarity to every stage of software development, ensuring solutions remain aligned with project goals, built on sound engineering practices, and adaptable to evolving needs.',
      stages: deliveryStages,
    },
    values: {
      badge: '— CORE VALUES —',
      heroTitle: 'Our Core Values',
      heroDescription: 'The principles that guide how we think, engineer, collaborate, and deliver.',
      values: ourValuesPrinciples,
    },
    'delivery-framework': {
      badge: '— DISCIPLINED METHODOLOGY —',
      heroTitle: 'Our Delivery Framework — A Clear Path from Idea to Impact',
      heroDescription: deliveryFrameworkMeta.description,
      phases: deliveryStages.map((s) => ({
        phase: String(s.stageNumber).padStart(2, '0'),
        stageNumber: s.stageNumber,
        title: s.title,
        tagline: s.tagline,
        duration: s.duration,
        description: s.description,
        keyActivities: s.keyActivities,
        deliverables: s.deliverables,
        qualityGates: s.qualityGates,
      })),
    },
    portfolio: {
      ...seedPayloads['page:portfolio'],
      kicker: 'Our Portfolio',
      heroTitlePart1: 'Software Solutions & Engineering Services',
      heroTitleHighlight: 'Built for Growth.',
      heroTitle: 'Software Solutions & Engineering Services Built for Growth.',
      heroDescription:
        'Explore the software platforms we are building and the engineering practices we use to modernise systems, extend teams, and improve operations. Every engagement starts with a clear scope and a practical plan.',
      heroNote:
        'Platforms are at different stages of readiness. Scope, deployment, and licensing are agreed per engagement.',
      productsKicker: 'Software Products',
      productsTitle: 'Software Products & Platforms',
      productsDescription:
        'Purpose-engineered software platforms designed for scalable multi-location operations, omnichannel digital commerce, healthcare informatics, and enterprise workforce learning.',
      servicesKicker: 'Enterprise Engineering Services',
      servicesTitle: 'Services & Engineering Practices',
      servicesDescription:
        'Our practices cover the work that sits around a platform: digital modernisation, technical direction, dedicated engineering capacity, and process automation.',
    },
    insights: {
      ...seedPayloads['page:insights'],
      kicker: '- RESOURCE HUB -',
      heroTitle: 'Engineering Insights That Move Ideas Forward',
      heroSubtitle:
        'Explore software engineering insights, architecture principles, implementation strategies, and technical guidance to help you make informed technology decisions and build better systems.',
    },
    testimonials: {
      ...seedPayloads['page:testimonials'],
      kicker: '- CLIENT TESTIMONIALS -',
      heroTitle: 'Trusted by Leaders Who Build at Scale',
      heroSubtitle:
        'Hear directly from the technology leaders, founders, and engineering executives who rely on Azaroth Tech-Hive to deliver resilient platforms and measurable business outcomes.',
      sectionKicker: 'CLIENT TESTIMONIALS —',
      sectionTitlePart1: 'What Our Clients',
      sectionTitleHighlight: 'Say',
      sectionSubtitle:
        'Real feedback from enterprise leaders, founders, and technology executives who trust Azaroth Tech-Hive to architect and build their software platforms.',
    },
    connect: {
      ...seedPayloads['page:connect'],
      kicker: '- CONNECT WITH US -',
      heroTitle: 'Connect With Us',
      heroSubtitle:
        "Every great solution starts with a conversation. Whether you have a question, want to discuss a project, or explore how we can help, we're ready to listen and respond.",
      officeHeading: 'Connect With Our Engineering Team',
      faqHeading: 'Frequently Asked Questions',
      faqs: [
        {
          question: 'How quickly will I hear back?',
          answer:
            'Every enquiry is reviewed by a solution architect, not a sales queue. We reply within one business day with next steps or a short list of clarifying questions.',
        },
        {
          question: 'What happens after I submit the form?',
          answer:
            'We schedule a 30-minute discovery call to understand your goals, systems, and constraints. From there you receive a scoped recommendation with timelines and an indicative budget.',
        },
        {
          question: 'Can we sign an NDA before sharing details?',
          answer:
            'Yes. We can execute a mutual NDA before any technical discovery. Everything shared with us is treated as confidential by default.',
        },
        {
          question: 'Can I attach an RFP or architecture document?',
          answer:
            'Yes. Use the supporting documents field for RFPs, RFQs, architecture diagrams, or specifications. Accepted formats are PDF, DOCX, XLSX, PNG, JPG, and ZIP up to 15 MB per file.',
        },
        {
          question: 'Do you work with clients outside India?',
          answer:
            'Yes. Our delivery hub is in Chennai and we partner with teams worldwide. Discovery, architecture reviews, and sprint ceremonies run remotely across time zones.',
        },
      ],
    },
    'privacy-policy': {
      title: 'Enterprise Privacy Policy',
      effectiveDate: 'October 2026',
      contactEmail: 'support@azaroth-techhive.com',
      sections: [
        {
          heading: '1. Commitment to Data Governance',
          body: 'Azaroth Tech-Hive ("we", "our", or "us") adheres strictly to enterprise-grade data governance principles, including GDPR (General Data Protection Regulation), SOC 2 Type II, and applicable data localization statutes. We do not sell, license, or monetize proprietary client information or architectural specifications.',
        },
        {
          heading: '2. Information Collection & Usage',
          body: 'Information submitted via our Contact and Engagement portals—including technical architecture notes, work emails, telephone numbers, and corporate affiliations—is utilized solely to formulate architectural scope proposals and facilitate secure communications.',
        },
        {
          heading: '3. Zero-Knowledge & AI Safeguards',
          body: 'Under no circumstances are client specifications, code repositories, or proprietary documents ingested into public artificial intelligence models for training. All AI demonstrations and client evaluation environments operate under zero-data-retention parameters.',
        },
        {
          heading: '4. Data Inquiries & Contact',
          body: 'For data protection officer (DPO) inquiries, contact: support@azaroth-techhive.com',
        },
      ],
    },
    'terms-of-service': {
      title: 'Terms of Service',
      effectiveDate: 'October 2026',
      governingLaw: 'Chennai, Tamil Nadu, India',
      sections: [
        {
          heading: '1. Scope of Engagement',
          body: 'These Terms of Service govern the access and evaluation of the Azaroth UI platform, architectural documentation, and proprietary software accelerators developed by Azaroth Tech-Hive. Formal engineering engagements and dedicated pod staffing are governed by individual Master Services Agreements (MSAs) and Statements of Work (SOWs).',
        },
        {
          heading: '2. Intellectual Property Ownership',
          body: 'All custom software code, schema definitions, and platform components produced by dedicated Azaroth engineering pods for a client are transferred 100% to the client upon milestone acceptance, free of vendor lock-in.',
        },
        {
          heading: '3. Service Level Commitments (SLAs)',
          body: 'Operational uptime, response times, and incident remediation guarantees are governed by the specific SLA tier (Standard, Business, or Mission-Critical Enterprise) outlined in the commercial agreement.',
        },
        {
          heading: '4. Governing Law & Jurisdiction',
          body: 'These terms are construed in accordance with the laws of India, subject to the jurisdiction of the competent courts in Chennai, Tamil Nadu.',
        },
      ],
    },
  },
  enquiries: [],
  media: SEED_MEDIA_SLOTS.map((s) => ({
    id: s.versionId,
    filename: s.sourcePublicPath.split('/').pop() || s.slotId,
    originalName: s.label,
    mimeType: s.mimeType,
    sizeBytes: 102400,
    url: s.sourcePublicPath,
    altText: s.altText,
    category: s.classification,
    createdAt: new Date().toISOString(),
  })),
  auditLogs: [
    {
      id: 'audit-seed-1',
      userId: 'usr-admin-1',
      userName: 'Alexander Vance',
      action: 'SYSTEM_SEED',
      module: 'System',
      entityType: 'seed',
      entityId: 'r1-seed',
      details: { scopes: 18, slots: 15 },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    },
  ],
  lastUpdated: new Date().toISOString(),
};
