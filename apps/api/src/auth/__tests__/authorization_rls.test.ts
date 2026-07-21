import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../app.js";
import { adminPool } from "../../db/test-db.js";
import type { FastifyInstance } from "fastify";

describe("T-054: Suite de Pruebas de Autorización y RLS", () => {
  let app: FastifyInstance;
  const suffix = Math.floor(Math.random() * 1000000);

  const userEmails = {
    ownerA: `rls_owner_a_${suffix}@example.com`,
    ownerB: `rls_owner_b_${suffix}@example.com`,
    pending: `rls_pending_${suffix}@example.com`,
    suspended: `rls_suspended_${suffix}@example.com`,
    estimator: `rls_estimator_${suffix}@example.com`,
    sales: `rls_sales_${suffix}@example.com`
  };

  const tokens: Record<string, string> = {};
  let companyAId: string;
  let companyBId: string;
  let clientAId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Register all test users
    for (const [key, email] of Object.entries(userEmails)) {
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          fullName: `User ${key}`,
          firstName: "User",
          lastName: key,
          phone: "60002222",
          email,
          password: "Password123!",
          role: "contractor",
          province: "Panamá",
          district: "Panamá",
          corregimiento: "Bella Vista",
          termsAccepted: true
        }
      });
    }

    // Configure user states in DB via adminPool FIRST
    // Owner A & B, Estimator, Sales: verified, active, approved
    for (const email of [userEmails.ownerA, userEmails.ownerB, userEmails.estimator, userEmails.sales]) {
      await adminPool.query("UPDATE app_auth.users SET email_confirmed_at = now() WHERE email = $1", [email]);
      await adminPool.query(
        "UPDATE public.profiles SET active = true, approved_at = now() WHERE id = (SELECT id FROM app_auth.users WHERE email = $1)",
        [email]
      );
    }

    // Pending: verified email, active = false, approved_at = null
    await adminPool.query("UPDATE app_auth.users SET email_confirmed_at = now() WHERE email = $1", [userEmails.pending]);
    await adminPool.query(
      "UPDATE public.profiles SET active = false, approved_at = null WHERE id = (SELECT id FROM app_auth.users WHERE email = $1)",
      [userEmails.pending]
    );

    // Suspended: verified email, approved_at != null, active = false
    await adminPool.query("UPDATE app_auth.users SET email_confirmed_at = now() WHERE email = $1", [userEmails.suspended]);
    await adminPool.query(
      "UPDATE public.profiles SET active = false, approved_at = now() WHERE id = (SELECT id FROM app_auth.users WHERE email = $1)",
      [userEmails.suspended]
    );

    // Login AFTER configuring states
    for (const [key, email] of Object.entries(userEmails)) {
      const loginRes = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email, password: "Password123!" }
      });
      if (loginRes.statusCode === 200) {
        const body = JSON.parse(loginRes.body);
        tokens[key] = body.accessToken;
      }
    }
  });

  afterAll(async () => {
    await adminPool.query("DELETE FROM public.companies WHERE created_by IN (SELECT id FROM app_auth.users WHERE email LIKE 'rls_%')");
    await adminPool.query("DELETE FROM app_auth.users WHERE email LIKE 'rls_%'");
    await app.close();
  });

  it("1. Restricción de Usuario Pendiente (pending_approval -> 403 Forbidden)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/companies",
      headers: {
        authorization: `Bearer ${tokens.pending}`
      }
    });
    expect(res.statusCode).toBe(403);
  });

  it("2. Restricción de Usuario Suspendido (active = false -> 403 Forbidden)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/companies",
      headers: {
        authorization: `Bearer ${tokens.suspended}`
      }
    });
    expect(res.statusCode).toBe(403);
  });

  it("3. Aislamiento RLS entre Compañías (Cross-tenant isolation)", async () => {
    // Owner A creates Company A
    const compARes = await app.inject({
      method: "POST",
      url: "/companies",
      headers: { authorization: `Bearer ${tokens.ownerA}` },
      payload: { name: `Company A ${suffix}`, phone: "111", email: `compa_${suffix}@example.com` }
    });
    expect(compARes.statusCode).toBe(201);
    companyAId = JSON.parse(compARes.body).companyId;

    // Owner B creates Company B
    const compBRes = await app.inject({
      method: "POST",
      url: "/companies",
      headers: { authorization: `Bearer ${tokens.ownerB}` },
      payload: { name: `Company B ${suffix}`, phone: "222", email: `compb_${suffix}@example.com` }
    });
    expect(compBRes.statusCode).toBe(201);
    companyBId = JSON.parse(compBRes.body).companyId;

    // Owner A creates Client A in Company A
    const clientARes = await app.inject({
      method: "POST",
      url: "/clients",
      headers: { authorization: `Bearer ${tokens.ownerA}` },
      payload: {
        companyId: companyAId,
        clientType: "person",
        firstName: "Client",
        lastName: "TenantA",
        email: `client_tenant_a_${suffix}@example.com`
      }
    });
    expect(clientARes.statusCode).toBe(201);
    clientAId = JSON.parse(clientARes.body).client.id;

    // Owner B attempts to list clients of Company A -> 403 Forbidden
    const crossListRes = await app.inject({
      method: "GET",
      url: `/clients?companyId=${companyAId}`,
      headers: { authorization: `Bearer ${tokens.ownerB}` }
    });
    expect(crossListRes.statusCode).toBe(403);

    // Owner B attempts to fetch detail of Client A -> 403 Forbidden
    const crossDetailRes = await app.inject({
      method: "GET",
      url: `/clients/${clientAId}?companyId=${companyAId}`,
      headers: { authorization: `Bearer ${tokens.ownerB}` }
    });
    expect(crossDetailRes.statusCode).toBe(403);
  });

  it("4. Permisos por Rol en la misma Compañía", async () => {
    // Add Estimator and Sales to Company A via adminPool
    await adminPool.query(
      "INSERT INTO public.company_members (company_id, user_id, role, active) VALUES ($1, (SELECT id FROM app_auth.users WHERE email = $2), 'estimator', true)",
      [companyAId, userEmails.estimator]
    );
    await adminPool.query(
      "INSERT INTO public.company_members (company_id, user_id, role, active) VALUES ($1, (SELECT id FROM app_auth.users WHERE email = $2), 'sales', true)",
      [companyAId, userEmails.sales]
    );

    // Estimator tries to create Client -> 403 Forbidden
    const estimatorCreateClient = await app.inject({
      method: "POST",
      url: "/clients",
      headers: { authorization: `Bearer ${tokens.estimator}` },
      payload: {
        companyId: companyAId,
        clientType: "person",
        firstName: "Estimator",
        lastName: "Client",
        email: `est_client_${suffix}@example.com`
      }
    });
    expect(estimatorCreateClient.statusCode).toBe(403);

    // Sales tries to create Client -> 201 Created
    const salesCreateClient = await app.inject({
      method: "POST",
      url: "/clients",
      headers: { authorization: `Bearer ${tokens.sales}` },
      payload: {
        companyId: companyAId,
        clientType: "person",
        firstName: "Sales",
        lastName: "Client",
        email: `sales_client_${suffix}@example.com`
      }
    });
    expect(salesCreateClient.statusCode).toBe(201);

    // Sales tries to create Budget -> 403 Forbidden
    const salesCreateBudget = await app.inject({
      method: "POST",
      url: "/budgets/from-project",
      headers: { authorization: `Bearer ${tokens.sales}` },
      payload: {
        companyId: companyAId,
        projectId: "00000000-0000-0000-0000-000000000000",
        title: "Budget Sales Test"
      }
    });
    expect(salesCreateBudget.statusCode).toBe(403);
  });
});
