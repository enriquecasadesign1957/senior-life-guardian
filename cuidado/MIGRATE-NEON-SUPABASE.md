# Fase 1 — Neon → Supabase (solo CuidadoWeb)

Proyecto **nuevo** en Supabase, separado de Alarma y WakeUp. Misma app, mismo Drizzle; solo cambia el proveedor Postgres.

## Por qué no el pooler :6543

El diagnóstico toma `pg_advisory_xact_lock` (`apps/web/lib/locks.ts`). En Vercel usa:

- **URI directa** `postgresql://postgres:…@db.<ref>.supabase.co:5432/postgres?sslmode=require` (preferida), o
- **Session pooler** `…@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require`

No uses Transaction pooler (`:6543` / `pgbouncer=true`).

## Pasos (producción)

### 1. Crear proyecto Supabase

1. Entra en [supabase.com](https://supabase.com) con la misma cuenta de Alarma/WakeUp.
2. **New project** → nombre `cuidadoweb` (o `cuidado-web`).
3. Región cercana (p. ej. South America si está disponible; si no, US East).
4. Guarda la DB password del proyecto (solo la ves al crear).
5. **Settings → Database → Connection string → URI**.
6. Elige **Direct connection** (host `db.<ref>.supabase.co`, puerto `5432`).
7. Sustituye `[YOUR-PASSWORD]` y añade `?sslmode=require` si falta.

No abras Auth/RLS para CuidadoWeb: la app sigue con cookies HMAC + `pg`; no usa el cliente JS de Supabase.

### 2. Copiar datos Neon → Supabase

En una máquina con `postgresql-client` (o este agente cuando tengas las URIs en env):

```bash
cd cuidado
export NEON_DATABASE_URL='postgresql://…@….neon.tech/neondb?sslmode=require'   # actual de Vercel
export SUPABASE_DATABASE_URL='postgresql://postgres:…@db.XXXX.supabase.co:5432/postgres?sslmode=require'

# Solo conectividad
bash scripts/migrate-neon-to-supabase.sh --dry-run

# Cutover (ventana corta: no escribir en Neon mientras corre)
bash scripts/migrate-neon-to-supabase.sh
```

El script hace `pg_dump` (custom) + `pg_restore`, crea `pgcrypto` y muestra conteos de `users`, `sites`, `scan_runs`, `agency_invite_codes`.

### 3. Validar URI

```bash
DATABASE_URL="$SUPABASE_DATABASE_URL" node scripts/check-database-url.mjs
# ok: true, provider: supabase, mode: direct
```

Opcional (no debería aplicar nada nuevo si el dump trajo `__drizzle_migrations`):

```bash
DATABASE_URL="$SUPABASE_DATABASE_URL" npm run db:migrate
```

### 4. Cutover Vercel

1. Vercel → proyecto `cuidadoweb` → Settings → Environment Variables.
2. Edita **Production** `DATABASE_URL` → URI directa Supabase.
3. Redeploy Production (o “Redeploy” del último deployment).
4. Smoke test en `https://cuidadoweb.com`:
   - Landing + diagnóstico de un sitio
   - Login agencia / código
   - Informe + Lemon (intl) o Transbank (cl)
   - `/admin/codigos` si usas admin
5. Confirma que el cron `/api/watch` del día siguiente corre (logs Vercel).

### 5. Cierre Neon

- 7 días: Neon en solo lectura / sin escrituras.
- Si todo estable: borrar proyecto Neon.

## Rollback

1. En Vercel, vuelve `DATABASE_URL` a la URI Neon.
2. Redeploy.
3. Neon debe haber seguido intacto (no borrar hasta validar).

## Qué no hacer

- No migrar al proyecto Supabase de Alarma (`mjdjfjxehnfroqyfzkyk` / prod) ni al de WakeUp.
- No pegar passwords en el chat; usa env locales o secrets del panel.
- No apuntar Preview a producción sin querer: Preview puede seguir en Neon hasta el cutover, o usar un segundo proyecto Supabase `cuidadoweb-preview`.
