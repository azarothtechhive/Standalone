/**
 * Account Repository
 * Handles persistent storage and retrieval of user accounts
 * Replaces in-memory serverAccounts Map with database operations
 */

import crypto from 'node:crypto';
import { executeQuery, executeQueryOne, tbl, type ConnectionType } from '../core/database';
import { logger } from '../core/logger';

export interface StoredAccount {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'CMS_ADMIN' | 'CONTENT_EDITOR' | 'VIEWER' | 'admin' | 'editor';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  forceMfaEnrollment: boolean;
  failedLoginCount: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
}

/**
 * Hash password using scrypt
 */
export function hashPasswordScrypt(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

/**
 * Verify password using timing-safe comparison
 */
export function verifyPasswordScrypt(password: string, salt: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashPasswordScrypt(password, salt), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

/**
 * Find account by email
 */
export async function findAccountByEmail(email: string): Promise<StoredAccount | null> {
  try {
    const result = await executeQueryOne<StoredAccount>(
      `SELECT 
        id, 
        email, 
        name, 
        role, 
        email_verified as "emailVerified",
        two_factor_enabled as "twoFactorEnabled",
        force_mfa_enrollment as "forceMfaEnrollment",
        failed_login_count as "failedLoginCount",
        locked_until as "lockedUntil",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt",
        (locked_until IS NULL OR locked_until <= NOW()) as "isActive"
      FROM ${tbl('users')} 
      WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );
    
    return result;
  } catch (error) {
    logger.error('account_repository.find_by_email.error', {
      meta: { email, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Find account by ID
 */
export async function findAccountById(id: string): Promise<StoredAccount | null> {
  try {
    const result = await executeQueryOne<StoredAccount>(
      `SELECT 
        id, 
        email, 
        name, 
        role, 
        email_verified as "emailVerified",
        two_factor_enabled as "twoFactorEnabled",
        force_mfa_enrollment as "forceMfaEnrollment",
        failed_login_count as "failedLoginCount",
        locked_until as "lockedUntil",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt",
        (locked_until IS NULL OR locked_until <= NOW()) as "isActive"
      FROM ${tbl('users')} 
      WHERE id = $1`,
      [id]
    );
    
    return result;
  } catch (error) {
    logger.error('account_repository.find_by_id.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Create a new account
 */
export async function createAccount(account: {
  id?: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'CMS_ADMIN' | 'CONTENT_EDITOR' | 'VIEWER' | 'admin' | 'editor';
  password: string;
}): Promise<StoredAccount> {
  try {
    const accountId = account.id || `usr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPasswordScrypt(account.password, salt);
    const storedHash = `${salt}:${passwordHash}`;
    const cleanEmail = account.email.trim().toLowerCase();
    
    const result = await executeQueryOne<StoredAccount>(
      `INSERT INTO ${tbl('users')} (id, email, name, role, two_factor_enabled, force_mfa_enrollment)
      VALUES ($1, $2, $3, $4, false, false)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        updated_at = NOW()
      RETURNING 
        id, 
        email, 
        name, 
        role, 
        email_verified as "emailVerified",
        two_factor_enabled as "twoFactorEnabled",
        force_mfa_enrollment as "forceMfaEnrollment",
        failed_login_count as "failedLoginCount",
        locked_until as "lockedUntil",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt",
        (locked_until IS NULL OR locked_until <= NOW()) as "isActive"`,
      [accountId, cleanEmail, account.name, account.role]
    );
    
    if (!result) {
      throw new Error('Failed to create account');
    }

    // Insert or update credentials in accounts table
    await executeQuery(
      `INSERT INTO ${tbl('accounts')} (id, user_id, account_id, provider_id, password_hash)
      VALUES ($1, $2, $3, 'credential', $4)
      ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
      [`${result.id}-acc`, result.id, result.id, storedHash]
    );
    
    logger.info('account_repository.created', {
      meta: { accountId: result.id, email: result.email, role: result.role },
    });
    
    return result;
  } catch (error) {
    logger.error('account_repository.create.error', {
      meta: { email: account.email, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Verify account credentials
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ account: StoredAccount; valid: boolean } | null> {
  try {
    const account = await findAccountByEmail(email);
    
    if (!account) {
      return null;
    }
    
    // Check if account is locked
    if (account.lockedUntil && new Date(account.lockedUntil) > new Date()) {
      logger.warn('account_repository.account_locked', {
        meta: { email, lockedUntil: account.lockedUntil },
      });
      return { account, valid: false };
    }
    
    // Get password hash from accounts table
    const accountRecord = await executeQueryOne<{ password_hash: string }>(
      `SELECT password_hash FROM ${tbl('accounts')} WHERE user_id = $1 LIMIT 1`,
      [account.id]
    );
    
    if (!accountRecord) {
      logger.error('account_repository.no_password_record', {
        meta: { accountId: account.id },
      });
      return { account, valid: false };
    }
    
    // Verify password using scrypt with timing-safe comparison (salt:hash)
    const storedHash = accountRecord.password_hash;
    const parts = storedHash.split(':');
    const salt = parts[0];
    const expectedHash = parts[1];
    
    if (!salt || !expectedHash) {
      logger.error('account_repository.invalid_hash_format', {
        meta: { accountId: account.id },
      });
      return { account, valid: false };
    }
    
    const valid = verifyPasswordScrypt(password, salt, expectedHash);
    
    if (!valid) {
      // Increment failed login count
      await executeQuery(
        `UPDATE ${tbl('users')} 
        SET failed_login_count = failed_login_count + 1,
            updated_at = NOW()
        WHERE id = $1`,
        [account.id]
      );
      
      // Lock account after 5 failed attempts
      if (account.failedLoginCount >= 4) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await executeQuery(
          `UPDATE ${tbl('users')} 
          SET locked_until = $1,
              updated_at = NOW()
          WHERE id = $2`,
          [lockUntil, account.id]
        );
      }
    } else {
      // Reset failed login count and update last login
      await executeQuery(
        `UPDATE ${tbl('users')} 
        SET failed_login_count = 0,
            last_login_at = NOW(),
            updated_at = NOW()
        WHERE id = $1`,
        [account.id]
      );
    }
    
    return { account, valid };
  } catch (error) {
    logger.error('account_repository.verify_credentials.error', {
      meta: { email, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Update password for an account
 */
export async function updatePassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPasswordScrypt(newPassword, salt);
    const storedHash = `${salt}:${passwordHash}`;

    const existingAcc = await executeQueryOne<{ id: string }>(
      `SELECT id FROM ${tbl('accounts')} WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (existingAcc) {
      await executeQuery(
        `UPDATE ${tbl('accounts')} 
        SET password_hash = $1, updated_at = NOW() 
        WHERE user_id = $2`,
        [storedHash, userId]
      );
    } else {
      await executeQuery(
        `INSERT INTO ${tbl('accounts')} (id, user_id, account_id, provider_id, password_hash)
        VALUES ($1, $2, $3, 'credential', $4)`,
        [`${userId}-acc`, userId, userId, storedHash]
      );
    }

    return true;
  } catch (error) {
    logger.error('account_repository.update_password.error', {
      meta: { userId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Update account
 */
export async function updateAccount(
  id: string,
  updates: Partial<Pick<StoredAccount, 'name' | 'role' | 'emailVerified'>> & { password?: string; isActive?: boolean; email?: string }
): Promise<StoredAccount | null> {
  try {
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(updates.name.trim());
    }
    if (updates.email !== undefined && updates.email.trim()) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(updates.email.trim().toLowerCase());
    }
    if (updates.role !== undefined) {
      updateFields.push(`role = $${paramIndex++}`);
      updateValues.push(updates.role);
    }
    if (updates.emailVerified !== undefined) {
      updateFields.push(`email_verified = $${paramIndex++}`);
      updateValues.push(updates.emailVerified);
    }
    if (updates.isActive !== undefined) {
      if (updates.isActive) {
        updateFields.push(`locked_until = NULL`);
        updateFields.push(`failed_login_count = 0`);
      } else {
        updateFields.push(`locked_until = NOW() + INTERVAL '100 years'`);
      }
    }
    
    if (updates.password) {
      await updatePassword(id, updates.password);
    }

    if (updateFields.length === 0) {
      return await findAccountById(id);
    }
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(id);
    
    const result = await executeQueryOne<StoredAccount>(
      `UPDATE ${tbl('users')} 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, 
        email, 
        name, 
        role, 
        email_verified as "emailVerified",
        two_factor_enabled as "twoFactorEnabled",
        force_mfa_enrollment as "forceMfaEnrollment",
        failed_login_count as "failedLoginCount",
        locked_until as "lockedUntil",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt",
        (locked_until IS NULL OR locked_until <= NOW()) as "isActive"`,
      updateValues
    );
    
    logger.info('account_repository.updated', {
      meta: { accountId: id, updates: Object.keys(updates) },
    });
    
    return result;
  } catch (error) {
    logger.error('account_repository.update.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Delete account
 */
export async function deleteAccount(id: string): Promise<boolean> {
  try {
    await executeQuery(`DELETE FROM ${tbl('users')} WHERE id = $1`, [id]);
    
    logger.info('account_repository.deleted', {
      meta: { accountId: id },
    });
    
    return true;
  } catch (error) {
    logger.error('account_repository.delete.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * List all accounts
 */
export async function listAccounts(): Promise<StoredAccount[]> {
  try {
    const results = await executeQuery<StoredAccount>(
      `SELECT 
        id, 
        email, 
        name, 
        role, 
        email_verified as "emailVerified",
        two_factor_enabled as "twoFactorEnabled",
        force_mfa_enrollment as "forceMfaEnrollment",
        failed_login_count as "failedLoginCount",
        locked_until as "lockedUntil",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt",
        (locked_until IS NULL OR locked_until <= NOW()) as "isActive"
      FROM ${tbl('users')} 
      ORDER BY created_at DESC`
    );
    
    return results;
  } catch (error) {
    logger.error('account_repository.list.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}
