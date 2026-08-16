import { readFileSync } from "node:fs";

import pg from "pg";
import type {
  PoolClient,
  QueryResult,
  QueryResultRow
} from "pg";

import { env } from "../config/env.js";
import { safeErrorDetails } from "../security/redaction.js";

const { Client, Pool } = pg;

let hyperdriveConnectionString: string | null = null;

export function configureHyperdriveDatabase(
  connectionString: string
): void {
  const normalized = connectionString.trim();

  if (!normalized) {
    throw new Error(
      "La cadena de conexión de Hyperdrive está vacía."
    );
  }

  hyperdriveConnectionString = normalized;
}

function requireHyperdriveConnectionString(): string {
  if (!hyperdriveConnectionString) {
    throw new Error(
      "Hyperdrive no ha sido configurado para esta ejecución."
    );
  }

  return hyperdriveConnectionString;
}

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

const localPool =
  env.DATABASE_MODE === "postgres"
    ? new Pool({
        host: env.PGHOST!,
        port: env.PGPORT!,
        database: env.PGDATABASE!,
        user: env.PGUSER!,
        password: env.PGPASSWORD!,

        ssl: databaseSsl(),

        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
        application_name: "contractor-api"
      })
    : null;

if (localPool) {
  localPool.on("error", (error) => {
    console.error(
      "Error inesperado en el pool PostgreSQL:",
      safeErrorDetails(error)
    );
  });
}

async function createHyperdriveClient(): Promise<PoolClient> {
  const client = new Client({
    connectionString:
      requireHyperdriveConnectionString()
  });

  await client.connect();

  const compatibleClient =
    client as unknown as PoolClient;

  compatibleClient.release = (() =>
    client.end()) as PoolClient["release"];

  return compatibleClient;
}

async function queryHyperdrive<
  T extends QueryResultRow
>(
  sql: string,
  parameters: unknown[]
): Promise<QueryResult<T>> {
  const client = new Client({
    connectionString:
      requireHyperdriveConnectionString()
  });

  await client.connect();

  try {
    return await client.query<T>(
      sql,
      parameters
    );
  } finally {
    await client.end();
  }
}

export const pool = {
  async query<
    T extends QueryResultRow = QueryResultRow
  >(
    sql: string,
    parameters: unknown[] = []
  ): Promise<QueryResult<T>> {
    if (localPool) {
      return localPool.query<T>(
        sql,
        parameters
      );
    }

    return queryHyperdrive<T>(
      sql,
      parameters
    );
  },

  async connect(): Promise<PoolClient> {
    if (localPool) {
      return localPool.connect();
    }

    return createHyperdriveClient();
  },

  async end(): Promise<void> {
    if (localPool) {
      await localPool.end();
    }
  }
};
