-- Guardar nome completo no perfil (signup envia full_name no user_metadata, não username).

alter table public.profiles add column if not exists full_name text;

update public.profiles p
set full_name = nullif(
  trim(
    coalesce(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      ''
    )
  ),
  ''
)
from auth.users u
where p.id = u.id
  and (p.full_name is null or btrim(p.full_name) = '');

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  u text;
  e text;
  fn text;
begin
  u := nullif(lower(trim(new.raw_user_meta_data->>'username')), '');
  fn := nullif(
    trim(
      coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        ''
      )
    ),
    ''
  );
  e := nullif(lower(trim(new.email::text)), '');
  insert into public.profiles (id, role, username, email, full_name)
  values (new.id, 'user', nullif(u, ''), e, nullif(fn, ''));
  return new;
end;
$$;
