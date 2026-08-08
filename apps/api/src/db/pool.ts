import { readFileSync } from "node:fs";

import pg from "pg";

import { env } from "../config/env.js";

const { Pool } = pg;

function databaseSsl() {
  if (env.PGSSL === "disable") {
    return false;
  }

  if (env.PGSSL === "require") {
    return {
      rejectUnauthorized: false
    };
  }

  if (!env.PGSSL_CA_FILE) {
    throw new Error(
      "PGSSL_CA_FILE es obligatorio cuando PGSSL=verify-full."
    );
  }

  return {
    ca: readFileSync(env.PGSSL_CA_FILE, "utf8"),
    rejectUnauthorized: true
  };
}

export const pool = new Pool({
  host: env.PGHOST,
  port: env.PGPORT,
  database: env.PGDATABASE,
  user: env.PGUSER,
  password: env.PGPASSWORD,

  ssl: databaseSsl(),

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