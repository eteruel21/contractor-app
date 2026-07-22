import assert from "node:assert/strict";
import { afterEach, beforeEach, test, vi } from "vitest";

const mailMocks = vi.hoisted(() => ({
  sendMail: vi.fn(),
  createTransport: vi.fn()
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mailMocks.createTransport
  }
}));

import { env } from "../../config/env.js";
import {
  buildVerificationLinks,
  buildPasswordResetLinks,
  sendVerificationEmail,
  sendPasswordResetEmail
} from "../email.js";

type MutableEmailEnvironment = {
  NODE_ENV: string;
  SMTP_HOST: string | undefined;
  SMTP_PORT: number;
  SMTP_USER: string | undefined;
  SMTP_PASS: string | undefined;
  EMAIL_FROM: string | undefined;
};

const mutableEnv = env as MutableEmailEnvironment;
const originalEmailEnvironment = {
  NODE_ENV: mutableEnv.NODE_ENV,
  SMTP_HOST: mutableEnv.SMTP_HOST,
  SMTP_PORT: mutableEnv.SMTP_PORT,
  SMTP_USER: mutableEnv.SMTP_USER,
  SMTP_PASS: mutableEnv.SMTP_PASS,
  EMAIL_FROM: mutableEnv.EMAIL_FROM
};

function configureSmtp(): void {
  Object.assign(mutableEnv, {
    NODE_ENV: "production",
    SMTP_HOST: "smtp.example.test",
    SMTP_PORT: 587,
    SMTP_USER: "smtp-user",
    SMTP_PASS: "smtp-password",
    EMAIL_FROM: "Contractor Pro <no-reply@example.test>"
  });
}

function captureConsole() {
  return [
    vi.spyOn(console, "log").mockImplementation(() => undefined),
    vi.spyOn(console, "warn").mockImplementation(() => undefined),
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  ];
}

beforeEach(() => {
  Object.assign(mutableEnv, {
    NODE_ENV: "production",
    SMTP_HOST: undefined,
    SMTP_PORT: 587,
    SMTP_USER: undefined,
    SMTP_PASS: undefined,
    EMAIL_FROM: undefined
  });
  mailMocks.sendMail.mockReset();
  mailMocks.createTransport.mockReset();
  mailMocks.createTransport.mockImplementation(() => ({
    sendMail: mailMocks.sendMail
  }));
});

afterEach(() => {
  Object.assign(mutableEnv, originalEmailEnvironment);
  vi.restoreAllMocks();
});

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

test("email: producción sin SMTP falla de forma segura y no registra destinatario ni token", async () => {
  const recipient = "sensitive-user@example.test";
  const token = "sensitive-token-value";
  const consoleSpies = captureConsole();

  const verification = await sendVerificationEmail({
    to: recipient,
    fullName: "Usuario Prueba",
    token
  });
  const recovery = await sendPasswordResetEmail({
    to: recipient,
    fullName: "Usuario Prueba",
    token
  });

  assert.deepEqual(verification, { sent: false, reason: "not_configured" });
  assert.deepEqual(recovery, { sent: false, reason: "not_configured" });
  assert.equal(mailMocks.createTransport.mock.calls.length, 0);

  const loggedOutput = JSON.stringify(consoleSpies.flatMap((spy) => spy.mock.calls));
  assert.equal(loggedOutput.includes(recipient), false);
  assert.equal(loggedOutput.includes(token), false);
});

test("email: una entrega SMTP exitosa informa sent true", async () => {
  configureSmtp();
  mailMocks.sendMail.mockResolvedValueOnce({ messageId: "verification-message" });

  const result = await sendVerificationEmail({
    to: "testuser@example.test",
    fullName: "Usuario Prueba",
    token: "verification-token"
  });

  assert.deepEqual(result, { sent: true });
  assert.equal(mailMocks.sendMail.mock.calls.length, 1);
});

test("email: un error SMTP no filtra destinatario ni token en consola", async () => {
  configureSmtp();
  const recipient = "private-user@example.test";
  const token = "private-reset-token";
  mailMocks.sendMail.mockRejectedValueOnce(
    new Error(`SMTP rechazó ${recipient} con ${token}`)
  );
  const consoleSpies = captureConsole();

  const result = await sendPasswordResetEmail({
    to: recipient,
    fullName: "Usuario Prueba",
    token
  });

  assert.deepEqual(result, { sent: false, reason: "delivery_failed" });
  const loggedOutput = JSON.stringify(consoleSpies.flatMap((spy) => spy.mock.calls));
  assert.equal(loggedOutput.includes(recipient), false);
  assert.equal(loggedOutput.includes(token), false);
});
