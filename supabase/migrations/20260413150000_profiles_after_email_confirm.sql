-- Perfis em public.profiles são criados assim que o utilizador se regista em auth.users,
-- independentemente da confirmação do email. O email de confirmação continua a ser enviado
-- pelo signUp, mas o acesso é permitido sem verificação.

-- Garantir coluna email (migrações anteriores podem não ter sido aplicadas neste ambiente).
alter table public.profiles add column if not exists email text;

create unique index if not exists profiles_email_lower_key
  on public.profiles (lower(email))
  where email is not null;

-- Sincronizar emails de utilizadores já existentes.
update public.profiles p
set email = nullif(lower(trim(u.email::text)), '')
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '')
  and u.email is not null;

drop trigger if exists on_auth_user_created_profile on auth.users;
drop trigger if exists on_auth_user_email_confirmed_profile on auth.users;
drop function if exists public.handle_new_user_profile();
drop function if exists public.handle_auth_user_profile_insert();
drop function if exists public.handle_auth_user_profile_update();

create or replace function public.upsert_profile_for_auth_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  r auth.users%rowtype;
  u text;
  e text;
  fn text;
begin
  select * into r from auth.users where id = p_user_id;
  if not found then
    return;
  end if;

  u := nullif(lower(trim(r.raw_user_meta_data->>'username')), '');
  fn := nullif(
    trim(
      coalesce(
        r.raw_user_meta_data->>'full_name',
        r.raw_user_meta_data->>'name',
        ''
      )
    ),
    ''
  );
  e := nullif(lower(trim(r.email::text)), '');

  insert into public.profiles (id, role, username, email, full_name)
  values (r.id, 'user', nullif(u, ''), e, nullif(fn, ''))
  on conflict (id) do update set
    email = coalesce(nullif(excluded.email, ''), profiles.email),
    full_name = case
      when nullif(excluded.full_name, '') is not null then excluded.full_name
      else profiles.full_name
    end,
    username = case
      when nullif(excluded.username, '') is not null then excluded.username
      else profiles.username
    end,
    updated_at = now();
end;
$$;

create or replace function public.handle_auth_user_profile_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.upsert_profile_for_auth_user(new.id);
  return new;
end;
$$;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_auth_user_profile_insert();

-- Backfill: garantir perfil para contas já existentes sem registo em public.profiles.
insert into public.profiles (id, role, email, full_name, username)
select
  u.id,
  'user',
  nullif(lower(trim(u.email::text)), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')), ''),
  nullif(lower(trim(u.raw_user_meta_data->>'username')), '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
