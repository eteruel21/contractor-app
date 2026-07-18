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
  hashRefreshToken
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
    .default("")
});

const refreshSchema = z.object({
  refreshToken: z.string().min(40).max(500)
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
          max: 5,
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
                now(),
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
              $1,
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

        await client.query(
          `
            SELECT set_config(
              'app.user_id',
              $1,
              true
            )
          `,
          [user.id]
        );

        const profile =
          await loadOwnProfile(client);

        if (!profile) {
          throw new Error(
            "No se pudo crear el perfil."
          );
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

        await client.query("COMMIT");

        return reply.status(201).send({
          ...tokens,
          user: profile,
          requiresApproval: !profile.active
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
          max: 5,
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
        user.deleted_at ||
        !user.email_confirmed_at
      ) {
        return reply.status(401).send({
          message:
            "Correo o contraseña incorrectos."
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

            return {
              ...tokens,
              user: profile,
              requiresApproval: !profile.active
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

        return {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn:
            env.ACCESS_TOKEN_MINUTES * 60,
          sessionId: session.session_id,
          user: profile,
          requiresApproval: !profile.active
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

        return {
          user: profile,
          requiresApproval: !profile.active
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
}