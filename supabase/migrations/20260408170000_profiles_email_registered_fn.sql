-- Email no perfil (espelho do auth.users) e função só para service_role verificar duplicidade.

alter table public.profiles add column if not exists email text;

create unique index if not exists profiles_email_lower_key
  on public.profiles (lower(email))
  where email is not null;

-- Sincroniza emails de utilizadores já existentes.
update public.profiles p
set email = nullif(lower(trim(u.email::text)), '')
from auth.users u
where p.id = u.id
  and u.email is not null;

create or replace function public.email_registered(check_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from auth.users u
    where u.email is not null
      and lower(trim(u.email::text)) = lower(trim(check_email))
  );
$$;

revoke all on function public.email_registered(text) from public;
grant execute on function public.email_registered(text) to service_role;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  u text;
  e text;
begin
  u := nullif(lower(trim(new.raw_user_meta_data->>'username')), '');
  e := nullif(lower(trim(new.email::text)), '');
  insert into public.profiles (id, role, username, email)
  values (new.id, 'user', u, e);
  return new;
end;
$$;
