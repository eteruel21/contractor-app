import { authenticatedRequest } from "./api";
import type {
  AuditLogEntry,
  CompanyInvitation,
  CompanyMember,
  CompanyRole,
  InvitableCompanyRole
} from "../types/company";

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

/**
 * Obtener la lista de miembros pertenecientes a una empresa.
 */
export async function listCompanyMembers(
  companyId: string
): Promise<{ members: CompanyMember[]; error: string | null }> {
  try {
    const response = await authenticatedRequest<{ members: CompanyMember[] }>(
      `/companies/${companyId}/members`
    );
    return { members: response.members, error: null };
  } catch (error) {
    return { members: [], error: errorMessage(error) };
  }
}

/**
 * Actualizar el estado activo/inactivo de un miembro de la empresa.
 */
export async function updateCompanyMemberStatus(
  companyId: string,
  memberId: string,
  active: boolean
): Promise<{ member: CompanyMember | null; error: string | null }> {
  try {
    const response = await authenticatedRequest<{
      success: boolean;
      member: CompanyMember;
    }>(`/companies/${companyId}/members/${memberId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ active })
    });
    return { member: response.member, error: null };
  } catch (error) {
    return { member: null, error: errorMessage(error) };
  }
}

/**
 * Actualizar el rol asignado a un miembro dentro de la empresa.
 */
export async function updateCompanyMemberRole(
  companyId: string,
  memberId: string,
  role: CompanyRole
): Promise<{ member: CompanyMember | null; error: string | null }> {
  try {
    const response = await authenticatedRequest<{
      success: boolean;
      member: CompanyMember;
    }>(`/companies/${companyId}/members/${memberId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role })
    });
    return { member: response.member, error: null };
  } catch (error) {
    return { member: null, error: errorMessage(error) };
  }
}

/**
 * Revocar o eliminar la membresía de un usuario dentro de la empresa.
 */
export async function deleteCompanyMember(
  companyId: string,
  memberId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    await authenticatedRequest<{ success: boolean }>(
      `/companies/${companyId}/members/${memberId}`,
      { method: "DELETE" }
    );
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

/**
 * Crear una nueva invitación por correo electrónico para sumarse a la empresa.
 */
export async function createCompanyInvitation(
  companyId: string,
  email: string,
  role: InvitableCompanyRole
): Promise<{ invitation: CompanyInvitation | null; error: string | null }> {
  try {
    const response = await authenticatedRequest<{
      invitation: CompanyInvitation;
    }>(`/companies/${companyId}/invitations`, {
      method: "POST",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        role
      })
    });
    return { invitation: response.invitation, error: null };
  } catch (error) {
    return { invitation: null, error: errorMessage(error) };
  }
}

/**
 * Obtener la lista de invitaciones pendientes registradas para una empresa.
 */
export async function listCompanyInvitations(
  companyId: string
): Promise<{ invitations: CompanyInvitation[]; error: string | null }> {
  try {
    const response = await authenticatedRequest<{
      invitations: CompanyInvitation[];
    }>(`/companies/${companyId}/invitations`);
    return { invitations: response.invitations, error: null };
  } catch (error) {
    return { invitations: [], error: errorMessage(error) };
  }
}

/**
 * Aceptar una invitación a una empresa utilizando el token seguro recibido.
 */
export async function acceptCompanyInvitation(
  token: string
): Promise<{ success: boolean; companyId: string | null; error: string | null }> {
  try {
    const response = await authenticatedRequest<{
      success: boolean;
      companyId?: string;
    }>("/companies/invitations/accept", {
      method: "POST",
      body: JSON.stringify({ token: token.trim() })
    });
    return {
      success: true,
      companyId: response.companyId ?? null,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      companyId: null,
      error: errorMessage(error)
    };
  }
}

/**
 * Revocar una invitación enviada antes de que sea aceptada.
 */
export async function revokeCompanyInvitation(
  companyId: string,
  invitationId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    await authenticatedRequest<{ success: boolean }>(
      `/companies/${companyId}/invitations/${invitationId}`,
      { method: "DELETE" }
    );
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

/**
 * Consultar el historial de auditoría de acciones administrativas de la empresa.
 */
export async function getCompanyAuditLogs(
  companyId: string,
  page = 1,
  limit = 20,
  action?: string
): Promise<{
  logs: AuditLogEntry[];
  total: number;
  error: string | null;
}> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });
    if (action) params.append("action", action.trim());

    const response = await authenticatedRequest<{
      logs: AuditLogEntry[];
      total: number;
    }>(`/companies/${companyId}/audit-logs?${params.toString()}`);
    return { logs: response.logs, total: response.total, error: null };
  } catch (error) {
    return { logs: [], total: 0, error: errorMessage(error) };
  }
}

