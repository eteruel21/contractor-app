import { findUserPushTokensRepo } from "./repository.js";
import { safeErrorDetails } from "../security/redaction.js";

export type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

/**
 * Despacha notificaciones push a todos los dispositivos registrados del usuario.
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  try {
    const tokens = await findUserPushTokensRepo(userId);
    if (!tokens || tokens.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const messages = tokens.map((t) => ({
      to: t.expo_push_token,
      sound: "default",
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {}
    }));

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messages)
    });

    if (!response.ok) {
      return { sent: 0, failed: messages.length };
    }

    return { sent: messages.length, failed: 0 };
  } catch (error) {
    console.error("Error al despachar notificación push:", safeErrorDetails(error));
    return { sent: 0, failed: 1 };
  }
}
