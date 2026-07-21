import { withUserTransaction } from "../db/with-user-transaction.js";
import type { z } from "zod";
import type { saveCalculationSchema } from "./schemas.js";

export type SaveCalculationInput = z.infer<typeof saveCalculationSchema>;

export async function saveCalculationRepo(userId: string, input: SaveCalculationInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.saved_calculations (
          company_id,
          project_id,
          client_id,
          formula_code,
          title,
          input_data,
          price_data,
          results_data,
          total_cost,
          created_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, app.current_user_id()
        )
        RETURNING *
      `,
      [
        input.companyId,
        input.projectId ?? null,
        input.clientId ?? null,
        input.formulaCode,
        input.title,
        JSON.stringify(input.inputData),
        JSON.stringify(input.priceData),
        JSON.stringify(input.resultsData),
        input.totalCost
      ]
    );

    return result.rows[0] ?? null;
  });
}

export async function findCompanyCalculationsRepo(
  userId: string,
  companyId: string,
  projectId?: string,
  clientId?: string
) {
  return withUserTransaction(userId, async (client) => {
    let whereSql = `WHERE calc.company_id = $1`;
    const params: any[] = [companyId];

    if (projectId) {
      params.push(projectId);
      whereSql += ` AND calc.project_id = $${params.length}`;
    }

    if (clientId) {
      params.push(clientId);
      whereSql += ` AND calc.client_id = $${params.length}`;
    }

    const result = await client.query(
      `
        SELECT
          calc.*,
          CASE
            WHEN project.id IS NULL THEN NULL
            ELSE jsonb_build_object('name', project.name, 'project_code', project.project_code)
          END AS project,
          CASE
            WHEN customer.id IS NULL THEN NULL
            ELSE jsonb_build_object(
              'name', COALESCE(NULLIF(customer.business_name, ''), TRIM(CONCAT(customer.first_name, ' ', customer.last_name)))
            )
          END AS client
        FROM public.saved_calculations AS calc
        LEFT JOIN public.projects AS project ON project.id = calc.project_id
        LEFT JOIN public.clients AS customer ON customer.id = calc.client_id
        ${whereSql}
        ORDER BY calc.created_at DESC
      `,
      params
    );

    return result.rows;
  });
}

export async function getCalculationDetailRepo(userId: string, calculationId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT
          calc.*,
          CASE
            WHEN project.id IS NULL THEN NULL
            ELSE jsonb_build_object('name', project.name, 'project_code', project.project_code)
          END AS project,
          CASE
            WHEN customer.id IS NULL THEN NULL
            ELSE jsonb_build_object(
              'name', COALESCE(NULLIF(customer.business_name, ''), TRIM(CONCAT(customer.first_name, ' ', customer.last_name)))
            )
          END AS client
        FROM public.saved_calculations AS calc
        LEFT JOIN public.projects AS project ON project.id = calc.project_id
        LEFT JOIN public.clients AS customer ON customer.id = calc.client_id
        WHERE calc.id = $1
          AND calc.company_id = $2
        LIMIT 1
      `,
      [calculationId, companyId]
    );

    return result.rows[0] ?? null;
  });
}

export async function deleteCalculationRepo(userId: string, calculationId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        DELETE FROM public.saved_calculations
        WHERE id = $1
          AND company_id = $2
      `,
      [calculationId, companyId]
    );
  });
}
