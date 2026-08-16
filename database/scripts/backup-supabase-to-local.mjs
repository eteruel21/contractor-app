import { execFile } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import pg from "pg";

import {
  databaseRoot,
  quoteIdentifier,
  requireEnv,
  validateLocalAdminUrl,
  validateSupabaseAdminUrl,
} from "./db-utils.mjs";
import { safeErrorDetails } from "./redact-sensitive.mjs";

const { Client } = pg;
const execFileAsync = promisify(execFile);

const applicationSchemas = [
  "public",
  "app",
  "app_auth",
  "private",
  "app_migrations",
];

function databaseNameFromUrl(parsedUrl) {
  return decodeURIComponent(
    parsedUrl.pathname.replace(/^\/+/u, ""),
  );
}

function usernameFromUrl(parsedUrl) {
  return decodeURIComponent(parsedUrl.username);
}

function passwordFromUrl(parsedUrl) {
  return decodeURIComponent(parsedUrl.password);
}

function validateLocalBackupUrl(rawUrl) {
  const connectionString = validateLocalAdminUrl(rawUrl);
  const parsedUrl = new URL(connectionString);
  const databaseName = databaseNameFromUrl(parsedUrl);

  if (!databaseName) {
    throw new Error(
      "LOCAL_BACKUP_DATABASE_URL debe incluir una base de datos.",
    );
  }

  if (!/(?:backup|restore|mirror)/iu.test(databaseName)) {
    throw new Error(
      "La base local de respaldo debe incluir backup, restore o mirror en su nombre.",
    );
  }

  return {
    connectionString,
    parsedUrl,
    databaseName,
  };
}

async function requireSupabaseCaFile() {
  const configuredCaFile =
    requireEnv("DATABASE_SSL_CA_FILE");

  const caFile = path.resolve(configuredCaFile);

  try {
    await access(caFile);
  } catch {
    throw new Error(
      `No existe el certificado CA configurado: ${caFile}`,
    );
  }

  return caFile;
}

async function recreateLocalBackupDatabase(
  localUrl,
  databaseName,
) {
  const adminUrl = new URL(localUrl.toString());
  adminUrl.pathname = "/postgres";

  const client = new Client({
    connectionString: adminUrl.toString(),
  });

  await client.connect();

  try {
    const requiredRoles = [
      "contractor_owner",
      "contractor_migrator",
      "contractor_api",
      "anon",
      "authenticated",
      "service_role",
    ];

    const rolesResult = await client.query(
      `
        SELECT rolname
        FROM pg_roles
        WHERE rolname = ANY($1::text[])
      `,
      [requiredRoles],
    );

    const existingRoles = new Set(
      rolesResult.rows.map((row) => row.rolname),
    );

    const missingRoles = requiredRoles.filter(
      (role) => !existingRoles.has(role),
    );

    if (missingRoles.length > 0) {
      throw new Error(
        "Faltan roles PostgreSQL locales: " +
          missingRoles.join(", ") +
          ". Ejecuta primero npm run db:bootstrap.",
      );
    }

    const quotedDatabase =
      quoteIdentifier(databaseName);

    /*
     * Esta operacion SOLO esta permitida sobre localhost y sobre
     * una base cuyo nombre contiene backup/restore/mirror.
     * Nunca se usa contractor_pro como destino implicito.
     */
    await client.query(
      `DROP DATABASE IF EXISTS ${quotedDatabase} WITH (FORCE)`,
    );

    await client.query(
      `CREATE DATABASE ${quotedDatabase}`,
    );
  } finally {
    await client.end();
  }
}

async function verifyLocalRestore(connectionString) {
  const client = new Client({
    connectionString,
  });

  await client.connect();

  try {
    const objects = await client.query(`
      SELECT
        to_regclass(
          'app_migrations.schema_migrations'
        )::text AS migrations_table,
        to_regclass(
          'app_auth.users'
        )::text AS users_table,
        to_regclass(
          'public.companies'
        )::text AS companies_table
    `);

    const row = objects.rows[0];

    if (
      !row?.migrations_table ||
      !row?.users_table ||
      !row?.companies_table
    ) {
      throw new Error(
        "La restauracion local no contiene los objetos principales esperados.",
      );
    }

    const migrations = await client.query(`
      SELECT count(*)::integer AS count
      FROM app_migrations.schema_migrations
    `);

    const migrationCount =
      Number(migrations.rows[0]?.count ?? 0);

    if (migrationCount < 1) {
      throw new Error(
        "La restauracion local no contiene historial de migraciones.",
      );
    }

    return migrationCount;
  } finally {
    await client.end();
  }
}

export async function backupSupabaseToLocal(
  options = {},
) {
  const isDryRun =
    options.dryRun ||
    process.argv.includes("--dry-run");

  const supabaseConnectionString =
    validateSupabaseAdminUrl(
      requireEnv("SUPABASE_ADMIN_URL"),
    );

  const {
    connectionString: localConnectionString,
    parsedUrl: localUrl,
    databaseName: localDatabaseName,
  } = validateLocalBackupUrl(
    requireEnv("LOCAL_BACKUP_DATABASE_URL"),
  );

  const supabaseUrl =
    new URL(supabaseConnectionString);

  const caFile =
    await requireSupabaseCaFile();

  const timestamp =
    new Date()
      .toISOString()
      .replace(/[:.]/gu, "-");

  const backupDir =
    options.outputDir ||
    path.join(databaseRoot, "backups");

  /*
   * pg_dump -F c produce un archivo binario de formato custom.
   * Por eso usamos .dump y no .sql.
   */
  const backupFilename =
    `supabase_backup_${timestamp}.dump`;

  const backupPath =
    path.join(backupDir, backupFilename);

  console.log(
    "[Respaldo Supabase -> Local] Fuente: " +
      supabaseUrl.hostname,
  );

  console.log(
    "[Respaldo Supabase -> Local] Destino local: " +
      `${localUrl.hostname}/${localDatabaseName}`,
  );

  if (isDryRun) {
    console.log(
      `[Dry-Run] Se generaria ${backupPath}`,
    );

    console.log(
      "[Dry-Run] TLS: verify-full con certificado CA.",
    );

    console.log(
      "[Dry-Run] Se recrearia exclusivamente la base local " +
        `${localDatabaseName}.`,
    );

    return {
      success: true,
      backupPath,
      dryRun: true,
    };
  }

  await mkdir(
    backupDir,
    { recursive: true },
  );

  const supabaseEnv = {
    ...process.env,
    PGPASSWORD:
      passwordFromUrl(supabaseUrl),
    PGSSLMODE: "verify-full",
    PGSSLROOTCERT: caFile,
  };

  const schemaArguments =
    applicationSchemas.flatMap(
      (schema) => ["--schema", schema],
    );

  console.log(
    "[Respaldo Supabase -> Local] Ejecutando pg_dump...",
  );

  try {
    await execFileAsync(
      "pg_dump",
      [
        "-h",
        supabaseUrl.hostname,
        "-p",
        supabaseUrl.port || "5432",
        "-U",
        usernameFromUrl(supabaseUrl),
        "-d",
        databaseNameFromUrl(supabaseUrl) ||
          "postgres",
        "--format=custom",
        "--blobs",
        "--verbose",
        ...schemaArguments,
        "--file",
        backupPath,
      ],
      {
        env: supabaseEnv,
      },
    );
  } catch (error) {
    console.error(
      "[Respaldo Supabase -> Local] pg_dump fallo.",
    );

    throw error;
  }

  /*
   * El destino es una base local dedicada.
   * La recreamos para que la copia sea exacta y no conserve
   * objetos obsoletos de respaldos anteriores.
   */
  await recreateLocalBackupDatabase(
    localUrl,
    localDatabaseName,
  );

  const localEnv = {
    ...process.env,
    PGPASSWORD:
      passwordFromUrl(localUrl),
  };

  console.log(
    "[Respaldo Supabase -> Local] Ejecutando pg_restore...",
  );

  try {
    await execFileAsync(
      "pg_restore",
      [
        "-h",
        localUrl.hostname,
        "-p",
        localUrl.port || "5432",
        "-U",
        usernameFromUrl(localUrl),
        "-d",
        localDatabaseName,
        "--no-owner",
        "--exit-on-error",
        "--verbose",
        backupPath,
      ],
      {
        env: localEnv,
      },
    );
  } catch (error) {
    console.error(
      "[Respaldo Supabase -> Local] pg_restore fallo. " +
        "El respaldo NO sera reportado como restaurado.",
    );

    throw error;
  }

  const migrationCount =
    await verifyLocalRestore(
      localConnectionString,
    );

  console.log(
    "[Respaldo Supabase -> Local] Restauracion verificada.",
  );

  console.log(
    `[Respaldo Supabase -> Local] Migraciones verificadas: ${migrationCount}.`,
  );

  return {
    success: true,
    backupPath,
    migrationCount,
  };
}

if (
  process.argv[1]?.endsWith(
    "backup-supabase-to-local.mjs",
  )
) {
  backupSupabaseToLocal().catch(
    (error) => {
      console.error(
        "Fallo la sincronizacion de respaldo:",
        safeErrorDetails(error),
      );

      process.exit(1);
    },
  );
}