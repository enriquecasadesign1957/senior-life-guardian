#!/usr/bin/env bash
# Copia Neon (origen) → Supabase Postgres (destino) para CuidadoWeb.
# No mezcla con los proyectos de Alarma ni WakeUp.
#
# Requisitos:
#   - pg_dump / pg_restore / psql (postgresql-client)
#   - NEON_DATABASE_URL  = URI directa Neon (sin -pooler)
#   - SUPABASE_DATABASE_URL = URI directa Supabase db.<ref>.supabase.co:5432
#
# Uso:
#   export NEON_DATABASE_URL='postgresql://...'
#   export SUPABASE_DATABASE_URL='postgresql://postgres:...@db.XXXX.supabase.co:5432/postgres'
#   bash cuidado/scripts/migrate-neon-to-supabase.sh
#
# Flags:
#   --dry-run   Solo valida URIs y conectividad; no escribe
#   --schema-only  Solo esquema (sin datos)
#   --data-only    Solo datos (el destino ya tiene tablas vía drizzle migrate)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DRY_RUN=0
DUMP_MODE="full" # full | schema | data

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --schema-only) DUMP_MODE="schema" ;;
    --data-only) DUMP_MODE="data" ;;
    -h|--help)
      sed -n '1,20p' "$0"
      exit 0
      ;;
    *)
      echo "Flag desconocida: $arg" >&2
      exit 1
      ;;
  esac
done

if [[ -z "${NEON_DATABASE_URL:-}" ]]; then
  echo "Falta NEON_DATABASE_URL" >&2
  exit 1
fi
if [[ -z "${SUPABASE_DATABASE_URL:-}" ]]; then
  echo "Falta SUPABASE_DATABASE_URL" >&2
  exit 1
fi

assert_not_transaction_pooler() {
  local name="$1" url="$2"
  if [[ "$url" == *":6543"* ]] || [[ "$url" == *"pgbouncer=true"* ]]; then
    echo "$name parece pooler en modo transacción. Usa URI directa :5432." >&2
    exit 1
  fi
  if [[ "$url" == *"-pooler."* ]]; then
    echo "$name contiene -pooler. Usa la URI directa (db.*.supabase.co o Neon sin pooler)." >&2
    exit 1
  fi
}

assert_not_transaction_pooler "NEON_DATABASE_URL" "$NEON_DATABASE_URL"
assert_not_transaction_pooler "SUPABASE_DATABASE_URL" "$SUPABASE_DATABASE_URL"

if [[ "$SUPABASE_DATABASE_URL" != *"supabase"* ]]; then
  echo "SUPABASE_DATABASE_URL no parece de Supabase. Abortando por seguridad." >&2
  exit 1
fi

echo "==> Probando origen (Neon)…"
psql "$NEON_DATABASE_URL" -v ON_ERROR_STOP=1 -c "SELECT current_database() AS db, now() AS ts;" >/dev/null
echo "==> Probando destino (Supabase)…"
psql "$SUPABASE_DATABASE_URL" -v ON_ERROR_STOP=1 -c "SELECT current_database() AS db, now() AS ts;" >/dev/null

# Extensión usada por gen_random_uuid()
echo "==> Asegurando pgcrypto en destino…"
if [[ "$DRY_RUN" -eq 0 ]]; then
  psql "$SUPABASE_DATABASE_URL" -v ON_ERROR_STOP=1 -c 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";'
else
  echo "(dry-run) CREATE EXTENSION pgcrypto"
fi

STAMP="$(date -u +%Y%m%d-%H%M%S)"
WORK="${TMPDIR:-/tmp}/cuidado-neon-supabase-${STAMP}"
mkdir -p "$WORK"
DUMP="$WORK/dump.fc"

DUMP_ARGS=(--format=custom --no-owner --no-acl --verbose)
case "$DUMP_MODE" in
  schema) DUMP_ARGS+=(--schema-only) ;;
  data) DUMP_ARGS+=(--data-only) ;;
  full) ;;
esac

echo "==> pg_dump Neon → $DUMP (mode=$DUMP_MODE)…"
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "(dry-run) pg_dump ${DUMP_ARGS[*]}"
  echo "OK dry-run. Conectividad verificada."
  exit 0
fi

pg_dump "$NEON_DATABASE_URL" "${DUMP_ARGS[@]}" --file="$DUMP"

echo "==> Contando tablas en origen…"
ORIG_TABLES="$(psql "$NEON_DATABASE_URL" -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")"
echo "    public tables (Neon): $ORIG_TABLES"

echo "==> pg_restore → Supabase…"
# --clean no: destino debe estar vacío o casi vacío (proyecto nuevo).
pg_restore --dbname="$SUPABASE_DATABASE_URL" --no-owner --no-acl --verbose "$DUMP" \
  || {
    # pg_restore devuelve 1 con warnings menores (p.ej. comments); re-verificar tablas
    echo "pg_restore terminó con código $?; revisando tablas…"
  }

DEST_TABLES="$(psql "$SUPABASE_DATABASE_URL" -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")"
echo "    public tables (Supabase): $DEST_TABLES"

if [[ "$DUMP_MODE" != "schema" && "$DEST_TABLES" -lt 1 ]]; then
  echo "El destino no tiene tablas públicas. Falló la restauración." >&2
  exit 1
fi

echo "==> Conteos de filas (muestra)…"
psql "$SUPABASE_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'users' AS t, count(*)::text AS n FROM users
UNION ALL SELECT 'sites', count(*)::text FROM sites
UNION ALL SELECT 'scan_runs', count(*)::text FROM scan_runs
UNION ALL SELECT 'agency_invite_codes', count(*)::text FROM agency_invite_codes
ORDER BY 1;
SQL

echo
echo "Listo. Dump en: $DUMP"
echo "Siguiente:"
echo "  1. DATABASE_URL=<URI directa Supabase> npm run db:migrate   # no-op si el dump traía drizzle meta"
echo "  2. Validar: DATABASE_URL=... node scripts/check-database-url.mjs"
echo "  3. En Vercel Production, reemplazar DATABASE_URL por la URI directa de Supabase"
echo "  4. Redeploy + smoke: login, informe, Lemon webhook, Transbank"
echo "  5. Neon en solo lectura 7 días; luego borrar el proyecto"
