import pg from "pg";

import {
  quoteIdentifier,
  quoteLiteral,
  requireEnv,
} from "./db-utils.mjs";

const { Client } = pg;

const adminUrl = requireEnv("DATABASE_ADMIN_URL");
const databaseName = process.env.DATABASE_NAME?.trim() || "contractor_pro";
const migratorPassword = requireEnv("CONTRACTOR_MIGRATOR_PASSWORD");
const apiPassword = requireEnv("CONTRACTOR_API_PASSWORD");

const database = quoteIdentifier(databaseName);
const migratorSecret = quoteLiteral(migratorPassword);
const apiSecret = quoteLiteral(apiPassword);

const client = new Client({ connectionString: adminUrl });

try {
  await client.connect();

  await client.query(`
    DO $bootstrap$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'contractor_owner') THEN
        CREATE ROLE contractor_owner
          NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'contractor_migrator') THEN
        CREATE ROLE contractor_migrator
          LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'contractor_api') THEN
        CREATE ROLE contractor_api
          LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
      END IF;
    END
    $bootstrap$;

    ALTER ROLE contractor_owner
      NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
    ALTER ROLE contractor_migrator
      LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS
      PASSWORD ${migratorSecret};
    ALTER ROLE contractor_api
      LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS
      PASSWORD ${apiSecret};

    GRANT contractor_owner TO contractor_migrator;
  `);

  const existingDatabase = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName],
  );

  if (existingDatabase.rowCount === 0) {
    await client.query(`CREATE DATABASE ${database} OWNER contractor_owner`);
    console.log(`Base de datos ${databaseName} creada.`);
  } else {
    console.log(`Base de datos ${databaseName} ya existe.`);
  }

  await client.query(`
    REVOKE ALL ON DATABASE ${database} FROM PUBLIC;
    GRANT CONNECT, TEMP ON DATABASE ${database} TO contractor_migrator;
    GRANT CONNECT ON DATABASE ${database} TO contractor_api;
  `);

  console.log("Roles y permisos base configurados correctamente.");
} finally {
  await client.end();
}
