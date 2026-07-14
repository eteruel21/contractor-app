begin;

-- Nuevas cuentas: primero se registran, luego un superadministrador las aprueba.
alter table public.profiles
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles(id) on delete set null;

update public.profiles
set approved_at = coalesce(approved_at, created_at)
where active = true
  and approved_at is null;

alter table public.profiles
  alter column active set default false,
  alter column active set not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  requested_role text;
  safe_role public.global_user_role;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'contractor');

  safe_role := case
    when requested_role = 'client'
      then 'client'::public.global_user_role
    else 'contractor'::public.global_user_role
  end;

  insert into public.profiles (
    id,
    full_name,
    phone,
    avatar_url,
    role,
    active,
    approved_at,
    approved_by
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url',
    safe_role,
    false,
    null,
    null
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;

-- Un usuario no puede aprobarse, reactivarse ni borrar la huella de aprobación.
create or replace function public.prevent_unauthorized_profile_approval_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if (
    new.active is distinct from old.active
    or new.approved_at is distinct from old.approved_at
    or new.approved_by is distinct from old.approved_by
  )
    and auth.uid() is not null
    and not exists (
      select 1
      from public.profiles as actor
      where actor.id = auth.uid()
        and actor.active = true
        and actor.role = 'super_admin'::public.global_user_role
    )
  then
    raise exception 'Solo un superadministrador puede cambiar la aprobación.'
      using errcode = '42501';
  end if;

  return new;
end;
$function$;

drop trigger if exists protect_profile_approval on public.profiles;
create trigger protect_profile_approval
before update of active, approved_at, approved_by on public.profiles
for each row
execute function public.prevent_unauthorized_profile_approval_change();

create schema if not exists private;

create or replace function private.is_active_platform_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and active = true
  );
$$;

revoke all on function private.is_active_platform_user() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_active_platform_user() to authenticated;

-- Impide que una cuenta pendiente consulte o modifique datos operativos.
do $block$
declare
  table_name text;
begin
  foreach table_name in array array[
    'companies',
    'company_members',
    'company_settings',
    'clients',
    'client_addresses',
    'client_contacts',
    'projects',
    'project_members',
    'budgets',
    'budget_sections',
    'budget_items',
    'budget_versions',
    'document_sequences',
    'catalog_categories',
    'catalog_items',
    'catalog_price_history',
    'catalog_yields',
    'units',
    'suppliers',
    'supplier_prices'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format(
        'drop policy if exists "approved_platform_users_only" on public.%I',
        table_name
      );
      execute format(
        'create policy "approved_platform_users_only" on public.%I as restrictive for all to authenticated using ((select private.is_active_platform_user())) with check ((select private.is_active_platform_user()))',
        table_name
      );
    end if;
  end loop;
end;
$block$;

-- El panel puede editar perfiles y datos maestros.
drop policy if exists "admin_web_super_admin_updates_profiles" on public.profiles;
create policy "admin_web_super_admin_updates_profiles"
on public.profiles
for update
to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

drop policy if exists "admin_web_super_admin_updates_companies" on public.companies;
create policy "admin_web_super_admin_updates_companies"
on public.companies
for update
to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

drop policy if exists "admin_web_super_admin_manages_categories" on public.catalog_categories;
create policy "admin_web_super_admin_manages_categories"
on public.catalog_categories
for all
to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

drop policy if exists "admin_web_super_admin_manages_items" on public.catalog_items;
create policy "admin_web_super_admin_manages_items"
on public.catalog_items
for all
to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

drop policy if exists "admin_web_super_admin_manages_units" on public.units;
create policy "admin_web_super_admin_manages_units"
on public.units
for all
to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

drop policy if exists "admin_web_super_admin_manages_yields" on public.catalog_yields;
create policy "admin_web_super_admin_manages_yields"
on public.catalog_yields
for all
to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

alter table public.catalog_price_history
  add column if not exists previous_unit_cost numeric,
  add column if not exists previous_sale_price numeric;

alter table public.catalog_price_history enable row level security;

drop policy if exists "admin_web_super_admin_reads_price_history" on public.catalog_price_history;
create policy "admin_web_super_admin_reads_price_history"
on public.catalog_price_history
for select
to authenticated
using ((select private.is_super_admin()));

drop policy if exists "admin_web_super_admin_adds_price_history" on public.catalog_price_history;
create policy "admin_web_super_admin_adds_price_history"
on public.catalog_price_history
for insert
to authenticated
with check ((select private.is_super_admin()));

grant update on public.profiles, public.companies to authenticated;
grant select, insert, update, delete on
  public.catalog_categories,
  public.catalog_items,
  public.units,
  public.catalog_yields
to authenticated;
grant select, insert on public.catalog_price_history to authenticated;

-- Parámetros del motor de cálculo editables sin publicar otra aplicación.
create table if not exists public.calculation_formulas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, code),
  unique (id, company_id),
  constraint calculation_formulas_code_format
    check (code = lower(code) and code ~ '^[a-z0-9_]+$')
);

create table if not exists public.calculation_formula_parameters (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  formula_id uuid not null,
  parameter_key text not null,
  label text not null,
  numeric_value numeric not null,
  unit_label text,
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calculation_formula_parameters_formula_fk
    foreign key (formula_id, company_id)
    references public.calculation_formulas(id, company_id)
    on delete cascade,
  unique (formula_id, parameter_key),
  constraint calculation_formula_parameters_key_format
    check (parameter_key = lower(parameter_key) and parameter_key ~ '^[a-z0-9_]+$')
);

create index if not exists calculation_formulas_company_idx
on public.calculation_formulas (company_id, active, name);

create index if not exists calculation_formula_parameters_formula_idx
on public.calculation_formula_parameters (formula_id, active, sort_order);

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists calculation_formulas_touch_updated_at
on public.calculation_formulas;
create trigger calculation_formulas_touch_updated_at
before update on public.calculation_formulas
for each row execute function private.touch_updated_at();

drop trigger if exists calculation_formula_parameters_touch_updated_at
on public.calculation_formula_parameters;
create trigger calculation_formula_parameters_touch_updated_at
before update on public.calculation_formula_parameters
for each row execute function private.touch_updated_at();

alter table public.calculation_formulas enable row level security;
alter table public.calculation_formula_parameters enable row level security;

drop policy if exists "company_members_read_calculation_formulas" on public.calculation_formulas;
create policy "company_members_read_calculation_formulas"
on public.calculation_formulas
for select
to authenticated
using (
  (select private.is_active_platform_user())
  and (
    (select private.is_super_admin())
    or exists (
      select 1
      from public.company_members
      where company_members.company_id = calculation_formulas.company_id
        and company_members.user_id = (select auth.uid())
        and company_members.active = true
    )
  )
);

drop policy if exists "company_members_read_calculation_parameters" on public.calculation_formula_parameters;
create policy "company_members_read_calculation_parameters"
on public.calculation_formula_parameters
for select
to authenticated
using (
  (select private.is_active_platform_user())
  and (
    (select private.is_super_admin())
    or exists (
      select 1
      from public.company_members
      where company_members.company_id = calculation_formula_parameters.company_id
        and company_members.user_id = (select auth.uid())
        and company_members.active = true
    )
  )
);

drop policy if exists "admin_web_super_admin_manages_calculation_formulas" on public.calculation_formulas;
create policy "admin_web_super_admin_manages_calculation_formulas"
on public.calculation_formulas
for all
to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

drop policy if exists "admin_web_super_admin_manages_calculation_parameters" on public.calculation_formula_parameters;
create policy "admin_web_super_admin_manages_calculation_parameters"
on public.calculation_formula_parameters
for all
to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

grant select, insert, update, delete on
  public.calculation_formulas,
  public.calculation_formula_parameters
to authenticated;

-- El cambio de precios siempre deja una huella auditable.
-- PostgreSQL no permite cambiar los valores predeterminados de parámetros
-- mediante CREATE OR REPLACE. Este bloque elimina cualquier sobrecarga que
-- pudiera existir de ejecuciones o versiones anteriores.
do $cleanup_price_functions$
declare
  function_record record;
begin
  for function_record in
    select p.oid::regprocedure as function_signature
    from pg_proc as p
    join pg_namespace as n
      on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'admin_adjust_catalog_prices',
        'admin_update_catalog_pricing'
      )
    order by
      case
        when p.proname = 'admin_adjust_catalog_prices' then 1
        else 2
      end
  loop
    execute format(
      'drop function if exists %s cascade',
      function_record.function_signature
    );
  end loop;
end;
$cleanup_price_functions$;

create or replace function public.admin_update_catalog_pricing(
  requested_company_id uuid,
  requested_item_id uuid,
  requested_unit_cost numeric,
  requested_sale_price numeric,
  requested_waste_percentage numeric,
  change_source text default 'panel_administrativo',
  change_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_item public.catalog_items%rowtype;
  allowed boolean;
begin
  select (select private.is_super_admin()) or exists (
    select 1
    from public.company_members
    join public.profiles on profiles.id = company_members.user_id
    where company_members.company_id = requested_company_id
      and company_members.user_id = (select auth.uid())
      and company_members.active = true
      and company_members.role in ('owner'::public.company_role, 'admin'::public.company_role)
      and profiles.active = true
  ) into allowed;

  if not coalesce(allowed, false) then
    raise exception 'No tienes permiso para editar estos precios.' using errcode = '42501';
  end if;

  if requested_unit_cost < 0 or requested_sale_price < 0
    or requested_waste_percentage < 0 or requested_waste_percentage > 100 then
    raise exception 'Los precios o el desperdicio no son válidos.' using errcode = '22023';
  end if;

  select * into current_item
  from public.catalog_items
  where id = requested_item_id
    and company_id = requested_company_id
  for update;

  if not found then
    raise exception 'El elemento del catálogo no existe.' using errcode = 'P0002';
  end if;

  update public.catalog_items
  set unit_cost = requested_unit_cost,
      sale_price = requested_sale_price,
      waste_percentage = requested_waste_percentage,
      updated_at = now()
  where id = requested_item_id
    and company_id = requested_company_id;

  insert into public.catalog_price_history (
    company_id,
    catalog_item_id,
    previous_unit_cost,
    previous_sale_price,
    unit_cost,
    sale_price,
    source,
    notes,
    changed_by,
    effective_at
  ) values (
    requested_company_id,
    requested_item_id,
    current_item.unit_cost,
    current_item.sale_price,
    requested_unit_cost,
    requested_sale_price,
    nullif(btrim(change_source), ''),
    nullif(btrim(change_notes), ''),
    (select auth.uid()),
    now()
  );
end;
$function$;

create or replace function public.admin_adjust_catalog_prices(
  requested_company_id uuid,
  requested_item_ids uuid[],
  requested_target text,
  requested_percentage numeric,
  change_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  item_record public.catalog_items%rowtype;
  next_unit_cost numeric;
  next_sale_price numeric;
begin
  if requested_target not in ('unit_cost', 'sale_price')
    or requested_percentage <= -100 then
    raise exception 'El ajuste solicitado no es válido.' using errcode = '22023';
  end if;

  for item_record in
    select *
    from public.catalog_items
    where company_id = requested_company_id
      and id = any(requested_item_ids)
    for update
  loop
    next_unit_cost := item_record.unit_cost;
    next_sale_price := item_record.sale_price;

    if requested_target = 'unit_cost' then
      next_unit_cost := round(item_record.unit_cost * (1 + requested_percentage / 100), 2);
    else
      next_sale_price := round(item_record.sale_price * (1 + requested_percentage / 100), 2);
    end if;

    perform public.admin_update_catalog_pricing(
      requested_company_id,
      item_record.id,
      next_unit_cost,
      next_sale_price,
      item_record.waste_percentage,
      'ajuste_porcentual',
      change_notes
    );
  end loop;
end;
$function$;

revoke all on function public.admin_update_catalog_pricing(uuid, uuid, numeric, numeric, numeric, text, text) from public;
revoke all on function public.admin_adjust_catalog_prices(uuid, uuid[], text, numeric, text) from public;
grant execute on function public.admin_update_catalog_pricing(uuid, uuid, numeric, numeric, numeric, text, text) to authenticated;
grant execute on function public.admin_adjust_catalog_prices(uuid, uuid[], text, numeric, text) to authenticated;

-- Configuración predeterminada del cálculo de concreto para empresas actuales y futuras.
create or replace function private.seed_company_calculation_defaults(
  requested_company_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  concrete_formula_id uuid;
begin
  insert into public.calculation_formulas (
    company_id,
    code,
    name,
    description
  )
  values (
    requested_company_id,
    'concrete_standard',
    'Concreto',
    'Factores técnicos usados para volumen seco, cemento y agregados.'
  )
  on conflict (company_id, code) do nothing;

  select id into concrete_formula_id
  from public.calculation_formulas
  where company_id = requested_company_id
    and code = 'concrete_standard';

  insert into public.calculation_formula_parameters (
    company_id,
    formula_id,
    parameter_key,
    label,
    numeric_value,
    unit_label,
    description,
    sort_order
  )
  select
    requested_company_id,
    concrete_formula_id,
    seed.parameter_key,
    seed.label,
    seed.numeric_value,
    seed.unit_label,
    seed.description,
    seed.sort_order
  from (
    values
      ('cement_density_kg_m3', 'Densidad del cemento', 1440::numeric, 'kg/m³', 'Densidad aparente usada para convertir volumen de cemento a peso.', 10),
      ('dry_volume_factor', 'Factor de volumen seco', 1.54::numeric, 'factor', 'Convierte el volumen húmedo de concreto a materiales secos.', 20),
      ('aggregate_bag_volume_m3', 'Volumen por saco de agregado', 0.0142::numeric, 'm³', 'Volumen predeterminado de un saco de arena o gravilla.', 30)
  ) as seed(parameter_key, label, numeric_value, unit_label, description, sort_order)
  on conflict (formula_id, parameter_key) do nothing;
end;
$function$;

revoke all on function private.seed_company_calculation_defaults(uuid)
from public;

create or replace function private.handle_company_calculation_defaults()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  perform private.seed_company_calculation_defaults(new.id);
  return new;
end;
$function$;

revoke all on function private.handle_company_calculation_defaults()
from public;

drop trigger if exists seed_company_calculation_defaults
on public.companies;
create trigger seed_company_calculation_defaults
after insert on public.companies
for each row
execute function private.handle_company_calculation_defaults();

select private.seed_company_calculation_defaults(companies.id)
from public.companies;

commit;
