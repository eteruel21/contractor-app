import { withUserTransaction } from "../db/with-user-transaction.js";
import type { z } from "zod";
import type { createBudgetItemSchema } from "./schemas.js";

export type CreateBudgetItemInput = z.infer<typeof createBudgetItemSchema>;

export async function findClientBudgets(userId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(`
      SELECT
        budget.*,
        CASE
          WHEN project.id IS NULL THEN NULL
          ELSE jsonb_build_object('name', project.name)
        END AS project,
        CASE
          WHEN company.id IS NULL THEN NULL
          ELSE jsonb_build_object('name', company.name)
        END AS company
      FROM public.budgets AS budget
      JOIN public.clients AS customer ON customer.id = budget.client_id
      LEFT JOIN public.projects AS project ON project.id = budget.project_id
      LEFT JOIN public.companies AS company ON company.id = budget.company_id
      WHERE customer.user_id = app.current_user_id()
      ORDER BY budget.created_at DESC
    `);
    return result.rows;
  });
}

export async function findCompanyBudgets(userId: string, companyId: string, projectId?: string) {
  return withUserTransaction(userId, async (client) => {
    if (projectId) {
      const result = await client.query(
        `
          SELECT *
          FROM public.budgets
          WHERE company_id = $1
            AND project_id = $2
          ORDER BY created_at DESC
        `,
        [companyId, projectId]
      );
      return result.rows;
    }

    const result = await client.query(
      `
        SELECT *
        FROM public.budgets
        WHERE company_id = $1
        ORDER BY created_at DESC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function createProjectBudgetRepo(userId: string, companyId: string, projectId: string, title?: string) {
  return withUserTransaction(userId, async (client) => {
    if (title) {
      const result = await client.query<{ id: string | null }>(
        `
          SELECT public.create_project_budget($1, $2, $3) AS id
        `,
        [companyId, projectId, title]
      );
      return result.rows[0]?.id ?? null;
    }

    const result = await client.query<{ id: string | null }>(
      `
        SELECT public.create_project_budget($1, $2) AS id
      `,
      [companyId, projectId]
    );
    return result.rows[0]?.id ?? null;
  });
}

export async function getBudgetDetailsRepo(userId: string, budgetId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const budgetResult = await client.query(
      `
        SELECT *
        FROM public.budgets
        WHERE id = $1
          AND company_id = $2
        LIMIT 1
      `,
      [budgetId, companyId]
    );

    const budget = budgetResult.rows[0];
    if (!budget) return null;

    const sectionsResult = await client.query(
      `
        SELECT *
        FROM public.budget_sections
        WHERE budget_id = $1
          AND company_id = $2
        ORDER BY sort_order ASC
      `,
      [budget.id, budget.company_id]
    );

    const itemsResult = await client.query(
      `
        SELECT *
        FROM public.budget_items
        WHERE budget_id = $1
          AND company_id = $2
        ORDER BY
          sort_order ASC,
          created_at ASC
      `,
      [budget.id, budget.company_id]
    );

    const clientResult = await client.query(
      `
        SELECT *
        FROM public.clients
        WHERE id = $1
          AND company_id = $2
        LIMIT 1
      `,
      [budget.client_id, budget.company_id]
    );

    const projectResult = await client.query(
      `
        SELECT *
        FROM public.projects
        WHERE id = $1
          AND company_id = $2
        LIMIT 1
      `,
      [budget.project_id, budget.company_id]
    );

    const project = projectResult.rows[0] ?? null;
    let address = null;

    if (project?.address_id) {
      const addressResult = await client.query(
        `
          SELECT *
          FROM public.client_addresses
          WHERE id = $1
            AND company_id = $2
          LIMIT 1
        `,
        [project.address_id, budget.company_id]
      );
      address = addressResult.rows[0] ?? null;
    }

    return {
      ...budget,
      sections: sectionsResult.rows,
      items: itemsResult.rows,
      client: clientResult.rows[0] ?? null,
      project,
      address
    };
  });
}

export async function addBudgetItemRepo(userId: string, budgetId: string, input: CreateBudgetItemInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.budget_items (
          company_id,
          budget_id,
          section_id,
          catalog_item_id,
          platform_catalog_item_id,
          item_type,
          description,
          unit_name,
          quantity,
          unit_cost,
          unit_price,
          discount_percentage,
          taxable,
          notes
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )
        RETURNING *
      `,
      [
        input.companyId,
        budgetId,
        input.sectionId ?? null,
        input.catalogItemId ?? null,
        input.platformCatalogItemId ?? null,
        input.itemType,
        input.description,
        input.unitName || "unidad",
        input.quantity,
        input.unitCost,
        input.unitPrice,
        input.discountPercentage,
        input.taxable,
        input.notes || null
      ]
    );

    return result.rows[0] ?? null;
  });
}

export async function deleteBudgetItemRepo(userId: string, budgetId: string, itemId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        DELETE FROM public.budget_items
        WHERE id = $1
          AND budget_id = $2
          AND company_id = $3
      `,
      [itemId, budgetId, companyId]
    );
  });
}
