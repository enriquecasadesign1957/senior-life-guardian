-- PRODUCTHUNT20: 20% off International Pro (Lemon Squeezy).
-- PH10OFF sigue siendo solo plan Chile (Transbank).

alter table public.oncall_cupones
  add column if not exists plan text not null default 'chile';

alter table public.oncall_cupones
  drop constraint if exists oncall_cupones_plan_check;

alter table public.oncall_cupones
  add constraint oncall_cupones_plan_check
  check (plan in ('chile', 'internacional'));

update public.oncall_cupones
set plan = 'chile'
where codigo = 'PH10OFF' and plan is distinct from 'chile';

insert into public.oncall_cupones (
  codigo,
  porcentaje,
  plan,
  activo,
  valido_desde,
  valido_hasta
)
values (
  'PRODUCTHUNT20',
  20,
  'internacional',
  true,
  now(),
  timezone('America/Santiago', timestamp '2026-09-10 23:59:59')
)
on conflict (codigo) do update
set
  porcentaje = excluded.porcentaje,
  plan = excluded.plan,
  activo = true,
  valido_hasta = excluded.valido_hasta;

drop function if exists public.validar_cupon_oncall(text, integer);

create or replace function public.validar_cupon_oncall(
  p_codigo text,
  p_base_clp integer default 25000,
  p_plan text default 'chile'
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
  v_plan text := lower(trim(coalesce(p_plan, 'chile')));
  v_base integer := greatest(50, coalesce(p_base_clp, 25000));
  v_row public.oncall_cupones%rowtype;
begin
  if v_plan not in ('chile', 'internacional') then
    v_plan := 'chile';
  end if;

  if v_codigo = '' then
    return query select false, null::text, null::integer, v_base;
    return;
  end if;

  select * into v_row
  from public.oncall_cupones c
  where c.codigo = v_codigo;

  if not found
     or v_row.activo is not true
     or v_row.plan is distinct from v_plan
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

revoke all on function public.validar_cupon_oncall(text, integer, text) from public;
grant execute on function public.validar_cupon_oncall(text, integer, text) to anon;
grant execute on function public.validar_cupon_oncall(text, integer, text) to authenticated;
grant execute on function public.validar_cupon_oncall(text, integer, text) to service_role;
