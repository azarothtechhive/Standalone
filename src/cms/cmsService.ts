// src/services/cmsService.ts
import { authService } from '../services/authService';
import React from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const nativeFetch = globalThis.fetch.bind(globalThis);
if (!(globalThis as typeof globalThis & { __azarothFetchPatched?: boolean }).__azarothFetchPatched) {
  (globalThis as typeof globalThis & { __azarothFetchPatched?: boolean }).__azarothFetchPatched = true;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const mergedInit: RequestInit = {
      ...(init ?? {}),
      credentials: init?.credentials ?? 'include',
    };
    const res = await nativeFetch(input, mergedInit);
    // If an authenticated API call fails with 401, trigger session expiration
    if (res.status === 401 && typeof window !== 'undefined') {
      const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
      if (urlStr.includes('/api/cms') || urlStr.includes('/api/auth/')) {
        authService.clearSession();
        window.dispatchEvent(new CustomEvent('auth:session_expired'));
      }
    }
    return res;
  }) as typeof fetch;
}

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  preset?: string;
}

export interface WebsiteModuleSetting {
  id: string;
  name: string;
  slug: string;
  path: string;
  isEnabled: boolean;
  order: number;
  description: string;
}

export interface ChatbotKnowledgeItem {
  id?: string;
  triggerKeywords: string[];
  response: string;
  buttons?: Array<{ label: string; action: string }>;
  order?: number;
}

export interface ChatbotConfig {
  isEnabled: boolean;
  botName: string;
  botRole: string;
  welcomeMessage: string;
  primaryColor?: string;
  secondaryColor?: string;
  quickPrompts?: string[];
  supportEmail?: string;
  supportPhone?: string;
  position?: 'bottom-right' | 'bottom-left';
  knowledgeBase?: ChatbotKnowledgeItem[];
}

export interface WebsiteSettings {
  id: string;
  companyName: string;
  tagline: string;
  supportEmail: string;
  phone: string;
  headquarters: string;
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
  metaTitle: string;
  metaDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  themeConfig?: ThemeConfig;
  modulesConfig?: WebsiteModuleSetting[];
  chatbotConfig?: ChatbotConfig;
  emailConfig?: {
    fromEmail?: string;
    provider?: string;
  };
  // Header CTA
  headerConfig?: {
    ctaText?: string;
    ctaLink?: string;
  };
  // Contact Form copy
  contactFormConfig?: {
    successTitle?: string;
    successMessage?: string;
    sendAnotherButtonText?: string;
    whatsAppButtonText?: string;
    whatsAppNumber?: string;
    scopeLabel?: string;
    scopePlaceholder?: string;
    attachmentLabel?: string;
    attachmentHint?: string;
    maxFileSizeMB?: number;
    errorBannerText?: string;
    emailDirectLinkText?: string;
    submitButtonText?: string;
    submittingButtonText?: string;
  };
  // Compatibility aliases
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  border_color?: string;
  headquarters_address?: string;
  primary_phone?: string;
  primary_email?: string;
  whatsapp_number?: string;
  linkedin_url?: string;
  copyright_text?: string;
  footerLayout?: 'standard' | 'reversed';
  footerConfig?: any;
  bannerConfig?: any;
  cursorConfig?: any;
  animationConfig?: any;
  colorConfig?: any;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  order: number;
  isVisible: boolean;
  isExternal?: boolean;
  children?: NavigationChildItem[];
}

export interface NavigationChildItem {
  id?: string;
  label: string;
  path: string;
  isExternal?: boolean;
  isVisible?: boolean;
  icon?: React.ReactNode;
  order?: number;
}

export interface CmsProduct {
  id: string;
  name: string;
  title?: string;
  slug: string;
  description?: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  isFeatured: boolean;
  isEnabled?: boolean;
  status: 'Live' | 'Under Development' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'INACTIVE';
  order: number;
  technologies: string[];
  benefits: string[];
  badge?: string;
  category?: string;
  iconName?: string;
  features?: string[];
  keyCapabilities?: string[];
  techSpecs?: {
    latency?: string;
    concurrency?: string;
    compliancePosture?: string;
    protocols?: string[];
  };
  ctaText: string;
  ctaLink: string;
  // Detail page fields
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
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CmsService {
  id: string;
  title: string;
  slug: string;
  category?: string;
  summary: string;
  description: string;
  bestFor?: string;
  outcomes?: string[];
  deliverables?: string[];
  shortDescription?: string;
  fullDescription?: string;
  short_description?: string;
  iconName: string;
  icon_name?: string;
  badge?: string;
  capabilities?: string[];
  processSteps: { step: string; title: string; desc: string }[];
  metrics: Record<string, string>;
  status: 'PUBLISHED' | 'DRAFT';
  order: number;
  technologies: string[];
  industries: string[];
  ctaText: string;
  ctaLink: string;
}

export interface CmsPortfolio {
  id: string;
  name: string;
  title?: string;
  slug: string;
  clientName: string;
  client?: string;
  clientType: string;
  industry: string;
  category: string;
  summary: string;
  description?: string;
  challenge: string;
  solution: string;
  outcomes: string[];
  metrics?: any;
  technologies: string[];
  techStack?: any;
  coverImage: string;
  isFeatured: boolean;
  order: number;
  // Detail page fields
  seoTitle?: string;
  seoDescription?: string;
  seoCanonicalPath?: string;
  backButtonText?: string;
  heroCtaPrimaryText?: string;
  heroCtaPrimaryLink?: string;
  heroCtaSecondaryText?: string;
  heroCtaSecondaryLink?: string;
  summaryHeading?: string;
  challengeSectionTitle?: string;
  challengeHeading?: string;
  solutionSectionTitle?: string;
  architectureHeading?: string;
  outcomesSectionTitle?: string;
  outcomesHeading?: string;
  techStackSectionTitle?: string;
  technologiesHeading?: string;
  notFoundTitle?: string;
  notFoundDescription?: string;
  notFoundButtonText?: string;
  notFoundButtonLink?: string;
}

export interface CmsInsight {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string | string[];
  coverImage: string;
  authorName: string;
  authorRole: string;
  author?: { name: string; role: string; avatar?: string };
  sections?: { id: string; title: string }[];
  imageUrl?: string;
  category: string;
  tags: string[];
  readTime: string;
  isFeatured: boolean;
  status: 'PUBLISHED' | 'DRAFT';
  publishedAt?: string;
  publishedDate?: string;
}

export interface CmsTestimonial {
  id: string;
  clientName: string;
  role: string;
  organization: string;
  avatarUrl: string;
  author?: string;
  authorName?: string;
  company?: string;
  companyName?: string;
  verified?: boolean;
  rating: number;
  quote: string;
  isFeatured: boolean;
  order: number;
}

export interface CmsEnquiry {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  country?: string;
  attachments?: string[];
  consentAccepted?: boolean;
  message: string;
  enquiryAbout?: string;
  productSlug?: string;
  productName?: string;
  status: string;
  assignedTo?: string;
  followUpNote?: string;
  nextFollowUpAt?: string;
  createdAt: string;
}

export interface CmsRfq {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  projectType: string;
  projectDescription: string;
  expectedTimeline: string;
  estimatedBudget: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
}

export interface CmsMedia {
  id: string;
  displayName?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  url: string;
  altText: string;
  category: string;
  createdAt: string;
  isLocal?: boolean;
}

export interface CmsAuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export interface CmsBundle {
  settings: WebsiteSettings;
  navigation: NavigationItem[];
  products: CmsProduct[];
  services: CmsService[];
  portfolio: CmsPortfolio[];
  insights: CmsInsight[];
  testimonials: CmsTestimonial[];
  pages: Record<string, any>;
  lastUpdated: string;
}

export class CmsApiService {
  private fetchWithSession(url: string, init: RequestInit = {}): Promise<Response> {
    return fetch(url, { ...init, credentials: 'include' });
  }

  private getHeaders(isJson = true): HeadersInit {
    const headers: Record<string, string> = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    const token = authService.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async fetchBundle(): Promise<CmsBundle> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/all`, {
      headers: this.getHeaders(false),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch CMS content bundle');
    return json.data;
  }

  async fetchStats(): Promise<any> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/stats`, {
      headers: this.getHeaders(false),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch stats');
    return json;
  }

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update settings');
  }

  async fetchPage(slug: string): Promise<any> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/pages/${slug}`, {
      headers: this.getHeaders(false),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch page');
    return json.page;
  }

  async updatePage(slug: string, data: any, title?: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/pages/${slug}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ slug, title, data }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update page content');
  }

  async publishPage(slug: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/pages/${slug}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({}),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to publish page content');
  }

  // Products CRUD
  async createProduct(product: Partial<CmsProduct>): Promise<string> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/products`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(product),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to create product');
    return json.id;
  }

  async updateProduct(id: string, product: Partial<CmsProduct>): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/products/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(product),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update product');
  }

  async deleteProduct(id: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/products/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(false),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to delete product');
  }

  // Services CRUD
  async createService(service: Partial<CmsService>): Promise<string> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/services`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(service),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to create service');
    return json.id;
  }

  async updateService(id: string, service: Partial<CmsService>): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/services/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(service),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update service');
  }

  async deleteService(id: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/services/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(false),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to delete service');
  }

  // Portfolio CRUD
  async createPortfolio(project: Partial<CmsPortfolio>): Promise<string> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/portfolio`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(project),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to create case study');
    return json.id;
  }

  async updatePortfolio(id: string, project: Partial<CmsPortfolio>): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/portfolio/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(project),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update case study');
  }

  async deletePortfolio(id: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/portfolio/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(false),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to delete case study');
  }

  // Insights CRUD
  async createInsight(insight: Partial<CmsInsight>): Promise<string> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/insights`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(insight),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to create insight');
    return json.id;
  }

  async updateInsight(id: string, insight: Partial<CmsInsight>): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/insights/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(insight),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update insight');
  }

  async deleteInsight(id: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/insights/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(false),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to delete insight');
  }

  // Testimonials CRUD
  async createTestimonial(testimonial: Partial<CmsTestimonial>): Promise<string> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/testimonials`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(testimonial),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to create testimonial');
    return json.id;
  }

  async updateTestimonial(id: string, testimonial: Partial<CmsTestimonial>): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/testimonials/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(testimonial),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update testimonial');
  }

  async deleteTestimonial(id: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/testimonials/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(false),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to delete testimonial');
  }

  // Navigation Items
  async createNavItem(item: Partial<NavigationItem>): Promise<string> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/navigation`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(item),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to add navigation item');
    return json.id;
  }

  async updateNavItem(id: string, item: Partial<NavigationItem>): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/navigation/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(item),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update navigation item');
  }

  async updateNavigation(items: NavigationItem[]): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/navigation`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(items),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update navigation');
  }

  async deleteNavItem(id: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/navigation/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(false),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to delete navigation item');
  }

  // CRM Enquiries & RFQs
  async fetchEnquiries(): Promise<CmsEnquiry[]> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/enquiries`, {
      headers: this.getHeaders(false),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success || !Array.isArray(json.enquiries)) {
      throw new Error(json?.message || 'Failed to fetch enquiries');
    }
    return json.enquiries;
  }

  async updateEnquiryStatus(id: string, status: string, followUpNote?: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/enquiries/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, followUpNote }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to update enquiry');
  }

  async deleteEnquiry(id: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/enquiries/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(false),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to delete enquiry');
  }

  async fetchRfqs(): Promise<CmsRfq[]> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/rfqs`, {
      headers: this.getHeaders(false),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch RFQs');
    return json.rfqs;
  }

  async updateRfqStatus(id: string, status: string, assignedTo?: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/rfqs/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, assignedTo }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update RFQ');
  }

  async deleteRfq(id: string): Promise<void> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/rfqs/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(false),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to delete RFQ');
  }

  // Media Library
  async fetchMedia(): Promise<CmsMedia[]> {
    let serverMedia: CmsMedia[] = [];
    let serverError: Error | null = null;

    try {
      const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/media`, {
        headers: this.getHeaders(false),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && Array.isArray(json.media)) {
        serverMedia = json.media;
      } else {
        serverError = new Error(json?.message || 'Could not load media from the server.');
      }
    } catch (err) {
      serverError = err instanceof Error ? err : new Error('Could not reach the media service.');
    }

    let localMedia: CmsMedia[] = [];
    try {
      const stored = localStorage.getItem('azaroth_cms_local_media');
      localMedia = stored
        ? JSON.parse(stored).map((media: CmsMedia) => ({ ...media, isLocal: true }))
        : [];
    } catch {
      localMedia = [];
    }

    // Combine without duplicates
    const seen = new Set(serverMedia.map((m) => m.url));
    const filteredLocal = localMedia.filter((m) => !seen.has(m.url));
    const combined = [...filteredLocal, ...serverMedia];

    // Only surface an error when there is nothing at all to display. This keeps
    // offline-local media usable while still reporting genuine API failures.
    if (combined.length === 0 && serverError) throw serverError;
    return combined;
  }

  async uploadMedia(file: File, category = 'general', altText?: string): Promise<CmsMedia> {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 20 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file type. Upload an image (JPEG, PNG, WebP, SVG, GIF) or a PDF/DOC/DOCX.');
    }
    if (file.size > maxSize) {
      throw new Error('File is too large. Maximum upload size is 20MB.');
    }

    let serverError: Error | null = null;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('displayName', file.name);
      if (altText) formData.append('altText', altText);

      const token = authService.getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/media/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success || !json.media) {
        // A server response means the request was understood; do not silently
        // store the file locally when the server rejected it (auth, size, type).
        throw new Error(json?.message || `Media upload failed (${res.status})`);
      }
      return json.media;
    } catch (err) {
      serverError = err instanceof Error ? err : new Error('Media upload failed');
      // Only fall back to local storage when the API could not be reached.
      if (!(serverError instanceof TypeError) && !/fetch|network|Failed to fetch/i.test(serverError.message)) {
        throw serverError;
      }
    }

    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Could not read the file for local storage'));
      reader.readAsDataURL(file);
    });

    const fallbackMedia: CmsMedia = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      url: base64Data,
      altText: altText || file.name,
      category,
      createdAt: new Date().toISOString(),
      isLocal: true,
    };

    try {
      const stored = localStorage.getItem('azaroth_cms_local_media');
      const list: CmsMedia[] = stored ? JSON.parse(stored) : [];
      list.unshift(fallbackMedia);
      localStorage.setItem('azaroth_cms_local_media', JSON.stringify(list.slice(0, 20)));
    } catch {
      throw new Error(`Server upload failed and local storage was unavailable: ${serverError.message}`);
    }

    return fallbackMedia;
  }

  async deleteMedia(id: string): Promise<void> {
    const stored = localStorage.getItem('azaroth_cms_local_media');
    const localMedia: CmsMedia[] = stored ? JSON.parse(stored) : [];
    if (localMedia.some((media) => media.id === id)) {
      localStorage.setItem(
        'azaroth_cms_local_media',
        JSON.stringify(localMedia.filter((media) => media.id !== id)),
      );
      return;
    }

    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/media/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(false),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to delete media');
  }

  // Audit Logs
  async fetchAuditLogs(): Promise<CmsAuditLog[]> {
    const res = await this.fetchWithSession(`${API_BASE_URL}/api/cms/audit-logs`, {
      headers: this.getHeaders(false),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success || !Array.isArray(json.logs)) {
      throw new Error(json?.message || 'Failed to fetch audit logs');
    }
    return json.logs;
  }
}

export const cmsService = new CmsApiService();

