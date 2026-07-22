import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";

import {
  authenticateRequest,
  requireActiveUser,
  requireCompanyRole
} from "../auth/authenticate.js";

import {
  companyParamsSchema,
  createCompanySchema,
  billingSchema,
  companyMemberParamsSchema,
  companyInvitationParamsSchema,
  createInvitationSchema,
  acceptInvitationSchema,
  updateMemberStatusSchema,
  updateMemberRoleSchema,
  auditLogQuerySchema
} from "./schemas.js";

import {
  getUserCompanyMembershipsService,
  createCompanyService,
  updateCompanyBillingService,
  createCompanyInvitationService,
  getCompanyInvitationsService,
  acceptCompanyInvitationService,
  revokeCompanyInvitationService,
  getCompanyMembersService,
  updateCompanyMemberStatusService,
  updateCompanyMemberRoleService,
  deleteCompanyMemberService,
  getAdminAuditLogsService
} from "./services.js";

function authenticatedUserId(
  request: FastifyRequest,
  reply: FastifyReply
): string | null {
  const userId = request.authenticatedUser?.id;

  if (!userId) {
    reply.status(401).send({
      message: "Se requiere autenticación."
    });
    return null;
  }

  return userId;
}

export async function registerCompanyRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/companies",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const memberships = await getUserCompanyMembershipsService(userId);
      return { memberships };
    }
  );

  app.post(
    "/companies",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = createCompanySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de la empresa no son válidos.",
          fields: parsedBody.error.flatten().fieldErrors
        });
      }

      const companyId = await createCompanyService(userId, parsedBody.data);

      if (!companyId) {
        return reply.status(500).send({
          message: "No se pudo crear la empresa."
        });
      }

      return reply.status(201).send({ companyId });
    }
  );

  app.patch(
    "/companies/:companyId/billing",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyParamsSchema.safeParse(request.params);
      const parsedBody = billingSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de facturación no son válidos."
        });
      }

      const company = await updateCompanyBillingService(userId, parsedParams.data.companyId, parsedBody.data);

      if (!company) {
        return reply.status(404).send({
          message: "No se encontró la empresa o no tienes permiso para editarla."
        });
      }

      return { success: true };
    }
  );

  // --- Invitaciones de equipo (T-110) ---

  app.post(
    "/companies/:companyId/invitations",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyParamsSchema.safeParse(request.params);
      const parsedBody = createInvitationSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de la invitación no son válidos.",
          fields: parsedBody.error?.flatten().fieldErrors
        });
      }

      const invitation = await createCompanyInvitationService(
        userId,
        parsedParams.data.companyId,
        parsedBody.data.email,
        parsedBody.data.role
      );

      if (!invitation) {
        return reply.status(403).send({
          message: "No se pudo crear la invitación con los permisos indicados."
        });
      }

      return reply.status(201).send({ invitation });
    }
  );

  app.get(
    "/companies/:companyId/invitations",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "ID de empresa no válido." });
      }

      const invitations = await getCompanyInvitationsService(userId, parsedParams.data.companyId);
      return { invitations };
    }
  );

  app.post(
    "/companies/invitations/accept",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = acceptInvitationSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({ message: "El token de invitación no es válido." });
      }

      const result = await acceptCompanyInvitationService(userId, parsedBody.data.token);
      if (!result.success) {
        return reply.status(400).send({ message: result.error });
      }

      return reply.send(result);
    }
  );

  app.delete(
    "/companies/:companyId/invitations/:invitationId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyInvitationParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros no válidos." });
      }

      const revoked = await revokeCompanyInvitationService(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.invitationId
      );

      if (!revoked) {
        return reply.status(404).send({ message: "No se encontró una invitación pendiente para revocar." });
      }

      return { success: true };
    }
  );

  // --- Administración de Miembros y Roles (T-111 & T-112) ---

  app.get(
    "/companies/:companyId/members",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "sales", "supervisor", "member"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "ID de empresa no válido." });
      }

      const members = await getCompanyMembersService(userId, parsedParams.data.companyId);
      return { members };
    }
  );

  app.patch(
    "/companies/:companyId/members/:memberId/status",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyMemberParamsSchema.safeParse(request.params);
      const parsedBody = updateMemberStatusSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({ message: "Datos no válidos." });
      }

      const result = await updateCompanyMemberStatusService(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.memberId,
        parsedBody.data.active
      );

      if (!result.success) {
        return reply.status(400).send({ message: result.error });
      }

      return { success: true, member: result.member };
    }
  );

  app.patch(
    "/companies/:companyId/members/:memberId/role",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyMemberParamsSchema.safeParse(request.params);
      const parsedBody = updateMemberRoleSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({ message: "Datos de rol no válidos." });
      }

      const result = await updateCompanyMemberRoleService(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.memberId,
        parsedBody.data.role
      );

      if (!result.success) {
        return reply.status(400).send({ message: result.error });
      }

      return { success: true, member: result.member };
    }
  );

  app.delete(
    "/companies/:companyId/members/:memberId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyMemberParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "ID no válido." });
      }

      const result = await deleteCompanyMemberService(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.memberId
      );

      if (!result.success) {
        return reply.status(400).send({ message: result.error });
      }

      return { success: true };
    }
  );

  // --- Auditoría de Acciones Administrativas (T-114) ---

  app.get(
    "/companies/:companyId/audit-logs",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyParamsSchema.safeParse(request.params);
      const parsedQuery = auditLogQuerySchema.safeParse(request.query);

      if (!parsedParams.success || !parsedQuery.success) {
        return reply.status(400).send({ message: "Parámetros de consulta no válidos." });
      }

      const result = await getAdminAuditLogsService(
        userId,
        parsedParams.data.companyId,
        parsedQuery.data.page,
        parsedQuery.data.limit,
        parsedQuery.data.action
      );

      return result;
    }
  );
}
