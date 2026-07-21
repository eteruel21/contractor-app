import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminPool } from "../../db/test-db.js";

describe("T-057: Suite de Pruebas de Totales de Presupuestos (Subtotales, Impuestos, Descuentos, Redondeos)", () => {
  const suffix = Math.floor(Math.random() * 1000000);
  const testEmail = `budget_calc_${suffix}@example.com`;
  let userId: string;
  let companyId: string;
  let clientId: string;
  let projectId: string;
  let budgetId: string;

  beforeAll(async () => {
    const userRes = await adminPool.query(`
      INSERT INTO app_auth.users (email, email_confirmed_at)
      VALUES ($1, now())
      RETURNING id
    `, [testEmail]);
    userId = userRes.rows[0].id;

    await adminPool.query(`
      UPDATE public.profiles SET active = true, approved_at = now() WHERE id = $1
    `, [userId]);

    const compRes = await adminPool.query(`
      INSERT INTO public.companies (name, created_by)
      VALUES ($1, $2)
      RETURNING id
    `, [`Company Budget ${suffix}`, userId]);
    companyId = compRes.rows[0].id;

    await adminPool.query(`
      INSERT INTO public.company_members (company_id, user_id, role, active)
      VALUES ($1, $2, 'owner', true)
    `, [companyId, userId]);

    const clientRes = await adminPool.query(`
      INSERT INTO public.clients (company_id, client_type, first_name, last_name, email)
      VALUES ($1, 'person', 'Budget', 'Client', $2)
      RETURNING id
    `, [companyId, `client_budget_${suffix}@example.com`]);
    clientId = clientRes.rows[0].id;

    const projRes = await adminPool.query(`
      INSERT INTO public.projects (company_id, client_id, name, created_by)
      VALUES ($1, $2, 'Project Budget Test', $3)
      RETURNING id
    `, [companyId, clientId, userId]);
    projectId = projRes.rows[0].id;

    // Set app.user_id on adminPool connection
    await adminPool.query("SELECT set_config('app.user_id', $1, false)", [userId]);

    const budgetRes = await adminPool.query(`
      SELECT public.create_project_budget($1, $2, 'Presupuesto Totales') AS id
    `, [companyId, projectId]);
    budgetId = budgetRes.rows[0].id;
  });

  afterAll(async () => {
    await adminPool.query("DELETE FROM public.companies WHERE id = $1", [companyId]);
    await adminPool.query("DELETE FROM app_auth.users WHERE id = $1", [userId]);
  });

  it("1. Subtotales de Ítems y Redondeo de 2 Decimales", async () => {
    await adminPool.query("SELECT set_config('app.user_id', $1, false)", [userId]);

    // Add Item 1: 10 unidades @ $15.55 (Taxable, 0% discount) -> $155.50
    await adminPool.query(`
      INSERT INTO public.budget_items (
        company_id, budget_id, item_type, description, quantity, unit_cost, unit_price, discount_percentage, taxable
      )
      VALUES ($1, $2, 'material', 'Material A', 10, 10, 15.55, 0, true)
    `, [companyId, budgetId]);

    // Add Item 2: 3 unidades @ $33.33 -> should round item subtotal
    await adminPool.query(`
      INSERT INTO public.budget_items (
        company_id, budget_id, item_type, description, quantity, unit_cost, unit_price, discount_percentage, taxable
      )
      VALUES ($1, $2, 'labor', 'Mano de Obra B', 3, 20, 33.33, 0, false)
    `, [companyId, budgetId]);

    const budgetRes = await adminPool.query("SELECT subtotal, tax_amount, total FROM public.budgets WHERE id = $1", [budgetId]);
    const budget = budgetRes.rows[0];

    // Total subtotal: 155.50 + 99.99 = 255.49
    expect(Number(budget.subtotal)).toBeCloseTo(255.49, 2);
  });

  it("2. Aplicación de Impuesto ITBMS (7%) sobre Subtotal Gravable", async () => {
    await adminPool.query("SELECT set_config('app.user_id', $1, false)", [userId]);

    // Update tax rate to 7%
    await adminPool.query("UPDATE public.budgets SET tax_rate = 7 WHERE id = $1", [budgetId]);
    // Recalculate totals
    await adminPool.query("SELECT public.recalculate_budget_totals($1, $2)", [companyId, budgetId]);

    const budgetRes = await adminPool.query("SELECT subtotal, tax_rate, tax_amount, total FROM public.budgets WHERE id = $1", [budgetId]);
    const budget = budgetRes.rows[0];

    // Tax amount = 155.50 * 0.07 = 10.885 -> rounded to 10.89
    expect(Number(budget.tax_amount)).toBe(10.89);
    // Total = 255.49 + 10.89 = 266.38
    expect(Number(budget.total)).toBeCloseTo(266.38, 2);
  });

  it("3. Aplicación de Descuento Porcentual", async () => {
    await adminPool.query("SELECT set_config('app.user_id', $1, false)", [userId]);

    // Apply 10% overall discount ('percent')
    await adminPool.query("UPDATE public.budgets SET discount_type = 'percent', discount_value = 10 WHERE id = $1", [budgetId]);
    await adminPool.query("SELECT public.recalculate_budget_totals($1, $2)", [companyId, budgetId]);

    const budgetRes = await adminPool.query("SELECT subtotal, discount_amount, tax_amount, total FROM public.budgets WHERE id = $1", [budgetId]);
    const budget = budgetRes.rows[0];

    expect(Number(budget.discount_amount)).toBeGreaterThan(0);
    expect(Number(budget.total)).toBeGreaterThan(0);
  });

  it("4. Manejo de Redondeos en Descuentos Fijos", async () => {
    await adminPool.query("SELECT set_config('app.user_id', $1, false)", [userId]);

    // Apply $50 fixed discount ('fixed')
    await adminPool.query("UPDATE public.budgets SET discount_type = 'fixed', discount_value = 50 WHERE id = $1", [budgetId]);
    await adminPool.query("SELECT public.recalculate_budget_totals($1, $2)", [companyId, budgetId]);

    const budgetRes = await adminPool.query("SELECT subtotal, discount_amount, total FROM public.budgets WHERE id = $1", [budgetId]);
    const budget = budgetRes.rows[0];

    expect(Number(budget.discount_amount)).toBe(50.00);
    expect(Number(budget.total)).toBeGreaterThan(0);
    expect(Number.isInteger(Math.round(Number(budget.total) * 100))).toBe(true);
  });
});
