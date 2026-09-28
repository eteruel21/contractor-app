import {
  deletePushTokenRepo,
  findUserPushTokensRepo
} from "./repository.js";
import { safeErrorDetails } from "../security/redaction.js";

export type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

type ExpoPushTicket = {
  status?: unknown;
  details?: {
    error?: unknown;
  };
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_MAX_MESSAGES_PER_REQUEST = 100;

function ticketList(value: unknown): ExpoPushTicket[] | null {
  if (!value || typeof value !== "object") return null;

  const data = (value as { data?: unknown }).data;
  if (Array.isArray(data)) {
    return data as ExpoPushTicket[];
  }

  if (data && typeof data === "object") {
    return [data as ExpoPushTicket];
  }

  return null;
}

function isDeviceNotRegistered(ticket: ExpoPushTicket): boolean {
  return ticket.details?.error === "DeviceNotRegistered";
}

/**
 * Despacha notificaciones push a todos los dispositivos registrados del usuario.
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  let tokenCount = 0;

  try {
    const tokens = await findUserPushTokensRepo(userId);
    if (!tokens || tokens.length === 0) {
      return { sent: 0, failed: 0 };
    }

    tokenCount = tokens.length;

    let sent = 0;
    let failed = 0;
    const tokensToDelete = new Set<string>();

    for (
      let offset = 0;
      offset < tokens.length;
      offset += EXPO_MAX_MESSAGES_PER_REQUEST
    ) {
      const tokenBatch = tokens.slice(
        offset,
        offset + EXPO_MAX_MESSAGES_PER_REQUEST
      );
      const messages = tokenBatch.map((token) => ({
        to: token.expo_push_token,
        sound: "default",
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {}
      }));

      try {
        const response = await fetch(EXPO_PUSH_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(messages)
        });

        if (!response.ok) {
          failed += messages.length;
          continue;
        }

        const tickets = ticketList(await response.json());
        if (!tickets) {
          failed += messages.length;
          continue;
        }

        for (let index = 0; index < messages.length; index += 1) {
          const ticket = tickets[index];

          if (ticket?.status === "ok") {
            sent += 1;
            continue;
          }

          failed += 1;

          if (ticket && isDeviceNotRegistered(ticket)) {
            const token = tokenBatch[index];
            if (token) {
              tokensToDelete.add(token.expo_push_token);
            }
          }
        }
      } catch (error) {
        failed += messages.length;
        console.error(
          "Error al despachar lote de notificaciones push:",
          safeErrorDetails(error)
        );
      }
    }

    if (tokensToDelete.size > 0) {
      const cleanupResults = await Promise.allSettled(
        [...tokensToDelete].map((token) =>
          deletePushTokenRepo(userId, token)
        )
      );

      if (cleanupResults.some((result) => result.status === "rejected")) {
        console.error(
          "No se pudieron limpiar todos los tokens push inválidos."
        );
      }
    }

    return { sent, failed };
  } catch (error) {
    console.error("Error al despachar notificación push:", safeErrorDetails(error));
    return { sent: 0, failed: tokenCount || 1 };
  }
}
