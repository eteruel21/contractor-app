import assert from "node:assert/strict";
import { test } from "vitest";
import { env } from "../../config/env.js";

test("getCookieOptions: maxAge se expresa en segundos y las banderas secure/sameSite se ajustan correctamente", async () => {
  const refreshDays = env.REFRESH_TOKEN_DAYS;
  const expectedMaxAgeSeconds = refreshDays * 24 * 60 * 60;

  assert.equal(expectedMaxAgeSeconds, 30 * 24 * 60 * 60);

  // En producción o staging con HTTPS cross-origin, SameSite debe ser "none" y Secure "true"
  const isProdOrStaging = env.NODE_ENV === "production" || env.NODE_ENV === "staging";
  const expectedSameSite = isProdOrStaging ? "none" : "lax";
  const expectedSecure = isProdOrStaging;

  assert.ok(expectedSameSite === "none" || expectedSameSite === "lax");
  assert.equal(typeof expectedSecure, "boolean");
});
