// src/context/CMSContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  cmsService,
  WebsiteSettings,
  ThemeConfig,
  WebsiteModuleSetting,
  NavigationItem,
  CmsProduct,
  CmsService,
  CmsPortfolio,
  CmsInsight,
  CmsTestimonial,
  ChatbotConfig,
  ChatbotKnowledgeItem,
} from "./cmsService";

// Default static fallbacks for high-availability offline resiliency
import {
  companyInfo,
  companyVisionMission,
  ourValuesPrinciples,
} from "../data/companyData";
import { deliveryStages } from "../data/deliveryData";
import { industryExpertiseData } from "../data/industryData";
import { productsCatalog } from "../data/productsData";
import { serviceOfferings } from "../data/servicesData";
import { insightsArticles } from "../data/insightsData";
import { isCmsCollection } from "../utils/cmsCollections";
import { normalizeCmsTestimonials } from "../utils/publicContent";
import { normalizePageBuilderDocument } from "../utils/pageBuilder";
import { animationPresets } from "../utils/animationRegistry";
import { ContactFormColumn, DEFAULT_CONTACT_FORM_COLUMNS } from "../types";
export { type ContactFormColumn, DEFAULT_CONTACT_FORM_COLUMNS } from "../types";

export const defaultChatbot: ChatbotConfig = {
  isEnabled: true,
  botName: "Azaroth AI Guide",
  botRole: "Automated engineering assistant",
  welcomeMessage:
    "Hello! I'm the automated Azaroth site guide. Ask me about our platforms, engineering services or how to reach the team.",
  quickPrompts: [
    "Explore Products",
    "Explore Services",
    "Request a Quote",
    "Connect With Us",
  ],
  supportEmail: companyInfo.headquarters.email,
  supportPhone: companyInfo.headquarters.phone,
  position: "bottom-right",
  primaryColor: "#49243F",
  secondaryColor: "#35182E",
  knowledgeBase: [
    {
      triggerKeywords: ["product", "platform"],
      response:
        "We offer enterprise software platforms including Fitness Management System (FMS), Omnichannel Commerce Platform, and Learning Management Platform (LMP). You can explore them on our Products page.",
      buttons: [{ label: "Explore Products", action: "/products" }],
      order: 1,
    },
    {
      triggerKeywords: ["service", "consulting", "engineering"],
      response:
        "We provide comprehensive software engineering services including Full-Stack Web Development, Native & Cross-Platform Mobile Apps, Cloud & DevOps Solutions, and Strategic Consulting.",
      buttons: [{ label: "Explore Services", action: "/services" }],
      order: 2,
    },
    {
      triggerKeywords: ["quote", "pricing", "cost", "rfq"],
      response:
        "For project inquiries, tailored architectures, and enterprise estimates, please connect with our solutions team directly.",
      buttons: [{ label: "Connect With Us", action: "/connect-with-us" }],
      order: 3,
    },
    {
      triggerKeywords: ["contact", "email", "phone", "reach"],
      response: `You can reach us directly at ${companyInfo.headquarters.email} or call ${companyInfo.headquarters.phone}. You can also connect via our consultation portal.`,
      buttons: [{ label: "Connect With Us", action: "/connect-with-us" }],
      order: 4,
    },
    {
      triggerKeywords: ["about", "company", "who"],
      response:
        "Azaroth Tech-Hive engineers, evolves, and sustains intelligent software solutions, delivering end-to-end engineering excellence across global enterprises.",
      buttons: [{ label: "About Us", action: "/about" }],
      order: 5,
    },
    {
      triggerKeywords: ["hello", "hi", "hey"],
      response:
        "Hello! Welcome to Azaroth Tech-Hive. I'm the automated Azaroth site guide. How can I assist you with your software engineering requirements today?",
      buttons: [],
      order: 6,
    },
    {
      triggerKeywords: ["thank"],
      response:
        "You're very welcome! Let us know if you need any technical guidance or wish to schedule a consultation.",
      buttons: [],
      order: 7,
    },
  ],
};

export const defaultModules: WebsiteModuleSetting[] = [
  {
    id: "mod-products",
    name: "Software Products & Platforms",
    slug: "products",
    path: "/products",
    isEnabled: true,
    order: 1,
    description:
      "Software platforms catalog, specifications, and architecture details.",
  },
  {
    id: "mod-services",
    name: "Enterprise Services & Engineering",
    slug: "services",
    path: "/services",
    isEnabled: true,
    order: 2,
    description:
      "Dedicated engineering pods, architecture modernization, and enterprise SLAs.",
  },
  {
    id: "mod-insights",
    name: "Technology Insights & Publications",
    slug: "insights",
    path: "/technology-insights",
    isEnabled: true,
    order: 3,
    description:
      "Technical whitepapers, architecture articles, and engineering blogs.",
  },
  {
    id: "mod-portfolio",
    name: "Case Studies & Client Portfolio",
    slug: "portfolio",
    path: "/portfolio",
    isEnabled: true,
    order: 4,
    description:
      "Enterprise client project showcases, technical outcomes, and metrics.",
  },
  {
    id: "mod-testimonials",
    name: "Client Testimonials & Endorsements",
    slug: "testimonials",
    path: "/testimonials",
    isEnabled: true,
    order: 5,
    description: "Executive reviews and verified client endorsements.",
  },
  {
    id: "mod-about",
    name: "About Azaroth & Leadership",
    slug: "about",
    path: "/about",
    isEnabled: true,
    order: 6,
    description: "Corporate history, vision, mission, and leadership pillars.",
  },
  {
    id: "mod-methodology",
    name: "Delivery Framework & Methodology",
    slug: "delivery-framework",
    path: "/delivery-framework",
    isEnabled: true,
    order: 7,
    description: "Six-stage zero-downtime engineering delivery lifecycle.",
  },
  {
    id: "mod-values",
    name: "Core Principles & Values",
    slug: "values",
    path: "/values",
    isEnabled: true,
    order: 8,
    description:
      "Engineering discipline and architectural transparency principles.",
  },
  {
    id: "mod-connect",
    name: "Connect & Consultation Form",
    slug: "connect",
    path: "/connect-with-us",
    isEnabled: true,
    order: 9,
    description: "Direct contact portal and consultation scheduling.",
  },
];

export const defaultTheme: ThemeConfig = {
  primaryColor: "#49243F", // Brand Plum
  secondaryColor: "#C99B52", // Antique Gold
  accentColor: "#8A315D", // Vibrant Berry
  backgroundColor: "#FAF8F4", // Warm Cream Canvas
  textColor: "#2B232D", // Ink Plum Text
  borderColor: "#E3DACF", // Warm Sand Border
  preset: "plum-heritage",
};

const defaultSettings: WebsiteSettings = {
  id: "global",
  companyName: companyInfo.name,
  tagline: "Enterprise software engineering for complex systems.",
  supportEmail: companyInfo.headquarters.email,
  phone: companyInfo.headquarters.phone,
  headquarters: companyInfo.headquarters.address,
  linkedinUrl: "https://linkedin.com/company/azaroth-tech-hive",
  twitterUrl: "https://twitter.com/azarothtech",
  githubUrl: "https://github.com/azaroth-tech",
  metaTitle: "Azaroth Tech-Hive  Enterprise Technology Solutions & Engineering",
  metaDescription: companyInfo.description,
  logoUrl: "",
  themeConfig: defaultTheme,
  modulesConfig: defaultModules,
  chatbotConfig: defaultChatbot,
  headerConfig: {
    ctaText: "Connect With Us",
    ctaLink: "/connect-with-us",
  },
  contactFormConfig: {
    successTitle: "Message Received",
    successMessage:
      "Thank you, {{fullName}}. A solution architect will review your brief and reply within one business day.",
    sendAnotherButtonText: "Send Another Message",
    whatsAppButtonText: "Instant WhatsApp Chat",
    whatsAppNumber: companyInfo.headquarters.whatsapp,
    scopeLabel: "How Can We Help?",
    scopePlaceholder:
      "Brief summary of objectives, systems, or target timeline...",
    attachmentLabel: "Attachments",
    attachmentHint: "PDF, DOCX, XLSX, ZIP Â· max {{maxFileSizeMB}}MB",
    maxFileSizeMB: 15,
    errorBannerText: "Failed to submit enquiry. Please try again.",
    emailDirectLinkText: "Email us directly",
    submitButtonText: "Submit",
    submittingButtonText: "Submitting...",
  },
  primary_color: defaultTheme.primaryColor,
  secondary_color: defaultTheme.secondaryColor,
  accent_color: defaultTheme.accentColor,
  background_color: defaultTheme.backgroundColor,
  headquarters_address: companyInfo.headquarters.address,
  primary_phone: companyInfo.headquarters.phone,
  primary_email: companyInfo.headquarters.email,
  whatsapp_number: companyInfo.headquarters.whatsapp,
  linkedin_url: "https://linkedin.com/company/azaroth-tech-hive",
  copyright_text: "All rights reserved Â© 2026 Azaroth Tech-Hive ",
  footerLayout: "standard",
  footerConfig: {
    layout: "standard",
    brandPrimary: "AZAROTH",
    brandSecondary: "TECH-HIVE",
    followUsTitle: "Follow Us On:",
    showSocialIcons: true,
    linkedinUrl: "https://linkedin.com/company/azaroth-tech-hive",
    twitterUrl: "https://x.com",
    githubUrl: "https://github.com/azaroth-tech",
    showQuickLinks: true,
    quickLinksTitle: "Quick Links",
    showContact: true,
    contactTitle: "Contact Us",
    phone: companyInfo.headquarters.phone,
    email: companyInfo.headquarters.email,
    address: companyInfo.headquarters.address,
    copyrightText: "All rights reserved Â© 2026 Azaroth Tech-Hive ",
    showPrivacyPolicy: true,
    showCookies: true,
  },

  // Comprehensive CMS-driven animation configuration
  animationConfig: {
    global: {
      masterSwitch: true,
      respectReducedMotion: true,
      defaults: {
        duration: 0.6,
        delay: 0,
        easing: [0.22, 1, 0.36, 1],
        scrollTriggerMargin: "-100px",
        viewportOnce: true,
      },
      scrollAnimations: {
        enabled: true,
      },
      hoverAnimations: {
        enabled: true,
      },
      continuousAnimations: {
        enabled: true,
      },
      mobileAnimations: {
        enabled: true,
        simplified: false,
      },
    },
    presets: animationPresets,
    components: [
      {
        componentId: "hero",
        componentName: "Hero Section",
        enabled: true,
        presetId: "fade-up-entrance",
        elements: {
          badges: {
            enabled: true,
            presetId: "hero-badge-float-1",
          },
          metrics: {
            enabled: true,
            presetId: "scale-in-entrance",
          },
        },
      },
      {
        componentId: "about",
        componentName: "About Section",
        enabled: true,
        presetId: "fade-up-entrance",
        elements: {
          image: {
            enabled: true,
            presetId: "fade-up-entrance",
          },
          content: {
            enabled: true,
            presetId: "fade-up-entrance",
          },
        },
      },
      {
        componentId: "services",
        componentName: "Services Section",
        enabled: true,
        presetId: "fade-up-entrance",
        customProperties: {
          stagger: {
            enabled: true,
            delay: 0.1,
          },
        },
      },
      {
        componentId: "products",
        componentName: "Products Section",
        enabled: true,
        presetId: "fade-up-entrance",
        customProperties: {
          stagger: {
            enabled: true,
            delay: 0.1,
          },
        },
      },
      {
        componentId: "process",
        componentName: "Process Section",
        enabled: true,
        presetId: "fade-up-entrance",
        customProperties: {
          stagger: {
            enabled: true,
            delay: 0.1,
          },
          hover: {
            enabled: true,
            type: "lift",
          },
        },
      },
      {
        componentId: "industry",
        componentName: "Industry Section",
        enabled: true,
        presetId: "scale-in-entrance",
        customProperties: {
          stagger: {
            enabled: true,
            delay: 0.15,
          },
        },
      },
      {
        componentId: "insights",
        componentName: "Insights Section",
        enabled: true,
        presetId: "fade-up-entrance",
        customProperties: {
          stagger: {
            enabled: true,
            delay: 0.1,
          },
        },
      },
      {
        componentId: "faq",
        componentName: "FAQ Section",
        enabled: true,
        presetId: "fade-up-entrance",
        customProperties: {
          stagger: {
            enabled: true,
            delay: 0.05,
          },
        },
      },
      {
        componentId: "cta",
        componentName: "CTA Section",
        enabled: true,
        presetId: "fade-up-entrance",
      },
      {
        componentId: "portfolio",
        componentName: "Portfolio Section",
        enabled: true,
        presetId: "fade-up-entrance",
        customProperties: {
          stagger: {
            enabled: true,
            delay: 0.1,
          },
        },
      },
      {
        componentId: "testimonials",
        componentName: "Testimonials Section",
        enabled: true,
        presetId: "fade-up-entrance",
        customProperties: {
          stagger: {
            enabled: true,
            delay: 0.1,
          },
        },
      },
      {
        componentId: "contact",
        componentName: "Contact Section",
        enabled: true,
        presetId: "fade-up-entrance",
      },
      {
        componentId: "reveal",
        componentName: "Scroll Reveal Wrappers",
        enabled: true,
        presetId: "fade-up-entrance",
      },
    ],
    cssKeyframes: {
      fadeInUp: {
        enabled: true,
        keyframes: `from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); }`,
        duration: 0.6,
        timingFunction: "ease-out",
        iterationCount: "1",
      },
      fadeIn: {
        enabled: true,
        keyframes: `from { opacity: 0; } to { opacity: 1; }`,
        duration: 0.5,
        timingFunction: "ease-out",
        iterationCount: "1",
      },
      slideInLeft: {
        enabled: true,
        keyframes: `from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); }`,
        duration: 0.6,
        timingFunction: "ease-out",
        iterationCount: "1",
      },
      slideInRight: {
        enabled: true,
        keyframes: `from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); }`,
        duration: 0.6,
        timingFunction: "ease-out",
        iterationCount: "1",
      },
      scaleIn: {
        enabled: true,
        keyframes: `from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); }`,
        duration: 0.5,
        timingFunction: "ease-out",
        iterationCount: "1",
      },
      slideInUp: {
        enabled: true,
        keyframes: `from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`,
        duration: 0.5,
        timingFunction: "ease-out",
        iterationCount: "1",
      },
      pulseGlow: {
        enabled: true,
        keyframes: `0%, 100% { box-shadow: 0 0 0 0 var(--color-primary-glow); } 50% { box-shadow: 0 0 20px 5px var(--color-primary-glow); }`,
        duration: 2,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      float: {
        enabled: true,
        keyframes: `0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); }`,
        duration: 3,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      rotateSlow: {
        enabled: true,
        keyframes: `from { transform: rotate(0deg); } to { transform: rotate(360deg); }`,
        duration: 20,
        timingFunction: "linear",
        iterationCount: "infinite",
      },
      gradientShift: {
        enabled: true,
        keyframes: `0%, 100% { transform: translateX(0) translateY(0); } 25% { transform: translateX(10px) translateY(-10px); } 50% { transform: translateX(-5px) translateY(-5px); } 75% { transform: translateX(-10px) translateY(10px); }`,
        duration: 4,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      pulseSlow: {
        enabled: true,
        keyframes: `0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 0.4; }`,
        duration: 3,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      floatUpDown: {
        enabled: true,
        keyframes: `0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); }`,
        duration: 3,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      floatLeftRight: {
        enabled: true,
        keyframes: `0%, 100% { transform: translateX(0); } 50% { transform: translateX(20px); }`,
        duration: 3,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      scaleBreath: {
        enabled: true,
        keyframes: `0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); }`,
        duration: 3,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      textShimmer: {
        enabled: true,
        keyframes: `0% { background-position: -200% 0; } 100% { background-position: 200% 0; }`,
        duration: 4,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      fadeInScale: {
        enabled: true,
        keyframes: `from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); }`,
        duration: 0.6,
        timingFunction: "ease-out",
        iterationCount: "1",
      },
      waveFlow: {
        enabled: true,
        keyframes: `0%, 100% { transform: translateX(0); } 50% { transform: translateX(-10px); }`,
        duration: 3,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      orbitFloat: {
        enabled: true,
        keyframes: `0%, 100% { transform: translate(0, 0) scale(1); } 25% { transform: translate(5px, -5px) scale(1.1); } 50% { transform: translate(-5px, 5px) scale(0.9); } 75% { transform: translate(3px, -3px) scale(1.05); }`,
        duration: 4,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      shimmerText: {
        enabled: true,
        keyframes: `0% { background-position: -200% 0; } 100% { background-position: 200% 0; }`,
        duration: 4,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      shimmerPulse: {
        enabled: true,
        keyframes: `0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.02); }`,
        duration: 2,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      shimmer: {
        enabled: true,
        keyframes: `0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; }`,
        duration: 1.5,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
      cursorGradient: {
        enabled: true,
        keyframes: `0% { background-position: 0% 50%; } 25% { background-position: 100% 50%; } 50% { background-position: 100% 100%; } 75% { background-position: 0% 100%; } 100% { background-position: 0% 50%; }`,
        duration: 4,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
    },
    shimmerEffects: {
      shimmerText: {
        enabled: true,
        gradient:
          "linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 25%, var(--color-secondary) 50%, var(--color-warm) 75%, var(--color-primary) 100%)",
        backgroundSize: "200% auto",
        duration: 4,
      },
      shimmerTextWarm: {
        enabled: true,
        gradient:
          "linear-gradient(90deg, var(--color-warm) 0%, var(--color-primary) 25%, var(--color-luxury) 50%, var(--color-primary) 75%, var(--color-warm) 100%)",
        backgroundSize: "200% auto",
        duration: 4,
      },
      shimmerTextPremium: {
        enabled: true,
        gradient:
          "linear-gradient(90deg, var(--color-accent) 0%, var(--color-luxury) 25%, var(--color-secondary) 50%, var(--color-luxury) 75%, var(--color-accent) 100%)",
        backgroundSize: "200% auto",
        duration: 4,
      },
      shimmerLoader: {
        enabled: true,
        gradient:
          "linear-gradient(90deg, var(--color-neutral-200) 0%, var(--color-neutral-100) 50%, var(--color-neutral-200) 100%)",
        backgroundSize: "200% 100%",
        duration: 1.5,
      },
    },
    cursorGradients: {
      cursorGradientIndigoRose: {
        enabled: true,
        gradient:
          "linear-gradient(270deg, #49243F 0%, #49243F 25%, #49243F 50%, #49243F 75%, #49243F 100%)",
        backgroundSize: "200% 200%",
        duration: 4,
      },
      cursorGradientRoseIndigo: {
        enabled: true,
        gradient:
          "linear-gradient(270deg, #49243F 0%, #49243F 25%, #49243F 50%, #49243F 75%, #49243F 100%)",
        backgroundSize: "200% 200%",
        duration: 5,
      },
      cursorGradientVioletCoral: {
        enabled: true,
        gradient:
          "linear-gradient(270deg, #49243F 0%, #49243F 25%, #49243F 50%, #49243F 75%, #49243F 100%)",
        backgroundSize: "200% 200%",
        duration: 6,
      },
    },
  },

  // Global color configuration
  colorConfig: {
    hero: {
      badges: [
        {
          id: "badge-1",
          iconColor: "#7C3AED",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          borderColor: "rgba(226, 232, 240, 0.9)",
          textColor: "#1E293B",
          hoverIconColor: "#6D28D9",
          hoverBackgroundColor: "#FFFFFF",
          hoverBorderColor: "#7C3AED",
          hoverShadow: "0 16px 32px -4px rgba(124, 58, 237, 0.25)",
        },
        {
          id: "badge-2",
          iconColor: "#0D9488",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          borderColor: "rgba(226, 232, 240, 0.9)",
          textColor: "#1E293B",
          hoverIconColor: "#0F766E",
          hoverBackgroundColor: "#FFFFFF",
          hoverBorderColor: "#0D9488",
          hoverShadow: "0 16px 32px -4px rgba(13, 148, 136, 0.25)",
        },
        {
          id: "badge-3",
          iconColor: "#0284C7",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          borderColor: "rgba(226, 232, 240, 0.9)",
          textColor: "#1E293B",
          hoverIconColor: "#0369A1",
          hoverBackgroundColor: "#FFFFFF",
          hoverBorderColor: "#0284C7",
          hoverShadow: "0 16px 32px -4px rgba(2, 132, 199, 0.25)",
        },
        {
          id: "badge-4",
          iconColor: "#49243F",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          borderColor: "rgba(226, 232, 240, 0.9)",
          textColor: "#1E293B",
          hoverIconColor: "#35182E",
          hoverBackgroundColor: "#FFFFFF",
          hoverBorderColor: "#49243F",
          hoverShadow: "0 16px 32px -4px rgba(73, 36, 63, 0.25)",
        },
        {
          id: "badge-5",
          iconColor: "#06B6D4",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          borderColor: "rgba(226, 232, 240, 0.9)",
          textColor: "#1E293B",
          hoverIconColor: "#0891B2",
          hoverBackgroundColor: "#FFFFFF",
          hoverBorderColor: "#06B6D4",
          hoverShadow: "0 16px 32px -4px rgba(6, 182, 212, 0.25)",
        },
      ],
      traces: [
        {
          id: "trace-1",
          gradientStart: "#7C3AED",
          gradientEnd: "#7C3AED",
          startOpacity: 0.7,
          endOpacity: 0.1,
        },
        {
          id: "trace-2",
          gradientStart: "#0D9488",
          gradientEnd: "#0D9488",
          startOpacity: 0.7,
          endOpacity: 0.1,
        },
        {
          id: "trace-3",
          gradientStart: "#0284C7",
          gradientEnd: "#0284C7",
          startOpacity: 0.7,
          endOpacity: 0.1,
        },
        {
          id: "trace-4",
          gradientStart: "#49243F",
          gradientEnd: "#49243F",
          startOpacity: 0.7,
          endOpacity: 0.1,
        },
        {
          id: "trace-5",
          gradientStart: "#06B6D4",
          gradientEnd: "#06B6D4",
          startOpacity: 0.7,
          endOpacity: 0.1,
        },
      ],
      metrics: [
        {
          id: "metric-1",
          iconColor: "#7C3AED",
          backgroundColor: "#EDE9FE",
          textColor: "#1E293B",
          labelColor: "#64748B",
        },
        {
          id: "metric-2",
          iconColor: "#059669",
          backgroundColor: "#D1FAE5",
          textColor: "#1E293B",
          labelColor: "#64748B",
        },
        {
          id: "metric-3",
          iconColor: "#49243F",
          backgroundColor: "#FFF1F2",
          textColor: "#1E293B",
          labelColor: "#64748B",
        },
        {
          id: "metric-4",
          iconColor: "#0878E8",
          backgroundColor: "#E0F2FE",
          textColor: "#1E293B",
          labelColor: "#64748B",
        },
      ],
    },
    cards: {
      default: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        shadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
        hoverBackgroundColor: "#FFFFFF",
        hoverBorderColor: "#49243F",
        hoverShadow: "0 12px 24px -8px rgba(38, 48, 59, 0.12)",
      },
      glass: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropBlur: "12px",
        borderColor: "rgba(226, 232, 240, 0.9)",
      },
    },
    buttons: {
      primary: {
        gradient:
          "linear-gradient(110deg, #49243F 0%, #8A315D 55%, #C04472 100%)",
        gradientHover:
          "linear-gradient(110deg, #35182E 0%, #49243F 55%, #8A315D 100%)",
        textColor: "#FFFFFF",
        shadow: "0 4px 16px -2px rgba(73, 36, 63, 0.4)",
        hoverShadow: "0 8px 30px rgba(73, 36, 63, 0.55)",
      },
      secondary: {
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        borderColor: "rgba(255, 255, 255, 0.32)",
        textColor: "#FFFFFF",
        hoverBackgroundColor: "rgba(255, 255, 255, 0.25)",
      },
    },
    badges: {
      gold: {
        backgroundColor: "rgba(73, 36, 63, 0.12)",
        textColor: "#49243F",
        borderColor: "rgba(73, 36, 63, 0.25)",
      },
      violet: {
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        textColor: "#7C3AED",
      },
    },
  },
};

const defaultNavigation: NavigationItem[] = [
  { id: "nav-1", label: "Home", path: "/", order: 1, isVisible: true },
  {
    id: "nav-2",
    label: "Who we are",
    path: "/about",
    order: 2,
    isVisible: true,
    children: [
      {
        id: "nav-2-1",
        label: "About Us",
        path: "/about#about-us",
        order: 1,
        isVisible: true,
      },
      {
        id: "nav-2-2",
        label: "Our Values",
        path: "/about#our-values",
        order: 2,
        isVisible: true,
      },
      {
        id: "nav-2-3",
        label: "Delivery Framework",
        path: "/about#delivery-framework",
        order: 3,
        isVisible: true,
      },
    ],
  },
  {
    id: "nav-3",
    label: "Our Portfolio",
    path: "/portfolio",
    order: 3,
    isVisible: true,
    children: [
      {
        id: "nav-3-1",
        label: "Explore Products",
        path: "/portfolio#products",
        order: 1,
        isVisible: true,
      },
      {
        id: "nav-3-2",
        label: "Explore Services",
        path: "/portfolio#services",
        order: 2,
        isVisible: true,
      },
    ],
  },
  {
    id: "nav-4",
    label: "Resource Hub",
    path: "/resource-hub",
    order: 4,
    isVisible: true,
  },
  {
    id: "nav-5",
    label: "Testimonials",
    path: "/testimonials",
    order: 5,
    isVisible: true,
  },
  {
    id: "nav-6",
    label: "Connect With Us",
    path: "/connect-with-us",
    order: 6,
    isVisible: true,
  },
];

export const defaultPortfolio: CmsPortfolio[] = [
  {
    id: "port-fms",
    name: "FMS - Financial Management System",
    slug: "fms",
    clientName: "Enterprise Finance Division",
    clientType: "Enterprise",
    industry: "FinTech & Banking",
    category: "Enterprise Platform",
    summary:
      "Streamlines general ledger, automated reconciliation, real-time treasury analytics, and multi-entity compliance reporting.",
    challenge:
      "Fragmented multi-entity accounting systems created delayed month-end closes and manual reconciliation bottlenecks.",
    solution:
      "Engineered a cloud-native, double-entry financial engine with automated bank feeds, audit trails, and real-time cashflow dashboards.",
    outcomes: [
      "99.99% transaction ledger accuracy",
      "65% faster monthly financial close",
      "Real-time multi-currency consolidation",
    ],
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
    order: 1,
    heroCtaPrimaryText: "Discuss a Similar Engagement",
    heroCtaPrimaryLink: "/connect-with-us",
    heroCtaSecondaryText: "Request Technical Architecture Review",
    heroCtaSecondaryLink: "/connect-with-us",
    challengeSectionTitle: "The Challenge",
    solutionSectionTitle: "The Engineered Solution",
    outcomesSectionTitle: "Measurable Technical Outcomes",
    techStackSectionTitle: "Technology Stack & Tools",
    notFoundTitle: "Case Study Not Found",
    notFoundDescription:
      "The requested enterprise case study or project specification does not exist.",
    notFoundButtonText: "Back to Portfolio Directory",
    notFoundButtonLink: "/portfolio",
  },
  {
    id: "port-lms",
    name: "LMS - Learning Management System",
    slug: "lms",
    clientName: "Global EdTech & Corporate L&D",
    clientType: "Enterprise",
    industry: "Education & Corporate Training",
    category: "Cloud SaaS",
    summary:
      "Empowers organizations to author interactive courses, automate certification tracks, and measure learner competency at scale.",
    challenge:
      "Legacy training portals suffered from low learner engagement and lacked real-time compliance tracking across distributed teams.",
    solution:
      "Built an interactive, mobile-responsive learning platform with adaptive assessment engines and automated certification workflows.",
    outcomes: [
      "3x increase in course completion rates",
      "Automated compliance certification tracking",
      "Zero-buffering adaptive video delivery",
    ],
    technologies: ["React", "Node.js", "PostgreSQL", "Cloud CDN"],
    coverImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
    order: 2,
  },
  {
    id: "port-mems",
    name: "MEMS -My Event Management Software",
    slug: "mems",
    clientName: "Enterprise Events & Summits",
    clientType: "Enterprise",
    industry: "Hospitality & Events",
    category: "Event Tech",
    summary:
      "End-to-end event lifecycle orchestration covering ticketing, dynamic floorplans, QR check-ins, and live attendee engagement.",
    challenge:
      "High-volume conferences faced check-in queues, fragmented vendor coordination, and disconnected attendee analytics.",
    solution:
      "Delivered a unified event command center with instant QR badge scanning, sponsor lead capture, and live venue telemetry.",
    outcomes: [
      "Under 3-second QR attendee check-in",
      "Unified vendor & stage scheduling",
      "Real-time sponsor ROI analytics",
    ],
    technologies: ["React", "TypeScript", "WebSockets", "PostgreSQL"],
    coverImage:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
    order: 3,
  },
  {
    id: "port-custom",
    name: "Custom Enterprise Architecture",
    slug: "custom-architecture",
    clientName: "Global Enterprise Partners",
    clientType: "Enterprise",
    industry: "Cross-Industry",
    category: "Bespoke Engineering",
    summary:
      "Tailor-made microservices, legacy modernization, and high-throughput API ecosystems engineered for mission-critical reliability.",
    challenge:
      "Monolithic legacy applications limited release velocity and struggled under peak seasonal transaction loads.",
    solution:
      "Executed zero-downtime strangler-fig modernization into containerized microservices with automated CI/CD quality gates.",
    outcomes: [
      "99.99% high-availability SLA",
      "4x faster deployment cadence",
      "Zero-lockin cloud-native architecture",
    ],
    technologies: ["Kubernetes", "TypeScript", "Go", "PostgreSQL"],
    coverImage:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
    order: 4,
  },
];

export const defaultPages: Record<string, any> = {
  home: {
    hero: {
      title: "Intelligence Engineered",
      titleHighlight: "Innovation Unleashed.",
      subtitle:
        "We transform complex challenges into reliable, high-performing digital products. From custom enterprise platforms to intelligent automation, we build technology that moves your business forward.",
      primaryCtaText: "Explore Services",
      primaryCtaLink: "/portfolio#services",
      secondaryCtaText: "Explore Our Portfolio",
      secondaryCtaLink: "/portfolio",
      imageUrl: "",
      imageAlt: "Azaroth Tech-Hive Enterprise Engineering Workspace",
      imageFit: "cover",
      stats: [
        { label: "Quality-Driven Delivery", value: "99.9%" },
        { label: "Core Software Platforms", value: "3+" },
        { label: "Service Offerings", value: "4+" },
        { label: "End-to-End Engineering", value: "24/7" },
      ],
      // Floating badges configuration (CMS-driven)
      floatingBadges: [
        {
          id: "badge-1",
          text: "Web Development",
          iconName: "Code2",
          position: { top: "-1.5rem", left: "2%" },
          zIndex: 4,
          maxWidth: "45vw",
          animation: {
            enabled: true,
            type: "heroBadgeFloat1",
            duration: 4.5,
            delay: 0,
            easing: "ease-in-out",
            iterations: "infinite",
          },
          hoverAnimation: {
            enabled: true,
            type: "scaleAndLift",
            scale: 1.06,
            translateY: -4,
            duration: 0.25,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          },
          colors: {
            useGlobal: true,
            iconColor: "#7C3AED",
            backgroundColor: "rgba(255, 255, 255, 0.96)",
            borderColor: "rgba(226, 232, 240, 0.9)",
            textColor: "#1E293B",
          },
          isVisible: true,
          responsive: {
            tablet: { top: "-1.25rem", left: "2%" },
            mobile: { top: "-0.5rem", left: "1%" },
            hideBelow: 640,
          },
        },
        {
          id: "badge-2",
          text: "Mobile Apps",
          iconName: "Smartphone",
          position: { top: "-3.25rem", left: "34%" },
          zIndex: 4,
          maxWidth: "40vw",
          animation: {
            enabled: true,
            type: "heroBadgeFloat2",
            duration: 5,
            delay: 0.6,
            easing: "ease-in-out",
            iterations: "infinite",
          },
          hoverAnimation: {
            enabled: true,
            type: "scaleAndLift",
            scale: 1.06,
            translateY: -4,
            duration: 0.25,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          },
          colors: {
            useGlobal: true,
            iconColor: "#0D9488",
            backgroundColor: "rgba(255, 255, 255, 0.96)",
            borderColor: "rgba(226, 232, 240, 0.9)",
            textColor: "#1E293B",
          },
          isVisible: true,
          responsive: {
            tablet: { top: "-2.5rem", left: "34%" },
            mobile: { top: "-0.25rem", left: "30%" },
            hideBelow: 640,
          },
        },
        {
          id: "badge-3",
          text: "Cloud Solutions",
          iconName: "Cloud",
          position: { top: "-1.5rem", right: "2%" },
          zIndex: 4,
          maxWidth: "40vw",
          animation: {
            enabled: true,
            type: "heroBadgeFloat3",
            duration: 4.2,
            delay: 1.2,
            easing: "ease-in-out",
            iterations: "infinite",
          },
          hoverAnimation: {
            enabled: true,
            type: "scaleAndLift",
            scale: 1.06,
            translateY: -4,
            duration: 0.25,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          },
          colors: {
            useGlobal: true,
            iconColor: "#0284C7",
            backgroundColor: "rgba(255, 255, 255, 0.96)",
            borderColor: "rgba(226, 232, 240, 0.9)",
            textColor: "#1E293B",
          },
          isVisible: true,
          responsive: {
            tablet: { top: "-1.25rem", right: "2%" },
            mobile: { top: "-0.5rem", right: "1%" },
            hideBelow: 640,
          },
        },
        {
          id: "badge-4",
          text: "UI/UX Design",
          iconName: "PenTool",
          position: { top: "28%", right: "-1.25rem" },
          zIndex: 4,
          maxWidth: "45vw",
          animation: {
            enabled: true,
            type: "heroBadgeFloat1",
            duration: 4.8,
            delay: 1.8,
            easing: "ease-in-out",
            iterations: "infinite",
          },
          hoverAnimation: {
            enabled: true,
            type: "scaleAndLift",
            scale: 1.06,
            translateY: -4,
            duration: 0.25,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          },
          colors: {
            useGlobal: true,
            iconColor: "#49243F",
            backgroundColor: "rgba(255, 255, 255, 0.96)",
            borderColor: "rgba(226, 232, 240, 0.9)",
            textColor: "#1E293B",
          },
          isVisible: true,
          responsive: {
            tablet: { top: "26%", right: "-0.25rem" },
            mobile: { top: "20%", right: "0.25rem" },
            hideBelow: 640,
          },
        },
        {
          id: "badge-5",
          text: "Analytics",
          iconName: "BarChart3",
          position: { top: "65%", right: "-0.75rem" },
          zIndex: 4,
          maxWidth: "45vw",
          animation: {
            enabled: true,
            type: "heroBadgeFloat2",
            duration: 4.4,
            delay: 2.2,
            easing: "ease-in-out",
            iterations: "infinite",
          },
          hoverAnimation: {
            enabled: true,
            type: "scaleAndLift",
            scale: 1.06,
            translateY: -4,
            duration: 0.25,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          },
          colors: {
            useGlobal: true,
            iconColor: "#06B6D4",
            backgroundColor: "rgba(255, 255, 255, 0.96)",
            borderColor: "rgba(226, 232, 240, 0.9)",
            textColor: "#1E293B",
          },
          isVisible: true,
          responsive: {
            tablet: { top: "62%", right: "-0.25rem" },
            mobile: { top: "58%", right: "0.25rem" },
            hideBelow: 640,
          },
        },
      ],
      // SVG traces configuration
      tracesEnabled: true,
      traces: [
        {
          id: "trace-1",
          path: "M 120 10 Q 150 70 240 160",
          gradientId: "trace1",
          gradientStops: [
            { offset: "0%", color: "#7C3AED", opacity: 0.7 },
            { offset: "100%", color: "#7C3AED", opacity: 0.1 },
          ],
          strokeWidth: 1.5,
          strokeDashArray: "4 4",
          isVisible: true,
          animation: {
            enabled: false,
          },
          colors: {
            useGlobal: true,
          },
        },
        {
          id: "trace-2",
          path: "M 280 15 Q 280 80 320 160",
          gradientId: "trace2",
          gradientStops: [
            { offset: "0%", color: "#0D9488", opacity: 0.7 },
            { offset: "100%", color: "#0D9488", opacity: 0.1 },
          ],
          strokeWidth: 1.5,
          strokeDashArray: "4 4",
          isVisible: true,
          animation: {
            enabled: false,
          },
          colors: {
            useGlobal: true,
          },
        },
        {
          id: "trace-3",
          path: "M 440 20 Q 400 80 360 160",
          gradientId: "trace3",
          gradientStops: [
            { offset: "0%", color: "#0284C7", opacity: 0.7 },
            { offset: "100%", color: "#0284C7", opacity: 0.1 },
          ],
          strokeWidth: 1.5,
          strokeDashArray: "4 4",
          isVisible: true,
          animation: {
            enabled: false,
          },
          colors: {
            useGlobal: true,
          },
        },
        {
          id: "trace-4",
          path: "M 500 120 Q 450 150 380 180",
          gradientId: "trace4",
          gradientStops: [
            { offset: "0%", color: "#49243F", opacity: 0.7 },
            { offset: "100%", color: "#49243F", opacity: 0.1 },
          ],
          strokeWidth: 1.5,
          strokeDashArray: "4 4",
          isVisible: true,
          animation: {
            enabled: false,
          },
          colors: {
            useGlobal: true,
          },
        },
        {
          id: "trace-5",
          path: "M 510 265 Q 460 250 390 230",
          gradientId: "trace5",
          gradientStops: [
            { offset: "0%", color: "#06B6D4", opacity: 0.7 },
            { offset: "100%", color: "#06B6D4", opacity: 0.1 },
          ],
          strokeWidth: 1.5,
          strokeDashArray: "4 4",
          isVisible: true,
          animation: {
            enabled: false,
          },
          colors: {
            useGlobal: true,
          },
        },
      ],
      // Animation settings
      animation: {
        enabled: true,
        badgeAnimationEnabled: true,
        traceAnimationEnabled: true,
        metricsAnimationEnabled: true,
      },
    },
    aboutSection: {
      badge: "Who We Are",
      title: "Turning Ideas into",
      titleHighlight: "Digital Reality",
      description:
        "Azaroth Tech-Hive delivers practical software solutions that help businesses simplify operations, improve efficiency, and turn ideas into dependable digital products.",
      description2:
        "With expertise in custom software development, enterprise applications, and cloud-ready systems, we bring your vision to life  one line of clean, tested code at a time.",
      imageUrl: "",
      imageAlt: "Azaroth Tech-Hive Engineering Team",
    },
    servicesSection: {
      badge: "Our Services",
      title: "From Innovation to Excellence",
      titleHighlight: "Your Technology Growth Partner",
      subtitle:
        "We offer end-to-end software development and consulting services, helping businesses plan, build, modernise, and maintain reliable digital systems.",
      ctaText: "Explore All Services",
      ctaLink: "/portfolio#services",
    },
    productsSection: {
      badge: "Our Software Platforms",
      title: "Enterprise",
      titleHighlight: "Software Solutions",
      subtitle:
        "Purpose-built software platforms designed to help organisations manage finances, deliver training, and coordinate events with clarity and control.",
      ctaText: "View All Products",
      ctaLink: "/portfolio#products",
    },
    featuredProjectsSection: {
      badge: "Featured Projects",
      title: "Featured",
      titleHighlight: "Projects",
      subtitle:
        "Explore our core software platforms and engineering capabilities through an interactive showcase.",
      slides: [
        {
          id: "fms",
          title: "FMS - Financial Management System",
          categories: ["Enterprise Platform", "FinTech", "Cloud Architecture"],
          description:
            "Streamlines general ledger, automated reconciliation, real-time treasury analytics, and multi-entity compliance reporting.",
          link: "/products/fms",
          image:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=85",
        },
        {
          id: "lms",
          title: "LMS - Learning Management System",
          categories: ["EdTech Platform", "Cloud SaaS", "Analytics"],
          description:
            "Empowers organizations to author interactive courses, automate certification tracks, and measure learner competency at scale.",
          link: "/products/lms",
          image:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85",
        },
        {
          id: "mems",
          title: "MEMS -My Event Management Software",
          categories: ["Event Tech", "Real-Time Operations", "Mobile Ready"],
          description:
            "End-to-end event lifecycle orchestration covering ticketing, dynamic floorplans, QR check-ins, and live attendee engagement.",
          link: "/products/mems",
          image:
            "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=85",
        },
        {
          id: "custom",
          title: "Custom Enterprise Architecture",
          categories: ["Dedicated Pods", "System Integration", "Cloud Native"],
          description:
            "Tailor-made microservices, legacy modernization, and high-throughput API ecosystems engineered for mission-critical reliability.",
          link: "/portfolio#services",
          image:
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=85",
        },
      ],
    },
    industrySection: {
      badge: "Industry Expertise",
      title: "Engineered for",
      titleHighlight: "Complex Industries",
      subtitle:
        "Software solutions tailored to the operational, regulatory, and scalability demands of key business sectors.",
      industries: industryExpertiseData,
    },
    insightsSection: {
      badge: "Resource Hub",
      title: "Practical",
      titleHighlight: "Engineering Insight",
      subtitle:
        "Articles and guides from our team on software architecture, cloud infrastructure, and practical engineering delivery.",
      ctaText: "Browse All Articles",
      ctaLink: "/resource-hub",
    },
    faqSection: {
      badge: "Frequently Asked Questions",
      title: "Clear Answers to",
      titleHighlight: "Common Questions",
      subtitle:
        "Everything you need to know about our software platforms, engineering services, and how we work with clients.",
      consultationCard: {
        badge: "Direct Technical Consultation",
        title: "Have a Specific Project in Mind?",
        description:
          "Connect directly with our technical team to discuss your requirements, evaluate architecture options, or request a product walkthrough.",
        perks: [
          "Response within 1 business day",
          "NDA available on request",
          "Direct discussion with our technical team",
        ],
        ctaText: "Schedule a Consultation",
        ctaLink: "/connect-with-us",
      },
      faqs: [
        {
          question:
            "How do we get started with a custom software project or product demo?",
          answer:
            "You can reach out through our Connect With Us page or email us directly. We start with an initial discovery conversation to understand your goals, review technical requirements, and recommend either a product walkthrough (for FMS, LMS, or MEMS) or a tailored project proposal.",
        },
        {
          question:
            "Can your software products (FMS, LMS, MEMS) be customised for our organisation?",
          answer:
            "Yes. Each of our platforms is built with a modular architecture that supports workflow configuration, custom branding, role-based access rules, and integration with your existing ERP, HR, or accounting systems.",
        },
        {
          question:
            "How do you handle legacy system modernisation without disrupting daily operations?",
          answer:
            "We use a phased migration approach. Rather than replacing everything at once, we introduce modern modules and API layers alongside your current system, validate data integrity at each step, and transition users gradually to minimise operational risk.",
        },
        {
          question: "What technologies and cloud platforms do you work with?",
          answer:
            "Our engineering team works with modern web and enterprise stacks including React, TypeScript, Node.js, Python, and relational databases such as PostgreSQL, deployed across AWS, Azure, Google Cloud, or private on-premise environments.",
        },
        {
          question:
            "Who owns the source code and intellectual property for custom development?",
          answer:
            "For custom software development engagements, full ownership of the bespoke source code, documentation, and deliverables transfers to your organisation in accordance with our project agreement. We also gladly sign mutual NDAs before any technical discovery.",
        },
        {
          question:
            "Do you provide ongoing maintenance and support after launch?",
          answer:
            "Yes. We offer post-launch support, system monitoring, security updates, and iterative feature enhancements so your software continues to perform reliably as your business grows.",
        },
      ],
    },
    finalCta: {
      title: "Ready to Build Your",
      titleHighlight: "Next Digital Solution?",
      subtitle:
        "Partner with Azaroth Tech-Hive to modernise your systems, deploy our enterprise platforms, or build custom software tailored to your business.",
      primaryCtaText: "Get a Free Consultation",
      primaryCtaLink: "/connect-with-us",
      secondaryCtaText: "Explore Products",
      secondaryCtaLink: "/portfolio#products",
    },
  },
  about: {
    kicker: "- WHO WE ARE -",
    badge: "Who We Are",
    heroTitle: "Engineering Meaningful Solutions Building Lasting Value",
    heroSubtitle:
      "At Azaroth Techhive, we are passionate about technology and driven by a simple goal to help businesses build smarter, stronger and more innovative digital solutions with a client-first approach.",
    heroDescription:
      "At Azaroth Techhive, we are passionate about technology and driven by a simple goal to help businesses build smarter, stronger and more innovative digital solutions with a client-first approach.",
    storyBadge: " OUR STORY ",
    storyTitle: "Turning Ideas into Digital Reality",
    storyImage: "",
    storyImageAlt: "Azaroth Tech-Hive workspace",
    storyParagraph1:
      "Azaroth Techhive delivers practical software engineering solutions that help businesses overcome complex technical bottlenecks, modernise legacy operations, and turn high-stakes ideas into dependable digital products.",
    storyParagraph2:
      "With dedicated engineering pods, cloud modernisation, and custom application development, we bring your vision to life, one line of clean, tested code at a time.",
    vision: companyVisionMission.vision,
    mission: companyVisionMission.mission,
    pillars: [
      {
        title: "Disciplined",
        description: "Principled Design",
      },
      {
        title: "Tested Quality",
        description: "Rigorous Verification",
      },
      {
        title: "True Partnership",
        description: "Transparent Delivery",
      },
    ],
  },
  values: {
    badge: " CORE VALUES ",
    heroTitle: "Our Core Values",
    heroDescription:
      "The principles that guide how we think, engineer, collaborate, and deliver.",
    values: ourValuesPrinciples,
  },
  "delivery-framework": {
    badge: " DISCIPLINED METHODOLOGY ",
    heroTitle: "A Clear Path from Idea to Impact",
    heroDescription:
      "A structured, collaborative approach that brings clarity to every stage of software development, ensuring solutions remain aligned with project goals, built on sound engineering practices, and adaptable to evolving needs.",
    stages: deliveryStages,
    phases: deliveryStages.map((s) => ({
      phase: `0${s.stageNumber}`,
      title: s.title,
      description: s.description,
    })),
  },
  products: {
    kicker: "- OUR PRODUCTS -",
    heroTitle: "Our Products & Platform Foundations",
    heroSubtitle:
      "Four platforms in active development, each available for scoped early builds. They give your teams a practical starting point for the roadmap while keeping scope, branding, and operational ownership clear.",
    seoTitle:
      "Enterprise Software Platforms  Fitness, E-Commerce, Healthcare & Learning Management",
    seoDescription:
      "Enterprise software platforms in active development: Fitness Management System, Multi-Store E-Commerce, Healthcare Management System, and Learning Management Platform  available for scoped early builds, fully customizable with complete source ownership.",
    seoCanonicalPath: "/products",
  },
  services: {
    kicker: "Our Services",
    heroTitle: "Engineering Services Built Around",
    heroTitleHighlight: "Your Business Goals.",
    heroSubtitle:
      "Four focused practices covering digital transformation, strategic consulting, on-demand engineering teams, and process automation. Each engagement begins with a clear problem statement, an agreed scope, and a practical delivery plan.",
    heroNote:
      "Scope, deliverables, and commercial terms are agreed in writing before work begins.",
    practicesTitle: "Four focused ways we can help",
    practicesSubtitle:
      "Each practice has its own scope, deliverables, and intended outcomes. Review the details below, then start a conversation about the one that matches your situation.",
    domainsTitle: "Where our engineering applies",
    domainsSubtitle:
      "Our platforms and practices are shaped around the operational realities of these domains. Each area has its own constraints, data considerations, and delivery expectations.",
    nextStepsTitle: "A clear path from first message to next step",
    nextStepsSubtitle:
      "You do not need a complete specification to start. Share what you know, and we will help you frame the decision.",
    // SEO fields
    seoTitle:
      "Enterprise Software Engineering Services  Full-Stack, Cloud, Mobile & Consulting",
    seoDescription:
      "Four focused engineering practices: full-stack web development, native & cross-platform mobile apps, cloud & DevOps solutions, and strategic consulting. Scoped engagements with clear deliverables.",
    seoCanonicalPath: "/services",
    // Practice card fields
    startWithText: "Start with where you are",
    startWithSubtitle:
      "Choose the situation that sounds closest to yours. Each one leads to the practice built for it.",
    practicesKicker: "Our Practices",
    domainsKicker: "Domains",
    nextStepsKicker: "What Happens Next",
    practiceBestForLabel: "Best for",
    practiceCtaText: "Discuss This Service",
    domainChallengeLabel: "Challenge",
    domainApproachLabel: "Our approach",
  },
  portfolio: {
    kicker: " OUR PORTFOLIO ",
    heroTitle: "Platforms & Engineering Capabilities",
    heroSubtitle:
      "Explore our purpose-built software products and end-to-end engineering services.",
    snapshotBadge: " PORTFOLIO SNAPSHOT ",
    snapshotTitle: "Purpose-Built Platforms &",
    snapshotTitleHighlight: "Custom Engineering",
    snapshotDescription:
      "Whether you are adopting one of our ready-to-deploy software products or partnering with our team for custom application development, every solution is built for clarity, security, and long-term maintainability.",
    snapshotNote:
      "We work closely with your stakeholders from initial discovery through deployment and ongoing support.",
    productsBadge: " READY-TO-DEPLOY PLATFORMS ",
    productsTitle: "Software Products & Platforms",
    productsSubtitle:
      "Three flagship platforms engineered for financial governance, organisational learning, and end-to-end event management.",
    servicesBadge: " END-TO-END ENGINEERING ",
    servicesTitle: "Enterprise Engineering Services",
    servicesSubtitle:
      "Tailored software engineering, cloud modernisation, and technical consulting services designed around your operational goals.",
    // SEO fields
    seoTitle: "Enterprise Case Studies & Client Portfolio  Azaroth Tech-Hive",
    seoDescription:
      "Explore enterprise case studies and project portfolios from Azaroth Tech-Hive. Real-world software engineering outcomes across fintech, education, events, and custom enterprise architecture.",
    seoCanonicalPath: "/portfolio",
    // List page fields
    exploreMoreText: "Explore More",
    requestDemoText: "Request a Demo",
    getStartedText: "Get Started",
    snapshotLabel: "Portfolio at a glance",
    snapshotSubtitle: "Reflecting our current platform and service catalog.",
  },
  insights: {
    kicker: " RESOURCE HUB ",
    heroTitle: "Practical Insights on Software & Architecture",
    heroSubtitle:
      "Articles, guides, and perspectives from our engineering team on building, modernising, and operating dependable business software.",
    // SEO fields
    seoTitle:
      "Resource Hub  Engineering Insights & Publications | Azaroth Tech-Hive",
    seoDescription:
      "Browse engineering insights on system architecture, enterprise AI, and cloud modernization, with practical technical guidance from the Azaroth Tech-Hive team.",
    seoCanonicalPath: "/resource-hub",
  },
  testimonials: {
    kicker: " CLIENT TESTIMONIALS ",
    heroTitle: "Trusted by Forward-Thinking Organisations",
    heroSubtitle:
      "Read what business and technology leaders say about partnering with Azaroth Tech-Hive on mission-critical software initiatives.",
    sectionBadge: "CLIENT TESTIMONIALS ",
    sectionTitle: "What Our Clients",
    sectionTitleHighlight: "Say",
    sectionSubtitle:
      "Real feedback from enterprise leaders, founders, and technology executives who trust Azaroth Tech-Hive to architect and build their software platforms.",
    // SEO fields
    seoTitle:
      "Client Testimonials  Enterprise Engineering Endorsements | Azaroth Tech-Hive",
    seoDescription:
      "Read verified client testimonials and executive endorsements from enterprises that partner with Azaroth Tech-Hive for software engineering, architecture modernization, and dedicated engineering pods.",
    seoCanonicalPath: "/testimonials",
  },
  connect: {
    kicker: "CONNECT WITH US ",
    heroTitle: "Start a Conversation With Our Team",
    heroSubtitle:
      "Have a software project in mind, need a product walkthrough, or want to discuss your technical roadmap? Tell us about your goals and we will get back to you within one business day.",
    officeHeading: "Headquarters",
    faqHeading: "Frequently Asked Questions",
    // SEO fields
    seoTitle: "Connect With Us  Azaroth Tech-Hive",
    seoDescription:
      "Contact Azaroth Tech-Hive by phone, WhatsApp, or email from our Chennai office, or submit project inquiries through the online contact form.",
    seoCanonicalPath: "/connect-with-us",
    formColumns: DEFAULT_CONTACT_FORM_COLUMNS,
    submitBtnText: "Submit",
    submittingBtnText: "Submitting...",
    submitBtnWidth: "full",
    submitBtnIcon: "Send",
    faqs: [
      {
        question: "How quickly will I hear back?",
        answer:
          "Every enquiry is reviewed by a solution architect, not a sales queue. We reply within one business day with next steps or a short list of clarifying questions.",
      },
      {
        question: "What happens after I submit the form?",
        answer:
          "We schedule a 30-minute discovery call to understand your goals, systems, and constraints. From there you receive a scoped recommendation with timelines and an indicative budget.",
      },
      {
        question: "Can we sign an NDA before sharing details?",
        answer:
          "Yes. We can execute a mutual NDA before any technical discovery. Everything shared with us is treated as confidential by default.",
      },
      {
        question: "Can I attach an RFP or architecture document?",
        answer:
          "Yes. Use the supporting documents field for RFPs, RFQs, architecture diagrams, or specifications. Accepted formats are PDF, DOCX, XLSX, PNG, JPG, and ZIP up to 15 MB per file.",
      },
      {
        question: "Do you work with clients outside India?",
        answer:
          "Yes. Our delivery hub is in Chennai and we partner with teams worldwide. Discovery, architecture reviews, and sprint ceremonies run remotely across time zones.",
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    effectiveDate: "October 16, 2026",
    contactEmail: "azarothtech@gmail.com",
    introduction:
      "Azaroth Tech-Hive is dedicated to protecting the privacy and personal data of our website visitors, clients, and partners. This policy outlines how we collect, process, and safeguard information.",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "We collect information you directly provide to us through contact forms and consultation enquiries, including your full name, work email address, telephone number, company name, and project requirements.",
      },
      {
        heading: "2. How We Use Your Information",
        body: "We use the collected information solely to respond to your technical inquiries, prepare proposals, deliver contracted software services, and fulfill our contractual obligations. We never sell your personal data.",
      },
      {
        heading: "3. Data Retention & Security Controls",
        body: "All data is stored in encrypted databases utilizing industry-standard TLS encryption in transit and AES-256 at rest. Access is strictly limited to authorized administrative personnel.",
      },
      {
        heading: "4. Your Rights (GDPR & International Laws)",
        body: "You retain the right to request access to, rectification of, or erasure of your personal data stored within our systems. Contact our privacy team at azarothtech@gmail.com for all requests.",
      },
    ],
  },
  "terms-of-service": {
    title: "Terms of Service",
    effectiveDate: "October 16, 2026",
    governingLaw: "Chennai, Tamil Nadu, India",
    introduction:
      "These Terms of Service govern your use of the Azaroth Tech-Hive website, platforms, and software engineering consulting services.",
    sections: [
      {
        heading: "1. Intellectual Property & Ownership",
        body: "All client deliverables and custom software developed under formal Statement of Work (SOW) agreements are transferred entirely to the client upon full payment. Azaroth proprietary framework tools remain property of Azaroth Tech-Hive under non-exclusive licenses.",
      },
      {
        heading: "2. Confidentiality & Non-Disclosure",
        body: "Both parties agree to hold all proprietary trade secrets, architecture designs, business requirements, and client data in strict confidence under binding non-disclosure commitments.",
      },
      {
        heading: "3. Limitation of Liability",
        body: "In no event shall Azaroth Tech-Hive be liable for indirect, incidental, or consequential damages exceeding the fees actually paid for the specific engineering phase in dispute.",
      },
      {
        heading: "4. Dispute Resolution & Jurisdiction",
        body: "These Terms are governed by the laws of India. Any legal dispute shall be subject to the exclusive jurisdiction of the competent courts in Chennai, Tamil Nadu, India.",
      },
    ],
  },
  "not-found": {
    badge: "Status 404",
    title: "Route Not Found",
    description:
      "The path you navigated to does not exist or has been relocated within our enterprise architecture.",
    homeBtnText: "Return to Homepage",
    homeBtnLink: "/",
    insightsBtnText: "Browse Resource Hub",
    insightsBtnLink: "/technology-insights",
    seoTitle: "Page Not Found  Azaroth Tech-Hive",
    seoDescription:
      "The page you are looking for does not exist or has been moved. Browse our homepage, products, services, and engineering insights instead.",
  },
};

// Deep merge helper to ensure all default page keys and home sections exist
export const mergePagesWithDefaults = (
  incomingPages: Record<string, any> | undefined | null,
): Record<string, any> => {
  const result: Record<string, any> = { ...defaultPages };
  if (!incomingPages || typeof incomingPages !== "object") {
    return Object.fromEntries(
      Object.entries(result).map(([slug, page]) => [
        slug,
        normalizePageBuilderDocument(slug, page),
      ]),
    );
  }

  for (const key of Object.keys(incomingPages)) {
    const incomingPage = incomingPages[key];
    const defaultPage = defaultPages[key];
    if (!incomingPage || typeof incomingPage !== "object") continue;

    if (key === "home" && defaultPage) {
      result.home = {
        ...defaultPage,
        ...incomingPage,
        hero: {
          ...defaultPage.hero,
          ...(incomingPage.hero || {}),
          // Merge arrays with defaults - use incoming only if it has content
          floatingBadges:
            Array.isArray(incomingPage.hero?.floatingBadges) &&
            incomingPage.hero.floatingBadges.length > 0
              ? incomingPage.hero.floatingBadges
              : defaultPage.hero.floatingBadges,
          traces: (() => {
            const incoming = incomingPage.hero?.traces;
            if (!Array.isArray(incoming) || incoming.length === 0) {
              return defaultPage.hero.traces;
            }
            const existingIds = new Set(incoming.map((t: any) => t.id));
            const missing = defaultPage.hero.traces.filter(
              (t: any) => !existingIds.has(t.id),
            );
            return missing.length > 0 ? [...incoming, ...missing] : incoming;
          })(),
          stats:
            Array.isArray(incomingPage.hero?.stats) &&
            incomingPage.hero.stats.length > 0
              ? incomingPage.hero.stats
              : defaultPage.hero.stats,
          // Merge animation config
          animation: {
            ...defaultPage.hero.animation,
            ...(incomingPage.hero?.animation || {}),
          },
        },
        aboutSection: {
          ...defaultPage.aboutSection,
          ...(incomingPage.aboutSection || {}),
        },
        servicesSection: {
          ...defaultPage.servicesSection,
          ...(incomingPage.servicesSection || {}),
        },
        productsSection: {
          ...defaultPage.productsSection,
          ...(incomingPage.productsSection || {}),
        },
        featuredProjectsSection: {
          ...defaultPage.featuredProjectsSection,
          ...(incomingPage.featuredProjectsSection || {}),
          slides:
            Array.isArray(incomingPage.featuredProjectsSection?.slides) &&
            incomingPage.featuredProjectsSection.slides.length > 0
              ? incomingPage.featuredProjectsSection.slides
              : defaultPage.featuredProjectsSection.slides,
        },
        industrySection: {
          ...defaultPage.industrySection,
          ...(incomingPage.industrySection || {}),
          industries:
            Array.isArray(incomingPage.industrySection?.industries) &&
            incomingPage.industrySection.industries.length > 0
              ? incomingPage.industrySection.industries
              : defaultPage.industrySection.industries,
        },
        insightsSection: {
          ...defaultPage.insightsSection,
          ...(incomingPage.insightsSection || {}),
        },
        faqSection: {
          ...defaultPage.faqSection,
          ...(incomingPage.faqSection || {}),
          consultationCard: {
            ...defaultPage.faqSection.consultationCard,
            ...(incomingPage.faqSection?.consultationCard || {}),
          },
          faqs:
            Array.isArray(incomingPage.faqSection?.faqs) &&
            incomingPage.faqSection.faqs.length > 0
              ? incomingPage.faqSection.faqs
              : defaultPage.faqSection.faqs,
        },
        finalCta: {
          ...defaultPage.finalCta,
          ...(incomingPage.finalCta || {}),
        },
      };
    } else if (defaultPage && typeof defaultPage === "object") {
      result[key] = {
        ...defaultPage,
        ...incomingPage,
      };
    } else {
      result[key] = incomingPage;
    }
  }

  return Object.fromEntries(
    Object.entries(result).map(([slug, page]) => [
      slug,
      normalizePageBuilderDocument(slug, page),
    ]),
  );
};

const defaultProducts: CmsProduct[] = productsCatalog.map((p, idx) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  tagline: p.tagline,
  shortDescription: p.shortDescription,
  fullDescription: p.description,
  coverImage: p.coverImage,
  isFeatured: true,
  status: "PUBLISHED",
  order: idx + 1,
  technologies: ["React", "Node.js", "PostgreSQL", "Cloud Native"],
  benefits: p.benefits,
  badge: p.badge,
  ctaText: "Explore Platform",
  ctaLink: `/products/${p.slug}`,
  // Detail page defaults
  heroCtaPrimaryText: "Request Technical Deployment",
  heroCtaPrimaryLink: "/connect-with-us",
  heroCtaSecondaryText: "Speak with Solution Architect",
  heroCtaSecondaryLink: "/connect-with-us",
  specsSectionTitle: "Architecture design goals",
  specsSectionSubtitle:
    "Targets set during design; measured benchmarks will be published after launch.",
  capabilitiesSectionTitle: "Key Architectural Capabilities",
  integrationsSectionTitle: "Enterprise Integration Features",
  notFoundTitle: "Platform Not Found",
  notFoundDescription:
    "The requested enterprise platform specification does not exist.",
  notFoundButtonText: "Back to Products Catalog",
  notFoundButtonLink: "/products",
}));

const defaultServices: CmsService[] = serviceOfferings.map((s, idx) => ({
  id: s.id,
  title: s.title,
  slug: s.slug,
  summary: s.category,
  description: s.description,
  iconName: s.iconName,
  badge: s.badge,
  capabilities: s.capabilities,
  processSteps: [
    {
      step: "01",
      title: "Architecture Assessment",
      desc: "Holistic audit of legacy code and debt.",
    },
    {
      step: "02",
      title: "Target State Blueprints",
      desc: "Design microservices topology.",
    },
    {
      step: "03",
      title: "Incremental Migration",
      desc: "Zero-downtime cutover utilizing gateways.",
    },
  ],
  metrics: {
    deliveryFocus: "Architecture",
    typicalScope: "Platform modernization",
  },
  status: "PUBLISHED",
  order: idx + 1,
  technologies: ["Kubernetes", "TypeScript", "Event Streaming"],
  industries: ["Financial Services", "Healthcare", "Enterprise SaaS"],
  ctaText: "Request Consultation",
  ctaLink: "/connect-with-us",
}));

const defaultInsights: CmsInsight[] = insightsArticles.map((a) => ({
  id: a.id,
  title: a.title,
  slug: a.slug,
  excerpt: a.excerpt,
  content: a.content.join("\n\n"),
  coverImage: "/images/insights/cover-default.jpg",
  authorName: a.author.name,
  authorRole: a.author.role,
  category: a.category,
  tags: a.tags,
  readTime: a.readTime,
  isFeatured: true,
  status: "PUBLISHED",
  publishedAt: a.publishedDate,
}));

const defaultTestimonials: CmsTestimonial[] = [
  {
    id: "test-1",
    clientName: "Ahmed Rahman",
    role: "Chief Executive Officer",
    organization: "NextGen Solutions",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
    rating: 5,
    quote:
      "Azaroth Tech-Hive delivered exactly what we needed  a modern, resilient, high-availability architecture with zero business disruption.",
    isFeatured: true,
    order: 1,
  },
  {
    id: "test-2",
    clientName: "Sarah Al-Mansoor",
    role: "Chief Technology Officer",
    organization: "Finova Global",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80",
    rating: 5,
    quote:
      "The engineering pod Azaroth provided integrated seamlessly into our architecture workflow. Their ability to deliver resilient microservices exceeded all expectations.",
    isFeatured: true,
    order: 2,
  },
  {
    id: "test-3",
    clientName: "Marcus Vance",
    role: "VP of Product Architecture",
    organization: "Aetherius Brands",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80",
    rating: 5,
    quote:
      "From UX discovery to high-load deployment, the technical rigor Azaroth brought transformed our commerce conversion by 42%.",
    isFeatured: true,
    order: 3,
  },
];

interface CMSContextType {
  settings: WebsiteSettings;
  navigation: NavigationItem[];
  products: CmsProduct[];
  services: CmsService[];
  portfolio: CmsPortfolio[];
  insights: CmsInsight[];
  testimonials: CmsTestimonial[];
  pages: Record<string, any>;
  isLoading: boolean;
  isLive: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
  updateSettings: (settings: Partial<WebsiteSettings>) => Promise<void>;
  toggleModule: (slug: string, isEnabled?: boolean) => Promise<void>;
  resetThemeToDefault: () => Promise<void>;
  applyThemePreset: (presetName: string) => Promise<void>;
  reorderNavItems: (fromIndex: number, toIndex: number) => Promise<void>;
  updatePage: (slug: string, data: any, title?: string) => Promise<void>;
  publishPage: (slug: string) => Promise<void>;
  saveProduct: (prod: Partial<CmsProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveService: (serv: Partial<CmsService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  savePortfolio: (port: Partial<CmsPortfolio>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  saveInsight: (ins: Partial<CmsInsight>) => Promise<void>;
  deleteInsight: (id: string) => Promise<void>;
  saveTestimonial: (test: Partial<CmsTestimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  saveNavItem: (item: Partial<NavigationItem>) => Promise<void>;
  deleteNavItem: (id: string) => Promise<void>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

// Helper to safely read from localStorage
const getStoredData = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<WebsiteSettings>(() => {
    const stored = getStoredData("azaroth_cms_settings", defaultSettings);
    if (
      stored?.logoUrl === "/Logo.png" ||
      stored?.logoUrl === "/logo-footer.png"
    ) {
      stored.logoUrl = "";
      localStorage.setItem("azaroth_cms_settings", JSON.stringify(stored));
    }
    if (
      stored?.themeConfig?.primaryColor === "#4F46E5" ||
      stored?.themeConfig?.primaryColor === "#006C35" ||
      stored?.themeConfig?.preset === "indigo-gold" ||
      stored?.themeConfig?.preset === "emerald-gold"
    ) {
      stored.themeConfig = defaultTheme;
      stored.primary_color = defaultTheme.primaryColor;
      stored.secondary_color = defaultTheme.secondaryColor;
      stored.accent_color = defaultTheme.accentColor;
      stored.border_color = defaultTheme.borderColor;
      stored.text_color = defaultTheme.textColor;
      localStorage.setItem("azaroth_cms_settings", JSON.stringify(stored));
    }
    return stored;
  });
  const [navigation, setNavigation] = useState<NavigationItem[]>(() =>
    getStoredData("azaroth_cms_navigation", defaultNavigation),
  );
  const [products, setProducts] = useState<CmsProduct[]>(() =>
    getStoredData("azaroth_cms_products", defaultProducts),
  );
  const [services, setServices] = useState<CmsService[]>(() =>
    getStoredData("azaroth_cms_services", defaultServices),
  );
  const [portfolio, setPortfolio] = useState<CmsPortfolio[]>(() => {
    const stored = getStoredData("azaroth_cms_portfolio", defaultPortfolio);
    return Array.isArray(stored) ? stored : defaultPortfolio;
  });
  const [insights, setInsights] = useState<CmsInsight[]>(() =>
    getStoredData("azaroth_cms_insights", defaultInsights),
  );
  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>(() =>
    normalizeCmsTestimonials(
      getStoredData("azaroth_cms_testimonials", defaultTestimonials),
    ),
  );
  const [pages, setPages] = useState<Record<string, any>>(() => {
    const stored = getStoredData("azaroth_cms_pages", defaultPages);
    return mergePagesWithDefaults(stored);
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // BRAND-7: Brand color is strictly a code token in tokens.css, never mutated at runtime from CMS state.
  const applyThemeVariables = useCallback(
    (_theme?: ThemeConfig, _currentSettings?: WebsiteSettings) => {
      // No-op per BRAND-7
    },
    [],
  );

  const refreshContent = useCallback(async () => {
    const currentSettings = settingsRef.current;
    try {
      const bundle = await cmsService.fetchBundle();
      if (bundle) {
        if (bundle.settings) {
          const rawLogo =
            bundle.settings.logoUrl ||
            (bundle.settings.themeConfig as any)?.logoUrl ||
            currentSettings.logoUrl ||
            "";
          const normalizedLogo =
            rawLogo === "/Logo.png" || rawLogo === "/logo-footer.png"
              ? ""
              : rawLogo;
          const incomingAnim = (bundle.settings.animationConfig || {}) as any;
          const mergedAnimationConfig = {
            global: {
              ...defaultSettings.animationConfig?.global,
              ...(incomingAnim.global || {}),
              defaults: {
                ...defaultSettings.animationConfig?.global?.defaults,
                ...(incomingAnim.global?.defaults || {}),
              },
              scrollAnimations: {
                ...defaultSettings.animationConfig?.global?.scrollAnimations,
                ...(incomingAnim.global?.scrollAnimations || {}),
              },
              hoverAnimations: {
                ...defaultSettings.animationConfig?.global?.hoverAnimations,
                ...(incomingAnim.global?.hoverAnimations || {}),
              },
              continuousAnimations: {
                ...defaultSettings.animationConfig?.global
                  ?.continuousAnimations,
                ...(incomingAnim.global?.continuousAnimations || {}),
              },
              mobileAnimations: {
                ...defaultSettings.animationConfig?.global?.mobileAnimations,
                ...(incomingAnim.global?.mobileAnimations || {}),
              },
            },
            presets:
              incomingAnim.presets && incomingAnim.presets.length > 0
                ? incomingAnim.presets
                : defaultSettings.animationConfig?.presets || [],
            components:
              incomingAnim.components && incomingAnim.components.length > 0
                ? incomingAnim.components
                : defaultSettings.animationConfig?.components || [],
            cssKeyframes: {
              ...defaultSettings.animationConfig?.cssKeyframes,
              ...(incomingAnim.cssKeyframes || {}),
            },
            shimmerEffects: {
              ...defaultSettings.animationConfig?.shimmerEffects,
              ...(incomingAnim.shimmerEffects || {}),
            },
            cursorGradients: {
              ...defaultSettings.animationConfig?.cursorGradients,
              ...(incomingAnim.cursorGradients || {}),
            },
          };

          const mergedSettings: WebsiteSettings = {
            ...defaultSettings,
            ...bundle.settings,
            logoUrl: normalizedLogo,
            themeConfig: {
              ...defaultTheme,
              ...(bundle.settings.themeConfig || {}),
            },
            modulesConfig:
              bundle.settings.modulesConfig ||
              (bundle.settings.themeConfig as any)?.modulesConfig ||
              currentSettings.modulesConfig ||
              defaultModules,
            chatbotConfig: {
              ...defaultChatbot,
              ...(currentSettings.chatbotConfig || {}),
              ...(bundle.settings.chatbotConfig || {}),
            },
            footerLayout:
              bundle.settings.footerLayout ||
              defaultSettings.footerLayout ||
              "standard",
            copyright_text:
              bundle.settings.copyright_text || defaultSettings.copyright_text,
            footerConfig: {
              ...defaultSettings.footerConfig,
              ...(bundle.settings.footerConfig || {}),
            },
            animationConfig: mergedAnimationConfig,
            headquarters_address:
              bundle.settings.headquarters ||
              bundle.settings.headquarters_address ||
              companyInfo.headquarters.address,
            primary_phone:
              bundle.settings.phone ||
              bundle.settings.primary_phone ||
              companyInfo.headquarters.phone,
            primary_email:
              bundle.settings.supportEmail ||
              bundle.settings.primary_email ||
              companyInfo.headquarters.email,
            whatsapp_number:
              bundle.settings.whatsapp_number ||
              companyInfo.headquarters.whatsapp,
            linkedin_url:
              bundle.settings.linkedinUrl ||
              bundle.settings.linkedin_url ||
              "https://linkedin.com/company/azaroth-tech-hive",
          };
          setSettings(mergedSettings);
          localStorage.setItem(
            "azaroth_cms_settings",
            JSON.stringify(mergedSettings),
          );
        }

        if (isCmsCollection(bundle.navigation)) {
          setNavigation(bundle.navigation);
          localStorage.setItem(
            "azaroth_cms_navigation",
            JSON.stringify(bundle.navigation),
          );
        }
        if (isCmsCollection(bundle.products)) {
          setProducts(bundle.products);
          localStorage.setItem(
            "azaroth_cms_products",
            JSON.stringify(bundle.products),
          );
        }
        if (isCmsCollection(bundle.services)) {
          setServices(bundle.services);
          localStorage.setItem(
            "azaroth_cms_services",
            JSON.stringify(bundle.services),
          );
        }
        if (isCmsCollection(bundle.portfolio)) {
          setPortfolio(bundle.portfolio);
          localStorage.setItem(
            "azaroth_cms_portfolio",
            JSON.stringify(bundle.portfolio),
          );
        }
        if (isCmsCollection(bundle.insights)) {
          setInsights(bundle.insights);
          localStorage.setItem(
            "azaroth_cms_insights",
            JSON.stringify(bundle.insights),
          );
        }
        if (isCmsCollection(bundle.testimonials)) {
          const normalizedTestimonials = normalizeCmsTestimonials(
            bundle.testimonials,
          );
          setTestimonials(normalizedTestimonials);
          localStorage.setItem(
            "azaroth_cms_testimonials",
            JSON.stringify(normalizedTestimonials),
          );
        }
        if (bundle.pages && Object.keys(bundle.pages).length > 0) {
          setPages((prev) => {
            const next = mergePagesWithDefaults({ ...prev, ...bundle.pages });
            localStorage.setItem("azaroth_cms_pages", JSON.stringify(next));
            return next;
          });
        }
        setIsLive(true);
        setError(null);
      }
    } catch (err: any) {
      console.warn(
        "CMS Live sync notice: using resilient cached/fallback data.",
        err.message,
      );
      setIsLive(false);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  // Persist updated settings before making them authoritative in the UI.
  const updateSettings = async (newSettings: Partial<WebsiteSettings>) => {
    const updated: WebsiteSettings = {
      ...settings,
      ...newSettings,
      themeConfig: {
        ...(settings.themeConfig || defaultTheme),
        ...(newSettings.themeConfig || {}),
      },
      footerLayout:
        newSettings.footerLayout || settings.footerLayout || "standard",
      copyright_text:
        newSettings.copyright_text !== undefined
          ? newSettings.copyright_text
          : settings.copyright_text,
      footerConfig:
        newSettings.footerConfig !== undefined
          ? newSettings.footerConfig
          : settings.footerConfig,
      animationConfig:
        newSettings.animationConfig !== undefined
          ? newSettings.animationConfig
          : settings.animationConfig,
      headquarters_address:
        newSettings.headquarters ||
        newSettings.headquarters_address ||
        settings.headquarters_address,
      primary_phone:
        newSettings.phone ||
        newSettings.primary_phone ||
        settings.primary_phone,
      primary_email:
        newSettings.supportEmail ||
        newSettings.primary_email ||
        settings.primary_email,
      linkedin_url:
        newSettings.linkedinUrl ||
        newSettings.linkedin_url ||
        settings.linkedin_url,
      primary_color:
        newSettings.themeConfig?.primaryColor ||
        newSettings.primary_color ||
        settings.primary_color,
      secondary_color:
        newSettings.themeConfig?.secondaryColor ||
        newSettings.secondary_color ||
        settings.secondary_color,
      accent_color:
        newSettings.themeConfig?.accentColor ||
        newSettings.accent_color ||
        settings.accent_color,
      background_color:
        newSettings.themeConfig?.backgroundColor ||
        newSettings.background_color ||
        settings.background_color,
    };

    await cmsService.updateSettings(updated);
    setSettings(updated);
    localStorage.setItem("azaroth_cms_settings", JSON.stringify(updated));
    applyThemeVariables(updated.themeConfig, updated);
  };

  // Toggle a module on/off from Settings or Nav, synchronizing navigation visibility
  const toggleModule = async (slug: string, isEnabled?: boolean) => {
    const currentModules = settings.modulesConfig || defaultModules;
    const target = currentModules.find((m) => m.slug === slug);
    if (!target) return;

    const nextState = isEnabled !== undefined ? isEnabled : !target.isEnabled;
    const updatedModules = currentModules.map((m) =>
      m.slug === slug ? { ...m, isEnabled: nextState } : m,
    );

    const updatedNav = navigation.map((navItem) => {
      if (
        navItem.path === target.path ||
        (target.path !== "/" && navItem.path.startsWith(target.path))
      ) {
        return { ...navItem, isVisible: nextState };
      }
      return navItem;
    });

    const matchingNavItem = updatedNav.find((n) => n.path === target.path);
    if (matchingNavItem) {
      await cmsService.updateNavItem(matchingNavItem.id, matchingNavItem);
    }

    await updateSettings({ modulesConfig: updatedModules });
    setNavigation(updatedNav);
    localStorage.setItem("azaroth_cms_navigation", JSON.stringify(updatedNav));
  };

  const resetThemeToDefault = async () => {
    // BRAND-7: Brand color is a code token, not a CMS field
  };

  const applyThemePreset = async (_presetKey: string) => {
    // BRAND-7: Brand color is a code token, not a CMS field
  };

  const reorderNavItems = async (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      fromIndex >= navigation.length ||
      toIndex < 0 ||
      toIndex >= navigation.length
    )
      return;
    const reordered = [...navigation];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    await cmsService.updateNavigation(updated);
    setNavigation(updated);
    localStorage.setItem("azaroth_cms_navigation", JSON.stringify(updated));
  };

  const updatePage = async (slug: string, data: any, title?: string) => {
    await cmsService.updatePage(slug, data, title);
    setPages((prev) => {
      const next = mergePagesWithDefaults({ ...prev, [slug]: data });
      localStorage.setItem("azaroth_cms_pages", JSON.stringify(next));
      return next;
    });
  };

  const publishPage = async (slug: string) => {
    await cmsService.publishPage(slug);
  };

  const saveProduct = async (prod: Partial<CmsProduct>) => {
    let nextList: CmsProduct[];
    if (prod.id && products.some((p) => p.id === prod.id)) {
      nextList = products.map((p) =>
        p.id === prod.id ? ({ ...p, ...prod } as CmsProduct) : p,
      );
    } else {
      const newProd: CmsProduct = {
        id: prod.id || `prod-${Date.now()}`,
        name: prod.name || "New Product",
        slug: prod.slug || "new-product",
        tagline: prod.tagline || "",
        shortDescription: prod.shortDescription || "",
        fullDescription: prod.fullDescription || "",
        coverImage: prod.coverImage || "/images/products/fms-cover.jpg",
        isFeatured: prod.isFeatured ?? true,
        status: prod.status || "PUBLISHED",
        order: products.length + 1,
        technologies: prod.technologies || ["React", "Node.js", "PostgreSQL"],
        benefits: prod.benefits || [],
        badge: prod.badge || "Platform",
        ctaText: prod.ctaText || "Explore Solution",
        ctaLink: prod.ctaLink || `/products/${prod.slug || "new-product"}`,
      };
      nextList = [...products, newProd];
    }
    if (prod.id && products.some((p) => p.id === prod.id)) {
      await cmsService.updateProduct(prod.id, prod);
    } else {
      const savedId = await cmsService.createProduct(
        nextList[nextList.length - 1],
      );
      if (savedId)
        nextList[nextList.length - 1] = {
          ...nextList[nextList.length - 1],
          id: savedId,
        };
    }
    setProducts(nextList);
    localStorage.setItem("azaroth_cms_products", JSON.stringify(nextList));
  };

  const deleteProduct = async (id: string) => {
    await cmsService.deleteProduct(id);
    const nextList = products.filter((p) => p.id !== id);
    setProducts(nextList);
    localStorage.setItem("azaroth_cms_products", JSON.stringify(nextList));
  };

  const saveService = async (serv: Partial<CmsService>) => {
    let nextList: CmsService[];
    if (serv.id && services.some((s) => s.id === serv.id)) {
      nextList = services.map((s) =>
        s.id === serv.id ? ({ ...s, ...serv } as CmsService) : s,
      );
    } else {
      const newServ: CmsService = {
        id: serv.id || `serv-${Date.now()}`,
        title: serv.title || "New Service",
        slug: serv.slug || "new-service",
        summary: serv.summary || "Architecture",
        description: serv.description || "",
        iconName: serv.iconName || "Cpu",
        badge: serv.badge || "Enterprise",
        capabilities: serv.capabilities || [],
        processSteps: serv.processSteps || [],
        metrics: serv.metrics || {},
        status: serv.status || "PUBLISHED",
        order: services.length + 1,
        technologies: serv.technologies || [],
        industries: serv.industries || [],
        ctaText: serv.ctaText || "Request Consultation",
        ctaLink: serv.ctaLink || "/connect-with-us",
      };
      nextList = [...services, newServ];
    }
    if (serv.id && services.some((s) => s.id === serv.id)) {
      await cmsService.updateService(serv.id, serv);
    } else {
      const savedId = await cmsService.createService(
        nextList[nextList.length - 1],
      );
      if (savedId)
        nextList[nextList.length - 1] = {
          ...nextList[nextList.length - 1],
          id: savedId,
        };
    }
    setServices(nextList);
    localStorage.setItem("azaroth_cms_services", JSON.stringify(nextList));
  };

  const deleteService = async (id: string) => {
    await cmsService.deleteService(id);
    const nextList = services.filter((s) => s.id !== id);
    setServices(nextList);
    localStorage.setItem("azaroth_cms_services", JSON.stringify(nextList));
  };

  const savePortfolio = async (port: Partial<CmsPortfolio>) => {
    let nextList: CmsPortfolio[];
    if (port.id && portfolio.some((p) => p.id === port.id)) {
      nextList = portfolio.map((p) =>
        p.id === port.id ? ({ ...p, ...port } as CmsPortfolio) : p,
      );
    } else {
      const newPort: CmsPortfolio = {
        id: port.id || `port-${Date.now()}`,
        name: port.name || "New Project",
        slug: port.slug || "new-project",
        clientName: port.clientName || "",
        clientType: port.clientType || "Enterprise",
        industry: port.industry || "Technology",
        category: port.category || "Cloud Engineering",
        summary: port.summary || "",
        challenge: port.challenge || "",
        solution: port.solution || "",
        outcomes: port.outcomes || [],
        technologies: port.technologies || [],
        coverImage: port.coverImage || "/images/portfolio/project-1.jpg",
        isFeatured: port.isFeatured ?? true,
        order: portfolio.length + 1,
      };
      nextList = [...portfolio, newPort];
    }
    if (port.id && portfolio.some((p) => p.id === port.id)) {
      await cmsService.updatePortfolio(port.id, port);
    } else {
      const savedId = await cmsService.createPortfolio(
        nextList[nextList.length - 1],
      );
      if (savedId)
        nextList[nextList.length - 1] = {
          ...nextList[nextList.length - 1],
          id: savedId,
        };
    }
    setPortfolio(nextList);
    localStorage.setItem("azaroth_cms_portfolio", JSON.stringify(nextList));
  };

  const deletePortfolio = async (id: string) => {
    await cmsService.deletePortfolio(id);
    const nextList = portfolio.filter((p) => p.id !== id);
    setPortfolio(nextList);
    localStorage.setItem("azaroth_cms_portfolio", JSON.stringify(nextList));
  };

  const saveInsight = async (ins: Partial<CmsInsight>) => {
    let nextList: CmsInsight[];
    if (ins.id && insights.some((i) => i.id === ins.id)) {
      nextList = insights.map((i) =>
        i.id === ins.id ? ({ ...i, ...ins } as CmsInsight) : i,
      );
    } else {
      const newIns: CmsInsight = {
        id: ins.id || `ins-${Date.now()}`,
        title: ins.title || "New Insight",
        slug: ins.slug || "new-insight",
        excerpt: ins.excerpt || "",
        content: ins.content || "",
        coverImage: ins.coverImage || "/images/insights/cover-default.jpg",
        authorName: ins.authorName || "Principal Architect",
        authorRole: ins.authorRole || "Architecture Lead",
        category: ins.category || "System Architecture",
        tags: ins.tags || ["Technology"],
        readTime: ins.readTime || "5 min read",
        isFeatured: ins.isFeatured ?? true,
        status: ins.status || "PUBLISHED",
        publishedAt: ins.publishedAt || new Date().toISOString(),
      };
      nextList = [newIns, ...insights];
    }
    if (ins.id && insights.some((i) => i.id === ins.id)) {
      await cmsService.updateInsight(ins.id, ins);
    } else {
      const savedId = await cmsService.createInsight(nextList[0]);
      if (savedId) nextList[0] = { ...nextList[0], id: savedId };
    }
    setInsights(nextList);
    localStorage.setItem("azaroth_cms_insights", JSON.stringify(nextList));
  };

  const deleteInsight = async (id: string) => {
    await cmsService.deleteInsight(id);
    const nextList = insights.filter((i) => i.id !== id);
    setInsights(nextList);
    localStorage.setItem("azaroth_cms_insights", JSON.stringify(nextList));
  };

  const saveTestimonial = async (test: Partial<CmsTestimonial>) => {
    let nextList: CmsTestimonial[];
    if (test.id && testimonials.some((t) => t.id === test.id)) {
      nextList = testimonials.map((t) =>
        t.id === test.id ? ({ ...t, ...test } as CmsTestimonial) : t,
      );
    } else {
      const newTest: CmsTestimonial = {
        id: test.id || `test-${Date.now()}`,
        clientName: test.clientName || "Client Name",
        role: test.role || "Executive",
        organization: test.organization || "Enterprise",
        avatarUrl:
          test.avatarUrl ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
        rating: test.rating || 5,
        quote: test.quote || "",
        isFeatured: test.isFeatured ?? true,
        order: testimonials.length + 1,
      };
      nextList = [...testimonials, newTest];
    }
    if (test.id && testimonials.some((t) => t.id === test.id)) {
      await cmsService.updateTestimonial(test.id, test);
    } else {
      const savedId = await cmsService.createTestimonial(
        nextList[nextList.length - 1],
      );
      if (savedId)
        nextList[nextList.length - 1] = {
          ...nextList[nextList.length - 1],
          id: savedId,
        };
    }
    setTestimonials(nextList);
    localStorage.setItem("azaroth_cms_testimonials", JSON.stringify(nextList));
  };

  const deleteTestimonial = async (id: string) => {
    await cmsService.deleteTestimonial(id);
    const nextList = testimonials.filter((t) => t.id !== id);
    setTestimonials(nextList);
    localStorage.setItem("azaroth_cms_testimonials", JSON.stringify(nextList));
  };

  const saveNavItem = async (item: Partial<NavigationItem>) => {
    let nextList: NavigationItem[];
    if (item.id && navigation.some((n) => n.id === item.id)) {
      nextList = navigation.map((n) =>
        n.id === item.id ? ({ ...n, ...item } as NavigationItem) : n,
      );
    } else {
      const newNav: NavigationItem = {
        id: item.id || `nav-${Date.now()}`,
        label: item.label || "New Link",
        path: item.path || "/",
        order: item.order || navigation.length + 1,
        isVisible: item.isVisible ?? true,
        isExternal: item.isExternal ?? false,
      };
      nextList = [...navigation, newNav];
    }
    if (item.id && navigation.some((n) => n.id === item.id)) {
      await cmsService.updateNavItem(item.id, item);
    } else {
      const savedId = await cmsService.createNavItem(
        nextList[nextList.length - 1],
      );
      if (savedId)
        nextList[nextList.length - 1] = {
          ...nextList[nextList.length - 1],
          id: savedId,
        };
    }
    setNavigation(nextList);
    localStorage.setItem("azaroth_cms_navigation", JSON.stringify(nextList));
  };

  const deleteNavItem = async (id: string) => {
    await cmsService.deleteNavItem(id);
    const nextList = navigation.filter((n) => n.id !== id);
    setNavigation(nextList);
    localStorage.setItem("azaroth_cms_navigation", JSON.stringify(nextList));
  };

  return (
    <CMSContext.Provider
      value={{
        settings,
        navigation,
        products,
        services,
        portfolio,
        insights,
        testimonials,
        pages,
        isLoading,
        isLive,
        error,
        refreshContent,
        updateSettings,
        toggleModule,
        resetThemeToDefault,
        applyThemePreset,
        reorderNavItems,
        updatePage,
        publishPage,
        saveProduct,
        deleteProduct,
        saveService,
        deleteService,
        savePortfolio,
        deletePortfolio,
        saveInsight,
        deleteInsight,
        saveTestimonial,
        deleteTestimonial,
        saveNavItem,
        deleteNavItem,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = (): CMSContextType => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
};
