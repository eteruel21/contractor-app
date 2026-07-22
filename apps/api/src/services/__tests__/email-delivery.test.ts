import assert from "node:assert/strict";
import { test } from "vitest";
import {
  buildVerificationLinks,
  buildPasswordResetLinks,
  sendVerificationEmail,
  sendPasswordResetEmail
} from "../email.js";

test("buildVerificationLinks: genera enlaces profundos y web correctos", () => {
  const token = "tok_test_verification_123";
  const { deepLink, webLink } = buildVerificationLinks(token);

  assert.equal(deepLink, "contractorpro://confirm-email?token=tok_test_verification_123");
  assert.equal(webLink, "https://contractor-pro-web.pages.dev/confirm-email?token=tok_test_verification_123");
});

test("buildPasswordResetLinks: genera enlaces profundos y web de recuperación correctos", () => {
  const token = "tok_test_reset_456";
  const { deepLink, webLink } = buildPasswordResetLinks(token);

  assert.equal(deepLink, "contractorpro://reset-password?token=tok_test_reset_456");
  assert.equal(webLink, "https://contractor-pro-web.pages.dev/reset-password?token=tok_test_reset_456");
});

test("sendVerificationEmail: ejecuta sin fallar y entrega resultado", async () => {
  const result = await sendVerificationEmail({
    to: "testuser@ejemplo.com",
    fullName: "Usuario Prueba",
    token: "tok_test_verification_123"
  });

  assert.equal(result.sent, true);
});

test("sendPasswordResetEmail: ejecuta sin fallar y entrega resultado", async () => {
  const result = await sendPasswordResetEmail({
    to: "testuser@ejemplo.com",
    fullName: "Usuario Prueba",
    token: "tok_test_reset_456"
  });

  assert.equal(result.sent, true);
});
