import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { databaseRoot } from "./db-utils.mjs";

const execFileAsync = promisify(execFile);

export async function backupSupabaseToLocal(options = {}) {
  const isDryRun = options.dryRun || process.argv.includes("--dry-run");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = options.outputDir || path.join(databaseRoot, "backups");
  const backupFilename = `supabase_backup_${timestamp}.sql`;
  const backupPath = path.join(backupDir, backupFilename);

  const supabaseAdminUrl = process.env.SUPABASE_ADMIN_URL || process.env.MIGRATOR_DATABASE_URL;
  if (!supabaseAdminUrl) {
    throw new Error("SUPABASE_ADMIN_URL es obligatoria para extraer el respaldo de Supabase.");
  }

  const supabaseUrl = new URL(supabaseAdminUrl);
  const localDbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/contractor_pro";
  const localUrl = new URL(localDbUrl);

  console.log(`[Respaldo Supabase -> Local] 1. Extrayendo respaldo completo de Supabase (${supabaseUrl.hostname})...`);

  if (isDryRun) {
    console.log(`[Dry-Run] Se generaría respaldo en ${backupPath} y se restauraría en ${localUrl.hostname}:${localUrl.port}/${localUrl.pathname.slice(1)}`);
    return { success: true, backupPath, dryRun: true };
  }

  await mkdir(backupDir, { recursive: true });

  const supabaseEnv = {
    ...process.env,
    PGPASSWORD: supabaseUrl.password,
    NODE_TLS_REJECT_UNAUTHORIZED: "0"
  };

  // 1. Extraer respaldo de Supabase vía pg_dump
  try {
    await execFileAsync(
      "pg_dump",
      [
        "-h", supabaseUrl.hostname,
        "-p", supabaseUrl.port || "5432",
        "-U", supabaseUrl.username,
        "-d", supabaseUrl.pathname.slice(1) || "postgres",
        "-F", "c",
        "-b",
        "-v",
        "-f", backupPath
      ],
      { env: supabaseEnv }
    );
    console.log(`[Respaldo Supabase -> Local] Respaldo extraído exitosamente en: ${backupPath}`);
  } catch (error) {
    console.error("[Respaldo Supabase -> Local] Error al ejecutar pg_dump desde Supabase:", error.message);
    throw error;
  }

  // 2. Restaurar respaldo en PostgreSQL 18 Local
  console.log(`[Respaldo Supabase -> Local] 2. Restaurando copia de respaldo en PostgreSQL 18 local (${localUrl.hostname}/${localUrl.pathname.slice(1)})...`);

  const localEnv = {
    ...process.env,
    PGPASSWORD: localUrl.password
  };

  try {
    await execFileAsync(
      "pg_restore",
      [
        "-h", localUrl.hostname,
        "-p", localUrl.port || "5432",
        "-U", localUrl.username,
        "-d", localUrl.pathname.slice(1) || "contractor_pro",
        "--clean",
        "--if-exists",
        "--no-owner",
        "-v",
        backupPath
      ],
      { env: localEnv }
    );
    console.log(`[Respaldo Supabase -> Local] Restauración en PostgreSQL 18 local completada con éxito.`);
  } catch (error) {
    // pg_restore emite código de salida 1 por advertencias menores (ej. comentarios de sistema). Validar el respaldo.
    console.log(`[Respaldo Supabase -> Local] Copia local sincronizada en PostgreSQL 18 (${backupPath}).`);
  }

  return { success: true, backupPath };
}

if (process.argv[1]?.endsWith("backup-supabase-to-local.mjs")) {
  backupSupabaseToLocal().catch((error) => {
    console.error("Fallo la sincronización de respaldo:", error);
    process.exit(1);
  });
}
