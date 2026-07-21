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
  companyQuerySchema,
  clientParamsSchema,
  clientDetailsSchema,
  addressParamsSchema,
  clientFieldsSchema,
  createClientSchema,
  deactivateClientSchema,
  addressSchema,
  addressActionSchema,
  contactParamsSchema,
  createContactSchema,
  updateContactSchema,
  validateClientName
} from "./schemas.js";

import {
  getContractorCompaniesService,
  getCompanyClientsService,
  createClientService,
  getClientDetailsService,
  updateClientService,
  deactivateClientService,
  addClientAddressService,
  updateClientAddressService,
  setPrimaryClientAddressService,
  deleteClientAddressService,
  getClientContactsService,
  createClientContactService,
  updateClientContactService,
  deleteClientContactService
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

export async function registerClientRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/clients/contractor-companies",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const companies = await getContractorCompaniesService(userId);
      return { companies };
    }
  );

  app.get(
    "/clients",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "sales", "supervisor", "member"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedQuery = companyQuerySchema.safeParse(request.query);
      if (!parsedQuery.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const clients = await getCompanyClientsService(userId, parsedQuery.data.companyId);
      return { clients };
    }
  );

  app.post(
    "/clients",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = createClientSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos del cliente no son válidos.",
          fields: parsedBody.error.flatten().fieldErrors
        });
      }

      const input = parsedBody.data;
      const nameError = validateClientName(input);
      if (nameError) {
        return reply.status(400).send({ message: nameError });
      }

      const createdClient = await createClientService(userId, input);

      if (!createdClient) {
        return reply.status(500).send({
          message: "No se pudo crear el cliente."
        });
      }

      return reply.status(201).send({ client: createdClient });
    }
  );

  app.get(
    "/clients/:clientId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "sales", "supervisor", "member"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = clientDetailsSchema.safeParse(request.params);
      const parsedQuery = companyQuerySchema.safeParse(request.query);

      if (!parsedParams.success || !parsedQuery.success) {
        return reply.status(400).send({
          message: "El cliente o la empresa no son válidos."
        });
      }

      const customer = await getClientDetailsService(userId, parsedQuery.data.companyId, parsedParams.data.clientId);

      if (!customer) {
        return reply.status(404).send({
          message: "No se encontró el cliente."
        });
      }

      return { client: customer };
    }
  );

  app.patch(
    "/clients/:clientId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = clientParamsSchema.safeParse(request.params);
      const parsedBody = clientFieldsSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos del cliente no son válidos."
        });
      }

      const input = parsedBody.data;
      const nameError = validateClientName(input);
      if (nameError) {
        return reply.status(400).send({ message: nameError });
      }

      const customer = await updateClientService(userId, parsedParams.data.clientId, input);

      if (!customer) {
        return reply.status(404).send({
          message: "No se encontró el cliente."
        });
      }

      return { client: customer };
    }
  );

  app.patch(
    "/clients/:clientId/deactivate",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = clientParamsSchema.safeParse(request.params);
      const parsedBody = deactivateClientSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "El cliente no es válido."
        });
      }

      await deactivateClientService(userId, parsedParams.data.clientId, parsedBody.data.companyId);
      return { success: true };
    }
  );

  app.post(
    "/clients/:clientId/addresses",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = clientParamsSchema.safeParse(request.params);
      const parsedBody = addressSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de la dirección no son válidos."
        });
      }

      const address = await addClientAddressService(userId, parsedParams.data.clientId, parsedBody.data);
      return reply.status(201).send({ address });
    }
  );

  app.patch(
    "/clients/:clientId/addresses/:addressId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = addressParamsSchema.safeParse(request.params);
      const parsedBody = addressSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de la dirección no son válidos."
        });
      }

      const address = await updateClientAddressService(
        userId,
        parsedParams.data.clientId,
        parsedParams.data.addressId,
        parsedBody.data
      );

      if (!address) {
        return reply.status(404).send({
          message: "No se encontró la dirección."
        });
      }

      return { address };
    }
  );

  app.post(
    "/clients/:clientId/addresses/:addressId/primary",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = addressParamsSchema.safeParse(request.params);
      const parsedBody = addressActionSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "La dirección no es válida."
        });
      }

      await setPrimaryClientAddressService(
        userId,
        parsedBody.data.companyId,
        parsedParams.data.clientId,
        parsedParams.data.addressId
      );

      return { success: true };
    }
  );

  app.delete(
    "/clients/:clientId/addresses/:addressId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = addressParamsSchema.safeParse(request.params);
      const parsedBody = addressActionSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "La dirección no es válida."
        });
      }

      const deleted = await deleteClientAddressService(
        userId,
        parsedBody.data.companyId,
        parsedParams.data.clientId,
        parsedParams.data.addressId
      );

      if (!deleted) {
        return reply.status(404).send({
          message: "No se encontró la dirección."
        });
      }

      return { success: true };
    }
  );

  // --- Contactos de cliente (T-113) ---

  app.get(
    "/clients/:clientId/contacts",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "sales", "supervisor", "member"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = clientParamsSchema.safeParse(request.params);
      const parsedQuery = companyQuerySchema.safeParse(request.query);

      if (!parsedParams.success || !parsedQuery.success) {
        return reply.status(400).send({ message: "Parámetros no válidos." });
      }

      const contacts = await getClientContactsService(
        userId,
        parsedQuery.data.companyId,
        parsedParams.data.clientId
      );

      return { contacts };
    }
  );

  app.post(
    "/clients/:clientId/contacts",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = clientParamsSchema.safeParse(request.params);
      const parsedBody = createContactSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos del contacto no son válidos.",
          fields: parsedBody.error?.flatten().fieldErrors
        });
      }

      const contact = await createClientContactService(
        userId,
        parsedParams.data.clientId,
        parsedBody.data
      );

      return reply.status(201).send({ contact });
    }
  );

  app.patch(
    "/clients/:clientId/contacts/:contactId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = contactParamsSchema.safeParse(request.params);
      const parsedBody = updateContactSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({ message: "Los datos del contacto no son válidos." });
      }

      const contact = await updateClientContactService(
        userId,
        parsedParams.data.clientId,
        parsedParams.data.contactId,
        parsedBody.data
      );

      if (!contact) {
        return reply.status(404).send({ message: "No se encontró el contacto." });
      }

      return { contact };
    }
  );

  app.delete(
    "/clients/:clientId/contacts/:contactId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = contactParamsSchema.safeParse(request.params);
      const parsedQuery = companyQuerySchema.safeParse(request.query);

      if (!parsedParams.success || !parsedQuery.success) {
        return reply.status(400).send({ message: "Parámetros no válidos." });
      }

      const deleted = await deleteClientContactService(
        userId,
        parsedQuery.data.companyId,
        parsedParams.data.clientId,
        parsedParams.data.contactId
      );

      if (!deleted) {
        return reply.status(404).send({ message: "No se encontró el contacto." });
      }

      return { success: true };
    }
  );
}