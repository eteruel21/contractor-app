import pg from "pg";

import {
  postgresClientConfig,
  quoteLiteral,
  requireEnv,
  validateSupabaseAdminUrl,
} from "./db-utils.mjs";

const { Client } = pg;

const adminUrl = validateSupabaseAdminUrl(
  requireEnv("SUPABASE_ADMIN_URL"),
);

const migratorPassword = requireEnv(
  "CONTRACTOR_MIGRATOR_PASSWORD",
);

const apiPassword = requireEnv(
  "CONTRACTOR_API_PASSWORD",
);

const migratorSecret = quoteLiteral(migratorPassword);
const apiSecret = quoteLiteral(apiPassword);

const client = new Client(
  postgresClientConfig(adminUrl),
);

try {
  await client.connect();

  await client.query(`
    DO $prepare$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'contractor_owner'
      ) THEN
        CREATE ROLE contractor_owner
          NOLOGIN
          NOCREATEDB
          NOCREATEROLE
          NOINHERIT
          NOBYPASSRLS;
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'contractor_migrator'
      ) THEN
        CREATE ROLE contractor_migrator
          LOGIN
          NOCREATEDB
          NOCREATEROLE
          NOINHERIT
          NOBYPASSRLS;
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'contractor_api'
      ) THEN
        CREATE ROLE contractor_api
          LOGIN
          NOCREATEDB
          NOCREATEROLE
          NOINHERIT
          NOBYPASSRLS;
      END IF;
    END
    $prepare$;

    ALTER ROLE contractor_owner
      NOLOGIN
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOBYPASSRLS;

    ALTER ROLE contractor_migrator
      LOGIN
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOBYPASSRLS
      PASSWORD ${migratorSecret};

    ALTER ROLE contractor_api
      LOGIN
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOBYPASSRLS
      PASSWORD ${apiSecret};

    GRANT contractor_owner
    TO contractor_migrator;

    GRANT contractor_owner
    TO postgres;

    GRANT CONNECT
    ON DATABASE postgres
    TO contractor_migrator, contractor_api;
    GRANT CREATE ON DATABASE postgres
    TO contractor_owner;

    GRANT CREATE ON SCHEMA public
    TO contractor_owner;
  `);

  console.log(
    "Roles Contractor preparados correctamente en Supabase.",
  );
} finally {
  await client.end();
}