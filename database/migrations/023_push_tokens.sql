BEGIN;

SET ROLE contractor_owner;

-- Migration 023: User Push Tokens for Native Push Notifications

CREATE TABLE IF NOT EXISTS public.user_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    expo_push_token TEXT NOT NULL,
    device_platform TEXT NOT NULL DEFAULT 'unknown',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_push_token UNIQUE (user_id, expo_push_token)
);

CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON public.user_push_tokens(user_id);

ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own push tokens
DROP POLICY IF EXISTS user_push_tokens_owner_policy ON public.user_push_tokens;
CREATE POLICY user_push_tokens_owner_policy ON public.user_push_tokens
    FOR ALL
    TO authenticated
    USING (user_id = app.current_user_id())
    WITH CHECK (user_id = app.current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_push_tokens TO contractor_api;

RESET ROLE;

COMMIT;

