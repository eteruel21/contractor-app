BEGIN;

GRANT SELECT ON app_auth.users TO contractor_owner;

SET ROLE contractor_owner;

-- 1. Robustecer private.is_active_platform_user()
CREATE OR REPLACE FUNCTION private.is_active_platform_user()
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN app_auth.users u ON u.id = p.id
    WHERE p.id = (SELECT app.current_user_id())
      AND p.active = true
      AND p.approved_at IS NOT NULL
      AND u.email_confirmed_at IS NOT NULL
      AND u.deleted_at IS NULL
  );
$$;

REVOKE EXECUTE ON FUNCTION private.is_active_platform_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_active_platform_user() TO contractor_api, contractor_migrator;


-- 2. Crear helper public.has_company_role
CREATE OR REPLACE FUNCTION public.has_company_role(requested_company_id uuid, allowed_roles public.company_role[])
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = requested_company_id
      AND cm.user_id = app.current_user_id()
      AND cm.active = true
      AND cm.role = ANY(allowed_roles)
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_company_role(uuid, public.company_role[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_company_role(uuid, public.company_role[]) TO contractor_api, contractor_migrator;

-- 3. Corregir public.create_company (T-027)
CREATE OR REPLACE FUNCTION public.create_company(company_name text, company_phone text DEFAULT NULL::text, company_email text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
declare
  new_company_id uuid;
  clean_name text;
begin
  if app.current_user_id() is null then
    raise exception 'Usuario no autenticado.';
  end if;

  -- Comprobar usuario activo y aprobado
  if not exists (
    SELECT 1 
    FROM public.profiles p
    JOIN app_auth.users u ON u.id = p.id
    WHERE p.id = app.current_user_id()
      AND p.active = true 
      AND p.approved_at is not null
      AND u.email_confirmed_at is not null
      AND u.deleted_at is null
  ) then
    raise exception 'Tu cuenta debe estar confirmada, activa y aprobada para crear una empresa.';
  end if;

  clean_name := trim(company_name);

  if clean_name is null or char_length(clean_name) < 2 then
    raise exception 'El nombre de la empresa es obligatorio.';
  end if;

  insert into public.companies (
    name,
    phone,
    email,
    created_by
  )
  values (
    clean_name,
    nullif(trim(company_phone), ''),
    nullif(lower(trim(company_email)), ''),
    app.current_user_id()
  )
  returning id into new_company_id;

  insert into public.company_members (
    company_id,
    user_id,
    role,
    active
  )
  values (
    new_company_id,
    app.current_user_id(),
    'owner'::public.company_role,
    true
  );

  insert into public.document_sequences (
    company_id,
    document_type,
    prefix,
    current_number,
    padding,
    yearly_reset,
    last_reset_year
  )
  values
    (new_company_id, 'budget'::public.document_type, 'COT', 0, 6, false, extract(year from now())::integer),
    (new_company_id, 'invoice'::public.document_type, 'FAC', 0, 6, false, extract(year from now())::integer);

  return new_company_id;
end;
$$;

-- 4. Cambiar funciones de mutación y consultas comerciales a SECURITY INVOKER
ALTER FUNCTION public.create_company(text, text, text) SECURITY DEFINER;
ALTER FUNCTION public.create_project_budget(uuid, uuid, text) SECURITY INVOKER;
ALTER FUNCTION public.create_invoice(uuid, uuid, uuid, date, text) SECURITY INVOKER;
ALTER FUNCTION public.update_contractor_profile(text, text, text, text, text, text[], integer, text[], text, text, text[], text[], text, text, boolean, boolean, text, text, text, text[], text, text) SECURITY INVOKER;
ALTER FUNCTION public.set_personal_catalog_pricing(uuid, numeric, numeric, numeric) SECURITY INVOKER;
ALTER FUNCTION public.reset_personal_catalog_pricing(uuid) SECURITY INVOKER;
ALTER FUNCTION public.seed_default_units(uuid) SECURITY INVOKER;
ALTER FUNCTION public.seed_default_catalog(uuid) SECURITY INVOKER;
ALTER FUNCTION public.admin_update_catalog_pricing(uuid, uuid, numeric, numeric, numeric, text, text) SECURITY INVOKER;
ALTER FUNCTION public.admin_adjust_catalog_prices(uuid, uuid[], text, numeric, text) SECURITY INVOKER;
ALTER FUNCTION public.admin_update_platform_catalog_pricing(uuid, numeric, numeric, numeric, text, text) SECURITY INVOKER;
ALTER FUNCTION public.admin_adjust_platform_catalog_prices(uuid[], text, numeric, text) SECURITY INVOKER;
ALTER FUNCTION public.admin_save_catalog_item(uuid, uuid, text, text, text, public.catalog_item_type, uuid, uuid, numeric, numeric, numeric, boolean) SECURITY INVOKER;
ALTER FUNCTION public.admin_save_formula(uuid, uuid, text, text, text, boolean, jsonb) SECURITY INVOKER;
ALTER FUNCTION public.admin_update_formula_parameter(uuid, uuid, uuid, text, text, numeric, text, numeric, numeric, numeric, integer, text) SECURITY INVOKER;

-- 5. Asegurar search_path y privilegios para las funciones SECURITY DEFINER restantes (T-028 & T-029)
ALTER FUNCTION private.is_super_admin() SET search_path = '';
REVOKE EXECUTE ON FUNCTION private.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_super_admin() TO contractor_api, contractor_migrator;

ALTER FUNCTION public.is_company_admin(uuid) SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.is_company_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_company_admin(uuid) TO contractor_api, contractor_migrator;

ALTER FUNCTION public.is_company_member(uuid) SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.is_company_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_company_member(uuid) TO contractor_api, contractor_migrator;

ALTER FUNCTION public.is_company_owner(uuid) SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.is_company_owner(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_company_owner(uuid) TO contractor_api, contractor_migrator;

ALTER FUNCTION public.handle_new_user() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO contractor_api, contractor_migrator;

ALTER FUNCTION public.handle_client_auto_link() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.handle_client_auto_link() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_client_auto_link() TO contractor_api, contractor_migrator;

ALTER FUNCTION public.prevent_unauthorized_profile_approval_change() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.prevent_unauthorized_profile_approval_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prevent_unauthorized_profile_approval_change() TO contractor_api, contractor_migrator;

ALTER FUNCTION public.prevent_unauthorized_profile_role_change() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.prevent_unauthorized_profile_role_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prevent_unauthorized_profile_role_change() TO contractor_api, contractor_migrator;

ALTER FUNCTION public.record_catalog_price_history() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.record_catalog_price_history() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_catalog_price_history() TO contractor_api, contractor_migrator;

ALTER FUNCTION public.seed_units_after_company_insert() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.seed_units_after_company_insert() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_units_after_company_insert() TO contractor_api, contractor_migrator;

ALTER FUNCTION public.trigger_recalculate_budget_totals() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.trigger_recalculate_budget_totals() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_recalculate_budget_totals() TO contractor_api, contractor_migrator;

-- 6. Actualizar políticas RLS de Facturas (T-030)
DROP POLICY IF EXISTS invoices_select_policy ON public.invoices;
CREATE POLICY invoices_select_policy
ON public.invoices
FOR SELECT
TO contractor_api
USING (
  EXISTS (
    SELECT 1
    FROM public.company_members AS membership
    JOIN public.profiles AS p ON p.id = membership.user_id
    WHERE membership.company_id = invoices.company_id
      AND membership.user_id = app.current_user_id()
      AND membership.active = true
      AND p.active = true
      AND p.approved_at IS NOT NULL
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.clients AS customer
    JOIN public.profiles AS p ON p.id = customer.user_id
    WHERE customer.id = invoices.client_id
      AND customer.user_id = app.current_user_id()
      AND customer.active = true
      AND p.active = true
  )
);

DROP POLICY IF EXISTS invoices_insert_policy ON public.invoices;
CREATE POLICY invoices_insert_policy
ON public.invoices
FOR INSERT
TO contractor_api
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.company_members AS membership
    JOIN public.profiles AS p ON p.id = membership.user_id
    WHERE membership.company_id = invoices.company_id
      AND membership.user_id = app.current_user_id()
      AND membership.active = true
      AND p.active = true
      AND p.approved_at IS NOT NULL
  )
);

DROP POLICY IF EXISTS invoices_update_policy ON public.invoices;
CREATE POLICY invoices_update_policy
ON public.invoices
FOR UPDATE
TO contractor_api
USING (
  EXISTS (
    SELECT 1
    FROM public.company_members AS membership
    JOIN public.profiles AS p ON p.id = membership.user_id
    WHERE membership.company_id = invoices.company_id
      AND membership.user_id = app.current_user_id()
      AND membership.active = true
      AND p.active = true
      AND p.approved_at IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.company_members AS membership
    JOIN public.profiles AS p ON p.id = membership.user_id
    WHERE membership.company_id = invoices.company_id
      AND membership.user_id = app.current_user_id()
      AND membership.active = true
      AND p.active = true
      AND p.approved_at IS NOT NULL
  )
);

DROP POLICY IF EXISTS invoices_delete_policy ON public.invoices;
CREATE POLICY invoices_delete_policy
ON public.invoices
FOR DELETE
TO contractor_api
USING (
  EXISTS (
    SELECT 1
    FROM public.company_members AS membership
    JOIN public.profiles AS p ON p.id = membership.user_id
    WHERE membership.company_id = invoices.company_id
      AND membership.user_id = app.current_user_id()
      AND membership.active = true
      AND p.active = true
      AND p.approved_at IS NOT NULL
  )
);

-- 7. Actualizar políticas RLS de otras tablas según la matriz de permisos (T-033)

-- Catalog categories and items RLS updates
DROP POLICY IF EXISTS "Admins can insert catalog categories" ON public.catalog_categories;
CREATE POLICY "Admins can insert catalog categories"
ON public.catalog_categories FOR INSERT TO contractor_api
WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role]));

DROP POLICY IF EXISTS "Admins can update catalog categories" ON public.catalog_categories;
CREATE POLICY "Admins can update catalog categories"
ON public.catalog_categories FOR UPDATE TO contractor_api
USING (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role]))
WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role]));

DROP POLICY IF EXISTS "Admins can delete catalog categories" ON public.catalog_categories;
CREATE POLICY "Admins can delete catalog categories"
ON public.catalog_categories FOR DELETE TO contractor_api
USING (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role]));


DROP POLICY IF EXISTS "Admins can insert catalog items" ON public.catalog_items;
CREATE POLICY "Admins can insert catalog items"
ON public.catalog_items FOR INSERT TO contractor_api
WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role]));

DROP POLICY IF EXISTS "Admins can update catalog items" ON public.catalog_items;
CREATE POLICY "Admins can update catalog items"
ON public.catalog_items FOR UPDATE TO contractor_api
USING (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role]))
WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role]));

DROP POLICY IF EXISTS "Admins can delete catalog items" ON public.catalog_items;
CREATE POLICY "Admins can delete catalog items"
ON public.catalog_items FOR DELETE TO contractor_api
USING (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role]));


-- Clients RLS updates
DROP POLICY IF EXISTS "Admins can delete clients" ON public.clients;
CREATE POLICY "Admins can delete clients"
ON public.clients FOR DELETE TO contractor_api
USING (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role]));

DROP POLICY IF EXISTS "Admins can update clients" ON public.clients;
CREATE POLICY "Admins can update clients"
ON public.clients FOR UPDATE TO contractor_api
USING (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'sales'::public.company_role]))
WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'sales'::public.company_role]));

DROP POLICY IF EXISTS "Members can insert clients" ON public.clients;
CREATE POLICY "Members can insert clients"
ON public.clients FOR INSERT TO contractor_api
WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'sales'::public.company_role]));


-- Projects RLS updates
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects"
ON public.projects FOR DELETE TO contractor_api
USING (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role]));

DROP POLICY IF EXISTS "Members can update projects" ON public.projects;
CREATE POLICY "Members can update projects"
ON public.projects FOR UPDATE TO contractor_api
USING (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role]))
WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role]));

DROP POLICY IF EXISTS "Members can insert projects" ON public.projects;
CREATE POLICY "Members can insert projects"
ON public.projects FOR INSERT TO contractor_api
WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role]));


-- Budgets RLS updates
DROP POLICY IF EXISTS "Admins can delete budgets" ON public.budgets;
CREATE POLICY "Admins can delete budgets"
ON public.budgets FOR DELETE TO contractor_api
USING (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role]));

DROP POLICY IF EXISTS "Members can update budgets" ON public.budgets;
CREATE POLICY "Members can update budgets"
ON public.budgets FOR UPDATE TO contractor_api
USING (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'sales'::public.company_role]))
WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'sales'::public.company_role]));

DROP POLICY IF EXISTS "Members can insert budgets" ON public.budgets;
CREATE POLICY "Members can insert budgets"
ON public.budgets FOR INSERT TO contractor_api
WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role]));

COMMIT;
