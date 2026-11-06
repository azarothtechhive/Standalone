// Shared Type Definitions for Azaroth UI

export type ProductCategory = string;

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  badge?: string;
  status?: 'Live' | 'Under Development' | 'PUBLISHED' | 'DRAFT' | string;
  statusColor?: 'green' | 'blue' | 'amber' | 'violet';
  tagline: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  coverAlt: string;
  isEnabled?: boolean;
  keyCapabilities: string[];
  benefits: string[];
  techSpecs?: {
    latency?: string;
    concurrency?: string;
    compliancePosture?: string;
    protocols?: string[];
  };
  features: string[];
  iconName: string;
  seoTitle?: string;
  seoDescription?: string;
  seoCanonicalPath?: string;
  backButtonText?: string;
  heroCtaPrimaryText?: string;
  heroCtaPrimaryLink?: string;
  heroCtaSecondaryText?: string;
  heroCtaSecondaryLink?: string;
  specsSectionTitle?: string;
  specsSectionSubtitle?: string;
  latencyLabel?: string;
  concurrencyLabel?: string;
  complianceLabel?: string;
  protocolsLabel?: string;
  capabilitiesSectionTitle?: string;
  integrationsSectionTitle?: string;
  notFoundTitle?: string;
  notFoundDescription?: string;
  notFoundButtonText?: string;
  notFoundButtonLink?: string;
}

export interface ServiceOffering {
  id: string;
  slug: string;
  title: string;
  category: string;
  badge?: string;
  description: string;
  bestFor?: string;
  outcomes: string[];
  deliverables: string[];
  capabilities?: string[];
  metrics?: { label: string; value: string }[];
  iconName: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface SlaTier {
  tierName: 'Standard' | 'Business' | 'Mission-Critical Enterprise';
  highlight?: boolean;
  responseTime: string;
  availabilityTarget: string;
  leadArchitectSupport: string;
  dedicatedEngineeringPod: string;
  securityAuditsIncluded: string;
  deploymentCadence: string;
}

export interface DeliveryStage {
  stageNumber: number;
  title: string;
  tagline: string;
  duration: string;
  description: string;
  keyActivities: string[];
  deliverables: string[];
  qualityGates: string[];
}

export interface ValueItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  metrics: string;
}

export interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  linkedInUrl?: string;
}

export interface InsightSection {
  id: string;
  title: string;
}

export interface InsightArticle {
  id: string;
  slug: string;
  title: string;
  category: 'System Architecture' | 'Case Study' | 'Enterprise AI' | 'Cloud Modernization';
  readTime: string;
  publishedDate: string;
  author: {
    name: string;
    role: string;
  };
  excerpt: string;
  content: string[];
  sections: InsightSection[];
  tags: string[];
  imageUrl?: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  clientIndustry: string;
  title: string;
  summary: string;
  metrics: {
    label: string;
    value: string;
  }[];
  challenge: string;
  solution: string;
  architectureHighlights: string[];
}

export interface RfqFormData {
  solutionCategories: string[];
  projectScope: string;
  targetTimeline: string;
  budgetRange: string;
  requirementsDescription: string;
  ndaRequired: boolean;
  contact: {
    fullName: string;
    workEmail: string;
    phone: string;
    companyName: string;
    country: string;
  };
}

export interface ContactFormData {
  fullName: string;
  workEmail: string;
  phone: string;
  companyName: string;
  enquiryAbout: string;
  message: string;
  consent: boolean;
  website_url?: string; // honeypot
}

export type ContactFormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'select'
  | 'textarea'
  | 'country'
  | 'file'
  | 'checkbox';

export interface ContactFormColumn {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type: ContactFormFieldType;
  width: 'half' | 'full'; // 'half' = 1 col (50%), 'full' = 2 cols (100%)
  required: boolean;
  requiredError?: string;
  options?: string[]; // for select
  hint?: string; // for file hint or helper
  consentLinkText?: string;
  consentLinkUrl?: string;
}

export const DEFAULT_CONTACT_FORM_COLUMNS: ContactFormColumn[] = [
  {
    id: 'col_fullName',
    name: 'fullName',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    type: 'text',
    width: 'half',
    required: true,
    requiredError: 'Full Name is required.',
  },
  {
    id: 'col_workEmail',
    name: 'workEmail',
    label: 'Email',
    placeholder: 'Enter your Email',
    type: 'email',
    width: 'half',
    required: true,
    requiredError: 'Work Email is required.',
  },
  {
    id: 'col_companyName',
    name: 'companyName',
    label: 'Company / Organization',
    placeholder: 'Enter your organization name',
    type: 'text',
    width: 'half',
    required: true,
    requiredError: 'Company name is required.',
  },
  {
    id: 'col_phone',
    name: 'phone',
    label: 'Contact Number',
    placeholder: 'Mobile number',
    type: 'tel',
    width: 'half',
    required: true,
    requiredError: 'Contact number is required.',
  },
  {
    id: 'col_country',
    name: 'country',
    label: 'Country / Region',
    placeholder: 'Search country...',
    type: 'country',
    width: 'full',
    required: true,
    requiredError: 'Please select your country.',
  },
  {
    id: 'col_message',
    name: 'message',
    label: 'How Can We Help?',
    placeholder: 'Brief summary of objectives, systems, or target timeline...',
    type: 'textarea',
    width: 'full',
    required: true,
    requiredError: 'Please provide details about your enquiry (min 10 characters).',
  },
  {
    id: 'col_attachments',
    name: 'attachments',
    label: 'Attachments',
    placeholder: 'PDF, DOCX, XLSX, ZIP · max 15MB',
    type: 'file',
    width: 'full',
    required: false,
    hint: 'PDF, DOCX, XLSX, ZIP · max 15MB',
  },
  {
    id: 'col_consent',
    name: 'consent',
    label: 'I agree to the Privacy Policy and confirm you may contact me regarding this enquiry.',
    placeholder: 'Privacy Policy',
    type: 'checkbox',
    width: 'full',
    required: true,
    requiredError: 'You must agree to the Privacy Policy to proceed.',
    consentLinkText: 'Privacy Policy',
    consentLinkUrl: '/privacy-policy',
  },
];

