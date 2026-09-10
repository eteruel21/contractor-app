import assert from "node:assert/strict";
import { test, vi } from "vitest";
import { verifyCaptcha } from "../services.js";
import { env } from "../../config/env.js";

test("verifyCaptcha: Turnstile falla cerrado fuera del entorno de prueba", async () => {
  const mutableEnv = env as unknown as {
    NODE_ENV: string;
    TURNSTILE_SECRET_KEY: string | undefined;
    TURNSTILE_ALLOWED_HOSTNAMES: string | undefined;
  };

  const originalNodeEnv = mutableEnv.NODE_ENV;
  const originalSecret = mutableEnv.TURNSTILE_SECRET_KEY;
  const originalHostnames = mutableEnv.TURNSTILE_ALLOWED_HOSTNAMES;

  try {
    mutableEnv.NODE_ENV = "production";
    mutableEnv.TURNSTILE_SECRET_KEY = "test-secret-key-123";
    mutableEnv.TURNSTILE_ALLOWED_HOSTNAMES = "localhost";

    const isMockValid = await verifyCaptcha("mock-captcha-token", "127.0.0.1", "register");
    assert.equal(isMockValid, false, "mock-captcha-token debe rechazarse fuera de test");

    const isEmptyValid = await verifyCaptcha("", "127.0.0.1", "register");
    assert.equal(isEmptyValid, false, "Un token vacío debe rechazarse");

    mutableEnv.TURNSTILE_SECRET_KEY = undefined;
    const withoutSecret = await verifyCaptcha("non-empty-token", "127.0.0.1", "register");
    assert.equal(withoutSecret, false, "Turnstile debe fallar cerrado si falta el secreto");
  } finally {
    mutableEnv.NODE_ENV = originalNodeEnv;
    mutableEnv.TURNSTILE_SECRET_KEY = originalSecret;
    mutableEnv.TURNSTILE_ALLOWED_HOSTNAMES = originalHostnames;
  }
});


test("verifyCaptcha: NODE_ENV=test no omite Siteverify", async () => {
  const mutableEnv = env as unknown as {
    NODE_ENV: string;
    TURNSTILE_SECRET_KEY: string | undefined;
    TURNSTILE_ALLOWED_HOSTNAMES: string | undefined;
  };

  const originalNodeEnv = mutableEnv.NODE_ENV;
  const originalSecret = mutableEnv.TURNSTILE_SECRET_KEY;
  const originalHostnames = mutableEnv.TURNSTILE_ALLOWED_HOSTNAMES;

  try {
    mutableEnv.NODE_ENV = "test";
    mutableEnv.TURNSTILE_SECRET_KEY = "test-secret-key-123";
    mutableEnv.TURNSTILE_ALLOWED_HOSTNAMES = "localhost";
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyCaptcha("fake-turnstile-token", "127.0.0.1", "register");
    assert.equal(result, false, "NODE_ENV=test no debe aceptar un token rechazado por Siteverify");
    assert.equal(fetchMock.mock.calls.length, 1, "NODE_ENV=test debe consultar Siteverify");
  } finally {
    vi.unstubAllGlobals();
    mutableEnv.NODE_ENV = originalNodeEnv;
    mutableEnv.TURNSTILE_SECRET_KEY = originalSecret;
    mutableEnv.TURNSTILE_ALLOWED_HOSTNAMES = originalHostnames;
  }
});