-- Artigos e depoimentos (texto exibido no site; CRUD no admin).
-- RLS: leitura pública apenas de registos publicados.

create table if not exists public.artigos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null default '',
  resumo text not null default '',
  conteudo text not null,
  nome_autor text not null default '',
  cargo_autor text not null default '',
  tipo text not null default 'depoimento' check (tipo in ('depoimento', 'artigo')),
  publicado boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artigos_conteudo_ck check (length(trim(conteudo)) > 0)
);

create index if not exists artigos_publicado_tipo_ordem_idx
  on public.artigos (publicado, tipo, ordem);

create index if not exists artigos_created_at_idx on public.artigos (created_at desc);

alter table public.artigos enable row level security;

drop policy if exists "Public read published artigos" on public.artigos;
create policy "Public read published artigos"
  on public.artigos for select
  to anon, authenticated
  using (publicado = true);

create or replace function public.set_artigos_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists artigos_set_updated_at on public.artigos;
create trigger artigos_set_updated_at
  before update on public.artigos
  for each row execute procedure public.set_artigos_updated_at();
