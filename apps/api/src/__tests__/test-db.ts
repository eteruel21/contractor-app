import pg from "pg";

const { Pool } = pg;

export const adminPool = new Pool({
  connectionString:
    process.env.DATABASE_ADMIN_URL ||
    "postgresql://postgres:panama2104@127.0.0.1:5432/contractor_pro"
});
