# Backup Senior Safe — código, secretos y plataformas

Guía para respaldar el proyecto completo en disco externo (o nube privada).

> **Seguridad:** el archivo `.env` y los secretos de Cloudflare contienen claves de producción. Guarda el backup en un disco cifrado (BitLocker en Windows) y no lo subas a Git ni a drives públicos.

## 1. Backup automático local → disco externo

Desde PowerShell, en la carpeta del proyecto:

```powershell
cd senior-life-guardian-main
.\scripts\backup-senior-safe.ps1 -Destination "D:\Backups"
```

Opcional: otra ruta o letra de unidad:

```powershell
.\scripts\backup-senior-safe.ps1 -Destination "E:\MisBackups"
```

El script crea una carpeta con fecha, copia el código, `.env`, migraciones, marketing (`public/brochure`, flyers) y genera un manifiesto con enlaces y cuentas.

**Excluye** (se pueden regenerar): `node_modules`, `.wrangler`, cachés de build pesados.

---

## 2. Qué incluye el backup de código

| Elemento | Ubicación |
|----------|-----------|
| App TanStack + Cloudflare Worker | `senior-life-guardian-main/` |
| Config deploy raíz | `../wrangler.jsonc`, `../package.json` |
| Variables locales | `.env` (secretos — **crítico**) |
| Migraciones Supabase | `supabase/migrations/*.sql` |
| Scripts operativos | `scripts/` |
| Materiales marketing | `public/brochure.html`, `public/flyer*.html`, `public/brochure/` |
| Documentación deploy | `DEPLOY.md`, este archivo |

**Git remoto:** https://github.com/enriquecasadesign1957/senior-life-guardian.git  
Muchos cambios recientes aún no están en GitHub → el backup en disco es importante.

---

## 3. Plataformas externas (cuentas y enlaces)

### Producción web

| Recurso | URL / dato |
|---------|------------|
| Sitio principal | https://alarmaseniorsafe.cl |
| Worker (fallback) | https://senior-life-guardian.enriquecasadesign.workers.dev |
| Bandeja WhatsApp | https://alarmaseniorsafe.cl/admin/inbox |
| Brochure | https://alarmaseniorsafe.cl/brochure.html |
| Flyer | https://alarmaseniorsafe.cl/flyer.html |
| Checkout | https://alarmaseniorsafe.cl/checkout |

### Cloudflare

| Recurso | Dónde |
|---------|--------|
| Dashboard | https://dash.cloudflare.com |
| Worker | `senior-life-guardian` |
| Dominio / DNS | `alarmaseniorsafe.cl`, `www.alarmaseniorsafe.cl` |
| Cron renovaciones | `0 14 * * *` (UTC) |
| Variables públicas | `wrangler.jsonc` → `PUBLIC_APP_URL`, `TRANSBANK_ENVIRONMENT`, `TWILIO_WHATSAPP_COMMERCIAL_FROM` |
| Secretos (solo en Cloudflare) | Ver lista con `npm run cf:secrets` |

Secretos típicos en Cloudflare (no van en Git):

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- `TRANSBANK_CC`, `TRANSBANK_API_KEY`
- `GROQ_API_KEY`
- `ZOHO_SMTP_USER`, `ZOHO_SMTP_PASSWORD`, `ZOHO_EMAIL_WEBHOOK_SECRET`
- `CRON_SECRET`, `ADMIN_INBOX_PIN`
- Opcional: `OPENAI_API_KEY`, `ZOHO_SMTP_BCC`

### Supabase (base de datos)

| Recurso | Dato |
|---------|------|
| Dashboard | https://supabase.com/dashboard |
| Project ref | `cgcnjnhifdmornedzpid` |
| URL API | `https://cgcnjnhifdmornedzpid.supabase.co` |
| Migraciones | carpeta `supabase/migrations/` |

**Backup de datos (manual en Supabase):**

1. Dashboard → **Database** → **Backups** (plan Pro) o
2. **SQL** → exportar tablas críticas, o
3. `pg_dump` con la contraseña de `SUPABASE_DB_PASSWORD` en `.env`

Tablas críticas: contrataciones, guardianes, contactos emergencia, transacciones Webpay, renovaciones, inbox WhatsApp, pins.

### Twilio

| Recurso | Dato |
|---------|------|
| Console | https://console.twilio.com |
| WhatsApp alertas | `+56229147733` |
| WhatsApp comercial + IA | `+56971404580` |
| SMS / voz alertas | `+56229147733` |

**Webhooks (configurados en Twilio):**

| Canal | URL |
|-------|-----|
| WhatsApp inbound | `POST https://alarmaseniorsafe.cl/api/public/twilio-whatsapp-webhook` |
| Status callback | `POST https://alarmaseniorsafe.cl/api/public/twilio-status-callback` |

Exportar desde Twilio Console: números, plantillas WhatsApp, logs de mensajes (opcional).

### Groq (IA WhatsApp / correo)

| Recurso | Dato |
|---------|------|
| Console | https://console.groq.com |
| Modelo | `llama-3.3-70b-versatile` |
| Lógica / FAQ | `src/lib/senior-safe-ai.ts` |

### Transbank Webpay Plus

| Recurso | Dato |
|---------|------|
| Portal comercio | https://www.transbank.cl |
| Ambiente | Producción (`TRANSBANK_ENVIRONMENT=production`) |
| Código comercio | en `.env` → `TRANSBANK_CC` |
| Retorno pago | `https://alarmaseniorsafe.cl/webpay/retorno` |

Guardar credenciales del portal Transbank aparte del `.env`.

### Zoho Mail

| Recurso | Dato |
|---------|------|
| Mail admin | https://mail.zoho.com |
| Correo soporte | hola@alarmaseniorsafe.cl |
| SMTP | smtp.zoho.com:465 |
| BCC auditoría | enriquecasadesign@gmail.com |

**Webhook correo entrante:**

`POST https://alarmaseniorsafe.cl/api/public/zoho-email-webhook`  
Header: `X-Webhook-Secret` (valor en secret Cloudflare `ZOHO_EMAIL_WEBHOOK_SECRET`)

### GitHub

| Recurso | Dato |
|---------|------|
| Repo | https://github.com/enriquecasadesign1957/senior-life-guardian |
| Rama | `main` |

Recomendado: después del backup en disco, hacer commit + push de cambios pendientes.

### Otros contactos / cuentas

| Uso | Contacto |
|-----|----------|
| Email soporte | hola@alarmaseniorsafe.cl |
| PIN bandeja inbox | variable `ADMIN_INBOX_PIN` en `.env` / Cloudflare |

---

## 4. Checklist de backup completo

- [ ] Ejecutar `scripts/backup-senior-safe.ps1` al disco externo
- [ ] Verificar que existe `.env` dentro del backup
- [ ] Exportar lista secretos Cloudflare (`npm run cf:secrets` → guardar salida en el backup)
- [ ] Captura o export de DNS Cloudflare (registros del dominio)
- [ ] Backup lógico Supabase (datos clientes / contratos)
- [ ] Anotar credenciales Transbank y Zoho (portales web)
- [ ] Commit + push a GitHub de código pendiente
- [ ] Probar restauración: copiar backup a otra carpeta y `npm install && npm run build`

---

## 5. Restaurar en otro PC

```bash
# 1. Copiar carpeta del backup
# 2. Instalar Node.js 20+
cd senior-life-guardian-main/senior-life-guardian-main
npm install
# 3. Verificar .env
# 4. Login Cloudflare
npx wrangler login
# 5. Re-subir secretos si hace falta (ver DEPLOY.md)
npm run deploy
# 6. Migraciones Supabase si faltan
node scripts/apply-whatsapp-inbox-migration.mjs
```

---

## 6. Frecuencia recomendada

| Qué | Cuándo |
|-----|--------|
| Código + `.env` | Semanal o antes de cada deploy grande |
| Git push | Tras cada feature estable |
| Supabase datos | Semanal (o diario si hay muchos clientes) |
| Capturas Twilio/Zoho/Transbank | Al cambiar webhooks o credenciales |

Última actualización: junio 2026.
