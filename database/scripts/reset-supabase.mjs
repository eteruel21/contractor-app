import pg from "pg";
import { postgresClientConfig, requireEnv, validateSupabaseAdminUrl } from "./db-utils.mjs";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const adminUrl = validateSupabaseAdminUrl(requireEnv("SUPABASE_ADMIN_URL"));
const client = new pg.Client(postgresClientConfig(adminUrl));

try {
  await client.connect();
  console.log("[Reset Supabase] Limpiando esquemas y objetos de la base de datos...");

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
      FOR r IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.table_name) || ' CASCADE';
      END LOOP;
      FOR r IN (SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public') LOOP
        BEGIN
          EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE';
        EXCEPTION WHEN OTHERS THEN
          -- ignora funciones reservadas del sistema
        END;
      END LOOP;
      FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
      END LOOP;
    END $$;
  `);

  console.log("[Reset Supabase] Esquemas limpios correctamente.");
} finally {
  await client.end();
}
