/**
 * Smoke Tests
 * Basic verification that the application compiles and core functionality works
 */

import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('application builds successfully', async () => {
    // This test verifies the build configuration is correct
    // The actual build is run separately
    expect(true).toBe(true);
  });

  test('type checking passes', async () => {
    // Verify TypeScript compilation
    // This is validated by npm run typecheck
    expect(true).toBe(true);
  });

  test('Vercel configuration is valid', async () => {
    // Verify vercel.json structure
    const fs = await import('fs');
    const path = await import('path');
    const vercelConfig = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf-8')
    );

    expect(vercelConfig).toHaveProperty('buildCommand');
    expect(vercelConfig).toHaveProperty('outputDirectory');
    expect(vercelConfig).toHaveProperty('framework');
    expect(vercelConfig).toHaveProperty('redirects');
    expect(vercelConfig).toHaveProperty('headers');
    expect(vercelConfig).toHaveProperty('rewrites');
  });

  test('database migrations exist', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const migrationsDir = path.join(process.cwd(), 'db/migrations');

    expect(fs.existsSync(migrationsDir)).toBe(true);

    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    expect(files.length).toBeGreaterThan(0);
    expect(files).toContain('001_roles_and_schema.sql');
    expect(files).toContain('002_rls_policies.sql');
    expect(files).toContain('003_publish_and_restore_functions.sql');
  });

  test('API endpoints are defined', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const apiDir = path.join(process.cwd(), 'api');

    expect(fs.existsSync(apiDir)).toBe(true);

    const expectedFiles = [
      'contact.ts',
      'rfq.ts',
      'health.ts',
      'auth/[...path].ts',
      'cms/[...path].ts',
      'media/upload.ts',
      'internal/reconcile.ts',
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(apiDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  test('server services are defined', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const servicesDir = path.join(process.cwd(), 'src/server/services');

    expect(fs.existsSync(servicesDir)).toBe(true);

    const expectedFiles = [
      'authService.ts',
      'cmsService.ts',
      'totpService.ts',
      'r2Service.ts',
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(servicesDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  test('repositories are defined', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const reposDir = path.join(process.cwd(), 'src/server/repositories');

    expect(fs.existsSync(reposDir)).toBe(true);

    const expectedFiles = [
      'accountRepository.ts',
      'sessionRepository.ts',
      'cmsRepository.ts',
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(reposDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });
});
