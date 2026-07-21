import type { PoolClient, QueryResultRow } from "pg";
import { pool } from "../db/pool.js";
import { env } from "../config/env.js";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from "./tokens.js";

export type AuthUserRecord = {
  id: string;
  email: string;
  password_hash: string;
  email_confirmed_at: Date | null;
  deleted_at: Date | null;
};

export type SessionRecord = {
  session_id: string;
  user_id: string;
  email: string;
};

export type UserStatus = "email_pending" | "pending_approval" | "active" | "suspended" | "deactivated";

export type UserProfile = QueryResultRow & {
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

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  sessionId: string;
};

export function getUserStatus(user: {
  email_confirmed_at: Date | null;
  active: boolean;
  approved_at: Date | null;
  deleted_at: Date | null;
}): UserStatus {
  if (user.deleted_at) return "deactivated";
  if (!user.email_confirmed_at) return "email_pending";
  if (user.active) return "active";
  if (user.approved_at) return "suspended";
  return "pending_approval";
}

export async function findUserByEmail(email: string): Promise<AuthUserRecord | null> {
  const result = await pool.query<AuthUserRecord>(
    `
      SELECT id, email, password_hash, email_confirmed_at, deleted_at
      FROM app_auth.users
      WHERE lower(email) = lower($1)
      LIMIT 1
    `,
    [email]
  );
  return result.rows[0] ?? null;
}

export async function findUserById(client: PoolClient, id: string): Promise<AuthUserRecord | null> {
  const result = await client.query<AuthUserRecord>(
    `
      SELECT id, email, password_hash, email_confirmed_at, deleted_at
      FROM app_auth.users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function insertUser(
  client: PoolClient,
  email: string,
  passwordHash: string,
  metadata: Record<string, unknown>
): Promise<string> {
  const result = await client.query<{ id: string }>(
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
      RETURNING id
    `,
    [
      email,
      passwordHash,
      JSON.stringify({
        provider: "email",
        providers: ["email"]
      }),
      JSON.stringify(metadata)
    ]
  );
  if (!result.rows[0]) {
    throw new Error("No se pudo crear el usuario.");
  }
  return result.rows[0].id;
}

export async function insertIdentity(
  client: PoolClient,
  userId: string,
  email: string
): Promise<void> {
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
    [userId, email]
  );
}

export async function insertToken(
  client: PoolClient,
  userId: string,
  tokenType: "email_verification" | "password_reset",
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  await client.query(
    `
      INSERT INTO app_auth.tokens (
        user_id,
        token_type,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
    `,
    [userId, tokenType, tokenHash, expiresAt]
  );
}

export async function invalidateOldTokens(
  client: PoolClient,
  userId: string,
  tokenType: "email_verification" | "password_reset"
): Promise<void> {
  await client.query(
    `
      UPDATE app_auth.tokens
      SET used_at = now()
      WHERE user_id = $1
        AND token_type = $2
        AND used_at IS NULL
    `,
    [userId, tokenType]
  );
}

export async function loadOwnProfile(client: PoolClient): Promise<UserProfile | null> {
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

export async function createSession(
  client: PoolClient,
  userId: string,
  ipAddress: string,
  userAgent: string | null
): Promise<SessionTokens> {
  const refreshToken = createRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );

  const sessionResult = await client.query<{ id: string }>(
    `
      INSERT INTO app_auth.sessions (
        user_id,
        refresh_token_hash,
        user_agent,
        ip_address,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [userId, refreshTokenHash, userAgent, ipAddress, expiresAt]
  );

  const sessionId = sessionResult.rows[0]?.id;
  if (!sessionId) {
    throw new Error("No se pudo crear la sesión.");
  }

  const accessToken = await createAccessToken(userId, sessionId);

  return {
    accessToken,
    refreshToken,
    expiresIn: env.ACCESS_TOKEN_MINUTES * 60,
    sessionId
  };
}

export async function updateUserSignIn(client: PoolClient, userId: string): Promise<void> {
  await client.query(
    `
      UPDATE app_auth.users
      SET last_sign_in_at = now(), updated_at = now()
      WHERE id = $1
    `,
    [userId]
  );
}

export async function findSessionByRefreshTokenHash(
  client: PoolClient,
  hash: string
): Promise<SessionRecord | null> {
  const result = await client.query<SessionRecord>(
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
    [hash]
  );
  return result.rows[0] ?? null;
}

export async function updateSessionRotation(
  client: PoolClient,
  sessionId: string,
  newHash: string,
  newExpiration: Date,
  ipAddress: string,
  userAgent: string | null
): Promise<void> {
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
    [newHash, newExpiration, userAgent, ipAddress, sessionId]
  );
}

export async function revokeSession(sessionId: string, userId: string): Promise<void> {
  await pool.query(
    `
      UPDATE app_auth.sessions
      SET revoked_at = now()
      WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
    `,
    [sessionId, userId]
  );
}

export async function findTokenByHash(
  client: PoolClient,
  tokenHash: string,
  tokenType: "email_verification" | "password_reset"
): Promise<{ user_id: string; expires_at: Date; used_at: Date | null } | null> {
  const result = await client.query<{ user_id: string; expires_at: Date; used_at: Date | null }>(
    `
      SELECT user_id, expires_at, used_at
      FROM app_auth.tokens
      WHERE token_hash = $1 AND token_type = $2
      LIMIT 1
    `,
    [tokenHash, tokenType]
  );
  return result.rows[0] ?? null;
}

export async function markTokenUsed(client: PoolClient, tokenHash: string): Promise<void> {
  await client.query(
    `
      UPDATE app_auth.tokens
      SET used_at = now()
      WHERE token_hash = $1
    `,
    [tokenHash]
  );
}

export async function confirmEmail(client: PoolClient, userId: string): Promise<void> {
  await client.query(
    `
      UPDATE app_auth.users
      SET email_confirmed_at = now(), updated_at = now()
      WHERE id = $1
    `,
    [userId]
  );
}

export async function updateUserPassword(
  client: PoolClient,
  userId: string,
  passwordHash: string
): Promise<void> {
  await client.query(
    `
      UPDATE app_auth.users
      SET password_hash = $1, email_confirmed_at = COALESCE(email_confirmed_at, now()), updated_at = now()
      WHERE id = $2
    `,
    [passwordHash, userId]
  );
}

export async function revokeAllUserSessions(client: PoolClient, userId: string): Promise<void> {
  await client.query(
    `
      UPDATE app_auth.sessions
      SET revoked_at = now()
      WHERE user_id = $1 AND revoked_at IS NULL
    `,
    [userId]
  );
}
