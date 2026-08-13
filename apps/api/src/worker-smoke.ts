import { Client } from "pg";

type Env = {
  HYPERDRIVE: {
    connectionString: string;
  };
};

export default {
  async fetch(_request: Request, env: Env) {
    const client = new Client({
      connectionString: env.HYPERDRIVE.connectionString
    });

    try {
      await client.connect();

      const result = await client.query(`
        SELECT
          current_database() AS database_name,
          current_user AS database_user,
          now() AS server_time
      `);

      return Response.json({
        status: "ok",
        service: "contractor-api-worker-smoke",
        database: result.rows[0]
      });
    } catch (error) {
      console.error(error);

      return Response.json(
        {
          status: "error",
          message: "No se pudo conectar con Supabase mediante Hyperdrive."
        },
        { status: 500 }
      );
    } finally {
      await client.end().catch(() => undefined);
    }
  }
};
