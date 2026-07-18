BEGIN;

SET ROLE contractor_owner;

CREATE TABLE IF NOT EXISTS app_auth.identities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  provider_id text NOT NULL,
  provider text NOT NULL,
  identity_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_sign_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT app_auth_identities_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES app_auth.users(id)
    ON DELETE CASCADE,

  CONSTRAINT app_auth_identities_provider_unique
    UNIQUE (provider, provider_id)
);

CREATE INDEX IF NOT EXISTS app_auth_identities_user_id_idx
ON app_auth.identities (user_id);

CREATE INDEX IF NOT EXISTS app_auth_identities_provider_idx
ON app_auth.identities (provider);

GRANT SELECT, INSERT, UPDATE, DELETE
ON app_auth.identities
TO contractor_api;

GRANT ALL
ON app_auth.identities
TO contractor_migrator;

RESET ROLE;

COMMIT;