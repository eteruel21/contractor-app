import { describe, expect, test } from "vitest";

import {
  CIRCULAR,
  REDACTED,
  REDACTED_POSTGRES_URL,
  isSensitiveKey,
  redactSensitiveText,
  redactSensitiveValue,
  safeErrorDetails
} from "../redaction.js";

const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.access-secret.signature";

const REFRESH_TOKEN =
  "VERY_SECRET_REFRESH_TOKEN_123456";

const PASSWORD =
  "SuperSecretPassword123";

const DATABASE_URL =
  `postgresql://contractor_api:${PASSWORD}@db.example.com:5432/contractor_pro?sslmode=require`;

describe("T-041 redacción de información sensible", () => {
  test("reconoce claves sensibles independientemente del formato", () => {
    expect(isSensitiveKey("accessToken")).toBe(true);
    expect(isSensitiveKey("refresh_token")).toBe(true);
    expect(isSensitiveKey("Authorization")).toBe(true);
    expect(isSensitiveKey("Set-Cookie")).toBe(true);
    expect(isSensitiveKey("PGPASSWORD")).toBe(true);
    expect(isSensitiveKey("DATABASE_URL")).toBe(true);
    expect(isSensitiveKey("SMTP_PASS")).toBe(true);
    expect(isSensitiveKey("S3_SECRET_ACCESS_KEY")).toBe(true);
    expect(isSensitiveKey("displayName")).toBe(false);
  });

  test("redacta Bearer tokens", () => {
    const result = redactSensitiveText(
      `Authorization: Bearer ${ACCESS_TOKEN}`
    );

    expect(result).not.toContain(ACCESS_TOKEN);
    expect(result).toContain(REDACTED);
  });

  test("redacta JWT encontrados dentro de texto", () => {
    const result = redactSensitiveText(
      `Falló el token ${ACCESS_TOKEN}`
    );

    expect(result).not.toContain(ACCESS_TOKEN);
    expect(result).toContain(REDACTED);
  });

  test("redacta cookies completas", () => {
    const result = redactSensitiveText(
      `Cookie: refresh_token=${REFRESH_TOKEN}; session=abc123`
    );

    expect(result).not.toContain(REFRESH_TOKEN);
    expect(result).not.toContain("abc123");
    expect(result).toContain(REDACTED);
  });

  test("redacta URLs PostgreSQL completas", () => {
    const result = redactSensitiveText(
      `Falló conexión a ${DATABASE_URL}`
    );

    expect(result).not.toContain(PASSWORD);
    expect(result).not.toContain("contractor_api");
    expect(result).not.toContain("db.example.com");
    expect(result).toContain(REDACTED_POSTGRES_URL);
  });

  test("redacta pares password y token dentro de texto", () => {
    const result = redactSensitiveText(
      `password=${PASSWORD} refresh_token=${REFRESH_TOKEN}`
    );

    expect(result).not.toContain(PASSWORD);
    expect(result).not.toContain(REFRESH_TOKEN);
    expect(result).toContain(REDACTED);
  });

  test("redacta secretos dentro de objetos anidados", () => {
    const value = {
      userId: "user-123",
      password: PASSWORD,
      auth: {
        accessToken: ACCESS_TOKEN,
        refresh_token: REFRESH_TOKEN
      },
      headers: {
        authorization: `Bearer ${ACCESS_TOKEN}`,
        cookie: `refresh_token=${REFRESH_TOKEN}`
      },
      database: {
        DATABASE_URL
      }
    };

    const result = redactSensitiveValue(value);
    const serialized = JSON.stringify(result);

    expect(serialized).toContain("user-123");
    expect(serialized).not.toContain(PASSWORD);
    expect(serialized).not.toContain(ACCESS_TOKEN);
    expect(serialized).not.toContain(REFRESH_TOKEN);
    expect(serialized).not.toContain(DATABASE_URL);
  });

  test("sanitiza objetos Error sin exponer stack ni secretos", () => {
    const error = new Error(
      `No se pudo conectar a ${DATABASE_URL}; Authorization: Bearer ${ACCESS_TOKEN}`
    );

    const result = safeErrorDetails(error);
    const serialized = JSON.stringify(result);

    expect(serialized).toContain("Error");
    expect(serialized).not.toContain(PASSWORD);
    expect(serialized).not.toContain(ACCESS_TOKEN);
    expect(serialized).not.toContain("db.example.com");
    expect(serialized).not.toContain("stack");
  });

  test("maneja referencias circulares", () => {
    const value: Record<string, unknown> = {
      safe: "visible"
    };

    value.self = value;

    const result = redactSensitiveValue(value);
    const serialized = JSON.stringify(result);

    expect(serialized).toContain("visible");
    expect(serialized).toContain(CIRCULAR);
  });
});
