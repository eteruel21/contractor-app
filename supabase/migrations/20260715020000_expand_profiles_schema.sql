-- 1. Alterar tabla profiles para añadir los campos requeridos
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists province text,
  add column if not exists district text,
  add column if not exists corregimiento text,
  add column if not exists terms_accepted boolean default false,
  add column if not exists notifications_opt_in boolean default false,
  add column if not exists registration_ip text,
  add column if not exists registration_device text,
  
  -- Campos para contratistas (Paso 2)
  add column if not exists business_name text,
  add column if not exists id_document text,
  add column if not exists tax_id text,
  add column if not exists tax_dv text,
  add column if not exists primary_category text,
  add column if not exists specialties text[],
  add column if not exists experience_years integer,
  add column if not exists work_areas text[],
  add column if not exists professional_description text,
  add column if not exists company_logo_url text,
  add column if not exists portfolio_urls text[],
  add column if not exists certifications text[],
  add column if not exists availability text,
  add column if not exists preferred_contact_method text,
  add column if not exists emits_invoice boolean default false,
  add column if not exists has_transport boolean default false,
  add column if not exists work_mode text, -- 'solo' o 'crew'
  
  -- Documentos de aprobación
  add column if not exists doc_id_url text,
  add column if not exists doc_operation_notice_url text,
  add column if not exists doc_technical_certs_urls text[],
  add column if not exists doc_references_url text,
  add column if not exists doc_address_proof_url text;

-- 2. Actualizar handle_new_user para capturar los campos del primer registro
create or replace function public.handle_new_user()
returns trigger as $$
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
$$ language plpgsql security definer;

-- 3. Crear funcion para actualizar perfil profesional (Contratista - Paso 2)
create or replace function public.update_contractor_profile(
  p_business_name text,
  p_id_document text,
  p_tax_id text,
  p_tax_dv text,
  p_primary_category text,
  p_specialties text[],
  p_experience_years integer,
  p_work_areas text[],
  p_professional_description text,
  p_company_logo_url text,
  p_portfolio_urls text[],
  p_certifications text[],
  p_availability text,
  p_preferred_contact_method text,
  p_emits_invoice boolean,
  p_has_transport boolean,
  p_work_mode text,
  p_doc_id_url text,
  p_doc_operation_notice_url text,
  p_doc_technical_certs_urls text[],
  p_doc_references_url text,
  p_doc_address_proof_url text
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_profile public.profiles;
begin
  if (select auth.uid()) is null then
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
  where id = (select auth.uid())
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile not found';
  end if;

  return updated_profile;
end;
$$;

revoke all on function public.update_contractor_profile(text, text, text, text, text, text[], integer, text[], text, text, text[], text[], text, text, boolean, boolean, text, text, text, text[], text, text) from public;
revoke all on function public.update_contractor_profile(text, text, text, text, text, text[], integer, text[], text, text, text[], text[], text, text, boolean, boolean, text, text, text, text[], text, text) from anon;
grant execute on function public.update_contractor_profile(text, text, text, text, text, text[], integer, text[], text, text, text[], text[], text, text, boolean, boolean, text, text, text, text[], text, text) to authenticated;
