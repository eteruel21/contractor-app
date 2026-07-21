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
  invoiceParamsSchema,
  companyQuerySchema,
  budgetQuerySchema,
  createInvoiceSchema,
  invoiceStatusSchema
} from "./schemas.js";

import {
  getInvoicesService,
  getInvoiceByBudgetService,
  getInvoiceByIdService,
  createInvoiceService,
  updateInvoiceStatusService
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

export async function registerInvoiceRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/invoices",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const query = companyQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const invoices = await getInvoicesService(userId, query.data.companyId);
      return { invoices };
    }
  );

  app.get(
    "/invoices/by-budget",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const query = budgetQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          message: "El presupuesto no es válido."
        });
      }

      const invoice = await getInvoiceByBudgetService(userId, query.data.companyId, query.data.budgetId);
      return { invoice };
    }
  );

  app.get(
    "/invoices/:invoiceId",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = invoiceParamsSchema.safeParse(request.params);
      const query = companyQuerySchema.safeParse(request.query);

      if (!params.success || !query.success) {
        return reply.status(400).send({
          message: "La factura no es válida."
        });
      }

      const invoice = await getInvoiceByIdService(userId, params.data.invoiceId, query.data.companyId);

      if (!invoice) {
        return reply.status(404).send({
          message: "No se encontró la factura."
        });
      }

      return { invoice };
    }
  );

  app.post(
    "/invoices",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const body = createInvoiceSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          message: "Los datos de la factura no son válidos."
        });
      }

      const invoice = await createInvoiceService(userId, body.data);

      if (!invoice) {
        return reply.status(500).send({
          message: "No se pudo crear la factura."
        });
      }

      return reply.status(201).send({ invoice });
    }
  );

  app.patch(
    "/invoices/:invoiceId/status",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = invoiceParamsSchema.safeParse(request.params);
      const body = invoiceStatusSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "El estado de la factura no es válido."
        });
      }

      await updateInvoiceStatusService(userId, params.data.invoiceId, body.data.companyId, body.data.status);
      return { success: true };
    }
  );
}