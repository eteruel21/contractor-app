import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const databaseRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }

  return value;
}

const safeTestDatabaseName = /^(?:test[-_][a-z0-9][a-z0-9_-]*|[a-z0-9][a-z0-9_-]*[-_]test)$/i;
const unsafeEnvironmentMarker = /(?:^|[-_])(?:prod(?:uction)?|stag(?:e|ing)|main|live)(?:$|[-_])/i;

export function validateTestDatabaseUrl(rawUrl, nodeEnvironment) {
  if (nodeEnvironment !== "test") {
    throw new Error("La conexión de pruebas requiere NODE_ENV=test.");
  }

  const connectionString = rawUrl?.trim();
  if (!connectionString) {
    throw new Error("TEST_DATABASE_URL es obligatoria para las pruebas de base de datos.");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(connectionString);
  } catch {
    throw new Error("TEST_DATABASE_URL debe ser una URL PostgreSQL válida.");
  }

  if (parsedUrl.protocol !== "postgres:" && parsedUrl.protocol !== "postgresql:") {
    throw new Error("TEST_DATABASE_URL debe usar el protocolo postgres o postgresql.");
  }

  let databaseName;
  try {
    databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
  } catch {
    throw new Error("TEST_DATABASE_URL contiene un nombre de base de datos inválido.");
  }

  if (
    !safeTestDatabaseName.test(databaseName) ||
    unsafeEnvironmentMarker.test(databaseName)
  ) {
    throw new Error(
      "TEST_DATABASE_URL debe usar una base inequívocamente de pruebas y nunca prod, staging, main o live.",
    );
  }

  return connectionString;
}

export function requireTestDatabaseUrl() {
  return validateTestDatabaseUrl(
    process.env.TEST_DATABASE_URL,
    process.env.NODE_ENV,
  );
}


function parsePostgresUrl(rawUrl, variableName) {
  const connectionString = rawUrl?.trim();

  if (!connectionString) {
    throw new Error(`${variableName} es obligatoria.`);
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(connectionString);
  } catch {
    throw new Error(
      `${variableName} debe ser una URL PostgreSQL valida.`,
    );
  }

  if (
    parsedUrl.protocol !== "postgres:" &&
    parsedUrl.protocol !== "postgresql:"
  ) {
    throw new Error(
      `${variableName} debe usar postgres o postgresql.`,
    );
  }

  return {
    connectionString,
    parsedUrl,
  };
}

export function validateLocalAdminUrl(rawUrl) {
  const { connectionString, parsedUrl } = parsePostgresUrl(
    rawUrl,
    "DATABASE_ADMIN_URL",
  );

  const hostname = parsedUrl.hostname
    .replace(/^\[|\]$/gu, "")
    .toLowerCase();

  const localHosts = new Set([
    "localhost",
    "127.0.0.1",
    "::1",
  ]);

  if (!localHosts.has(hostname)) {
    throw new Error(
      "DATABASE_ADMIN_URL solo puede ejecutarse contra PostgreSQL local.",
    );
  }

  const username = decodeURIComponent(parsedUrl.username);

  if (username !== "postgres") {
    throw new Error(
      "DATABASE_ADMIN_URL debe usar el usuario administrativo postgres.",
    );
  }

  return connectionString;
}

export function validateSupabaseAdminUrl(rawUrl) {
  const { connectionString, parsedUrl } = parsePostgresUrl(
    rawUrl,
    "SUPABASE_ADMIN_URL",
  );

  const hostname = parsedUrl.hostname.toLowerCase();

  const isSupabaseHost =
    hostname.endsWith(".supabase.co") ||
    hostname.endsWith(".pooler.supabase.com");

  if (!isSupabaseHost) {
    throw new Error(
      "SUPABASE_ADMIN_URL debe apuntar a un host de Supabase.",
    );
  }

  const username = decodeURIComponent(parsedUrl.username);

  if (
    username !== "postgres" &&
    !username.startsWith("postgres.")
  ) {
    throw new Error(
      "SUPABASE_ADMIN_URL debe usar el usuario administrativo postgres.",
    );
  }

  return connectionString;
}


const nodePostgresSslQueryParameters = [
  "sslmode",
  "sslcert",
  "sslkey",
  "sslrootcert",
];

function stripSupabaseSslQueryParameters(
  connectionString,
) {
  const parsedUrl = new URL(connectionString);

  for (
    const parameter
    of nodePostgresSslQueryParameters
  ) {
    parsedUrl.searchParams.delete(parameter);
  }

  return parsedUrl.toString();
}

export function postgresClientConfig(rawUrl) {
  const { connectionString, parsedUrl } = parsePostgresUrl(
    rawUrl,
    "DATABASE_URL",
  );

  const hostname = parsedUrl.hostname.toLowerCase();

  const isSupabase =
    hostname.endsWith(".supabase.co") ||
    hostname.endsWith(".pooler.supabase.com");

  if (!isSupabase) {
    return {
      connectionString,
    };
  }

  const caFilename =
    process.env.DATABASE_SSL_CA_FILE?.trim();

  if (!caFilename) {
    throw new Error(
      "DATABASE_SSL_CA_FILE es obligatorio para Supabase.",
    );
  }

  const ca = readFileSync(caFilename, "utf8");

  return {
    /*
     * node-postgres reemplaza el objeto ssl cuando la URL
     * contiene sslmode/sslcert/sslkey/sslrootcert.
     * Eliminamos únicamente esos parámetros y mantenemos
     * nuestra CA verificada explícitamente.
     */
    connectionString:
      stripSupabaseSslQueryParameters(
        connectionString,
      ),
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
  };
}

export function quoteIdentifier(value) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
    throw new Error(`Identificador PostgreSQL inválido: ${value}`);
  }

  return `"${value.replaceAll('"', '""')}"`;
}

export function quoteLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function sha256Utf8(contents) {
  return createHash("sha256")
    .update(contents, "utf8")
    .digest("hex");
}

export function checksum(contents) {
  const normalizedContents =
    contents.replace(/\r\n?/gu, "\n");

  return sha256Utf8(
    normalizedContents,
  );
}

export function legacyCrLfChecksum(
  contents,
) {
  const normalizedContents =
    contents.replace(/\r\n?/gu, "\n");

  const legacyContents =
    normalizedContents.replace(
      /\n/gu,
      "\r\n",
    );

  return sha256Utf8(
    legacyContents,
  );
}

export function storedChecksumMatches(
  contents,
  storedChecksum,
) {
  if (!storedChecksum) {
    return false;
  }

  return (
    storedChecksum === checksum(contents) ||
    storedChecksum ===
      legacyCrLfChecksum(contents)
  );
}

export async function readSqlFiles(directoryName) {
  const directory = path.join(databaseRoot, directoryName);
  const filenames = (await readdir(directory))
    .filter((filename) => /^\d{3}_.+\.sql$/u.test(filename))
    .sort((left, right) => left.localeCompare(right));

  return Promise.all(
    filenames.map(async (filename) => {
      const contents = await readFile(path.join(directory, filename), "utf8");
      return { filename, contents, checksum: checksum(contents) };
    }),
  );
}

export function stripOuterTransaction(contents, filename) {
  const withoutBegin = contents.replace(
    /^(?:\s|--[^\r\n]*(?:\r?\n|$)|\/\*[\s\S]*?\*\/)*BEGIN;\s*/iu,
    "",
  );
  const commitMatch =
    /^[^\S\r\n]*COMMIT;[^\S\r\n]*$/imu.exec(withoutBegin);

  if (withoutBegin === contents || !commitMatch) {
    throw new Error(
      `${filename} debe contener una transacción exterior delimitada por BEGIN; y COMMIT;.`,
    );
  }

  const beforeCommit = withoutBegin.slice(0, commitMatch.index).trimEnd();
  const afterCommit = withoutBegin
    .slice(commitMatch.index + commitMatch[0].length)
    .trim();

  return [beforeCommit, afterCommit].filter(Boolean).join("\n\n");
}

export function stripPsqlMetaCommands(contents, filename) {
  const lines = contents.split(/\r?\n/u);
  const unsupportedCommands = lines.filter(
    (line) => /^\s*\\/u.test(line) && !/^\s*\\(?:un)?restrict\b/u.test(line),
  );

  if (unsupportedCommands.length > 0) {
    throw new Error(
      `${filename} contiene comandos psql no compatibles: ` +
        unsupportedCommands.map((line) => line.trim()).join(", "),
    );
  }

  return lines
    .filter((line) => !/^\s*\\(?:un)?restrict\b/u.test(line))
    .join("\n");
}

export async function ensureHistoryTables(client) {
  await client.query("BEGIN");

  try {
    await client.query("SET LOCAL ROLE contractor_owner");
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS app_migrations
      AUTHORIZATION contractor_owner;

      REVOKE ALL ON SCHEMA app_migrations FROM PUBLIC;

      CREATE TABLE IF NOT EXISTS app_migrations.schema_migrations (
        filename text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS app_migrations.seed_history (
        filename text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      );

      GRANT USAGE ON SCHEMA app_migrations TO contractor_migrator;
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
        app_migrations.schema_migrations,
        app_migrations.seed_history
      TO contractor_migrator;
    `);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

export async function withAdvisoryLock(client, key, callback) {
  await client.query("SELECT pg_advisory_lock(hashtext($1))", [key]);

  try {
    return await callback();
  } catch (error) {
    // Una consulta SQL que abrió su propia transacción puede dejar la sesión en
    // estado abortado. ROLLBACK permite liberar el advisory lock sin ocultar el
    // error original.
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext($1))", [key]);
  }
}
