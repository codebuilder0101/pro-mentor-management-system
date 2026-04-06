-- =============================================================================
-- Setup completo: public.books + public.media_items + buckets Storage
-- Cole no Supabase SQL Editor e execute (projeto vazio ou após backup).
-- =============================================================================
--
-- Regras (alinhadas com a app Next.js /api/admin/media):
--   books: coleção (título + path de rota).
--   media_items.type: apenas 'video' | 'book'
--   video: name, storage_path, preview_image_path, file_path (objeto no bucket),
--          duration_seconds > 0
--   book:  name, storage_path, preview_image_path; file_path e duration_seconds NULL
--
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Storage (ficheiros: capas em media-previews, vídeos em media-videos)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('media-previews', 'media-previews', true, 5242880),
  ('media-videos', 'media-videos', true, 524288000)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "Public read media previews" on storage.objects;
create policy "Public read media previews"
  on storage.objects for select
  to public
  using (bucket_id = 'media-previews');

drop policy if exists "Public read media videos" on storage.objects;
create policy "Public read media videos"
  on storage.objects for select
  to public
  using (bucket_id = 'media-videos');

-- ---------------------------------------------------------------------------
-- Tabelas public
-- ---------------------------------------------------------------------------
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists books_title_idx on public.books (title);

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete restrict,
  type text not null,
  name text not null,
  storage_path text not null,
  preview_image_path text not null,
  file_path text,
  duration_seconds integer,
  status text not null default 'draft',
  views integer not null default 0,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_items_type_check check (type in ('video', 'book')),
  constraint media_items_status_check check (status in ('published', 'draft')),
  constraint media_items_video_duration_ck check (
    (type = 'video' and duration_seconds is not null and duration_seconds > 0)
    or (type = 'book')
  ),
  constraint media_items_video_file_ck check (
    (type = 'video' and file_path is not null)
    or (type = 'book')
  ),
  constraint media_items_storage_path_ck check (length(trim(storage_path)) > 0)
);

create index if not exists media_items_book_id_idx on public.media_items (book_id);
create index if not exists media_items_status_idx on public.media_items (status);
create index if not exists media_items_type_idx on public.media_items (type);

alter table public.books enable row level security;
alter table public.media_items enable row level security;

drop policy if exists "Public read books" on public.books;
create policy "Public read books"
  on public.books for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read published media items" on public.media_items;
create policy "Public read published media items"
  on public.media_items for select
  to anon, authenticated
  using (status = 'published');

create or replace function public.set_books_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row execute procedure public.set_books_updated_at();

create or replace function public.set_media_items_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists media_items_set_updated_at on public.media_items;
create trigger media_items_set_updated_at
  before update on public.media_items
  for each row execute procedure public.set_media_items_updated_at();

-- =============================================================================
-- (Opcional) Recriar do zero — APAGA DADOS. Descomente só se quiser reset total.
-- =============================================================================
-- drop table if exists public.media_items cascade;
-- drop table if exists public.books cascade;
-- Depois volte a executar os blocos create table / policies / triggers acima.
