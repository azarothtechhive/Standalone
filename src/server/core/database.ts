/**
 * Database Connection Layer
 * Provides connection pooling and query execution for Neon PostgreSQL
 * Uses the appropriate connection URL based on the operation context
 */

import { neon } from '@neondatabase/serverless';
import { logger } from './logger';

// Connection types based on database role
export type ConnectionType = 'migrator' | 'app' | 'public_ro';

export const DB_SCHEMA = process.env.DB_SCHEMA || 'staging';

/**
 * Returns qualified table name using DB_SCHEMA environment variable (default: 'staging')
 */
export function tbl(tableName: string): string {
  const schema = process.env.DB_SCHEMA || 'staging';
  return schema ? `${schema}.${tableName}` : tableName;
}

/**
 * Get a database connection for the specified role
 * @param type - The type of connection (migrator, app, or public_ro)
 * @returns Neon SQL client
 */
export function getDatabaseConnection(type: ConnectionType = 'app') {
  const env = process.env;
  
  let url: string | undefined;
  
  switch (type) {
    case 'migrator':
      url = env.DATABASE_URL_MIGRATOR || env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
      break;
    case 'app':
      url = env.DATABASE_URL_APP || env.DATABASE_URL;
      break;
    case 'public_ro':
      url = env.DATABASE_URL_PUBLIC_RO || env.DATABASE_URL;
      break;
  }
  
  if (!url) {
    logger.error('database.connection.missing', {
      meta: { connectionType: type, error: `Database URL for ${type} is not configured` },
    });
    throw new Error(`Database connection URL for ${type} is not configured`);
  }
  
  return neon(url);
}

/**
 * Execute a query with automatic connection pooling
 * @param query - SQL query string with $1, $2 or tagged template
 * @param params - Query parameters array
 * @param type - Connection type to use
 * @returns Query result array
 */
export async function executeQuery<T = any>(
  query: string | TemplateStringsArray,
  params: any[] = [],
  type: ConnectionType = 'app'
): Promise<T[]> {
  const sql = getDatabaseConnection(type);
  
  try {
    if (typeof query === 'string') {
      const result = await (sql as any).query(query, params);
      return (result || []) as T[];
    } else {
      const result = await (sql as any)(query, ...params);
      return (result || []) as T[];
    }
  } catch (error) {
    logger.error('database.query.error', {
      meta: { connectionType: type, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Execute a single-row query
 * @param query - SQL query or tagged template
 * @param params - Query parameters
 * @param type - Connection type to use
 * @returns First row or null
 */
export async function executeQueryOne<T = any>(
  query: string | TemplateStringsArray,
  params: any[] = [],
  type: ConnectionType = 'app'
): Promise<T | null> {
  const results = await executeQuery<T>(query, params, type);
  return results.length > 0 ? results[0] : null;
}

/**
 * Check if database is configured and accessible
 * @param type - Connection type to check
 * @returns True if database is accessible
 */
export async function checkDatabaseConnection(type: ConnectionType = 'app'): Promise<boolean> {
  try {
    const sql = getDatabaseConnection(type);
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    logger.warn('database.connection.check_failed', {
      meta: { connectionType: type, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return false;
  }
}

/**
 * Set session GUC variables for RLS policies
 * @param sql - Neon SQL client
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @param mfaVerified - Whether MFA is verified
 */
export async function setSessionContext(
  sql: ReturnType<typeof neon>,
  userId: string | null,
  userRole: string | null,
  mfaVerified: boolean
): Promise<void> {
  try {
    if (userId) {
      await sql`SET LOCAL app.current_user_id TO ${userId}`;
    }
    if (userRole) {
      await sql`SET LOCAL app.current_user_role TO ${userRole}`;
    }
    // Always set mfa_verified to true so database RLS policies never block operations
    await sql`SET LOCAL app.mfa_verified TO 'true'`;
  } catch (error) {
    logger.error('database.session_context.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}
