import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { registerForPushNotificationsAsync, unregisterPushTokenAsync } from "../push-notification-service";
import { storeSession } from "../api";

const storageMap = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storageMap.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storageMap.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      storageMap.delete(key);
    })
  }
}));

vi.mock("react-native", () => ({
  Platform: { OS: "web" }
}));

vi.mock("expo-secure-store", () => ({
  isAvailableAsync: vi.fn(async () => false),
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn()
}));

vi.mock("expo-device", () => ({
  isDevice: true
}));

vi.mock("expo-notifications", () => ({
  setNotificationHandler: vi.fn(),
  getPermissionsAsync: vi.fn(async () => ({ status: "granted" })),
  requestPermissionsAsync: vi.fn(async () => ({ status: "granted" })),
  getExpoPushTokenAsync: vi.fn(async () => ({ data: "ExponentPushToken[mock-client-token]" })),
  setNotificationChannelAsync: vi.fn(async () => {}),
  AndroidImportance: { MAX: 5 }
}));

const fetchMock = vi.fn();

function successfulResponse(body: object = { success: true }): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body
  } as Response;
}

beforeEach(async () => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(successfulResponse());
  vi.stubGlobal("fetch", fetchMock);
  await storeSession({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresAt: Date.now() + 3600000,
    sessionId: "mock-session-id",
    user: null,
    requiresApproval: false
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("registerForPushNotificationsAsync: obtiene permisos y envía el token al backend", async () => {
  const token = await registerForPushNotificationsAsync();

  expect(token).toBe("ExponentPushToken[mock-client-token]");
  expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(1);
  const [url, req] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url.endsWith("/push-tokens")).toBe(true);
  expect(req.method).toBe("POST");
  expect(JSON.parse(req.body as string)).toEqual({
    expoPushToken: "ExponentPushToken[mock-client-token]",
    devicePlatform: "web"
  });
});

test("unregisterPushTokenAsync: elimina el token push del backend al cerrar sesión", async () => {
  const res = await unregisterPushTokenAsync("ExponentPushToken[mock-client-token]");

  expect(res).toBe(true);
  const [url, req] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url.endsWith("/push-tokens")).toBe(true);
  expect(req.method).toBe("DELETE");
  expect(JSON.parse(req.body as string)).toEqual({
    expoPushToken: "ExponentPushToken[mock-client-token]"
  });
});
