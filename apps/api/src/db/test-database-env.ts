const SAFE_TEST_DATABASE_NAME =
  /^(?:test[-_][a-z0-9][a-z0-9_-]*|[a-z0-9][a-z0-9_-]*[-_]test)$/i;

const UNSAFE_ENVIRONMENT_MARKER =
  /(?:^|[-_])(?:prod(?:uction)?|stag(?:e|ing)|main|live)(?:$|[-_])/i;

export type TestDatabaseEnvironment = Readonly<{
  TEST_DATABASE_URL: string;
  PGHOST: string;
  PGPORT: string;
  PGDATABASE: string;
  PGUSER: string;
  PGPASSWORD: string;
}>;

type ParsedTestDatabaseUrl = Readonly<{
  connectionString: string;
  databaseName: string;
  hostname: string;
  password: string;
  port: string;
  username: string;
}>;

function decodeUrlComponent(value: string, fieldName: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new Error(
      `TEST_DATABASE_URL contiene ${fieldName} con codificación inválida.`
    );
  }
}

function parseTestDatabaseUrl(
  rawUrl: string | undefined,
  nodeEnvironment: string | undefined
): ParsedTestDatabaseUrl {
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

  if (
    parsedUrl.protocol !== "postgres:" &&
    parsedUrl.protocol !== "postgresql:"
  ) {
    throw new Error(
      "TEST_DATABASE_URL debe usar el protocolo postgres o postgresql."
    );
  }

  if (parsedUrl.search || parsedUrl.hash) {
    throw new Error(
      "TEST_DATABASE_URL no permite parámetros ni fragmentos que alteren la conexión."
    );
  }

  const hostname = parsedUrl.hostname.replace(/^\[|\]$/g, "").trim();
  const username = decodeUrlComponent(parsedUrl.username, "un usuario");
  const password = decodeUrlComponent(parsedUrl.password, "una contraseña");
  const databaseName = decodeUrlComponent(
    parsedUrl.pathname.replace(/^\/+/, ""),
    "un nombre de base de datos"
  );

  if (!hostname || !username || !password) {
    throw new Error(
      "TEST_DATABASE_URL debe incluir host, usuario y contraseña explícitos."
    );
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

  return {
    connectionString,
    databaseName,
    hostname,
    password,
    port: parsedUrl.port || "5432",
    username
  };
}

export function validateTestDatabaseUrl(
  rawUrl: string | undefined,
  nodeEnvironment: string | undefined
): string {
  return parseTestDatabaseUrl(rawUrl, nodeEnvironment).connectionString;
}

export function deriveTestDatabaseEnvironment(
  rawUrl: string | undefined,
  nodeEnvironment: string | undefined
): TestDatabaseEnvironment {
  const parsed = parseTestDatabaseUrl(rawUrl, nodeEnvironment);

  return {
    TEST_DATABASE_URL: parsed.connectionString,
    PGHOST: parsed.hostname,
    PGPORT: parsed.port,
    PGDATABASE: parsed.databaseName,
    PGUSER: parsed.username,
    PGPASSWORD: parsed.password
  };
}
