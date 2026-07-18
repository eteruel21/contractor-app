BEGIN;

SET ROLE contractor_owner;

CREATE TABLE app_auth.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL
    REFERENCES app_auth.users(id)
    ON DELETE CASCADE,

  refresh_token_hash text NOT NULL UNIQUE,
  user_agent text,
  ip_address inet,

  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE INDEX app_auth_sessions_user_id_idx
ON app_auth.sessions (user_id);

CREATE INDEX app_auth_sessions_active_idx
ON app_auth.sessions (
  user_id,
  expires_at
)
WHERE revoked_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE
ON app_auth.sessions
TO contractor_api;

GRANT ALL
ON app_auth.sessions
TO contractor_migrator;

RESET ROLE;

COMMIT;