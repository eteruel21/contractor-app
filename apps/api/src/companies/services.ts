import randomUUID from "node:crypto";

import {
  findUserCompanyMembershipsRepo,
  createCompanyRepo,
  updateCompanyBillingRepo,
  createCompanyInvitationRepo,
  findCompanyInvitationsRepo,
  findInvitationByTokenRepo,
  acceptCompanyInvitationRepo,
  revokeCompanyInvitationRepo,
  findCompanyMembersRepo,
  findCompanyMemberByIdRepo,
  countActiveCompanyOwnersRepo,
  updateCompanyMemberStatusRepo,
  updateCompanyMemberRoleRepo,
  deleteCompanyMemberRepo,
  insertAdminAuditLogRepo,
  findAdminAuditLogsRepo,
  type CreateCompanyInput,
  type BillingInput
} from "./repository.js";

export async function getUserCompanyMembershipsService(userId: string) {
  return findUserCompanyMembershipsRepo(userId);
}

export async function createCompanyService(userId: string, input: CreateCompanyInput) {
  const companyId = await createCompanyRepo(userId, input);
  if (companyId) {
    await insertAdminAuditLogRepo(userId, companyId, "COMPANY_CREATED", "company", companyId, {
      name: input.name
    });
  }
  return companyId;
}

export async function updateCompanyBillingService(userId: string, companyId: string, input: BillingInput) {
  const company = await updateCompanyBillingRepo(userId, companyId, input);
  if (company) {
    await insertAdminAuditLogRepo(userId, companyId, "BILLING_UPDATED", "company", companyId, {
      invoicePrefix: input.invoicePrefix,
      taxRate: input.taxRate
    });
  }
  return company;
}

// --- Invitaciones ---

export async function createCompanyInvitationService(
  userId: string,
  companyId: string,
  email: string,
  role: string
) {
  const token = randomUUID.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

  const invitation = await createCompanyInvitationRepo(userId, companyId, email, role, token, expiresAt);
  if (invitation) {
    await insertAdminAuditLogRepo(userId, companyId, "INVITATION_CREATED", "company_invitation", invitation.id, {
      email,
      role
    });
  }
  return invitation;
}

export async function getCompanyInvitationsService(userId: string, companyId: string) {
  return findCompanyInvitationsRepo(userId, companyId);
}

export async function acceptCompanyInvitationService(userId: string, token: string) {
  const invitation = await findInvitationByTokenRepo(userId, token);
  if (!invitation || invitation.status !== "pending" || new Date(invitation.expires_at) < new Date()) {
    return { success: false, error: "La invitación no es válida o ha expirado." };
  }

  const acceptedInvitation = await acceptCompanyInvitationRepo(userId, token);
  if (!acceptedInvitation) {
    return { success: false, error: "No se pudo procesar la invitación." };
  }

  await insertAdminAuditLogRepo(userId, acceptedInvitation.company_id, "INVITATION_ACCEPTED", "company_invitation", acceptedInvitation.id, {
    email: acceptedInvitation.email,
    role: acceptedInvitation.role
  });

  return { success: true, companyId: acceptedInvitation.company_id };
}

export async function revokeCompanyInvitationService(userId: string, companyId: string, invitationId: string) {
  const revoked = await revokeCompanyInvitationRepo(userId, companyId, invitationId);
  if (revoked) {
    await insertAdminAuditLogRepo(userId, companyId, "INVITATION_REVOKED", "company_invitation", invitationId, {
      email: revoked.email
    });
  }
  return revoked;
}

// --- Miembros & Roles ---

export async function getCompanyMembersService(userId: string, companyId: string) {
  return findCompanyMembersRepo(userId, companyId);
}

export async function updateCompanyMemberStatusService(
  userId: string,
  companyId: string,
  memberId: string,
  active: boolean
) {
  const member = await findCompanyMemberByIdRepo(userId, companyId, memberId);
  if (!member) {
    return { success: false, error: "El miembro no fue encontrado." };
  }

  if (member.user_id === userId && !active) {
    return { success: false, error: "No puedes desactivar tu propia membresía." };
  }

  if (!active && member.role === "owner") {
    const ownerCount = await countActiveCompanyOwnersRepo(userId, companyId);
    if (ownerCount <= 1) {
      return { success: false, error: "No se puede desactivar al único propietario activo de la empresa." };
    }
  }

  const updated = await updateCompanyMemberStatusRepo(userId, companyId, memberId, active);
  if (updated) {
    await insertAdminAuditLogRepo(userId, companyId, active ? "MEMBER_ACTIVATED" : "MEMBER_DEACTIVATED", "company_member", memberId, {
      targetUserId: member.user_id,
      email: member.email
    });
  }

  return { success: true, member: updated };
}

export async function updateCompanyMemberRoleService(
  userId: string,
  companyId: string,
  memberId: string,
  newRole: string
) {
  const members = await findCompanyMembersRepo(userId, companyId);
  const callerMember = members.find((m) => m.user_id === userId);
  const targetMember = members.find((m) => m.id === memberId);

  if (!targetMember) {
    return { success: false, error: "El miembro especificado no existe en la empresa." };
  }

  const callerRole = callerMember?.role ?? "member";

  if (callerRole !== "owner") {
    if (targetMember.role === "owner" || newRole === "owner") {
      return { success: false, error: "Solo un propietario ('owner') puede asignar o modificar el rol de propietario." };
    }
  }

  if (targetMember.role === "owner" && newRole !== "owner") {
    const ownerCount = await countActiveCompanyOwnersRepo(userId, companyId);
    if (ownerCount <= 1) {
      return { success: false, error: "La empresa debe mantener al menos un propietario activo." };
    }
  }

  const updated = await updateCompanyMemberRoleRepo(userId, companyId, memberId, newRole);
  if (updated) {
    await insertAdminAuditLogRepo(userId, companyId, "MEMBER_ROLE_UPDATED", "company_member", memberId, {
      targetUserId: targetMember.user_id,
      oldRole: targetMember.role,
      newRole
    });
  }

  return { success: true, member: updated };
}

export async function deleteCompanyMemberService(userId: string, companyId: string, memberId: string) {
  const member = await findCompanyMemberByIdRepo(userId, companyId, memberId);
  if (!member) {
    return { success: false, error: "El miembro no fue encontrado." };
  }

  if (member.user_id === userId) {
    return { success: false, error: "No puedes eliminarte a ti mismo de la empresa." };
  }

  if (member.role === "owner") {
    const ownerCount = await countActiveCompanyOwnersRepo(userId, companyId);
    if (ownerCount <= 1) {
      return { success: false, error: "No se puede eliminar al único propietario de la empresa." };
    }
  }

  const deleted = await deleteCompanyMemberRepo(userId, companyId, memberId);
  if (deleted) {
    await insertAdminAuditLogRepo(userId, companyId, "MEMBER_REMOVED", "company_member", memberId, {
      targetUserId: member.user_id,
      email: member.email
    });
  }

  return { success: true, member: deleted };
}

// --- Auditoría ---

export async function getAdminAuditLogsService(
  userId: string,
  companyId: string,
  page: number,
  limit: number,
  action?: string
) {
  return findAdminAuditLogsRepo(userId, companyId, page, limit, action);
}
