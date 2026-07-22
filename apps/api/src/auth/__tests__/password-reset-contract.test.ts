import assert from "node:assert/strict";
import { test } from "vitest";
import { resetPasswordSchema } from "../schemas.js";

const token = "a".repeat(64);

test("resetPasswordSchema: acepta el contrato token y newPassword", () => {
  const result = resetPasswordSchema.safeParse({
    token,
    newPassword: "Password123!"
  });

  assert.equal(result.success, true);
});

test("resetPasswordSchema: rechaza el nombre legacy password", () => {
  const result = resetPasswordSchema.safeParse({
    token,
    password: "Password123!"
  });

  assert.equal(result.success, false);
});
