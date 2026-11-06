import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import * as r2Service from '../src/server/services/r2Service.ts';

async function verifyR2() {
  console.log('=== STAGING CLOUDFLARE R2 VERIFICATION ===\n');

  // 1. Configuration check
  const isConfigured = r2Service.isR2Configured();
  console.log(`[1] R2 Service Configuration: ${isConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);

  if (!isConfigured) {
    console.log('    R2 credentials missing or incomplete.');
    console.log('    R2_ACCOUNT_ID:', process.env.R2_ACCOUNT_ID ? 'SET' : 'MISSING');
    console.log('    R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? 'SET' : 'MISSING');
    console.log('    R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? 'SET' : 'MISSING');
    console.log('    R2_BUCKET:', process.env.R2_BUCKET || 'NOT SET (default: azaroth-cms-media)');
    return;
  }

  // 2. Test live upload to private staging bucket
  const testKey = `staging-probes/test-${Date.now()}.txt`;
  const testPayload = Buffer.from(`Azaroth Tech-Hive Staging Probe ${new Date().toISOString()}`, 'utf-8');
  console.log(`[2] Uploading test object to private bucket: ${testKey}...`);

  const uploadRes = await r2Service.uploadToR2(testKey, testPayload, 'text/plain', 'private');
  console.log(`    Upload result:`, uploadRes.success ? 'SUCCESS' : `FAILED (${uploadRes.error})`);

  if (uploadRes.success) {
    console.log(`    Object URL / Endpoint: ${uploadRes.url}`);

    // 3. Test deletion from private bucket
    console.log(`[3] Deleting test object from private bucket...`);
    const deleteRes = await r2Service.deleteFromR2(testKey, 'private');
    console.log(`    Delete result:`, deleteRes.success ? 'SUCCESS' : `FAILED (${deleteRes.error})`);
  }

  // 4. Verify client bundle leakage
  console.log(`[4] Scanning production client bundles in dist/ for R2 secret key leaks...`);
  const distDir = path.join(process.cwd(), 'dist/assets');
  if (fs.existsSync(distDir)) {
    const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
    let leaked = false;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;

    for (const f of jsFiles) {
      const content = fs.readFileSync(path.join(distDir, f), 'utf-8');
      if (secretKey && content.includes(secretKey)) {
        console.error(`    SECURITY ALERT: Secret key found in client bundle ${f}!`);
        leaked = true;
      }
      if (content.includes('r2.cloudflarestorage.com') && content.includes('SECRET')) {
        console.error(`    SECURITY ALERT: Storage secrets detected in ${f}!`);
        leaked = true;
      }
    }
    console.log(`    Client bundle leak check:`, leaked ? 'FAIL (Secrets leaked)' : 'PASS (Zero secrets in bundle)');
  } else {
    console.log(`    dist/assets not found, skipping bundle scan.`);
  }

  console.log('\n=== R2 VERIFICATION COMPLETE ===');
}

verifyR2().catch((e) => {
  console.error('[verify-r2] Error:', e);
  process.exit(1);
});
