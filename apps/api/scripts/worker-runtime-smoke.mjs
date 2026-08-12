import assert from "node:assert/strict";

process.env.NODE_ENV = "production";
process.env.DATABASE_MODE = "hyperdrive";
process.env.JWT_SECRET = "worker_runtime_smoke_secret_that_is_long_enough_for_validation";

const { buildApp } = await import("../src/app.ts");
const app = await buildApp();

try {
  await app.ready();

  const healthResponse = await app.inject({
    method: "GET",
    url: "/health"
  });

  assert.equal(healthResponse.statusCode, 200);
  assert.deepEqual(healthResponse.json(), {
    status: "ok",
    service: "contractor-api",
    environment: "production"
  });

  const parameterizedRouteResponse = await app.inject({
    method: "GET",
    url: "/projects/00000000-0000-4000-8000-000000000000"
  });

  assert.equal(parameterizedRouteResponse.statusCode, 401);
  assert.deepEqual(parameterizedRouteResponse.json(), {
    message: "Se requiere autenticación."
  });

  console.log("Worker router smoke test passed.");
} finally {
  await app.close();
}
