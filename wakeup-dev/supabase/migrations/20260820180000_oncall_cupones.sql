-- Cupones on-call (Product Hunt PH10OFF hasta 2026-09-10).
-- El browser nunca manda el monto: el Worker valida y cobra pending_cupon_monto.

create table if not exists public.oncall_cupones (
  codigo text primary key,
  porcentaje integer not null
    check (porcentaje >= 1 and porcentaje <= 90),
  activo boolean not null default true,
  valido_desde timestamptz not null default now(),
  valido_hasta timestamptz,
  max_usos integer
    check (max_usos is null or max_usos >= 1),
  usos integer not null default 0
    check (usos >= 0),
  creado_en timestamptz not null default now()
);

create table if not exists public.oncall_cupon_redenciones (
  id uuid primary key default gen_random_uuid(),
  codigo text not null references public.oncall_cupones (codigo) on delete cascade,
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  monto_clp integer not null check (monto_clp >= 50),
  creada_en timestamptz not null default now(),
  unique (codigo, usuario_id)
);

create index if not exists idx_oncall_cupon_redenciones_usuario
  on public.oncall_cupon_redenciones (usuario_id);

alter table public.transbank_inscriptions
  add column if not exists pending_cupon text;

alter table public.transbank_inscriptions
  add column if not exists pending_cupon_monto integer
    check (pending_cupon_monto is null or pending_cupon_monto >= 50);

alter table public.transbank_transactions
  add column if not exists cupon_codigo text;

alter table public.oncall_cupones enable row level security;
alter table public.oncall_cupon_redenciones enable row level security;

create or replace function public.validar_cupon_oncall(
  p_codigo text,
  p_base_clp integer default 25000
)
returns table (
  valido boolean,
  codigo text,
  porcentaje integer,
  monto_clp integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_codigo text := upper(trim(coalesce(p_codigo, '')));
  v_base integer := greatest(50, coalesce(p_base_clp, 25000));
  v_row public.oncall_cupones%rowtype;
begin
  if v_codigo = '' then
    return query select false, null::text, null::integer, v_base;
    return;
  end if;

  select * into v_row
  from public.oncall_cupones c
  where c.codigo = v_codigo;

  if not found
     or v_row.activo is not true
     or v_row.valido_desde > now()
     or (v_row.valido_hasta is not null and v_row.valido_hasta < now())
     or (v_row.max_usos is not null and v_row.usos >= v_row.max_usos)
  then
    return query select false, v_codigo, null::integer, v_base;
    return;
  end if;

  return query select
    true,
    v_row.codigo,
    v_row.porcentaje,
    greatest(
      50,
      round(v_base * (100 - v_row.porcentaje) / 100.0)::integer
    );
end;
$$;

revoke all on function public.validar_cupon_oncall(text, integer) from public;
grant execute on function public.validar_cupon_oncall(text, integer) to anon;
grant execute on function public.validar_cupon_oncall(text, integer) to authenticated;
grant execute on function public.validar_cupon_oncall(text, integer) to service_role;

create or replace function public.consumir_cupon_oncall(
  p_codigo text,
  p_usuario_id uuid,
  p_monto_clp integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text := upper(trim(coalesce(p_codigo, '')));
  v_id uuid;
begin
  if v_codigo = '' or p_usuario_id is null then
    return false;
  end if;

  insert into public.oncall_cupon_redenciones (codigo, usuario_id, monto_clp)
  values (v_codigo, p_usuario_id, greatest(50, coalesce(p_monto_clp, 50)))
  on conflict (codigo, usuario_id) do nothing
  returning id into v_id;

  if v_id is null then
    return true;
  end if;

  update public.oncall_cupones
  set usos = usos + 1
  where codigo = v_codigo;

  return true;
end;
$$;

revoke all on function public.consumir_cupon_oncall(text, uuid, integer) from public;
grant execute on function public.consumir_cupon_oncall(text, uuid, integer) to service_role;

insert into public.oncall_cupones (
  codigo,
  porcentaje,
  activo,
  valido_desde,
  valido_hasta
)
values (
  'PH10OFF',
  10,
  true,
  now(),
  timezone('America/Santiago', timestamp '2026-09-10 23:59:59')
)
on conflict (codigo) do update
set
  porcentaje = excluded.porcentaje,
  activo = true,
  valido_hasta = excluded.valido_hasta;
