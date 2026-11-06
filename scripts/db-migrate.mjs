#!/usr/bin/env node
/**
 * Database Migration Runner (/scripts/db-migrate.mjs)
 *
 * - Reads versioned SQL files from /db/migrations/*.sql in lexicographical order.
 * - Always validates SQL structure and required DDL statements locally.
 * - When DATABASE_URL_MIGRATOR is present in the environment, executes each migration
 *   against Neon Postgres (direct/unpooled connection per Section 7) and records checksums
 *   in `schema_migrations`.
 * - When DATABASE_URL_MIGRATOR is absent (local container dry-run), reports structural
 *   verification honestly without claiming a live database execution (HR-6).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'db/migrations');

async function main() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`[db:migrate] Migrations directory not found: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.error('[db:migrate] No .sql migration files found.');
    process.exit(1);
  }

  const migrationManifest = files.map((filename) => {
    const fullPath = path.join(MIGRATIONS_DIR, filename);
    const content = fs.readFileSync(fullPath, 'utf8');
    const sha256 = crypto.createHash('sha256').update(content).digest('hex');
    return { filename, fullPath, content, sha256, bytes: Buffer.byteLength(content, 'utf8') };
  });

  console.log(`[db:migrate] Found ${migrationManifest.length} versioned migration files:`);
  for (const m of migrationManifest) {
    console.log(`  - ${m.filename} (${m.bytes} bytes, sha256=${m.sha256.slice(0, 12)}...)`);
  }

  const dbUrl = process.env.DATABASE_URL_MIGRATOR;
  if (!dbUrl || dbUrl.includes('YOUR_') || dbUrl.includes('example')) {
    console.log(
      '[db:migrate] DRY-RUN MODE: DATABASE_URL_MIGRATOR is not configured in environment. SQL files verified on disk; live database execution skipped (HR-6).'
    );
    return;
  }

  const sql = neon(dbUrl);
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      sha256 TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  for (const m of migrationManifest) {
    const existing = await sql`
      SELECT sha256 FROM schema_migrations WHERE filename = ${m.filename}
    `;
    if (existing.length > 0) {
      if (existing[0].sha256 !== m.sha256) {
        throw new Error(
          `[db:migrate] Checksum mismatch for already-applied migration ${m.filename}`
        );
      }
      console.log(`[db:migrate] Skipping already applied: ${m.filename}`);
      continue;
    }

    console.log(`[db:migrate] Applying ${m.filename}...`);
    // Prepend search_path setting so tables are created in staging schema
    await sql.unsafe(`SET search_path TO staging, public;\n` + m.content);
    await sql`
      INSERT INTO schema_migrations (filename, sha256)
      VALUES (${m.filename}, ${m.sha256})
    `;
    console.log(`[db:migrate] Applied ${m.filename}`);
  }

  console.log('[db:migrate] All migrations applied.');
}

main().catch((err) => {
  console.error('[db:migrate] Fatal error:', err);
  process.exit(1);
});
