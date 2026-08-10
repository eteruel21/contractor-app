import {
  afterEach,
  beforeEach,
  expect,
  test,
  vi
} from "vitest";

function configureRequiredEnvironment() {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("API_HOST", "127.0.0.1");
  vi.stubEnv("API_PORT", "3001");

  vi.stubEnv(
    "PGHOST",
    "db.example.supabase.co"
  );
  vi.stubEnv("PGPORT", "5432");
  vi.stubEnv("PGDATABASE", "postgres");
  vi.stubEnv(
    "PGUSER",
    "contractor_api"
  );
  vi.stubEnv(
    "PGPASSWORD",
    "test-password"
  );

  vi.stubEnv(
    "JWT_SECRET",
    "x".repeat(43)
  );
}

beforeEach(() => {
  vi.resetModules();
  configureRequiredEnvironment();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

test(
  "rechaza PGSSL=require en producción",
  async () => {
    vi.stubEnv("PGSSL", "require");
    vi.stubEnv(
      "PGSSL_CA_FILE",
      "unused-ca.pem"
    );

    vi.spyOn(
      console,
      "error"
    ).mockImplementation(() => {});

    await expect(
      import("../env.js")
    ).rejects.toThrow(
      "No se pudo cargar la configuración de la API."
    );
  }
);

test(
  "rechaza verify-full sin certificado CA",
  async () => {
    vi.stubEnv(
      "PGSSL",
      "verify-full"
    );
    vi.stubEnv(
      "PGSSL_CA_FILE",
      ""
    );

    vi.spyOn(
      console,
      "error"
    ).mockImplementation(() => {});

    await expect(
      import("../env.js")
    ).rejects.toThrow(
      "No se pudo cargar la configuración de la API."
    );
  }
);

test(
  "acepta verify-full con certificado CA",
  async () => {
    vi.stubEnv(
      "PGSSL",
      "verify-full"
    );
    vi.stubEnv(
      "PGSSL_CA_FILE",
      "C:/secure/supabase-ca.crt"
    );

    const { env } =
      await import("../env.js");

    expect(env.NODE_ENV).toBe(
      "production"
    );

    expect(env.PGSSL).toBe(
      "verify-full"
    );

    expect(
      env.PGSSL_CA_FILE
    ).toBe(
      "C:/secure/supabase-ca.crt"
    );
  }
);
test(
  "acepta Hyperdrive en producción sin variables PG locales",
  async () => {
    vi.stubEnv("DATABASE_MODE", "hyperdrive");

    delete process.env.PGHOST;
    delete process.env.PGPORT;
    delete process.env.PGDATABASE;
    delete process.env.PGUSER;
    delete process.env.PGPASSWORD;
    delete process.env.PGSSL;
    delete process.env.PGSSL_CA_FILE;

    const { env } =
      await import("../env.js");

    expect(env.NODE_ENV).toBe(
      "production"
    );

    expect(env.DATABASE_MODE).toBe(
      "hyperdrive"
    );

    expect(env.PGHOST).toBeUndefined();
  }
);
