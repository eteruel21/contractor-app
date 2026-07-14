begin;

-- Catálogo de precios maestro de la plataforma.
-- No pertenece a ninguna empresa: el superadministrador mantiene los valores
-- predeterminados y cada usuario puede guardar únicamente sus propios ajustes.
create table if not exists public.platform_catalog_items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  sku text,
  name text not null,
  description text,
  item_type public.catalog_item_type not null default 'material',
  category_name text,
  unit_name text not null default 'Unidad',
  unit_symbol text not null default 'und.',
  default_unit_cost numeric not null default 0,
  default_sale_price numeric not null default 0,
  default_waste_percentage numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_catalog_items_code_format
    check (code = lower(code) and code ~ '^[a-z0-9_:.-]+$'),
  constraint platform_catalog_items_default_unit_cost_check
    check (default_unit_cost >= 0),
  constraint platform_catalog_items_default_sale_price_check
    check (default_sale_price >= 0),
  constraint platform_catalog_items_default_waste_check
    check (
      default_waste_percentage >= 0
      and default_waste_percentage <= 100
    )
);

create unique index if not exists platform_catalog_items_identity_idx
on public.platform_catalog_items (
  lower(name),
  item_type,
  lower(unit_symbol)
);

create index if not exists platform_catalog_items_active_type_idx
on public.platform_catalog_items (active, item_type, name);

-- Conserva el catálogo ya creado, pero elimina la dependencia de company_id.
-- Si varias empresas tienen el mismo concepto, se toma una sola definición.
insert into public.platform_catalog_items (
  code,
  sku,
  name,
  description,
  item_type,
  category_name,
  unit_name,
  unit_symbol,
  default_unit_cost,
  default_sale_price,
  default_waste_percentage,
  active
)
select
  'legacy:' || md5(
    concat_ws(
      '|',
      lower(btrim(catalog_items.name)),
      catalog_items.item_type::text,
      lower(btrim(catalog_items.unit_symbol))
    )
  ),
  nullif(btrim(catalog_items.sku), ''),
  catalog_items.name,
  catalog_items.description,
  catalog_items.item_type,
  catalog_categories.name,
  catalog_items.unit_name,
  catalog_items.unit_symbol,
  catalog_items.unit_cost,
  catalog_items.sale_price,
  catalog_items.waste_percentage,
  catalog_items.active
from (
  select distinct on (
    lower(btrim(source_items.name)),
    source_items.item_type,
    lower(btrim(source_units.symbol))
  )
    source_items.*,
    source_units.name as unit_name,
    source_units.symbol as unit_symbol
  from public.catalog_items as source_items
  join public.units as source_units
    on source_units.id = source_items.unit_id
   and source_units.company_id = source_items.company_id
  order by
    lower(btrim(source_items.name)),
    source_items.item_type,
    lower(btrim(source_units.symbol)),
    source_items.active desc,
    source_items.updated_at desc
) as catalog_items
left join public.catalog_categories
  on catalog_categories.id = catalog_items.category_id
 and catalog_categories.company_id = catalog_items.company_id
on conflict do nothing;

create table if not exists public.user_catalog_price_overrides (
  user_id uuid not null references public.profiles(id) on delete cascade,
  catalog_item_id uuid not null
    references public.platform_catalog_items(id) on delete cascade,
  unit_cost numeric not null,
  sale_price numeric not null,
  waste_percentage numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, catalog_item_id),
  constraint user_catalog_price_overrides_unit_cost_check
    check (unit_cost >= 0),
  constraint user_catalog_price_overrides_sale_price_check
    check (sale_price >= 0),
  constraint user_catalog_price_overrides_waste_check
    check (waste_percentage >= 0 and waste_percentage <= 100)
);

create index if not exists user_catalog_price_overrides_item_idx
on public.user_catalog_price_overrides (catalog_item_id);

create table if not exists public.platform_catalog_price_history (
  id uuid primary key default gen_random_uuid(),
  catalog_item_id uuid not null
    references public.platform_catalog_items(id) on delete cascade,
  previous_unit_cost numeric not null,
  previous_sale_price numeric not null,
  previous_waste_percentage numeric not null,
  unit_cost numeric not null,
  sale_price numeric not null,
  waste_percentage numeric not null,
  source text,
  notes text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists platform_catalog_price_history_item_idx
on public.platform_catalog_price_history (catalog_item_id, created_at desc);

drop trigger if exists platform_catalog_items_touch_updated_at
on public.platform_catalog_items;
create trigger platform_catalog_items_touch_updated_at
before update on public.platform_catalog_items
for each row execute function private.touch_updated_at();

drop trigger if exists user_catalog_price_overrides_touch_updated_at
on public.user_catalog_price_overrides;
create trigger user_catalog_price_overrides_touch_updated_at
before update on public.user_catalog_price_overrides
for each row execute function private.touch_updated_at();

alter table public.platform_catalog_items enable row level security;
alter table public.user_catalog_price_overrides enable row level security;
alter table public.platform_catalog_price_history enable row level security;

drop policy if exists "active_users_read_platform_catalog"
on public.platform_catalog_items;
create policy "active_users_read_platform_catalog"
on public.platform_catalog_items
for select
to authenticated
using (
  (select private.is_active_platform_user())
  and (active = true or (select private.is_super_admin()))
);

drop policy if exists "super_admin_manages_platform_catalog"
on public.platform_catalog_items;
create policy "super_admin_manages_platform_catalog"
on public.platform_catalog_items
for all
to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

drop policy if exists "users_read_own_catalog_overrides"
on public.user_catalog_price_overrides;
create policy "users_read_own_catalog_overrides"
on public.user_catalog_price_overrides
for select
to authenticated
using (
  (select private.is_active_platform_user())
  and user_id = (select auth.uid())
);

drop policy if exists "users_insert_own_catalog_overrides"
on public.user_catalog_price_overrides;
create policy "users_insert_own_catalog_overrides"
on public.user_catalog_price_overrides
for insert
to authenticated
with check (
  (select private.is_active_platform_user())
  and user_id = (select auth.uid())
);

drop policy if exists "users_update_own_catalog_overrides"
on public.user_catalog_price_overrides;
create policy "users_update_own_catalog_overrides"
on public.user_catalog_price_overrides
for update
to authenticated
using (user_id = (select auth.uid()))
with check (
  (select private.is_active_platform_user())
  and user_id = (select auth.uid())
);

drop policy if exists "users_delete_own_catalog_overrides"
on public.user_catalog_price_overrides;
create policy "users_delete_own_catalog_overrides"
on public.user_catalog_price_overrides
for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "super_admin_reads_platform_price_history"
on public.platform_catalog_price_history;
create policy "super_admin_reads_platform_price_history"
on public.platform_catalog_price_history
for select
to authenticated
using ((select private.is_super_admin()));

grant select on public.platform_catalog_items to authenticated;
grant select, insert, update, delete
on public.user_catalog_price_overrides to authenticated;
grant select on public.platform_catalog_price_history to authenticated;

-- Un usuario consulta siempre el precio efectivo y también el predeterminado.
-- De este modo, un ajuste personal nunca oculta cuál es el valor maestro.
create or replace view public.effective_platform_catalog_prices
with (security_invoker = true)
as
select
  catalog.id,
  catalog.code,
  catalog.sku,
  catalog.name,
  catalog.description,
  catalog.item_type,
  catalog.category_name,
  catalog.unit_name,
  catalog.unit_symbol,
  catalog.default_unit_cost,
  catalog.default_sale_price,
  catalog.default_waste_percentage,
  coalesce(overrides.unit_cost, catalog.default_unit_cost) as unit_cost,
  coalesce(overrides.sale_price, catalog.default_sale_price) as sale_price,
  coalesce(
    overrides.waste_percentage,
    catalog.default_waste_percentage
  ) as waste_percentage,
  (overrides.catalog_item_id is not null) as has_override,
  catalog.active,
  catalog.updated_at,
  overrides.updated_at as override_updated_at
from public.platform_catalog_items as catalog
left join public.user_catalog_price_overrides as overrides
  on overrides.catalog_item_id = catalog.id
 and overrides.user_id = (select auth.uid());

grant select on public.effective_platform_catalog_prices to authenticated;

create or replace function public.set_personal_catalog_pricing(
  requested_item_id uuid,
  requested_unit_cost numeric,
  requested_sale_price numeric,
  requested_waste_percentage numeric
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not (select private.is_active_platform_user()) then
    raise exception 'La cuenta no está activa.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.platform_catalog_items
    where id = requested_item_id
      and active = true
  ) then
    raise exception 'El concepto no existe o está inactivo.'
      using errcode = 'P0002';
  end if;

  if requested_unit_cost < 0
    or requested_sale_price < 0
    or requested_waste_percentage < 0
    or requested_waste_percentage > 100
  then
    raise exception 'Los precios o el desperdicio no son válidos.'
      using errcode = '22023';
  end if;

  insert into public.user_catalog_price_overrides (
    user_id,
    catalog_item_id,
    unit_cost,
    sale_price,
    waste_percentage
  )
  values (
    (select auth.uid()),
    requested_item_id,
    requested_unit_cost,
    requested_sale_price,
    requested_waste_percentage
  )
  on conflict (user_id, catalog_item_id)
  do update set
    unit_cost = excluded.unit_cost,
    sale_price = excluded.sale_price,
    waste_percentage = excluded.waste_percentage,
    updated_at = now();
end;
$function$;

create or replace function public.reset_personal_catalog_pricing(
  requested_item_id uuid
)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.user_catalog_price_overrides
  where user_id = (select auth.uid())
    and catalog_item_id = requested_item_id;
$$;

create or replace function public.admin_update_platform_catalog_pricing(
  requested_item_id uuid,
  requested_unit_cost numeric,
  requested_sale_price numeric,
  requested_waste_percentage numeric,
  change_source text default 'panel_super_admin',
  change_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_item public.platform_catalog_items%rowtype;
begin
  if not (select private.is_super_admin()) then
    raise exception 'Solo un superadministrador puede cambiar precios globales.'
      using errcode = '42501';
  end if;

  if requested_unit_cost < 0
    or requested_sale_price < 0
    or requested_waste_percentage < 0
    or requested_waste_percentage > 100
  then
    raise exception 'Los precios o el desperdicio no son válidos.'
      using errcode = '22023';
  end if;

  select * into current_item
  from public.platform_catalog_items
  where id = requested_item_id
  for update;

  if not found then
    raise exception 'El concepto global no existe.' using errcode = 'P0002';
  end if;

  update public.platform_catalog_items
  set default_unit_cost = requested_unit_cost,
      default_sale_price = requested_sale_price,
      default_waste_percentage = requested_waste_percentage,
      updated_at = now()
  where id = requested_item_id;

  insert into public.platform_catalog_price_history (
    catalog_item_id,
    previous_unit_cost,
    previous_sale_price,
    previous_waste_percentage,
    unit_cost,
    sale_price,
    waste_percentage,
    source,
    notes,
    changed_by
  ) values (
    requested_item_id,
    current_item.default_unit_cost,
    current_item.default_sale_price,
    current_item.default_waste_percentage,
    requested_unit_cost,
    requested_sale_price,
    requested_waste_percentage,
    nullif(btrim(change_source), ''),
    nullif(btrim(change_notes), ''),
    (select auth.uid())
  );
end;
$function$;

create or replace function public.admin_adjust_platform_catalog_prices(
  requested_item_ids uuid[],
  requested_target text,
  requested_percentage numeric,
  change_notes text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  updated_count integer := 0;
begin
  if not (select private.is_super_admin()) then
    raise exception 'Solo un superadministrador puede cambiar precios globales.'
      using errcode = '42501';
  end if;

  if requested_target not in ('unit_cost', 'sale_price')
    or requested_percentage <= -100
  then
    raise exception 'El ajuste solicitado no es válido.'
      using errcode = '22023';
  end if;

  with locked_items as (
    select id, default_unit_cost, default_sale_price, default_waste_percentage
    from public.platform_catalog_items
    where id = any(requested_item_ids)
      and active = true
    for update
  ),
  updated_items as (
    update public.platform_catalog_items p
    set
      default_unit_cost = case 
        when requested_target = 'unit_cost' then round(l.default_unit_cost * (1 + requested_percentage / 100), 2)
        else l.default_unit_cost
      end,
      default_sale_price = case 
        when requested_target = 'sale_price' then round(l.default_sale_price * (1 + requested_percentage / 100), 2)
        else l.default_sale_price
      end,
      updated_at = now()
    from locked_items l
    where p.id = l.id
    returning 
      p.id,
      l.default_unit_cost as prev_unit_cost,
      l.default_sale_price as prev_sale_price,
      l.default_waste_percentage as prev_waste_percentage,
      p.default_unit_cost as new_unit_cost,
      p.default_sale_price as new_sale_price,
      p.default_waste_percentage as new_waste_percentage
  ),
  inserted_history as (
    insert into public.platform_catalog_price_history (
      catalog_item_id,
      previous_unit_cost,
      previous_sale_price,
      previous_waste_percentage,
      unit_cost,
      sale_price,
      waste_percentage,
      source,
      notes,
      changed_by
    )
    select 
      id,
      prev_unit_cost,
      prev_sale_price,
      prev_waste_percentage,
      new_unit_cost,
      new_sale_price,
      new_waste_percentage,
      'ajuste_porcentual_global',
      nullif(btrim(change_notes), ''),
      (select auth.uid())
    from updated_items
  )
  select count(*) into updated_count from updated_items;

  return updated_count;
end;
$function$;

revoke all on function public.set_personal_catalog_pricing(
  uuid, numeric, numeric, numeric
) from public;
revoke all on function public.reset_personal_catalog_pricing(uuid) from public;
revoke all on function public.admin_update_platform_catalog_pricing(
  uuid, numeric, numeric, numeric, text, text
) from public;
revoke all on function public.admin_adjust_platform_catalog_prices(
  uuid[], text, numeric, text
) from public;

grant execute on function public.set_personal_catalog_pricing(
  uuid, numeric, numeric, numeric
) to authenticated;
grant execute on function public.reset_personal_catalog_pricing(uuid)
to authenticated;
grant execute on function public.admin_update_platform_catalog_pricing(
  uuid, numeric, numeric, numeric, text, text
) to authenticated;
grant execute on function public.admin_adjust_platform_catalog_prices(
  uuid[], text, numeric, text
) to authenticated;

commit;
