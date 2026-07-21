import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { withUserTransaction } from "../db/with-user-transaction.js";
import { authenticateRequest } from "./authenticate.js";
import {
  createAccessToken,
  createRefreshToken,
  generateSecureToken,
  hashSecureToken,
  hashRefreshToken
} from "./tokens.js";
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  recoverPasswordSchema,
  resetPasswordSchema,
  revokeSessionSchema
} from "./schemas.js";
import {
  findUserByEmail,
  insertUser,
  insertIdentity,
  insertToken,
  getUserStatus,
  loadOwnProfile,
  createSession,
  updateUserSignIn,
  findSessionByRefreshTokenHash,
  updateSessionRotation,
  revokeSession,
  findTokenByHash,
  markTokenUsed,
  confirmEmail,
  updateUserPassword,
  revokeAllUserSessions
} from "./repository.js";
import {
  verifyCaptcha,
  requestUserAgent,
  hashPassword,
  comparePassword
} from "./services.js";

function getCookieOptions() {
  return {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  };
}

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/auth/register",
    {
      config: {
        rateLimit: {
          max: env.NODE_ENV === "production" ? 5 : 100,
          timeWindow: "1 hour"
        }
      }
    },
    async (request, reply) => {
      const parsedBody = registerSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos del registro no son válidos.",
          fields: parsedBody.error.flatten().fieldErrors
        });
      }

      const input = parsedBody.data;

      // CAPTCHA check
      const isCaptchaValid = await verifyCaptcha(input.captchaToken || "mock-captcha-token", request.ip);
      if (!isCaptchaValid) {
        return reply.status(400).send({
          message: "Protección contra robots inválida. Inténtalo de nuevo."
        });
      }

      const passwordHash = await hashPassword(input.password);
      const metadata = {
        full_name: input.fullName,
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        role: input.role,
        province: input.province,
        district: input.district,
        corregimiento: input.corregimiento,
        terms_accepted: input.termsAccepted,
        notifications_opt_in: input.notificationsOptIn,
        registration_ip: request.ip,
        registration_device: input.registrationDevice
      };

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const userId = await insertUser(client, input.email, passwordHash, metadata);
        await insertIdentity(client, userId, input.email);

        const { token: verificationToken, hash: verificationTokenHash } = generateSecureToken();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await insertToken(client, userId, "email_verification", verificationTokenHash, tokenExpiresAt);

        if (env.NODE_ENV !== "production") {
          console.log(`[EMAIL SIMULATOR] Verification token for ${input.email}: ${verificationToken}`);
        }

        await client.query("COMMIT");

        return reply.status(201).send({
          requiresEmailConfirmation: true,
          message: "Registro completado con éxito. Por favor, verifica tu correo electrónico para activar tu cuenta."
        });
      } catch (error) {
        await client.query("ROLLBACK");
        const databaseError = error as { code?: string };
        if (databaseError.code === "23505") {
          return reply.status(409).send({
            message: "Ya existe una cuenta con ese correo."
          });
        }
        request.log.error(error);
        return reply.status(500).send({
          message: "No se pudo completar el registro."
        });
      } finally {
        client.release();
      }
    }
  );

  app.post(
    "/auth/login",
    {
      config: {
        rateLimit: {
          max: env.NODE_ENV === "production" ? 5 : 100,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const parsedBody = loginSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Correo o contraseña inválidos."
        });
      }

      const { email, password, clientType } = parsedBody.data;
      const user = await findUserByEmail(email);

      const passwordMatches = user?.password_hash
        ? await comparePassword(password, user.password_hash)
        : false;

      if (!user || !passwordMatches || user.deleted_at) {
        return reply.status(401).send({
          message: "Correo o contraseña incorrectos."
        });
      }

      if (!user.email_confirmed_at) {
        return reply.status(401).send({
          message: "Por favor verifica tu correo electrónico para activar tu cuenta."
        });
      }

      try {
        return await withUserTransaction(user.id, async (client) => {
          const profile = await loadOwnProfile(client);
          if (!profile) {
            return reply.status(404).send({
              message: "No se encontró el perfil."
            });
          }

          const tokens = await createSession(
            client,
            user.id,
            request.ip,
            requestUserAgent(request)
          );

          await updateUserSignIn(client, user.id);

          const status = getUserStatus(profile);
          if (clientType === "web") {
            const { refreshToken, ...restTokens } = tokens;
            reply.setCookie("refreshToken", refreshToken, getCookieOptions());
            return {
              ...restTokens,
              user: {
                ...profile,
                status
              },
              requiresApproval: status !== "active"
            };
          }

          return {
            ...tokens,
            user: {
              ...profile,
              status
            },
            requiresApproval: status !== "active"
          };
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          message: "No se pudo iniciar sesión."
        });
      }
    }
  );

  app.post(
    "/auth/refresh",
    {
      config: {
        rateLimit: {
          max: env.NODE_ENV === "production" ? 10 : 100,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const parsedBody = refreshSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "El token de renovación no es válido."
        });
      }

      const { refreshToken, clientType } = parsedBody.data;
      let tokenValue = refreshToken;
      const isWeb = clientType === "web" || !!request.cookies.refreshToken;

      if (!tokenValue && isWeb) {
        tokenValue = request.cookies.refreshToken;
      }

      if (!tokenValue) {
        return reply.status(401).send({
          message: "La sesión expiró o fue cerrada."
        });
      }

      const refreshTokenHash = hashRefreshToken(tokenValue);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const session = await findSessionByRefreshTokenHash(client, refreshTokenHash);
        if (!session) {
          await client.query("ROLLBACK");
          return reply.status(401).send({
            message: "La sesión expiró o fue cerrada."
          });
        }

        await client.query(
          `SELECT set_config('app.user_id', $1, true)`,
          [session.user_id]
        );

        const profile = await loadOwnProfile(client);
        if (!profile) {
          await client.query("ROLLBACK");
          return reply.status(401).send({
            message: "La cuenta ya no está disponible."
          });
        }

        const newRefreshToken = createRefreshToken();
        const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
        const newExpiration = new Date(
          Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
        );

        await updateSessionRotation(
          client,
          session.session_id,
          newRefreshTokenHash,
          newExpiration,
          request.ip,
          requestUserAgent(request)
        );

        const accessToken = await createAccessToken(session.user_id, session.session_id);

        await client.query("COMMIT");

        const status = getUserStatus(profile);
        if (isWeb) {
          reply.setCookie("refreshToken", newRefreshToken, getCookieOptions());
          return {
            accessToken,
            expiresIn: env.ACCESS_TOKEN_MINUTES * 60,
            sessionId: session.session_id,
            user: {
              ...profile,
              status
            },
            requiresApproval: status !== "active"
          };
        }

        return {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn: env.ACCESS_TOKEN_MINUTES * 60,
          sessionId: session.session_id,
          user: {
            ...profile,
            status
          },
          requiresApproval: status !== "active"
        };
      } catch (error) {
        await client.query("ROLLBACK");
        request.log.error(error);
        return reply.status(500).send({
          message: "No se pudo renovar la sesión."
        });
      } finally {
        client.release();
      }
    }
  );

  app.post(
    "/auth/logout",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const authenticatedUser = request.authenticatedUser;
      if (!authenticatedUser) {
        return reply.status(401).send({
          message: "Se requiere autenticación."
        });
      }

      await revokeSession(authenticatedUser.sessionId, authenticatedUser.id);

      reply.clearCookie("refreshToken", {
        path: "/",
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax"
      });

      return {
        success: true
      };
    }
  );

  app.get(
    "/auth/me",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId = request.authenticatedUser?.id;
      if (!userId) {
        return reply.status(401).send({
          message: "Se requiere autenticación."
        });
      }

      try {
        const profile = await withUserTransaction(userId, loadOwnProfile);
        if (!profile) {
          return reply.status(404).send({
            message: "No se encontró el perfil."
          });
        }

        const status = getUserStatus(profile);
        return {
          user: {
            ...profile,
            status
          },
          requiresApproval: status !== "active"
        };
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          message: "No se pudo cargar el perfil."
        });
      }
    }
  );

  app.post(
    "/auth/verify-email",
    {
      config: {
        rateLimit: {
          max: env.NODE_ENV === "production" ? 10 : 100,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const parsedBody = verifyEmailSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({ message: "Token inválido." });
      }

      const { token } = parsedBody.data;
      const hashedToken = hashSecureToken(token);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const tokenRecord = await findTokenByHash(client, hashedToken, "email_verification");
        if (!tokenRecord || tokenRecord.used_at || new Date(tokenRecord.expires_at) <= new Date()) {
          await client.query("ROLLBACK");
          return reply.status(400).send({
            message: "El enlace de verificación es inválido o ha expirado."
          });
        }

        await markTokenUsed(client, hashedToken);
        await confirmEmail(client, tokenRecord.user_id);

        await client.query("COMMIT");
        return { success: true, message: "Correo verificado con éxito." };
      } catch (error) {
        await client.query("ROLLBACK");
        request.log.error(error);
        return reply.status(500).send({ message: "No se pudo verificar el correo." });
      } finally {
        client.release();
      }
    }
  );

  app.post(
    "/auth/resend-verification",
    {
      config: {
        rateLimit: {
          max: env.NODE_ENV === "production" ? 3 : 100,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const parsedBody = resendVerificationSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({ message: "Correo inválido." });
      }

      const { email } = parsedBody.data;
      const user = await findUserByEmail(email);
      if (!user) {
        return { success: true, message: "Si el correo está registrado, recibirás un nuevo enlace de verificación." };
      }

      if (user.email_confirmed_at) {
        return reply.status(400).send({ message: "Esta cuenta ya está verificada." });
      }

      // Check frequency: limit resend rate
      const recentResult = await pool.query<{ id: string }>(
        `
          SELECT id
          FROM app_auth.tokens
          WHERE user_id = $1
            AND token_type = 'email_verification'
            AND created_at > now() - interval '60 seconds'
          LIMIT 1
        `,
        [user.id]
      );

      if (recentResult.rows[0]) {
        return reply.status(429).send({
          message: "Debes esperar 60 segundos antes de volver a solicitar un enlace de verificación."
        });
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        await client.query(
          `
            UPDATE app_auth.tokens
            SET used_at = now()
            WHERE user_id = $1
              AND token_type = 'email_verification'
              AND used_at IS NULL
          `,
          [user.id]
        );

        const { token: verificationToken, hash: verificationTokenHash } = generateSecureToken();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await insertToken(client, user.id, "email_verification", verificationTokenHash, tokenExpiresAt);

        if (env.NODE_ENV !== "production") {
          console.log(`[EMAIL SIMULATOR] Resent verification token for ${email}: ${verificationToken}`);
        }

        await client.query("COMMIT");
        return { success: true, message: "Si el correo está registrado, recibirás un nuevo enlace de verificación." };
      } catch (error) {
        await client.query("ROLLBACK");
        request.log.error(error);
        return reply.status(500).send({ message: "No se pudo reenviar la verificación." });
      } finally {
        client.release();
      }
    }
  );

  app.post(
    "/auth/recover-password",
    {
      config: {
        rateLimit: {
          max: env.NODE_ENV === "production" ? 3 : 100,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const parsedBody = recoverPasswordSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({ message: "Correo inválido." });
      }

      const { email } = parsedBody.data;
      const user = await findUserByEmail(email);
      if (!user) {
        return { success: true, message: "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña." };
      }

      // Check recovery frequency: limit rate (60 seconds)
      const recentResult = await pool.query<{ id: string }>(
        `
          SELECT id
          FROM app_auth.tokens
          WHERE user_id = $1
            AND token_type = 'password_reset'
            AND created_at > now() - interval '60 seconds'
          LIMIT 1
        `,
        [user.id]
      );

      if (recentResult.rows[0]) {
        return reply.status(429).send({
          message: "Debes esperar 60 segundos antes de volver a solicitar la recuperación."
        });
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        await client.query(
          `
            UPDATE app_auth.tokens
            SET used_at = now()
            WHERE user_id = $1
              AND token_type = 'password_reset'
              AND used_at IS NULL
          `,
          [user.id]
        );

        const { token: resetToken, hash: resetTokenHash } = generateSecureToken();
        const tokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        await insertToken(client, user.id, "password_reset", resetTokenHash, tokenExpiresAt);

        if (env.NODE_ENV !== "production") {
          console.log(`[EMAIL SIMULATOR] Password reset token for ${email}: ${resetToken}`);
        }

        await client.query("COMMIT");
        return { success: true, message: "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña." };
      } catch (error) {
        await client.query("ROLLBACK");
        request.log.error(error);
        return reply.status(500).send({ message: "No se pudo iniciar la recuperación." });
      } finally {
        client.release();
      }
    }
  );

  app.post(
    "/auth/reset-password",
    {
      config: {
        rateLimit: {
          max: env.NODE_ENV === "production" ? 5 : 100,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const parsedBody = resetPasswordSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({ message: "Datos no válidos." });
      }

      const { token, newPassword } = parsedBody.data;
      const hashedToken = hashSecureToken(token);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const tokenRecord = await findTokenByHash(client, hashedToken, "password_reset");
        if (!tokenRecord || tokenRecord.used_at || new Date(tokenRecord.expires_at) <= new Date()) {
          await client.query("ROLLBACK");
          return reply.status(400).send({
            message: "El enlace de restablecimiento es inválido o ha expirado."
          });
        }

        const passwordHash = await hashPassword(newPassword);

        await markTokenUsed(client, hashedToken);
        await updateUserPassword(client, tokenRecord.user_id, passwordHash);
        await revokeAllUserSessions(client, tokenRecord.user_id);

        await client.query("COMMIT");
        return { success: true, message: "Tu contraseña ha sido restablecida e iniciada una nueva sesión en todos tus dispositivos." };
      } catch (error) {
        await client.query("ROLLBACK");
        request.log.error(error);
        return reply.status(500).send({ message: "No se pudo restablecer la contraseña." });
      } finally {
        client.release();
      }
    }
  );

  app.get(
    "/auth/sessions",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const authenticatedUser = request.authenticatedUser;
      if (!authenticatedUser) {
        return reply.status(401).send({ message: "Se requiere autenticación." });
      }

      try {
        const result = await pool.query<{
          id: string;
          user_agent: string | null;
          ip_address: string | null;
          last_used_at: Date | null;
          created_at: Date;
          expires_at: Date;
        }>(
          `
            SELECT id, user_agent, ip_address, last_used_at, created_at, expires_at
            FROM app_auth.sessions
            WHERE user_id = $1
              AND revoked_at IS NULL
              AND expires_at > now()
            ORDER BY last_used_at DESC NULLS LAST, created_at DESC
          `,
          [authenticatedUser.id]
        );

        const sessions = result.rows.map((row) => ({
          id: row.id,
          userAgent: row.user_agent,
          ipAddress: row.ip_address,
          lastUsedAt: row.last_used_at,
          createdAt: row.created_at,
          expiresAt: row.expires_at,
          isCurrent: row.id === authenticatedUser.sessionId
        }));

        return { sessions };
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ message: "No se pudieron obtener las sesiones." });
      }
    }
  );

  app.post(
    "/auth/sessions/revoke",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const authenticatedUser = request.authenticatedUser;
      if (!authenticatedUser) {
        return reply.status(401).send({ message: "Se requiere autenticación." });
      }

      const parsedBody = revokeSessionSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({ message: "Identificador de sesión no válido." });
      }

      const { sessionId } = parsedBody.data;

      try {
        const result = await pool.query(
          `
            UPDATE app_auth.sessions
            SET revoked_at = now()
            WHERE id = $1
              AND user_id = $2
              AND revoked_at IS NULL
            RETURNING id
          `,
          [sessionId, authenticatedUser.id]
        );

        if (result.rowCount === 0) {
          return reply.status(404).send({ message: "Sesión no encontrada o ya cerrada." });
        }

        return { success: true, message: "Sesión cerrada correctamente." };
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ message: "No se pudo cerrar la sesión." });
      }
    }
  );

  app.post(
    "/auth/sessions/revoke-all",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const authenticatedUser = request.authenticatedUser;
      if (!authenticatedUser) {
        return reply.status(401).send({ message: "Se requiere autenticación." });
      }

      try {
        await pool.query(
          `
            UPDATE app_auth.sessions
            SET revoked_at = now()
            WHERE user_id = $1
              AND id != $2
              AND revoked_at IS NULL
          `,
          [authenticatedUser.id, authenticatedUser.sessionId]
        );

        return { success: true, message: "Todas las otras sesiones activas se han cerrado." };
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ message: "No se pudieron cerrar las demás sesiones." });
      }
    }
  );
}