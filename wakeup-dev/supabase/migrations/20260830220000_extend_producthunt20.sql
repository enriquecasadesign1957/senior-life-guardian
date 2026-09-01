-- Extiende PRODUCTHUNT20 (20% Intl / Lemon Squeezy) hasta 2026-11-30.
-- PH10OFF y WAKEUP-HUNTER no cambian.

update public.oncall_cupones
set
  activo = true,
  valido_hasta = timezone('America/Santiago', timestamp '2026-11-30 23:59:59')
where codigo = 'PRODUCTHUNT20';
