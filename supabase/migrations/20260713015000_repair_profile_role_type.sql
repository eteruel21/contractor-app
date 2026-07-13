begin;

-- El trigger instalado anteriormente compara text con global_user_role.
-- Se retira temporalmente para poder normalizar y convertir la columna.
drop trigger if exists protect_profile_role on public.profiles;

alter table public.profiles
  alter column role drop default;

do $block$
declare
  current_role_type text;
begin
  select columns.udt_name
  into current_role_type
  from information_schema.columns
  where columns.table_schema = 'public'
    and columns.table_name = 'profiles'
    and columns.column_name = 'role';

  if current_role_type is distinct from 'global_user_role' then
    -- Solo se conservan los tres roles admitidos por la plataforma.
    update public.profiles
    set role = case role::text
      when 'super_admin' then 'super_admin'
      when 'client' then 'client'
      else 'contractor'
    end;

    -- Convertir la columna al tipo enum
    alter table public.profiles
      alter column role type public.global_user_role using role::text::public.global_user_role;
  end if;
end;
$block$;

-- Restaurar el default de la columna con el tipo correcto
alter table public.profiles
  alter column role set default 'contractor'::public.global_user_role;

-- Reinstalar el trigger de seguridad
create trigger protect_profile_role
before update of role on public.profiles
for each row
execute function public.prevent_unauthorized_profile_role_change();

commit;
