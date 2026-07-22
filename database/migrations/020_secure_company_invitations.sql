BEGIN;

SET ROLE contractor_owner;

-- Store only a one-way digest. Existing pending links keep working because their
-- plaintext values are converted to the same SHA-256 representation used by the API.
ALTER TABLE public.company_invitations
  ADD COLUMN IF NOT EXISTS token_hash text;

UPDATE public.company_invitations
SET token_hash = encode(sha256(convert_to(token, 'UTF8')), 'hex')
WHERE token_hash IS NULL;

ALTER TABLE public.company_invitations
  ALTER COLUMN token_hash SET NOT NULL;

DROP INDEX IF EXISTS public.idx_company_invitations_token;

ALTER TABLE public.company_invitations
  DROP CONSTRAINT IF EXISTS company_invitations_token_key,
  DROP COLUMN IF EXISTS token;

ALTER TABLE public.company_invitations
  ADD CONSTRAINT company_invitations_token_hash_key UNIQUE (token_hash),
  ADD CONSTRAINT company_invitations_token_hash_format_check
    CHECK (token_hash ~ '^[0-9a-f]{64}$');

CREATE INDEX IF NOT EXISTS idx_company_invitations_pending_company
  ON public.company_invitations (company_id, created_at DESC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_company_invitations_pending_email
  ON public.company_invitations (lower(email), expires_at)
  WHERE status = 'pending';

-- Owner access must only be granted by the controlled member-role workflow.
UPDATE public.company_invitations
SET status = 'revoked', updated_at = now()
WHERE status = 'pending'
  AND role = 'owner'::public.company_role;

UPDATE public.company_invitations
SET status = 'expired', updated_at = now()
WHERE status = 'pending'
  AND expires_at <= now();

UPDATE public.company_invitations
SET email = lower(btrim(email))
WHERE email IS DISTINCT FROM lower(btrim(email));

WITH duplicate_pending AS (
  SELECT
    invitation.id,
    row_number() OVER (
      PARTITION BY invitation.company_id, lower(invitation.email)
      ORDER BY invitation.created_at DESC, invitation.id DESC
    ) AS duplicate_position
  FROM public.company_invitations AS invitation
  WHERE invitation.status = 'pending'
)
UPDATE public.company_invitations AS invitation
SET status = 'revoked', updated_at = now()
FROM duplicate_pending
WHERE duplicate_pending.id = invitation.id
  AND duplicate_pending.duplicate_position > 1;

CREATE UNIQUE INDEX IF NOT EXISTS company_invitations_one_pending_email_key
  ON public.company_invitations (company_id, lower(email))
  WHERE status = 'pending';

ALTER TABLE public.company_invitations
  ADD CONSTRAINT company_invitations_pending_non_owner_check
    CHECK (status <> 'pending' OR role <> 'owner'::public.company_role);

DROP POLICY IF EXISTS company_invitations_select_policy ON public.company_invitations;
CREATE POLICY company_invitations_select_policy
ON public.company_invitations
FOR SELECT TO contractor_api
USING (
  private.is_active_platform_user()
  AND public.is_company_admin(company_id)
);

-- Invitation state changes run through the audited SECURITY DEFINER functions below.
DROP POLICY IF EXISTS company_invitations_insert_policy ON public.company_invitations;
DROP POLICY IF EXISTS company_invitations_update_policy ON public.company_invitations;
DROP POLICY IF EXISTS company_invitations_delete_policy ON public.company_invitations;

REVOKE ALL ON public.company_invitations FROM contractor_api;

GRANT SELECT (
  id,
  company_id,
  email,
  role,
  invited_by,
  status,
  expires_at,
  created_at,
  updated_at
) ON public.company_invitations TO contractor_api;

CREATE OR REPLACE FUNCTION private.create_company_invitation(
  p_company_id uuid,
  p_email text,
  p_role public.company_role,
  p_token_hash text,
  p_expires_at timestamptz
)
RETURNS TABLE (
  created_invitation_id uuid,
  created_company_id uuid,
  created_email text,
  created_role public.company_role,
  created_invited_by uuid,
  created_status text,
  created_expires_at timestamptz,
  created_created_at timestamptz,
  created_updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid := app.current_user_id();
  v_email text := lower(btrim(p_email));
  v_invitation public.company_invitations%ROWTYPE;
BEGIN
  IF v_user_id IS NULL
    OR NOT private.is_active_platform_user()
    OR NOT public.is_company_admin(p_company_id)
    OR v_email IS NULL
    OR char_length(v_email) > 320
    OR position('@' IN v_email) <= 1
    OR p_role IS NULL
    OR p_role = 'owner'::public.company_role
    OR p_token_hash IS NULL
    OR p_token_hash !~ '^[0-9a-f]{64}$'
    OR p_expires_at IS NULL
    OR p_expires_at <= now()
    OR p_expires_at > now() + interval '30 days'
  THEN
    RETURN;
  END IF;

  UPDATE public.company_invitations AS invitation
  SET status = 'expired', updated_at = now()
  WHERE invitation.company_id = p_company_id
    AND lower(invitation.email) = v_email
    AND invitation.status = 'pending'
    AND invitation.expires_at <= now();

  INSERT INTO public.company_invitations AS invitation (
    company_id,
    email,
    role,
    token_hash,
    invited_by,
    status,
    expires_at
  )
  VALUES (
    p_company_id,
    v_email,
    p_role,
    p_token_hash,
    v_user_id,
    'pending',
    p_expires_at
  )
  ON CONFLICT (company_id, lower(email)) WHERE status = 'pending'
  DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    token_hash = EXCLUDED.token_hash,
    invited_by = EXCLUDED.invited_by,
    expires_at = EXCLUDED.expires_at,
    updated_at = now()
  RETURNING invitation.*
  INTO v_invitation;

  INSERT INTO public.admin_audit_logs (
    company_id,
    user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    v_invitation.company_id,
    v_user_id,
    'INVITATION_CREATED',
    'company_invitation',
    v_invitation.id::text,
    jsonb_build_object(
      'email', v_invitation.email,
      'role', v_invitation.role
    )
  );

  RETURN QUERY
  SELECT
    v_invitation.id,
    v_invitation.company_id,
    v_invitation.email,
    v_invitation.role,
    v_invitation.invited_by,
    v_invitation.status,
    v_invitation.expires_at,
    v_invitation.created_at,
    v_invitation.updated_at;
END;
$function$;

REVOKE ALL
ON FUNCTION private.create_company_invitation(uuid, text, public.company_role, text, timestamptz)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION private.create_company_invitation(uuid, text, public.company_role, text, timestamptz)
TO contractor_api, contractor_migrator;

CREATE OR REPLACE FUNCTION private.accept_company_invitation(p_token_hash text)
RETURNS TABLE (
  accepted_invitation_id uuid,
  accepted_company_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid := app.current_user_id();
  v_user_email text;
  v_invitation public.company_invitations%ROWTYPE;
BEGIN
  IF v_user_id IS NULL
    OR p_token_hash IS NULL
    OR p_token_hash !~ '^[0-9a-f]{64}$'
    OR NOT private.is_active_platform_user()
  THEN
    RETURN;
  END IF;

  SELECT lower(btrim(platform_user.email))
  INTO v_user_email
  FROM app_auth.users AS platform_user
  WHERE platform_user.id = v_user_id
    AND platform_user.email IS NOT NULL
    AND platform_user.email_confirmed_at IS NOT NULL
    AND platform_user.deleted_at IS NULL;

  IF v_user_email IS NULL THEN
    RETURN;
  END IF;

  SELECT invitation.*
  INTO v_invitation
  FROM public.company_invitations AS invitation
  WHERE invitation.token_hash = p_token_hash
    AND invitation.status = 'pending'
    AND invitation.expires_at > now()
    AND invitation.role <> 'owner'::public.company_role
    AND lower(btrim(invitation.email)) = v_user_email
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  INSERT INTO public.company_members (
    company_id,
    user_id,
    role,
    active
  )
  VALUES (
    v_invitation.company_id,
    v_user_id,
    v_invitation.role,
    true
  )
  ON CONFLICT ON CONSTRAINT company_members_unique
  DO UPDATE SET
    role = CASE
      WHEN public.company_members.role = 'owner'::public.company_role
        THEN public.company_members.role
      ELSE EXCLUDED.role
    END,
    active = true,
    updated_at = now();

  UPDATE public.company_invitations AS invitation
  SET status = 'accepted', updated_at = now()
  WHERE invitation.id = v_invitation.id
    AND invitation.status = 'pending';

  INSERT INTO public.admin_audit_logs (
    company_id,
    user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    v_invitation.company_id,
    v_user_id,
    'INVITATION_ACCEPTED',
    'company_invitation',
    v_invitation.id::text,
    jsonb_build_object(
      'email', v_invitation.email,
      'role', v_invitation.role
    )
  );

  RETURN QUERY
  SELECT v_invitation.id, v_invitation.company_id;
END;
$function$;

REVOKE ALL
ON FUNCTION private.accept_company_invitation(text)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION private.accept_company_invitation(text)
TO contractor_api, contractor_migrator;

CREATE OR REPLACE FUNCTION private.revoke_company_invitation(
  p_company_id uuid,
  p_invitation_id uuid
)
RETURNS TABLE (
  revoked_invitation_id uuid,
  revoked_company_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid := app.current_user_id();
  v_invitation public.company_invitations%ROWTYPE;
BEGIN
  IF v_user_id IS NULL
    OR NOT private.is_active_platform_user()
    OR NOT public.is_company_admin(p_company_id)
  THEN
    RETURN;
  END IF;

  SELECT invitation.*
  INTO v_invitation
  FROM public.company_invitations AS invitation
  WHERE invitation.id = p_invitation_id
    AND invitation.company_id = p_company_id
    AND invitation.status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE public.company_invitations AS invitation
  SET status = 'revoked', updated_at = now()
  WHERE invitation.id = v_invitation.id
    AND invitation.status = 'pending';

  INSERT INTO public.admin_audit_logs (
    company_id,
    user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  VALUES (
    v_invitation.company_id,
    v_user_id,
    'INVITATION_REVOKED',
    'company_invitation',
    v_invitation.id::text,
    jsonb_build_object('email', v_invitation.email)
  );

  RETURN QUERY
  SELECT v_invitation.id, v_invitation.company_id;
END;
$function$;

REVOKE ALL
ON FUNCTION private.revoke_company_invitation(uuid, uuid)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION private.revoke_company_invitation(uuid, uuid)
TO contractor_api, contractor_migrator;

RESET ROLE;

COMMIT;
