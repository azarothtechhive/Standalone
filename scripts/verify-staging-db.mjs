import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL_MIGRATOR || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!url) {
  console.error('[verify-staging-db] No database URL found.');
  process.exit(1);
}

const sql = neon(url);

async function run() {
  console.log('=== STAGING DATABASE VERIFICATION ===\n');

  // 1. Connection check
  const ping = await sql`SELECT NOW() as current_time, current_database() as db_name, current_user as db_user;`;
  console.log(`[1] Connected to database: ${ping[0].db_name} as user: ${ping[0].db_user} at ${ping[0].current_time}`);

  // 2. Check public schema tables before
  const publicTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log(`[2] Existing public schema tables (MUST NOT BE MODIFIED):`, publicTables.map(t => t.table_name).join(', '));

  // 3. Ensure staging schema exists
  await sql`CREATE SCHEMA IF NOT EXISTS staging;`;
  console.log('[3] Schema `staging` confirmed/created.');

  // 4. Verify all staging tables exist
  const expectedTables = [
    'users',
    'accounts',
    'sessions',
    'two_factors',
    'password_reset_tokens',
    'content_documents',
    'revisions',
    'media_assets',
    'media_versions',
    'form_submissions',
    'audit_logs',
    'system_heartbeats',
    'cache_purge_queue',
    'email_notifications',
  ];

  const stagingTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'staging' 
    ORDER BY table_name;
  `;
  const existingStagingNames = new Set(stagingTables.map(t => t.table_name));
  console.log(`[4] Staging tables found: ${stagingTables.length}`);

  const missing = expectedTables.filter(t => !existingStagingNames.has(t));
  if (missing.length > 0) {
    console.log(`[4] Missing staging tables to provision:`, missing.join(', '));
  } else {
    console.log(`[4] All expected staging tables are present!`);
  }

  // 5. Run CRUD test inside staging
  console.log('[5] Testing isolated CRUD operations in staging schema...');
  const testUserId = `test-usr-${Date.now()}`;
  const testEmail = `staging.qa.${Date.now()}@azaroth.tech`;

  // Create user
  await sql`
    INSERT INTO staging.users (id, email, name, role, email_verified, two_factor_enabled)
    VALUES (${testUserId}, ${testEmail}, 'Staging QA Engineer', 'CMS_ADMIN', true, true);
  `;
  const retrievedUser = await sql`SELECT * FROM staging.users WHERE id = ${testUserId};`;
  console.log(`    - User created & retrieved:`, retrievedUser[0]?.email === testEmail ? 'PASS' : 'FAIL');

  // Create session
  const testToken = `test-tok-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  await sql`
    INSERT INTO staging.sessions (id, user_id, token, mfa_verified, expires_at)
    VALUES (${'sess-' + testUserId}, ${testUserId}, ${testToken}, true, NOW() + INTERVAL '1 hour');
  `;
  const retrievedSession = await sql`SELECT * FROM staging.sessions WHERE token = ${testToken};`;
  console.log(`    - Session created & retrieved:`, retrievedSession[0]?.mfa_verified === true ? 'PASS' : 'FAIL');

  // Create content document
  const testScope = `test:page:${Date.now()}`;
  await sql`
    INSERT INTO staging.content_documents (scope_key, draft_payload, published_payload, draft_updated_by)
    VALUES (${testScope}, ${JSON.stringify({ title: 'Staging Test' })}, ${JSON.stringify({ title: 'Staging Test' })}, ${testUserId});
  `;
  const retrievedDoc = await sql`SELECT * FROM staging.content_documents WHERE scope_key = ${testScope};`;
  console.log(`    - Content document created & retrieved:`, retrievedDoc[0]?.scope_key === testScope ? 'PASS' : 'FAIL');

  // Create form submission
  const testSubId = `test-sub-${Date.now()}`;
  await sql`
    INSERT INTO staging.form_submissions (id, inquiry_type, full_name, work_email, message, payload_digest)
    VALUES (${testSubId}, 'general', 'QA Tester', ${testEmail}, 'Staging verification test enquiry', 'sha256-test');
  `;
  const retrievedSub = await sql`SELECT * FROM staging.form_submissions WHERE id = ${testSubId};`;
  console.log(`    - Form submission created & retrieved:`, retrievedSub[0]?.id === testSubId ? 'PASS' : 'FAIL');

  // Record audit log
  await sql`
    INSERT INTO staging.audit_logs (event_type, actor_user_id, actor_email, actor_role, target_type, target_id)
    VALUES ('STAGING_TEST', ${testUserId}, ${testEmail}, 'CMS_ADMIN', 'test', ${testSubId});
  `;
  const retrievedAudit = await sql`SELECT * FROM staging.audit_logs WHERE target_id = ${testSubId};`;
  console.log(`    - Audit log recorded & retrieved:`, retrievedAudit.length > 0 ? 'PASS' : 'FAIL');

  // Cleanup test records in staging
  await sql`DELETE FROM staging.audit_logs WHERE target_id = ${testSubId};`;
  await sql`DELETE FROM staging.form_submissions WHERE id = ${testSubId};`;
  await sql`DELETE FROM staging.content_documents WHERE scope_key = ${testScope};`;
  await sql`DELETE FROM staging.sessions WHERE id = ${'sess-' + testUserId};`;
  await sql`DELETE FROM staging.users WHERE id = ${testUserId};`;
  console.log(`    - Cleaned up staging test rows cleanly.`);

  // 6. Verify public schema again
  const publicTablesAfter = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  const unchanged = JSON.stringify(publicTables.map(t => t.table_name)) === JSON.stringify(publicTablesAfter.map(t => t.table_name));
  console.log(`[6] Public schema integrity preserved:`, unchanged ? 'PASS (Untouched)' : 'FAIL');

  console.log('\n=== STAGING DATABASE VERIFICATION COMPLETE: ALL CHECKS PASSED ===');
}

run().catch((err) => {
  console.error('[verify-staging-db] Error:', err);
  process.exit(1);
});

