import assert from "node:assert/strict";
import test from "node:test";

import {
  REDACTED,
  REDACTED_POSTGRES_URL,
  redactSensitiveText,
  safeErrorDetails,
} from "./redact-sensitive.mjs";

const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.access-secret.signature";
const REFRESH_TOKEN =
  "VERY_SECRET_REFRESH_TOKEN_123456";
const PASSWORD =
  "SuperSecretPassword123";
const DATABASE_URL =
  `postgresql://contractor_api:${PASSWORD}@db.example.com:5432/contractor_pro?sslmode=require`;

test("T-041 redacts PostgreSQL URLs", () => {
  const result = redactSensitiveText(
    `pg_dump failed for ${DATABASE_URL}`,
  );

  assert.equal(result.includes(PASSWORD), false);
  assert.equal(result.includes("contractor_api"), false);
  assert.equal(result.includes("db.example.com"), false);
  assert.equal(
    result.includes(REDACTED_POSTGRES_URL),
    true,
  );
});

test("T-041 redacts bearer and refresh tokens", () => {
  const result = redactSensitiveText(
    `Authorization: Bearer ${ACCESS_TOKEN} refresh_token=${REFRESH_TOKEN}`,
  );

  assert.equal(result.includes(ACCESS_TOKEN), false);
  assert.equal(result.includes(REFRESH_TOKEN), false);
  assert.equal(result.includes(REDACTED), true);
});

test("T-041 redacts cookies", () => {
  const result = redactSensitiveText(
    `Cookie: refresh_token=${REFRESH_TOKEN}; session=abc123`,
  );

  assert.equal(result.includes(REFRESH_TOKEN), false);
  assert.equal(result.includes("abc123"), false);
  assert.equal(result.includes(REDACTED), true);
});

test("T-041 sanitizes Error without stack or connection secrets", () => {
  const error = new Error(
    `password=${PASSWORD} database_url=${DATABASE_URL} Bearer ${ACCESS_TOKEN}`,
  );

  const result = safeErrorDetails(error);
  const serialized = JSON.stringify(result);

  assert.equal(serialized.includes(PASSWORD), false);
  assert.equal(serialized.includes(ACCESS_TOKEN), false);
  assert.equal(serialized.includes("db.example.com"), false);
  assert.equal(serialized.includes("stack"), false);
  assert.equal(result.name, "Error");
});

test("T-041 does not serialize arbitrary non-Error values", () => {
  const result = safeErrorDetails({
    password: PASSWORD,
    token: ACCESS_TOKEN,
  });
  const serialized = JSON.stringify(result);

  assert.equal(serialized.includes(PASSWORD), false);
  assert.equal(serialized.includes(ACCESS_TOKEN), false);
  assert.equal(result.message, "Error no estándar.");
});

test("T-041 redacts SMTP and S3 credential assignments", () => {
  const smtp = "smtp-secret-value";
  const s3 = "s3-secret-value";
  const result = redactSensitiveText("SMTP_PASS=" + smtp + " S3_SECRET_ACCESS_KEY=" + s3);

  assert.equal(result.includes(smtp), false);
  assert.equal(result.includes(s3), false);
  assert.equal(result.includes(REDACTED), true);
});
