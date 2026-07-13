-- Permite que el panel web lea datos globales únicamente cuando la sesión
-- pertenece a un perfil activo con el rol super_admin.
--
-- No se concede acceso al rol anon y no se utiliza service_role en el cliente.

create schema if not exists private;

create or replace function private.is_super_admin()
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
      and role::text = 'super_admin'
  );
$$;

revoke all on function private.is_super_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_super_admin() to authenticated;

-- El usuario necesita poder leer su propio perfil para que la web valide el rol.
alter table public.profiles enable row level security;
drop policy if exists "admin_web_user_reads_own_profile" on public.profiles;
create policy "admin_web_user_reads_own_profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

-- Las políticas son aditivas: no reemplazan el acceso por empresa que ya usa
-- la aplicación móvil. Solo agregan lectura global para el superadministrador.
alter table public.profiles enable row level security;
drop policy if exists "admin_web_super_admin_reads_profiles" on public.profiles;
create policy "admin_web_super_admin_reads_profiles"
on public.profiles
for select
to authenticated
using ((select private.is_super_admin()));

alter table public.company_members enable row level security;
drop policy if exists "admin_web_super_admin_reads_company_members" on public.company_members;
create policy "admin_web_super_admin_reads_company_members"
on public.company_members
for select
to authenticated
using ((select private.is_super_admin()));

alter table public.companies enable row level security;
drop policy if exists "admin_web_super_admin_reads_companies" on public.companies;
create policy "admin_web_super_admin_reads_companies"
on public.companies
for select
to authenticated
using ((select private.is_super_admin()));

alter table public.projects enable row level security;
drop policy if exists "admin_web_super_admin_reads_projects" on public.projects;
create policy "admin_web_super_admin_reads_projects"
on public.projects
for select
to authenticated
using ((select private.is_super_admin()));

alter table public.clients enable row level security;
drop policy if exists "admin_web_super_admin_reads_clients" on public.clients;
create policy "admin_web_super_admin_reads_clients"
on public.clients
for select
to authenticated
using ((select private.is_super_admin()));

alter table public.catalog_items enable row level security;
drop policy if exists "admin_web_super_admin_reads_catalog_items" on public.catalog_items;
create policy "admin_web_super_admin_reads_catalog_items"
on public.catalog_items
for select
to authenticated
using ((select private.is_super_admin()));

alter table public.catalog_categories enable row level security;
drop policy if exists "admin_web_super_admin_reads_catalog_categories" on public.catalog_categories;
create policy "admin_web_super_admin_reads_catalog_categories"
on public.catalog_categories
for select
to authenticated
using ((select private.is_super_admin()));

alter table public.units enable row level security;
drop policy if exists "admin_web_super_admin_reads_units" on public.units;
create policy "admin_web_super_admin_reads_units"
on public.units
for select
to authenticated
using ((select private.is_super_admin()));

alter table public.catalog_yields enable row level security;
drop policy if exists "admin_web_super_admin_reads_catalog_yields" on public.catalog_yields;
create policy "admin_web_super_admin_reads_catalog_yields"
on public.catalog_yields
for select
to authenticated
using ((select private.is_super_admin()));

grant select on table
  public.profiles,
  public.company_members,
  public.companies,
  public.projects,
  public.clients,
  public.catalog_items,
  public.catalog_categories,
  public.units,
  public.catalog_yields
to authenticated;
