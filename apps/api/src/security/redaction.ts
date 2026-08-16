export const REDACTED = "[REDACTED]";
export const REDACTED_POSTGRES_URL = "[REDACTED_POSTGRES_URL]";
export const CIRCULAR = "[Circular]";

const sensitiveKeys = new Set([
  "authorization",
  "cookie",
  "setcookie",
  "password",
  "passwd",
  "secret",
  "token",
  "accesstoken",
  "refreshtoken",
  "sessiontoken",
  "sessionid",
  "jwt",
  "jwtsecret",
  "apikey",
  "xapikey",
  "pgpassword",
  "databaseurl",
  "pgconnectionstring",
  "migratordatabaseurl",
  "supabaseadminurl",
  "smtppassword",
  "smtppass",
  "captchasecret",
  "turnstilesecret",
  "r2accesskeyid",
  "r2secretaccesskey",
  "awsaccesskeyid",
  "awssecretaccesskey",
  "s3accesskeyid",
  "s3secretaccesskey"
]);

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isSensitiveKey(key: string): boolean {
  return sensitiveKeys.has(normalizeKey(key));
}

export function redactSensitiveText(value: string): string {
  return value
    .replace(
      /\bpostgres(?:ql)?:\/\/[^\s"'`]+/gi,
      REDACTED_POSTGRES_URL
    )
    .replace(
      /\b((?:set-cookie|cookie)\s*:\s*)[^\r\n]+/gi,
      `$1${REDACTED}`
    )
    .replace(
      /\b(authorization\s*:\s*)(?:bearer\s+)?[^\s,;]+/gi,
      `$1${REDACTED}`
    )
    .replace(
      /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi,
      `Bearer ${REDACTED}`
    )
    .replace(
      /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*\b/g,
      REDACTED
    )
    .replace(
      /\b(password|passwd|secret|token|access[_-]?token|refresh[_-]?token|session[_-]?(?:token|id)|jwt(?:[_-]?secret)?|api[_-]?key|smtp[_-]?(?:pass|password)|s3[_-]?(?:access[_-]?key[_-]?id|secret[_-]?access[_-]?key)|pgpassword|database_url|pg_connection_string|migrator_database_url|supabase_admin_url)\b(\s*[=:]\s*)(["']?)[^&;\s,"']+\3/gi,
      (_match, key: string, separator: string, quote: string) =>
        `${key}${separator}${quote}${REDACTED}${quote}`
    );
}

export function redactSensitiveValue(
  value: unknown,
  seen: WeakSet<object> = new WeakSet<object>()
): unknown {
  if (typeof value === "string") {
    return redactSensitiveText(value);
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactSensitiveText(value.message)
    };
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return CIRCULAR;
  }

  seen.add(value);

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      redactSensitiveValue(item, seen)
    );
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    sanitized[key] = isSensitiveKey(key)
      ? REDACTED
      : redactSensitiveValue(nestedValue, seen);
  }

  return sanitized;
}

export function safeErrorDetails(error: unknown): {
  error: unknown;
} {
  return {
    error: redactSensitiveValue(error)
  };
}
