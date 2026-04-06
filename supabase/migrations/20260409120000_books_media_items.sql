-- Books + media metadata (files live in Storage; paths stored here).

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
  type text not null check (type in ('video', 'photo')),
  name text not null,
  preview_image_path text not null,
  file_path text,
  duration_seconds integer,
  status text not null default 'draft' check (status in ('published', 'draft')),
  views integer not null default 0,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_items_video_duration_ck check (
    (type = 'video' and duration_seconds is not null and duration_seconds >= 0)
    or (type = 'photo')
  ),
  constraint media_items_video_file_ck check (
    (type = 'video' and file_path is not null)
    or (type = 'photo')
  )
);

create index if not exists media_items_book_id_idx on public.media_items (book_id);
create index if not exists media_items_status_idx on public.media_items (status);
create index if not exists media_items_type_idx on public.media_items (type);

alter table public.books enable row level security;
alter table public.media_items enable row level security;

create policy "Public read books"
  on public.books for select
  to anon, authenticated
  using (true);

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
