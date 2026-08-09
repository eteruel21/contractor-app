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

export async function upsertPushTokenRepo(
  userId: string,
  expoPushToken: string,
  devicePlatform: string = "unknown"
) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        SELECT private.register_push_token($1, $2)
      `,
      [expoPushToken, devicePlatform]
    );

    return true;
  });
}

export async function deletePushTokenRepo(userId: string, expoPushToken: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        DELETE FROM public.user_push_tokens
        WHERE user_id = app.current_user_id() AND expo_push_token = $1
      `,
      [expoPushToken]
    );
    return (result.rowCount ?? 0) > 0;
  });
}

export async function findUserPushTokensRepo(userId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query<{
      id: string;
      user_id: string;
      expo_push_token: string;
      device_platform: string;
    }>(
      `
        SELECT id, user_id, expo_push_token, device_platform
        FROM public.user_push_tokens
        WHERE user_id = app.current_user_id()
      `
    );
    return result.rows;
  });
}

