import pg from "pg";

import {
  ensureHistoryTables,
  postgresClientConfig,
  readSqlFiles,
  requireEnv,
  stripOuterTransaction,
  stripPsqlMetaCommands,
  withAdvisoryLock,
} from "./db-utils.mjs";

const { Client } = pg;
const migratorDatabaseUrl = requireEnv("MIGRATOR_DATABASE_URL");
const client = new Client(postgresClientConfig(migratorDatabaseUrl));
const statusOnly = process.argv.includes("--status");

function stripSupabaseManagedSchemaMetadata(sql, connectionString) {
  const parsedUrl = new URL(connectionString);
  const host = parsedUrl.hostname.toLowerCase();

  const isSupabase =
    host.endsWith(".supabase.co") ||
    host.endsWith(".pooler.supabase.com");

  if (!isSupabase) {
    return sql;
  }

  return sql.replace(
    /COMMENT\s+ON\s+SCHEMA\s+"?public"?\s+IS\s+[^;]+;/giu,
    "",
  );
}

try {
  await client.connect();
  await ensureHistoryTables(client);

  await withAdvisoryLock(client, "contractor-app:migrations", async () => {
    const files = await readSqlFiles("migrations");
    const appliedResult = await client.query(
      "SELECT filename, checksum, applied_at FROM app_migrations.schema_migrations ORDER BY filename",
    );
    const legacySchemaResult = await client.query(
      "SELECT to_regclass('app_commercial.companies') IS NOT NULL AS exists",
    );

    if (
      appliedResult.rowCount === 0 &&
      legacySchemaResult.rows[0]?.exists === true
    ) {
      throw new Error(
        "La base ya contiene el esquema comercial, pero no tiene historial de " +
          "migraciones. No se aplicó ningún cambio: primero debe ejecutarse el " +
          "procedimiento de baseline para bases existentes.",
      );
    }

    const applied = new Map(
      appliedResult.rows.map((row) => [row.filename, row]),
    );

    for (const file of files) {
      const previous = applied.get(file.filename);

      if (previous && previous.checksum !== file.checksum) {
        throw new Error(
          `La migración aplicada ${file.filename} cambió de contenido. ` +
            "Crea una migración nueva en lugar de modificarla.",
        );
      }

      if (statusOnly) {
        console.log(`${previous ? "aplicada " : "pendiente"} ${file.filename}`);
        continue;
      }

      if (previous) {
        console.log(`omitida   ${file.filename}`);
        continue;
      }

      const sqlToExecute = stripSupabaseManagedSchemaMetadata(
        stripPsqlMetaCommands(
          stripOuterTransaction(file.contents, file.filename),
          file.filename,
        ),
        migratorDatabaseUrl,
      );

      await client.query("BEGIN");
      try {
        await client.query(sqlToExecute);
        await client.query(
          "INSERT INTO app_migrations.schema_migrations (filename, checksum) VALUES ($1, $2)",
          [file.filename, file.checksum],
        );
        await client.query("COMMIT");
        console.log(`aplicada  ${file.filename}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  });
} finally {
  await client.end();
}
