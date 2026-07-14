create or replace function public.update_own_profile(
  p_full_name text,
  p_phone text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_profile public.profiles;
  normalized_name text := nullif(btrim(p_full_name), '');
  normalized_phone text := nullif(btrim(p_phone), '');
begin
  if (select auth.uid()) is null then
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
  where id = (select auth.uid())
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile not found';
  end if;

  return updated_profile;
end;
$$;

revoke all on function public.update_own_profile(text, text) from public;
revoke all on function public.update_own_profile(text, text) from anon;
grant execute on function public.update_own_profile(text, text) to authenticated;
