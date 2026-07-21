import { withUserTransaction } from "../../db/with-user-transaction.js";
import type { z } from "zod";
import type { createTaskSchema, updateTaskSchema } from "./schemas.js";

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export async function findProjectTasksRepo(userId: string, companyId: string, projectId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT
          t.*,
          CASE WHEN u.id IS NULL THEN NULL ELSE jsonb_build_object('id', u.id, 'email', u.email) END AS assigned_user
        FROM public.project_tasks AS t
        LEFT JOIN app_auth.users AS u ON u.id = t.assigned_user_id
        WHERE t.company_id = $1 AND t.project_id = $2
        ORDER BY t.created_at DESC
      `,
      [companyId, projectId]
    );
    return result.rows;
  });
}

export async function createTaskRepo(userId: string, companyId: string, projectId: string, input: CreateTaskInput) {
  return withUserTransaction(userId, async (client) => {
    const completedAt = input.status === "completed" ? new Date().toISOString() : null;
    const result = await client.query(
      `
        INSERT INTO public.project_tasks (
          company_id, project_id, assigned_user_id, title, description, status, priority, due_date, completed_at, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, app.current_user_id())
        RETURNING *
      `,
      [
        companyId,
        projectId,
        input.assignedUserId ?? null,
        input.title,
        input.description ?? null,
        input.status,
        input.priority,
        input.dueDate ?? null,
        completedAt
      ]
    );
    return result.rows[0];
  });
}

export async function updateTaskRepo(
  userId: string,
  companyId: string,
  projectId: string,
  taskId: string,
  input: UpdateTaskInput
) {
  return withUserTransaction(userId, async (client) => {
    const fields: string[] = [];
    const values: any[] = [taskId, companyId, projectId];

    if (input.title !== undefined) {
      values.push(input.title);
      fields.push(`title = $${values.length}`);
    }
    if (input.description !== undefined) {
      values.push(input.description ?? null);
      fields.push(`description = $${values.length}`);
    }
    if (input.assignedUserId !== undefined) {
      values.push(input.assignedUserId ?? null);
      fields.push(`assigned_user_id = $${values.length}`);
    }
    if (input.status !== undefined) {
      values.push(input.status);
      fields.push(`status = $${values.length}`);
      if (input.status === "completed") {
        fields.push(`completed_at = now()`);
      } else {
        fields.push(`completed_at = NULL`);
      }
    }
    if (input.priority !== undefined) {
      values.push(input.priority);
      fields.push(`priority = $${values.length}`);
    }
    if (input.dueDate !== undefined) {
      values.push(input.dueDate ?? null);
      fields.push(`due_date = $${values.length}`);
    }

    if (fields.length === 0) {
      const existing = await client.query(
        `SELECT * FROM public.project_tasks WHERE id = $1 AND company_id = $2 AND project_id = $3`,
        [taskId, companyId, projectId]
      );
      return existing.rows[0] ?? null;
    }

    fields.push(`updated_at = now()`);

    const result = await client.query(
      `
        UPDATE public.project_tasks
        SET ${fields.join(", ")}
        WHERE id = $1 AND company_id = $2 AND project_id = $3
        RETURNING *
      `,
      values
    );
    return result.rows[0] ?? null;
  });
}

export async function deleteTaskRepo(userId: string, companyId: string, projectId: string, taskId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        DELETE FROM public.project_tasks
        WHERE id = $1 AND company_id = $2 AND project_id = $3
        RETURNING id
      `,
      [taskId, companyId, projectId]
    );
    return (result.rowCount ?? 0) > 0;
  });
}
