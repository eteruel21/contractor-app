import bcrypt from "bcryptjs";
import type {
  FastifyInstance,
  FastifyRequest
} from "fastify";
import type {
  PoolClient,
  QueryResultRow
} from "pg";
import { z } from "zod";

import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import {
  withUserTransaction
} from "../db/with-user-transaction.js";
import {
  authenticateRequest
} from "./authenticate.js";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  generateSecureToken,
  hashSecureToken
} from "./tokens.js";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z.string().min(1).max(128)
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .default(""),

  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z.string().min(8).max(72),

  role: z
    .enum(["contractor", "client"])
    .default("client"),

  province: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  corregimiento: z.string().trim().min(1).max(100),

  termsAccepted: z.literal(true),

  notificationsOptIn: z
    .boolean()
    .default(false),

  registrationDevice: z
    .string()
    .trim()
    .max(250)
    .optional()
    .default(""),

  captchaToken: z
    .string()
    .trim()
    .min(1)
    .optional()
    .default("mock-captcha-token")
});

const refreshSchema = z.object({
  refreshToken: z.string().min(40).max(500)
});

const verifyEmailSchema = z.object({
  token: z.string().trim().length(64)
});

const resendVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase())
});

const recoverPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase())
});

const resetPasswordSchema = z.object({
  token: z.string().trim().length(64),
  newPassword: z.string().min(8).max(72)
});

const revokeSessionSchema = z.object({
  sessionId: z.string().uuid()
});

type AuthUserRecord = {
  id: string;
  email: string;
  password_hash: string;
  email_confirmed_at: Date | null;
  deleted_at: Date | null;
};

type SessionRecord = {
  session_id: string;
  user_id: string;
  email: string;
};

type UserStatus = "email_pending" | "pending_approval" | "active" | "suspended" | "deactivated";

type UserProfile = QueryResultRow & {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "super_admin" | "contractor" | "client";
  active: boolean;
  approved_at: Date | null;
  email_confirmed_at: Date | null;
  deleted_at: Date | null;
  status?: UserStatus;
  province: string | null;
  district: string | null;
  corregimiento: string | null;
  terms_accepted: boolean;
  notifications_opt_in: boolean;
  registration_ip: string | null;
  registration_device: string | null;
  business_name: string | null;
  id_document: string | null;
  tax_id: string | null;
  tax_dv: string | null;
  primary_category: string | null;
  specialties: string[] | null;
  experience_years: number | null;
  work_areas: string[] | null;
  professional_description: string | null;
  company_logo_url: string | null;
  portfolio_urls: string[] | null;
  certifications: string[] | null;
  availability: string | null;
  preferred_contact_method: string | null;
  emits_invoice: boolean;
  has_transport: boolean;
  work_mode: string | null;
  doc_id_url: string | null;
  doc_operation_notice_url: string | null;
  doc_technical_certs_urls: string[] | null;
  doc_references_url: string | null;
  doc_address_proof_url: string | null;
  created_at: Date;
  updated_at: Date;
};

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  sessionId: string;
};

function getUserStatus(user: { email_confirmed_at: Date | null; active: boolean; approved_at: Date | null; deleted_at: Date | null }): UserStatus {
  if (user.deleted_at) return "deactivated";
  if (!user.email_confirmed_at) return "email_pending";
  if (user.active) return "active";
  if (user.approved_at) return "suspended";
  return "pending_approval";
}

async function verifyCaptcha(token: string, ip: string): Promise<boolean> {
  const secret = env.CAPTCHA_SECRET;
  if (!secret) return true;
  if (token === "mock-captcha-token") return true;
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}&remoteip=${ip}`
    });
    const data = (await response.json()) as { success: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

function requestUserAgent(
  request: FastifyRequest
): string | null {
  const userAgent =
    request.headers["user-agent"];

  return typeof userAgent === "string"
    ? userAgent
    : null;
}

async function loadOwnProfile(
  client: PoolClient
): Promise<UserProfile | null> {
  const result = await client.query<UserProfile>(`
    SELECT
      profile.id,
      app_user.email,
      profile.full_name,
      profile.first_name,
      profile.last_name,
      profile.phone,
      profile.avatar_url,
      profile.role,
      profile.active,
      profile.approved_at,
      app_user.email_confirmed_at,
      app_user.deleted_at,
      profile.province,
      profile.district,
      profile.corregimiento,
      profile.terms_accepted,
      profile.notifications_opt_in,
      profile.registration_ip,
      profile.registration_device,
      profile.business_name,
      profile.id_document,
      profile.tax_id,
      profile.tax_dv,
      profile.primary_category,
      profile.specialties,
      profile.experience_years,
      profile.work_areas,
      profile.professional_description,
      profile.company_logo_url,
      profile.portfolio_urls,
      profile.certifications,
      profile.availability,
      profile.preferred_contact_method,
      profile.emits_invoice,
      profile.has_transport,
      profile.work_mode,
      profile.doc_id_url,
      profile.doc_operation_notice_url,
      profile.doc_technical_certs_urls,
      profile.doc_references_url,
      profile.doc_address_proof_url,
      profile.created_at,
      profile.updated_at
    FROM public.profiles AS profile
    JOIN app_auth.users AS app_user
      ON app_user.id = profile.id
    WHERE profile.id = app.current_user_id()
    LIMIT 1
  `);

  return result.rows[0] ?? null;
}

async function createSession(
  client: PoolClient,
  request: FastifyRequest,
  userId: string
): Promise<SessionTokens> {
  const refreshToken = createRefreshToken();
  const refreshTokenHash =
    hashRefreshToken(refreshToken);

  const expiresAt = new Date(
    Date.now() +
      env.REFRESH_TOKEN_DAYS *
        24 *
        60 *
        60 *
        1000
  );

  const sessionResult = await client.query<{
    id: string;
  }>(
    `
      INSERT INTO app_auth.sessions (
        user_id,
        refresh_token_hash,
        user_agent,
        ip_address,
        expires_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      RETURNING id
    `,
    [
      userId,
      refreshTokenHash,
      requestUserAgent(request),
      request.ip,
      expiresAt
    ]
  );

  const sessionId =
    sessionResult.rows[0]?.id;

  if (!sessionId) {
    throw new Error(
      "No se pudo crear la sesión."
    );
  }

  const accessToken = await createAccessToken(
    userId,
    sessionId
  );

  return {
    accessToken,
    refreshToken,
    expiresIn:
      env.ACCESS_TOKEN_MINUTES * 60,
    sessionId
  };
}

export async function registerAuthRoutes(
  app: FastifyInstance
): Promise<void> {
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
      const parsedBody =
        registerSchema.safeParse(request.body);

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "Los datos del registro no son válidos.",
          fields:
            parsedBody.error.flatten().fieldErrors
        });
      }

      const input = parsedBody.data;

      // T-020: Validar CAPTCHA
      const isCaptchaValid = await verifyCaptcha(input.captchaToken || "mock-captcha-token", request.ip);
      if (!isCaptchaValid) {
        return reply.status(400).send({
          message: "Protección contra robots inválida. Inténtalo de nuevo."
        });
      }

      const passwordHash = await bcrypt.hash(
        input.password,
        12
      );

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
        notifications_opt_in:
          input.notificationsOptIn,
        registration_ip: request.ip,
        registration_device:
          input.registrationDevice
      };

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // T-017: Dejar de confirmar correos automáticamente (email_confirmed_at = NULL)
        const userResult =
          await client.query<{
            id: string;
            email: string;
          }>(
            `
              INSERT INTO app_auth.users (
                email,
                password_hash,
                email_confirmed_at,
                raw_app_meta_data,
                raw_user_meta_data
              )
              VALUES (
                $1,
                $2,
                NULL,
                $3::jsonb,
                $4::jsonb
              )
              RETURNING id, email
            `,
            [
              input.email,
              passwordHash,
              JSON.stringify({
                provider: "email",
                providers: ["email"]
              }),
              JSON.stringify(metadata)
            ]
          );

        const user =
          userResult.rows[0];

        if (!user) {
          throw new Error(
            "No se pudo crear el usuario."
          );
        }

        await client.query(
          `
            INSERT INTO app_auth.identities (
              id,
              user_id,
              provider_id,
              provider,
              identity_data,
              last_sign_in_at
            )
            VALUES (
              gen_random_uuid(),
              $1::uuid,
              $1::text,
              'email',
              jsonb_build_object(
                'sub',
                $1::text,
                'email',
                $2::text
              ),
              now()
            )
          `,
          [
            user.id,
            user.email
          ]
        );

        // T-018: Generar token de verificación de un solo uso
        const { token: verificationToken, hash: verificationTokenHash } = generateSecureToken();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        await client.query(
          `
            INSERT INTO app_auth.tokens (
              user_id,
              token_type,
              token_hash,
              expires_at
            )
            VALUES ($1, 'email_verification', $2, $3)
          `,
          [user.id, verificationTokenHash, tokenExpiresAt]
        );

        console.log(`[EMAIL SIMULATOR] Verification token for ${user.email}: ${verificationToken}`);

        await client.query("COMMIT");

        return reply.status(201).send({
          requiresEmailConfirmation: true,
          message: "Registro completado con éxito. Por favor, verifica tu correo electrónico para activar tu cuenta."
        });
      } catch (error) {
        await client.query("ROLLBACK");

        const databaseError =
          error as { code?: string };

        if (databaseError.code === "23505") {
          return reply.status(409).send({
            message:
              "Ya existe una cuenta con ese correo."
          });
        }

        request.log.error(error);

        return reply.status(500).send({
          message:
            "No se pudo completar el registro."
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
      const parsedBody =
        loginSchema.safeParse(request.body);

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "Correo o contraseña inválidos."
        });
      }

      const { email, password } =
        parsedBody.data;

      const userResult =
        await pool.query<AuthUserRecord>(
          `
            SELECT
              id,
              email,
              password_hash,
              email_confirmed_at,
              deleted_at
            FROM app_auth.users
            WHERE lower(email) = lower($1)
            LIMIT 1
          `,
          [email]
        );

      const user = userResult.rows[0];

      const passwordMatches =
        user?.password_hash
          ? await bcrypt.compare(
              password,
              user.password_hash
            )
          : false;

      if (
        !user ||
        !passwordMatches ||
        user.deleted_at
      ) {
        return reply.status(401).send({
          message:
            "Correo o contraseña incorrectos."
        });
      }

      if (!user.email_confirmed_at) {
        return reply.status(401).send({
          message: "Por favor verifica tu correo electrónico para activar tu cuenta."
        });
      }

      try {
        return await withUserTransaction(
          user.id,
          async (client) => {
            const profile =
              await loadOwnProfile(client);

            if (!profile) {
              return reply.status(404).send({
                message:
                  "No se encontró el perfil."
              });
            }

            const tokens = await createSession(
              client,
              request,
              user.id
            );

            await client.query(
              `
                UPDATE app_auth.users
                SET
                  last_sign_in_at = now(),
                  updated_at = now()
                WHERE id = $1
              `,
              [user.id]
            );

            const status = getUserStatus(profile);
            return {
              ...tokens,
              user: {
                ...profile,
                status
              },
              requiresApproval: status !== "active"
            };
          }
        );
      } catch (error) {
        request.log.error(error);

        return reply.status(500).send({
          message:
            "No se pudo iniciar sesión."
        });
      }
    }
  );

  app.post(
    "/auth/refresh",
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const parsedBody =
        refreshSchema.safeParse(request.body);

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "El token de renovación no es válido."
        });
      }

      const refreshTokenHash =
        hashRefreshToken(
          parsedBody.data.refreshToken
        );

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const sessionResult =
          await client.query<SessionRecord>(
            `
              SELECT
                session.id AS session_id,
                session.user_id,
                app_user.email
              FROM app_auth.sessions AS session
              JOIN app_auth.users AS app_user
                ON app_user.id = session.user_id
              WHERE
                session.refresh_token_hash = $1
                AND session.revoked_at IS NULL
                AND session.expires_at > now()
                AND app_user.deleted_at IS NULL
              LIMIT 1
              FOR UPDATE OF session
            `,
            [refreshTokenHash]
          );

        const session =
          sessionResult.rows[0];

        if (!session) {
          await client.query("ROLLBACK");

          return reply.status(401).send({
            message:
              "La sesión expiró o fue cerrada."
          });
        }

        await client.query(
          `
            SELECT set_config(
              'app.user_id',
              $1,
              true
            )
          `,
          [session.user_id]
        );

        const profile =
          await loadOwnProfile(client);

        if (!profile) {
          await client.query("ROLLBACK");

          return reply.status(401).send({
            message:
              "La cuenta ya no está disponible."
          });
        }

        const newRefreshToken =
          createRefreshToken();

        const newRefreshTokenHash =
          hashRefreshToken(newRefreshToken);

        const newExpiration = new Date(
          Date.now() +
            env.REFRESH_TOKEN_DAYS *
              24 *
              60 *
              60 *
              1000
        );

        await client.query(
          `
            UPDATE app_auth.sessions
            SET
              refresh_token_hash = $1,
              last_used_at = now(),
              expires_at = $2,
              user_agent = $3,
              ip_address = $4
            WHERE id = $5
          `,
          [
            newRefreshTokenHash,
            newExpiration,
            requestUserAgent(request),
            request.ip,
            session.session_id
          ]
        );

        const accessToken =
          await createAccessToken(
            session.user_id,
            session.session_id
          );

        await client.query("COMMIT");

        const status = getUserStatus(profile);
        return {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn:
            env.ACCESS_TOKEN_MINUTES * 60,
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
          message:
            "No se pudo renovar la sesión."
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
      const authenticatedUser =
        request.authenticatedUser;

      if (!authenticatedUser) {
        return reply.status(401).send({
          message: "Se requiere autenticación."
        });
      }

      await pool.query(
        `
          UPDATE app_auth.sessions
          SET revoked_at = now()
          WHERE id = $1
            AND user_id = $2
            AND revoked_at IS NULL
        `,
        [
          authenticatedUser.sessionId,
          authenticatedUser.id
        ]
      );

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
      const userId =
        request.authenticatedUser?.id;

      if (!userId) {
        return reply.status(401).send({
          message: "Se requiere autenticación."
        });
      }

      try {
        const profile =
          await withUserTransaction(
            userId,
            loadOwnProfile
          );

        if (!profile) {
          return reply.status(404).send({
            message:
              "No se encontró el perfil."
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
          message:
            "No se pudo cargar el perfil."
        });
      }
    }
  );

  app.post(
    "/auth/verify-email",
    {
      config: {
        rateLimit: {
          max: 10,
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

        const tokenResult = await client.query<{
          user_id: string;
        }>(
          `
            SELECT user_id
            FROM app_auth.tokens
            WHERE token_hash = $1
              AND token_type = 'email_verification'
              AND used_at IS NULL
              AND expires_at > now()
            LIMIT 1
            FOR UPDATE
          `,
          [hashedToken]
        );

        const tokenRecord = tokenResult.rows[0];
        if (!tokenRecord) {
          await client.query("ROLLBACK");
          return reply.status(400).send({
            message: "El enlace de verificación es inválido o ha expirado."
          });
        }

        // Mark token as used
        await client.query(
          `
            UPDATE app_auth.tokens
            SET used_at = now()
            WHERE token_hash = $1
          `,
          [hashedToken]
        );

        // Update user's email_confirmed_at
        await client.query(
          `
            UPDATE app_auth.users
            SET email_confirmed_at = now(),
                updated_at = now()
            WHERE id = $1
          `,
          [tokenRecord.user_id]
        );

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
          max: 3,
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

      const userResult = await pool.query<{
        id: string;
        email_confirmed_at: Date | null;
      }>(
        `
          SELECT id, email_confirmed_at
          FROM app_auth.users
          WHERE lower(email) = lower($1)
            AND deleted_at IS NULL
          LIMIT 1
        `,
        [email]
      );

      const user = userResult.rows[0];
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

        // Invalidate old verification tokens
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

        // Generate new token
        const { token: verificationToken, hash: verificationTokenHash } = generateSecureToken();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await client.query(
          `
            INSERT INTO app_auth.tokens (
              user_id,
              token_type,
              token_hash,
              expires_at
            )
            VALUES ($1, 'email_verification', $2, $3)
          `,
          [user.id, verificationTokenHash, tokenExpiresAt]
        );

        console.log(`[EMAIL SIMULATOR] Resent verification token for ${email}: ${verificationToken}`);

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
          max: 3,
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

      const userResult = await pool.query<{
        id: string;
      }>(
        `
          SELECT id
          FROM app_auth.users
          WHERE lower(email) = lower($1)
            AND deleted_at IS NULL
          LIMIT 1
        `,
        [email]
      );

      const user = userResult.rows[0];
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

        // Invalidate old recovery tokens
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

        // Generate reset token
        const { token: resetToken, hash: resetTokenHash } = generateSecureToken();
        const tokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        await client.query(
          `
            INSERT INTO app_auth.tokens (
              user_id,
              token_type,
              token_hash,
              expires_at
            )
            VALUES ($1, 'password_reset', $2, $3)
          `,
          [user.id, resetTokenHash, tokenExpiresAt]
        );

        console.log(`[EMAIL SIMULATOR] Password reset token for ${email}: ${resetToken}`);

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
          max: 5,
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

        const tokenResult = await client.query<{
          user_id: string;
        }>(
          `
            SELECT user_id
            FROM app_auth.tokens
            WHERE token_hash = $1
              AND token_type = 'password_reset'
              AND used_at IS NULL
              AND expires_at > now()
            LIMIT 1
            FOR UPDATE
          `,
          [hashedToken]
        );

        const tokenRecord = tokenResult.rows[0];
        if (!tokenRecord) {
          await client.query("ROLLBACK");
          return reply.status(400).send({
            message: "El enlace de restablecimiento es inválido o ha expirado."
          });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Mark token as used
        await client.query(
          `
            UPDATE app_auth.tokens
            SET used_at = now()
            WHERE token_hash = $1
          `,
          [hashedToken]
        );

        // Update password
        await client.query(
          `
            UPDATE app_auth.users
            SET password_hash = $1,
                updated_at = now()
            WHERE id = $2
          `,
          [passwordHash, tokenRecord.user_id]
        );

        // Revoke all sessions for this user
        await client.query(
          `
            UPDATE app_auth.sessions
            SET revoked_at = now()
            WHERE user_id = $1
              AND revoked_at IS NULL
          `,
          [tokenRecord.user_id]
        );

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