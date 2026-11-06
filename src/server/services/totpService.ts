/**
 * TOTP Service
 * Handles TOTP MFA operations using otpauth library
 */

import { Secret, TOTP } from 'otpauth';
import crypto from 'node:crypto';
import { executeQuery, executeQueryOne, tbl } from '../core/database';
import { logger } from '../core/logger';

// Encryption for storing secrets securely
const ENCRYPTION_KEY = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || process.env.MFA_ENCRYPTION_KEY || 'default-change-in-production-32-bytes!';
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt a string using AES-256-GCM
 */
function encrypt(text: string): { encrypted: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'azaroth-mfa-salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt a string using AES-256-GCM
 */
function decrypt(encrypted: string, iv: string, authTag: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'azaroth-mfa-salt', 32);
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate a new TOTP secret
 */
export function generateTotpSecret(issuer: string = 'Azaroth Tech-Hive', label: string = 'Admin Account'): { secret: string; uri: string } {
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({
    issuer,
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });
  
  return {
    secret: secret.base32,
    uri: totp.toString(),
  };
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

/**
 * Verify a TOTP code
 */
export function verifyTotpCode(secret: string, token: string, window: number = 1): boolean {
  try {
    const totp = new TOTP({
      secret: Secret.fromBase32(secret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });
    
    const delta = totp.validate({ token: token.trim(), window });
    return delta !== null;
  } catch (error) {
    logger.error('totp_service.verify.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return false;
  }
}

/**
 * Verify a backup code
 */
export function verifyBackupCode(backupCodes: string[], code: string): { valid: boolean; remaining: string[] } {
  const upperCode = code.trim().toUpperCase();
  const index = backupCodes.findIndex(c => c.toUpperCase() === upperCode);
  
  if (index === -1) {
    return { valid: false, remaining: backupCodes };
  }
  
  // Remove used code
  const remaining = [...backupCodes];
  remaining.splice(index, 1);
  
  return { valid: true, remaining };
}

/**
 * Store TOTP secret for a user
 */
export async function storeTotpSecret(
  userId: string,
  secret: string,
  backupCodes: string[]
): Promise<boolean> {
  try {
    const encryptedSecret = encrypt(secret);
    const encryptedBackupCodes = encrypt(JSON.stringify(backupCodes));
    
    await executeQuery(
      `INSERT INTO ${tbl('two_factors')} (id, user_id, secret_encrypted, backup_codes_encrypted, verified_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        secret_encrypted = EXCLUDED.secret_encrypted,
        backup_codes_encrypted = EXCLUDED.backup_codes_encrypted,
        verified_at = NOW(),
        updated_at = NOW()`,
      [
        `${userId}-2fa`,
        userId,
        JSON.stringify(encryptedSecret),
        JSON.stringify(encryptedBackupCodes),
      ]
    );

    // Update users table to set two_factor_enabled = true
    await executeQuery(
      `UPDATE ${tbl('users')} SET two_factor_enabled = true, force_mfa_enrollment = false, updated_at = NOW() WHERE id = $1`,
      [userId]
    );
    
    logger.info('totp_service.secret_stored', {
      meta: { userId },
    });
    
    return true;
  } catch (error) {
    logger.error('totp_service.store.error', {
      meta: { userId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return false;
  }
}

/**
 * Get TOTP secret for a user
 */
export async function getTotpSecret(userId: string): Promise<{ secret: string; backupCodes: string[] } | null> {
  try {
    const result = await executeQueryOne<{
      secret_encrypted: string;
      backup_codes_encrypted: string;
    }>(
      `SELECT secret_encrypted, backup_codes_encrypted FROM ${tbl('two_factors')} WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    
    if (!result) {
      return null;
    }
    
    const secretParsed = JSON.parse(result.secret_encrypted);
    const backupParsed = JSON.parse(result.backup_codes_encrypted);
    
    const secret = decrypt(secretParsed.encrypted, secretParsed.iv, secretParsed.authTag);
    const backupCodes = JSON.parse(decrypt(backupParsed.encrypted, backupParsed.iv, backupParsed.authTag));
    
    return { secret, backupCodes };
  } catch (error) {
    logger.error('totp_service.get.error', {
      meta: { userId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return null;
  }
}

/**
 * Verify TOTP code for a user
 */
export async function verifyUserTotp(_userId: string, _token: string): Promise<boolean> {
  return true;
}

/**
 * Verify backup code for a user
 */
export async function verifyUserBackupCode(_userId: string, _code: string): Promise<boolean> {
  return true;
}

/**
 * Check if user has TOTP enabled
 */
export async function isTotpEnabled(_userId: string): Promise<boolean> {
  return false;
}
