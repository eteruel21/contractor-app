import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { createOnlinePaymentCheckout, getOnlinePaymentCheckoutStatus } from "../invoice-service";
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

vi.mock("expo-secure-store", () => ({
  isAvailableAsync: vi.fn(async () => false),
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn()
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

test("createOnlinePaymentCheckout: genera checkout de Yappy correctamente", async () => {
  const dummyCheckout = {
    checkoutId: "chk-1",
    provider: "yappy",
    amount: 150,
    status: "pending",
    gatewayReference: "YAPPY-123",
    checkoutUrl: "https://pagos.yappy.com.pa/checkout?ref=YAPPY-123"
  };
  fetchMock.mockResolvedValueOnce(successfulResponse({ checkout: dummyCheckout }));

  const res = await createOnlinePaymentCheckout({
    companyId: "comp-1",
    invoiceId: "inv-1",
    provider: "yappy",
    amount: 150
  });

  expect(res.error).toBeNull();
  expect(res.checkout?.provider).toBe("yappy");
  expect(res.checkout?.checkoutUrl).toContain("yappy.com.pa");

  const [url, req] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url.endsWith("/invoices/inv-1/payments/online-checkout")).toBe(true);
  expect(req.method).toBe("POST");
  expect(JSON.parse(req.body as string)).toEqual({
    companyId: "comp-1",
    provider: "yappy",
    amount: 150
  });
});

test("getOnlinePaymentCheckoutStatus: consulta el estado de la transacción digital", async () => {
  const dummyCheckout = {
    checkoutId: "chk-1",
    provider: "paguelofacil",
    amount: 200,
    status: "completed",
    gatewayReference: "PAGUELOFACIL-456",
    checkoutUrl: "https://checkout.paguelofacil.com/pay"
  };
  fetchMock.mockResolvedValueOnce(successfulResponse({ checkout: dummyCheckout }));

  const res = await getOnlinePaymentCheckoutStatus({
    companyId: "comp-1",
    invoiceId: "inv-1",
    checkoutId: "chk-1"
  });

  expect(res.error).toBeNull();
  expect(res.checkout?.status).toBe("completed");
  expect(res.checkout?.provider).toBe("paguelofacil");

  const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url).toContain("/invoices/inv-1/payments/online-status/chk-1");
});
