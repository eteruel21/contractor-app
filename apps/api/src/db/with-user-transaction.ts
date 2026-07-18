import type {
  PoolClient,
  QueryResultRow
} from "pg";

import { pool } from "./pool.js";

export async function withUserTransaction<T>(
  userId: string,
  operation: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        SELECT set_config(
          'app.user_id',
          $1,
          true
        )
      `,
      [userId]
    );

    const result = await operation(client);

    await client.query("COMMIT");

    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function queryAsUser<
  T extends QueryResultRow
>(
  userId: string,
  sql: string,
  parameters: unknown[] = []
): Promise<T[]> {
  return withUserTransaction(
    userId,
    async (client) => {
      const result = await client.query<T>(
        sql,
        parameters
      );

      return result.rows;
    }
  );
}