-- WakeUp Dev — billing webhooks + créditos inmutables para authenticated
-- Ejecutar en el SQL Editor de Supabase sobre el proyecto ya inicializado

-- =========================================================
-- billing_events
-- =========================================================
create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null
    check (provider in ('stripe', 'lemon_squeezy')),
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
-- Recarga atómica + idempotente
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
-- Créditos inmutables desde el browser
-- =========================================================
drop policy if exists "usuarios_update_profile" on public.usuarios;
drop policy if exists "usuarios_update_own_contact" on public.usuarios;

create policy "usuarios_update_own_contact"
  on public.usuarios for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

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
