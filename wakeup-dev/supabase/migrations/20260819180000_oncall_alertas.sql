-- Cascada on-call: ACK estricto. AMD queda apagado por flag en el Worker.
-- dia/hora de cobertura: America/Santiago (o tz de cada turno).

create table if not exists public.oncall_alertas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  estado text not null default 'TRIGGERED'
    check (estado in (
      'TRIGGERED',
      'CALLING',
      'ACKNOWLEDGED',
      'NO_ANSWER',
      'EXHAUSTED',
      'FAILED'
    )),
  orden_actual integer not null default 1
    check (orden_actual >= 1 and orden_actual <= 50),
  intento integer not null default 1
    check (intento >= 1 and intento <= 50),
  texto_original text not null default '',
  texto_voz text not null default '',
  call_sid text,
  telefono_destino text,
  historial_id uuid,
  ack_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizada_en timestamptz not null default now()
);

create index if not exists idx_oncall_alertas_usuario_creada
  on public.oncall_alertas (usuario_id, creado_en desc);

alter table public.oncall_alertas enable row level security;

drop policy if exists "oncall_alertas_select_own" on public.oncall_alertas;
create policy "oncall_alertas_select_own"
  on public.oncall_alertas for select
  to authenticated
  using (auth.uid() = usuario_id);

create or replace function public.oncall_telefonos_ahora(p_usuario_id uuid)
returns table (telefono text, orden_escalamiento integer)
language sql
stable
security definer
set search_path = public
as $$
  select m.telefono, m.orden_escalamiento
  from public.oncall_turnos t
  join public.oncall_miembros m on m.id = t.miembro_id
  where t.usuario_id = p_usuario_id
    and m.usuario_id = p_usuario_id
    and t.activo
    and m.activo
    and t.dia_semana = extract(
      dow from timezone(coalesce(nullif(t.tz, ''), 'America/Santiago'), now())
    )::int
    and (
      (
        t.hora_inicio <= t.hora_fin
        and timezone(coalesce(nullif(t.tz, ''), 'America/Santiago'), now())::time
          >= t.hora_inicio
        and timezone(coalesce(nullif(t.tz, ''), 'America/Santiago'), now())::time
          < t.hora_fin
      )
      or (
        t.hora_inicio > t.hora_fin
        and (
          timezone(coalesce(nullif(t.tz, ''), 'America/Santiago'), now())::time
            >= t.hora_inicio
          or timezone(coalesce(nullif(t.tz, ''), 'America/Santiago'), now())::time
            < t.hora_fin
        )
      )
    )
  order by m.orden_escalamiento, m.creado_en;
$$;

revoke all on function public.oncall_telefonos_ahora(uuid) from public;
grant execute on function public.oncall_telefonos_ahora(uuid) to service_role;

create or replace function public.oncall_marcar_ack(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  update public.oncall_alertas
  set
    estado = 'ACKNOWLEDGED',
    ack_en = now(),
    actualizada_en = now()
  where id = p_id
    and estado in ('TRIGGERED', 'CALLING', 'NO_ANSWER')
  returning id into v_id;
  return v_id is not null;
end;
$$;

revoke all on function public.oncall_marcar_ack(uuid) from public;
grant execute on function public.oncall_marcar_ack(uuid) to service_role;

-- Gana el primero (timer 45s o statusCallback). Evita doble cascada.
create or replace function public.oncall_claim_timeout(p_id uuid, p_intento integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  update public.oncall_alertas
  set
    estado = 'NO_ANSWER',
    intento = p_intento + 1,
    orden_actual = p_intento + 1,
    actualizada_en = now()
  where id = p_id
    and estado = 'CALLING'
    and intento = p_intento
  returning id into v_id;
  return v_id is not null;
end;
$$;

revoke all on function public.oncall_claim_timeout(uuid, integer) from public;
grant execute on function public.oncall_claim_timeout(uuid, integer) to service_role;
