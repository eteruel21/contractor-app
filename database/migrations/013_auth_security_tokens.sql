BEGIN;

SET ROLE contractor_owner;

CREATE TABLE IF NOT EXISTS app_auth.tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
  token_type text NOT NULL, -- 'email_verification', 'password_reset'
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);

CREATE INDEX IF NOT EXISTS tokens_user_type_idx ON app_auth.tokens(user_id, token_type);

GRANT SELECT, INSERT, UPDATE, DELETE ON app_auth.tokens TO contractor_api;

COMMIT;
