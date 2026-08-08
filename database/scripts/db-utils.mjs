import crypto from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const databaseRoot = path.resolve(currentDir, "..");

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }
  return value;
}

export function validateSupabaseAdminUrl(urlString) {
  let parsed = null;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error("SUPABASE_ADMIN_URL debe ser una URL válida.");
  }

  const hostname = parsed.hostname.toLowerCase();
  const isSupabaseHost =
    hostname.endsWith(".supabase.co") ||
    hostname.endsWith(".pooler.supabase.com");

  if (!isSupabaseHost) {
    throw new Error(
      "SUPABASE_ADMIN_URL debe apuntar a un host *.supabase.co o *.pooler.supabase.com.",
    );
  }

  return urlString;
}

export function postgresClientConfig(connectionString) {
  let parsed = null;
  try {
    parsed = new URL(connectionString);
  } catch {
    //
  }

  const host = parsed ? parsed.hostname.toLowerCase() : "";
  const isPooler = host.endsWith(".pooler.supabase.com");
  const isDirect = host.endsWith(".supabase.co");

  if (isPooler || isDirect) {
    const sslCaFile = process.env.DATABASE_SSL_CA_FILE
      ? path.resolve(process.env.DATABASE_SSL_CA_FILE)
      : path.join(databaseRoot, "certs", "supabase-ca.crt");

    return {
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }

  return { connectionString };
}

export function quoteLiteral(str) {
  return "'" + str.replace(/'/g, "''") + "'";
}

export function quoteIdentifier(str) {
  return '"' + str.replace(/"/g, '""') + '"';
}

export function checksum(contents) {
  return crypto
    .createHash("sha256")
    .update(contents, "utf8")
    .digest("hex");
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

  return withoutBegin.slice(0, commitMatch.index);
}

export function stripPsqlMetaCommands(contents, filename) {
  const lines = contents.split(/\r?\n/u);

  const unsupportedCommands = lines.filter((line) =>
    /^\s*\\(?!(?:un)?restrict\b)[a-z]+\b/iu.test(line),
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
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext($1))", [key]);
  }
}
