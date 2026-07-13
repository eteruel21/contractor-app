-- Protege los roles globales y habilita el acceso de solo lectura
-- para los clientes vinculados con su registro por correo electronico.

-- Los perfiles existentes siempre deben tener un rol valido.
UPDATE public.profiles
SET role = 'contractor'::public.global_user_role
WHERE role IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'contractor'::public.global_user_role,
  ALTER COLUMN role SET NOT NULL;

-- Nunca confiar en user_metadata para conceder super_admin.
-- El registro publico solo puede crear cuentas contractor o client.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  requested_role text;
  safe_role public.global_user_role;
BEGIN
  requested_role := COALESCE(
    new.raw_user_meta_data ->> 'role',
    'contractor'
  );

  safe_role := CASE
    WHEN requested_role = 'client'
      THEN 'client'::public.global_user_role
    ELSE 'contractor'::public.global_user_role
  END;

  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    avatar_url,
    role
  )
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url',
    safe_role
  );

  RETURN new;
END;
$function$;

-- Solo un super_admin autenticado puede cambiar roles desde la API.
-- Las ejecuciones administrativas sin JWT (migraciones/SQL editor)
-- siguen pudiendo gestionar el rol inicial del superadministrador.
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF new.role IS DISTINCT FROM old.role
    AND auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.profiles AS actor
      WHERE actor.id = auth.uid()
        AND actor.active = true
        AND actor.role = 'super_admin'::public.global_user_role
    )
  THEN
    RAISE EXCEPTION 'No tienes permiso para cambiar roles de usuario.'
      USING ERRCODE = '42501';
  END IF;

  RETURN new;
END;
$function$;

DROP TRIGGER IF EXISTS protect_profile_role
ON public.profiles;

CREATE TRIGGER protect_profile_role
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_unauthorized_profile_role_change();

-- Autoenlace tolerante a mayusculas y espacios en el correo.
CREATE OR REPLACE FUNCTION public.handle_client_auto_link()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  user_email text;
BEGIN
  IF new.role = 'client'::public.global_user_role THEN
    SELECT au.email
    INTO user_email
    FROM auth.users AS au
    WHERE au.id = new.id;

    IF user_email IS NOT NULL THEN
      UPDATE public.clients AS client
      SET user_id = new.id
      WHERE client.user_id IS NULL
        AND client.email IS NOT NULL
        AND lower(btrim(client.email)) = lower(btrim(user_email));
    END IF;
  END IF;

  RETURN new;
END;
$function$;

CREATE INDEX IF NOT EXISTS clients_user_id_idx
ON public.clients (user_id)
WHERE user_id IS NOT NULL;

-- RLS: cada cliente solo puede leer su propio vinculo y los datos
-- relacionados. Las politicas existentes de contratistas se conservan;
-- PostgreSQL combina estas politicas permisivas con OR.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own_profile
ON public.profiles;

CREATE POLICY profiles_select_own_profile
ON public.profiles
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS clients_select_own_link
ON public.clients;

CREATE POLICY clients_select_own_link
ON public.clients
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  AND active = true
);

DROP POLICY IF EXISTS companies_select_for_linked_client
ON public.companies;

CREATE POLICY companies_select_for_linked_client
ON public.companies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.clients AS client
    WHERE client.company_id = companies.id
      AND client.user_id = (SELECT auth.uid())
      AND client.active = true
  )
);

DROP POLICY IF EXISTS projects_select_for_linked_client
ON public.projects;

CREATE POLICY projects_select_for_linked_client
ON public.projects
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.clients AS client
    WHERE client.id = projects.client_id
      AND client.company_id = projects.company_id
      AND client.user_id = (SELECT auth.uid())
      AND client.active = true
  )
);

DROP POLICY IF EXISTS budgets_select_for_linked_client
ON public.budgets;

CREATE POLICY budgets_select_for_linked_client
ON public.budgets
FOR SELECT
TO authenticated
USING (
  status IN (
    'sent'::public.budget_status,
    'viewed'::public.budget_status,
    'approved'::public.budget_status,
    'rejected'::public.budget_status,
    'expired'::public.budget_status
  )
  AND EXISTS (
    SELECT 1
    FROM public.clients AS client
    WHERE client.id = budgets.client_id
      AND client.company_id = budgets.company_id
      AND client.user_id = (SELECT auth.uid())
      AND client.active = true
  )
);

DROP POLICY IF EXISTS budget_sections_select_for_linked_client
ON public.budget_sections;

CREATE POLICY budget_sections_select_for_linked_client
ON public.budget_sections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.budgets AS budget
    JOIN public.clients AS client
      ON client.id = budget.client_id
     AND client.company_id = budget.company_id
    WHERE budget.id = budget_sections.budget_id
      AND budget.company_id = budget_sections.company_id
      AND budget.status IN (
        'sent'::public.budget_status,
        'viewed'::public.budget_status,
        'approved'::public.budget_status,
        'rejected'::public.budget_status,
        'expired'::public.budget_status
      )
      AND client.user_id = (SELECT auth.uid())
      AND client.active = true
  )
);

DROP POLICY IF EXISTS budget_items_select_for_linked_client
ON public.budget_items;

CREATE POLICY budget_items_select_for_linked_client
ON public.budget_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.budgets AS budget
    JOIN public.clients AS client
      ON client.id = budget.client_id
     AND client.company_id = budget.company_id
    WHERE budget.id = budget_items.budget_id
      AND budget.company_id = budget_items.company_id
      AND budget.status IN (
        'sent'::public.budget_status,
        'viewed'::public.budget_status,
        'approved'::public.budget_status,
        'rejected'::public.budget_status,
        'expired'::public.budget_status
      )
      AND client.user_id = (SELECT auth.uid())
      AND client.active = true
  )
);

