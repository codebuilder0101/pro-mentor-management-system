-- Preço e acesso gratuito/pago na biblioteca
alter table public.library_items add column if not exists is_free boolean not null default true;
alter table public.library_items add column if not exists price_cents integer;

comment on column public.library_items.is_free is 'Se false, exibir preço e botão Pagar em vez de acesso direto.';
comment on column public.library_items.price_cents is 'Valor em centavos (BRL) quando is_free = false.';
