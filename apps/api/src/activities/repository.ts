import { withUserTransaction } from "../db/with-user-transaction.js";
import type { z } from "zod";
import type { createActivitySchema, updateActivitySchema } from "./schemas.js";

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

export async function findCompanyActivitiesRepo(
  userId: string,
  companyId: string,
  filters?: { date?: string | undefined; projectId?: string | undefined; clientId?: string | undefined }
) {
  return withUserTransaction(userId, async (client) => {
    let sql = `
      SELECT
        act.*,
        CASE WHEN cust.id IS NULL THEN NULL ELSE jsonb_build_object('id', cust.id, 'first_name', cust.first_name, 'last_name', cust.last_name, 'business_name', cust.business_name) END AS client,
        CASE WHEN proj.id IS NULL THEN NULL ELSE jsonb_build_object('id', proj.id, 'name', proj.name, 'project_code', proj.project_code) END AS project,
        CASE WHEN u.id IS NULL THEN NULL ELSE jsonb_build_object('id', u.id, 'email', u.email) END AS assigned_user
      FROM public.activities AS act
      LEFT JOIN public.clients AS cust ON cust.id = act.client_id
      LEFT JOIN public.projects AS proj ON proj.id = act.project_id
      LEFT JOIN app_auth.users AS u ON u.id = act.assigned_user_id
      WHERE act.company_id = $1
    `;
    const params: any[] = [companyId];

    if (filters?.date) {
      params.push(filters.date);
      sql += ` AND act.date = $${params.length}`;
    }
    if (filters?.projectId) {
      params.push(filters.projectId);
      sql += ` AND act.project_id = $${params.length}`;
    }
    if (filters?.clientId) {
      params.push(filters.clientId);
      sql += ` AND act.client_id = $${params.length}`;
    }

    sql += ` ORDER BY act.date ASC, act.start_time ASC`;

    const result = await client.query(sql, params);
    return result.rows;
  });
}

export async function getActivityByIdRepo(userId: string, activityId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT
          act.*,
          CASE WHEN cust.id IS NULL THEN NULL ELSE jsonb_build_object('id', cust.id, 'first_name', cust.first_name, 'last_name', cust.last_name, 'business_name', cust.business_name) END AS client,
          CASE WHEN proj.id IS NULL THEN NULL ELSE jsonb_build_object('id', proj.id, 'name', proj.name, 'project_code', proj.project_code) END AS project
        FROM public.activities AS act
        LEFT JOIN public.clients AS cust ON cust.id = act.client_id
        LEFT JOIN public.projects AS proj ON proj.id = act.project_id
        WHERE act.id = $1 AND act.company_id = $2
        LIMIT 1
      `,
      [activityId, companyId]
    );
    return result.rows[0] ?? null;
  });
}

export async function createActivityRepo(userId: string, input: CreateActivityInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.activities (
          company_id, client_id, project_id, assigned_user_id, title, type, status,
          date, start_time, end_time, address, notes, reminder_minutes, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, app.current_user_id())
        RETURNING *
      `,
      [
        input.companyId,
        input.clientId ?? null,
        input.projectId ?? null,
        input.assignedUserId ?? null,
        input.title,
        input.type,
        input.status,
        input.date,
        input.startTime,
        input.endTime ?? null,
        input.address ?? null,
        input.notes ?? null,
        input.reminderMinutes ?? 15
      ]
    );
    return result.rows[0];
  });
}

export async function updateActivityRepo(
  userId: string,
  activityId: string,
  companyId: string,
  input: UpdateActivityInput
) {
  return withUserTransaction(userId, async (client) => {
    const fields: string[] = [];
    const values: any[] = [activityId, companyId];

    const allowedFields: (keyof UpdateActivityInput)[] = [
      "clientId",
      "projectId",
      "assignedUserId",
      "title",
      "type",
      "status",
      "date",
      "startTime",
      "endTime",
      "address",
      "notes",
      "reminderMinutes"
    ];

    const dbColumnMap: Record<string, string> = {
      clientId: "client_id",
      projectId: "project_id",
      assignedUserId: "assigned_user_id",
      title: "title",
      type: "type",
      status: "status",
      date: "date",
      startTime: "start_time",
      endTime: "end_time",
      address: "address",
      notes: "notes",
      reminderMinutes: "reminder_minutes"
    };

    for (const key of allowedFields) {
      if (input[key] !== undefined) {
        values.push(input[key] ?? null);
        fields.push(`${dbColumnMap[key]} = $${values.length}`);
      }
    }

    if (fields.length === 0) {
      return getActivityByIdRepo(userId, activityId, companyId);
    }

    fields.push("updated_at = now()");

    const result = await client.query(
      `
        UPDATE public.activities
        SET ${fields.join(", ")}
        WHERE id = $1 AND company_id = $2
        RETURNING *
      `,
      values
    );
    return result.rows[0] ?? null;
  });
}

export async function deleteActivityRepo(userId: string, activityId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        DELETE FROM public.activities
        WHERE id = $1 AND company_id = $2
        RETURNING id
      `,
      [activityId, companyId]
    );
    return (result.rowCount ?? 0) > 0;
  });
}
