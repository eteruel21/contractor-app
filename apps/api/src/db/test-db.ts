import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const SAFE_TEST_DATABASE_NAME = /^(?:test[-_][a-z0-9][a-z0-9_-]*|[a-z0-9][a-z0-9_-]*[-_]test)$/i;
const UNSAFE_ENVIRONMENT_MARKER = /(?:^|[-_])(?:prod(?:uction)?|stag(?:e|ing)|main|live)(?:$|[-_])/i;

export function validateTestDatabaseUrl(
  rawUrl: string | undefined,
  nodeEnvironment: string | undefined
): string {
  if (nodeEnvironment !== "test") {
    throw new Error(
      "La conexión administrativa de pruebas solo puede inicializarse con NODE_ENV=test."
    );
  }

  const connectionString = rawUrl?.trim();
  if (!connectionString) {
    throw new Error(
      "TEST_DATABASE_URL es obligatoria; no se permite usar una base migrator, admin o productiva como fallback."
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(connectionString);
  } catch {
    throw new Error("TEST_DATABASE_URL debe ser una URL PostgreSQL válida.");
  }

  if (parsedUrl.protocol !== "postgres:" && parsedUrl.protocol !== "postgresql:") {
    throw new Error("TEST_DATABASE_URL debe usar el protocolo postgres o postgresql.");
  }

  let databaseName: string;
  try {
    databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
  } catch {
    throw new Error("TEST_DATABASE_URL contiene un nombre de base de datos inválido.");
  }

  if (
    !SAFE_TEST_DATABASE_NAME.test(databaseName) ||
    UNSAFE_ENVIRONMENT_MARKER.test(databaseName)
  ) {
    throw new Error(
      "TEST_DATABASE_URL debe apuntar a una base inequívocamente de pruebas " +
        "(prefijo test_/test- o sufijo _test/-test) y nunca a prod, staging, main o live."
    );
  }

  return connectionString;
}

const testDatabaseUrl = validateTestDatabaseUrl(
  process.env.TEST_DATABASE_URL,
  process.env.NODE_ENV
);

export const adminPool = new Pool({
  connectionString: testDatabaseUrl
});
