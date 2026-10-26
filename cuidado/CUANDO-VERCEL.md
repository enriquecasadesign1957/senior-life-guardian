# Levantar cuidadoweb.com

No publicar CuidadoWeb en el Pages `senior-life-guardian.pages.dev`. No tocar los Workers de `alarmaseniorsafe.cl`, `alarmaseniorsafe.com`, `wakeupdev.com` ni `api.wakeupdev.com`.

El archivo `apps/web/vercel.json` ya instala desde `cuidado/` y programa `/api/watch` cada 15 minutos. Ese cron solo despliega en el plan Pro.

## 1. Neon

1. Entra en [neon.tech](https://neon.tech) y crea un proyecto llamado `cuidado`.
2. Si aparece la región, elige São Paulo.
3. Abre la cadena de conexión y desactiva el modo pooled. El host no debe contener `-pooler`.
4. Copia la URI. Tiene que terminar en `sslmode=require`.
5. Guárdala para Vercel. No la subas a Git.

## 2. Claves de la aplicación

En Vercel van estas variables. `AUTH_SECRET`, `TOKEN_ENCRYPTION_KEY` y `CRON_SECRET` ya se generaron para este proyecto. Si se perdieron, crea otra de cada una con `openssl rand -base64 32`. No reutilices una clave distinta para las tres.

- `DATABASE_URL`: la URI directa de Neon.
- `AUTH_SECRET`
- `TOKEN_ENCRYPTION_KEY`
- `CRON_SECRET`
- `APP_URL` = `https://cuidadoweb.com`
- `GOOGLE_PSI_API_KEY`: paso 3.
- `ALLOW_PRIVATE_URLS` no se define, o queda en `false`.

Stripe puede esperar. Sin `STRIPE_SECRET_KEY` el botón de $29 no cobra.

## 3. PageSpeed

1. En [Google Cloud](https://console.cloud.google.com/) crea un proyecto `CuidadoWeb`.
2. Activa **PageSpeed Insights API**.
3. En Credenciales, crea una clave de API.
4. Restringe la clave a PageSpeed Insights API.
5. Ese valor es `GOOGLE_PSI_API_KEY`.

## 4. Vercel

1. La cuenta tiene que estar en Pro. Hobby rechaza el cron de 15 minutos y no cubre un sitio que cobra.
2. En Spend Management, deja el gasto extra en $0.
3. Importa el repositorio `enriquecasadesign1957/senior-life-guardian`.
4. Directorio raíz: `cuidado/apps/web`.
5. Rama de producción: `cursor/cuidado-backend-5a2b` hasta que ese pull request se fusione en `main`. Después vuelve a `main`.
6. Pega las variables del paso 2 en Production.
7. Deploy.

## 5. Tablas

En tu máquina, dentro de `cuidado`, con la misma `DATABASE_URL` directa:

```bash
npm run db:migrate
```

Eso aplica `0000_init.sql`, `0001_site_probe.sql` y `0002_rescue_checkout.sql`.

## 6. Dominio

1. En el proyecto de Vercel, agrega `cuidadoweb.com` y `www.cuidadoweb.com`.
2. Copia los registros que muestra Vercel.
3. En Cloudflare, zona `cuidadoweb.com`, crea esos registros con el proxy apagado (DNS only, nube gris).
4. No actives el proxy naranja.

## 7. Comprobación

1. Abre `https://cuidadoweb.com`.
2. Pega una dirección pública y pide el diagnóstico.
3. El botón de $29 debe decir que falta Stripe y que no se ha cobrado nada.
