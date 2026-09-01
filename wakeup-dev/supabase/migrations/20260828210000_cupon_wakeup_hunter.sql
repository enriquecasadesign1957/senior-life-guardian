-- WAKEUP-HUNTER: +50 créditos de voz de regalo, canje en dashboard hasta 2026-09-10.
-- Los créditos de este lote caducan 180 días después del canje (FIFO al consumir).

create table if not exists public.oncall_cupones_credito (
  codigo text primary key,
  creditos integer not null
    check (creditos > 0 and creditos <= 1000),
  vigencia_dias integer not null default 180
    check (vigencia_dias >= 1 and vigencia_dias <= 3660),
  activo boolean not null default true,
  valido_desde timestamptz not null default now(),
  valido_hasta timestamptz,
  max_usos integer
    check (max_usos is null or max_usos >= 1),
  usos integer not null default 0
    check (usos >= 0),
  creado_en timestamptz not null default now()
);

create table if not exists public.oncall_credito_lotes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  codigo text not null references public.oncall_cupones_credito (codigo) on delete restrict,
  creditos_otorgados integer not null
    check (creditos_otorgados > 0),
  creditos_restantes integer not null
    check (creditos_restantes >= 0),
  expira_en timestamptz not null,
  expirado_en timestamptz,
  canjeado_en timestamptz not null default now(),
  unique (codigo, usuario_id),
  check (creditos_restantes <= creditos_otorgados)
);

create index if not exists idx_oncall_credito_lotes_usuario
  on public.oncall_credito_lotes (usuario_id);

create index if not exists idx_oncall_credito_lotes_expira
  on public.oncall_credito_lotes (expira_en)
  where creditos_restantes > 0 and expirado_en is null;

alter table public.oncall_cupones_credito enable row level security;
alter table public.oncall_credito_lotes enable row level security;

drop policy if exists "credito_lotes_select_own" on public.oncall_credito_lotes;
create policy "credito_lotes_select_own"
  on public.oncall_credito_lotes for select
  to authenticated
  using (auth.uid() = usuario_id);

insert into public.oncall_cupones_credito (
  codigo,
  creditos,
  vigencia_dias,
  activo,
  valido_desde,
  valido_hasta
)
values (
  'WAKEUP-HUNTER',
  50,
  180,
  true,
  now(),
  timezone('America/Santiago', timestamp '2026-09-10 23:59:59')
)
on conflict (codigo) do update
set
  creditos = excluded.creditos,
  vigencia_dias = excluded.vigencia_dias,
  activo = true,
  valido_hasta = excluded.valido_hasta;

-- Quita del balance los créditos de regalo vencidos de un usuario.
create or replace function public.expirar_creditos_regalo_usuario(p_usuario_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lote record;
  v_total integer := 0;
begin
  if p_usuario_id is null then
    return 0;
  end if;

  for v_lote in
    select id, creditos_restantes
    from public.oncall_credito_lotes
    where usuario_id = p_usuario_id
      and creditos_restantes > 0
      and expirado_en is null
      and expira_en <= now()
    for update
  loop
    update public.usuarios
    set creditos_disponibles = greatest(0, creditos_disponibles - v_lote.creditos_restantes)
    where id = p_usuario_id;

    update public.oncall_credito_lotes
    set
      creditos_restantes = 0,
      expirado_en = now()
    where id = v_lote.id;

    v_total := v_total + v_lote.creditos_restantes;
  end loop;

  return v_total;
end;
$$;

revoke all on function public.expirar_creditos_regalo_usuario(uuid) from public;
grant execute on function public.expirar_creditos_regalo_usuario(uuid) to service_role;

-- Cron diario (Worker): expira todos los lotes vencidos.
create or replace function public.expirar_creditos_regalo()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_total integer := 0;
begin
  for v_uid in
    select distinct usuario_id
    from public.oncall_credito_lotes
    where creditos_restantes > 0
      and expirado_en is null
      and expira_en <= now()
  loop
    v_total := v_total + public.expirar_creditos_regalo_usuario(v_uid);
  end loop;

  return v_total;
end;
$$;

revoke all on function public.expirar_creditos_regalo() from public;
grant execute on function public.expirar_creditos_regalo() to service_role;

-- Canje atómico: un código por usuario, +créditos y lote con caducidad.
create or replace function public.canjear_cupon_creditos(
  p_codigo text,
  p_usuario_id uuid
)
returns table (
  ok boolean,
  motivo text,
  creditos_agregados integer,
  creditos_disponibles integer,
  expira_en timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text := upper(trim(coalesce(p_codigo, '')));
  v_cupon public.oncall_cupones_credito%rowtype;
  v_lote_id uuid;
  v_expira timestamptz;
  v_balance integer;
  v_existe integer;
begin
  if v_codigo = '' or p_usuario_id is null then
    return query select false, 'codigo_invalido', 0, 0, null::timestamptz;
    return;
  end if;

  select * into v_cupon
  from public.oncall_cupones_credito
  where codigo = v_codigo
  for update;

  if not found then
    return query select false, 'codigo_invalido', 0, 0, null::timestamptz;
    return;
  end if;

  if v_cupon.activo is not true then
    return query select false, 'inactivo', 0, 0, null::timestamptz;
    return;
  end if;

  if v_cupon.valido_desde > now()
     or (v_cupon.valido_hasta is not null and v_cupon.valido_hasta < now())
  then
    return query select false, 'no_vigente', 0, 0, null::timestamptz;
    return;
  end if;

  if v_cupon.max_usos is not null and v_cupon.usos >= v_cupon.max_usos then
    return query select false, 'agotado', 0, 0, null::timestamptz;
    return;
  end if;

  select 1 into v_existe
  from public.usuarios
  where id = p_usuario_id
  for update;

  if v_existe is null then
    return query select false, 'usuario_no_encontrado', 0, 0, null::timestamptz;
    return;
  end if;

  v_expira := now() + make_interval(days => v_cupon.vigencia_dias);

  insert into public.oncall_credito_lotes (
    usuario_id,
    codigo,
    creditos_otorgados,
    creditos_restantes,
    expira_en
  )
  values (
    p_usuario_id,
    v_codigo,
    v_cupon.creditos,
    v_cupon.creditos,
    v_expira
  )
  on conflict (codigo, usuario_id) do nothing
  returning id into v_lote_id;

  if v_lote_id is null then
    select u.creditos_disponibles, l.expira_en
    into v_balance, v_expira
    from public.usuarios u
    join public.oncall_credito_lotes l
      on l.usuario_id = u.id
     and l.codigo = v_codigo
    where u.id = p_usuario_id;

    return query select
      false,
      'ya_canjeado',
      0,
      coalesce(v_balance, 0),
      v_expira;
    return;
  end if;

  update public.oncall_cupones_credito
  set usos = usos + 1
  where codigo = v_codigo;

  update public.usuarios as u
  set creditos_disponibles = u.creditos_disponibles + v_cupon.creditos
  where u.id = p_usuario_id
  returning u.creditos_disponibles into v_balance;

  return query select
    true,
    'ok'::text,
    v_cupon.creditos,
    coalesce(v_balance, 0),
    v_expira;
end;
$$;

revoke all on function public.canjear_cupon_creditos(text, uuid) from public;
grant execute on function public.canjear_cupon_creditos(text, uuid) to service_role;

-- Consumo FIFO: primero caduca lotes vencidos, luego descuenta el lote que expira antes.
create or replace function public.consumir_credito(p_usuario_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restantes integer;
  v_lote_id uuid;
begin
  perform public.expirar_creditos_regalo_usuario(p_usuario_id);

  update public.usuarios
  set creditos_disponibles = creditos_disponibles - 1
  where id = p_usuario_id
    and creditos_disponibles > 0
  returning creditos_disponibles into v_restantes;

  if v_restantes is null then
    raise exception 'SIN_CREDITOS';
  end if;

  select id into v_lote_id
  from public.oncall_credito_lotes
  where usuario_id = p_usuario_id
    and creditos_restantes > 0
    and expirado_en is null
    and expira_en > now()
  order by expira_en asc, canjeado_en asc
  limit 1
  for update;

  if v_lote_id is not null then
    update public.oncall_credito_lotes
    set creditos_restantes = creditos_restantes - 1
    where id = v_lote_id
      and creditos_restantes > 0;
  end if;

  return v_restantes;
end;
$$;

revoke all on function public.consumir_credito(uuid) from public;
grant execute on function public.consumir_credito(uuid) to service_role;
