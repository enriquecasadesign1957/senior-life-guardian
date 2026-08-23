-- Oneclick Mall Chile (misma cuenta Transbank que Senior Safe, tokens WK- separados)

alter table public.billing_events drop constraint if exists billing_events_provider_check;
alter table public.billing_events
  add constraint billing_events_provider_check
  check (provider in ('stripe', 'lemon_squeezy', 'transbank'));

create table if not exists public.transbank_inscriptions (
  usuario_id uuid primary key references public.usuarios (id) on delete cascade,
  username text not null unique,
  email text not null,
  inscription_token text,
  tbk_user text,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'failed', 'deleted')),
  card_last4 text,
  next_charge_at timestamptz,
  last_charged_at timestamptz,
  actualizada_en timestamptz not null default now(),
  creada_en timestamptz not null default now()
);

create index if not exists idx_transbank_inscriptions_token
  on public.transbank_inscriptions (inscription_token)
  where inscription_token is not null;

create index if not exists idx_transbank_inscriptions_next_charge
  on public.transbank_inscriptions (next_charge_at)
  where status = 'active';

create table if not exists public.transbank_transactions (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  mall_buy_order text not null unique,
  store_buy_order text not null,
  amount integer not null check (amount > 0),
  operation text not null default 'authorize'
    check (operation in ('authorize', 'refund')),
  status text not null default 'initiated',
  authorization_code text,
  response_code integer,
  creada_en timestamptz not null default now()
);

create index if not exists idx_transbank_transactions_usuario
  on public.transbank_transactions (usuario_id);

alter table public.transbank_inscriptions enable row level security;
alter table public.transbank_transactions enable row level security;
