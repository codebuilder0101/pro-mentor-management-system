-- Run in Supabase SQL Editor or via CLI. Table + RLS + optional seed.

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('video', 'ebook', 'article', 'tool', 'guide')),
  description text not null default '',
  duration text,
  pages integer,
  views integer not null default 0,
  video_url text,
  material_url text,
  status text not null default 'published' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists library_items_status_idx on public.library_items (status);
create index if not exists library_items_type_idx on public.library_items (type);

alter table public.library_items enable row level security;

create policy "Public read published library items"
  on public.library_items
  for select
  to anon, authenticated
  using (status = 'published');

create or replace function public.set_library_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists library_items_set_updated_at on public.library_items;
create trigger library_items_set_updated_at
  before update on public.library_items
  for each row
  execute procedure public.set_library_items_updated_at();

create or replace function public.increment_library_views(item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.library_items
  set views = views + 1
  where id = item_id and status = 'published';
end;
$$;

grant execute on function public.increment_library_views(uuid) to anon, authenticated;

-- Seed once if table is empty
do $$
begin
  if not exists (select 1 from public.library_items limit 1) then
    insert into public.library_items (title, type, description, duration, pages, views, status)
    values
      ('Liderança adaptativa em ambientes voláteis', 'video',
       'Como ajustar estilo de liderança e prioridades quando o contexto organizacional muda com frequência.',
       '22 min', null, 1243, 'published'),
      ('Guia: conversas difíceis com equipes e pares', 'guide',
       'Roteiro prático para preparar feedback, expectativas e acordos em situações sensíveis.',
       null, 14, 892, 'published'),
      ('E-book: pensamento estratégico para quem executa', 'ebook',
       'Do operacional ao estratégico: priorização, alinhamento com metas e leitura de cenário.',
       null, 48, 756, 'published'),
      ('Artigo: decisões com dados e bom senso', 'article',
       'Como combinar indicadores, contexto e julgamento para decidir com mais clareza.',
       null, 8, 1087, 'published'),
      ('Template: mapa de stakeholders e influência', 'tool',
       'Ferramenta para mapear relações, interesses e canais de comunicação em projetos e mudanças.',
       null, 4, 654, 'published'),
      ('Gestão de tempo e foco para líderes', 'video',
       'Agenda, energia e prioridades: reduzindo ruído e aumentando impacto na liderança.',
       '28 min', null, 923, 'published'),
      ('Melhoria de processos na prática', 'article',
       'Texto curto sobre melhoria contínua no dia a dia. Em alguns trechos uso Lean só como referência — um tema entre outros, não o centro do site.',
       null, 10, 1156, 'published'),
      ('Checklist: onboarding e integração de talentos', 'tool',
       'Lista para alinhar expectativas, cultura e primeiros resultados em novas contratações.',
       null, 3, 534, 'published'),
      ('Cultura de feedback e desenvolvimento contínuo', 'ebook',
       'Estruturas simples para criar rituais de desenvolvimento sem burocratizar a gestão.',
       null, 36, 678, 'published'),
      ('Transição de carreira: diagnóstico e próximos passos', 'video',
       'Para profissionais em mudança de função ou empresa: como organizar narrativa e plano de ação.',
       '19 min', null, 812, 'published');
  end if;
end $$;
