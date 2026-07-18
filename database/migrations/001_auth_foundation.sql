BEGIN;

SET ROLE contractor_owner;

CREATE SCHEMA IF NOT EXISTS app
AUTHORIZATION contractor_owner;

CREATE SCHEMA IF NOT EXISTS app_auth
AUTHORIZATION contractor_owner;

REVOKE ALL
ON SCHEMA app_auth
FROM PUBLIC;

GRANT USAGE
ON SCHEMA app
TO contractor_api, contractor_migrator;

GRANT USAGE
ON SCHEMA app_auth
TO contractor_api, contractor_migrator;

CREATE TABLE IF NOT EXISTS app_auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  password_hash text,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS app_auth_users_email_unique
ON app_auth.users (lower(email))
WHERE email IS NOT NULL
  AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS app_auth_users_active_idx
ON app_auth.users (id)
WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  SELECT NULLIF(
    pg_catalog.current_setting('app.user_id', true),
    ''
  )::uuid;
$function$;

REVOKE ALL
ON FUNCTION app.current_user_id()
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION app.current_user_id()
TO contractor_api, contractor_migrator;

GRANT SELECT, INSERT, UPDATE
ON app_auth.users
TO contractor_api;

GRANT ALL
ON app_auth.users
TO contractor_migrator;

RESET ROLE;

COMMIT;
