import 'dotenv/config';
import { executeQuery, tbl } from '../src/server/core/database.ts';

async function main() {
  const sessions = await executeQuery<any>(`SELECT id, user_id, token, mfa_verified, expires_at, created_at FROM ${tbl('sessions')} ORDER BY created_at DESC LIMIT 10`);
  console.log('Sessions count:', sessions.length);
  console.log(JSON.stringify(sessions, null, 2));

  const users = await executeQuery<any>(`SELECT id, email, role, two_factor_enabled, force_mfa_enrollment, is_active FROM ${tbl('users')}`);
  console.log('Users count:', users.length);
  console.log(JSON.stringify(users, null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
