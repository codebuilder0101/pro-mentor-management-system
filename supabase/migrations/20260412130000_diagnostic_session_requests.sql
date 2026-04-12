-- Pedidos de sessão de diagnóstico (substitui agendamento via Google Calendar).

create table if not exists public.diagnostic_session_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  guest_name text not null,
  guest_email text not null,
  phone text not null,
  preferred_date date not null,
  preferred_time text not null,
  mentorship_model text not null check (mentorship_model in ('online', 'presencial')),
  context text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diagnostic_session_requests_user_id_idx
  on public.diagnostic_session_requests (user_id);
create index if not exists diagnostic_session_requests_status_idx
  on public.diagnostic_session_requests (status);
create index if not exists diagnostic_session_requests_preferred_date_idx
  on public.diagnostic_session_requests (preferred_date desc);

alter table public.diagnostic_session_requests enable row level security;

drop policy if exists "diagnostic_sessions_select_own" on public.diagnostic_session_requests;
create policy "diagnostic_sessions_select_own"
  on public.diagnostic_session_requests for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "diagnostic_sessions_select_admin" on public.diagnostic_session_requests;
create policy "diagnostic_sessions_select_admin"
  on public.diagnostic_session_requests for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "diagnostic_sessions_insert_user_role" on public.diagnostic_session_requests;
create policy "diagnostic_sessions_insert_user_role"
  on public.diagnostic_session_requests for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'user'
    )
  );

drop policy if exists "diagnostic_sessions_update_admin" on public.diagnostic_session_requests;
create policy "diagnostic_sessions_update_admin"
  on public.diagnostic_session_requests for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop trigger if exists diagnostic_session_requests_set_updated_at on public.diagnostic_session_requests;
create trigger diagnostic_session_requests_set_updated_at
  before update on public.diagnostic_session_requests
  for each row execute procedure public.set_profiles_updated_at();
