-- =============================================================================
-- OPTIMIZACIONES GENERALES — Contractor App
-- Fecha: 2026-07-17
--
-- Esta migración corrige:
--   1. Aplicar política restrictiva approved_platform_users_only a invoices
--   2. Índices compuestos faltantes para queries frecuentes
--   3. Función atómica set_primary_client_address (sin race condition)
--   4. Función create_invoice usando next_document_number (sin race condition)
--   5. Eliminar trigger duplicado on_profile_created_link_client
--   6. Corregir handle_new_user con set search_path = ''
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Política restrictiva approved_platform_users_only para invoices
--
-- La tabla invoices se creó en 20260714040000 DESPUÉS del bloque que aplica
-- esta política, por lo que quedó sin ella. La añadimos aquí.
-- -----------------------------------------------------------------------------

alter table public.invoices enable row level security;

drop policy if exists "approved_platform_users_only" on public.invoices;
create policy "approved_platform_users_only"
on public.invoices
as restrictive
for all
to authenticated
using ((select private.is_active_platform_user()))
with check ((select private.is_active_platform_user()));

-- -----------------------------------------------------------------------------
-- 2. Índices compuestos faltantes
--
-- Añadidos para acelerar las queries más frecuentes del sistema.
-- Se usan IF NOT EXISTS para que sea idempotente.
-- -----------------------------------------------------------------------------

-- listProjectsByClient: .eq("company_id", ...).eq("client_id", ...)
create index if not exists projects_company_client_idx
on public.projects (company_id, client_id);

-- listProjectsByCompany: .eq("company_id", ...).order("created_at", ...)
create index if not exists projects_company_created_idx
on public.projects (company_id, created_at desc);

-- listBudgetsByProject: .eq("company_id", ...).eq("project_id", ...)
create index if not exists budgets_company_project_idx
on public.budgets (company_id, project_id);

-- listBudgetsByCompany: .eq("company_id", ...).order("created_at", ...)
create index if not exists budgets_company_created_idx
on public.budgets (company_id, created_at desc);

-- getBudgetById sections + items: .eq("company_id", ...).eq("budget_id", ...)
create index if not exists budget_sections_company_budget_idx
on public.budget_sections (company_id, budget_id, sort_order);

create index if not exists budget_items_company_budget_idx
on public.budget_items (company_id, budget_id, sort_order, created_at);

-- listClients: .eq("company_id", ...).eq("active", true).order("created_at", ...)
create index if not exists clients_company_active_created_idx
on public.clients (company_id, active, created_at desc)
where active = true;

-- listInvoices: .eq("company_id", ...).order("created_at", ...)
create index if not exists invoices_company_created_idx
on public.invoices (company_id, created_at desc);

-- getInvoiceByBudgetId: .eq("company_id", ...).eq("budget_id", ...)
create index if not exists invoices_company_budget_idx
on public.invoices (company_id, budget_id)
where budget_id is not null;

-- listPricingHistory: .eq("company_id", ...).order("effective_at", ...)
create index if not exists catalog_price_history_company_effective_idx
on public.catalog_price_history (company_id, effective_at desc);

-- -----------------------------------------------------------------------------
-- 3. Función atómica set_primary_client_address
--
-- Reemplaza el patrón de dos queries separadas (reset + set) que existía en
-- el cliente TypeScript. Una única transacción SQL garantiza atomicidad.
-- -----------------------------------------------------------------------------

create or replace function public.set_primary_client_address(
  p_company_id uuid,
  p_client_id  uuid,
  p_address_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Verificar que la cuenta del llamador está activa
  if not (select private.is_active_platform_user()) then
    raise exception 'La cuenta no está activa.' using errcode = '42501';
  end if;

  -- Verificar que la dirección pertenece al cliente y empresa indicados
  if not exists (
    select 1
    from public.client_addresses
    where id         = p_address_id
      and client_id  = p_client_id
      and company_id = p_company_id
  ) then
    raise exception 'La dirección no existe o no pertenece al cliente.'
      using errcode = 'P0002';
  end if;

  -- Quitar la marca de principal a todas las demás
  update public.client_addresses
  set is_primary = false,
      updated_at = now()
  where client_id  = p_client_id
    and company_id = p_company_id
    and id <> p_address_id;

  -- Marcar la seleccionada como principal
  update public.client_addresses
  set is_primary = true,
      updated_at = now()
  where id         = p_address_id
    and client_id  = p_client_id
    and company_id = p_company_id;
end;
$$;

revoke all on function public.set_primary_client_address(uuid, uuid, uuid) from public;
grant execute on function public.set_primary_client_address(uuid, uuid, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 4. Función create_invoice
--
-- Genera el número de factura de forma segura usando next_document_number
-- (ya existente para proyectos) dentro de una única transacción.
-- Elimina la race condition del cliente TypeScript donde dos llamadas
-- concurrentes calculaban el mismo número.
-- -----------------------------------------------------------------------------

create or replace function public.create_invoice(
  requested_company_id uuid,
  requested_client_id  uuid,
  requested_budget_id  uuid default null,
  requested_due_date   date default null,
  requested_notes      text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invoice_number text;
  v_invoice_id     uuid;
begin
  -- Verificar cuenta activa
  if not (select private.is_active_platform_user()) then
    raise exception 'La cuenta no está activa.' using errcode = '42501';
  end if;

  -- Verificar que el usuario pertenece a la empresa
  if not exists (
    select 1
    from public.company_members
    where company_id = requested_company_id
      and user_id    = (select auth.uid())
      and active     = true
  ) then
    raise exception 'No tienes acceso a esta empresa.' using errcode = '42501';
  end if;

  -- Verificar que el cliente pertenece a la empresa
  if not exists (
    select 1
    from public.clients
    where id         = requested_client_id
      and company_id = requested_company_id
      and active     = true
  ) then
    raise exception 'El cliente no existe o no pertenece a esta empresa.'
      using errcode = 'P0002';
  end if;

  -- Generar número de factura usando la secuencia atómica de la plataforma
  select public.next_document_number(requested_company_id, 'invoice')
  into v_invoice_number;

  -- Insertar la factura
  insert into public.invoices (
    company_id,
    client_id,
    budget_id,
    invoice_number,
    status,
    issue_date,
    due_date,
    notes
  )
  values (
    requested_company_id,
    requested_client_id,
    requested_budget_id,
    v_invoice_number,
    'pending',
    current_date,
    requested_due_date,
    nullif(btrim(coalesce(requested_notes, '')), '')
  )
  returning id into v_invoice_id;

  return v_invoice_id;
end;
$$;

revoke all on function public.create_invoice(uuid, uuid, uuid, date, text) from public;
grant execute on function public.create_invoice(uuid, uuid, uuid, date, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 5. Eliminar trigger duplicado on_profile_created_link_client
--
-- La migración 20260713000000 creó handle_client_auto_link sin case-insensitive.
-- La migración 20260713010000 corrigió la función pero el trigger sigue
-- apuntando a la versión antigua. Normalizamos a un único trigger.
-- -----------------------------------------------------------------------------

drop trigger if exists on_profile_created_link_client on public.profiles;

drop trigger if exists on_profile_created_link_client_case_insensitive on public.profiles;

-- Recrear el trigger apuntando siempre a la versión correcta (case-insensitive)
create trigger on_profile_created_link_client
after insert on public.profiles
for each row
execute function public.handle_client_auto_link();

-- -----------------------------------------------------------------------------
-- 6. Corregir handle_new_user — añadir set search_path = '' y cast seguro
--
-- La migración 20260715020000 redefinió handle_new_user sin set search_path,
-- lo cual la deja expuesta a inyección de search path. Esta versión corrige
-- eso y añade el cast seguro de role para que super_admin nunca pueda entrar
-- desde el registro público.
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  safe_role      public.global_user_role;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'contractor');

  -- Nunca confiar en user_metadata para conceder super_admin
  safe_role := case
    when requested_role = 'client'
      then 'client'::public.global_user_role
    else 'contractor'::public.global_user_role
  end;

  insert into public.profiles (
    id,
    full_name,
    first_name,
    last_name,
    phone,
    avatar_url,
    role,
    active,
    approved_at,
    approved_by,
    province,
    district,
    corregimiento,
    terms_accepted,
    notifications_opt_in,
    registration_ip,
    registration_device
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      concat(
        new.raw_user_meta_data ->> 'first_name',
        ' ',
        new.raw_user_meta_data ->> 'last_name'
      )
    ),
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url',
    safe_role,
    false,
    null,
    null,
    new.raw_user_meta_data ->> 'province',
    new.raw_user_meta_data ->> 'district',
    new.raw_user_meta_data ->> 'corregimiento',
    coalesce((new.raw_user_meta_data ->> 'terms_accepted')::boolean, false),
    coalesce((new.raw_user_meta_data ->> 'notifications_opt_in')::boolean, false),
    new.raw_user_meta_data ->> 'registration_ip',
    new.raw_user_meta_data ->> 'registration_device'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

commit;
