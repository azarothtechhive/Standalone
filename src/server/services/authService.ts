/**
 * Production-Ready Authentication Service
 * Strictly uses database repositories (Neon PostgreSQL) for persistent accounts and sessions.
 * Never stores production business data or sessions in memory.
 */

import crypto from 'node:crypto';
import * as accountRepository from '../repositories/accountRepository';
import * as sessionRepository from '../repositories/sessionRepository';
import * as cmsRepository from '../repositories/cmsRepository';
import { checkDatabaseConnection, executeQuery, executeQueryOne, tbl } from '../core/database';
import { logger } from '../core/logger';
import * as totpService from './totpService';

// In-memory rate limiting map (transient IP security counter)
const loginRateLimits = new Map<string, { count: number; resetAt: number }>();

// In-memory flag to ensure bootstrap accounts are checked at most once per process lifetime
let initialAdminSynced = false;

/**
 * Get session by token directly from database
 */
export async function getSessionByToken(token: string) {
  try {
    return await sessionRepository.findSessionByToken(token);
  } catch (error) {
    logger.error('auth_service.get_session_by_token.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return null;
  }
}

export function isSuperAdminRole(role?: string | null): boolean {
  return role === 'SUPER_ADMIN' || role === 'admin';
}

export function isCmsAdminRole(role?: string | null): boolean {
  return isSuperAdminRole(role) || role === 'CMS_ADMIN';
}

export function canEditContentRole(role?: string | null): boolean {
  return isCmsAdminRole(role) || role === 'CONTENT_EDITOR' || role === 'editor';
}

export function canAccessCrmRole(role?: string | null): boolean {
  return isCmsAdminRole(role) || role === 'SALES_USER';
}

/**
 * Ensure initial administrator account exists in database.
 * Optimized for serverless: runs at most once in memory per process,
 * performs an indexed lookup, and never re-hashes or runs bulk updates on login.
 */
async function ensureInitialAdminAccount() {
  if (initialAdminSynced) return;

  try {
    const adminEmail = 'admin@azaroth-techhive.com';
    const existing = await accountRepository.findAccountByEmail(adminEmail);
    if (existing) {
      initialAdminSynced = true;
      return;
    }

    // Only create initial admin if completely missing
    await accountRepository.createAccount({
      id: 'usr_seed_initial_admin',
      email: adminEmail,
      password: process.env.BOOTSTRAP_ADMIN_PASSWORD || 'Admin@123',
      name: 'Alexander Vance',
      role: 'SUPER_ADMIN',
    });
    initialAdminSynced = true;
    logger.info('auth_service.bootstrap_admin_created', { meta: { email: adminEmail } });
  } catch (error) {
    // If DB is temporarily unreachable during cold-start check, allow login flow to attempt direct auth
    logger.warn('auth_service.bootstrap_check_deferred', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

/**
 * Handle login request
 */
export async function handleLogin(credentials: {
  email?: string;
  password?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
  if (!credentials.email || !credentials.password) {
    return {
      success: false,
      message: 'Email and password are required.',
    };
  }

  await ensureInitialAdminAccount();

  const email = credentials.email.trim().toLowerCase();
  const ip = credentials.ipAddress || '127.0.0.1';
  const now = Date.now();

  // Rate limiting (15 attempts per IP per minute)
  const rateEntry = loginRateLimits.get(ip);
  if (rateEntry && now < rateEntry.resetAt && rateEntry.count >= 15) {
    logger.warn('auth_service.rate_limit_exceeded', { meta: { ip, email } });
    return {
      success: false,
      message: 'Too many login attempts. Please wait a minute before trying again.',
    };
  }

  try {
    const isDbConnected = await checkDatabaseConnection('app');
    if (!isDbConnected) {
      return {
        success: false,
        message: 'Database service is currently unreachable. Please try again shortly.',
      };
    }

    const result = await accountRepository.verifyCredentials(email, credentials.password);
    if (!result || !result.valid || !result.account) {
      const prev = loginRateLimits.get(ip);
      loginRateLimits.set(ip, {
        count: (prev && now < prev.resetAt ? prev.count : 0) + 1,
        resetAt: now + 60_000,
      });

      logger.warn('auth_service.login_failed', { meta: { ip, email } });
      return {
        success: false,
        message: 'Invalid email or password.',
      };
    }

    const { account } = result;

    if (!account.isActive) {
      return {
        success: false,
        message: 'Account is deactivated. Please contact an administrator.',
      };
    }

    // Clear rate limit on successful credential verification
    loginRateLimits.delete(ip);

    // Create session in database - MFA removed so sessions are immediately verified
    const maxAgeSeconds = 7 * 24 * 60 * 60; // 7 days
    const session = await sessionRepository.createSession({
      userId: account.id,
      mfaVerified: true, // Always true to ensure CMS edits are immediately permitted
      ipAddress: credentials.ipAddress,
      userAgent: credentials.userAgent,
      maxAgeSeconds,
    });

    logger.info('auth_service.login_succeeded', {
      meta: { userId: account.id, email: account.email, role: account.role },
    });

    try {
      await cmsRepository.recordAuditLogEntry({
        eventType: 'USER_LOGIN',
        actorUserId: account.id,
        actorEmail: account.email,
        actorRole: account.role,
        ipAddress: credentials.ipAddress || null,
        userAgent: credentials.userAgent || null,
        targetType: 'auth',
        targetId: account.id,
        metadata: { method: 'password' },
      });
    } catch {
      // Audit logging must never block a successful login.
    }

    return {
      success: true,
      token: session.token,
      user: {
        id: account.id,
        email: account.email,
        name: (!account.name || account.name === 'Principal System Administrator')
          ? (account.email ? account.email.split('@')[0] : 'admin')
          : account.name,
        role: account.role,
        twoFactorEnabled: false,
        mfaVerified: true,
        forceMfaEnrollment: false,
        isActive: account.isActive,
        lastLoginAt: account.lastLoginAt,
        createdAt: account.createdAt,
      },
    };
  } catch (error) {
    logger.error('auth_service.login.error', {
      meta: { email, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return {
      success: false,
      message: 'Authentication failed due to database error.',
    };
  }
}

/**
 * Handle logout request
 */
export async function handleLogout(token: string): Promise<{ success: boolean }> {
  try {
    await sessionRepository.deleteSessionByToken(token);
    logger.info('auth_service.logout_succeeded', {});
    return { success: true };
  } catch (error) {
    logger.error('auth_service.logout.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false };
  }
}

/**
 * Get account info from session token (does not enforce MFA verification)
 * Used for checking MFA enrollment status or during initial MFA setup
 */
export async function getAccountFromSession(token: string): Promise<accountRepository.StoredAccount | null> {
  try {
    const session = await sessionRepository.findSessionByToken(token);
    if (!session) return null;
    return await accountRepository.findAccountById(session.userId);
  } catch (error) {
    logger.error('auth_service.get_account_from_session.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return null;
  }
}

/**
 * Get authenticated account from session token
 * MFA requirement removed completely so CMS changes are fully editable
 */
export async function getAuthenticatedAccount(
  token: string,
  _allowUnverifiedMfa: boolean = true
): Promise<accountRepository.StoredAccount | null> {
  if (!token) return null;

  try {
    const session = await sessionRepository.findSessionByToken(token);
    if (!session) return null;

    const account = await accountRepository.findAccountById(session.userId);
    if (!account || !account.isActive) return null;

    return account;
  } catch (error) {
    logger.error('auth_service.get_authenticated_account.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return null;
  }
}

/**
 * Handle password change
 */
export async function handleChangePassword(
  token: string,
  currentPassword?: string,
  newPassword?: string
): Promise<{ success: boolean; message?: string }> {
  const account = await getAuthenticatedAccount(token);
  if (!account) {
    return { success: false, message: 'Authentication required.' };
  }

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return { success: false, message: 'New password must be at least 8 characters long.' };
  }

  try {
    const verification = await accountRepository.verifyCredentials(account.email, currentPassword);
    if (!verification || !verification.valid) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    await accountRepository.updatePassword(account.id, newPassword);
    logger.info('auth_service.password_changed', { meta: { userId: account.id } });
    return { success: true, message: 'Password updated successfully.' };
  } catch (error) {
    logger.error('auth_service.change_password.error', {
      meta: { userId: account.id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to update password in database.' };
  }
}

/**
 * List all users (admin only)
 */
export async function listUsers(token: string): Promise<{ success: boolean; users?: any[]; message?: string }> {
  const actor = await getAuthenticatedAccount(token);
  if (!actor || !isCmsAdminRole(actor.role)) {
    return { success: false, message: 'Admin privileges required.' };
  }

  try {
    const users = await accountRepository.listAccounts();
    return { success: true, users };
  } catch (error) {
    logger.error('auth_service.list_users.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to retrieve users from database.' };
  }
}

/**
 * Create user (super admin only)
 */
export async function createUser(
  token: string,
  userData: { email?: string; password?: string; name?: string; role?: string }
): Promise<{ success: boolean; user?: any; message?: string }> {
  const actor = await getAuthenticatedAccount(token);
  if (!actor || !isSuperAdminRole(actor.role)) {
    return { success: false, message: 'Super Admin privileges required.' };
  }

  const email = userData.email?.trim().toLowerCase();
  if (!email || !userData.password || !userData.name) {
    return { success: false, message: 'Name, email, and password are required.' };
  }

  try {
    const existing = await accountRepository.findAccountByEmail(email);
    if (existing) {
      return { success: false, message: 'A user with this email already exists.' };
    }

    const user = await accountRepository.createAccount({
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      name: userData.name,
      role: (userData.role || 'CONTENT_EDITOR') as any,
      password: userData.password,
    });

    logger.info('auth_service.user_created', { meta: { userId: user.id, email, role: user.role } });
    return { success: true, user };
  } catch (error) {
    logger.error('auth_service.create_user.error', {
      meta: { email, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to create user in database.' };
  }
}

/**
 * Get single user by ID
 */
export async function getUser(
  token: string,
  userId: string
): Promise<{ success: boolean; user?: any; message?: string }> {
  const actor = await getAuthenticatedAccount(token);
  if (!actor) {
    return { success: false, message: 'Authentication required.' };
  }
  if (actor.id !== userId && !isCmsAdminRole(actor.role)) {
    return { success: false, message: 'Admin privileges required.' };
  }

  try {
    const user = await accountRepository.findAccountById(userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }
    return { success: true, user };
  } catch (error) {
    logger.error('auth_service.get_user.error', {
      meta: { userId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to retrieve user from database.' };
  }
}

/**
 * Update user (super admin or self)
 */
export async function updateUser(
  token: string,
  userId: string,
  updates: { name?: string; email?: string; role?: string; isActive?: boolean; password?: string; emailVerified?: boolean }
): Promise<{ success: boolean; user?: any; message?: string }> {
  const actor = await getAuthenticatedAccount(token);
  if (!actor) {
    return { success: false, message: 'Authentication required.' };
  }

  const isSelf = actor.id === userId;
  const isSuper = isSuperAdminRole(actor.role);

  if (!isSelf && !isSuper) {
    return { success: false, message: 'Super Admin privileges required.' };
  }

  // Only super admin can change role or active status
  const roleUpdate = isSuper ? (updates.role as any) : undefined;
  const isActiveUpdate = isSuper ? updates.isActive : undefined;

  try {
    const user = await accountRepository.updateAccount(userId, {
      name: updates.name,
      email: updates.email,
      role: roleUpdate,
      emailVerified: isSuper ? updates.emailVerified : undefined,
      password: updates.password,
      isActive: isActiveUpdate,
    });

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    logger.info('auth_service.user_updated', { meta: { userId, updatedBy: actor.id } });
    return { success: true, user };
  } catch (error) {
    logger.error('auth_service.update_user.error', {
      meta: { userId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to update user in database.' };
  }
}

/**
 * Update authenticated user's own profile
 */
export async function updateProfile(
  token: string,
  updates: { name?: string; email?: string; password?: string }
): Promise<{ success: boolean; user?: any; message?: string }> {
  const actor = await getAuthenticatedAccount(token);
  if (!actor) {
    return { success: false, message: 'Authentication required.' };
  }

  return await updateUser(token, actor.id, updates);
}

/**
 * Delete user (super admin only)
 */
export async function deleteUser(
  token: string,
  userId: string
): Promise<{ success: boolean; message?: string }> {
  const actor = await getAuthenticatedAccount(token);
  if (!actor || !isSuperAdminRole(actor.role)) {
    return { success: false, message: 'Super Admin privileges required.' };
  }

  if (userId === actor.id) {
    return { success: false, message: 'Cannot delete your own active account.' };
  }

  try {
    await accountRepository.deleteAccount(userId);
    logger.info('auth_service.user_deleted', { meta: { userId } });
    return { success: true };
  } catch (error) {
    logger.error('auth_service.delete_user.error', {
      meta: { userId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to delete user in database.' };
  }
}

/**
 * Generate TOTP setup for a user
 * Allows unverified session so user in onboarding / MFA setup flow can generate secret
 */
export async function generateTotpSetup(
  token: string
): Promise<{ success: boolean; secret?: string; uri?: string; backupCodes?: string[]; message?: string }> {
  const account = await getAuthenticatedAccount(token, true);
  if (!account) {
    return { success: false, message: 'Not authenticated.' };
  }

  try {
    const existingTotp = await totpService.isTotpEnabled(account.id);
    if (existingTotp) {
      return { success: false, message: 'MFA is already enabled on this account.' };
    }

    const { secret, uri } = totpService.generateTotpSecret();
    const backupCodes = totpService.generateBackupCodes();

    return { success: true, secret, uri, backupCodes };
  } catch (error) {
    logger.error('auth_service.totp_setup.error', {
      meta: { userId: account.id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to generate MFA setup in database.' };
  }
}

/**
 * Verify TOTP code and enable MFA
 * Allows unverified session so user completing enrollment can activate MFA
 */
export async function verifyTotpAndEnable(
  token: string,
  totpToken?: string,
  secret?: string,
  backupCodes?: string[]
): Promise<{ success: boolean; message?: string }> {
  const account = await getAuthenticatedAccount(token, true);
  if (!account) {
    return { success: false, message: 'Not authenticated.' };
  }

  if (!totpToken || !secret || !backupCodes || backupCodes.length === 0) {
    return { success: false, message: 'TOTP token, secret, and backup codes are required.' };
  }

  try {
    const valid = totpService.verifyTotpCode(secret, totpToken);
    if (!valid) {
      return { success: false, message: 'Invalid TOTP verification code.' };
    }

    const stored = await totpService.storeTotpSecret(account.id, secret, backupCodes);
    if (!stored) {
      return { success: false, message: 'Failed to store TOTP secret in database.' };
    }

    // Mark current session as MFA verified
    const session = await sessionRepository.findSessionByToken(token);
    if (session) {
      await sessionRepository.updateSessionMfaVerified(session.id, true);
    }

    logger.info('auth_service.mfa_enabled', { meta: { userId: account.id } });
    return { success: true };
  } catch (error) {
    logger.error('auth_service.mfa_enable.error', {
      meta: { userId: account.id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to enable MFA in database.' };
  }
}

/**
 * Verify MFA for an active session (simplified to always succeed since MFA is removed)
 */
export async function verifyMfaForSession(
  sessionToken: string,
  _totpToken?: string,
  _backupCode?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await sessionRepository.findSessionByToken(sessionToken);
    if (!session) {
      return { success: false, message: 'Invalid or expired session.' };
    }

    if (!session.mfaVerified) {
      await sessionRepository.updateSessionMfaVerified(session.id, true);
    }
    return { success: true };
  } catch (error) {
    logger.error('auth_service.verify_mfa.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: true };
  }
}
