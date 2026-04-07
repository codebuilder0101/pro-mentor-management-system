-- Vídeos e documentos (catálogo admin). Executar após criar tabelas base (manual ou versão anterior).

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  filepath text not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_name_idx on public.videos (name);
create index if not exists videos_created_at_idx on public.videos (created_at desc);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  filepath text not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_filepath_ck check (length(trim(filepath)) > 0)
);

create index if not exists documents_name_idx on public.documents (name);
create index if not exists documents_created_at_idx on public.documents (created_at desc);

create or replace function public.set_videos_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists videos_set_updated_at on public.videos;
create trigger videos_set_updated_at
  before update on public.videos
  for each row execute procedure public.set_videos_updated_at();

create or replace function public.set_documents_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
  before update on public.documents
  for each row execute procedure public.set_documents_updated_at();

alter table public.videos enable row level security;
alter table public.documents enable row level security;

drop policy if exists "Public read videos" on public.videos;
create policy "Public read videos"
  on public.videos for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read documents" on public.documents;
create policy "Public read documents"
  on public.documents for select
  to anon, authenticated
  using (true);

-- Se documents existia sem filepath (schema antigo)
alter table public.documents add column if not exists filepath text;
update public.documents
set filepath = 'documents/legacy-' || id::text
where filepath is null or trim(filepath) = '';
alter table public.documents alter column filepath set not null;
alter table public.documents drop constraint if exists documents_filepath_ck;
alter table public.documents add constraint documents_filepath_ck check (length(trim(filepath)) > 0);
