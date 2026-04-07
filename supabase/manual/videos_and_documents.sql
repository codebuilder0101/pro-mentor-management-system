-- =============================================================================
-- Vídeos e documentos (Supabase / PostgreSQL)
-- Preço em centavos (ex.: R$ 49,90 → price_cents = 4990). Grátis: price_cents = 0
-- filepath = caminho do objeto no Storage (ex.: videos/abc.mp4), não a URL pública
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Vídeos: nome, duração, ficheiro, preço
-- ---------------------------------------------------------------------------
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

comment on table public.videos is 'Metadados de vídeo; ficheiro em Storage (filepath).';
comment on column public.videos.filepath is 'Caminho do objeto no bucket (ex.: videos/uuid.mp4).';
comment on column public.videos.price_cents is 'Preço em centavos BRL; 0 = gratuito.';

-- ---------------------------------------------------------------------------
-- Documentos: nome, filepath (Storage), preço
-- ---------------------------------------------------------------------------
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

comment on table public.documents is 'Metadados de documento; filepath = objeto no Storage.';
comment on column public.documents.filepath is 'Caminho no bucket (ex.: docs/guia.pdf).';
comment on column public.documents.price_cents is 'Preço em centavos BRL; 0 = gratuito.';

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- RLS (leitura pública opcional; escrita via Service Role na API)
-- ---------------------------------------------------------------------------
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

-- =============================================================================
-- Exemplos de consultas (queries)
-- =============================================================================

-- Inserir vídeo (na app usa service role ou RPC com segurança)
-- insert into public.videos (name, duration_seconds, filepath, price_cents)
-- values ('Introdução', 540, 'videos/intro.mp4', 4990);

-- Inserir documento
-- insert into public.documents (name, filepath, price_cents)
-- values ('Guia PDF', 'documents/guia.pdf', 0);

-- Listar vídeos com preço legível (exemplo; formatação no app é melhor)
-- select id, name, duration_seconds, filepath, price_cents
-- from public.videos
-- order by created_at desc;

-- Listar documentos
-- select id, name, filepath, price_cents
-- from public.documents
-- order by created_at desc;

-- Atualizar preço de um vídeo
-- update public.videos set price_cents = 2990 where id = '...';
