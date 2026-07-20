import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:panama2104@127.0.0.1:5432/contractor_pro"
});

const API_URL = "http://127.0.0.1:3001";

async function makeRequest(path, method, body, token) {
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch (e) {
    // Not JSON
  }
  return {
    status: response.status,
    body: json,
    rawText: text
  };
}

async function runTests() {
  console.log("=== INICIANDO PRUEBAS DE AUTORIZACIÓN Y RLS ===");
  
  // 1. Limpieza de datos de prueba
  console.log("Limpiando datos de prueba antiguos...");
  await pool.query("DELETE FROM public.companies WHERE created_by IN (SELECT id FROM app_auth.users WHERE email LIKE 'test_rls_%')");
  await pool.query("DELETE FROM app_auth.users WHERE email LIKE 'test_rls_%'");
  
  const testUsers = [
    { email: "test_rls_a@example.com", name: "User A (Owner A)", role: "contractor" },
    { email: "test_rls_b@example.com", name: "User B (Owner B)", role: "contractor" },
    { email: "test_rls_c@example.com", name: "User C (No verificado)", role: "contractor" },
    { email: "test_rls_d@example.com", name: "User D (No aprobado)", role: "contractor" },
    { email: "test_rls_e@example.com", name: "User E (Suspendido)", role: "contractor" },
    { email: "test_rls_f@example.com", name: "User F (Estimador)", role: "contractor" },
    { email: "test_rls_g@example.com", name: "User G (Sales)", role: "contractor" }
  ];
  
  // Registrar todos
  console.log("Registrando usuarios de prueba...");
  for (const u of testUsers) {
    const regRes = await makeRequest("/auth/register", "POST", {
      fullName: u.name,
      firstName: u.name.split(" ")[0],
      lastName: u.name.split(" ")[1] || "Test",
      phone: "50766667777",
      email: u.email,
      password: "password123",
      role: u.role,
      province: "Panamá",
      district: "Panamá",
      corregimiento: "Bella Vista",
      termsAccepted: true
    });
    if (regRes.status !== 201) {
      console.error(`Error registrando ${u.email}:`, regRes.body);
      process.exit(1);
    }
  }
  
  // Ajustar estados en DB
  console.log("Configurando estados en la base de datos...");
  
  // User A: verificado, aprobado, activo
  await pool.query("UPDATE app_auth.users SET email_confirmed_at = now() WHERE email = 'test_rls_a@example.com'");
  await pool.query("UPDATE public.profiles SET active = true, approved_at = now() WHERE id = (SELECT id FROM app_auth.users WHERE email = 'test_rls_a@example.com')");
  
  // User B: verificado, aprobado, activo
  await pool.query("UPDATE app_auth.users SET email_confirmed_at = now() WHERE email = 'test_rls_b@example.com'");
  await pool.query("UPDATE public.profiles SET active = true, approved_at = now() WHERE id = (SELECT id FROM app_auth.users WHERE email = 'test_rls_b@example.com')");
  
  // User C: no confirmado
  await pool.query("UPDATE app_auth.users SET email_confirmed_at = null WHERE email = 'test_rls_c@example.com'");
  
  // User D: verificado, pero no aprobado
  await pool.query("UPDATE app_auth.users SET email_confirmed_at = now() WHERE email = 'test_rls_d@example.com'");
  await pool.query("UPDATE public.profiles SET active = false, approved_at = null WHERE id = (SELECT id FROM app_auth.users WHERE email = 'test_rls_d@example.com')");
  
  // User E: verificado, aprobado, pero suspendido (active = false)
  await pool.query("UPDATE app_auth.users SET email_confirmed_at = now() WHERE email = 'test_rls_e@example.com'");
  await pool.query("UPDATE public.profiles SET active = false, approved_at = now() WHERE id = (SELECT id FROM app_auth.users WHERE email = 'test_rls_e@example.com')");
  
  // User F: verificado, aprobado, activo (estimator)
  await pool.query("UPDATE app_auth.users SET email_confirmed_at = now() WHERE email = 'test_rls_f@example.com'");
  await pool.query("UPDATE public.profiles SET active = true, approved_at = now() WHERE id = (SELECT id FROM app_auth.users WHERE email = 'test_rls_f@example.com')");
  
  // User G: verificado, aprobado, activo (sales)
  await pool.query("UPDATE app_auth.users SET email_confirmed_at = now() WHERE email = 'test_rls_g@example.com'");
  await pool.query("UPDATE public.profiles SET active = true, approved_at = now() WHERE id = (SELECT id FROM app_auth.users WHERE email = 'test_rls_g@example.com')");

  // Iniciar sesión y obtener tokens
  console.log("Obteniendo tokens de acceso...");
  const login = async (email) => {
    const res = await makeRequest("/auth/login", "POST", { email, password: "password123" });
    if (res.status !== 200) {
      return null;
    }
    return res.body.accessToken;
  };
  
  const tokenA = await login("test_rls_a@example.com");
  const tokenB = await login("test_rls_b@example.com");
  
  const resC = await makeRequest("/auth/login", "POST", { email: "test_rls_c@example.com", password: "password123" });
  console.log("Login User C (No verificado):", resC.status, resC.body);
  const tokenC = resC.body.accessToken;

  const resD = await makeRequest("/auth/login", "POST", { email: "test_rls_d@example.com", password: "password123" });
  console.log("Login User D (No aprobado):", resD.status, resD.body);
  const tokenD = resD.body.accessToken;

  const resE = await makeRequest("/auth/login", "POST", { email: "test_rls_e@example.com", password: "password123" });
  console.log("Login User E (Suspendido):", resE.status, resE.body);
  const tokenE = resE.body.accessToken;

  const tokenF = await login("test_rls_f@example.com");
  const tokenG = await login("test_rls_g@example.com");
  
  // --- T-035: Comprobar usuarios pendientes y suspendidos ---
  console.log("\n--- T-035: Probando restricciones de usuarios inactivos/pendientes ---");
  
  // User C: no verificado
  if (tokenC) {
    const res = await makeRequest("/companies", "GET", null, tokenC);
    console.log(`User C (No verificado) GET /companies status: ${res.status} (Esperado: 401 o 403)`);
    if (res.status !== 401 && res.status !== 403) {
       throw new Error("ERROR: User C sin confirmar pudo acceder!");
    }
  } else {
    console.log("User C (No verificado) no pudo iniciar sesión (Esperado)");
  }
  
  // User D: pendiente aprobación
  const resD_route = await makeRequest("/companies", "GET", null, tokenD);
  console.log(`User D (Pendiente aprobación) GET /companies status: ${resD_route.status} (Esperado: 403)`);
  if (resD_route.status !== 403) {
    throw new Error("ERROR: User D pendiente pudo acceder!");
  }
  
  // User E: suspendido
  const resE_route = await makeRequest("/companies", "GET", null, tokenE);
  console.log(`User E (Suspendido) GET /companies status: ${resE_route.status} (Esperado: 403)`);
  if (resE_route.status !== 403) {
    throw new Error("ERROR: User E suspendido pudo acceder!");
  }
  
  // --- Crear Compañías ---
  console.log("\nCreando empresas comerciales...");
  const compARes = await makeRequest("/companies", "POST", { name: "Company A Test", phone: "123", email: "comp_a@example.com" }, tokenA);
  if (compARes.status !== 201) {
    throw new Error(`ERROR creando Company A: ${compARes.rawText}`);
  }
  const companyAId = compARes.body.companyId;
  console.log(`Empresa A creada: ${companyAId}`);
  
  const compBRes = await makeRequest("/companies", "POST", { name: "Company B Test", phone: "456", email: "comp_b@example.com" }, tokenB);
  if (compBRes.status !== 201) {
    throw new Error(`ERROR creando Company B: ${compBRes.rawText}`);
  }
  const companyBId = compBRes.body.companyId;
  console.log(`Empresa B creada: ${companyBId}`);
  
  // Hacer a User F estimator en Company A
  await pool.query(
    "INSERT INTO public.company_members (company_id, user_id, role, active) VALUES ($1, (SELECT id FROM app_auth.users WHERE email = 'test_rls_f@example.com'), 'estimator', true)",
    [companyAId]
  );
  console.log("User F agregado como Estimator en Company A");

  // Hacer a User G sales en Company A
  await pool.query(
    "INSERT INTO public.company_members (company_id, user_id, role, active) VALUES ($1, (SELECT id FROM app_auth.users WHERE email = 'test_rls_g@example.com'), 'sales', true)",
    [companyAId]
  );
  console.log("User G agregado como Sales en Company A");

  // --- T-034: Aislamiento entre Compañías ---
  console.log("\n--- T-034: Probando aislamiento entre compañías (RLS) ---");
  
  // User A crea cliente en Company A
  const clientARes = await makeRequest("/clients", "POST", {
    companyId: companyAId,
    clientType: "person",
    firstName: "Client",
    lastName: "A",
    email: "clienta@example.com"
  }, tokenA);
  console.log("Cliente creado en Company A:", clientARes.body);
  if (!clientARes.body.client?.id) {
    throw new Error(`ERROR al obtener ID del cliente A creado: ${clientARes.rawText}`);
  }
  const clientAId = clientARes.body.client.id;
  
  // User B (Company B) intenta leer clientes de Company A pasando companyId de Company A
  const readClientsB = await makeRequest(`/clients?companyId=${companyAId}`, "GET", null, tokenB);
  console.log(`User B intenta listar clientes de Company A status: ${readClientsB.status} (Esperado: 403)`);
  if (readClientsB.status !== 403) {
    throw new Error("ERROR: User B pudo saltarse la barrera de compañía!");
  }
  
  // User B intenta leer los detalles directos del cliente A
  const readClientDetailsB = await makeRequest(`/clients/${clientAId}?companyId=${companyAId}`, "GET", null, tokenB);
  console.log(`User B intenta leer cliente directo de Company A status: ${readClientDetailsB.status} (Esperado: 403)`);
  if (readClientDetailsB.status !== 403) {
    throw new Error("ERROR: User B pudo leer cliente de A!");
  }
  
  // --- T-036: Verificación de Roles ---
  console.log("\n--- T-036: Probando límites de roles en la misma compañía ---");
  
  // User F (Estimator) intenta crear un cliente: Debe fallar (403)
  const createClientF = await makeRequest("/clients", "POST", {
    companyId: companyAId,
    clientType: "person",
    firstName: "Client",
    lastName: "F",
    email: "clientf@example.com"
  }, tokenF);
  console.log(`User F (Estimator) intenta crear cliente status: ${createClientF.status} (Esperado: 403)`);
  if (createClientF.status !== 403) {
    throw new Error("ERROR: Estimator pudo crear un cliente!");
  }
  
  // User G (Sales) intenta crear un cliente: Debe tener éxito (201)
  const createClientG = await makeRequest("/clients", "POST", {
    companyId: companyAId,
    clientType: "person",
    firstName: "Client",
    lastName: "G",
    email: "clientg@example.com"
  }, tokenG);
  console.log(`User G (Sales) intenta crear cliente status: ${createClientG.status} (Esperado: 201)`);
  if (createClientG.status !== 201) {
    throw new Error("ERROR: Sales no pudo crear un cliente!");
  }
  
  // User G (Sales) intenta crear un presupuesto: Debe fallar (403)
  const createBudgetG = await makeRequest("/budgets/from-project", "POST", {
    companyId: companyAId,
    projectId: "00000000-0000-0000-0000-000000000000",
    title: "Budget G"
  }, tokenG);
  console.log(`User G (Sales) intenta crear presupuesto en API status: ${createBudgetG.status} (Esperado: 403)`);
  if (createBudgetG.status !== 403) {
    throw new Error("ERROR: Sales pudo crear un presupuesto!");
  }
  
  console.log("\n=== TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO ===");
}

runTests()
  .catch(err => {
    console.error("ERROR EN LA SUITE DE PRUEBAS:", err);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Limpiando datos finales de prueba...");
    try {
      await pool.query("DELETE FROM public.companies WHERE created_by IN (SELECT id FROM app_auth.users WHERE email LIKE 'test_rls_%')");
      await pool.query("DELETE FROM app_auth.users WHERE email LIKE 'test_rls_%'");
    } catch (e) {
      console.error("Error during final cleanup:", e);
    }
    await pool.end();
  });
