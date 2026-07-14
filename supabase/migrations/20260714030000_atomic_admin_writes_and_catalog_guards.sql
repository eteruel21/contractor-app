begin;

alter table public.budget_items
  add column if not exists platform_catalog_item_id uuid
  references public.platform_catalog_items(id) on delete set null;

create index if not exists budget_items_platform_catalog_item_idx
on public.budget_items (platform_catalog_item_id);

create or replace function public.admin_save_catalog_item(
  requested_item_id uuid,
  requested_company_id uuid,
  requested_sku text,
  requested_name text,
  requested_description text,
  requested_item_type public.catalog_item_type,
  requested_category_id uuid,
  requested_unit_id uuid,
  requested_unit_cost numeric,
  requested_sale_price numeric,
  requested_waste_percentage numeric,
  requested_active boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  saved_id uuid;
  previous_item public.catalog_items%rowtype;
begin
  if not (select private.is_super_admin()) then
    raise exception 'Solo un superadministrador puede guardar el catálogo.' using errcode = '42501';
  end if;
  if nullif(btrim(requested_name), '') is null or requested_unit_id is null then
    raise exception 'El nombre y la unidad son obligatorios.' using errcode = '22023';
  end if;
  if requested_unit_cost < 0 or requested_sale_price < 0
    or requested_waste_percentage not between 0 and 100 then
    raise exception 'Los precios o el desperdicio no son válidos.' using errcode = '22023';
  end if;

  if requested_item_id is null then
    insert into public.catalog_items (
      company_id, sku, name, description, item_type, category_id, unit_id,
      unit_cost, sale_price, waste_percentage, active
    ) values (
      requested_company_id, nullif(btrim(requested_sku), ''), btrim(requested_name),
      nullif(btrim(requested_description), ''), requested_item_type,
      requested_category_id, requested_unit_id, requested_unit_cost,
      requested_sale_price, requested_waste_percentage, requested_active
    ) returning id into saved_id;
    return saved_id;
  end if;

  select * into previous_item from public.catalog_items
  where id = requested_item_id and company_id = requested_company_id for update;
  if not found then
    raise exception 'El elemento del catálogo no existe.' using errcode = 'P0002';
  end if;

  update public.catalog_items set
    sku = nullif(btrim(requested_sku), ''), name = btrim(requested_name),
    description = nullif(btrim(requested_description), ''),
    item_type = requested_item_type, category_id = requested_category_id,
    unit_id = requested_unit_id, unit_cost = requested_unit_cost,
    sale_price = requested_sale_price,
    waste_percentage = requested_waste_percentage, active = requested_active,
    updated_at = now()
  where id = requested_item_id and company_id = requested_company_id;

  if (previous_item.unit_cost, previous_item.sale_price, previous_item.waste_percentage)
    is distinct from (requested_unit_cost, requested_sale_price, requested_waste_percentage) then
    insert into public.catalog_price_history (
      company_id, catalog_item_id, previous_unit_cost, previous_sale_price,
      unit_cost, sale_price, source, notes, changed_by, effective_at
    ) values (
      requested_company_id, requested_item_id, previous_item.unit_cost,
      previous_item.sale_price, requested_unit_cost, requested_sale_price,
      'panel_super_admin', 'Edición atómica desde el panel central',
      (select auth.uid()), now()
    );
  end if;
  return requested_item_id;
end;
$function$;

create or replace function public.admin_save_formula(
  requested_formula_id uuid,
  requested_company_id uuid,
  requested_code text,
  requested_name text,
  requested_description text,
  requested_active boolean,
  requested_parameters jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare saved_id uuid;
begin
  if not (select private.is_super_admin()) then
    raise exception 'Solo un superadministrador puede guardar fórmulas.' using errcode = '42501';
  end if;
  if nullif(btrim(requested_code), '') is null or nullif(btrim(requested_name), '') is null then
    raise exception 'El código y el nombre son obligatorios.' using errcode = '22023';
  end if;

  if requested_formula_id is null then
    insert into public.calculation_formulas (company_id, code, name, description, active)
    values (requested_company_id, requested_code, btrim(requested_name),
      nullif(btrim(requested_description), ''), requested_active)
    returning id into saved_id;
  else
    update public.calculation_formulas set code = requested_code,
      name = btrim(requested_name), description = nullif(btrim(requested_description), ''),
      active = requested_active, updated_at = now()
    where id = requested_formula_id and company_id = requested_company_id
    returning id into saved_id;
    if saved_id is null then raise exception 'La fórmula no existe.' using errcode = 'P0002'; end if;
  end if;

  delete from public.calculation_formula_parameters where formula_id = saved_id;
  insert into public.calculation_formula_parameters (
    company_id, formula_id, parameter_key, label, numeric_value,
    unit_label, description, active, sort_order
  )
  select requested_company_id, saved_id, parameter_key, label, numeric_value,
    unit_label, description, active, sort_order
  from jsonb_to_recordset(coalesce(requested_parameters, '[]'::jsonb)) as parameter(
    parameter_key text, label text, numeric_value numeric, unit_label text,
    description text, active boolean, sort_order integer
  );
  return saved_id;
end;
$function$;

revoke all on function public.admin_save_catalog_item(uuid, uuid, text, text, text, public.catalog_item_type, uuid, uuid, numeric, numeric, numeric, boolean) from public;
grant execute on function public.admin_save_catalog_item(uuid, uuid, text, text, text, public.catalog_item_type, uuid, uuid, numeric, numeric, numeric, boolean) to authenticated;
revoke all on function public.admin_save_formula(uuid, uuid, text, text, text, boolean, jsonb) from public;
grant execute on function public.admin_save_formula(uuid, uuid, text, text, text, boolean, jsonb) to authenticated;

commit;
