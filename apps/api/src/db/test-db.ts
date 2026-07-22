import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

export const adminPool = new Pool({
  connectionString:
    process.env.TEST_DATABASE_URL ||
    process.env.MIGRATOR_DATABASE_URL ||
    process.env.DATABASE_ADMIN_URL ||
    "postgresql://postgres:panama2104@127.0.0.1:5432/contractor_pro"
});
