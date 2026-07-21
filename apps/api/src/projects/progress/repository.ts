import { withUserTransaction } from "../../db/with-user-transaction.js";

export async function findProjectProgressHistoryRepo(userId: string, companyId: string, projectId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT
          h.*,
          CASE WHEN u.id IS NULL THEN NULL ELSE jsonb_build_object('id', u.id, 'email', u.email) END AS created_by_user
        FROM public.project_progress_history AS h
        LEFT JOIN app_auth.users AS u ON u.id = h.created_by
        WHERE h.company_id = $1 AND h.project_id = $2
        ORDER BY h.created_at DESC
      `,
      [companyId, projectId]
    );
    return result.rows;
  });
}

export async function recordProjectProgressHistoryRepo(
  userId: string,
  companyId: string,
  projectId: string,
  progressPercentage: number,
  notes?: string | null
) {
  return withUserTransaction(userId, async (client) => {
    // 1. Get current project progress
    const projectRes = await client.query(
      `SELECT progress_percentage FROM public.projects WHERE id = $1 AND company_id = $2`,
      [projectId, companyId]
    );
    const currentProgress = projectRes.rows[0]?.progress_percentage ?? 0;

    // 2. Update project progress
    await client.query(
      `UPDATE public.projects SET progress_percentage = $1, updated_at = now() WHERE id = $2 AND company_id = $3`,
      [progressPercentage, projectId, companyId]
    );

    // 3. Insert history record
    const historyRes = await client.query(
      `
        INSERT INTO public.project_progress_history (
          company_id, project_id, progress_percentage, previous_percentage, notes, created_by
        )
        VALUES ($1, $2, $3, $4, $5, app.current_user_id())
        RETURNING *
      `,
      [companyId, projectId, progressPercentage, currentProgress, notes ?? null]
    );

    return historyRes.rows[0];
  });
}
