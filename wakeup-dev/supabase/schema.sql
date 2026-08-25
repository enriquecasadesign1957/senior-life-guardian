-- WakeUp Dev — esquema inicial + RLS
-- Ejecutar en el SQL Editor de Supabase

create extension if not exists "pgcrypto";

-- =========================================================
-- 1) usuarios
-- =========================================================
create table if not exists public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  telefono_verificado text,
  creditos_disponibles integer not null default 5
    check (creditos_disponibles >= 0),
  creado_en timestamptz not null default now()
);

create index if not exists idx_usuarios_email on public.usuarios (email);

-- =========================================================
-- 2) api_keys
-- =========================================================
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  key_hash text not null unique,
  activa boolean not null default true,
  creada_en timestamptz not null default now()
);

create index if not exists idx_api_keys_usuario_id on public.api_keys (usuario_id);
create index if not exists idx_api_keys_activa on public.api_keys (activa) where activa = true;

-- =========================================================
-- 3) historial_alertas
-- =========================================================
create table if not exists public.historial_alertas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  estado text not null
    check (estado in ('exitosa', 'fallida', 'sin_respuesta')),
  texto_original text not null,
  texto_groq text,
  costo_creditos integer not null default 1
    check (costo_creditos >= 0),
  creada_en timestamptz not null default now()
);

create index if not exists idx_historial_alertas_usuario_id
  on public.historial_alertas (usuario_id);
create index if not exists idx_historial_alertas_creada_en
  on public.historial_alertas (creada_en desc);

-- =========================================================
-- Trigger: fila en usuarios al registrarse en Auth
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, email, creditos_disponibles)
  values (new.id, coalesce(new.email, ''), 5)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- Consumo atómico de 1 crédito
-- =========================================================
create or replace function public.consumir_credito(p_usuario_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restantes integer;
begin
  update public.usuarios
  set creditos_disponibles = creditos_disponibles - 1
  where id = p_usuario_id
    and creditos_disponibles > 0
  returning creditos_disponibles into v_restantes;

  if v_restantes is null then
    raise exception 'SIN_CREDITOS';
  end if;

  return v_restantes;
end;
$$;

revoke all on function public.consumir_credito(uuid) from public;
grant execute on function public.consumir_credito(uuid) to service_role;

-- =========================================================
-- RLS
-- =========================================================
alter table public.usuarios enable row level security;
alter table public.api_keys enable row level security;
alter table public.historial_alertas enable row level security;

-- usuarios: lectura propia. UPDATE genérico eliminado.
-- El browser solo puede tocar email/telefono vía GRANT de columnas + trigger.
drop policy if exists "usuarios_update_profile" on public.usuarios;

create policy "usuarios_select_own"
  on public.usuarios for select
  to authenticated
  using (auth.uid() = id);

-- RLS de fila (sin esto GRANT de columnas queda inútil: RLS niega el UPDATE).
-- No cubre creditos_disponibles: eso lo blindan REVOKE/GRANT + trigger.
create policy "usuarios_update_own_contact"
  on public.usuarios for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- api_keys
create policy "api_keys_select_own"
  on public.api_keys for select
  to authenticated
  using (auth.uid() = usuario_id);

create policy "api_keys_insert_own"
  on public.api_keys for insert
  to authenticated
  with check (auth.uid() = usuario_id);

create policy "api_keys_update_own"
  on public.api_keys for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

create policy "api_keys_delete_own"
  on public.api_keys for delete
  to authenticated
  using (auth.uid() = usuario_id);

-- historial: solo lectura propia (inserts vía Worker / service_role)
create policy "historial_select_own"
  on public.historial_alertas for select
  to authenticated
  using (auth.uid() = usuario_id);

-- =========================================================
-- 4) billing_events (idempotencia de webhooks Stripe / Lemon Squeezy)
-- =========================================================
create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null
    check (provider in ('stripe', 'lemon_squeezy', 'transbank')),
  event_id text not null,
  event_type text not null,
  usuario_id uuid references public.usuarios (id) on delete set null,
  creditos integer not null
    check (creditos > 0 and creditos <= 1000),
  creada_en timestamptz not null default now(),
  unique (provider, event_id)
);

create index if not exists idx_billing_events_usuario_id
  on public.billing_events (usuario_id);

alter table public.billing_events enable row level security;

-- =========================================================
-- 4b) Transbank Oneclick Mall (Chile) — tokens WK- distintos de Senior Safe
-- =========================================================
create table if not exists public.transbank_inscriptions (
  usuario_id uuid primary key references public.usuarios (id) on delete cascade,
  username text not null unique,
  email text not null,
  inscription_token text,
  tbk_user text,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'failed', 'deleted')),
  plan text not null default 'chile'
    check (plan in ('chile', 'basic')),
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
  operation text not null default 'authorize',
  status text not null default 'initiated',
  authorization_code text,
  response_code integer,
  creada_en timestamptz not null default now()
);

create index if not exists idx_transbank_transactions_usuario
  on public.transbank_transactions (usuario_id);

alter table public.transbank_inscriptions enable row level security;
alter table public.transbank_transactions enable row level security;

-- =========================================================
-- Recarga atómica + idempotente de créditos (solo service_role)
-- =========================================================
create or replace function public.acreditar_creditos(
  p_provider text,
  p_event_id text,
  p_event_type text,
  p_usuario_id uuid,
  p_creditos integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restantes integer;
begin
  if p_creditos is null or p_creditos <= 0 or p_creditos > 1000 then
    raise exception 'CREDITOS_INVALIDOS';
  end if;

  insert into public.billing_events (
    provider, event_id, event_type, usuario_id, creditos
  )
  values (
    p_provider, p_event_id, p_event_type, p_usuario_id, p_creditos
  );

  update public.usuarios
  set creditos_disponibles = creditos_disponibles + p_creditos
  where id = p_usuario_id
  returning creditos_disponibles into v_restantes;

  if v_restantes is null then
    raise exception 'USUARIO_NO_ENCONTRADO';
  end if;

  return v_restantes;
exception
  when unique_violation then
    select creditos_disponibles into v_restantes
    from public.usuarios
    where id = p_usuario_id;
    return coalesce(v_restantes, 0);
end;
$$;

revoke all on function public.acreditar_creditos(text, text, text, uuid, integer) from public;
grant execute on function public.acreditar_creditos(text, text, text, uuid, integer) to service_role;

-- =========================================================
-- Créditos inmutables para JWT authenticated (GRANT + trigger)
-- =========================================================
revoke update on public.usuarios from authenticated, anon;
grant update (email, telefono_verificado) on public.usuarios to authenticated;

create or replace function public.proteger_creditos()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'authenticated' then
    new.creditos_disponibles := old.creditos_disponibles;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_proteger_creditos on public.usuarios;
drop trigger if exists trigger_proteccion_creditos on public.usuarios;
create trigger trigger_proteccion_creditos
  before update on public.usuarios
  for each row execute function public.proteger_creditos();

-- Equipo on-call: ver supabase/migrations/20260819160000_oncall_miembros.sql
-- Turnos semanales: ver supabase/migrations/20260819170000_oncall_turnos.sql
-- Cascada ACK: ver supabase/migrations/20260819180000_oncall_alertas.sql
-- Cupones PH10OFF (Chile) y PRODUCTHUNT20 (International): ver supabase/migrations/20260820180000_oncall_cupones.sql y 20260822120000_cupon_producthunt20.sql

