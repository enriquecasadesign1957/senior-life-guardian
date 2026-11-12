# Levantar cuidadoweb.com

No publicar CuidadoWeb en el Pages `senior-life-guardian.pages.dev`. No tocar los Workers de `alarmaseniorsafe.cl`, `alarmaseniorsafe.com`, `wakeupdev.com` ni `api.wakeupdev.com`.

## Por qué a veces “se mezcla” con Senior Safe

Todo vive en el **mismo repo GitHub** `senior-life-guardian`:

| Producto | Carpeta | Hosting |
|----------|---------|---------|
| CuidadoWeb | `cuidado/` | **Vercel** → cuidadoweb.com |
| Alarma Senior Safe | `senior-life-guardian-main/` | **Cloudflare** Workers/Pages |
| WakeUpDev | `wakeup-dev/` | otro deploy |

Si un PR solo cambia Senior Safe (p. ej. GTM, Las Condes), GitHub igual notifica al proyecto Vercel `cuidadoweb` porque está conectado al repo entero. Por eso viste comentarios de `vercel[bot]` y el error de **Hobby** (cron `*/15`) en un PR que no era de CuidadoWeb.

Mitigación en `vercel.json` de la raíz:

- Cron diario (`0 14 * * *`) para que Hobby pueda publicar.
- `ignoreCommand`: Vercel **omite** el build si el commit no toca `cuidado/` ni `vercel.json`.

Los mails viejos del PR #17 son de cuando aún estaba el cron `*/15`. Production actual ya no usa ese schedule.

La raíz del repositorio tiene un `vercel.json` que publica un solo servicio, `cuidadoweb`, desde `cuidado/apps/web`. Todo el tráfico público entra por `/`. El cron de `/api/watch` corre una vez al día (`0 14 * * *`) para que el deploy pase en Hobby; en Pro se puede volver a `*/15 * * * *`. `senior-life-guardian-main` y `wakeup-dev/web` no forman parte de este proyecto.

## 1. Postgres (Supabase — proyecto `cuidadoweb`)

CuidadoWeb ya no usa Neon. Usa un **proyecto Supabase propio** (no el de Alarma ni el de WakeUp). Detalle del cutover: [`MIGRATE-NEON-SUPABASE.md`](./MIGRATE-NEON-SUPABASE.md).

1. En [supabase.com](https://supabase.com) crea el proyecto `cuidadoweb`.
2. Settings → Database → Connection string → **Direct** (`db.<ref>.supabase.co:5432`).
3. No uses Transaction pooler (`:6543`): el diagnóstico necesita `pg_advisory_xact_lock`.
4. La URI debe terminar en `sslmode=require`.
5. Guárdala para Vercel. No la subas a Git.

## 2. Claves de la aplicación

En Vercel van estas variables. `AUTH_SECRET`, `TOKEN_ENCRYPTION_KEY` y `CRON_SECRET` ya se generaron para este proyecto. Si se perdieron, crea otra de cada una con `openssl rand -base64 32`. No reutilices una clave distinta para las tres.

- `DATABASE_URL`: la URI directa de Supabase (`db.*.supabase.co:5432`).
- `AUTH_SECRET`
- `TOKEN_ENCRYPTION_KEY`
- `CRON_SECRET`
- `APP_URL` = `https://cuidadoweb.com`
- `GOOGLE_PSI_API_KEY`: paso 3.
- `ALLOW_PRIVATE_URLS` no se define, o queda en `false`.

Lemon Squeezy ya tiene los productos (pago internacional). En Vercel basta con `LEMON_SQUEEZY_WEBHOOK_SECRET` (los buy URL y variant id tienen valor por defecto). En Lemon: Settings → Webhooks → URL `https://cuidadoweb.com/api/lemon/webhook`, eventos `order_created`, signing secret = esa variable.

### Transbank Chile
En el informe el usuario elige **Chile · Transbank** o **Internacional · Lemon**.
- Rescate Chile → Webpay Plus (`TRANSBANK_CC` + `TRANSBANK_API_KEY`)
- Plan Chile → Oneclick Mall (`TRANSBANK_ONECLICK_MALL_CC`, `TRANSBANK_ONECLICK_STORE_CC`, `TRANSBANK_ONECLICK_API_KEY`); si faltan, cae a Webpay del primer mes
- Montos fijos CLP: `TRANSBANK_RESCATE_CLP` (default 27000), `TRANSBANK_PLAN_CLP` (default 18000)
- `TRANSBANK_ENVIRONMENT=sandbox|production`
- SQL: aplicar `0008_payment_intents.sql` (ya incluido en `npm run db:migrate`)

- `ADMIN_SECRET` o `CREA_CLAVES_AGENCIAS` (opcional): clave del panel `/admin/codigos`. Si defines cualquiera de las dos, esa es la clave de entrada. Si no hay ninguna, el valor por defecto es `CwAdminPanel2026`.

Los códigos de prueba se crean en **Códigos** (`/admin/codigos`): eliges la vigencia (1–30 días), generas y copias. Cada código tiene un solo uso, 5 sitios y fecha de vencimiento. Ya no hace falta insertarlos a mano en la base.

## 3. PageSpeed

1. En [Google Cloud](https://console.cloud.google.com/) crea un proyecto `CuidadoWeb`.
2. Activa **PageSpeed Insights API**.
3. En Credenciales, crea una clave de API.
4. Restringe la clave a PageSpeed Insights API.
5. Ese valor es `GOOGLE_PSI_API_KEY`.

## 4. Vercel

1. Hobby acepta el cron diario actual. Pro hace falta solo si quieres vigilancia cada 15 minutos o un sitio que cobra con margen.
2. En Spend Management, deja el gasto extra en $0.
3. Importa el repositorio `enriquecasadesign1957/senior-life-guardian`. La pantalla deja la rama en `main`. Esa rama ya contiene CuidadoWeb.
4. Deja el directorio raíz en `./`. El `vercel.json` de la raíz publica solo el servicio `cuidadoweb`.
5. Nombre del proyecto: `cuidadoweb`.
6. Confirma que el Ignored Build Step / `ignoreCommand` del `vercel.json` esté activo (solo construye si cambió `cuidado/` o `vercel.json`).
7. Pega las variables del paso 2 en Production.
8. Deploy.

## 5. Tablas

En tu máquina, dentro de `cuidado`, con la misma `DATABASE_URL` directa:

```bash
npm run db:migrate
```

Eso aplica hasta `0007_agency_code_expires.sql` (vigencia de códigos de agencia).

## 6. Dominio

1. En el proyecto de Vercel, agrega `cuidadoweb.com` y `www.cuidadoweb.com`.
2. Copia los registros que muestra Vercel.
3. En Cloudflare, zona `cuidadoweb.com`, crea esos registros con el proxy apagado (DNS only, nube gris).
4. No actives el proxy naranja.

## 7. Comprobación

1. Abre `https://cuidadoweb.com`.
2. Pega una dirección pública y pide el diagnóstico.
3. El botón de $29 debe abrir el checkout de Lemon Squeezy (Rescate). El de $19 abre el Plan Cuidado.
