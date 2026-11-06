import { FullConfig, chromium } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

// Load test environment
dotenv.config({ path: '.env.test' });
dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.E2E_API_BASE_URL || `${BASE_URL}/api`;

async function waitForServer(url: string, timeout = 120000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          console.log('✅ Server is ready');
          return;
        }
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeout}ms`);
}

async function waitForReadiness(url: string, timeout = 60000): Promise<void> {
  const secret = process.env.HEALTH_CHECK_SECRET || 'test-health-secret-123';
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`${url}/api/health/ready`, {
        headers: { 'x-health-secret': secret },
      });
      if (res.status === 200) {
        const data = await res.json();
        if (data.status === 'ready') {
          console.log('✅ Server readiness check passed');
          return;
        }
      }
    } catch {
      // Not ready yet
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Server readiness check failed within ${timeout}ms`);
}

async function setupTestDatabase(): Promise<void> {
  console.log('🔧 Setting up test database...');

  // Run migrations against test database
  const { execSync } = await import('node:child_process');
  try {
    execSync('npm run db:migrate', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
    console.log('✅ Database migrations applied');
  } catch (error) {
    console.warn('⚠️ Migration failed (may be expected if DB not running):', error);
  }

  // Seed test data
  try {
    execSync('npm run db:seed', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
    console.log('✅ Test database seeded');
  } catch (error) {
    console.warn('⚠️ Seeding failed (may be expected):', error);
  }
}

async function createTestAdminSession(): Promise<string> {
  console.log('🔐 Creating test admin session...');

  const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@test.azaroth.tech';
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'TestAdminPass123!';

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create admin session: ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.success || !data.token) {
    throw new Error('Login succeeded but no token returned');
  }

  console.log('✅ Admin session created');
  return data.token;
}

async function verifyCmsApiAccess(token: string): Promise<void> {
  console.log('🔍 Verifying CMS API access...');

  const res = await fetch(`${API_BASE_URL}/cms/all`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`CMS API access failed: ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.success || !data.data) {
    throw new Error('CMS API returned invalid response');
  }

  console.log('✅ CMS API accessible with admin token');
  console.log(`   - Products: ${data.data.products?.length || 0}`);
  console.log(`   - Services: ${data.data.services?.length || 0}`);
  console.log(`   - Portfolio: ${data.data.portfolio?.length || 0}`);
  console.log(`   - Insights: ${data.data.insights?.length || 0}`);
  console.log(`   - Testimonials: ${data.data.testimonials?.length || 0}`);
}

async function setupTestFixtures(): Promise<Record<string, any>> {
  console.log('📦 Setting up test fixtures...');

  // Create test fixtures directory
  const fixturesDir = path.join(process.cwd(), 'tests', 'e2e', 'fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  // Create test data fixtures
  const fixtures = {
    testProduct: {
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
    },
    testService: {
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
    },
  };

  fs.writeFileSync(
    path.join(fixturesDir, 'test-data.json'),
    JSON.stringify(fixtures, null, 2)
  );

  console.log('✅ Test fixtures created');
  return fixtures;
}

export default async function globalSetup(config: FullConfig) {
  console.log('\n🚀 Starting E2E Test Global Setup\n');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   API URL:  ${API_BASE_URL}`);
  console.log(`   CI Mode:  ${process.env.CI ? 'Yes' : 'No'}\n`);

  // Wait for server to be ready
  await waitForServer(BASE_URL);
  await waitForReadiness(BASE_URL);

  // Setup database (if not in CI with external DB)
  if (!process.env.CI || process.env.SETUP_TEST_DB === 'true') {
    await setupTestDatabase();
  }

  // Create admin session for API tests
  const adminToken = await createTestAdminSession();

  // Verify CMS API access
  await verifyCmsApiAccess(adminToken);

  // Setup test fixtures
  const fixtures = await setupTestFixtures();

  // Store auth token for tests to use
  const storageState = {
    cookies: [],
    origins: [{
      origin: BASE_URL,
      localStorage: [
        { name: 'azaroth_admin_token', value: adminToken },
        { name: 'azaroth_test_fixtures', value: JSON.stringify(fixtures) },
      ],
    }],
  };

  const authFile = path.join(process.cwd(), 'tests', 'e2e', '.auth', 'admin.json');
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));

  console.log('\n✅ Global setup complete\n');
}