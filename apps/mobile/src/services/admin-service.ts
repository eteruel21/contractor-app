import { authenticatedRequest, publicRequest } from "./api";

export type SystemHealthStatus = {
  status: string;
  service: string;
  environment: string;
};

export type BasicProfileUpdateInput = {
  fullName: string;
  phone: string | null;
};

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

/**
 * Consulta el estado de salud y conectividad de la API.
 */
export async function getSystemHealth(): Promise<{
  health: SystemHealthStatus | null;
  error: string | null;
}> {
  try {
    const health = await publicRequest<SystemHealthStatus>("/health");
    return { health, error: null };
  } catch (error) {
    return { health: null, error: errorMessage(error) };
  }
}

/**
 * Actualiza los datos básicos del perfil del usuario (Nombre y Teléfono).
 */
export async function updateBasicUserProfile(
  input: BasicProfileUpdateInput
): Promise<{ success: boolean; error: string | null }> {
  try {
    await authenticatedRequest("/profile", {
      method: "PATCH",
      body: JSON.stringify({
        fullName: input.fullName.trim(),
        phone: input.phone?.trim() || null
      })
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export * from "./users-service";

