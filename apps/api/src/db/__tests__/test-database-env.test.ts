import { describe, expect, it } from "vitest";

import {
  deriveTestDatabaseEnvironment,
  validateTestDatabaseUrl
} from "../test-database-env.js";

describe("test database safety guard", () => {
  it("derives PostgreSQL variables from an explicitly safe test URL", () => {
    expect(
      deriveTestDatabaseEnvironment(
        "postgresql://test_user:p%40ssword@127.0.0.1:5544/contractor_test",
        "test"
      )
    ).toEqual({
      TEST_DATABASE_URL:
        "postgresql://test_user:p%40ssword@127.0.0.1:5544/contractor_test",
      PGHOST: "127.0.0.1",
      PGPORT: "5544",
      PGDATABASE: "contractor_test",
      PGUSER: "test_user",
      PGPASSWORD: "p@ssword"
    });
  });

  it("uses PostgreSQL's default port and normalizes IPv6", () => {
    const environment = deriveTestDatabaseEnvironment(
      "postgresql://postgres:secret@[::1]/test_contractors",
      "test"
    );

    expect(environment.PGHOST).toBe("::1");
    expect(environment.PGPORT).toBe("5432");
  });

  it.each([
    "postgresql://postgres:secret@localhost:5432/test_contractors",
    "postgresql://postgres:secret@localhost:5432/test-contractors",
    "postgresql://postgres:secret@localhost:5432/contractors_test",
    "postgresql://postgres:secret@localhost:5432/contractors-test"
  ])("accepts an unambiguous test database name: %s", (url) => {
    expect(validateTestDatabaseUrl(url, "test")).toBe(url);
  });

  it.each([
    undefined,
    "",
    "not-a-url",
    "postgresql://postgres:secret@/contractor_test"
  ])(
    "rejects a missing or malformed URL: %s",
    (url) => {
      expect(() => validateTestDatabaseUrl(url, "test")).toThrow();
    }
  );

  it("rejects non-PostgreSQL protocols", () => {
    expect(() =>
      validateTestDatabaseUrl(
        "https://postgres:secret@localhost/contractor_test",
        "test"
      )
    ).toThrow("protocolo postgres o postgresql");
  });

  it.each([
    "postgresql://:secret@localhost/contractor_test",
    "postgresql://postgres@localhost/contractor_test"
  ])("rejects incomplete credentials or host: %s", (url) => {
    expect(() => validateTestDatabaseUrl(url, "test")).toThrow(
      "host, usuario y contraseña"
    );
  });

  it.each([
    "postgresql://postgres:secret@localhost/contractor_test?host=prod.example.com",
    "postgresql://postgres:secret@localhost/contractor_test#override"
  ])("rejects connection overrides: %s", (url) => {
    expect(() => validateTestDatabaseUrl(url, "test")).toThrow(
      "parámetros ni fragmentos"
    );
  });

  it.each([
    "postgresql://postgres:secret@localhost/contractor_pro",
    "postgresql://postgres:secret@localhost/test-production",
    "postgresql://postgres:secret@localhost/staging_test",
    "postgresql://postgres:secret@localhost/main_test",
    "postgresql://postgres:secret@localhost/live_test"
  ])("rejects an unsafe database name: %s", (url) => {
    expect(() => validateTestDatabaseUrl(url, "test")).toThrow(
      "inequívocamente de pruebas"
    );
  });

  it("rejects initialization outside NODE_ENV=test", () => {
    expect(() =>
      validateTestDatabaseUrl(
        "postgresql://postgres:secret@localhost/contractor_test",
        "production"
      )
    ).toThrow("NODE_ENV=test");
  });
});
