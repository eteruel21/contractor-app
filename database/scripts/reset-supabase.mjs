import pg from "pg";

import {
  postgresClientConfig,
  requireEnv,
  validateSupabaseAdminUrl,
} from "./db-utils.mjs";

const confirmationFlag =
  "--confirm-reset-supabase";

if (!process.argv.includes(confirmationFlag)) {
  throw new Error(
    "Reset Supabase bloqueado. Se requiere " +
      `${confirmationFlag}.`,
  );
}

const expectedProjectRef =
  requireEnv("SUPABASE_PROJECT_REF");

const confirmation =
  requireEnv("SUPABASE_RESET_CONFIRMATION");

const expectedConfirmation =
  `RESET_${expectedProjectRef}`;

if (confirmation !== expectedConfirmation) {
  throw new Error(
    "SUPABASE_RESET_CONFIRMATION no coincide con " +
      "el proyecto que se pretende borrar.",
  );
}

const adminUrl =
  validateSupabaseAdminUrl(
    requireEnv("SUPABASE_ADMIN_URL"),
  );

const parsedUrl =
  new URL(adminUrl);

const hostname =
  parsedUrl.hostname.toLowerCase();

const username =
  decodeURIComponent(
    parsedUrl.username,
  );

let actualProjectRef = null;

if (
  hostname.startsWith("db.") &&
  hostname.endsWith(".supabase.co")
) {
  actualProjectRef =
    hostname.split(".")[1] ?? null;
}

if (
  !actualProjectRef &&
  username.startsWith("postgres.")
) {
  actualProjectRef =
    username.slice(
      "postgres.".length,
    );
}

if (
  !actualProjectRef ||
  actualProjectRef !== expectedProjectRef
) {
  throw new Error(
    "SUPABASE_PROJECT_REF no coincide con " +
      "SUPABASE_ADMIN_URL. Reset cancelado.",
  );
}

console.log(
  "[Reset Supabase] Confirmacion destructiva validada " +
    `para proyecto ${expectedProjectRef}.`,
);

const client =
  new pg.Client(
    postgresClientConfig(adminUrl),
  );

try {
  await client.connect();

  console.log(
    "[Reset Supabase] Eliminando SOLO los esquemas " +
      "y objetos de la aplicacion...",
  );

  await client.query(`
    DROP SCHEMA IF EXISTS app_commercial CASCADE;
    DROP SCHEMA IF EXISTS app_estimates CASCADE;
    DROP SCHEMA IF EXISTS app_payroll CASCADE;
    DROP SCHEMA IF EXISTS app_auth CASCADE;
    DROP SCHEMA IF EXISTS app CASCADE;
    DROP SCHEMA IF EXISTS private CASCADE;
    DROP SCHEMA IF EXISTS app_migrations CASCADE;

    DO $$
    DECLARE
      r RECORD;
    BEGIN
      FOR r IN (
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
      )
      LOOP
        EXECUTE
          'DROP TABLE IF EXISTS public.' ||
          quote_ident(r.table_name) ||
          ' CASCADE';
      END LOOP;

      FOR r IN (
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_schema = 'public'
      )
      LOOP
        BEGIN
          EXECUTE
            'DROP FUNCTION IF EXISTS public.' ||
            quote_ident(r.routine_name) ||
            ' CASCADE';
        EXCEPTION
          WHEN OTHERS THEN
            NULL;
        END;
      END LOOP;

      FOR r IN (
        SELECT typname
        FROM pg_type t
        JOIN pg_namespace n
          ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
          AND t.typtype = 'e'
      )
      LOOP
        EXECUTE
          'DROP TYPE IF EXISTS public.' ||
          quote_ident(r.typname) ||
          ' CASCADE';
      END LOOP;
    END $$;
  `);

  console.log(
    "[Reset Supabase] Objetos de la aplicacion eliminados.",
  );
} finally {
  await client.end();
}