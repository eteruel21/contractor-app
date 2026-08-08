import { describe, expect, it, vi } from "vitest";
import { sendPushNotificationToUser } from "../push-service.js";
import * as repository from "../repository.js";

describe("Push Notifications Service", () => {
  it("despacha notificaciones push usando la Expo Push API cuando existen tokens", async () => {
    vi.spyOn(repository, "findUserPushTokensRepo").mockResolvedValueOnce([
      {
        id: "token-1",
        user_id: "usr-123",
        expo_push_token: "ExponentPushToken[mock-token-abc]",
        device_platform: "android"
      }
    ]);

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ status: "ok" }] })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendPushNotificationToUser("usr-123", {
      title: "Presupuesto Aprobado",
      body: "Tu presupuesto #104 fue aprobado por el cliente.",
      data: { budgetId: "budget-104" }
    });

    expect(result.sent).toBe(1);
    expect(result.failed).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://exp.host/--/api/v2/push/send");
    const payload = JSON.parse(init.body as string);
    expect(payload[0].to).toBe("ExponentPushToken[mock-token-abc]");
    expect(payload[0].title).toBe("Presupuesto Aprobado");

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("retorna cero despachos si el usuario no tiene tokens push registrados", async () => {
    vi.spyOn(repository, "findUserPushTokensRepo").mockResolvedValueOnce([]);

    const result = await sendPushNotificationToUser("usr-456", {
      title: "Factura Generada",
      body: "Se ha emitido la factura #FAC-2026-01"
    });

    expect(result.sent).toBe(0);
    expect(result.failed).toBe(0);

    vi.restoreAllMocks();
  });
});
