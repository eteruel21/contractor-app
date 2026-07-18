import pg from "pg";

import {
  ensureHistoryTables,
  readSqlFiles,
  requireEnv,
  withAdvisoryLock,
} from "./db-utils.mjs";

const { Client } = pg;

const expectedDatabase = requireEnv("BASELINE_CONFIRM_DATABASE");
const client = new Client({ connectionString: requireEnv("MIGRATOR_DATABASE_URL") });

const requiredRelations = [
  "app_auth.users",
  "app_auth.identities",
  "app_auth.sessions",
  "public.profiles",
  "public.budget_items",
  "public.budget_sections",
  "public.budget_versions",
  "public.budgets",
  "public.calculation_formula_parameter_history",
  "public.calculation_formula_parameters",
  "public.calculation_formulas",
  "public.catalog_categories",
  "public.catalog_items",
  "public.catalog_price_history",
  "public.catalog_yields",
  "public.client_addresses",
  "public.client_contacts",
  "public.clients",
  "public.companies",
  "public.company_members",
  "public.company_settings",
  "public.document_sequences",
  "public.platform_catalog_items",
  "public.platform_catalog_price_history",
  "public.effective_platform_catalog_prices",
  "public.project_members",
  "public.projects",
  "public.supplier_prices",
  "public.suppliers",
  "public.units",
  "public.user_catalog_price_overrides",
  "public.invoices",
];

const requiredFunctions = [
  ["app", "current_user_id"],
  ["private", "is_active_platform_user"],
  ["private", "is_super_admin"],
  ["public", "create_company"],
  ["public", "create_invoice"],
  ["public", "create_new_user_trigger"],
  ["public", "create_project_budget"],
  ["public", "handle_new_user"],
  ["public", "is_company_admin"],
  ["public", "is_company_member"],
  ["public", "is_company_owner"],
  ["public", "next_document_number"],
  ["public", "reset_personal_catalog_pricing"],
  ["public", "set_personal_catalog_pricing"],
];

const apiExecutableFunctions = [
  "create_company",
  "create_invoice",
  "set_personal_catalog_pricing",
  "reset_personal_catalog_pricing",
  "admin_save_catalog_item",
  "admin_save_formula",
  "admin_update_platform_catalog_pricing",
  "admin_adjust_platform_catalog_prices",
];

async function verifyExistingSchema() {
  const failures = [];

  const roleResult = await client.query(`
    SELECT
      role_record.rolname,
      role_record.rolsuper,
      role_record.rolcreatedb,
      role_record.rolcreaterole,
      role_record.rolbypassrls
    FROM pg_catalog.pg_roles AS role_record
    WHERE role_record.rolname IN (
      'contractor_owner',
      'contractor_migrator',
      'contractor_api'
    )
  `);
  const roles = new Map(roleResult.rows.map((role) => [role.rolname, role]));

  for (const roleName of [
    "contractor_owner",
    "contractor_migrator",
    "contractor_api",
  ]) {
    const role = roles.get(roleName);

    if (!role) {
      failures.push(`falta el rol ${roleName}`);
    } else if (
      role.rolsuper ||
      role.rolcreatedb ||
      role.rolcreaterole ||
      role.rolbypassrls
    ) {
      failures.push(`el rol ${roleName} tiene privilegios administrativos`);
    }
  }

  const membershipResult = await client.query(
    "SELECT pg_has_role('contractor_migrator', 'contractor_owner', 'MEMBER') AS allowed",
  );

  if (membershipResult.rows[0]?.allowed !== true) {
    failures.push("contractor_migrator no puede asumir contractor_owner");
  }

  for (const relationName of requiredRelations) {
    const result = await client.query("SELECT to_regclass($1) IS NOT NULL AS exists", [
      relationName,
    ]);

    if (result.rows[0]?.exists !== true) {
      failures.push(`falta la relación ${relationName}`);
    }
  }

  for (const [schemaName, functionName] of requiredFunctions) {
    const result = await client.query(
      `SELECT EXISTS (
         SELECT 1
         FROM pg_catalog.pg_proc AS procedure
         JOIN pg_catalog.pg_namespace AS namespace
           ON namespace.oid = procedure.pronamespace
         WHERE namespace.nspname = $1
           AND procedure.proname = $2
       ) AS exists`,
      [schemaName, functionName],
    );

    if (result.rows[0]?.exists !== true) {
      failures.push(`falta la función ${schemaName}.${functionName}`);
    }
  }

  const triggerResult = await client.query(`
    SELECT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_trigger AS trigger_record
      JOIN pg_catalog.pg_class AS table_record
        ON table_record.oid = trigger_record.tgrelid
      JOIN pg_catalog.pg_namespace AS schema_record
        ON schema_record.oid = table_record.relnamespace
      WHERE trigger_record.tgname = 'on_auth_user_created'
        AND NOT trigger_record.tgisinternal
        AND schema_record.nspname = 'app_auth'
        AND table_record.relname = 'users'
    ) AS exists
  `);

  if (triggerResult.rows[0]?.exists !== true) {
    failures.push("falta el trigger app_auth.users.on_auth_user_created");
  }

  for (const functionName of apiExecutableFunctions) {
    const result = await client.query(
      `SELECT COALESCE(bool_and(
         pg_catalog.has_function_privilege(
           'contractor_api',
           procedure.oid,
           'EXECUTE'
         )
       ), false) AS allowed
       FROM pg_catalog.pg_proc AS procedure
       JOIN pg_catalog.pg_namespace AS namespace
         ON namespace.oid = procedure.pronamespace
       WHERE namespace.nspname = 'public'
         AND procedure.proname = $1`,
      [functionName],
    );

    if (result.rows[0]?.allowed !== true) {
      failures.push(`contractor_api no puede ejecutar public.${functionName}`);
    }
  }

  const tablePrivileges = await client.query(`
    SELECT
      pg_catalog.has_table_privilege(
        'contractor_api',
        'public.companies',
        'SELECT,INSERT,UPDATE,DELETE'
      ) AS companies_allowed,
      pg_catalog.has_table_privilege(
        'contractor_api',
        'public.invoices',
        'SELECT,INSERT,UPDATE,DELETE'
      ) AS invoices_allowed
  `);

  if (tablePrivileges.rows[0]?.companies_allowed !== true) {
    failures.push("contractor_api no tiene los permisos esperados en companies");
  }

  if (tablePrivileges.rows[0]?.invoices_allowed !== true) {
    failures.push("contractor_api no tiene los permisos esperados en invoices");
  }

  const obsoleteFunctionResult = await client.query(`
    SELECT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_proc AS procedure
      JOIN pg_catalog.pg_namespace AS namespace
        ON namespace.oid = procedure.pronamespace
      WHERE namespace.nspname = 'public'
        AND procedure.proname = 'update_own_profile'
    ) AS exists
  `);

  if (obsoleteFunctionResult.rows[0]?.exists === true) {
    failures.push("la función obsoleta public.update_own_profile todavía existe");
  }

  return failures;
}

try {
  await client.connect();

  const databaseResult = await client.query("SELECT current_database() AS name");
  const actualDatabase = databaseResult.rows[0]?.name;

  if (actualDatabase !== expectedDatabase) {
    throw new Error(
      `La confirmación indica ${expectedDatabase}, pero la conexión apunta a ` +
        `${actualDatabase}. No se aplicó ningún cambio.`,
    );
  }

  await ensureHistoryTables(client);

  await withAdvisoryLock(client, "contractor-app:migrations", async () => {
    const historyResult = await client.query(
      "SELECT count(*)::integer AS count FROM app_migrations.schema_migrations",
    );

    if (historyResult.rows[0]?.count !== 0) {
      throw new Error("La base ya tiene historial de migraciones; no necesita baseline.");
    }

    const failures = await verifyExistingSchema();
    const seedFiles = await readSqlFiles("seeds");
    const supportedSeed = "001_import_contraloria_catalog.sql";

    if (
      seedFiles.length !== 1 ||
      seedFiles[0]?.filename !== supportedSeed
    ) {
      failures.push(
        "el conjunto de seeds no coincide con la línea base compatible",
      );
    }

    const catalogResult = await client.query(`
      SELECT count(*)::integer AS count
      FROM public.platform_catalog_items
      WHERE code LIKE 'contraloria:2025:%'
    `);

    if (catalogResult.rows[0]?.count !== 1169) {
      failures.push(
        "el catálogo oficial no contiene exactamente 1,169 partidas de 2025",
      );
    }

    if (failures.length > 0) {
      throw new Error(
        "El esquema existente no coincide con la línea base:\n- " +
          failures.join("\n- "),
      );
    }

    const files = await readSqlFiles("migrations");
    await client.query("BEGIN");

    try {
      await client.query("SET LOCAL ROLE contractor_owner");

      for (const file of files) {
        await client.query(
          `INSERT INTO app_migrations.schema_migrations (filename, checksum)
           VALUES ($1, $2)`,
          [file.filename, file.checksum],
        );
      }

      for (const seed of seedFiles) {
        await client.query(
          `INSERT INTO app_migrations.seed_history (filename, checksum)
           VALUES ($1, $2)`,
          [seed.filename, seed.checksum],
        );
      }

      await client.query("COMMIT");
      console.log(
        `Baseline registrado para ${files.length} migraciones y ` +
          `${seedFiles.length} seed en ${actualDatabase}.`,
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
} finally {
  await client.end();
}
