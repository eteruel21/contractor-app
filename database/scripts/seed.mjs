import pg from "pg";

import {
  ensureHistoryTables,
  readSqlFiles,
  requireEnv,
  withAdvisoryLock,
} from "./db-utils.mjs";

const { Client } = pg;
const client = new Client({ connectionString: requireEnv("MIGRATOR_DATABASE_URL") });

try {
  await client.connect();
  await ensureHistoryTables(client);

  await withAdvisoryLock(client, "contractor-app:seeds", async () => {
    const migrations = await readSqlFiles("migrations");
    const migrationResult = await client.query(
      "SELECT filename, checksum FROM app_migrations.schema_migrations ORDER BY filename",
    );
    const appliedMigrations = new Map(
      migrationResult.rows.map((row) => [row.filename, row.checksum]),
    );
    const pendingMigrations = migrations.filter(
      (migration) => !appliedMigrations.has(migration.filename),
    );

    if (pendingMigrations.length > 0) {
      throw new Error(
        "No se pueden aplicar seeds mientras existan migraciones pendientes: " +
          pendingMigrations.map((migration) => migration.filename).join(", "),
      );
    }

    for (const migration of migrations) {
      if (appliedMigrations.get(migration.filename) !== migration.checksum) {
        throw new Error(
          `La migración aplicada ${migration.filename} cambió de contenido.`,
        );
      }
    }

    const files = await readSqlFiles("seeds");
    const appliedResult = await client.query(
      "SELECT filename, checksum FROM app_migrations.seed_history ORDER BY filename",
    );
    const applied = new Map(
      appliedResult.rows.map((row) => [row.filename, row.checksum]),
    );

    for (const file of files) {
      const previousChecksum = applied.get(file.filename);

      if (previousChecksum && previousChecksum !== file.checksum) {
        throw new Error(
          `El seed aplicado ${file.filename} cambió de contenido. ` +
            "Crea un seed nuevo en lugar de modificarlo.",
        );
      }

      if (previousChecksum) {
        console.log(`omitido   ${file.filename}`);
        continue;
      }

      try {
        await client.query(file.contents);
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
      }
      await client.query("BEGIN");

      try {
        await client.query("SET LOCAL ROLE contractor_owner");
        await client.query(
          `INSERT INTO app_migrations.seed_history (filename, checksum)
           VALUES ($1, $2)`,
          [file.filename, file.checksum],
        );
        await client.query("COMMIT");
        console.log(`aplicado  ${file.filename}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  });
} finally {
  await client.end();
}
