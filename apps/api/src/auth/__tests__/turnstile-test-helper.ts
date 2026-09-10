import { vi } from "vitest";
import { env } from "../../config/env.js";

const mutableEnv = env as unknown as {
  TURNSTILE_SECRET_KEY: string | undefined;
  TURNSTILE_ALLOWED_HOSTNAMES: string | undefined;
};

export function installTurnstileTestMock() {
  mutableEnv.TURNSTILE_SECRET_KEY = "test-secret";
  mutableEnv.TURNSTILE_ALLOWED_HOSTNAMES = "localhost";

  vi.stubGlobal("fetch", vi.fn(async (_input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const body = new URLSearchParams(String(init?.body ?? ""));
    const token = body.get("response") ?? "";
    const action = token.startsWith("register-")
      ? "register"
      : token.startsWith("login-")
        ? "login"
        : token.startsWith("recover-")
          ? "recover_password"
          : token.startsWith("resend-")
            ? "resend_verification"
            : null;

    return new Response(JSON.stringify(action
      ? { success: true, hostname: "localhost", action }
      : { success: false, "error-codes": ["invalid-input-response"] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }));
}
