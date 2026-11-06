import { APIRequestContext, request } from '@playwright/test';
import { CmsProduct, CmsService, CmsPortfolio, CmsInsight, CmsTestimonial, WebsiteSettings, NavigationItem } from '../../../src/services/cmsService';

export interface TestUser {
  email: string;
  password: string;
  token?: string;
  role?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class CmsApiClient {
  private apiContext: APIRequestContext;
  private baseUrl: string;
  private token: string | null = null;

  constructor(apiContext: APIRequestContext, baseUrl: string) {
    this.apiContext = apiContext;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setToken(token: string): void {
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async login(email: string, password: string): Promise<TestUser> {
    const response = await this.apiContext.post(`${this.baseUrl}/auth/login`, {
      data: { email, password },
    });

    const data = await response.json() as ApiResponse<{ token: string; user: any }>;

    if (!data.success || !data.data?.token) {
      throw new Error(data.message || 'Login failed');
    }

    this.token = data.data.token;
    return { email, password, token: data.data.token, role: data.data.user?.role };
  }

  async logout(): Promise<void> {
    if (this.token) {
      await this.apiContext.post(`${this.baseUrl}/auth/logout`, {
        headers: this.getHeaders(),
      });
      this.token = null;
    }
  }

  async getMe(): Promise<any> {
    const response = await this.apiContext.get(`${this.baseUrl}/auth/me`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // --- CMS Bundle ---
  async fetchBundle(): Promise<any> {
    const response = await this.apiContext.get(`${this.baseUrl}/cms/all`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async fetchStats(): Promise<any> {
    const response = await this.apiContext.get(`${this.baseUrl}/cms/stats`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // --- Settings ---
  async updateSettings(settings: Partial<WebsiteSettings>): Promise<any> {
    const response = await this.apiContext.put(`${this.baseUrl}/cms/settings`, {
      headers: this.getHeaders(),
      data: settings,
    });
    return response.json();
  }

  // --- Pages ---
  async fetchPage(slug: string): Promise<any> {
    const response = await this.apiContext.get(`${this.baseUrl}/cms/pages/${slug}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async updatePage(slug: string, data: any, title?: string): Promise<any> {
    const response = await this.apiContext.put(`${this.baseUrl}/cms/pages/${slug}`, {
      headers: this.getHeaders(),
      data: { slug, title, data },
    });
    return response.json();
  }

  // --- Products ---
  async createProduct(product: Partial<CmsProduct>): Promise<string> {
    const response = await this.apiContext.post(`${this.baseUrl}/cms/products`, {
      headers: this.getHeaders(),
      data: product,
    });
    const data = await response.json() as ApiResponse<{ id: string }>;
    if (!data.success || !data.data?.id) {
      throw new Error(data.message || 'Failed to create product');
    }
    return data.data.id;
  }

  async updateProduct(id: string, product: Partial<CmsProduct>): Promise<void> {
    const response = await this.apiContext.put(`${this.baseUrl}/cms/products/${id}`, {
      headers: this.getHeaders(),
      data: product,
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to update product');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await this.apiContext.delete(`${this.baseUrl}/cms/products/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete product');
    }
  }

  // --- Services ---
  async createService(service: Partial<CmsService>): Promise<string> {
    const response = await this.apiContext.post(`${this.baseUrl}/cms/services`, {
      headers: this.getHeaders(),
      data: service,
    });
    const data = await response.json() as ApiResponse<{ id: string }>;
    if (!data.success || !data.data?.id) {
      throw new Error(data.message || 'Failed to create service');
    }
    return data.data.id;
  }

  async updateService(id: string, service: Partial<CmsService>): Promise<void> {
    const response = await this.apiContext.put(`${this.baseUrl}/cms/services/${id}`, {
      headers: this.getHeaders(),
      data: service,
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to update service');
    }
  }

  async deleteService(id: string): Promise<void> {
    const response = await this.apiContext.delete(`${this.baseUrl}/cms/services/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete service');
    }
  }

  // --- Portfolio ---
  async createPortfolio(project: Partial<CmsPortfolio>): Promise<string> {
    const response = await this.apiContext.post(`${this.baseUrl}/cms/portfolio`, {
      headers: this.getHeaders(),
      data: project,
    });
    const data = await response.json() as ApiResponse<{ id: string }>;
    if (!data.success || !data.data?.id) {
      throw new Error(data.message || 'Failed to create portfolio item');
    }
    return data.data.id;
  }

  async updatePortfolio(id: string, project: Partial<CmsPortfolio>): Promise<void> {
    const response = await this.apiContext.put(`${this.baseUrl}/cms/portfolio/${id}`, {
      headers: this.getHeaders(),
      data: project,
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to update portfolio item');
    }
  }

  async deletePortfolio(id: string): Promise<void> {
    const response = await this.apiContext.delete(`${this.baseUrl}/cms/portfolio/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete portfolio item');
    }
  }

  // --- Insights ---
  async createInsight(insight: Partial<CmsInsight>): Promise<string> {
    const response = await this.apiContext.post(`${this.baseUrl}/cms/insights`, {
      headers: this.getHeaders(),
      data: insight,
    });
    const data = await response.json() as ApiResponse<{ id: string }>;
    if (!data.success || !data.data?.id) {
      throw new Error(data.message || 'Failed to create insight');
    }
    return data.data.id;
  }

  async updateInsight(id: string, insight: Partial<CmsInsight>): Promise<void> {
    const response = await this.apiContext.put(`${this.baseUrl}/cms/insights/${id}`, {
      headers: this.getHeaders(),
      data: insight,
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to update insight');
    }
  }

  async deleteInsight(id: string): Promise<void> {
    const response = await this.apiContext.delete(`${this.baseUrl}/cms/insights/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete insight');
    }
  }

  // --- Testimonials ---
  async createTestimonial(testimonial: Partial<CmsTestimonial>): Promise<string> {
    const response = await this.apiContext.post(`${this.baseUrl}/cms/testimonials`, {
      headers: this.getHeaders(),
      data: testimonial,
    });
    const data = await response.json() as ApiResponse<{ id: string }>;
    if (!data.success || !data.data?.id) {
      throw new Error(data.message || 'Failed to create testimonial');
    }
    return data.data.id;
  }

  async updateTestimonial(id: string, testimonial: Partial<CmsTestimonial>): Promise<void> {
    const response = await this.apiContext.put(`${this.baseUrl}/cms/testimonials/${id}`, {
      headers: this.getHeaders(),
      data: testimonial,
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to update testimonial');
    }
  }

  async deleteTestimonial(id: string): Promise<void> {
    const response = await this.apiContext.delete(`${this.baseUrl}/cms/testimonials/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete testimonial');
    }
  }

  // --- Navigation ---
  async createNavItem(item: Partial<NavigationItem>): Promise<string> {
    const response = await this.apiContext.post(`${this.baseUrl}/cms/navigation`, {
      headers: this.getHeaders(),
      data: item,
    });
    const data = await response.json() as ApiResponse<{ id: string }>;
    if (!data.success || !data.data?.id) {
      throw new Error(data.message || 'Failed to create navigation item');
    }
    return data.data.id;
  }

  async updateNavItem(id: string, item: Partial<NavigationItem>): Promise<void> {
    const response = await this.apiContext.put(`${this.baseUrl}/cms/navigation/${id}`, {
      headers: this.getHeaders(),
      data: item,
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to update navigation item');
    }
  }

  async deleteNavItem(id: string): Promise<void> {
    const response = await this.apiContext.delete(`${this.baseUrl}/cms/navigation/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete navigation item');
    }
  }

  // --- Enquiries ---
  async fetchEnquiries(): Promise<any[]> {
    const response = await this.apiContext.get(`${this.baseUrl}/cms/enquiries`, {
      headers: this.getHeaders(),
    });
    const data = await response.json() as ApiResponse<{ enquiries: any[] }>;
    return data.data?.enquiries || [];
  }

  async updateEnquiryStatus(id: string, status: string, followUpNote?: string): Promise<void> {
    const response = await this.apiContext.patch(`${this.baseUrl}/cms/enquiries/${id}`, {
      headers: this.getHeaders(),
      data: { status, followUpNote },
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to update enquiry');
    }
  }

  async deleteEnquiry(id: string): Promise<void> {
    const response = await this.apiContext.delete(`${this.baseUrl}/cms/enquiries/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete enquiry');
    }
  }

  // --- Media ---
  async fetchMedia(): Promise<any[]> {
    const response = await this.apiContext.get(`${this.baseUrl}/cms/media`, {
      headers: this.getHeaders(),
    });
    const data = await response.json() as ApiResponse<{ media: any[] }>;
    return data.data?.media || [];
  }

  async uploadMedia(file: File, category = 'general', altText?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (altText) formData.append('altText', altText);

    const response = await this.apiContext.post(`${this.baseUrl}/cms/media/upload`, {
      headers: { 'Authorization': `Bearer ${this.token}` },
      multipart: formData,
    });
    return response.json();
  }

  async deleteMedia(id: string): Promise<void> {
    const response = await this.apiContext.delete(`${this.baseUrl}/cms/media/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json() as ApiResponse<void>;
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete media');
    }
  }

  // --- Audit Logs ---
  async fetchAuditLogs(): Promise<any[]> {
    const response = await this.apiContext.get(`${this.baseUrl}/cms/audit-logs`, {
      headers: this.getHeaders(),
    });
    const data = await response.json() as ApiResponse<{ logs: any[] }>;
    return data.data?.logs || [];
  }
}

export async function createApiClient(baseUrl?: string): Promise<CmsApiClient> {
  const apiContext = await request.newContext({
    baseURL: baseUrl || process.env.E2E_API_BASE_URL || 'http://localhost:3000/api',
  });
  return new CmsApiClient(apiContext, baseUrl || process.env.E2E_API_BASE_URL || 'http://localhost:3000/api');
}