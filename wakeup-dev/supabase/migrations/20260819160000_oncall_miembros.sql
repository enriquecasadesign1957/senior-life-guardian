-- Equipo on-call por cuenta (aún no despacha llamadas; solo roster).

create table if not exists public.oncall_miembros (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  nombre text not null,
  telefono text not null,
  email text,
  orden_escalamiento integer not null default 1
    check (orden_escalamiento >= 1 and orden_escalamiento <= 100),
  activo boolean not null default true,
  actualizada_en timestamptz not null default now(),
  creado_en timestamptz not null default now(),
  unique (usuario_id, telefono)
);

create index if not exists idx_oncall_miembros_usuario_orden
  on public.oncall_miembros (usuario_id, orden_escalamiento);

alter table public.oncall_miembros enable row level security;

drop policy if exists "oncall_miembros_select_own" on public.oncall_miembros;
create policy "oncall_miembros_select_own"
  on public.oncall_miembros for select
  to authenticated
  using (auth.uid() = usuario_id);

drop policy if exists "oncall_miembros_insert_own" on public.oncall_miembros;
create policy "oncall_miembros_insert_own"
  on public.oncall_miembros for insert
  to authenticated
  with check (auth.uid() = usuario_id);

drop policy if exists "oncall_miembros_update_own" on public.oncall_miembros;
create policy "oncall_miembros_update_own"
  on public.oncall_miembros for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

drop policy if exists "oncall_miembros_delete_own" on public.oncall_miembros;
create policy "oncall_miembros_delete_own"
  on public.oncall_miembros for delete
  to authenticated
  using (auth.uid() = usuario_id);

-- Reemplazo atómico del roster (CSV "Guardar Miembros").
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

  delete from public.oncall_miembros where usuario_id = v_uid;

  insert into public.oncall_miembros (
    usuario_id, nombre, telefono, email, orden_escalamiento, activo
  )
  select
    v_uid,
    nullif(trim(row.nombre), ''),
    nullif(trim(row.telefono), ''),
    nullif(trim(row.email), ''),
    greatest(1, least(100, coalesce(row.orden, 1))),
    coalesce(row.activo, true)
  from jsonb_to_recordset(p_miembros) as row(
    nombre text,
    telefono text,
    email text,
    orden integer,
    activo boolean
  )
  where nullif(trim(row.nombre), '') is not null
    and nullif(trim(row.telefono), '') is not null;

  get diagnostics v_count = row_count;
  if v_count < 1 then
    raise exception 'MIEMBROS_VACIO';
  end if;

  return v_count;
end;
$$;

revoke all on function public.guardar_miembros_oncall(jsonb) from public;
grant execute on function public.guardar_miembros_oncall(jsonb) to authenticated;
