import { afterAll, beforeAll, describe, expect, it } from "vitest";

let testDbModule: typeof import("../test-db.js");
let previousNodeEnvironment: string | undefined;
let previousTestDatabaseUrl: string | undefined;

beforeAll(async () => {
  previousNodeEnvironment = process.env.NODE_ENV;
  previousTestDatabaseUrl = process.env.TEST_DATABASE_URL;

  process.env.NODE_ENV = "test";
  process.env.TEST_DATABASE_URL =
    "postgresql://127.0.0.1:5432/contractor_test";

  testDbModule = await import("../test-db.js");
});

afterAll(async () => {
  await testDbModule.adminPool.end();

  if (previousNodeEnvironment === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = previousNodeEnvironment;
  }

  if (previousTestDatabaseUrl === undefined) {
    delete process.env.TEST_DATABASE_URL;
  } else {
    process.env.TEST_DATABASE_URL = previousTestDatabaseUrl;
  }
});

describe("test database safety guard", () => {
  it("accepts only an explicitly marked test database in NODE_ENV=test", () => {
    const url = "postgresql://db.example.test:5432/contractor_test";

    expect(testDbModule.validateTestDatabaseUrl(url, "test")).toBe(url);
  });

  it("rejects a missing TEST_DATABASE_URL", () => {
    expect(() => testDbModule.validateTestDatabaseUrl(undefined, "test")).toThrow(
      "TEST_DATABASE_URL es obligatoria"
    );
  });

  it("rejects normal, production, and staging database names", () => {
    const unsafeUrls = [
      "postgresql://localhost:5432/contractor_pro",
      "postgresql://localhost:5432/test-production",
      "postgresql://localhost:5432/staging_test"
    ];

    for (const url of unsafeUrls) {
      expect(() => testDbModule.validateTestDatabaseUrl(url, "test")).toThrow(
        "inequívocamente de pruebas"
      );
    }
  });

  it("rejects initialization outside NODE_ENV=test", () => {
    expect(() =>
      testDbModule.validateTestDatabaseUrl(
        "postgresql://localhost:5432/contractor_test",
        "production"
      )
    ).toThrow("NODE_ENV=test");
  });
});
