/**
 * Class A Core Module — Shared Structured JSON Logger with Recursive Redaction
 * Covers: OBS-1, RT-2 (Pure Web-standard TypeScript; zero Node built-in or Class B imports)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: 'azaroth-cms';
  env: string;
  requestId?: string;
  route?: string;
  method?: string;
  event: string;
  actorId?: string;
  actorRole?: string;
  durationMs?: number;
  statusCode?: number;
  meta?: Record<string, unknown>;
}

const SENSITIVE_KEY_PATTERN =
  /password|secret|token|authorization|auth_?header|cookie|set-cookie|totp|backup_code|recovery_code|api_key|access_key|private_key|database_url|connection_string|passphrase|signature/i;

const POSTGRES_URI_PATTERN = /postgres(?:ql)?:\/\/[^\s"'<>]+/gi;
const BEARER_TOKEN_PATTERN = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
const AWS_KEY_PATTERN = /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g;
const PRESIGNED_SIG_PATTERN = /([?&]X-Amz-(?:Signature|Credential|Security-Token)=)[^&\s"']+/gi;
const SESSION_COOKIE_PATTERN =
  /((?:__Host-)?(?:better-auth|azaroth)[._-]?session_token=)[^;\s"']+/gi;

export const REDACTED_MARKER = '[REDACTED]';

/**
 * Recursively scrubs secrets, credentials, connection strings, presigned URL signatures,
 * session cookies, and TOTP codes from any value before serialization (OBS-1).
 */
export function redactSensitiveValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return redactStringPatterns(value);
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactStringPatterns(value.message),
      stack: value.stack ? redactStringPatterns(value.stack) : undefined,
    };
  }

  if (seen.has(value)) {
    return '[Circular]';
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveValue(item, seen));
  }

  const output: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      output[key] = REDACTED_MARKER;
    } else {
      output[key] = redactSensitiveValue(val, seen);
    }
  }
  return output;
}

export function redactStringPatterns(input: string): string {
  return input
    .replace(POSTGRES_URI_PATTERN, `postgresql://${REDACTED_MARKER}`)
    .replace(BEARER_TOKEN_PATTERN, `Bearer ${REDACTED_MARKER}`)
    .replace(AWS_KEY_PATTERN, REDACTED_MARKER)
    .replace(PRESIGNED_SIG_PATTERN, `$1${REDACTED_MARKER}`)
    .replace(SESSION_COOKIE_PATTERN, `$1${REDACTED_MARKER}`);
}

export function formatStructuredLog(
  level: LogLevel,
  event: string,
  fields: Omit<LogEntry, 'timestamp' | 'level' | 'service' | 'env' | 'event'> = {}
): string {
  const redactedMeta = fields.meta
    ? (redactSensitiveValue(fields.meta) as Record<string, unknown>)
    : undefined;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'azaroth-cms',
    env: (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.NODE_ENV || 'development',
    requestId: fields.requestId,
    route: fields.route,
    method: fields.method,
    event: redactStringPatterns(event),
    actorId: fields.actorId,
    actorRole: fields.actorRole,
    durationMs: fields.durationMs,
    statusCode: fields.statusCode,
    ...(redactedMeta ? { meta: redactedMeta } : {}),
  };

  return JSON.stringify(entry);
}

export const logger = {
  debug(event: string, fields?: Omit<LogEntry, 'timestamp' | 'level' | 'service' | 'env' | 'event'>) {
    console.debug(formatStructuredLog('debug', event, fields));
  },
  info(event: string, fields?: Omit<LogEntry, 'timestamp' | 'level' | 'service' | 'env' | 'event'>) {
    console.info(formatStructuredLog('info', event, fields));
  },
  warn(event: string, fields?: Omit<LogEntry, 'timestamp' | 'level' | 'service' | 'env' | 'event'>) {
    console.warn(formatStructuredLog('warn', event, fields));
  },
  error(event: string, fields?: Omit<LogEntry, 'timestamp' | 'level' | 'service' | 'env' | 'event'>) {
    console.error(formatStructuredLog('error', event, fields));
  },
};
