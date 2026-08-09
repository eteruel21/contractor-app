import {
  afterEach,
  beforeEach,
  expect,
  test,
  vi
} from "vitest";

import {
  registerForPushNotificationsAsync,
  unregisterCurrentPushTokenAsync,
  unregisterPushTokenAsync
} from "../push-notification-service";

import { storeSession } from "../api";

const storageMap =
  new Map<string, string>();

vi.mock(
  "@react-native-async-storage/async-storage",
  () => ({
    default: {
      getItem: vi.fn(
        async (key: string) =>
          storageMap.get(key) ?? null
      ),
      setItem: vi.fn(
        async (
          key: string,
          value: string
        ) => {
          storageMap.set(key, value);
        }
      ),
      removeItem: vi.fn(
        async (key: string) => {
          storageMap.delete(key);
        }
      )
    }
  })
);

vi.mock("react-native", () => ({
  Platform: { OS: "android" }
}));

vi.mock("expo-secure-store", () => ({
  isAvailableAsync: vi.fn(
    async () => false
  ),
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn()
}));

vi.mock("expo-device", () => ({
  isDevice: true
}));

vi.mock(
  "expo-notifications",
  () => ({
    setNotificationHandler: vi.fn(),
    getPermissionsAsync: vi.fn(
      async () => ({
        status: "granted"
      })
    ),
    requestPermissionsAsync: vi.fn(
      async () => ({
        status: "granted"
      })
    ),
    getExpoPushTokenAsync: vi.fn(
      async () => ({
        data:
          "ExponentPushToken[mock-client-token]"
      })
    ),
    setNotificationChannelAsync:
      vi.fn(async () => {}),
    AndroidImportance: { MAX: 5 }
  })
);

const fetchMock = vi.fn();

function successfulResponse(
  body: object = { success: true }
): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body
  } as Response;
}

beforeEach(async () => {
  storageMap.clear();

  process.env.EXPO_PUBLIC_PROJECT_ID =
    "mock-project-id";

  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    successfulResponse()
  );

  vi.stubGlobal("fetch", fetchMock);

  await storeSession({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresAt:
      Date.now() + 3_600_000,
    sessionId: "mock-session-id",
    user: null,
    requiresApproval: false
  });
});

afterEach(() => {
  delete process.env
    .EXPO_PUBLIC_PROJECT_ID;

  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test(
  "registra el token en el backend",
  async () => {
    const token =
      await registerForPushNotificationsAsync();

    expect(token).toBe(
      "ExponentPushToken[mock-client-token]"
    );

    const [url, request] =
      fetchMock.mock.calls[0] as [
        string,
        RequestInit
      ];

    expect(
      url.endsWith("/push-tokens")
    ).toBe(true);

    expect(request.method).toBe("POST");
  }
);

test(
  "no informa registro exitoso si el backend falla",
  async () => {
    vi.spyOn(
      console,
      "error"
    ).mockImplementation(() => {});

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        message: "Error de prueba."
      })
    } as Response);

    const token =
      await registerForPushNotificationsAsync();

    expect(token).toBeNull();
  }
);

test(
  "elimina explícitamente un token",
  async () => {
    const result =
      await unregisterPushTokenAsync(
        "ExponentPushToken[mock-client-token]"
      );

    expect(result).toBe(true);

    const [url, request] =
      fetchMock.mock.calls[0] as [
        string,
        RequestInit
      ];

    expect(
      url.endsWith("/push-tokens")
    ).toBe(true);

    expect(request.method).toBe(
      "DELETE"
    );
  }
);

test(
  "elimina el token actual al cerrar sesión",
  async () => {
    const result =
      await unregisterCurrentPushTokenAsync();

    expect(result).toBe(true);

    const [url, request] =
      fetchMock.mock.calls[0] as [
        string,
        RequestInit
      ];

    expect(
      url.endsWith("/push-tokens")
    ).toBe(true);

    expect(request.method).toBe(
      "DELETE"
    );
  }
);
