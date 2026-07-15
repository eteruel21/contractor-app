revoke all on function public.update_own_profile(text, text) from public;
revoke all on function public.update_own_profile(text, text) from anon;
grant execute on function public.update_own_profile(text, text) to authenticated;
