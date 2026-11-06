import { FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export default async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Starting E2E Test Global Teardown\n');

  // Clean up test auth file
  const authFile = path.join(process.cwd(), 'tests', 'e2e', '.auth', 'admin.json');
  if (fs.existsSync(authFile)) {
    fs.unlinkSync(authFile);
    console.log('✅ Cleaned up auth file');
  }

  // Clean up test fixtures
  const fixturesDir = path.join(process.cwd(), 'tests', 'e2e', 'fixtures');
  if (fs.existsSync(fixturesDir)) {
    fs.rmSync(fixturesDir, { recursive: true, force: true });
    console.log('✅ Cleaned up test fixtures');
  }

  // Clean up test database (only in local development)
  if (!process.env.CI && process.env.CLEANUP_TEST_DB === 'true') {
    console.log('🗑️ Cleaning up test database...');
    try {
      const { execSync } = await import('node:child_process');
      execSync('npm run db:migrate down', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      });
      console.log('✅ Test database cleaned up');
    } catch (error) {
      console.warn('⚠️ Database cleanup failed:', error);
    }
  }

  console.log('\n✅ Global teardown complete\n');
}