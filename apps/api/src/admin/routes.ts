import type { FastifyInstance } from "fastify";
import { requireSuperAdmin } from "./authorize.js";
import { userParamsSchema, userSchema } from "./schemas.js";
import { getAdminDashboardService, updateAdminUserService } from "./services.js";

export async function registerAdminRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/admin/dashboard",
    {
      preHandler: requireSuperAdmin
    },
    async (request) => {
      const userId = request.authenticatedUser!.id;
      return getAdminDashboardService(userId);
    }
  );

  app.patch(
    "/admin/users/:userId",
    {
      preHandler: requireSuperAdmin
    },
    async (request, reply) => {
      const userId = request.authenticatedUser!.id;
      const params = userParamsSchema.safeParse(request.params);
      const body = userSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los datos del usuario no son válidos."
        });
      }

      const updated = await updateAdminUserService(userId, params.data.userId, body.data);

      if (!updated) {
        return reply.status(404).send({
          message: "No se encontró el usuario."
        });
      }

      return { success: true };
    }
  );
}