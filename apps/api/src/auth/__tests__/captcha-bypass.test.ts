import assert from "node:assert/strict";
import { test } from "vitest";
import { verifyCaptcha } from "../services.js";
import { env } from "../../config/env.js";

test("verifyCaptcha: rechaza mock-captcha-token fuera del entorno de prueba cuando CAPTCHA_SECRET está configurado", async () => {
  const originalNodeEnv = env.NODE_ENV;
  const originalSecret = env.CAPTCHA_SECRET;

  try {
    (env as { NODE_ENV: string }).NODE_ENV = "production";
    (env as { CAPTCHA_SECRET: string | undefined }).CAPTCHA_SECRET = "test-secret-key-123";

    const isMockValid = await verifyCaptcha("mock-captcha-token", "127.0.0.1");
    assert.equal(isMockValid, false, "mock-captcha-token debe ser rechazado en producción/desarrollo");

    const isEmptyValid = await verifyCaptcha("", "127.0.0.1");
    assert.equal(isEmptyValid, false, "Token vacío debe ser rechazado en producción/desarrollo");
  } finally {
    (env as { NODE_ENV: string }).NODE_ENV = originalNodeEnv;
    (env as { CAPTCHA_SECRET: string | undefined }).CAPTCHA_SECRET = originalSecret;
  }
});
