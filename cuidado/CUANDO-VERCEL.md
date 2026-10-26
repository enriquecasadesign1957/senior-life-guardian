# Levantar cuidadoweb.com

El repo ya trae `apps/web/vercel.json`: instala desde `cuidado/` y llama a `/api/watch` cada 15 minutos. No publicar CuidadoWeb en el Pages `senior-life-guardian.pages.dev`.

Esta máquina no tiene sesión de Vercel ni de Neon. Los clics que faltan son estos.

## Vercel

- Plan Pro ($20 al mes). Hobby no sirve: el sitio cobra y la vigilancia corre cada 15 minutos.
- En Spend Management, tope de gasto extra en $0. Si el crédito de $20 se acaba, el uso se detiene.
- No activar Blob, Image Optimization, Sandbox, Workflows, Queues, Observability Plus, Analytics Plus ni v0.
- Importar el repo `enriquecasadesign1957/senior-life-guardian`.
- Rama: `cursor/cuidado-backend-5a2b` hasta que se fusione. La raíz del repo es Senior Life Guardian; el directorio de la app es `cuidado/apps/web`.
- Dominio `cuidadoweb.com` en ese proyecto. En Cloudflare, el proxy de ese dominio queda apagado.

## Neon

- El plan gratis alcanza para arrancar.
- `DATABASE_URL` es la conexión directa, sin `-pooler` en el host.
- Aplicar las migraciones de `packages/db/drizzle`, incluida `0002_rescue_checkout.sql`.

## Variables

- `DATABASE_URL`
- `AUTH_SECRET`
- `TOKEN_ENCRYPTION_KEY`
- `GOOGLE_PSI_API_KEY`
- `APP_URL=https://cuidadoweb.com`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` apuntando a `https://cuidadoweb.com/api/stripe/webhook`

Sin las claves de Stripe el botón de $29 no cobra. El Rescate solo se activa cuando Stripe confirma un pago de $29, y la vigilancia dura 30 días. La limpieza de la base no se ejecuta sola.

## Lo que no se toca

- Worker `senior-life-guardian` (`alarmaseniorsafe.cl` y `.com`).
- Workers de `wakeupdev.com` y `api.wakeupdev.com`.
- El Pages `senior-life-guardian` queda con los despliegues automáticos desactivados.
