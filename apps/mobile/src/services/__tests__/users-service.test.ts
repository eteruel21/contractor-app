import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  acceptCompanyInvitation,
  createCompanyInvitation,
  deleteCompanyMember,
  getCompanyAuditLogs,
  listCompanyInvitations,
  listCompanyMembers,
  revokeCompanyInvitation,
  updateCompanyMemberRole,
  updateCompanyMemberStatus
} from "../users-service";
import { getSystemHealth, updateBasicUserProfile } from "../admin-service";

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

import { storeSession } from "../api";

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
    accessToken: "mock-access-token-123",
    refreshToken: "mock-refresh-token-123",
    expiresAt: Date.now() + 3600000,
    sessionId: "mock-session-123",
    user: null,
    requiresApproval: false
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("listCompanyMembers: obtiene miembros de empresa correctamente", async () => {
  const dummyMembers = [
    {
      id: "mem-1",
      company_id: "comp-1",
      user_id: "usr-1",
      role: "admin",
      active: true,
      full_name: "Juan Pérez",
      email: "juan@example.test",
      avatar_url: null,
      joined_at: "2026-01-01T00:00:00Z"
    }
  ];
  fetchMock.mockResolvedValueOnce(successfulResponse({ members: dummyMembers }));

  const res = await listCompanyMembers("comp-1");

  expect(res.error).toBeNull();
  expect(res.members).toEqual(dummyMembers);
  const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url.endsWith("/companies/comp-1/members")).toBe(true);
});

test("updateCompanyMemberRole: envía el nuevo rol en PATCH", async () => {
  const updatedMember = {
    id: "mem-1",
    company_id: "comp-1",
    user_id: "usr-1",
    role: "supervisor",
    active: true,
    full_name: "Juan Pérez",
    email: "juan@example.test",
    avatar_url: null,
    joined_at: "2026-01-01T00:00:00Z"
  };
  fetchMock.mockResolvedValueOnce(
    successfulResponse({ success: true, member: updatedMember })
  );

  const res = await updateCompanyMemberRole("comp-1", "mem-1", "supervisor");

  expect(res.error).toBeNull();
  expect(res.member?.role).toBe("supervisor");
  const [url, req] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url.endsWith("/companies/comp-1/members/mem-1/role")).toBe(true);
  expect(req.method).toBe("PATCH");
  expect(JSON.parse(req.body as string)).toEqual({ role: "supervisor" });
});

test("createCompanyInvitation: crea invitaciones correctamente", async () => {
  const dummyInvitation = {
    id: "inv-1",
    company_id: "comp-1",
    email: "nuevo@example.test",
    role: "estimator",
    status: "pending",
    token: "token123",
    expires_at: "2026-12-31T23:59:59Z",
    created_by: "usr-1",
    created_at: "2026-01-01T00:00:00Z"
  };
  fetchMock.mockResolvedValueOnce(
    successfulResponse({ invitation: dummyInvitation })
  );

  const res = await createCompanyInvitation(
    "comp-1",
    "Nuevo@Example.Test ",
    "estimator"
  );

  expect(res.error).toBeNull();
  expect(res.invitation?.email).toBe("nuevo@example.test");
  const [, req] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(JSON.parse(req.body as string)).toEqual({
    email: "nuevo@example.test",
    role: "estimator"
  });
});

test("acceptCompanyInvitation: procesa el token de invitación", async () => {
  fetchMock.mockResolvedValueOnce(
    successfulResponse({ success: true, companyId: "comp-123" })
  );

  const res = await acceptCompanyInvitation("  valid-token-string  ");

  expect(res.error).toBeNull();
  expect(res.success).toBe(true);
  expect(res.companyId).toBe("comp-123");
});

test("getSystemHealth: verifica el estado operativo de la API", async () => {
  fetchMock.mockResolvedValueOnce(
    successfulResponse({
      status: "ok",
      service: "contractor-api",
      environment: "test"
    })
  );

  const res = await getSystemHealth();

  expect(res.error).toBeNull();
  expect(res.health?.status).toBe("ok");
});

test("updateBasicUserProfile: envía campos fullName y phone al endpoint /profile", async () => {
  const res = await updateBasicUserProfile({
    fullName: "Carlos Gomez",
    phone: "6600-1122"
  });

  expect(res.error).toBeNull();
  expect(res.success).toBe(true);
  const [url, req] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url.endsWith("/profile")).toBe(true);
  expect(req.method).toBe("PATCH");
  expect(JSON.parse(req.body as string)).toEqual({
    fullName: "Carlos Gomez",
    phone: "6600-1122"
  });
});
