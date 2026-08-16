export const REDACTED = "[REDACTED]";
export const REDACTED_POSTGRES_URL = "[REDACTED_POSTGRES_URL]";

export function redactSensitiveText(value) {
  return String(value)
    .replace(
      /\bpostgres(?:ql)?:\/\/[^\s"'`]+/giu,
      REDACTED_POSTGRES_URL,
    )
    .replace(
      /\b((?:set-cookie|cookie)\s*:\s*)[^\r\n]+/giu,
      `$1${REDACTED}`,
    )
    .replace(
      /\b(authorization\s*:\s*)(?:bearer\s+)?[^\s,;]+/giu,
      `$1${REDACTED}`,
    )
    .replace(
      /\bBearer\s+[A-Za-z0-9._~+/=-]+/giu,
      `Bearer ${REDACTED}`,
    )
    .replace(
      /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*\b/gu,
      REDACTED,
    )
    .replace(
      /\b(password|passwd|secret|token|access[_-]?token|refresh[_-]?token|session[_-]?(?:token|id)|jwt(?:[_-]?secret)?|api[_-]?key|smtp[_-]?(?:pass|password)|s3[_-]?(?:access[_-]?key[_-]?id|secret[_-]?access[_-]?key)|pgpassword|database_url|pg_connection_string|migrator_database_url|supabase_admin_url)\b(\s*[=:]\s*)(["']?)[^&;\s,"']+\3/giu,
      (_match, key, separator, quote) =>
        `${key}${separator}${quote}${REDACTED}${quote}`,
    );
}

export function safeErrorDetails(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: redactSensitiveText(error.message),
    };
  }

  return {
    type: typeof error,
    message: "Error no estándar.",
  };
}
