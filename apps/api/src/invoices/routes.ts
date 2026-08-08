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
  budgetQuerySchema,
  cancelInvoiceCreditNoteSchema,
  cancelInvoiceSchema,
  companyQuerySchema,
  createInvoiceCreditNoteSchema,
  createInvoicePaymentSchema,
  createInvoiceSchema,
  createOnlineCheckoutSchema,
  invoiceActionSchema,
  invoiceCreditNoteParamsSchema,
  invoiceParamsSchema,
  invoicePaymentParamsSchema,
  invoiceStatusSchema,
  onlineStatusParamsSchema,
  reverseInvoicePaymentSchema
} from "./schemas.js";

import {
  createOnlineCheckoutSessionService,
  getOnlineCheckoutStatusService,
  processPaymentWebhookService
} from "./payment-gateway-service.js";

import {
  cancelInvoiceCreditNoteService,
  cancelInvoiceService,
  createInvoiceService,
  getInvoiceByBudgetService,
  getInvoiceByIdService,
  getInvoiceCreditNotesService,
  getInvoiceHistoryService,
  getInvoicePaymentsService,
  getInvoicesService,
  issueInvoiceCreditNoteService,
  issueInvoiceService,
  recordInvoicePaymentService,
  reverseInvoicePaymentService,
  transitionInvoiceStatusService
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

  app.get(
    "/invoices/:invoiceId/history",
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

      const history = await getInvoiceHistoryService(
        userId,
        params.data.invoiceId,
        query.data.companyId
      );

      return { history };
    }
  );

  app.patch(
    "/invoices/:invoiceId/status",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
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

      const invoice = await transitionInvoiceStatusService(
        userId,
        params.data.invoiceId,
        body.data
      );

      if (!invoice) {
        return reply.status(404).send({
          message: "No se encontró la factura."
        });
      }

      return { invoice };
    }
  );

  app.post(
    "/invoices/:invoiceId/issue",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = invoiceParamsSchema.safeParse(request.params);
      const body = invoiceActionSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los datos de emisión no son válidos."
        });
      }

      const invoice = await issueInvoiceService(
        userId,
        params.data.invoiceId,
        body.data.companyId
      );

      if (!invoice) {
        return reply.status(404).send({
          message: "No se encontró la factura."
        });
      }

      return { invoice };
    }
  );

  app.post(
    "/invoices/:invoiceId/cancel",
    {
      preHandler: [
        authenticateRequest,
        requireActiveUser,
        requireCompanyRole(["owner", "admin"])
      ]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = invoiceParamsSchema.safeParse(request.params);
      const body = cancelInvoiceSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los datos de cancelación no son válidos."
        });
      }

      const invoice = await cancelInvoiceService(
        userId,
        params.data.invoiceId,
        body.data
      );

      if (!invoice) {
        return reply.status(404).send({
          message: "No se encontró la factura."
        });
      }

      return { invoice };
    }
  );

  app.get(
    "/invoices/:invoiceId/credit-notes",
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

      const creditNotes = await getInvoiceCreditNotesService(
        userId,
        params.data.invoiceId,
        query.data.companyId
      );

      return { creditNotes };
    }
  );

  app.post(
    "/invoices/:invoiceId/credit-notes",
    {
      preHandler: [
        authenticateRequest,
        requireActiveUser,
        requireCompanyRole(["owner", "admin"])
      ]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = invoiceParamsSchema.safeParse(request.params);
      const body = createInvoiceCreditNoteSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los datos de la nota de crédito no son válidos."
        });
      }

      const result = await issueInvoiceCreditNoteService(
        userId,
        params.data.invoiceId,
        body.data
      );

      if (!result?.creditNote || !result.invoice) {
        return reply.status(500).send({
          message: "No se pudo emitir la nota de crédito."
        });
      }

      return reply.status(201).send(result);
    }
  );

  app.post(
    "/invoices/:invoiceId/credit-notes/:creditNoteId/cancel",
    {
      preHandler: [
        authenticateRequest,
        requireActiveUser,
        requireCompanyRole(["owner", "admin"])
      ]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = invoiceCreditNoteParamsSchema.safeParse(request.params);
      const body = cancelInvoiceCreditNoteSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los datos de cancelación no son válidos."
        });
      }

      const result = await cancelInvoiceCreditNoteService(
        userId,
        params.data.invoiceId,
        params.data.creditNoteId,
        body.data
      );

      if (!result?.creditNote || !result.invoice) {
        return reply.status(404).send({
          message: "No se encontró la nota de crédito."
        });
      }

      return result;
    }
  );

  app.get(
    "/invoices/:invoiceId/payments",
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

      const payments = await getInvoicePaymentsService(
        userId,
        params.data.invoiceId,
        query.data.companyId
      );

      return { payments };
    }
  );

  app.post(
    "/invoices/:invoiceId/payments",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = invoiceParamsSchema.safeParse(request.params);
      const body = createInvoicePaymentSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los datos del pago no son válidos."
        });
      }

      const result = await recordInvoicePaymentService(
        userId,
        params.data.invoiceId,
        body.data
      );

      if (!result?.payment || !result.invoice) {
        return reply.status(500).send({
          message: "No se pudo registrar el pago."
        });
      }

      return reply.status(201).send(result);
    }
  );

  app.post(
    "/invoices/:invoiceId/payments/:paymentId/reverse",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = invoicePaymentParamsSchema.safeParse(request.params);
      const body = reverseInvoicePaymentSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los datos de reversión no son válidos."
        });
      }

      const result = await reverseInvoicePaymentService(
        userId,
        params.data.invoiceId,
        params.data.paymentId,
        body.data
      );

      if (!result?.payment || !result.invoice) {
        return reply.status(404).send({
          message: "No se encontró el pago."
        });
      }

      return result;
    }
  );

  // --- Cobros Digitales (Yappy / PagueloFacil) ---

  app.post(
    "/invoices/:invoiceId/payments/online-checkout",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = invoiceParamsSchema.safeParse(request.params);
      const body = createOnlineCheckoutSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los datos de la sesión de cobro digital no son válidos."
        });
      }

      try {
        const checkout = await createOnlineCheckoutSessionService(
          userId,
          body.data.companyId,
          params.data.invoiceId,
          body.data.provider,
          body.data.amount
        );

        if (!checkout) {
          return reply.status(404).send({ message: "No se encontró la factura." });
        }

        return reply.status(201).send({ checkout });
      } catch (error) {
        return reply.status(400).send({
          message: error instanceof Error ? error.message : "Error al iniciar el cobro digital."
        });
      }
    }
  );

  app.get(
    "/invoices/:invoiceId/payments/online-status/:checkoutId",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = onlineStatusParamsSchema.safeParse(request.params);
      const query = companyQuerySchema.safeParse(request.query);

      if (!params.success || !query.success) {
        return reply.status(400).send({ message: "Parámetros no válidos." });
      }

      const checkout = await getOnlineCheckoutStatusService(
        userId,
        query.data.companyId,
        params.data.invoiceId,
        params.data.checkoutId
      );

      if (!checkout) {
        return reply.status(404).send({ message: "Sesión de cobro no encontrada." });
      }

      return { checkout };
    }
  );

  // Webhook público para confirmaciones automáticas de Yappy / PagueloFacil
  app.post(
    "/payments/webhooks/:provider",
    async (request, reply) => {
      const providerParam = (request.params as { provider?: string })?.provider;
      if (providerParam !== "yappy" && providerParam !== "paguelofacil") {
        return reply.status(400).send({ message: "Proveedor no soportado." });
      }

      const body = request.body as { reference?: string; status?: "completed" | "failed"; transactionId?: string };
      if (!body?.reference || !body?.status) {
        return reply.status(400).send({ message: "Payload de webhook no válido." });
      }

      const result = await processPaymentWebhookService(providerParam, {
        reference: body.reference,
        status: body.status,
        ...(body.transactionId ? { transactionId: body.transactionId } : {})
      });

      if (!result.success) {
        return reply.status(400).send(result);
      }

      return reply.send(result);
    }
  );
}

