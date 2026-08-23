-- Alinea billing_events + acreditar_creditos con el Worker desplegado.
-- El script de 4 parámetros (p_cantidad_creditos, sin p_event_type) NO lo usa el Worker.
-- Ejecutar en el SQL Editor.

drop function if exists public.acreditar_creditos(text, text, uuid, integer);

alter table public.billing_events
  add column if not exists event_type text;

alter table public.billing_events
  add column if not exists creditos integer;

update public.billing_events
set event_type = coalesce(event_type, 'unknown')
where event_type is null;

update public.billing_events
set creditos = coalesce(creditos, 1)
where creditos is null;

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

-- Carga Pro de la compra Lemon que no llegó por webhook
select public.acreditar_creditos(
  'lemon_squeezy',
  'manual-pro-2026-08-17',
  'manual_pro',
  'c8c0dd7b-ff08-4f51-ac07-0efad17b670f',
  50
);
