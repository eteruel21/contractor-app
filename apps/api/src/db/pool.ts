import pg from "pg";

import { env } from "../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
  host: env.PGHOST,
  port: env.PGPORT,
  database: env.PGDATABASE,
  user: env.PGUSER,
  password: env.PGPASSWORD,

  ssl:
    env.PGSSL === "require"
      ? {
          rejectUnauthorized: false
        }
      : false,

  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  application_name: "contractor-api"
});

pool.on("error", (error) => {
  console.error(
    "Error inesperado en el pool PostgreSQL:",
    error
  );
});