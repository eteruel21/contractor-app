import assert from "node:assert/strict";
import test from "node:test";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const testDbName = `contractor_pro_test_scratch_${Math.floor(Math.random() * 1000000)}`;
const adminUrl = process.env.DATABASE_ADMIN_URL || "postgresql://postgres:panama2104@127.0.0.1:5432/postgres";
const migratorUrl = `postgresql://contractor_migrator:663c3028304a4a54a87a270b55faf81a@127.0.0.1:5432/${testDbName}`;

test("T-055: Ejecutar migraciones automáticamente desde cero", async () => {
  const adminClient = new Client({ connectionString: adminUrl });
  await adminClient.connect();

  try {
    // 1. Limpiar base de datos si existe
    await adminClient.query(`DROP DATABASE IF EXISTS ${testDbName}`);

    // 2. Ejecutar bootstrap desde cero
    execSync("node --env-file-if-exists=database/.env database/scripts/bootstrap.mjs", {
      env: { ...process.env, DATABASE_NAME: testDbName },
      stdio: "pipe"
    });

    // 3. Ejecutar migraciones (migrate.mjs) desde cero
    execSync("node --env-file-if-exists=database/.env database/scripts/migrate.mjs", {
      env: { ...process.env, MIGRATOR_DATABASE_URL: migratorUrl },
      stdio: "pipe"
    });

    // 4. Verificar historial de migraciones
    const migratorClient = new Client({ connectionString: migratorUrl });
    await migratorClient.connect();

    try {
      const res = await migratorClient.query(
        "SELECT filename, checksum FROM app_migrations.schema_migrations ORDER BY filename"
      );

      assert.ok(res.rowCount > 0, "Se deben haber aplicado las migraciones en la base de datos limpia");
      
      const filesInDir = fs.readdirSync(path.join(process.cwd(), "database", "migrations"))
        .filter((f) => f.endsWith(".sql"));

      assert.equal(res.rowCount, filesInDir.length, `Se esperaban ${filesInDir.length} migraciones aplicadas`);

      // 5. Validar llaves foráneas y estado del esquema
      const validateFkSqlPath = path.join(process.cwd(), "database", "scripts", "validate_foreign_keys.sql");
      if (fs.existsSync(validateFkSqlPath)) {
        const validateSql = fs.readFileSync(validateFkSqlPath, "utf8");
        const fkResult = await migratorClient.query(validateSql);
        assert.ok(fkResult, "La validación de llaves foráneas debe ejecutarse sin errores");
      }
    } finally {
      await migratorClient.end();
    }
  } finally {
    await adminClient.query(`DROP DATABASE IF EXISTS ${testDbName}`);
    await adminClient.end();
  }
});

test("T-070: Probar ejecución de backup en modo dry-run", async () => {
  const { runBackup } = await import("./backup-staging.mjs");
  const result = await runBackup({ dryRun: true });
  assert.equal(result.success, true);
  assert.equal(result.dryRun, true);
});

test("T-071: Probar simulación de restauración de backup en modo dry-run", async () => {
  const { runRestoreTest } = await import("./restore-test.mjs");
  const result = await runRestoreTest({ dryRun: true });
  assert.equal(result.success, true);
  assert.equal(result.dryRun, true);
});
