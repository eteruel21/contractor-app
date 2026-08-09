BEGIN;

SET ROLE contractor_owner;

-- El backend de Contractor Pro opera como contractor_api.
-- No depende del rol Supabase authenticated para acceder a la base.
DROP POLICY IF EXISTS user_push_tokens_owner_policy
ON public.user_push_tokens;

CREATE POLICY user_push_tokens_owner_policy
ON public.user_push_tokens
FOR ALL
TO contractor_api
USING (
  user_id = app.current_user_id()
)
WITH CHECK (
  user_id = app.current_user_id()
);

REVOKE ALL
ON public.user_push_tokens
FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.user_push_tokens
TO contractor_api;

-- Conservar únicamente el registro más reciente si una base
-- anterior contiene el mismo dispositivo para varios usuarios.
WITH ranked_tokens AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY expo_push_token
      ORDER BY updated_at DESC, created_at DESC, id DESC
    ) AS row_number
  FROM public.user_push_tokens
)
DELETE FROM public.user_push_tokens AS token
USING ranked_tokens AS ranked
WHERE token.id = ranked.id
  AND ranked.row_number > 1;

ALTER TABLE public.user_push_tokens
DROP CONSTRAINT IF EXISTS uq_user_push_token;

ALTER TABLE public.user_push_tokens
ADD CONSTRAINT uq_user_push_token_value
UNIQUE (expo_push_token);

-- Esta función permite transferir de forma segura un token físico
-- al usuario que actualmente posee la sesión autenticada.
CREATE OR REPLACE FUNCTION private.register_push_token(
  requested_token text,
  requested_platform text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  authenticated_user_id uuid :=
    app.current_user_id();
BEGIN
  IF authenticated_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    JOIN app_auth.users AS auth_user
      ON auth_user.id = profile.id
    WHERE profile.id = authenticated_user_id
      AND profile.active = true
      AND profile.approved_at IS NOT NULL
      AND auth_user.email_confirmed_at IS NOT NULL
      AND auth_user.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION
      'El usuario no está activo y aprobado.';
  END IF;

  DELETE FROM public.user_push_tokens
  WHERE expo_push_token = requested_token
    AND user_id <> authenticated_user_id;

  INSERT INTO public.user_push_tokens (
    user_id,
    expo_push_token,
    device_platform,
    updated_at
  )
  VALUES (
    authenticated_user_id,
    requested_token,
    requested_platform,
    now()
  )
  ON CONFLICT (expo_push_token)
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    device_platform = EXCLUDED.device_platform,
    updated_at = now();
END;
$function$;

REVOKE ALL
ON FUNCTION private.register_push_token(text, text)
FROM PUBLIC;

GRANT USAGE
ON SCHEMA private
TO contractor_api;

GRANT EXECUTE
ON FUNCTION private.register_push_token(text, text)
TO contractor_api;

RESET ROLE;

COMMIT;
