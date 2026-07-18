import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(
    /\/+$/,
    ""
  );

if (!API_URL) {
  throw new Error(
    "Falta EXPO_PUBLIC_API_URL en apps/mobile/.env"
  );
}

const SESSION_STORAGE_KEY =
  "contractor-pro.local-session.v1";

export type AppRole =
  | "super_admin"
  | "contractor"
  | "client";

export type AppProfile = {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
  active: boolean;
  province: string | null;
  district: string | null;
  corregimiento: string | null;
  terms_accepted: boolean;
  notifications_opt_in: boolean;
  registration_ip: string | null;
  registration_device: string | null;

  business_name?: string | null;
  id_document?: string | null;
  tax_id?: string | null;
  tax_dv?: string | null;
  primary_category?: string | null;
  specialties?: string[] | null;
  experience_years?: number | null;
  work_areas?: string[] | null;
  professional_description?: string | null;
  company_logo_url?: string | null;
  portfolio_urls?: string[] | null;
  certifications?: string[] | null;
  availability?: string | null;
  preferred_contact_method?: string | null;
  emits_invoice?: boolean;
  has_transport?: boolean;
  work_mode?: string | null;

  doc_id_url?: string | null;
  doc_operation_notice_url?: string | null;
  doc_technical_certs_urls?: string[] | null;
  doc_references_url?: string | null;
  doc_address_proof_url?: string | null;

  created_at: string;
  updated_at: string;
};

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  sessionId: string;
  user: AppProfile;
  requiresApproval: boolean;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  sessionId: string;
  user: AppProfile;
  requiresApproval: boolean;
};

type ApiErrorBody = {
  message?: string;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let refreshPromise:
  | Promise<StoredSession>
  | null = null;

async function readResponse<T>(
  response: Response
): Promise<T> {
  const body = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const errorBody =
      body as ApiErrorBody | null;

    throw new ApiError(
      errorBody?.message ||
        "No fue posible completar la solicitud.",
      response.status
    );
  }

  return body as T;
}

async function publicRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init.headers
      }
    }
  );

  return readResponse<T>(response);
}

function toStoredSession(
  response: AuthResponse
): StoredSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt:
      Date.now() +
      response.expiresIn * 1000,
    sessionId: response.sessionId,
    user: response.user,
    requiresApproval:
      response.requiresApproval
  };
}

export async function storeSession(
  session: StoredSession
): Promise<void> {
  await AsyncStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(session)
  );
}

export async function loadStoredSession():
Promise<StoredSession | null> {
  const stored = await AsyncStorage.getItem(
    SESSION_STORAGE_KEY
  );

  if (!stored) return null;

  try {
    return JSON.parse(stored) as StoredSession;
  } catch {
    await clearStoredSession();
    return null;
  }
}

export async function clearStoredSession():
Promise<void> {
  await AsyncStorage.removeItem(
    SESSION_STORAGE_KEY
  );
}

export async function login(
  email: string,
  password: string
): Promise<StoredSession> {
  const response =
    await publicRequest<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password
        })
      }
    );

  const session = toStoredSession(response);
  await storeSession(session);

  return session;
}

export type RegisterInput = {
  fullName: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  password: string;
  role?: "contractor" | "client";
  province: string;
  district: string;
  corregimiento: string;
  termsAccepted: boolean;
  notificationsOptIn: boolean;
  registrationDevice: string;
};

export async function register(
  input: RegisterInput
): Promise<StoredSession> {
  const response =
    await publicRequest<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(input)
      }
    );

  const session = toStoredSession(response);
  await storeSession(session);

  return session;
}

export async function refreshSession(
  refreshToken?: string
): Promise<StoredSession> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const current =
      await loadStoredSession();

    const token =
      refreshToken ??
      current?.refreshToken;

    if (!token) {
      throw new ApiError(
        "No existe una sesión para renovar.",
        401
      );
    }

    const response =
      await publicRequest<AuthResponse>(
        "/auth/refresh",
        {
          method: "POST",
          body: JSON.stringify({
            refreshToken: token
          })
        }
      );

    const session = toStoredSession(response);
    await storeSession(session);

    return session;
  })();

  try {
    return await refreshPromise;
  } catch (error) {
    await clearStoredSession();
    throw error;
  } finally {
    refreshPromise = null;
  }
}

async function validSession():
Promise<StoredSession> {
  const session = await loadStoredSession();

  if (!session) {
    throw new ApiError(
      "No hay una sesión activa.",
      401
    );
  }

  const refreshBefore =
    session.expiresAt - 30_000;

  if (Date.now() >= refreshBefore) {
    return refreshSession(
      session.refreshToken
    );
  }

  return session;
}

export async function authenticatedRequest<T>(
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<T> {
  const session = await validSession();

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          `Bearer ${session.accessToken}`,
        ...init.headers
      }
    }
  );

  if (
    response.status === 401 &&
    retry
  ) {
    await refreshSession(
      session.refreshToken
    );

    return authenticatedRequest<T>(
      path,
      init,
      false
    );
  }

  return readResponse<T>(response);
}

export async function getCurrentUser():
Promise<{
  user: AppProfile;
  requiresApproval: boolean;
}> {
  return authenticatedRequest(
    "/auth/me"
  );
}

export async function logout():
Promise<void> {
  try {
    await authenticatedRequest(
      "/auth/logout",
      {
        method: "POST"
      }
    );
  } finally {
    await clearStoredSession();
  }
}

export async function updateOwnProfile(
  input: {
    fullName: string;
    phone: string | null;
  }
): Promise<void> {
  await authenticatedRequest(
    "/profile",
    {
      method: "PATCH",
      body: JSON.stringify(input)
    }
  );
}

export async function updateContractorProfile(
  input: Record<string, unknown>
): Promise<void> {
  await authenticatedRequest(
    "/profile/contractor",
    {
      method: "PATCH",
      body: JSON.stringify(input)
    }
  );
}