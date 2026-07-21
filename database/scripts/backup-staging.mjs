import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { databaseRoot } from "./db-utils.mjs";

const execFileAsync = promisify(execFile);

export async function runBackup(options = {}) {
  const isDryRun = options.dryRun || process.argv.includes("--dry-run");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = options.outputDir || path.join(databaseRoot, "backups");
  const backupFilename = `backup_staging_${timestamp}.sql`;
  const backupPath = path.join(backupDir, backupFilename);

  const pgHost = process.env.PGHOST || "127.0.0.1";
  const pgPort = process.env.PGPORT || "5432";
  const pgDatabase = process.env.PGDATABASE || "contractor_pro";
  const pgUser = process.env.PGUSER || "postgres";

  console.log(`[Backup Staging] Iniciando respaldo de la base de datos ${pgDatabase}...`);

  if (isDryRun) {
    console.log(`[Dry-Run] Se crearía el directorio ${backupDir} y se ejecutaría pg_dump -> ${backupPath}`);
    return { success: true, backupPath, dryRun: true };
  }

  await mkdir(backupDir, { recursive: true });

  const env = {
    ...process.env,
    PGPASSWORD: process.env.PGPASSWORD,
  };

  try {
    await execFileAsync(
      "pg_dump",
      [
        "-h", pgHost,
        "-p", pgPort,
        "-U", pgUser,
        "-d", pgDatabase,
        "-F", "c", // Custom format (binary, compressed)
        "-b",      // Include blobs
        "-v",      // Verbose
        "-f", backupPath,
      ],
      { env },
    );

    console.log(`[Backup Staging] Respaldo completado exitosamente: ${backupPath}`);
    return { success: true, backupPath, dryRun: false };
  } catch (error) {
    console.error("[Backup Staging] Error al generar el respaldo pg_dump:", error.message);
    throw error;
  }
}

if (process.argv[1]?.endsWith("backup-staging.mjs")) {
  runBackup().catch((error) => {
    console.error("Fallo el respaldo de la base de datos:", error);
    process.exit(1);
  });
}
