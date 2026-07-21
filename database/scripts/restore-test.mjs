import { execFile } from "node:child_process";
import { promisify } from "node:util";
import pg from "pg";
import { databaseRoot } from "./db-utils.mjs";

const execFileAsync = promisify(execFile);
const { Client } = pg;

export async function runRestoreTest(options = {}) {
  const isDryRun = options.dryRun || process.argv.includes("--dry-run");
  const backupPath = options.backupPath || process.env.TEST_BACKUP_PATH;

  console.log("[Restore Test] Iniciando verificación de restauración de backup...");

  if (isDryRun) {
    console.log("[Dry-Run] Verificación simulada exitosa. Se probaría pg_restore contra una base de datos aislada y se verificarían los esquemas.");
    return { success: true, dryRun: true };
  }

  if (!backupPath) {
    throw new Error("Debe especificar la ruta del archivo de backup en TEST_BACKUP_PATH o pasarlo como parámetro.");
  }

  const targetDatabase = options.targetDatabase || process.env.RESTORE_TEST_DB || "contractor_restore_test";
  const pgHost = process.env.PGHOST || "127.0.0.1";
  const pgPort = process.env.PGPORT || "5432";
  const pgUser = process.env.PGUSER || "postgres";

  console.log(`[Restore Test] Restaurando ${backupPath} en la base de datos temporal ${targetDatabase}...`);

  const env = {
    ...process.env,
    PGPASSWORD: process.env.PGPASSWORD,
  };

  // 1. Ejecutar pg_restore
  await execFileAsync(
    "pg_restore",
    [
      "-h", pgHost,
      "-p", pgPort,
      "-U", pgUser,
      "-d", targetDatabase,
      "--clean",
      "--if-exists",
      "-v",
      backupPath,
    ],
    { env },
  );

  // 2. Conectarse a la BD restaurada y verificar tablas e integridad
  const client = new Client({
    host: pgHost,
    port: Number(pgPort),
    database: targetDatabase,
    user: pgUser,
    password: process.env.PGPASSWORD,
  });

  await client.connect();

  try {
    const tableCheckResult = await client.query(`
      SELECT count(*) AS total_tables
      FROM information_schema.tables
      WHERE table_schema IN ('app_auth', 'app_identity', 'app_billing', 'app_catalog', 'app_operations')
    `);

    const tableCount = parseInt(tableCheckResult.rows[0].total_tables, 10);
    console.log(`[Restore Test] Tablas encontradas en la BD restaurada: ${tableCount}`);

    if (tableCount === 0) {
      throw new Error("No se encontraron tablas de la aplicación en la base de datos restaurada.");
    }

    console.log("[Restore Test] Restauración y validación de esquema completada con éxito.");
    return { success: true, tableCount, dryRun: false };
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.endsWith("restore-test.mjs")) {
  runRestoreTest().catch((error) => {
    console.error("Fallo la verificación de restauración del backup:", error);
    process.exit(1);
  });
}
