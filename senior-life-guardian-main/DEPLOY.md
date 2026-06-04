# Despliegue producción — Senior Safe (Cloudflare Workers)

La app usa **TanStack Start** + **Cloudflare Workers** (`wrangler.jsonc`). HTTPS y los webhooks públicos quedan en el mismo dominio.

## URLs de webhooks (configurar en Twilio / Zoho)

| Servicio | Método | URL |
|----------|--------|-----|
| WhatsApp Twilio | POST | `https://alarmaseniorsafe.cl/api/public/twilio-whatsapp-webhook` |
| Correo Zoho | POST | `https://alarmaseniorsafe.cl/api/public/zoho-email-webhook` |

Health check: `GET` en las mismas rutas.

## Requisitos

- Cuenta [Cloudflare](https://dash.cloudflare.com) con dominio `alarmaseniorsafe.cl`
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npx wrangler login`)
- Variables de `.env` listas para producción

## Build y deploy

```bash
cd senior-life-guardian-main
npm run deploy
```

O paso a paso:

```bash
npm run build
npx wrangler deploy --cwd dist/server
```

El build genera `dist/server/index.mjs` (entrada Nitro) y `dist/server/wrangler.json` desde `wrangler.jsonc`. **No** despliegues con `main: src/server.ts` — eso muestra "Hello World".

Scripts npm:

- `npm run build` — cliente + Worker (`cloudflare-module`)
- `npm run deploy` — build + deploy con config generada
- `npm run deploy:preview` — deploy entorno preview

## Secretos (no van en wrangler.jsonc)

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put SUPABASE_URL
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TRANSBANK_CC
npx wrangler secret put TRANSBANK_API_KEY
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put ZOHO_SMTP_USER
npx wrangler secret put ZOHO_SMTP_PASSWORD
npx wrangler secret put ZOHO_EMAIL_WEBHOOK_SECRET
```

Opcional: `OPENAI_API_KEY`, `ZOHO_SMTP_BCC` (por defecto `enriquecasadesign@gmail.com`).

## Variables públicas

Edita `vars` en `wrangler.jsonc`:

- `PUBLIC_APP_URL`: `https://alarmaseniorsafe.cl` (retorno Webpay)
- `TRANSBANK_ENVIRONMENT`: `production` cuando uses comercio real

## Dominio personalizado

1. Añade la zona `alarmaseniorsafe.cl` en Cloudflare.
2. Confirma que `routes` en `wrangler.jsonc` apuntan a tu zona.
3. Tras el primer deploy exitoso, puedes poner `"workers_dev": false`.
4. En Twilio Console, actualiza el webhook de WhatsApp a la URL HTTPS de arriba.
5. En Zoho Mail → Developer Space / Filtro, webhook POST con header `X-Webhook-Secret`.

## Zoho Mail (correo automático)

- SMTP: `smtp.zoho.com:465` (usuario `soporte@alarmaseniorsafe.cl`, contraseña de aplicación).
- BCC auditoría: `enriquecasadesign@gmail.com` (configurable con `ZOHO_SMTP_BCC`).

## Notas

- `nodejs_compat` en Workers permite TLS SMTP y APIs de Node usadas por Webpay/Twilio.
- No uses `localhost` en `PUBLIC_APP_URL` en producción; Transbank y Twilio requieren HTTPS público.
