const API_URL =
  import.meta.env.VITE_API_URL
    ?.replace(/\/+$/, "");

if (!API_URL) {
  throw new Error(
    "Falta VITE_API_URL en apps/admin-web/.env"
  );
}

const SESSION_KEY =
  "contractor-pro.admin-session.v1";

export type AdminUser = {
  id: string;
  email: string;
  role:
    | "super_admin"
    | "contractor"
    | "client";
  active: boolean;
};

export type AdminSession = {
  accessToken: string;
  expiresAt: number;
  sessionId: string;
  user: AdminUser;
};

type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  sessionId: string;
  user: AdminUser;
};

type ErrorResponse = {
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
  | Promise<AdminSession>
  | null = null;

async function readResponse<T>(
  response: Response
): Promise<T> {
  const body = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const errorBody =
      body as ErrorResponse | null;

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
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/json",
        ...init.headers
      }
    }
  );

  return readResponse<T>(response);
}

function saveSession(
  session: AdminSession
): void {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );
}

function readStoredSession():
AdminSession | null {
  const value =
    localStorage.getItem(
      SESSION_KEY
    );

  if (!value) return null;

  try {
    return JSON.parse(
      value
    ) as AdminSession;
  } catch {
    clearSession();
    return null;
  }
}

function clearSession(): void {
  localStorage.removeItem(
    SESSION_KEY
  );
}

function toSession(
  response: AuthResponse
): AdminSession {
  return {
    accessToken:
      response.accessToken,
    expiresAt:
      Date.now() +
      response.expiresIn * 1000,
    sessionId:
      response.sessionId,
    user:
      response.user
  };
}

async function refreshSession():
Promise<AdminSession> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const current =
      readStoredSession();

    if (!current) {
      throw new ApiError(
        "No existe una sesión activa.",
        401
      );
    }

    const response =
      await publicRequest<AuthResponse>(
        "/auth/refresh",
        {
          method: "POST",
          body: JSON.stringify({
            clientType: "web"
          })
        }
      );

    const session =
      toSession(response);

    saveSession(session);

    return session;
  })();

  try {
    return await refreshPromise;
  } catch (error) {
    clearSession();
    throw error;
  } finally {
    refreshPromise = null;
  }
}

async function validSession():
Promise<AdminSession> {
  const session =
    readStoredSession();

  if (!session) {
    throw new ApiError(
      "No hay una sesión activa.",
      401
    );
  }

  if (
    Date.now() >=
    session.expiresAt - 30000
  ) {
    return refreshSession();
  }

  return session;
}

export async function authenticatedRequest<T>(
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<T> {
  const session =
    await validSession();

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/json",
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
    await refreshSession();

    return authenticatedRequest<T>(
      path,
      init,
      false
    );
  }

  return readResponse<T>(response);
}

function ensureSuperAdmin(
  session: AdminSession
): AdminSession {
  if (
    !session.user.active ||
    session.user.role !==
      "super_admin"
  ) {
    clearSession();

    throw new ApiError(
      "Esta cuenta no es superadministradora.",
      403
    );
  }

  return session;
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<AdminSession> {
  const response =
    await publicRequest<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email:
            email.trim().toLowerCase(),
          password,
          clientType: "web"
        })
      }
    );

  const session =
    ensureSuperAdmin(
      toSession(response)
    );

  saveSession(session);

  return session;
}

export async function restoreAdminSession():
Promise<AdminSession | null> {
  const stored =
    readStoredSession();

  if (!stored) return null;

  const current =
    await authenticatedRequest<{
      user: AdminUser;
    }>("/auth/me");

  const refreshed =
    readStoredSession() ??
    stored;

  const session =
    ensureSuperAdmin({
      ...refreshed,
      user: current.user
    });

  saveSession(session);

  return session;
}

export async function logoutAdmin():
Promise<void> {
  try {
    await authenticatedRequest(
      "/auth/logout",
      {
        method: "POST"
      }
    );
  } finally {
    clearSession();
  }
}