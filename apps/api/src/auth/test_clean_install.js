import pg from "pg";
import { execSync, spawn } from "child_process";
import http from "http";
import path from "path";

const { Client } = pg;

const testDbName = "contractor_pro_clean_test";
const adminUrl = "postgresql://postgres:panama2104@127.0.0.1:5432/postgres";
const migratorUrl = `postgresql://contractor_migrator:663c3028304a4a54a87a270b55faf81a@127.0.0.1:5432/${testDbName}`;
const apiUrl = `http://127.0.0.1:3002`;

async function makeRequest(urlPath, method, body) {
  return new Promise((resolve, reject) => {
    const dataStr = body ? JSON.stringify(body) : "";
    const options = {
      hostname: "127.0.0.1",
      port: 3002,
      path: urlPath,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(dataStr)
      }
    };

    const req = http.request(options, (res) => {
      let rawData = "";
      res.on("data", (chunk) => { rawData += chunk; });
      res.on("end", () => {
        let parsed = null;
        try {
          parsed = JSON.parse(rawData);
        } catch (_) {}
        resolve({ status: res.statusCode, body: parsed, rawText: rawData });
      });
    });

    req.on("error", (err) => reject(err));
    if (dataStr) {
      req.write(dataStr);
    }
    req.end();
  });
}

async function waitForServer() {
  const maxAttempts = 50;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`${apiUrl}/health`, (res) => {
          if (res.statusCode === 200) resolve();
          else reject();
        });
        req.on("error", reject);
        req.end();
      });
      console.log("✓ API Server is running on port 3002");
      return;
    } catch (_) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error("Timeout waiting for API server on port 3002");
}

async function run() {
  console.log("=== INICIANDO PRUEBA DE INSTALACIÓN LIMPIA Y REGISTRO (T-014/T-015) ===");

  const adminClient = new Client({ connectionString: adminUrl });
  await adminClient.connect();

  console.log("Preparando base de datos de prueba limpia...");
  await adminClient.query(`DROP DATABASE IF EXISTS ${testDbName}`);
  console.log(`✓ Base de datos ${testDbName} eliminada si existía.`);

  console.log("Ejecutando script de bootstrap...");
  execSync("node --env-file-if-exists=database/.env database/scripts/bootstrap.mjs", {
    env: { ...process.env, DATABASE_NAME: testDbName },
    stdio: "inherit"
  });
  console.log("✓ Bootstrap completado con éxito.");

  console.log("Ejecutando comando de migración (db:migrate)...");
  execSync("node --env-file-if-exists=database/.env database/scripts/migrate.mjs", {
    env: { ...process.env, MIGRATOR_DATABASE_URL: migratorUrl },
    stdio: "inherit"
  });
  console.log("✓ Migraciones completadas con éxito.");

  console.log("Ejecutando comando de semillas (db:seed)...");
  execSync("node --env-file-if-exists=database/.env database/scripts/seed.mjs", {
    env: { ...process.env, MIGRATOR_DATABASE_URL: migratorUrl },
    stdio: "inherit"
  });
  console.log("✓ Semillas completadas con éxito.");

  console.log("Iniciando servidor API temporal en puerto 3002...");
  const tsxPath = path.resolve("node_modules/tsx/dist/cli.mjs");
  const apiServerPath = path.resolve("apps/api/src/server.ts");
  const apiDir = path.resolve("apps/api");

  const serverProcess = spawn("node", [tsxPath, apiServerPath], {
    cwd: apiDir,
    env: {
      ...process.env,
      PGDATABASE: testDbName,
      API_PORT: "3002",
      API_HOST: "127.0.0.1",
      NODE_ENV: "test"
    }
  });

  serverProcess.stdout.on("data", (data) => {
    console.log(`[API STDOUT] ${data}`);
  });
  serverProcess.stderr.on("data", (data) => {
    console.error(`[API STDERR] ${data}`);
  });

  try {
    await waitForServer();

    console.log("Probando registro de usuario (T-014)...");
    const regRes = await makeRequest("/auth/register", "POST", {
      email: "test_clean_install@example.com",
      password: "password123",
      fullName: "Clean Install User",
      firstName: "Clean",
      lastName: "Install",
      phone: "50766667777",
      termsAccepted: true,
      province: "Panamá",
      district: "Panamá",
      corregimiento: "Bella Vista",
      captchaToken: "dev-bypass-token"
    });

    console.log("Registro status:", regRes.status, regRes.body);
    if (regRes.status !== 201) {
      throw new Error(`Error en el registro del usuario: ${regRes.rawText}`);
    }

    console.log("Verificando existencia y estado del perfil en la base de datos...");
    const dbClient = new Client({
      connectionString: `postgresql://postgres:panama2104@127.0.0.1:5432/${testDbName}`
    });
    await dbClient.connect();

    const profileRes = await dbClient.query(`
      SELECT p.id, p.active, p.approved_at, u.email
      FROM public.profiles p
      JOIN app_auth.users u ON p.id = u.id
      WHERE u.email = 'test_clean_install@example.com'
    `);

    if (profileRes.rowCount === 0) {
      throw new Error("ERROR: ¡El perfil no fue creado en public.profiles!");
    }

    const profile = profileRes.rows[0];
    console.log("Perfil encontrado:", profile);

    if (profile.active !== false) {
      throw new Error(`ERROR: Se esperaba active = false, obtenido: ${profile.active}`);
    }

    if (profile.approved_at !== null) {
      throw new Error(`ERROR: Se esperaba approved_at = null, obtenido: ${profile.approved_at}`);
    }

    console.log("✓ Verificación del trigger de perfil exitosa.");
    await dbClient.end();

    console.log("\n=== PRUEBA DE INSTALACIÓN LIMPIA Y REGISTRO PASADA CON ÉXITO ===");
  } finally {
    console.log("Deteniendo servidor API temporal...");
    serverProcess.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 1000));

    console.log("Limpiando base de datos de prueba limpia...");
    await adminClient.query(`DROP DATABASE IF EXISTS ${testDbName}`);
    await adminClient.end();
  }
}

run().catch((err) => {
  console.error("ERROR EN LA SUITE DE INSTALACIÓN LIMPIA:", err);
  process.exit(1);
});
