-- Turnos semanales del equipo on-call (aún no despacha llamadas).
-- dia_semana: 0=domingo … 6=sábado (igual que extract(dow) en PostgreSQL).
-- hora_fin < hora_inicio = cruza medianoche.

create table if not exists public.oncall_turnos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  miembro_id uuid not null references public.oncall_miembros (id) on delete cascade,
  tz text not null default 'America/Santiago',
  dia_semana smallint not null
    check (dia_semana >= 0 and dia_semana <= 6),
  hora_inicio time not null,
  hora_fin time not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  unique (usuario_id, miembro_id, dia_semana, hora_inicio, hora_fin)
);

create index if not exists idx_oncall_turnos_lookup
  on public.oncall_turnos (usuario_id, dia_semana, activo);

alter table public.oncall_turnos enable row level security;

drop policy if exists "oncall_turnos_select_own" on public.oncall_turnos;
create policy "oncall_turnos_select_own"
  on public.oncall_turnos for select
  to authenticated
  using (auth.uid() = usuario_id);

drop policy if exists "oncall_turnos_insert_own" on public.oncall_turnos;
create policy "oncall_turnos_insert_own"
  on public.oncall_turnos for insert
  to authenticated
  with check (auth.uid() = usuario_id);

drop policy if exists "oncall_turnos_update_own" on public.oncall_turnos;
create policy "oncall_turnos_update_own"
  on public.oncall_turnos for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

drop policy if exists "oncall_turnos_delete_own" on public.oncall_turnos;
create policy "oncall_turnos_delete_own"
  on public.oncall_turnos for delete
  to authenticated
  using (auth.uid() = usuario_id);

-- Upsert por teléfono para no borrar turnos al reimportar el mismo squad.
create or replace function public.guardar_miembros_oncall(p_miembros jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_len integer;
  v_count integer;
begin
  if v_uid is null then
    raise exception 'NO_AUTH';
  end if;

  if p_miembros is null or jsonb_typeof(p_miembros) <> 'array' then
    raise exception 'MIEMBROS_INVALIDOS';
  end if;

  v_len := jsonb_array_length(p_miembros);
  if v_len < 1 or v_len > 50 then
    raise exception 'MIEMBROS_LIMITE';
  end if;

  with src as (
    select
      nullif(trim(row.nombre), '') as nombre,
      nullif(trim(row.telefono), '') as telefono,
      nullif(trim(row.email), '') as email,
      greatest(1, least(100, coalesce(row.orden, 1))) as orden,
      coalesce(row.activo, true) as activo
    from jsonb_to_recordset(p_miembros) as row(
      nombre text,
      telefono text,
      email text,
      orden integer,
      activo boolean
    )
    where nullif(trim(row.nombre), '') is not null
      and nullif(trim(row.telefono), '') is not null
  ),
  ins as (
    insert into public.oncall_miembros (
      usuario_id, nombre, telefono, email, orden_escalamiento, activo, actualizada_en
    )
    select v_uid, src.nombre, src.telefono, src.email, src.orden, src.activo, now()
    from src
    on conflict (usuario_id, telefono) do update set
      nombre = excluded.nombre,
      email = excluded.email,
      orden_escalamiento = excluded.orden_escalamiento,
      activo = excluded.activo,
      actualizada_en = now()
    returning id
  ),
  del as (
    delete from public.oncall_miembros m
    where m.usuario_id = v_uid
      and not exists (select 1 from src s where s.telefono = m.telefono)
    returning id
  )
  select count(*)::integer into v_count from src;

  if coalesce(v_count, 0) < 1 then
    raise exception 'MIEMBROS_VACIO';
  end if;

  return v_count;
end;
$$;

revoke all on function public.guardar_miembros_oncall(jsonb) from public;
grant execute on function public.guardar_miembros_oncall(jsonb) to authenticated;

-- Reemplazo atómico de la grilla semanal.
create or replace function public.guardar_turnos_oncall(p_turnos jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_len integer;
  v_count integer;
  v_missing integer;
begin
  if v_uid is null then
    raise exception 'NO_AUTH';
  end if;

  if p_turnos is null or jsonb_typeof(p_turnos) <> 'array' then
    raise exception 'TURNOS_INVALIDOS';
  end if;

  v_len := jsonb_array_length(p_turnos);
  if v_len < 1 or v_len > 350 then
    raise exception 'TURNOS_LIMITE';
  end if;

  select count(*)::integer into v_missing
  from jsonb_to_recordset(p_turnos) as row(
    telefono text,
    dia_semana integer,
    hora_inicio text,
    hora_fin text,
    tz text
  )
  where nullif(trim(row.telefono), '') is not null
    and not exists (
      select 1
      from public.oncall_miembros m
      where m.usuario_id = v_uid
        and m.telefono = nullif(trim(row.telefono), '')
    );

  if v_missing > 0 then
    raise exception 'TELEFONO_NO_EN_EQUIPO';
  end if;

  delete from public.oncall_turnos where usuario_id = v_uid;

  insert into public.oncall_turnos (
    usuario_id, miembro_id, tz, dia_semana, hora_inicio, hora_fin, activo
  )
  select
    v_uid,
    m.id,
    coalesce(nullif(trim(row.tz), ''), 'America/Santiago'),
    row.dia_semana,
    row.hora_inicio::time,
    row.hora_fin::time,
    true
  from jsonb_to_recordset(p_turnos) as row(
    telefono text,
    dia_semana integer,
    hora_inicio text,
    hora_fin text,
    tz text
  )
  join public.oncall_miembros m
    on m.usuario_id = v_uid
   and m.telefono = nullif(trim(row.telefono), '')
  where row.dia_semana between 0 and 6
    and nullif(trim(row.hora_inicio), '') is not null
    and nullif(trim(row.hora_fin), '') is not null
  on conflict (usuario_id, miembro_id, dia_semana, hora_inicio, hora_fin) do nothing;

  get diagnostics v_count = row_count;
  if v_count < 1 then
    raise exception 'TURNOS_VACIO';
  end if;

  return v_count;
end;
$$;

revoke all on function public.guardar_turnos_oncall(jsonb) from public;
grant execute on function public.guardar_turnos_oncall(jsonb) to authenticated;
