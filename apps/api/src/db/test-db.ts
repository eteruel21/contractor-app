import pg from "pg";

import { validateTestDatabaseUrl } from "./test-database-env.js";

const { Pool } = pg;

const testDatabaseUrl = validateTestDatabaseUrl(
  process.env.TEST_DATABASE_URL,
  process.env.NODE_ENV
);

export const adminPool = new Pool({
  connectionString: testDatabaseUrl
});
