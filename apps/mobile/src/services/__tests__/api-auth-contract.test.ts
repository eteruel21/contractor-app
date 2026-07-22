import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  register,
  requestPasswordReset,
  resetPasswordApi
} from "../api";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
}));

vi.mock("expo-secure-store", () => ({
  isAvailableAsync: vi.fn(async () => false),
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn()
}));

const fetchMock = vi.fn();

function successfulResponse(body: object = { message: "ok" }): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body
  } as Response;
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(successfulResponse());
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("requestPasswordReset: envía el correo al endpoint de recuperación", async () => {
  await requestPasswordReset("user@example.test");

  expect(fetchMock.mock.calls).toHaveLength(1);
  const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url.endsWith("/auth/recover-password")).toBe(true);
  expect(JSON.parse(requestInit.body as string)).toEqual({
    email: "user@example.test"
  });
});

test("resetPasswordApi: respeta el contrato token y newPassword", async () => {
  await resetPasswordApi("reset-token", "Password123!");

  expect(fetchMock.mock.calls).toHaveLength(1);
  const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url.endsWith("/auth/reset-password")).toBe(true);
  expect(JSON.parse(requestInit.body as string)).toEqual({
    token: "reset-token",
    newPassword: "Password123!"
  });
});

test("register: no presenta como enviado un correo cuya entrega falló", async () => {
  fetchMock.mockResolvedValueOnce(
    successfulResponse({
      requiresEmailConfirmation: true,
      emailDeliverySucceeded: false,
      message: "La cuenta fue creada, pero el correo no pudo enviarse."
    })
  );

  await expect(
    register({
      fullName: "Usuario Prueba",
      firstName: "Usuario",
      lastName: "Prueba",
      email: "user@example.test",
      password: "Password123!",
      province: "Panamá",
      district: "Panamá",
      corregimiento: "Bella Vista",
      termsAccepted: true,
      notificationsOptIn: false,
      registrationDevice: "test"
    })
  ).rejects.toMatchObject({
    status: 503,
    message: "La cuenta fue creada, pero el correo no pudo enviarse."
  });
});
