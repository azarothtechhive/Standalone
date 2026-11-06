/**
 * Session Repository
 * Handles persistent storage and retrieval of user sessions
 * Replaces in-memory activeSessions Map with database operations
 */

import crypto from 'node:crypto';
import { executeQuery, executeQueryOne, tbl } from '../core/database';
import { logger } from '../core/logger';

export interface ActiveSession {
  id: string;
  userId: string;
  token: string;
  mfaVerified: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session
 */
export async function createSession(session: {
  userId: string;
  mfaVerified: boolean;
  ipAddress?: string;
  userAgent?: string;
  maxAgeSeconds?: number;
}): Promise<ActiveSession> {
  try {
    const token = generateSessionToken();
    const id = crypto.randomUUID();
    const maxAgeSeconds = session.maxAgeSeconds || 7 * 24 * 60 * 60; // 7 days default
    const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);
    
    const result = await executeQueryOne<ActiveSession>(
      `INSERT INTO ${tbl('sessions')} (id, user_id, token, mfa_verified, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id,
        user_id as "userId",
        token,
        mfa_verified as "mfaVerified",
        ip_address as "ipAddress",
        user_agent as "userAgent",
        expires_at as "expiresAt",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [
        id,
        session.userId,
        token,
        session.mfaVerified,
        session.ipAddress || null,
        session.userAgent || null,
        expiresAt,
      ]
    );
    
    if (!result) {
      throw new Error('Failed to create session');
    }
    
    logger.info('session_repository.created', {
      meta: { sessionId: id, userId: session.userId, mfaVerified: session.mfaVerified },
    });
    
    return result;
  } catch (error) {
    logger.error('session_repository.create.error', {
      meta: { userId: session.userId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Find session by token
 */
export async function findSessionByToken(token: string): Promise<ActiveSession | null> {
  try {
    const result = await executeQueryOne<ActiveSession>(
      `SELECT 
        id,
        user_id as "userId",
        token,
        mfa_verified as "mfaVerified",
        ip_address as "ipAddress",
        user_agent as "userAgent",
        expires_at as "expiresAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM ${tbl('sessions')} 
      WHERE token = $1`,
      [token]
    );
    
    if (!result) {
      return null;
    }
    
    // Check if session is expired
    if (new Date(result.expiresAt) < new Date()) {
      await deleteSession(result.id);
      return null;
    }
    
    return result;
  } catch (error) {
    logger.error('session_repository.find_by_token.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Update session MFA verification status
 */
export async function updateSessionMfaVerified(
  sessionId: string,
  mfaVerified: boolean
): Promise<ActiveSession | null> {
  try {
    const result = await executeQueryOne<ActiveSession>(
      `UPDATE ${tbl('sessions')} 
      SET mfa_verified = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING 
        id,
        user_id as "userId",
        token,
        mfa_verified as "mfaVerified",
        ip_address as "ipAddress",
        user_agent as "userAgent",
        expires_at as "expiresAt",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [mfaVerified, sessionId]
    );
    
    if (result) {
      logger.info('session_repository.mfa_updated', {
        meta: { sessionId, mfaVerified },
      });
    }
    
    return result;
  } catch (error) {
    logger.error('session_repository.update_mfa.error', {
      meta: { sessionId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Delete session by ID
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await executeQuery(`DELETE FROM ${tbl('sessions')} WHERE id = $1`, [sessionId]);
    
    logger.info('session_repository.deleted', {
      meta: { sessionId },
    });
    
    return true;
  } catch (error) {
    logger.error('session_repository.delete.error', {
      meta: { sessionId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Delete session by token
 */
export async function deleteSessionByToken(token: string): Promise<boolean> {
  try {
    await executeQuery(`DELETE FROM ${tbl('sessions')} WHERE token = $1`, [token]);
    
    logger.info('session_repository.deleted_by_token', {
      meta: { token: token.substring(0, 8) + '...' },
    });
    
    return true;
  } catch (error) {
    logger.error('session_repository.delete_by_token.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<number> {
  try {
    const result = await executeQuery<{ id: string }>(
      `DELETE FROM ${tbl('sessions')} WHERE user_id = $1 RETURNING id`,
      [userId]
    );
    
    const count = result.length;
    
    logger.info('session_repository.deleted_all_user', {
      meta: { userId, count },
    });
    
    return count;
  } catch (error) {
    logger.error('session_repository.delete_all_user.error', {
      meta: { userId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await executeQuery<{ id: string }>(
      `DELETE FROM ${tbl('sessions')} WHERE expires_at < NOW() RETURNING id`
    );
    
    const count = result.length;
    
    if (count > 0) {
      logger.info('session_repository.cleanup_expired', {
        meta: { count },
      });
    }
    
    return count;
  } catch (error) {
    logger.error('session_repository.cleanup.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * List sessions for a user
 */
export async function listUserSessions(userId: string): Promise<ActiveSession[]> {
  try {
    const results = await executeQuery<ActiveSession>(
      `SELECT 
        id,
        user_id as "userId",
        token,
        mfa_verified as "mfaVerified",
        ip_address as "ipAddress",
        user_agent as "userAgent",
        expires_at as "expiresAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM ${tbl('sessions')} 
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [userId]
    );
    
    return results;
  } catch (error) {
    logger.error('session_repository.list_user.error', {
      meta: { userId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}
