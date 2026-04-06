-- Tabela opcional para URLs de vídeo “gratuitos” (ex.: campanha / preview).
-- Rode no SQL Editor se ainda não existir.

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  video_url text not null,
  is_free boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.videos enable row level security;

drop policy if exists "Public read free videos" on public.videos;
create policy "Public read free videos"
  on public.videos
  for select
  to anon, authenticated
  using (is_free = true);
