import { test as base } from '@playwright/test';
import { CmsApiClient, createApiClient } from '../utils/api-client';

export interface TestFixtures {
  apiClient: CmsApiClient;
  authenticatedClient: CmsApiClient;
  cleanup: (type?: string, id?: string) => Promise<void>;
}

export const test = base.extend<TestFixtures>({
  apiClient: async ({}, use) => {
    const client = await createApiClient();
    await use(client);
    // Cleanup handled by test teardown
  },

  authenticatedClient: async ({ apiClient }, use) => {
    const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@test.azaroth.tech';
    const password = process.env.INITIAL_ADMIN_PASSWORD || 'TestAdminPass123!';
    await apiClient.login(email, password);
    await use(apiClient);
    await apiClient.logout();
  },

  cleanup: async ({}, use) => {
    const created: { type: string; id: string }[] = [];
    await use(async (type?: string, id?: string) => {
      if (type && id) {
        created.push({ type, id });
      }
    });
    // Cleanup all created items in reverse order
    const apiClient = await createApiClient();
    const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@test.azaroth.tech';
    const password = process.env.INITIAL_ADMIN_PASSWORD || 'TestAdminPass123!';
    await apiClient.login(email, password);

    for (const item of created.reverse()) {
      try {
        switch (item.type) {
          case 'product':
            await apiClient.deleteProduct(item.id);
            break;
          case 'service':
            await apiClient.deleteService(item.id);
            break;
          case 'portfolio':
            await apiClient.deletePortfolio(item.id);
            break;
          case 'insight':
            await apiClient.deleteInsight(item.id);
            break;
          case 'testimonial':
            await apiClient.deleteTestimonial(item.id);
            break;
          case 'navigation':
            await apiClient.deleteNavItem(item.id);
            break;
          case 'enquiry':
            await apiClient.deleteEnquiry(item.id);
            break;
          case 'media':
            await apiClient.deleteMedia(item.id);
            break;
        }
      } catch (error) {
        console.warn(`Cleanup failed for ${item.type}:${item.id}:`, error);
      }
    }
    await apiClient.logout();
  },
});

export { expect } from '@playwright/test';

// Test data factories
export const factories = {
  product: (overrides: Partial<any> = {}): any => ({
    id: `test-product-${Date.now()}`,
    name: 'E2E Test Product',
    slug: 'e2e-test-product',
    tagline: 'Automated test product',
    shortDescription: 'Created by e2e tests',
    fullDescription: 'This product was created during e2e test setup',
    coverImage: '/images/test-cover.jpg',
    isFeatured: false,
    status: 'PUBLISHED' as const,
    order: 999,
    technologies: ['Test', 'Playwright'],
    benefits: ['Automated testing', 'CI/CD integration'],
    badge: 'E2E',
    ctaText: 'View Details',
    ctaLink: '/products/e2e-test-product',
    ...overrides,
  }),

  service: (overrides: Partial<any> = {}): any => ({
    id: `test-service-${Date.now()}`,
    title: 'E2E Test Service',
    slug: 'e2e-test-service',
    summary: 'Automated test service',
    description: 'This service was created during e2e test setup',
    iconName: 'TestTube',
    processSteps: [
      { step: '1', title: 'Setup', desc: 'Configure test environment' },
      { step: '2', title: 'Run', desc: 'Execute tests' },
      { step: '3', title: 'Verify', desc: 'Validate results' },
    ],
    metrics: { coverage: '100%', speed: '<1min' },
    status: 'PUBLISHED' as const,
    order: 999,
    technologies: ['Playwright', 'TypeScript'],
    industries: ['Software Testing'],
    ctaText: 'Learn More',
    ctaLink: '/services/e2e-test-service',
    ...overrides,
  }),

  portfolio: (overrides: Partial<any> = {}): any => ({
    id: `test-portfolio-${Date.now()}`,
    name: 'E2E Test Project',
    slug: 'e2e-test-project',
    clientName: 'Test Client Inc.',
    clientType: 'Enterprise',
    industry: 'Software Testing',
    category: 'Web Development · Testing',
    summary: 'Automated test project',
    challenge: 'Need for automated testing',
    solution: 'Implemented comprehensive e2e test suite',
    outcomes: ['Automated testing', 'CI/CD integration'],
    technologies: ['Playwright', 'TypeScript'],
    coverImage: '/images/test-cover.jpg',
    isFeatured: false,
    order: 999,
    ...overrides,
  }),

  insight: (overrides: Partial<any> = {}): any => ({
    id: `test-insight-${Date.now()}`,
    title: 'E2E Test Insight',
    slug: 'e2e-test-insight',
    excerpt: 'Automated test insight',
    content: 'This insight was created during e2e test setup',
    coverImage: '/images/test-cover.jpg',
    authorName: 'Test Author',
    authorRole: 'QA Engineer',
    category: 'Testing',
    tags: ['E2E', 'Testing', 'Playwright'],
    readTime: '5 min read',
    isFeatured: false,
    status: 'PUBLISHED' as const,
    ...overrides,
  }),

  testimonial: (overrides: Partial<any> = {}): any => ({
    id: `test-testimonial-${Date.now()}`,
    clientName: 'Test Client',
    role: 'CTO',
    organization: 'Test Corp',
    avatarUrl: '/images/test-avatar.jpg',
    rating: 5,
    quote: 'Excellent automated testing framework.',
    isFeatured: false,
    order: 999,
    ...overrides,
  }),

  navItem: (overrides: Partial<any> = {}): any => ({
    id: `test-nav-${Date.now()}`,
    label: 'Test Navigation',
    path: '/test-navigation',
    order: 999,
    isVisible: true,
    isExternal: false,
    ...overrides,
  }),
};