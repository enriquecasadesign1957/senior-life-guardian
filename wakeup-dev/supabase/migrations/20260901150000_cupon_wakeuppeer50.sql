-- Lemon Squeezy published WAKEUPPEER50 (no hyphen). Keep WAKEUP-PEER as alias.

insert into public.oncall_cupones (
  codigo,
  porcentaje,
  plan,
  activo,
  valido_desde,
  valido_hasta
)
values (
  'WAKEUPPEER50',
  50,
  'ambos',
  true,
  now(),
  timezone('America/Santiago', timestamp '2026-11-30 23:59:59')
)
on conflict (codigo) do update
set
  porcentaje = excluded.porcentaje,
  plan = excluded.plan,
  activo = true,
  valido_hasta = excluded.valido_hasta;
