alter table public.library_items add column if not exists preview_image_url text;
alter table public.library_items add column if not exists intro text not null default '';

comment on column public.library_items.preview_image_url is 'URL da imagem de capa / pré-visualização.';
comment on column public.library_items.intro is 'Resumo curto exibido na biblioteca e no modal de download.';
