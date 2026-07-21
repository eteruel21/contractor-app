import { withUserTransaction } from "../db/with-user-transaction.js";

export async function findUserNotificationsRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT *
        FROM public.notifications
        WHERE company_id = $1 AND user_id = app.current_user_id()
        ORDER BY created_at DESC
        LIMIT 50
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function markNotificationAsReadRepo(userId: string, companyId: string, notificationId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        UPDATE public.notifications
        SET read_at = now()
        WHERE id = $1 AND company_id = $2 AND user_id = app.current_user_id()
        RETURNING *
      `,
      [notificationId, companyId]
    );
    return result.rows[0] ?? null;
  });
}

export async function createNotificationRepo(
  userId: string,
  companyId: string,
  targetUserId: string,
  title: string,
  body: string,
  type: string = "info",
  entityType?: string | null,
  entityId?: string | null
) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.notifications (
          company_id, user_id, title, body, type, entity_type, entity_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [companyId, targetUserId, title, body, type, entityType ?? null, entityId ?? null]
    );
    return result.rows[0];
  });
}
