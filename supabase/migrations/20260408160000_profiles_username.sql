-- E-mail único por perfil (mapeado para email sintético no Auth).

alter table public.profiles add column if not exists username text;

create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username))
  where username is not null;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  u text;
begin
  u := nullif(lower(trim(new.raw_user_meta_data->>'username')), '');
  insert into public.profiles (id, role, username)
  values (new.id, 'user', u);
  return new;
end;
$$;
