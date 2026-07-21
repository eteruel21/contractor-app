import { withUserTransaction } from "../db/with-user-transaction.js";
import type { z } from "zod";
import type { createProjectSchema } from "./schemas.js";

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export async function findClientProjectsRepo(userId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(`
      SELECT
        project.*,
        jsonb_build_object('name', company.name) AS company
      FROM public.projects AS project
      JOIN public.clients AS customer ON customer.id = project.client_id
      JOIN public.companies AS company ON company.id = project.company_id
      WHERE customer.user_id = app.current_user_id()
        AND customer.active = true
        AND company.active = true
      ORDER BY project.created_at DESC
    `);
    return result.rows;
  });
}

export async function findCompanyProjectsRepo(userId: string, companyId: string, clientId?: string) {
  return withUserTransaction(userId, async (client) => {
    if (clientId) {
      const result = await client.query(
        `
          SELECT *
          FROM public.projects
          WHERE company_id = $1 AND client_id = $2
          ORDER BY created_at DESC
        `,
        [companyId, clientId]
      );
      return result.rows;
    }

    const result = await client.query(
      `
        SELECT
          project.*,
          CASE
            WHEN customer.id IS NULL THEN NULL
            ELSE jsonb_build_object(
              'id', customer.id,
              'client_type', customer.client_type,
              'first_name', customer.first_name,
              'last_name', customer.last_name,
              'business_name', customer.business_name
            )
          END AS client
        FROM public.projects AS project
        LEFT JOIN public.clients AS customer ON customer.id = project.client_id
        WHERE project.company_id = $1
        ORDER BY project.created_at DESC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function createProjectRepo(userId: string, input: CreateProjectInput) {
  return withUserTransaction(userId, async (client) => {
    const sequenceResult = await client.query<{ project_code: string | null }>(
      `
        SELECT public.next_document_number($1, 'project') AS project_code
      `,
      [input.companyId]
    );

    const projectCode = sequenceResult.rows[0]?.project_code ?? null;

    const result = await client.query(
      `
        INSERT INTO public.projects (
          company_id, client_id, address_id, project_code, name, description, status, budget_estimate, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'lead', $7, app.current_user_id())
        RETURNING *
      `,
      [
        input.companyId,
        input.clientId,
        input.addressId ?? null,
        projectCode,
        input.name,
        input.description || null,
        input.budgetEstimate
      ]
    );
    return result.rows[0] ?? null;
  });
}

export async function getProjectByIdRepo(userId: string, projectId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT
          project.*,
          CASE WHEN customer.id IS NULL THEN NULL ELSE to_jsonb(customer) END AS client,
          CASE WHEN address.id IS NULL THEN NULL ELSE to_jsonb(address) END AS address
        FROM public.projects AS project
        LEFT JOIN public.clients AS customer ON customer.id = project.client_id
        LEFT JOIN public.client_addresses AS address ON address.id = project.address_id
        WHERE project.id = $1 AND project.company_id = $2
        LIMIT 1
      `,
      [projectId, companyId]
    );
    return result.rows[0] ?? null;
  });
}

export async function updateProjectStatusRepo(userId: string, projectId: string, companyId: string, status: string) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        UPDATE public.projects
        SET status = $1, updated_at = now()
        WHERE id = $2 AND company_id = $3
      `,
      [status, projectId, companyId]
    );
  });
}

export async function updateProjectProgressRepo(userId: string, projectId: string, companyId: string, progressPercentage: number) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        UPDATE public.projects
        SET progress_percentage = $1, updated_at = now()
        WHERE id = $2 AND company_id = $3
      `,
      [progressPercentage, projectId, companyId]
    );
  });
}
