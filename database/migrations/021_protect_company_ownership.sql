BEGIN;

SET ROLE contractor_owner;

CREATE OR REPLACE FUNCTION private.protect_company_owner_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_company_exists boolean;
BEGIN
  IF TG_OP = 'UPDATE'
    AND (
      NEW.id IS DISTINCT FROM OLD.id
      OR NEW.company_id IS DISTINCT FROM OLD.company_id
      OR NEW.user_id IS DISTINCT FROM OLD.user_id
    )
  THEN
    RAISE EXCEPTION 'La identidad de una membresía no se puede modificar.'
      USING ERRCODE = '23514';
  END IF;

  IF OLD.role = 'owner'::public.company_role
    AND OLD.active = true
    AND (
      TG_OP = 'DELETE'
      OR NEW.role <> 'owner'::public.company_role
      OR NEW.active = false
    )
  THEN
    SELECT true
    INTO v_company_exists
    FROM public.companies AS company
    WHERE company.id = OLD.company_id
    FOR UPDATE;

    -- Let a parent-company cascade remove its memberships.
    IF NOT COALESCE(v_company_exists, false) THEN
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      END IF;
      RETURN NEW;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.company_members AS membership
      WHERE membership.company_id = OLD.company_id
        AND membership.id <> OLD.id
        AND membership.role = 'owner'::public.company_role
        AND membership.active = true
    ) THEN
      RAISE EXCEPTION 'La empresa debe conservar al menos un propietario activo.'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL
ON FUNCTION private.protect_company_owner_membership()
FROM PUBLIC;

DROP TRIGGER IF EXISTS protect_company_owner_membership
ON public.company_members;

CREATE TRIGGER protect_company_owner_membership
BEFORE UPDATE OR DELETE ON public.company_members
FOR EACH ROW
EXECUTE FUNCTION private.protect_company_owner_membership();

DROP POLICY IF EXISTS "Admins can add company members"
ON public.company_members;

CREATE POLICY "Admins can add company members"
ON public.company_members
FOR INSERT TO contractor_api
WITH CHECK (
  private.is_active_platform_user()
  AND public.is_company_admin(company_id)
  AND active = true
  AND (
    role <> 'owner'::public.company_role
    OR public.is_company_owner(company_id)
  )
);

DROP POLICY IF EXISTS "Admins can update company members"
ON public.company_members;

CREATE POLICY "Admins can update company members"
ON public.company_members
FOR UPDATE TO contractor_api
USING (
  private.is_active_platform_user()
  AND public.is_company_admin(company_id)
  AND (
    role <> 'owner'::public.company_role
    OR public.is_company_owner(company_id)
  )
)
WITH CHECK (
  private.is_active_platform_user()
  AND public.is_company_admin(company_id)
  AND (
    role <> 'owner'::public.company_role
    OR public.is_company_owner(company_id)
  )
);

DROP POLICY IF EXISTS "Owners can delete company members"
ON public.company_members;

CREATE POLICY "Owners can delete company members"
ON public.company_members
FOR DELETE TO contractor_api
USING (
  private.is_active_platform_user()
  AND public.is_company_owner(company_id)
  AND user_id <> app.current_user_id()
);

RESET ROLE;

COMMIT;
