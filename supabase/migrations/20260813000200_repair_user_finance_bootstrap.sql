begin;

-- Repair users whose Auth record predates (or survived a failure in) the
-- original profile trigger. The callable wrapper never accepts a user id: it
-- always derives ownership from the verified Supabase session.
create or replace function public.ensure_current_user_finance()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  insert into public.profiles (id, email, full_name, avatar_url)
  select
    auth_user.id,
    coalesce(auth_user.email, ''),
    coalesce(
      auth_user.raw_user_meta_data ->> 'full_name',
      auth_user.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      auth_user.raw_user_meta_data ->> 'avatar_url',
      auth_user.raw_user_meta_data ->> 'picture'
    )
  from auth.users auth_user
  where auth_user.id = current_user_id
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  if not found then
    raise exception 'Authenticated user was not found'
      using errcode = '42501';
  end if;

  perform public.bootstrap_user_finance(current_user_id);
end;
$$;

revoke all on function public.ensure_current_user_finance()
from public, anon, authenticated;
grant execute on function public.ensure_current_user_finance()
to authenticated;

-- Reconcile every user once when this migration is installed so current web
-- sessions immediately receive a profile, starter categories, and cash account.
insert into public.profiles (id, email, full_name, avatar_url)
select
  auth_user.id,
  coalesce(auth_user.email, ''),
  coalesce(
    auth_user.raw_user_meta_data ->> 'full_name',
    auth_user.raw_user_meta_data ->> 'name'
  ),
  coalesce(
    auth_user.raw_user_meta_data ->> 'avatar_url',
    auth_user.raw_user_meta_data ->> 'picture'
  )
from auth.users auth_user
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

select public.bootstrap_user_finance(id)
from public.profiles;

commit;
