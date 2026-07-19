import { createHash } from "node:crypto";
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

export function quoteIdentifier(value) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
    throw new Error(`Identificador PostgreSQL inválido: ${value}`);
  }

  return `"${value.replaceAll('"', '""')}"`;
}

export function quoteLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

export function checksum(contents) {
  const normalizedContents = contents.replace(/\r\n?/gu, "\n");
  return createHash("sha256")
    .update(normalizedContents, "utf8")
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
  const withoutBegin = contents.replace(/^\s*BEGIN;\s*/iu, "");
  const withoutCommit = withoutBegin.replace(/\s*COMMIT;\s*$/iu, "");

  if (withoutBegin === contents || withoutCommit === withoutBegin) {
    throw new Error(
      `${filename} debe comenzar con BEGIN; y terminar con COMMIT;.`,
    );
  }

  return withoutCommit;
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
