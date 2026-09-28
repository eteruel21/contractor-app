import { afterEach, describe, expect, it, vi } from "vitest";
import { sendPushNotificationToUser } from "../push-service.js";
import * as repository from "../repository.js";

describe("Push Notifications Service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

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

  });

  it("retorna cero despachos si el usuario no tiene tokens push registrados", async () => {
    vi.spyOn(repository, "findUserPushTokensRepo").mockResolvedValueOnce([]);

    const result = await sendPushNotificationToUser("usr-456", {
      title: "Factura Generada",
      body: "Se ha emitido la factura #FAC-2026-01"
    });

    expect(result.sent).toBe(0);
    expect(result.failed).toBe(0);
  });

  it("interpreta cada ticket de Expo y elimina DeviceNotRegistered", async () => {
    vi.spyOn(repository, "findUserPushTokensRepo").mockResolvedValueOnce([
      {
        id: "token-1",
        user_id: "usr-123",
        expo_push_token: "ExponentPushToken[active-token]",
        device_platform: "android"
      },
      {
        id: "token-2",
        user_id: "usr-123",
        expo_push_token: "ExponentPushToken[expired-token]",
        device_platform: "ios"
      }
    ]);
    const deleteSpy = vi
      .spyOn(repository, "deletePushTokenRepo")
      .mockResolvedValueOnce(true);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { status: "ok", id: "ticket-1" },
          {
            status: "error",
            message: "Device is not registered",
            details: { error: "DeviceNotRegistered" }
          }
        ]
      })
    }));

    const result = await sendPushNotificationToUser("usr-123", {
      title: "Factura emitida",
      body: "Se emitió la factura FAC-104."
    });

    expect(result).toEqual({ sent: 1, failed: 1 });
    expect(deleteSpy).toHaveBeenCalledWith(
      "usr-123",
      "ExponentPushToken[expired-token]"
    );
  });

  it("marca como fallidos los mensajes sin ticket válido aunque Expo responda 200", async () => {
    vi.spyOn(repository, "findUserPushTokensRepo").mockResolvedValueOnce([
      {
        id: "token-1",
        user_id: "usr-123",
        expo_push_token: "ExponentPushToken[mock-token]",
        device_platform: "android"
      }
    ]);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] })
    }));

    await expect(sendPushNotificationToUser("usr-123", {
      title: "Pago registrado",
      body: "Se registró un pago."
    })).resolves.toEqual({ sent: 0, failed: 1 });
  });

  it("no propaga fallos de red y contabiliza todo el lote como fallido", async () => {
    vi.spyOn(repository, "findUserPushTokensRepo").mockResolvedValueOnce([
      {
        id: "token-1",
        user_id: "usr-123",
        expo_push_token: "ExponentPushToken[first-token]",
        device_platform: "android"
      },
      {
        id: "token-2",
        user_id: "usr-123",
        expo_push_token: "ExponentPushToken[second-token]",
        device_platform: "ios"
      }
    ]);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("network down")));

    await expect(sendPushNotificationToUser("usr-123", {
      title: "Presupuesto aprobado",
      body: "El cliente aprobó el presupuesto."
    })).resolves.toEqual({ sent: 0, failed: 2 });
  });
});
