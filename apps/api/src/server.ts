import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";

const app = await buildApp();

const closeApplication = async (signal: string): Promise<void> => {
  app.log.info({ signal }, "Cerrando la API");
  await app.close();
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", () => {
  void closeApplication("SIGINT");
});

process.on("SIGTERM", () => {
  void closeApplication("SIGTERM");
});

try {
  await app.listen({
    host: env.API_HOST,
    port: env.API_PORT
  });
} catch (error) {
  app.log.error(error);
  await pool.end();
  process.exit(1);
}