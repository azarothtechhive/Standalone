import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });
dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const CMS_BASE_URL = process.env.E2E_CMS_BASE_URL || BASE_URL;
const API_BASE_URL = process.env.E2E_API_BASE_URL || `${BASE_URL}/api`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 60000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: { maxDiffPixels: 100 },
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['line'],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'api',
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    // url: BASE_URL,
    // reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
      VITE_API_BASE_URL: API_BASE_URL,
    },
  },
  // globalSetup: './tests/e2e/global-setup.ts',
  // globalTeardown: './tests/e2e/global-teardown.ts',
  metadata: {
    cmsBaseUrl: CMS_BASE_URL,
    apiBaseUrl: API_BASE_URL,
  },
});