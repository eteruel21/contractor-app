import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../app.js";
import { adminPool } from "../../db/test-db.js";
import type { FastifyInstance } from "fastify";

describe("T-053: Suite de Pruebas de Autenticación (Auth)", () => {
  let app: FastifyInstance;
  const testSuffix = Math.floor(Math.random() * 1000000);
  const testEmail = `auth_test_${testSuffix}@example.com`;
  const testPassword = "Password123!";
  let userId: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    if (userId) {
      await adminPool.query("DELETE FROM app_auth.tokens WHERE user_id = $1", [userId]);
      await adminPool.query("DELETE FROM app_auth.sessions WHERE user_id = $1", [userId]);
      await adminPool.query("DELETE FROM public.profiles WHERE id = $1", [userId]);
      await adminPool.query("DELETE FROM app_auth.identities WHERE user_id = $1", [userId]);
      await adminPool.query("DELETE FROM app_auth.users WHERE id = $1", [userId]);
    }
    await app.close();
  });

  it("1. Registro (POST /auth/register)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        fullName: "Usuario Prueba Auth",
        firstName: "Usuario",
        lastName: "Prueba",
        phone: "60001111",
        email: testEmail,
        password: testPassword,
        role: "client",
        province: "Panamá",
        district: "Panamá",
        corregimiento: "Bella Vista",
        termsAccepted: true,
        captchaToken: "dev-bypass-token"
      }
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.requiresEmailConfirmation).toBe(true);

    const userRes = await adminPool.query("SELECT id FROM app_auth.users WHERE email = $1", [testEmail]);
    expect(userRes.rowCount).toBe(1);
    userId = userRes.rows[0].id;
  });

  it("2. Intentar Login sin confirmar correo debe fallar con 401", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: testEmail,
        password: testPassword
      }
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.message).toContain("correo");
  });

  it("3. Confirmar correo y hacer Login exitoso (POST /auth/login)", async () => {
    // Confirm email directly in test database using adminPool
    await adminPool.query("UPDATE app_auth.users SET email_confirmed_at = now() WHERE id = $1", [userId]);

    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: testEmail,
        password: testPassword
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  it("4. Renovación de Token / Refresh (POST /auth/refresh)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      payload: {
        refreshToken
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    expect(body.refreshToken).not.toBe(refreshToken);
    refreshToken = body.refreshToken;
    accessToken = body.accessToken;
  });

  it("5. Cierre de Sesión / Logout (POST /auth/logout)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        refreshToken
      }
    });

    expect(res.statusCode).toBe(200);

    const refreshRes = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      payload: {
        refreshToken
      }
    });
    expect(refreshRes.statusCode).toBe(401);
  });

  it("6. Revocación de Sesiones", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: testEmail,
        password: testPassword
      }
    });
    expect(loginRes.statusCode).toBe(200);

    const sessionsRes = await adminPool.query("SELECT COUNT(*) FROM app_auth.sessions WHERE user_id = $1 AND revoked_at IS NULL", [userId]);
    expect(Number(sessionsRes.rows[0].count)).toBeGreaterThan(0);

    await adminPool.query("UPDATE app_auth.sessions SET revoked_at = now() WHERE user_id = $1", [userId]);

    const activeSessionsRes = await adminPool.query("SELECT COUNT(*) FROM app_auth.sessions WHERE user_id = $1 AND revoked_at IS NULL", [userId]);
    expect(Number(activeSessionsRes.rows[0].count)).toBe(0);
  });
});
