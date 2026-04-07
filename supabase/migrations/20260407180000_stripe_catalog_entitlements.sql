-- Direitos de acesso a materiais do catálogo (vídeo/documento) após pagamento Stripe.
-- Escrito apenas pelo webhook / APIs com service role.

create table if not exists public.stripe_processed_events (
  id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_access_entitlements (
  id uuid primary key default gen_random_uuid(),
  email_normalized text not null,
  catalog_kind text not null check (catalog_kind in ('video', 'document')),
  catalog_id uuid not null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  payment_status text not null default 'pending',
  access_granted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email_normalized, catalog_kind, catalog_id)
);

create index if not exists catalog_access_entitlements_pi_idx
  on public.catalog_access_entitlements (stripe_payment_intent_id);

create index if not exists catalog_access_entitlements_email_idx
  on public.catalog_access_entitlements (email_normalized);

alter table public.stripe_processed_events enable row level security;
alter table public.catalog_access_entitlements enable row level security;

-- Sem políticas públicas: apenas service role (API/server com SUPABASE_SERVICE_ROLE_KEY).

create or replace function public.set_catalog_access_entitlements_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists catalog_access_entitlements_set_updated_at on public.catalog_access_entitlements;
create trigger catalog_access_entitlements_set_updated_at
  before update on public.catalog_access_entitlements
  for each row execute procedure public.set_catalog_access_entitlements_updated_at();
