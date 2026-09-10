import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../config/env.js";
import { verifyCaptcha } from "../services.js";

const mutableEnv = env as unknown as {
  NODE_ENV: string;
  TURNSTILE_SECRET_KEY: string | undefined;
  TURNSTILE_ALLOWED_HOSTNAMES: string | undefined;
};

const original = {
  nodeEnv: mutableEnv.NODE_ENV,
  secret: mutableEnv.TURNSTILE_SECRET_KEY,
  hostnames: mutableEnv.TURNSTILE_ALLOWED_HOSTNAMES
};

function mockSiteverify(payload: unknown, status = 200) {
  const fetchMock = vi.fn(async (_input: Parameters<typeof fetch>[0], _init?: Parameters<typeof fetch>[1]) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" }
    })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("Cloudflare Turnstile server-side validation", () => {
  beforeEach(() => {
    mutableEnv.NODE_ENV = "production";
    mutableEnv.TURNSTILE_SECRET_KEY = "test-secret";
    mutableEnv.TURNSTILE_ALLOWED_HOSTNAMES = "contractor-pro-web.pages.dev,contractor-admin-web.pages.dev";
  });

  afterEach(() => {
    mutableEnv.NODE_ENV = original.nodeEnv;
    mutableEnv.TURNSTILE_SECRET_KEY = original.secret;
    mutableEnv.TURNSTILE_ALLOWED_HOSTNAMES = original.hostnames;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("acepta token válido con action y hostname esperados", async () => {
    const fetchMock = mockSiteverify({
      success: true,
      hostname: "contractor-pro-web.pages.dev",
      action: "login"
    });

    await expect(verifyCaptcha("valid-token", "203.0.113.10", "login")).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0]!;
    const body = new URLSearchParams(String(init?.body));
    expect(body.get("secret")).toBe("test-secret");
    expect(body.get("response")).toBe("valid-token");
    expect(body.get("remoteip")).toBe("203.0.113.10");
  });

  it("rechaza action distinta", async () => {
    mockSiteverify({
      success: true,
      hostname: "contractor-pro-web.pages.dev",
      action: "register"
    });

    await expect(verifyCaptcha("valid-token", "203.0.113.10", "login")).resolves.toBe(false);
  });

  it("rechaza hostname no autorizado", async () => {
    mockSiteverify({
      success: true,
      hostname: "evil.example",
      action: "login"
    });

    await expect(verifyCaptcha("valid-token", "203.0.113.10", "login")).resolves.toBe(false);
  });

  it("rechaza token expirado o reutilizado", async () => {
    mockSiteverify({
      success: false,
      "error-codes": ["timeout-or-duplicate"]
    });

    await expect(verifyCaptcha("replayed-token", "203.0.113.10", "login")).resolves.toBe(false);
  });

  it("falla cerrado cuando Siteverify no responde", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network unavailable");
    }));

    await expect(verifyCaptcha("valid-token", "203.0.113.10", "login")).resolves.toBe(false);
  });

  it("rechaza respuesta HTTP no exitosa de Siteverify", async () => {
    mockSiteverify({ success: false }, 503);

    await expect(verifyCaptcha("valid-token", "203.0.113.10", "login")).resolves.toBe(false);
  });
});
