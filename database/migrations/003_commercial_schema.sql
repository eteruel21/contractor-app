BEGIN;

SET ROLE contractor_owner;

--
-- PostgreSQL database dump
--

\restrict tKjDZnu40LS5UECXdJsfnFmkDB0lquV8pk2BqDuLYMhKsXeMYue2wcD4Yc7IYV6

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: private; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS "private";


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS "public";


--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: budget_discount_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."budget_discount_type" AS ENUM (
    'none',
    'percent',
    'fixed'
);


--
-- Name: budget_item_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."budget_item_type" AS ENUM (
    'material',
    'labor',
    'equipment',
    'service',
    'subcontract',
    'manual'
);


--
-- Name: budget_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."budget_status" AS ENUM (
    'draft',
    'sent',
    'viewed',
    'approved',
    'rejected',
    'expired',
    'cancelled'
);


--
-- Name: catalog_item_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."catalog_item_type" AS ENUM (
    'material',
    'labor',
    'equipment',
    'service',
    'subcontract'
);


--
-- Name: client_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."client_type" AS ENUM (
    'person',
    'business'
);


--
-- Name: company_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."company_role" AS ENUM (
    'owner',
    'admin',
    'member',
    'supervisor',
    'sales',
    'estimator'
);


--
-- Name: document_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."document_type" AS ENUM (
    'budget',
    'invoice',
    'receipt',
    'project',
    'payment'
);


--
-- Name: global_user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."global_user_role" AS ENUM (
    'super_admin',
    'contractor',
    'client'
);


--
-- Name: project_member_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."project_member_role" AS ENUM (
    'manager',
    'supervisor',
    'worker',
    'viewer'
);


--
-- Name: project_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."project_status" AS ENUM (
    'lead',
    'inspection',
    'quoted',
    'approved',
    'in_progress',
    'paused',
    'completed',
    'cancelled'
);


--
-- Name: unit_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."unit_type" AS ENUM (
    'length',
    'area',
    'volume',
    'weight',
    'unit',
    'time',
    'package',
    'service'
);


--
-- Name: handle_company_calculation_defaults(); Type: FUNCTION; Schema: private; Owner: -
--

CREATE FUNCTION "private"."handle_company_calculation_defaults"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  perform private.seed_company_calculation_defaults(new.id);
  return new;
end;
$$;


--
-- Name: is_active_platform_user(); Type: FUNCTION; Schema: private; Owner: -
--

CREATE FUNCTION "private"."is_active_platform_user"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = (select app.current_user_id())
      and active = true
  );
$$;


--
-- Name: is_super_admin(); Type: FUNCTION; Schema: private; Owner: -
--

CREATE FUNCTION "private"."is_super_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = (select app.current_user_id())
      and active = true
      and role::text = 'super_admin'
  );
$$;


--
-- Name: seed_company_calculation_defaults("uuid"); Type: FUNCTION; Schema: private; Owner: -
--

CREATE FUNCTION "private"."seed_company_calculation_defaults"("requested_company_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
$$;


--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: private; Owner: -
--

CREATE FUNCTION "private"."touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


--
-- Name: admin_adjust_catalog_prices("uuid", "uuid"[], "text", numeric, "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."admin_adjust_catalog_prices"("requested_company_id" "uuid", "requested_item_ids" "uuid"[], "requested_target" "text", "requested_percentage" numeric, "change_notes" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
$$;


--
-- Name: admin_adjust_platform_catalog_prices("uuid"[], "text", numeric, "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."admin_adjust_platform_catalog_prices"("requested_item_ids" "uuid"[], "requested_target" "text", "requested_percentage" numeric, "change_notes" "text" DEFAULT NULL::"text") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
      (select app.current_user_id())
    from updated_items
  )
  select count(*) into updated_count from updated_items;

  return updated_count;
end;
$$;


--
-- Name: admin_save_catalog_item("uuid", "uuid", "text", "text", "text", "public"."catalog_item_type", "uuid", "uuid", numeric, numeric, numeric, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."admin_save_catalog_item"("requested_item_id" "uuid", "requested_company_id" "uuid", "requested_sku" "text", "requested_name" "text", "requested_description" "text", "requested_item_type" "public"."catalog_item_type", "requested_category_id" "uuid", "requested_unit_id" "uuid", "requested_unit_cost" numeric, "requested_sale_price" numeric, "requested_waste_percentage" numeric, "requested_active" boolean) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  saved_id uuid;
  previous_item public.catalog_items%rowtype;
begin
  if not (select private.is_super_admin()) then
    raise exception 'Solo un superadministrador puede guardar el catÃ¡logo.' using errcode = '42501';
  end if;
  if nullif(btrim(requested_name), '') is null or requested_unit_id is null then
    raise exception 'El nombre y la unidad son obligatorios.' using errcode = '22023';
  end if;
  if requested_unit_cost < 0 or requested_sale_price < 0
    or requested_waste_percentage not between 0 and 100 then
    raise exception 'Los precios o el desperdicio no son vÃ¡lidos.' using errcode = '22023';
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
    raise exception 'El elemento del catÃ¡logo no existe.' using errcode = 'P0002';
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
      'panel_super_admin', 'EdiciÃ³n atÃ³mica desde el panel central',
      (select app.current_user_id()), now()
    );
  end if;
  return requested_item_id;
end;
$$;


--
-- Name: admin_save_formula("uuid", "uuid", "text", "text", "text", boolean, "jsonb"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."admin_save_formula"("requested_formula_id" "uuid", "requested_company_id" "uuid", "requested_code" "text", "requested_name" "text", "requested_description" "text", "requested_active" boolean, "requested_parameters" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare saved_id uuid;
begin
  if not (select private.is_super_admin()) then
    raise exception 'Solo un superadministrador puede guardar fÃ³rmulas.' using errcode = '42501';
  end if;
  if nullif(btrim(requested_code), '') is null or nullif(btrim(requested_name), '') is null then
    raise exception 'El cÃ³digo y el nombre son obligatorios.' using errcode = '22023';
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
    if saved_id is null then raise exception 'La fÃ³rmula no existe.' using errcode = 'P0002'; end if;
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
$$;


--
-- Name: admin_update_catalog_pricing("uuid", "uuid", numeric, numeric, numeric, "text", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."admin_update_catalog_pricing"("requested_company_id" "uuid", "requested_item_id" "uuid", "requested_unit_cost" numeric, "requested_sale_price" numeric, "requested_waste_percentage" numeric, "change_source" "text" DEFAULT 'panel_administrativo'::"text", "change_notes" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  current_item public.catalog_items%rowtype;
  allowed boolean;
begin
  select (select private.is_super_admin()) or exists (
    select 1
    from public.company_members
    join public.profiles on profiles.id = company_members.user_id
    where company_members.company_id = requested_company_id
      and company_members.user_id = (select app.current_user_id())
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
    (select app.current_user_id()),
    now()
  );
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: calculation_formula_parameters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."calculation_formula_parameters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "formula_id" "uuid" NOT NULL,
    "parameter_key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "numeric_value" numeric(18,6) NOT NULL,
    "unit_label" "text",
    "min_value" numeric(18,6),
    "max_value" numeric(18,6),
    "step_value" numeric(18,6) DEFAULT 1 NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "calculation_formula_parameters_key_check" CHECK ((("parameter_key" = "lower"("parameter_key")) AND ("parameter_key" ~ '^[a-z0-9_]+$'::"text"))),
    CONSTRAINT "calculation_formula_parameters_limits_check" CHECK ((("min_value" IS NULL) OR ("max_value" IS NULL) OR ("min_value" <= "max_value"))),
    CONSTRAINT "calculation_formula_parameters_step_check" CHECK (("step_value" > (0)::numeric)),
    CONSTRAINT "calculation_formula_parameters_value_check" CHECK (((("min_value" IS NULL) OR ("numeric_value" >= "min_value")) AND (("max_value" IS NULL) OR ("numeric_value" <= "max_value"))))
);


--
-- Name: admin_update_formula_parameter("uuid", "uuid", "uuid", "text", "text", numeric, "text", numeric, numeric, numeric, integer, "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."admin_update_formula_parameter"("requested_company_id" "uuid", "requested_formula_id" "uuid", "requested_parameter_id" "uuid", "requested_label" "text", "requested_description" "text", "requested_numeric_value" numeric, "requested_unit_label" "text", "requested_min_value" numeric, "requested_max_value" numeric, "requested_step_value" numeric, "requested_sort_order" integer, "change_notes" "text" DEFAULT NULL::"text") RETURNS "public"."calculation_formula_parameters"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  updated_parameter
    public.calculation_formula_parameters;
begin
  if requested_step_value <= 0 then
    raise exception
      'El incremento debe ser mayor que cero.';
  end if;

  if
    requested_min_value is not null
    and requested_max_value is not null
    and requested_min_value >
      requested_max_value
  then
    raise exception
      'El mínimo no puede superar el máximo.';
  end if;

  if
    requested_min_value is not null
    and requested_numeric_value <
      requested_min_value
  then
    raise exception
      'El valor es menor que el mínimo.';
  end if;

  if
    requested_max_value is not null
    and requested_numeric_value >
      requested_max_value
  then
    raise exception
      'El valor supera el máximo.';
  end if;

  perform set_config(
    'app.formula_change_notes',
    coalesce(change_notes, ''),
    true
  );

  update
    public.calculation_formula_parameters
  set
    label = trim(requested_label),
    description =
      nullif(
        trim(
          coalesce(
            requested_description,
            ''
          )
        ),
        ''
      ),
    numeric_value =
      requested_numeric_value,
    unit_label =
      nullif(
        trim(
          coalesce(
            requested_unit_label,
            ''
          )
        ),
        ''
      ),
    min_value = requested_min_value,
    max_value = requested_max_value,
    step_value = requested_step_value,
    sort_order = greatest(
      requested_sort_order,
      0
    ),
    updated_at = now()
  where
    id = requested_parameter_id
    and formula_id = requested_formula_id
    and company_id =
      requested_company_id
  returning *
  into updated_parameter;

  if updated_parameter.id is null then
    raise exception
      'No se encontró el parámetro o no tienes permiso.';
  end if;

  return updated_parameter;
end;
$$;


--
-- Name: admin_update_platform_catalog_pricing("uuid", numeric, numeric, numeric, "text", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."admin_update_platform_catalog_pricing"("requested_item_id" "uuid", "requested_unit_cost" numeric, "requested_sale_price" numeric, "requested_waste_percentage" numeric, "change_source" "text" DEFAULT 'panel_super_admin'::"text", "change_notes" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
    (select app.current_user_id())
  );
end;
$$;


--
-- Name: create_company("text", "text", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."create_company"("company_name" "text", "company_phone" "text" DEFAULT NULL::"text", "company_email" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  new_company_id uuid;
  clean_name text;
begin
  if app.current_user_id() is null then
    raise exception 'Usuario no autenticado.';
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
    (new_company_id, 'invoice'::public.document_type, 'FAC', 0, 6, false, extract(year from now())::integer),
    (new_company_id, 'receipt'::public.document_type, 'REC', 0, 6, false, extract(year from now())::integer),
    (new_company_id, 'project'::public.document_type, 'PR', 0, 6, false, extract(year from now())::integer),
    (new_company_id, 'payment'::public.document_type, 'ABO', 0, 6, false, extract(year from now())::integer);

  insert into public.company_settings (
    company_id,
    setting_key,
    setting_value
  )
  values
    (new_company_id, 'default_tax_rate', to_jsonb(7.00)),
    (new_company_id, 'default_currency', to_jsonb('USD'::text)),
    (new_company_id, 'default_budget_validity_days', to_jsonb(15)),
    (new_company_id, 'default_waste_percentage', to_jsonb(10)),
    (new_company_id, 'pdf_footer', to_jsonb('Gracias por confiar en nuestros servicios.'::text)),
    (new_company_id, 'pdf_terms', to_jsonb('Esta cotización está sujeta a verificación en sitio.'::text));

  perform public.seed_default_catalog(new_company_id);

  return new_company_id;
end;
$$;


--
-- Name: create_new_user_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."create_new_user_trigger"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON app_auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END;
$$;


--
-- Name: create_project_budget("uuid", "uuid", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."create_project_budget"("requested_company_id" "uuid", "requested_project_id" "uuid", "budget_title" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  project_record record;
  company_record record;
  new_budget_number text;
  new_budget_id uuid;
  default_terms text;
begin
  if app.current_user_id() is null then
    raise exception 'Usuario no autenticado.';
  end if;

  if not public.is_company_member(requested_company_id) then
    raise exception 'No tienes acceso a esta empresa.';
  end if;

  select *
  into project_record
  from public.projects
  where company_id = requested_company_id
    and id = requested_project_id;

  if not found then
    raise exception 'Proyecto no encontrado.';
  end if;

  select *
  into company_record
  from public.companies
  where id = requested_company_id;

  new_budget_number := public.next_document_number(
    requested_company_id,
    'budget'::public.document_type
  );

  select setting_value #>> '{}'
  into default_terms
  from public.company_settings
  where company_id = requested_company_id
    and setting_key = 'pdf_terms';

  insert into public.budgets (
    company_id,
    client_id,
    project_id,
    budget_number,
    version,
    title,
    status,
    currency_code,
    tax_rate,
    terms,
    created_by
  )
  values (
    requested_company_id,
    project_record.client_id,
    requested_project_id,
    new_budget_number,
    1,
    coalesce(
      nullif(trim(budget_title), ''),
      project_record.name
    ),
    'draft'::public.budget_status,
    coalesce(company_record.currency_code, 'USD'),
    coalesce(company_record.tax_rate, 7.00),
    default_terms,
    app.current_user_id()
  )
  returning id into new_budget_id;

  insert into public.budget_sections (
    company_id,
    budget_id,
    name,
    sort_order
  )
  values (
    requested_company_id,
    new_budget_id,
    'General',
    1
  );

  return new_budget_id;
end;
$$;


--
-- Name: handle_client_auto_link(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."handle_client_auto_link"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  user_email text;
begin
  if new.role::text = 'client' then
    select auth_user.email
    into user_email
    from app_auth.users as auth_user
    where auth_user.id = new.id;

    if user_email is not null then
      update public.clients as client
      set user_id = new.id
      where client.user_id is null
        and client.email is not null
        and lower(btrim(client.email)) = lower(btrim(user_email));
    end if;
  end if;

  return new;
end;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (
    id, 
    full_name, 
    first_name, 
    last_name, 
    phone, 
    avatar_url, 
    role,
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
      new.raw_user_meta_data->>'full_name',
      concat(new.raw_user_meta_data->>'first_name', ' ', new.raw_user_meta_data->>'last_name')
    ),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'role')::public.global_user_role, 'contractor'::public.global_user_role),
    new.raw_user_meta_data->>'province',
    new.raw_user_meta_data->>'district',
    new.raw_user_meta_data->>'corregimiento',
    coalesce((new.raw_user_meta_data->>'terms_accepted')::boolean, false),
    coalesce((new.raw_user_meta_data->>'notifications_opt_in')::boolean, false),
    new.raw_user_meta_data->>'registration_ip',
    new.raw_user_meta_data->>'registration_device'
  );
  return new;
end;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = (select app.current_user_id())
      and active = true
      and role::text = 'super_admin'
  );
$$;


--
-- Name: is_company_admin("uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."is_company_admin"("requested_company_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = requested_company_id
      and cm.user_id = app.current_user_id()
      and cm.active = true
      and cm.role in (
        'owner'::public.company_role,
        'admin'::public.company_role
      )
  );
$$;


--
-- Name: is_company_member("uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."is_company_member"("requested_company_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = requested_company_id
      and cm.user_id = app.current_user_id()
      and cm.active = true
  );
$$;


--
-- Name: is_company_owner("uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."is_company_owner"("requested_company_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = requested_company_id
      and cm.user_id = app.current_user_id()
      and cm.active = true
      and cm.role = 'owner'::public.company_role
  );
$$;


--
-- Name: log_catalog_price_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."log_catalog_price_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  change_source text;
  change_notes text;
begin
  if
    new.unit_cost is distinct from old.unit_cost
    or new.sale_price is distinct from old.sale_price
  then
    change_source :=
      nullif(
        current_setting(
          'app.price_change_source',
          true
        ),
        ''
      );

    change_notes :=
      nullif(
        current_setting(
          'app.price_change_notes',
          true
        ),
        ''
      );

    insert into public.catalog_price_history (
      company_id,
      catalog_item_id,
      unit_cost,
      sale_price,
      effective_at,
      changed_by,
      source,
      notes
    )
    values (
      new.company_id,
      new.id,
      new.unit_cost,
      new.sale_price,
      now(),
      app.current_user_id(),
      coalesce(
        change_source,
        'actualizacion_catalogo'
      ),
      change_notes
    );
  end if;

  return new;
end;
$$;


--
-- Name: log_formula_parameter_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."log_formula_parameter_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  change_notes text;
begin
  if
    new.numeric_value
      is distinct from
    old.numeric_value
  then
    change_notes :=
      nullif(
        current_setting(
          'app.formula_change_notes',
          true
        ),
        ''
      );

    insert into
    public.calculation_formula_parameter_history (
      company_id,
      formula_id,
      parameter_id,
      old_value,
      new_value,
      changed_by,
      notes
    )
    values (
      new.company_id,
      new.formula_id,
      new.id,
      old.numeric_value,
      new.numeric_value,
      app.current_user_id(),
      change_notes
    );
  end if;

  return new;
end;
$$;


--
-- Name: next_document_number("uuid", "public"."document_type"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."next_document_number"("requested_company_id" "uuid", "requested_document_type" "public"."document_type") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  seq_record record;
  next_number bigint;
  current_year integer := extract(year from now())::integer;
  default_prefix text;
begin
  if app.current_user_id() is null then
    raise exception 'Usuario no autenticado.';
  end if;

  if not public.is_company_member(requested_company_id) then
    raise exception 'No tienes acceso a esta empresa.';
  end if;

  case requested_document_type
    when 'budget'::public.document_type then default_prefix := 'COT';
    when 'invoice'::public.document_type then default_prefix := 'FAC';
    when 'receipt'::public.document_type then default_prefix := 'REC';
    when 'project'::public.document_type then default_prefix := 'PR';
    when 'payment'::public.document_type then default_prefix := 'ABO';
  end case;

  select *
  into seq_record
  from public.document_sequences
  where company_id = requested_company_id
    and document_type = requested_document_type
  for update;

  if not found then
    insert into public.document_sequences (
      company_id,
      document_type,
      prefix,
      current_number,
      padding,
      yearly_reset,
      last_reset_year
    )
    values (
      requested_company_id,
      requested_document_type,
      default_prefix,
      0,
      6,
      false,
      current_year
    )
    returning * into seq_record;
  end if;

  if seq_record.yearly_reset = true
     and coalesce(seq_record.last_reset_year, current_year) <> current_year then
    update public.document_sequences
    set
      current_number = 0,
      last_reset_year = current_year,
      updated_at = now()
    where id = seq_record.id
    returning * into seq_record;
  end if;

  next_number := seq_record.current_number + 1;

  update public.document_sequences
  set
    current_number = next_number,
    last_reset_year = current_year,
    updated_at = now()
  where id = seq_record.id
  returning * into seq_record;

  return seq_record.prefix || '-' || lpad(next_number::text, seq_record.padding, '0');
end;
$$;


--
-- Name: prevent_unauthorized_profile_approval_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."prevent_unauthorized_profile_approval_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if (
    new.active is distinct from old.active
    or new.approved_at is distinct from old.approved_at
    or new.approved_by is distinct from old.approved_by
  )
    and app.current_user_id() is not null
    and not exists (
      select 1
      from public.profiles as actor
      where actor.id = app.current_user_id()
        and actor.active = true
        and actor.role = 'super_admin'::public.global_user_role
    )
  then
    raise exception 'Solo un superadministrador puede cambiar la aprobación.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;


--
-- Name: prevent_unauthorized_profile_role_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."prevent_unauthorized_profile_role_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if new.role is distinct from old.role
    and app.current_user_id() is not null
    and not exists (
      select 1
      from public.profiles as actor
      where actor.id = app.current_user_id()
        and actor.active = true
        and actor.role::text = 'super_admin'
    )
  then
    raise exception 'No tienes permiso para cambiar roles de usuario.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;


--
-- Name: recalculate_budget_totals("uuid", "uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."recalculate_budget_totals"("requested_company_id" "uuid", "requested_budget_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  budget_record record;
  new_subtotal numeric(12,2);
  taxable_subtotal numeric(12,2);
  new_discount_amount numeric(12,2);
  new_taxable_base numeric(12,2);
  new_tax_amount numeric(12,2);
  new_total numeric(12,2);
begin
  select *
  into budget_record
  from public.budgets
  where company_id = requested_company_id
    and id = requested_budget_id;

  if not found then
    return;
  end if;

  select
    coalesce(round(sum(subtotal), 2), 0),
    coalesce(round(sum(case when taxable then subtotal else 0 end), 2), 0)
  into
    new_subtotal,
    taxable_subtotal
  from public.budget_items
  where company_id = requested_company_id
    and budget_id = requested_budget_id;

  if budget_record.discount_type = 'percent'::public.budget_discount_type then
    new_discount_amount := round(
      new_subtotal * (budget_record.discount_value / 100),
      2
    );
  elsif budget_record.discount_type = 'fixed'::public.budget_discount_type then
    new_discount_amount := least(
      budget_record.discount_value,
      new_subtotal
    );
  else
    new_discount_amount := 0;
  end if;

  if new_subtotal > 0 then
    new_taxable_base := greatest(
      taxable_subtotal - (
        new_discount_amount * (taxable_subtotal / new_subtotal)
      ),
      0
    );
  else
    new_taxable_base := 0;
  end if;

  new_tax_amount := round(
    new_taxable_base * (budget_record.tax_rate / 100),
    2
  );

  new_total := greatest(
    new_subtotal - new_discount_amount + new_tax_amount,
    0
  );

  update public.budgets
  set
    subtotal = new_subtotal,
    discount_amount = new_discount_amount,
    tax_amount = new_tax_amount,
    total = new_total,
    updated_at = now()
  where company_id = requested_company_id
    and id = requested_budget_id;
end;
$$;


--
-- Name: record_catalog_price_history(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."record_catalog_price_history"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if tg_op = 'INSERT' then
    insert into public.catalog_price_history (
      company_id,
      catalog_item_id,
      unit_cost,
      sale_price,
      changed_by
    ) values (
      new.company_id,
      new.id,
      new.unit_cost,
      new.sale_price,
      app.current_user_id()
    );
  elsif old.unit_cost is distinct from new.unit_cost
    or old.sale_price is distinct from new.sale_price then
    insert into public.catalog_price_history (
      company_id,
      catalog_item_id,
      unit_cost,
      sale_price,
      changed_by
    ) values (
      new.company_id,
      new.id,
      new.unit_cost,
      new.sale_price,
      app.current_user_id()
    );
  end if;

  return new;
end;
$$;


--
-- Name: reset_personal_catalog_pricing("uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."reset_personal_catalog_pricing"("requested_item_id" "uuid") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  delete from public.user_catalog_price_overrides
  where user_id = (select app.current_user_id())
    and catalog_item_id = requested_item_id;
$$;


--
-- rls_auto_enable omitido en PostgreSQL local.

-- Name: seed_default_catalog("uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."seed_default_catalog"("requested_company_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  unit_unidad uuid;
  unit_m uuid;
  unit_m2 uuid;
  unit_m3 uuid;
  unit_kg uuid;
  unit_saco uuid;
  unit_galon uuid;
  unit_hora uuid;
  unit_dia uuid;
  unit_punto uuid;

  cat_materiales uuid;
  cat_concreto uuid;
  cat_albanileria uuid;
  cat_pvc uuid;
  cat_gypsum uuid;
  cat_pintura uuid;
  cat_electricidad uuid;
  cat_camaras uuid;
  cat_mdf uuid;
  cat_labor uuid;
  cat_equipment uuid;
  cat_services uuid;
begin
  if app.current_user_id() is not null
     and not public.is_company_admin(requested_company_id) then
    raise exception 'No tienes permiso para crear catálogo en esta empresa.';
  end if;

  -- ======================
  -- UNIDADES
  -- ======================

  insert into public.units (
    company_id, code, name, symbol, unit_type
  )
  values (
    requested_company_id, 'unidad', 'Unidad', 'und', 'unit'
  )
  on conflict (company_id, code)
  do update set
    name = excluded.name,
    symbol = excluded.symbol,
    unit_type = excluded.unit_type,
    active = true,
    updated_at = now()
  returning id into unit_unidad;

  insert into public.units (
    company_id, code, name, symbol, unit_type
  )
  values (
    requested_company_id, 'm', 'Metro lineal', 'm', 'length'
  )
  on conflict (company_id, code)
  do update set
    name = excluded.name,
    symbol = excluded.symbol,
    unit_type = excluded.unit_type,
    active = true,
    updated_at = now()
  returning id into unit_m;

  insert into public.units (
    company_id, code, name, symbol, unit_type
  )
  values (
    requested_company_id, 'm2', 'Metro cuadrado', 'm²', 'area'
  )
  on conflict (company_id, code)
  do update set
    name = excluded.name,
    symbol = excluded.symbol,
    unit_type = excluded.unit_type,
    active = true,
    updated_at = now()
  returning id into unit_m2;

  insert into public.units (
    company_id, code, name, symbol, unit_type
  )
  values (
    requested_company_id, 'm3', 'Metro cúbico', 'm³', 'volume'
  )
  on conflict (company_id, code)
  do update set
    name = excluded.name,
    symbol = excluded.symbol,
    unit_type = excluded.unit_type,
    active = true,
    updated_at = now()
  returning id into unit_m3;

  insert into public.units (
    company_id, code, name, symbol, unit_type
  )
  values (
    requested_company_id, 'kg', 'Kilogramo', 'kg', 'weight'
  )
  on conflict (company_id, code)
  do update set
    name = excluded.name,
    symbol = excluded.symbol,
    unit_type = excluded.unit_type,
    active = true,
    updated_at = now()
  returning id into unit_kg;

  insert into public.units (
    company_id, code, name, symbol, unit_type
  )
  values (
    requested_company_id, 'saco', 'Saco', 'saco', 'package'
  )
  on conflict (company_id, code)
  do update set
    name = excluded.name,
    symbol = excluded.symbol,
    unit_type = excluded.unit_type,
    active = true,
    updated_at = now()
  returning id into unit_saco;

  insert into public.units (
    company_id, code, name, symbol, unit_type
  )
  values (
    requested_company_id, 'galon', 'Galón', 'gal', 'volume'
  )
  on conflict (company_id, code)
  do update set
    name = excluded.name,
    symbol = excluded.symbol,
    unit_type = excluded.unit_type,
    active = true,
    updated_at = now()
  returning id into unit_galon;

  insert into public.units (
    company_id, code, name, symbol, unit_type
  )
  values (
    requested_company_id, 'hora', 'Hora', 'h', 'time'
  )
  on conflict (company_id, code)
  do update set
    name = excluded.name,
    symbol = excluded.symbol,
    unit_type = excluded.unit_type,
    active = true,
    updated_at = now()
  returning id into unit_hora;

  insert into public.units (
    company_id, code, name, symbol, unit_type
  )
  values (
    requested_company_id, 'dia', 'Día', 'día', 'time'
  )
  on conflict (company_id, code)
  do update set
    name = excluded.name,
    symbol = excluded.symbol,
    unit_type = excluded.unit_type,
    active = true,
    updated_at = now()
  returning id into unit_dia;

  insert into public.units (
    company_id, code, name, symbol, unit_type
  )
  values (
    requested_company_id, 'punto', 'Punto', 'pto', 'unit'
  )
  on conflict (company_id, code)
  do update set
    name = excluded.name,
    symbol = excluded.symbol,
    unit_type = excluded.unit_type,
    active = true,
    updated_at = now()
  returning id into unit_punto;

  -- ======================
  -- CATEGORÍAS
  -- ======================

  select id into cat_materiales
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id is null
    and name = 'Materiales'
  limit 1;

  if cat_materiales is null then
    insert into public.catalog_categories (
      company_id, name, description
    )
    values (
      requested_company_id,
      'Materiales',
      'Materiales de construcción e instalación.'
    )
    returning id into cat_materiales;
  end if;

  select id into cat_labor
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id is null
    and name = 'Mano de obra'
  limit 1;

  if cat_labor is null then
    insert into public.catalog_categories (
      company_id, name, description
    )
    values (
      requested_company_id,
      'Mano de obra',
      'Servicios de instalación, construcción y acabados.'
    )
    returning id into cat_labor;
  end if;

  select id into cat_equipment
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id is null
    and name = 'Equipos'
  limit 1;

  if cat_equipment is null then
    insert into public.catalog_categories (
      company_id, name, description
    )
    values (
      requested_company_id,
      'Equipos',
      'Alquiler o uso de equipos y herramientas.'
    )
    returning id into cat_equipment;
  end if;

  select id into cat_services
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id is null
    and name = 'Servicios'
  limit 1;

  if cat_services is null then
    insert into public.catalog_categories (
      company_id, name, description
    )
    values (
      requested_company_id,
      'Servicios',
      'Servicios generales y subcontratos.'
    )
    returning id into cat_services;
  end if;

  -- Subcategorías de materiales

  select id into cat_concreto
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id = cat_materiales
    and name = 'Concreto'
  limit 1;

  if cat_concreto is null then
    insert into public.catalog_categories (
      company_id, parent_id, name
    )
    values (
      requested_company_id, cat_materiales, 'Concreto'
    )
    returning id into cat_concreto;
  end if;

  select id into cat_albanileria
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id = cat_materiales
    and name = 'Albañilería'
  limit 1;

  if cat_albanileria is null then
    insert into public.catalog_categories (
      company_id, parent_id, name
    )
    values (
      requested_company_id, cat_materiales, 'Albañilería'
    )
    returning id into cat_albanileria;
  end if;

  select id into cat_pvc
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id = cat_materiales
    and name = 'Cielo raso PVC'
  limit 1;

  if cat_pvc is null then
    insert into public.catalog_categories (
      company_id, parent_id, name
    )
    values (
      requested_company_id, cat_materiales, 'Cielo raso PVC'
    )
    returning id into cat_pvc;
  end if;

  select id into cat_gypsum
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id = cat_materiales
    and name = 'Gypsum'
  limit 1;

  if cat_gypsum is null then
    insert into public.catalog_categories (
      company_id, parent_id, name
    )
    values (
      requested_company_id, cat_materiales, 'Gypsum'
    )
    returning id into cat_gypsum;
  end if;

  select id into cat_pintura
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id = cat_materiales
    and name = 'Pintura'
  limit 1;

  if cat_pintura is null then
    insert into public.catalog_categories (
      company_id, parent_id, name
    )
    values (
      requested_company_id, cat_materiales, 'Pintura'
    )
    returning id into cat_pintura;
  end if;

  select id into cat_electricidad
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id = cat_materiales
    and name = 'Electricidad'
  limit 1;

  if cat_electricidad is null then
    insert into public.catalog_categories (
      company_id, parent_id, name
    )
    values (
      requested_company_id, cat_materiales, 'Electricidad'
    )
    returning id into cat_electricidad;
  end if;

  select id into cat_camaras
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id = cat_materiales
    and name = 'Cámaras'
  limit 1;

  if cat_camaras is null then
    insert into public.catalog_categories (
      company_id, parent_id, name
    )
    values (
      requested_company_id, cat_materiales, 'Cámaras'
    )
    returning id into cat_camaras;
  end if;

  select id into cat_mdf
  from public.catalog_categories
  where company_id = requested_company_id
    and parent_id = cat_materiales
    and name = 'MDF'
  limit 1;

  if cat_mdf is null then
    insert into public.catalog_categories (
      company_id, parent_id, name
    )
    values (
      requested_company_id, cat_materiales, 'MDF'
    )
    returning id into cat_mdf;
  end if;

  -- ======================
  -- ÍTEMS BASE
  -- ======================

  insert into public.catalog_items (
    company_id,
    item_type,
    category_id,
    sku,
    name,
    description,
    unit_id,
    unit_cost,
    sale_price,
    waste_percentage,
    active
  )
  values
    (
      requested_company_id,
      'material',
      cat_concreto,
      'MAT-CEMENTO-42KG',
      'Cemento 42.5 kg',
      'Saco de cemento para concreto, repello y albañilería.',
      unit_saco,
      0,
      0,
      5,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_concreto,
      'MAT-ARENA-M3',
      'Arena',
      'Arena por metro cúbico.',
      unit_m3,
      0,
      0,
      8,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_concreto,
      'MAT-PIEDRA-M3',
      'Piedra',
      'Piedra o grava por metro cúbico.',
      unit_m3,
      0,
      0,
      8,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_albanileria,
      'MAT-BLOQUE-4',
      'Bloque 4 pulgadas',
      'Bloque de concreto de 4 pulgadas.',
      unit_unidad,
      0,
      0,
      5,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_albanileria,
      'MAT-BLOQUE-6',
      'Bloque 6 pulgadas',
      'Bloque de concreto de 6 pulgadas.',
      unit_unidad,
      0,
      0,
      5,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_pvc,
      'MAT-PVC-LAMINA-585',
      'Lámina PVC 5.85 m',
      'Lámina para cielo raso PVC de 20 cm x 5.85 m.',
      unit_unidad,
      0,
      0,
      5,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_pvc,
      'MAT-PVC-LAMINA-290',
      'Lámina PVC 2.90 m',
      'Lámina para cielo raso PVC de 20 cm x 2.90 m.',
      unit_unidad,
      0,
      0,
      5,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_pvc,
      'MAT-TRACK-3M',
      'Track galvanizado 3 m',
      'Track metálico para estructura perimetral.',
      unit_unidad,
      0,
      0,
      5,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_pvc,
      'MAT-STUD-3M',
      'Stud galvanizado 3 m',
      'Stud metálico para estructura central y cargadores.',
      unit_unidad,
      0,
      0,
      5,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_gypsum,
      'MAT-GYPSUM-LAMINA',
      'Lámina de gypsum',
      'Lámina estándar de gypsum.',
      unit_unidad,
      0,
      0,
      8,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_pintura,
      'MAT-PINTURA-GALON',
      'Pintura por galón',
      'Pintura para interiores o exteriores.',
      unit_galon,
      0,
      0,
      5,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_electricidad,
      'MAT-CABLE-THHN',
      'Cable THHN',
      'Cable eléctrico THHN por metro.',
      unit_m,
      0,
      0,
      3,
      true
    ),
    (
      requested_company_id,
      'material',
      cat_camaras,
      'MAT-CAMARA-IP',
      'Cámara IP',
      'Cámara de seguridad IP.',
      unit_unidad,
      0,
      0,
      0,
      true
    ),
    (
      requested_company_id,
      'labor',
      cat_labor,
      'LAB-CIELO-PVC-M2',
      'Instalación cielo raso PVC',
      'Mano de obra para instalación de cielo raso PVC por m².',
      unit_m2,
      0,
      0,
      0,
      true
    ),
    (
      requested_company_id,
      'labor',
      cat_labor,
      'LAB-PINTURA-M2',
      'Pintura por m²',
      'Mano de obra de pintura por metro cuadrado.',
      unit_m2,
      0,
      0,
      0,
      true
    ),
    (
      requested_company_id,
      'labor',
      cat_labor,
      'LAB-CONCRETO-M3',
      'Vaciado de concreto',
      'Mano de obra para vaciado de concreto por m³.',
      unit_m3,
      0,
      0,
      0,
      true
    ),
    (
      requested_company_id,
      'equipment',
      cat_equipment,
      'EQ-MEZCLADORA-DIA',
      'Mezcladora por día',
      'Alquiler o uso de mezcladora por día.',
      unit_dia,
      0,
      0,
      0,
      true
    )
  on conflict (company_id, sku)
  do update set
    item_type = excluded.item_type,
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    unit_id = excluded.unit_id,
    waste_percentage = excluded.waste_percentage,
    active = true,
    updated_at = now();
end;
$$;


--
-- Name: seed_default_units("uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."seed_default_units"("requested_company_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.units (
    company_id,
    code,
    name,
    symbol,
    unit_type,
    conversion_factor
  )
  values
    (requested_company_id, 'ud',  'Unidad',          'ud',  'unit',    1),
    (requested_company_id, 'ml',  'Metro lineal',    'm',   'length',  1),
    (requested_company_id, 'm2',  'Metro cuadrado',  'm²',  'area',    1),
    (requested_company_id, 'm3',  'Metro cubico',    'm³',  'volume',  1),
    (requested_company_id, 'cm',  'Centimetro',      'cm',  'length',  0.01),
    (requested_company_id, 'mm',  'Milimetro',       'mm',  'length',  0.001),
    (requested_company_id, 'kg',  'Kilogramo',       'kg',  'weight',  1),
    (requested_company_id, 'g',   'Gramo',           'g',   'weight',  0.001),
    (requested_company_id, 'lb',  'Libra',           'lb',  'weight',  0.453592),
    (requested_company_id, 'l',   'Litro',           'L',   'volume',  0.001),
    (requested_company_id, 'gal', 'Galon',           'gal', 'volume',  0.00378541),
    (requested_company_id, 'h',   'Hora',            'h',   'time',    1),
    (requested_company_id, 'dia', 'Dia',             'día', 'time',    8),
    (requested_company_id, 'paq', 'Paquete',         'paq', 'package', 1),
    (requested_company_id, 'ser', 'Servicio',        'ser', 'service', 1)
  on conflict (company_id, code) do nothing;
end;
$$;


--
-- Name: seed_units_after_company_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."seed_units_after_company_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  perform public.seed_default_units(new.id);
  return new;
end;
$$;


--
-- Name: set_budget_item_subtotal(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."set_budget_item_subtotal"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.quantity := coalesce(new.quantity, 0);
  new.unit_price := coalesce(new.unit_price, 0);
  new.discount_percentage := coalesce(new.discount_percentage, 0);

  new.subtotal := round(
    (
      new.quantity * new.unit_price
    ) * (
      1 - (new.discount_percentage / 100)
    ),
    2
  );

  return new;
end;
$$;


--
-- Name: set_personal_catalog_pricing("uuid", numeric, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."set_personal_catalog_pricing"("requested_item_id" "uuid", "requested_unit_cost" numeric, "requested_sale_price" numeric, "requested_waste_percentage" numeric) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
    (select app.current_user_id()),
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
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: touch_calculation_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."touch_calculation_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: trigger_recalculate_budget_totals(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."trigger_recalculate_budget_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_budget_totals(
      old.company_id,
      old.budget_id
    );

    return old;
  end if;

  perform public.recalculate_budget_totals(
    new.company_id,
    new.budget_id
  );

  return new;
end;
$$;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "avatar_url" "text",
    "active" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role" "public"."global_user_role" DEFAULT 'contractor'::"public"."global_user_role" NOT NULL,
    "approved_at" timestamp with time zone,
    "approved_by" "uuid",
    "first_name" "text",
    "last_name" "text",
    "province" "text",
    "district" "text",
    "corregimiento" "text",
    "terms_accepted" boolean DEFAULT false,
    "notifications_opt_in" boolean DEFAULT false,
    "registration_ip" "text",
    "registration_device" "text",
    "business_name" "text",
    "id_document" "text",
    "tax_id" "text",
    "tax_dv" "text",
    "primary_category" "text",
    "specialties" "text"[],
    "experience_years" integer,
    "work_areas" "text"[],
    "professional_description" "text",
    "company_logo_url" "text",
    "portfolio_urls" "text"[],
    "certifications" "text"[],
    "availability" "text",
    "preferred_contact_method" "text",
    "emits_invoice" boolean DEFAULT false,
    "has_transport" boolean DEFAULT false,
    "work_mode" "text",
    "doc_id_url" "text",
    "doc_operation_notice_url" "text",
    "doc_technical_certs_urls" "text"[],
    "doc_references_url" "text",
    "doc_address_proof_url" "text"
);


--
-- Name: TABLE "profiles"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."profiles" IS 'Información pública y operativa de los usuarios registrados.';


--
-- Name: update_contractor_profile("text", "text", "text", "text", "text", "text"[], integer, "text"[], "text", "text", "text"[], "text"[], "text", "text", boolean, boolean, "text", "text", "text", "text"[], "text", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."update_contractor_profile"("p_business_name" "text", "p_id_document" "text", "p_tax_id" "text", "p_tax_dv" "text", "p_primary_category" "text", "p_specialties" "text"[], "p_experience_years" integer, "p_work_areas" "text"[], "p_professional_description" "text", "p_company_logo_url" "text", "p_portfolio_urls" "text"[], "p_certifications" "text"[], "p_availability" "text", "p_preferred_contact_method" "text", "p_emits_invoice" boolean, "p_has_transport" boolean, "p_work_mode" "text", "p_doc_id_url" "text", "p_doc_operation_notice_url" "text", "p_doc_technical_certs_urls" "text"[], "p_doc_references_url" "text", "p_doc_address_proof_url" "text") RETURNS "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  updated_profile public.profiles;
begin
  if (select app.current_user_id()) is null then
    raise exception 'Authentication required';
  end if;

  update public.profiles
  set
    business_name = p_business_name,
    id_document = p_id_document,
    tax_id = p_tax_id,
    tax_dv = p_tax_dv,
    primary_category = p_primary_category,
    specialties = p_specialties,
    experience_years = p_experience_years,
    work_areas = p_work_areas,
    professional_description = p_professional_description,
    company_logo_url = p_company_logo_url,
    portfolio_urls = p_portfolio_urls,
    certifications = p_certifications,
    availability = p_availability,
    preferred_contact_method = p_preferred_contact_method,
    emits_invoice = p_emits_invoice,
    has_transport = p_has_transport,
    work_mode = p_work_mode,
    doc_id_url = p_doc_id_url,
    doc_operation_notice_url = p_doc_operation_notice_url,
    doc_technical_certs_urls = p_doc_technical_certs_urls,
    doc_references_url = p_doc_references_url,
    doc_address_proof_url = p_doc_address_proof_url,
    updated_at = now()
  where id = (select app.current_user_id())
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile not found';
  end if;

  return updated_profile;
end;
$$;


--
-- Name: update_own_profile("text", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."update_own_profile"("p_full_name" "text", "p_phone" "text" DEFAULT NULL::"text") RETURNS "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  updated_profile public.profiles;
  normalized_name text := nullif(btrim(p_full_name), '');
  normalized_phone text := nullif(btrim(p_phone), '');
begin
  if (select app.current_user_id()) is null then
    raise exception 'Authentication required';
  end if;

  if normalized_name is null or char_length(normalized_name) < 2 then
    raise exception 'Full name must contain at least 2 characters';
  end if;

  if char_length(normalized_name) > 120 then
    raise exception 'Full name is too long';
  end if;

  if normalized_phone is not null and char_length(normalized_phone) > 30 then
    raise exception 'Phone number is too long';
  end if;

  update public.profiles
  set
    full_name = normalized_name,
    phone = normalized_phone,
    updated_at = now()
  where id = (select app.current_user_id())
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile not found';
  end if;

  return updated_profile;
end;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: budget_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."budget_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "budget_id" "uuid" NOT NULL,
    "section_id" "uuid",
    "catalog_item_id" "uuid",
    "calculation_run_id" "uuid",
    "item_type" "public"."budget_item_type" DEFAULT 'manual'::"public"."budget_item_type" NOT NULL,
    "description" "text" NOT NULL,
    "unit_name" "text" DEFAULT 'unidad'::"text" NOT NULL,
    "quantity" numeric(12,4) DEFAULT 1 NOT NULL,
    "unit_cost" numeric(12,2) DEFAULT 0 NOT NULL,
    "unit_price" numeric(12,2) DEFAULT 0 NOT NULL,
    "discount_percentage" numeric(5,2) DEFAULT 0 NOT NULL,
    "subtotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "taxable" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "platform_catalog_item_id" "uuid",
    CONSTRAINT "budget_items_description_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "description")) >= 2)),
    CONSTRAINT "budget_items_numbers_valid" CHECK ((("quantity" >= (0)::numeric) AND ("unit_cost" >= (0)::numeric) AND ("unit_price" >= (0)::numeric) AND ("discount_percentage" >= (0)::numeric) AND ("discount_percentage" <= (100)::numeric) AND ("subtotal" >= (0)::numeric)))
);


--
-- Name: TABLE "budget_items"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."budget_items" IS 'Partidas detalladas de materiales, mano de obra, equipos o servicios dentro de un presupuesto.';


--
-- Name: budget_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."budget_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "budget_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "budget_sections_name_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "name")) >= 2))
);


--
-- Name: TABLE "budget_sections"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."budget_sections" IS 'Secciones para organizar partidas dentro de un presupuesto.';


--
-- Name: budget_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."budget_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "budget_id" "uuid" NOT NULL,
    "version_number" integer NOT NULL,
    "snapshot_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "budget_versions_number_valid" CHECK (("version_number" >= 1))
);


--
-- Name: TABLE "budget_versions"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."budget_versions" IS 'Historial de versiones de presupuestos.';


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."budgets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "budget_number" "text" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "public"."budget_status" DEFAULT 'draft'::"public"."budget_status" NOT NULL,
    "currency_code" "text" DEFAULT 'USD'::"text" NOT NULL,
    "subtotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "discount_type" "public"."budget_discount_type" DEFAULT 'none'::"public"."budget_discount_type" NOT NULL,
    "discount_value" numeric(12,2) DEFAULT 0 NOT NULL,
    "discount_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "tax_rate" numeric(5,2) DEFAULT 7.00 NOT NULL,
    "tax_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "total" numeric(12,2) DEFAULT 0 NOT NULL,
    "valid_until" "date",
    "notes" "text",
    "terms" "text",
    "created_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "budgets_amounts_valid" CHECK ((("subtotal" >= (0)::numeric) AND ("discount_value" >= (0)::numeric) AND ("discount_amount" >= (0)::numeric) AND ("tax_rate" >= (0)::numeric) AND ("tax_rate" <= (100)::numeric) AND ("tax_amount" >= (0)::numeric) AND ("total" >= (0)::numeric))),
    CONSTRAINT "budgets_title_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "title")) >= 2)),
    CONSTRAINT "budgets_version_valid" CHECK (("version" >= 1))
);


--
-- Name: TABLE "budgets"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."budgets" IS 'Presupuestos generados por empresa, cliente y proyecto.';


--
-- Name: calculation_formula_parameter_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."calculation_formula_parameter_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "formula_id" "uuid" NOT NULL,
    "parameter_id" "uuid",
    "old_value" numeric(18,6),
    "new_value" numeric(18,6) NOT NULL,
    "changed_by" "uuid",
    "notes" "text",
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: calculation_formulas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."calculation_formulas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'general'::"text" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "calculation_formulas_category_check" CHECK (("category" = ANY (ARRAY['concrete'::"text", 'masonry'::"text", 'gypsum'::"text", 'ceiling'::"text", 'painting'::"text", 'flooring'::"text", 'electrical'::"text", 'plumbing'::"text", 'general'::"text"]))),
    CONSTRAINT "calculation_formulas_code_check" CHECK ((("code" = "lower"("code")) AND ("code" ~ '^[a-z0-9_]+$'::"text"))),
    CONSTRAINT "calculation_formulas_version_check" CHECK (("version" >= 1))
);


--
-- Name: catalog_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."catalog_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "parent_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "catalog_categories_name_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "name")) >= 2))
);


--
-- Name: TABLE "catalog_categories"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."catalog_categories" IS 'Categorías y subcategorías para materiales, mano de obra, servicios y equipos.';


--
-- Name: catalog_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."catalog_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "item_type" "public"."catalog_item_type" DEFAULT 'material'::"public"."catalog_item_type" NOT NULL,
    "category_id" "uuid",
    "sku" "text",
    "name" "text" NOT NULL,
    "description" "text",
    "unit_id" "uuid" NOT NULL,
    "unit_cost" numeric(12,2) DEFAULT 0 NOT NULL,
    "sale_price" numeric(12,2) DEFAULT 0 NOT NULL,
    "waste_percentage" numeric(5,2) DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "catalog_items_amounts_valid" CHECK ((("unit_cost" >= (0)::numeric) AND ("sale_price" >= (0)::numeric) AND ("waste_percentage" >= (0)::numeric) AND ("waste_percentage" <= (100)::numeric))),
    CONSTRAINT "catalog_items_name_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "name")) >= 2))
);


--
-- Name: TABLE "catalog_items"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."catalog_items" IS 'Materiales, mano de obra, equipos, servicios y subcontratos reutilizables.';


--
-- Name: catalog_price_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."catalog_price_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "catalog_item_id" "uuid" NOT NULL,
    "unit_cost" numeric(18,4) NOT NULL,
    "sale_price" numeric(18,4) NOT NULL,
    "source" "text",
    "notes" "text",
    "changed_by" "uuid",
    "effective_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "previous_unit_cost" numeric,
    "previous_sale_price" numeric,
    CONSTRAINT "catalog_price_history_cost_nonnegative" CHECK (("unit_cost" >= (0)::numeric)),
    CONSTRAINT "catalog_price_history_price_nonnegative" CHECK (("sale_price" >= (0)::numeric))
);


--
-- Name: catalog_yields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."catalog_yields" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "catalog_item_id" "uuid" NOT NULL,
    "output_unit_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "output_quantity" numeric(18,6) DEFAULT 1 NOT NULL,
    "labor_hours" numeric(18,4) DEFAULT 0 NOT NULL,
    "crew_size" numeric(10,2) DEFAULT 1 NOT NULL,
    "waste_percentage" numeric(7,4) DEFAULT 0 NOT NULL,
    "notes" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "catalog_yields_crew_positive" CHECK (("crew_size" > (0)::numeric)),
    CONSTRAINT "catalog_yields_hours_nonnegative" CHECK (("labor_hours" >= (0)::numeric)),
    CONSTRAINT "catalog_yields_name_not_blank" CHECK (("length"(TRIM(BOTH FROM "name")) > 0)),
    CONSTRAINT "catalog_yields_output_positive" CHECK (("output_quantity" > (0)::numeric)),
    CONSTRAINT "catalog_yields_waste_range" CHECK ((("waste_percentage" >= (0)::numeric) AND ("waste_percentage" <= (100)::numeric)))
);


--
-- Name: client_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."client_addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "label" "text" DEFAULT 'Principal'::"text" NOT NULL,
    "address" "text" NOT NULL,
    "province" "text",
    "district" "text",
    "township" "text",
    "reference" "text",
    "latitude" numeric(10,7),
    "longitude" numeric(10,7),
    "is_primary" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "client_addresses_address_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "address")) >= 3))
);


--
-- Name: TABLE "client_addresses"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."client_addresses" IS 'Direcciones asociadas a clientes.';


--
-- Name: client_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."client_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "position" "text",
    "email" "text",
    "phone" "text",
    "is_primary" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "client_contacts_name_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "name")) >= 2))
);


--
-- Name: TABLE "client_contacts"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."client_contacts" IS 'Contactos adicionales para clientes tipo empresa o clientes con varios responsables.';


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "client_type" "public"."client_type" DEFAULT 'person'::"public"."client_type" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "business_name" "text",
    "document_type" "text",
    "document_number" "text",
    "email" "text",
    "phone" "text",
    "secondary_phone" "text",
    "notes" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    CONSTRAINT "clients_name_required" CHECK (("char_length"(TRIM(BOTH FROM ((((COALESCE("first_name", ''::"text") || ' '::"text") || COALESCE("last_name", ''::"text")) || ' '::"text") || COALESCE("business_name", ''::"text")))) >= 2))
);


--
-- Name: TABLE "clients"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."clients" IS 'Clientes de cada empresa contratista.';


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "legal_name" "text",
    "tax_id" "text",
    "phone" "text",
    "email" "text",
    "address" "text",
    "logo_url" "text",
    "currency_code" "text" DEFAULT 'USD'::"text" NOT NULL,
    "tax_rate" numeric(5,2) DEFAULT 7.00 NOT NULL,
    "created_by" "uuid" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "timezone" "text" DEFAULT 'America/Panama'::"text" NOT NULL,
    "quotation_prefix" "text" DEFAULT 'COT'::"text" NOT NULL,
    "invoice_prefix" "text" DEFAULT 'FAC'::"text" NOT NULL,
    "receipt_prefix" "text" DEFAULT 'REC'::"text" NOT NULL,
    "project_prefix" "text" DEFAULT 'PR'::"text" NOT NULL,
    "payment_prefix" "text" DEFAULT 'ABO'::"text" NOT NULL,
    CONSTRAINT "companies_name_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "name")) >= 2)),
    CONSTRAINT "companies_tax_rate_valid" CHECK ((("tax_rate" >= (0)::numeric) AND ("tax_rate" <= (100)::numeric)))
);


--
-- Name: TABLE "companies"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."companies" IS 'Empresas o cuentas de contratistas registradas en la aplicación.';


--
-- Name: company_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."company_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."company_role" DEFAULT 'member'::"public"."company_role" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: TABLE "company_members"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."company_members" IS 'Relaciona usuarios con empresas y define su nivel de acceso.';


--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."company_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "company_settings_key_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "setting_key")) >= 2))
);


--
-- Name: TABLE "company_settings"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."company_settings" IS 'Configuraciones flexibles por empresa.';


--
-- Name: document_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."document_sequences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "document_type" "public"."document_type" NOT NULL,
    "prefix" "text" NOT NULL,
    "current_number" bigint DEFAULT 0 NOT NULL,
    "padding" integer DEFAULT 6 NOT NULL,
    "yearly_reset" boolean DEFAULT false NOT NULL,
    "last_reset_year" integer,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "document_sequences_current_number_valid" CHECK (("current_number" >= 0)),
    CONSTRAINT "document_sequences_padding_valid" CHECK ((("padding" >= 1) AND ("padding" <= 12))),
    CONSTRAINT "document_sequences_prefix_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "prefix")) >= 1))
);


--
-- Name: TABLE "document_sequences"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."document_sequences" IS 'Controla consecutivos por empresa para presupuestos, facturas, recibos y proyectos.';


--
-- Name: platform_catalog_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."platform_catalog_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "sku" "text",
    "name" "text" NOT NULL,
    "description" "text",
    "item_type" "public"."catalog_item_type" DEFAULT 'material'::"public"."catalog_item_type" NOT NULL,
    "category_name" "text",
    "unit_name" "text" DEFAULT 'Unidad'::"text" NOT NULL,
    "unit_symbol" "text" DEFAULT 'und.'::"text" NOT NULL,
    "default_unit_cost" numeric DEFAULT 0 NOT NULL,
    "default_sale_price" numeric DEFAULT 0 NOT NULL,
    "default_waste_percentage" numeric DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "platform_catalog_items_code_format" CHECK ((("code" = "lower"("code")) AND ("code" ~ '^[a-z0-9_:.-]+$'::"text"))),
    CONSTRAINT "platform_catalog_items_default_sale_price_check" CHECK (("default_sale_price" >= (0)::numeric)),
    CONSTRAINT "platform_catalog_items_default_unit_cost_check" CHECK (("default_unit_cost" >= (0)::numeric)),
    CONSTRAINT "platform_catalog_items_default_waste_check" CHECK ((("default_waste_percentage" >= (0)::numeric) AND ("default_waste_percentage" <= (100)::numeric)))
);


--
-- Name: user_catalog_price_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."user_catalog_price_overrides" (
    "user_id" "uuid" NOT NULL,
    "catalog_item_id" "uuid" NOT NULL,
    "unit_cost" numeric NOT NULL,
    "sale_price" numeric NOT NULL,
    "waste_percentage" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_catalog_price_overrides_sale_price_check" CHECK (("sale_price" >= (0)::numeric)),
    CONSTRAINT "user_catalog_price_overrides_unit_cost_check" CHECK (("unit_cost" >= (0)::numeric)),
    CONSTRAINT "user_catalog_price_overrides_waste_check" CHECK ((("waste_percentage" >= (0)::numeric) AND ("waste_percentage" <= (100)::numeric)))
);


--
-- Name: effective_platform_catalog_prices; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW "public"."effective_platform_catalog_prices" WITH ("security_invoker"='true') AS
 SELECT "catalog"."id",
    "catalog"."code",
    "catalog"."sku",
    "catalog"."name",
    "catalog"."description",
    "catalog"."item_type",
    "catalog"."category_name",
    "catalog"."unit_name",
    "catalog"."unit_symbol",
    "catalog"."default_unit_cost",
    "catalog"."default_sale_price",
    "catalog"."default_waste_percentage",
    COALESCE("overrides"."unit_cost", "catalog"."default_unit_cost") AS "unit_cost",
    COALESCE("overrides"."sale_price", "catalog"."default_sale_price") AS "sale_price",
    COALESCE("overrides"."waste_percentage", "catalog"."default_waste_percentage") AS "waste_percentage",
    ("overrides"."catalog_item_id" IS NOT NULL) AS "has_override",
    "catalog"."active",
    "catalog"."updated_at",
    "overrides"."updated_at" AS "override_updated_at"
   FROM ("public"."platform_catalog_items" "catalog"
     LEFT JOIN "public"."user_catalog_price_overrides" "overrides" ON ((("overrides"."catalog_item_id" = "catalog"."id") AND ("overrides"."user_id" = ( SELECT "app"."current_user_id"() AS "uid")))));


--
-- Name: platform_catalog_price_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."platform_catalog_price_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "catalog_item_id" "uuid" NOT NULL,
    "previous_unit_cost" numeric NOT NULL,
    "previous_sale_price" numeric NOT NULL,
    "previous_waste_percentage" numeric NOT NULL,
    "unit_cost" numeric NOT NULL,
    "sale_price" numeric NOT NULL,
    "waste_percentage" numeric NOT NULL,
    "source" "text",
    "notes" "text",
    "changed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: project_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."project_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."project_member_role" DEFAULT 'viewer'::"public"."project_member_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: TABLE "project_members"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."project_members" IS 'Usuarios asignados a cada proyecto.';


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "address_id" "uuid",
    "project_code" "text",
    "name" "text" NOT NULL,
    "description" "text",
    "status" "public"."project_status" DEFAULT 'lead'::"public"."project_status" NOT NULL,
    "start_date" "date",
    "estimated_end_date" "date",
    "actual_end_date" "date",
    "budget_estimate" numeric(12,2) DEFAULT 0 NOT NULL,
    "contract_value" numeric(12,2) DEFAULT 0 NOT NULL,
    "progress_percentage" numeric(5,2) DEFAULT 0 NOT NULL,
    "project_manager_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "projects_amounts_valid" CHECK ((("budget_estimate" >= (0)::numeric) AND ("contract_value" >= (0)::numeric))),
    CONSTRAINT "projects_name_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "name")) >= 2)),
    CONSTRAINT "projects_progress_valid" CHECK ((("progress_percentage" >= (0)::numeric) AND ("progress_percentage" <= (100)::numeric)))
);


--
-- Name: TABLE "projects"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."projects" IS 'Obras o proyectos asociados a clientes.';


--
-- Name: supplier_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."supplier_prices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "catalog_item_id" "uuid" NOT NULL,
    "price" numeric(12,2) DEFAULT 0 NOT NULL,
    "currency_code" "text" DEFAULT 'USD'::"text" NOT NULL,
    "effective_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "expires_at" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "supplier_prices_price_valid" CHECK (("price" >= (0)::numeric))
);


--
-- Name: TABLE "supplier_prices"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."supplier_prices" IS 'Historial de precios de catálogo por proveedor.';


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "tax_id" "text",
    "contact_name" "text",
    "phone" "text",
    "email" "text",
    "address" "text",
    "notes" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "suppliers_name_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "name")) >= 2))
);


--
-- Name: TABLE "suppliers"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."suppliers" IS 'Proveedores de materiales, equipos, servicios y subcontratos.';


--
-- Name: units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."units" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "symbol" "text" NOT NULL,
    "unit_type" "public"."unit_type" DEFAULT 'unit'::"public"."unit_type" NOT NULL,
    "conversion_factor" numeric(14,6) DEFAULT 1 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "units_code_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "code")) >= 1)),
    CONSTRAINT "units_conversion_factor_positive" CHECK (("conversion_factor" > (0)::numeric)),
    CONSTRAINT "units_conversion_factor_valid" CHECK (("conversion_factor" > (0)::numeric)),
    CONSTRAINT "units_name_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "name")) >= 2))
);


--
-- Name: TABLE "units"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."units" IS 'Unidades de medida usadas por catálogo, presupuestos y calculadoras.';


--
-- Name: budget_items budget_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_items"
    ADD CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id");


--
-- Name: budget_sections budget_sections_id_budget_company_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_sections"
    ADD CONSTRAINT "budget_sections_id_budget_company_unique" UNIQUE ("id", "budget_id", "company_id");


--
-- Name: budget_sections budget_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_sections"
    ADD CONSTRAINT "budget_sections_pkey" PRIMARY KEY ("id");


--
-- Name: budget_versions budget_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_versions"
    ADD CONSTRAINT "budget_versions_pkey" PRIMARY KEY ("id");


--
-- Name: budget_versions budget_versions_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_versions"
    ADD CONSTRAINT "budget_versions_unique" UNIQUE ("budget_id", "version_number");


--
-- Name: budgets budgets_id_company_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_id_company_unique" UNIQUE ("id", "company_id");


--
-- Name: budgets budgets_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_number_unique" UNIQUE ("company_id", "budget_number");


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_pkey" PRIMARY KEY ("id");


--
-- Name: calculation_formula_parameter_history calculation_formula_parameter_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."calculation_formula_parameter_history"
    ADD CONSTRAINT "calculation_formula_parameter_history_pkey" PRIMARY KEY ("id");


--
-- Name: calculation_formula_parameters calculation_formula_parameters_formula_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."calculation_formula_parameters"
    ADD CONSTRAINT "calculation_formula_parameters_formula_key" UNIQUE ("formula_id", "parameter_key");


--
-- Name: calculation_formula_parameters calculation_formula_parameters_id_company_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."calculation_formula_parameters"
    ADD CONSTRAINT "calculation_formula_parameters_id_company_key" UNIQUE ("id", "company_id");


--
-- Name: calculation_formula_parameters calculation_formula_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."calculation_formula_parameters"
    ADD CONSTRAINT "calculation_formula_parameters_pkey" PRIMARY KEY ("id");


--
-- Name: calculation_formulas calculation_formulas_company_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."calculation_formulas"
    ADD CONSTRAINT "calculation_formulas_company_code_key" UNIQUE ("company_id", "code");


--
-- Name: calculation_formulas calculation_formulas_id_company_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."calculation_formulas"
    ADD CONSTRAINT "calculation_formulas_id_company_key" UNIQUE ("id", "company_id");


--
-- Name: calculation_formulas calculation_formulas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."calculation_formulas"
    ADD CONSTRAINT "calculation_formulas_pkey" PRIMARY KEY ("id");


--
-- Name: catalog_categories catalog_categories_id_company_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_categories"
    ADD CONSTRAINT "catalog_categories_id_company_unique" UNIQUE ("id", "company_id");


--
-- Name: catalog_categories catalog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_categories"
    ADD CONSTRAINT "catalog_categories_pkey" PRIMARY KEY ("id");


--
-- Name: catalog_items catalog_items_company_sku_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_items"
    ADD CONSTRAINT "catalog_items_company_sku_unique" UNIQUE ("company_id", "sku");


--
-- Name: catalog_items catalog_items_id_company_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_items"
    ADD CONSTRAINT "catalog_items_id_company_unique" UNIQUE ("id", "company_id");


--
-- Name: catalog_items catalog_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_items"
    ADD CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id");


--
-- Name: catalog_price_history catalog_price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_price_history"
    ADD CONSTRAINT "catalog_price_history_pkey" PRIMARY KEY ("id");


--
-- Name: catalog_yields catalog_yields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_yields"
    ADD CONSTRAINT "catalog_yields_pkey" PRIMARY KEY ("id");


--
-- Name: client_addresses client_addresses_id_client_company_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."client_addresses"
    ADD CONSTRAINT "client_addresses_id_client_company_unique" UNIQUE ("id", "client_id", "company_id");


--
-- Name: client_addresses client_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."client_addresses"
    ADD CONSTRAINT "client_addresses_pkey" PRIMARY KEY ("id");


--
-- Name: client_contacts client_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."client_contacts"
    ADD CONSTRAINT "client_contacts_pkey" PRIMARY KEY ("id");


--
-- Name: clients clients_id_company_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_id_company_unique" UNIQUE ("id", "company_id");


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");


--
-- Name: company_members company_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_pkey" PRIMARY KEY ("id");


--
-- Name: company_members company_members_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_unique" UNIQUE ("company_id", "user_id");


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."company_settings"
    ADD CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id");


--
-- Name: company_settings company_settings_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."company_settings"
    ADD CONSTRAINT "company_settings_unique" UNIQUE ("company_id", "setting_key");


--
-- Name: document_sequences document_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."document_sequences"
    ADD CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("id");


--
-- Name: document_sequences document_sequences_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."document_sequences"
    ADD CONSTRAINT "document_sequences_unique" UNIQUE ("company_id", "document_type");


--
-- Name: platform_catalog_items platform_catalog_items_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."platform_catalog_items"
    ADD CONSTRAINT "platform_catalog_items_code_key" UNIQUE ("code");


--
-- Name: platform_catalog_items platform_catalog_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."platform_catalog_items"
    ADD CONSTRAINT "platform_catalog_items_pkey" PRIMARY KEY ("id");


--
-- Name: platform_catalog_price_history platform_catalog_price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."platform_catalog_price_history"
    ADD CONSTRAINT "platform_catalog_price_history_pkey" PRIMARY KEY ("id");


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_pkey" PRIMARY KEY ("id");


--
-- Name: project_members project_members_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_unique" UNIQUE ("project_id", "user_id");


--
-- Name: projects projects_id_company_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_id_company_unique" UNIQUE ("id", "company_id");


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");


--
-- Name: supplier_prices supplier_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."supplier_prices"
    ADD CONSTRAINT "supplier_prices_pkey" PRIMARY KEY ("id");


--
-- Name: suppliers suppliers_id_company_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_id_company_unique" UNIQUE ("id", "company_id");


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");


--
-- Name: units units_company_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_company_code_unique" UNIQUE ("company_id", "code");


--
-- Name: units units_id_company_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_id_company_unique" UNIQUE ("id", "company_id");


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_pkey" PRIMARY KEY ("id");


--
-- Name: user_catalog_price_overrides user_catalog_price_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_catalog_price_overrides"
    ADD CONSTRAINT "user_catalog_price_overrides_pkey" PRIMARY KEY ("user_id", "catalog_item_id");


--
-- Name: budget_items_budget_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_items_budget_idx" ON "public"."budget_items" USING "btree" ("budget_id");


--
-- Name: budget_items_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_items_company_idx" ON "public"."budget_items" USING "btree" ("company_id");


--
-- Name: budget_items_platform_catalog_item_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_items_platform_catalog_item_idx" ON "public"."budget_items" USING "btree" ("platform_catalog_item_id");


--
-- Name: budget_items_section_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_items_section_idx" ON "public"."budget_items" USING "btree" ("section_id");


--
-- Name: budget_items_sort_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_items_sort_idx" ON "public"."budget_items" USING "btree" ("budget_id", "section_id", "sort_order");


--
-- Name: budget_sections_budget_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_sections_budget_idx" ON "public"."budget_sections" USING "btree" ("budget_id");


--
-- Name: budget_sections_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_sections_company_idx" ON "public"."budget_sections" USING "btree" ("company_id");


--
-- Name: budget_sections_sort_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_sections_sort_idx" ON "public"."budget_sections" USING "btree" ("budget_id", "sort_order");


--
-- Name: budget_versions_budget_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_versions_budget_idx" ON "public"."budget_versions" USING "btree" ("budget_id");


--
-- Name: budget_versions_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_versions_company_idx" ON "public"."budget_versions" USING "btree" ("company_id");


--
-- Name: budgets_client_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budgets_client_idx" ON "public"."budgets" USING "btree" ("client_id");


--
-- Name: budgets_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budgets_company_idx" ON "public"."budgets" USING "btree" ("company_id");


--
-- Name: budgets_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budgets_created_at_idx" ON "public"."budgets" USING "btree" ("company_id", "created_at" DESC);


--
-- Name: budgets_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budgets_project_idx" ON "public"."budgets" USING "btree" ("project_id");


--
-- Name: budgets_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budgets_status_idx" ON "public"."budgets" USING "btree" ("company_id", "status");


--
-- Name: calculation_formula_history_formula_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calculation_formula_history_formula_idx" ON "public"."calculation_formula_parameter_history" USING "btree" ("company_id", "formula_id", "changed_at" DESC);


--
-- Name: calculation_formula_parameters_formula_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calculation_formula_parameters_formula_idx" ON "public"."calculation_formula_parameters" USING "btree" ("company_id", "formula_id", "active", "sort_order");


--
-- Name: calculation_formulas_company_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calculation_formulas_company_active_idx" ON "public"."calculation_formulas" USING "btree" ("company_id", "active", "category");


--
-- Name: calculation_formulas_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calculation_formulas_company_idx" ON "public"."calculation_formulas" USING "btree" ("company_id", "active", "name");


--
-- Name: catalog_categories_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_categories_active_idx" ON "public"."catalog_categories" USING "btree" ("company_id", "active");


--
-- Name: catalog_categories_child_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "catalog_categories_child_name_key" ON "public"."catalog_categories" USING "btree" ("company_id", "parent_id", "lower"("name")) WHERE ("parent_id" IS NOT NULL);


--
-- Name: catalog_categories_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_categories_company_idx" ON "public"."catalog_categories" USING "btree" ("company_id");


--
-- Name: catalog_categories_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_categories_parent_idx" ON "public"."catalog_categories" USING "btree" ("company_id", "parent_id");


--
-- Name: catalog_categories_root_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "catalog_categories_root_name_key" ON "public"."catalog_categories" USING "btree" ("company_id", "lower"("name")) WHERE ("parent_id" IS NULL);


--
-- Name: catalog_items_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_items_active_idx" ON "public"."catalog_items" USING "btree" ("company_id", "active");


--
-- Name: catalog_items_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_items_category_idx" ON "public"."catalog_items" USING "btree" ("company_id", "category_id");


--
-- Name: catalog_items_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_items_company_idx" ON "public"."catalog_items" USING "btree" ("company_id");


--
-- Name: catalog_items_company_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_items_company_name_idx" ON "public"."catalog_items" USING "btree" ("company_id", "lower"("name"));


--
-- Name: catalog_items_company_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "catalog_items_company_sku_key" ON "public"."catalog_items" USING "btree" ("company_id", "lower"("sku")) WHERE (("sku" IS NOT NULL) AND ("length"(TRIM(BOTH FROM "sku")) > 0));


--
-- Name: catalog_items_company_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_items_company_type_idx" ON "public"."catalog_items" USING "btree" ("company_id", "item_type", "active");


--
-- Name: catalog_items_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_items_name_idx" ON "public"."catalog_items" USING "btree" ("company_id", "name");


--
-- Name: catalog_items_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_items_type_idx" ON "public"."catalog_items" USING "btree" ("company_id", "item_type");


--
-- Name: catalog_price_history_company_effective_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_price_history_company_effective_idx" ON "public"."catalog_price_history" USING "btree" ("company_id", "effective_at" DESC);


--
-- Name: catalog_price_history_item_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_price_history_item_date_idx" ON "public"."catalog_price_history" USING "btree" ("company_id", "catalog_item_id", "effective_at" DESC);


--
-- Name: catalog_yields_company_item_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "catalog_yields_company_item_idx" ON "public"."catalog_yields" USING "btree" ("company_id", "catalog_item_id", "active");


--
-- Name: client_addresses_client_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "client_addresses_client_idx" ON "public"."client_addresses" USING "btree" ("client_id");


--
-- Name: client_addresses_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "client_addresses_company_idx" ON "public"."client_addresses" USING "btree" ("company_id");


--
-- Name: client_addresses_one_primary_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "client_addresses_one_primary_idx" ON "public"."client_addresses" USING "btree" ("company_id", "client_id") WHERE ("is_primary" = true);


--
-- Name: client_contacts_client_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "client_contacts_client_idx" ON "public"."client_contacts" USING "btree" ("client_id");


--
-- Name: client_contacts_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "client_contacts_company_idx" ON "public"."client_contacts" USING "btree" ("company_id");


--
-- Name: client_contacts_one_primary_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "client_contacts_one_primary_idx" ON "public"."client_contacts" USING "btree" ("company_id", "client_id") WHERE ("is_primary" = true);


--
-- Name: clients_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "clients_active_idx" ON "public"."clients" USING "btree" ("company_id", "active");


--
-- Name: clients_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "clients_company_idx" ON "public"."clients" USING "btree" ("company_id");


--
-- Name: clients_document_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "clients_document_unique_idx" ON "public"."clients" USING "btree" ("company_id", "lower"("document_number")) WHERE (("document_number" IS NOT NULL) AND (TRIM(BOTH FROM "document_number") <> ''::"text"));


--
-- Name: clients_search_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "clients_search_idx" ON "public"."clients" USING "btree" ("company_id", "first_name", "last_name", "business_name");


--
-- Name: clients_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "clients_user_id_idx" ON "public"."clients" USING "btree" ("user_id") WHERE ("user_id" IS NOT NULL);


--
-- Name: companies_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "companies_active_idx" ON "public"."companies" USING "btree" ("active");


--
-- Name: companies_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "companies_created_by_idx" ON "public"."companies" USING "btree" ("created_by");


--
-- Name: company_members_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "company_members_company_idx" ON "public"."company_members" USING "btree" ("company_id");


--
-- Name: company_members_company_user_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "company_members_company_user_active_idx" ON "public"."company_members" USING "btree" ("company_id", "user_id", "active");


--
-- Name: company_members_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "company_members_user_idx" ON "public"."company_members" USING "btree" ("user_id");


--
-- Name: platform_catalog_items_active_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "platform_catalog_items_active_type_idx" ON "public"."platform_catalog_items" USING "btree" ("active", "item_type", "name");


--
-- Name: platform_catalog_items_identity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "platform_catalog_items_identity_idx" ON "public"."platform_catalog_items" USING "btree" ("lower"("name"), "item_type", "lower"("unit_symbol"));


--
-- Name: platform_catalog_price_history_item_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "platform_catalog_price_history_item_idx" ON "public"."platform_catalog_price_history" USING "btree" ("catalog_item_id", "created_at" DESC);


--
-- Name: profiles_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "profiles_active_idx" ON "public"."profiles" USING "btree" ("active");


--
-- Name: project_members_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "project_members_company_idx" ON "public"."project_members" USING "btree" ("company_id");


--
-- Name: project_members_project_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "project_members_project_idx" ON "public"."project_members" USING "btree" ("project_id");


--
-- Name: project_members_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "project_members_user_idx" ON "public"."project_members" USING "btree" ("user_id");


--
-- Name: projects_client_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "projects_client_idx" ON "public"."projects" USING "btree" ("client_id");


--
-- Name: projects_code_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "projects_code_unique_idx" ON "public"."projects" USING "btree" ("company_id", "lower"("project_code")) WHERE (("project_code" IS NOT NULL) AND (TRIM(BOTH FROM "project_code") <> ''::"text"));


--
-- Name: projects_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "projects_company_idx" ON "public"."projects" USING "btree" ("company_id");


--
-- Name: projects_manager_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "projects_manager_idx" ON "public"."projects" USING "btree" ("project_manager_id");


--
-- Name: projects_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "projects_status_idx" ON "public"."projects" USING "btree" ("company_id", "status");


--
-- Name: supplier_prices_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_prices_company_idx" ON "public"."supplier_prices" USING "btree" ("company_id");


--
-- Name: supplier_prices_effective_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_prices_effective_idx" ON "public"."supplier_prices" USING "btree" ("company_id", "effective_date" DESC);


--
-- Name: supplier_prices_item_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_prices_item_idx" ON "public"."supplier_prices" USING "btree" ("company_id", "catalog_item_id");


--
-- Name: supplier_prices_supplier_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_prices_supplier_idx" ON "public"."supplier_prices" USING "btree" ("company_id", "supplier_id");


--
-- Name: suppliers_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "suppliers_active_idx" ON "public"."suppliers" USING "btree" ("company_id", "active");


--
-- Name: suppliers_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "suppliers_company_idx" ON "public"."suppliers" USING "btree" ("company_id");


--
-- Name: suppliers_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "suppliers_name_idx" ON "public"."suppliers" USING "btree" ("company_id", "name");


--
-- Name: units_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "units_active_idx" ON "public"."units" USING "btree" ("company_id", "active");


--
-- Name: units_company_active_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "units_company_active_type_idx" ON "public"."units" USING "btree" ("company_id", "active", "unit_type");


--
-- Name: units_company_code_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "units_company_code_unique_idx" ON "public"."units" USING "btree" ("company_id", "upper"("code"));


--
-- Name: units_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "units_company_idx" ON "public"."units" USING "btree" ("company_id");


--
-- Name: user_catalog_price_overrides_item_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_catalog_price_overrides_item_idx" ON "public"."user_catalog_price_overrides" USING "btree" ("catalog_item_id");


--
-- Name: budget_items budget_items_recalculate_totals; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "budget_items_recalculate_totals" AFTER INSERT OR DELETE OR UPDATE ON "public"."budget_items" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_recalculate_budget_totals"();


--
-- Name: budget_items budget_items_set_subtotal; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "budget_items_set_subtotal" BEFORE INSERT OR UPDATE ON "public"."budget_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_budget_item_subtotal"();


--
-- Name: budget_items budget_items_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "budget_items_set_updated_at" BEFORE UPDATE ON "public"."budget_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: budget_sections budget_sections_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "budget_sections_set_updated_at" BEFORE UPDATE ON "public"."budget_sections" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: budgets budgets_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "budgets_set_updated_at" BEFORE UPDATE ON "public"."budgets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: calculation_formula_parameters calculation_formula_parameters_log_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "calculation_formula_parameters_log_change" AFTER UPDATE OF "numeric_value" ON "public"."calculation_formula_parameters" FOR EACH ROW EXECUTE FUNCTION "public"."log_formula_parameter_change"();


--
-- Name: calculation_formula_parameters calculation_formula_parameters_touch_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "calculation_formula_parameters_touch_updated_at" BEFORE UPDATE ON "public"."calculation_formula_parameters" FOR EACH ROW EXECUTE FUNCTION "private"."touch_updated_at"();


--
-- Name: calculation_formulas calculation_formulas_touch_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "calculation_formulas_touch_updated_at" BEFORE UPDATE ON "public"."calculation_formulas" FOR EACH ROW EXECUTE FUNCTION "private"."touch_updated_at"();


--
-- Name: catalog_categories catalog_categories_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "catalog_categories_set_updated_at" BEFORE UPDATE ON "public"."catalog_categories" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: catalog_items catalog_items_log_price_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "catalog_items_log_price_change" AFTER UPDATE OF "unit_cost", "sale_price" ON "public"."catalog_items" FOR EACH ROW EXECUTE FUNCTION "public"."log_catalog_price_change"();


--
-- Name: catalog_items catalog_items_record_price; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "catalog_items_record_price" AFTER INSERT OR UPDATE OF "unit_cost", "sale_price" ON "public"."catalog_items" FOR EACH ROW EXECUTE FUNCTION "public"."record_catalog_price_history"();


--
-- Name: catalog_items catalog_items_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "catalog_items_set_updated_at" BEFORE UPDATE ON "public"."catalog_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: catalog_yields catalog_yields_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "catalog_yields_set_updated_at" BEFORE UPDATE ON "public"."catalog_yields" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: client_addresses client_addresses_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "client_addresses_set_updated_at" BEFORE UPDATE ON "public"."client_addresses" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: client_contacts client_contacts_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "client_contacts_set_updated_at" BEFORE UPDATE ON "public"."client_contacts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: clients clients_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "clients_set_updated_at" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: companies companies_seed_default_units; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "companies_seed_default_units" AFTER INSERT ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."seed_units_after_company_insert"();


--
-- Name: companies companies_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "companies_set_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: company_members company_members_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "company_members_set_updated_at" BEFORE UPDATE ON "public"."company_members" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: company_settings company_settings_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "company_settings_set_updated_at" BEFORE UPDATE ON "public"."company_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: profiles on_profile_created_link_client; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "on_profile_created_link_client" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_client_auto_link"();


--
-- Name: platform_catalog_items platform_catalog_items_touch_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "platform_catalog_items_touch_updated_at" BEFORE UPDATE ON "public"."platform_catalog_items" FOR EACH ROW EXECUTE FUNCTION "private"."touch_updated_at"();


--
-- Name: profiles profiles_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "profiles_set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: profiles profiles_update_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "profiles_update_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: projects projects_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "projects_set_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: profiles protect_profile_approval; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "protect_profile_approval" BEFORE UPDATE OF "active", "approved_at", "approved_by" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_unauthorized_profile_approval_change"();


--
-- Name: profiles protect_profile_role; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "protect_profile_role" BEFORE UPDATE OF "role" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_unauthorized_profile_role_change"();


--
-- Name: companies seed_company_calculation_defaults; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "seed_company_calculation_defaults" AFTER INSERT ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "private"."handle_company_calculation_defaults"();


--
-- Name: suppliers suppliers_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "suppliers_set_updated_at" BEFORE UPDATE ON "public"."suppliers" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: units units_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "units_set_updated_at" BEFORE UPDATE ON "public"."units" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


--
-- Name: user_catalog_price_overrides user_catalog_price_overrides_touch_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "user_catalog_price_overrides_touch_updated_at" BEFORE UPDATE ON "public"."user_catalog_price_overrides" FOR EACH ROW EXECUTE FUNCTION "private"."touch_updated_at"();


--
-- Name: budget_items budget_items_budget_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_items"
    ADD CONSTRAINT "budget_items_budget_fk" FOREIGN KEY ("budget_id", "company_id") REFERENCES "public"."budgets"("id", "company_id") ON DELETE CASCADE;


--
-- Name: budget_items budget_items_catalog_item_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_items"
    ADD CONSTRAINT "budget_items_catalog_item_fk" FOREIGN KEY ("catalog_item_id", "company_id") REFERENCES "public"."catalog_items"("id", "company_id") ON DELETE RESTRICT;


--
-- Name: budget_items budget_items_platform_catalog_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_items"
    ADD CONSTRAINT "budget_items_platform_catalog_item_id_fkey" FOREIGN KEY ("platform_catalog_item_id") REFERENCES "public"."platform_catalog_items"("id") ON DELETE SET NULL;


--
-- Name: budget_items budget_items_section_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_items"
    ADD CONSTRAINT "budget_items_section_fk" FOREIGN KEY ("section_id", "budget_id", "company_id") REFERENCES "public"."budget_sections"("id", "budget_id", "company_id") ON DELETE SET NULL;


--
-- Name: budget_sections budget_sections_budget_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_sections"
    ADD CONSTRAINT "budget_sections_budget_fk" FOREIGN KEY ("budget_id", "company_id") REFERENCES "public"."budgets"("id", "company_id") ON DELETE CASCADE;


--
-- Name: budget_versions budget_versions_budget_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_versions"
    ADD CONSTRAINT "budget_versions_budget_fk" FOREIGN KEY ("budget_id", "company_id") REFERENCES "public"."budgets"("id", "company_id") ON DELETE CASCADE;


--
-- Name: budget_versions budget_versions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budget_versions"
    ADD CONSTRAINT "budget_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id");


--
-- Name: budgets budgets_client_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_client_fk" FOREIGN KEY ("client_id", "company_id") REFERENCES "public"."clients"("id", "company_id") ON DELETE CASCADE;


--
-- Name: budgets budgets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id");


--
-- Name: budgets budgets_project_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_project_fk" FOREIGN KEY ("project_id", "company_id") REFERENCES "public"."projects"("id", "company_id") ON DELETE CASCADE;


--
-- Name: calculation_formula_parameter_history calculation_formula_history_formula_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."calculation_formula_parameter_history"
    ADD CONSTRAINT "calculation_formula_history_formula_fk" FOREIGN KEY ("formula_id", "company_id") REFERENCES "public"."calculation_formulas"("id", "company_id") ON DELETE CASCADE;


--
-- Name: calculation_formula_parameters calculation_formula_parameters_formula_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."calculation_formula_parameters"
    ADD CONSTRAINT "calculation_formula_parameters_formula_fk" FOREIGN KEY ("formula_id", "company_id") REFERENCES "public"."calculation_formulas"("id", "company_id") ON DELETE CASCADE;


--
-- Name: calculation_formulas calculation_formulas_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."calculation_formulas"
    ADD CONSTRAINT "calculation_formulas_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;


--
-- Name: catalog_categories catalog_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_categories"
    ADD CONSTRAINT "catalog_categories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;


--
-- Name: catalog_categories catalog_categories_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_categories"
    ADD CONSTRAINT "catalog_categories_parent_fk" FOREIGN KEY ("parent_id", "company_id") REFERENCES "public"."catalog_categories"("id", "company_id") ON DELETE CASCADE;


--
-- Name: catalog_items catalog_items_category_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_items"
    ADD CONSTRAINT "catalog_items_category_fk" FOREIGN KEY ("category_id", "company_id") REFERENCES "public"."catalog_categories"("id", "company_id") ON DELETE RESTRICT;


--
-- Name: catalog_items catalog_items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_items"
    ADD CONSTRAINT "catalog_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;


--
-- Name: catalog_items catalog_items_unit_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_items"
    ADD CONSTRAINT "catalog_items_unit_fk" FOREIGN KEY ("unit_id", "company_id") REFERENCES "public"."units"("id", "company_id") ON DELETE RESTRICT;


--
-- Name: catalog_price_history catalog_price_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_price_history"
    ADD CONSTRAINT "catalog_price_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "app_auth"."users"("id") ON DELETE SET NULL;


--
-- Name: catalog_price_history catalog_price_history_item_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_price_history"
    ADD CONSTRAINT "catalog_price_history_item_fk" FOREIGN KEY ("catalog_item_id", "company_id") REFERENCES "public"."catalog_items"("id", "company_id") ON DELETE CASCADE;


--
-- Name: catalog_yields catalog_yields_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_yields"
    ADD CONSTRAINT "catalog_yields_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;


--
-- Name: catalog_yields catalog_yields_item_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_yields"
    ADD CONSTRAINT "catalog_yields_item_fk" FOREIGN KEY ("catalog_item_id", "company_id") REFERENCES "public"."catalog_items"("id", "company_id") ON DELETE CASCADE;


--
-- Name: catalog_yields catalog_yields_output_unit_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."catalog_yields"
    ADD CONSTRAINT "catalog_yields_output_unit_fk" FOREIGN KEY ("output_unit_id", "company_id") REFERENCES "public"."units"("id", "company_id") ON DELETE RESTRICT;


--
-- Name: client_addresses client_addresses_client_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."client_addresses"
    ADD CONSTRAINT "client_addresses_client_fk" FOREIGN KEY ("client_id", "company_id") REFERENCES "public"."clients"("id", "company_id") ON DELETE CASCADE;


--
-- Name: client_contacts client_contacts_client_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."client_contacts"
    ADD CONSTRAINT "client_contacts_client_fk" FOREIGN KEY ("client_id", "company_id") REFERENCES "public"."clients"("id", "company_id") ON DELETE CASCADE;


--
-- Name: clients clients_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;


--
-- Name: clients clients_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id");


--
-- Name: clients clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;


--
-- Name: companies companies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id");


--
-- Name: company_members company_members_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;


--
-- Name: company_members company_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_auth"."users"("id") ON DELETE CASCADE;


--
-- Name: company_members company_members_user_profile_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_user_profile_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: company_settings company_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."company_settings"
    ADD CONSTRAINT "company_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;


--
-- Name: document_sequences document_sequences_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."document_sequences"
    ADD CONSTRAINT "document_sequences_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;


--
-- Name: platform_catalog_price_history platform_catalog_price_history_catalog_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."platform_catalog_price_history"
    ADD CONSTRAINT "platform_catalog_price_history_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."platform_catalog_items"("id") ON DELETE CASCADE;


--
-- Name: platform_catalog_price_history platform_catalog_price_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."platform_catalog_price_history"
    ADD CONSTRAINT "platform_catalog_price_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;


--
-- Name: profiles profiles_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "app_auth"."users"("id") ON DELETE CASCADE;


--
-- Name: project_members project_members_company_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_company_user_fk" FOREIGN KEY ("company_id", "user_id") REFERENCES "public"."company_members"("company_id", "user_id") ON DELETE CASCADE;


--
-- Name: project_members project_members_project_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_project_fk" FOREIGN KEY ("project_id", "company_id") REFERENCES "public"."projects"("id", "company_id") ON DELETE CASCADE;


--
-- Name: projects projects_address_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_address_fk" FOREIGN KEY ("address_id", "client_id", "company_id") REFERENCES "public"."client_addresses"("id", "client_id", "company_id") ON DELETE SET NULL;


--
-- Name: projects projects_client_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_client_fk" FOREIGN KEY ("client_id", "company_id") REFERENCES "public"."clients"("id", "company_id") ON DELETE CASCADE;


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id");


--
-- Name: projects projects_project_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_project_manager_id_fkey" FOREIGN KEY ("project_manager_id") REFERENCES "app_auth"."users"("id");


--
-- Name: supplier_prices supplier_prices_catalog_item_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."supplier_prices"
    ADD CONSTRAINT "supplier_prices_catalog_item_fk" FOREIGN KEY ("catalog_item_id", "company_id") REFERENCES "public"."catalog_items"("id", "company_id") ON DELETE RESTRICT;


--
-- Name: supplier_prices supplier_prices_supplier_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."supplier_prices"
    ADD CONSTRAINT "supplier_prices_supplier_fk" FOREIGN KEY ("supplier_id", "company_id") REFERENCES "public"."suppliers"("id", "company_id") ON DELETE CASCADE;


--
-- Name: suppliers suppliers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;


--
-- Name: units units_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;


--
-- Name: user_catalog_price_overrides user_catalog_price_overrides_catalog_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_catalog_price_overrides"
    ADD CONSTRAINT "user_catalog_price_overrides_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."platform_catalog_items"("id") ON DELETE CASCADE;


--
-- Name: user_catalog_price_overrides user_catalog_price_overrides_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_catalog_price_overrides"
    ADD CONSTRAINT "user_catalog_price_overrides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: company_members Admins can add company members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can add company members" ON "public"."company_members" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: budget_versions Admins can delete budget versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete budget versions" ON "public"."budget_versions" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: budgets Admins can delete budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete budgets" ON "public"."budgets" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: catalog_categories Admins can delete catalog categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete catalog categories" ON "public"."catalog_categories" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: catalog_items Admins can delete catalog items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete catalog items" ON "public"."catalog_items" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: client_addresses Admins can delete client addresses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete client addresses" ON "public"."client_addresses" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: client_contacts Admins can delete client contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete client contacts" ON "public"."client_contacts" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: clients Admins can delete clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete clients" ON "public"."clients" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: company_settings Admins can delete company settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete company settings" ON "public"."company_settings" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: project_members Admins can delete project members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete project members" ON "public"."project_members" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: projects Admins can delete projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete projects" ON "public"."projects" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: supplier_prices Admins can delete supplier prices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete supplier prices" ON "public"."supplier_prices" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: suppliers Admins can delete suppliers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete suppliers" ON "public"."suppliers" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: units Admins can delete units; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete units" ON "public"."units" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: catalog_categories Admins can insert catalog categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert catalog categories" ON "public"."catalog_categories" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: catalog_items Admins can insert catalog items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert catalog items" ON "public"."catalog_items" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: company_settings Admins can insert company settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert company settings" ON "public"."company_settings" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: document_sequences Admins can insert document sequences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert document sequences" ON "public"."document_sequences" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: project_members Admins can insert project members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert project members" ON "public"."project_members" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: supplier_prices Admins can insert supplier prices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert supplier prices" ON "public"."supplier_prices" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: suppliers Admins can insert suppliers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert suppliers" ON "public"."suppliers" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: units Admins can insert units; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert units" ON "public"."units" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: catalog_categories Admins can update catalog categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update catalog categories" ON "public"."catalog_categories" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: catalog_items Admins can update catalog items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update catalog items" ON "public"."catalog_items" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: companies Admins can update companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update companies" ON "public"."companies" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("id")) WITH CHECK ("public"."is_company_admin"("id"));


--
-- Name: company_members Admins can update company members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update company members" ON "public"."company_members" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: company_settings Admins can update company settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update company settings" ON "public"."company_settings" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: document_sequences Admins can update document sequences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update document sequences" ON "public"."document_sequences" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: project_members Admins can update project members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update project members" ON "public"."project_members" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: supplier_prices Admins can update supplier prices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update supplier prices" ON "public"."supplier_prices" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: suppliers Admins can update suppliers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update suppliers" ON "public"."suppliers" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: units Admins can update units; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update units" ON "public"."units" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: companies Authenticated users can create companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create companies" ON "public"."companies" FOR INSERT TO "contractor_api" WITH CHECK (("created_by" = "app"."current_user_id"()));


--
-- Name: profiles Company members can read related profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company members can read related profiles" ON "public"."profiles" FOR SELECT TO "contractor_api" USING ((EXISTS ( SELECT 1
   FROM ("public"."company_members" "my_membership"
     JOIN "public"."company_members" "related_membership" ON (("related_membership"."company_id" = "my_membership"."company_id")))
  WHERE (("my_membership"."user_id" = "app"."current_user_id"()) AND ("my_membership"."active" = true) AND ("related_membership"."user_id" = "profiles"."id") AND ("related_membership"."active" = true)))));


--
-- Name: budget_items Members can delete budget items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can delete budget items" ON "public"."budget_items" FOR DELETE TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: budget_sections Members can delete budget sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can delete budget sections" ON "public"."budget_sections" FOR DELETE TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: budget_items Members can insert budget items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can insert budget items" ON "public"."budget_items" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_member"("company_id"));


--
-- Name: budget_sections Members can insert budget sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can insert budget sections" ON "public"."budget_sections" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_member"("company_id"));


--
-- Name: budget_versions Members can insert budget versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can insert budget versions" ON "public"."budget_versions" FOR INSERT TO "contractor_api" WITH CHECK (("public"."is_company_member"("company_id") AND ("created_by" = "app"."current_user_id"())));


--
-- Name: budgets Members can insert budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can insert budgets" ON "public"."budgets" FOR INSERT TO "contractor_api" WITH CHECK (("public"."is_company_member"("company_id") AND ("created_by" = "app"."current_user_id"())));


--
-- Name: client_addresses Members can insert client addresses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can insert client addresses" ON "public"."client_addresses" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_member"("company_id"));


--
-- Name: client_contacts Members can insert client contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can insert client contacts" ON "public"."client_contacts" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_member"("company_id"));


--
-- Name: clients Members can insert clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can insert clients" ON "public"."clients" FOR INSERT TO "contractor_api" WITH CHECK (("public"."is_company_member"("company_id") AND ("created_by" = "app"."current_user_id"())));


--
-- Name: projects Members can insert projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can insert projects" ON "public"."projects" FOR INSERT TO "contractor_api" WITH CHECK (("public"."is_company_member"("company_id") AND ("created_by" = "app"."current_user_id"())));


--
-- Name: budget_items Members can read budget items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read budget items" ON "public"."budget_items" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: budget_sections Members can read budget sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read budget sections" ON "public"."budget_sections" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: budget_versions Members can read budget versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read budget versions" ON "public"."budget_versions" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: budgets Members can read budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read budgets" ON "public"."budgets" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: catalog_categories Members can read catalog categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read catalog categories" ON "public"."catalog_categories" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: catalog_items Members can read catalog items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read catalog items" ON "public"."catalog_items" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: client_addresses Members can read client addresses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read client addresses" ON "public"."client_addresses" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: client_contacts Members can read client contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read client contacts" ON "public"."client_contacts" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: clients Members can read clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read clients" ON "public"."clients" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: company_members Members can read company memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read company memberships" ON "public"."company_members" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: company_settings Members can read company settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read company settings" ON "public"."company_settings" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: document_sequences Members can read document sequences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read document sequences" ON "public"."document_sequences" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: project_members Members can read project members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read project members" ON "public"."project_members" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: projects Members can read projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read projects" ON "public"."projects" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: supplier_prices Members can read supplier prices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read supplier prices" ON "public"."supplier_prices" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: suppliers Members can read suppliers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read suppliers" ON "public"."suppliers" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: companies Members can read their companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read their companies" ON "public"."companies" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("id"));


--
-- Name: units Members can read units; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can read units" ON "public"."units" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: budget_items Members can update budget items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can update budget items" ON "public"."budget_items" FOR UPDATE TO "contractor_api" USING ("public"."is_company_member"("company_id")) WITH CHECK ("public"."is_company_member"("company_id"));


--
-- Name: budget_sections Members can update budget sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can update budget sections" ON "public"."budget_sections" FOR UPDATE TO "contractor_api" USING ("public"."is_company_member"("company_id")) WITH CHECK ("public"."is_company_member"("company_id"));


--
-- Name: budgets Members can update budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can update budgets" ON "public"."budgets" FOR UPDATE TO "contractor_api" USING ("public"."is_company_member"("company_id")) WITH CHECK ("public"."is_company_member"("company_id"));


--
-- Name: client_addresses Members can update client addresses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can update client addresses" ON "public"."client_addresses" FOR UPDATE TO "contractor_api" USING ("public"."is_company_member"("company_id")) WITH CHECK ("public"."is_company_member"("company_id"));


--
-- Name: client_contacts Members can update client contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can update client contacts" ON "public"."client_contacts" FOR UPDATE TO "contractor_api" USING ("public"."is_company_member"("company_id")) WITH CHECK ("public"."is_company_member"("company_id"));


--
-- Name: clients Members can update clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can update clients" ON "public"."clients" FOR UPDATE TO "contractor_api" USING ("public"."is_company_member"("company_id")) WITH CHECK ("public"."is_company_member"("company_id"));


--
-- Name: projects Members can update projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can update projects" ON "public"."projects" FOR UPDATE TO "contractor_api" USING ("public"."is_company_member"("company_id")) WITH CHECK ("public"."is_company_member"("company_id"));


--
-- Name: companies Owners can delete companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can delete companies" ON "public"."companies" FOR DELETE TO "contractor_api" USING ("public"."is_company_owner"("id"));


--
-- Name: company_members Owners can delete company members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can delete company members" ON "public"."company_members" FOR DELETE TO "contractor_api" USING (("public"."is_company_owner"("company_id") AND ("user_id" <> "app"."current_user_id"())));


--
-- Name: document_sequences Owners can delete document sequences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can delete document sequences" ON "public"."document_sequences" FOR DELETE TO "contractor_api" USING ("public"."is_company_owner"("company_id"));


--
-- Name: profiles Users can read own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT TO "contractor_api" USING (("id" = "app"."current_user_id"()));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "contractor_api" USING (("id" = "app"."current_user_id"())) WITH CHECK (("id" = "app"."current_user_id"()));


--
-- Name: platform_catalog_items active_users_read_platform_catalog; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "active_users_read_platform_catalog" ON "public"."platform_catalog_items" FOR SELECT TO "contractor_api" USING ((( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user") AND (("active" = true) OR ( SELECT "private"."is_super_admin"() AS "is_super_admin"))));


--
-- Name: catalog_price_history admin_web_super_admin_adds_price_history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_adds_price_history" ON "public"."catalog_price_history" FOR INSERT TO "contractor_api" WITH CHECK (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: calculation_formulas admin_web_super_admin_manages_calculation_formulas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_manages_calculation_formulas" ON "public"."calculation_formulas" TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin")) WITH CHECK (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: calculation_formula_parameters admin_web_super_admin_manages_calculation_parameters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_manages_calculation_parameters" ON "public"."calculation_formula_parameters" TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin")) WITH CHECK (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: catalog_categories admin_web_super_admin_manages_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_manages_categories" ON "public"."catalog_categories" TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin")) WITH CHECK (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: catalog_items admin_web_super_admin_manages_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_manages_items" ON "public"."catalog_items" TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin")) WITH CHECK (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: units admin_web_super_admin_manages_units; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_manages_units" ON "public"."units" TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin")) WITH CHECK (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: catalog_yields admin_web_super_admin_manages_yields; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_manages_yields" ON "public"."catalog_yields" TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin")) WITH CHECK (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: catalog_categories admin_web_super_admin_reads_catalog_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_reads_catalog_categories" ON "public"."catalog_categories" FOR SELECT TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: catalog_items admin_web_super_admin_reads_catalog_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_reads_catalog_items" ON "public"."catalog_items" FOR SELECT TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: catalog_yields admin_web_super_admin_reads_catalog_yields; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_reads_catalog_yields" ON "public"."catalog_yields" FOR SELECT TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: clients admin_web_super_admin_reads_clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_reads_clients" ON "public"."clients" FOR SELECT TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: companies admin_web_super_admin_reads_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_reads_companies" ON "public"."companies" FOR SELECT TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: company_members admin_web_super_admin_reads_company_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_reads_company_members" ON "public"."company_members" FOR SELECT TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: catalog_price_history admin_web_super_admin_reads_price_history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_reads_price_history" ON "public"."catalog_price_history" FOR SELECT TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: profiles admin_web_super_admin_reads_profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_reads_profiles" ON "public"."profiles" FOR SELECT TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: projects admin_web_super_admin_reads_projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_reads_projects" ON "public"."projects" FOR SELECT TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: units admin_web_super_admin_reads_units; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_reads_units" ON "public"."units" FOR SELECT TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: companies admin_web_super_admin_updates_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_updates_companies" ON "public"."companies" FOR UPDATE TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin")) WITH CHECK (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: profiles admin_web_super_admin_updates_profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_super_admin_updates_profiles" ON "public"."profiles" FOR UPDATE TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin")) WITH CHECK (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: profiles admin_web_user_reads_own_profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_web_user_reads_own_profile" ON "public"."profiles" FOR SELECT TO "contractor_api" USING ((( SELECT "app"."current_user_id"() AS "uid") = "id"));


--
-- Name: budget_items approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."budget_items" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: budget_sections approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."budget_sections" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: budget_versions approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."budget_versions" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: budgets approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."budgets" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: catalog_categories approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."catalog_categories" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: catalog_items approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."catalog_items" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: catalog_price_history approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."catalog_price_history" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: catalog_yields approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."catalog_yields" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: client_addresses approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."client_addresses" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: client_contacts approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."client_contacts" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: clients approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."clients" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: companies approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."companies" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: company_members approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."company_members" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: company_settings approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."company_settings" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: document_sequences approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."document_sequences" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: project_members approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."project_members" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: projects approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."projects" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: supplier_prices approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."supplier_prices" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: suppliers approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."suppliers" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: units approved_platform_users_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "approved_platform_users_only" ON "public"."units" AS RESTRICTIVE TO "contractor_api" USING (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user")) WITH CHECK (( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user"));


--
-- Name: budget_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."budget_items" ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_items budget_items_select_for_linked_client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "budget_items_select_for_linked_client" ON "public"."budget_items" FOR SELECT TO "contractor_api" USING ((EXISTS ( SELECT 1
   FROM ("public"."budgets" "budget"
     JOIN "public"."clients" "client" ON ((("client"."id" = "budget"."client_id") AND ("client"."company_id" = "budget"."company_id"))))
  WHERE (("budget"."id" = "budget_items"."budget_id") AND ("budget"."company_id" = "budget_items"."company_id") AND ("budget"."status" = ANY (ARRAY['sent'::"public"."budget_status", 'viewed'::"public"."budget_status", 'approved'::"public"."budget_status", 'rejected'::"public"."budget_status", 'expired'::"public"."budget_status"])) AND ("client"."user_id" = ( SELECT "app"."current_user_id"() AS "uid")) AND ("client"."active" = true)))));


--
-- Name: budget_sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."budget_sections" ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_sections budget_sections_select_for_linked_client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "budget_sections_select_for_linked_client" ON "public"."budget_sections" FOR SELECT TO "contractor_api" USING ((EXISTS ( SELECT 1
   FROM ("public"."budgets" "budget"
     JOIN "public"."clients" "client" ON ((("client"."id" = "budget"."client_id") AND ("client"."company_id" = "budget"."company_id"))))
  WHERE (("budget"."id" = "budget_sections"."budget_id") AND ("budget"."company_id" = "budget_sections"."company_id") AND ("budget"."status" = ANY (ARRAY['sent'::"public"."budget_status", 'viewed'::"public"."budget_status", 'approved'::"public"."budget_status", 'rejected'::"public"."budget_status", 'expired'::"public"."budget_status"])) AND ("client"."user_id" = ( SELECT "app"."current_user_id"() AS "uid")) AND ("client"."active" = true)))));


--
-- Name: budget_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."budget_versions" ENABLE ROW LEVEL SECURITY;

--
-- Name: budgets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."budgets" ENABLE ROW LEVEL SECURITY;

--
-- Name: budgets budgets_select_for_linked_client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "budgets_select_for_linked_client" ON "public"."budgets" FOR SELECT TO "contractor_api" USING ((("status" = ANY (ARRAY['sent'::"public"."budget_status", 'viewed'::"public"."budget_status", 'approved'::"public"."budget_status", 'rejected'::"public"."budget_status", 'expired'::"public"."budget_status"])) AND (EXISTS ( SELECT 1
   FROM "public"."clients" "client"
  WHERE (("client"."id" = "budgets"."client_id") AND ("client"."company_id" = "budgets"."company_id") AND ("client"."user_id" = ( SELECT "app"."current_user_id"() AS "uid")) AND ("client"."active" = true))))));


--
-- Name: calculation_formula_parameter_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."calculation_formula_parameter_history" ENABLE ROW LEVEL SECURITY;

--
-- Name: calculation_formula_parameters; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."calculation_formula_parameters" ENABLE ROW LEVEL SECURITY;

--
-- Name: calculation_formulas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."calculation_formulas" ENABLE ROW LEVEL SECURITY;

--
-- Name: calculation_formulas calculation_formulas_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "calculation_formulas_admin_delete" ON "public"."calculation_formulas" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: calculation_formulas calculation_formulas_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "calculation_formulas_admin_insert" ON "public"."calculation_formulas" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: calculation_formulas calculation_formulas_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "calculation_formulas_admin_update" ON "public"."calculation_formulas" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: calculation_formulas calculation_formulas_select_member; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "calculation_formulas_select_member" ON "public"."calculation_formulas" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: calculation_formula_parameter_history calculation_history_select_member; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "calculation_history_select_member" ON "public"."calculation_formula_parameter_history" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: calculation_formula_parameters calculation_parameters_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "calculation_parameters_admin_delete" ON "public"."calculation_formula_parameters" FOR DELETE TO "contractor_api" USING ("public"."is_company_admin"("company_id"));


--
-- Name: calculation_formula_parameters calculation_parameters_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "calculation_parameters_admin_insert" ON "public"."calculation_formula_parameters" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: calculation_formula_parameters calculation_parameters_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "calculation_parameters_admin_update" ON "public"."calculation_formula_parameters" FOR UPDATE TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: calculation_formula_parameters calculation_parameters_select_member; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "calculation_parameters_select_member" ON "public"."calculation_formula_parameters" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: catalog_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."catalog_categories" ENABLE ROW LEVEL SECURITY;

--
-- Name: catalog_categories catalog_categories_manage_company_admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "catalog_categories_manage_company_admins" ON "public"."catalog_categories" TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: catalog_categories catalog_categories_select_company_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "catalog_categories_select_company_members" ON "public"."catalog_categories" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: catalog_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."catalog_items" ENABLE ROW LEVEL SECURITY;

--
-- Name: catalog_items catalog_items_manage_company_admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "catalog_items_manage_company_admins" ON "public"."catalog_items" TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: catalog_items catalog_items_select_company_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "catalog_items_select_company_members" ON "public"."catalog_items" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: catalog_price_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."catalog_price_history" ENABLE ROW LEVEL SECURITY;

--
-- Name: catalog_price_history catalog_price_history_select_company_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "catalog_price_history_select_company_members" ON "public"."catalog_price_history" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: catalog_yields; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."catalog_yields" ENABLE ROW LEVEL SECURITY;

--
-- Name: catalog_yields catalog_yields_manage_company_admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "catalog_yields_manage_company_admins" ON "public"."catalog_yields" TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: catalog_yields catalog_yields_select_company_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "catalog_yields_select_company_members" ON "public"."catalog_yields" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: client_addresses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."client_addresses" ENABLE ROW LEVEL SECURITY;

--
-- Name: client_contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."client_contacts" ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;

--
-- Name: clients clients_select_own_link; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "clients_select_own_link" ON "public"."clients" FOR SELECT TO "contractor_api" USING ((("user_id" = ( SELECT "app"."current_user_id"() AS "uid")) AND ("active" = true)));


--
-- Name: companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;

--
-- Name: companies companies_select_for_linked_client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "companies_select_for_linked_client" ON "public"."companies" FOR SELECT TO "contractor_api" USING ((EXISTS ( SELECT 1
   FROM "public"."clients" "client"
  WHERE (("client"."company_id" = "companies"."id") AND ("client"."user_id" = ( SELECT "app"."current_user_id"() AS "uid")) AND ("client"."active" = true)))));


--
-- Name: company_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."company_members" ENABLE ROW LEVEL SECURITY;

--
-- Name: calculation_formulas company_members_read_calculation_formulas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "company_members_read_calculation_formulas" ON "public"."calculation_formulas" FOR SELECT TO "contractor_api" USING ((( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user") AND (( SELECT "private"."is_super_admin"() AS "is_super_admin") OR (EXISTS ( SELECT 1
   FROM "public"."company_members"
  WHERE (("company_members"."company_id" = "calculation_formulas"."company_id") AND ("company_members"."user_id" = ( SELECT "app"."current_user_id"() AS "uid")) AND ("company_members"."active" = true)))))));


--
-- Name: calculation_formula_parameters company_members_read_calculation_parameters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "company_members_read_calculation_parameters" ON "public"."calculation_formula_parameters" FOR SELECT TO "contractor_api" USING ((( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user") AND (( SELECT "private"."is_super_admin"() AS "is_super_admin") OR (EXISTS ( SELECT 1
   FROM "public"."company_members"
  WHERE (("company_members"."company_id" = "calculation_formula_parameters"."company_id") AND ("company_members"."user_id" = ( SELECT "app"."current_user_id"() AS "uid")) AND ("company_members"."active" = true)))))));


--
-- Name: company_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."company_settings" ENABLE ROW LEVEL SECURITY;

--
-- Name: document_sequences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."document_sequences" ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_catalog_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."platform_catalog_items" ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_catalog_price_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."platform_catalog_price_history" ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "profiles_admin_delete" ON "public"."profiles" FOR DELETE TO "contractor_api" USING ("public"."is_admin"());


--
-- Name: profiles profiles_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "profiles_admin_insert" ON "public"."profiles" FOR INSERT TO "contractor_api" WITH CHECK ("public"."is_admin"());


--
-- Name: profiles profiles_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "profiles_admin_update" ON "public"."profiles" FOR UPDATE TO "contractor_api" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: profiles profiles_select_own_or_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "profiles_select_own_or_admin" ON "public"."profiles" FOR SELECT TO "contractor_api" USING ((("id" = "app"."current_user_id"()) OR "public"."is_admin"()));


--
-- Name: profiles profiles_select_own_profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "profiles_select_own_profile" ON "public"."profiles" FOR SELECT TO "contractor_api" USING (("id" = ( SELECT "app"."current_user_id"() AS "uid")));


--
-- Name: project_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."project_members" ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;

--
-- Name: projects projects_select_for_linked_client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "projects_select_for_linked_client" ON "public"."projects" FOR SELECT TO "contractor_api" USING ((EXISTS ( SELECT 1
   FROM "public"."clients" "client"
  WHERE (("client"."id" = "projects"."client_id") AND ("client"."company_id" = "projects"."company_id") AND ("client"."user_id" = ( SELECT "app"."current_user_id"() AS "uid")) AND ("client"."active" = true)))));


--
-- Name: platform_catalog_items super_admin_manages_platform_catalog; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "super_admin_manages_platform_catalog" ON "public"."platform_catalog_items" TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin")) WITH CHECK (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: platform_catalog_price_history super_admin_reads_platform_price_history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "super_admin_reads_platform_price_history" ON "public"."platform_catalog_price_history" FOR SELECT TO "contractor_api" USING (( SELECT "private"."is_super_admin"() AS "is_super_admin"));


--
-- Name: supplier_prices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."supplier_prices" ENABLE ROW LEVEL SECURITY;

--
-- Name: suppliers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;

--
-- Name: units; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."units" ENABLE ROW LEVEL SECURITY;

--
-- Name: units units_manage_company_admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "units_manage_company_admins" ON "public"."units" TO "contractor_api" USING ("public"."is_company_admin"("company_id")) WITH CHECK ("public"."is_company_admin"("company_id"));


--
-- Name: units units_select_company_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "units_select_company_members" ON "public"."units" FOR SELECT TO "contractor_api" USING ("public"."is_company_member"("company_id"));


--
-- Name: user_catalog_price_overrides; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."user_catalog_price_overrides" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_catalog_price_overrides users_delete_own_catalog_overrides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users_delete_own_catalog_overrides" ON "public"."user_catalog_price_overrides" FOR DELETE TO "contractor_api" USING (("user_id" = ( SELECT "app"."current_user_id"() AS "uid")));


--
-- Name: user_catalog_price_overrides users_insert_own_catalog_overrides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users_insert_own_catalog_overrides" ON "public"."user_catalog_price_overrides" FOR INSERT TO "contractor_api" WITH CHECK ((( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user") AND ("user_id" = ( SELECT "app"."current_user_id"() AS "uid"))));


--
-- Name: user_catalog_price_overrides users_read_own_catalog_overrides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users_read_own_catalog_overrides" ON "public"."user_catalog_price_overrides" FOR SELECT TO "contractor_api" USING ((( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user") AND ("user_id" = ( SELECT "app"."current_user_id"() AS "uid"))));


--
-- Name: user_catalog_price_overrides users_update_own_catalog_overrides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users_update_own_catalog_overrides" ON "public"."user_catalog_price_overrides" FOR UPDATE TO "contractor_api" USING (("user_id" = ( SELECT "app"."current_user_id"() AS "uid"))) WITH CHECK ((( SELECT "private"."is_active_platform_user"() AS "is_active_platform_user") AND ("user_id" = ( SELECT "app"."current_user_id"() AS "uid"))));


--
-- PostgreSQL database dump complete
--

\unrestrict tKjDZnu40LS5UECXdJsfnFmkDB0lquV8pk2BqDuLYMhKsXeMYue2wcD4Yc7IYV6



-- Seguridad inicial del esquema local.
-- contractor_api recibirá permisos definitivos después de auditar RLS.

REVOKE CREATE
ON SCHEMA public
FROM PUBLIC;

REVOKE ALL
ON SCHEMA private
FROM PUBLIC;

REVOKE ALL
ON ALL TABLES IN SCHEMA public
FROM PUBLIC;

REVOKE ALL
ON ALL TABLES IN SCHEMA private
FROM PUBLIC;

REVOKE ALL
ON ALL SEQUENCES IN SCHEMA public
FROM PUBLIC;

DO $block$
DECLARE
  function_record record;
BEGIN
  FOR function_record IN
    SELECT p.oid::regprocedure AS function_signature
    FROM pg_proc AS p
    JOIN pg_namespace AS n
      ON n.oid = p.pronamespace
    WHERE n.nspname IN ('public', 'private')
      AND p.proowner = 'contractor_owner'::regrole
  LOOP
    EXECUTE format(
      'REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC',
      function_record.function_signature
    );
  END LOOP;
END
$block$;

ALTER DEFAULT PRIVILEGES
FOR ROLE contractor_owner
IN SCHEMA public
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES
FOR ROLE contractor_owner
IN SCHEMA private
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

RESET ROLE;

COMMIT;