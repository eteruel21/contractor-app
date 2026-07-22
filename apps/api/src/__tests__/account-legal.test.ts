import { test, expect, describe } from "vitest";
import { buildApp } from "../app.js";

describe("Legal and Account Data End-to-End Tests (T-141)", () => {
  test("GET /health should return 200 and ok status", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("contractor-api");
  });

  test("GET /legal/terms should return terms of service content", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/legal/terms"
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.title).toBe("Términos y Condiciones de Uso");
    expect(typeof body.content).toBe("string");
  });

  test("GET /legal/privacy should return privacy policy content", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/legal/privacy"
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.title).toBe("Política de Privacidad");
    expect(typeof body.content).toBe("string");
  });

  test("GET /account/export without auth should return 401", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/account/export"
    });

    expect(response.statusCode).toBe(401);
  });

  test("DELETE /account without auth should return 401", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "DELETE",
      url: "/account"
    });

    expect(response.statusCode).toBe(401);
  });
});
