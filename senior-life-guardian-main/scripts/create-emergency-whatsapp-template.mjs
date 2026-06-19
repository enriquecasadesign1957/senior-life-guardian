/**
 * Crea (o reutiliza) la plantilla WhatsApp de emergencia en Twilio Content API.
 * Requiere TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN en el entorno.
 *
 * Uso:
 *   node scripts/create-emergency-whatsapp-template.mjs
 *
 * Luego en Cloudflare:
 *   npx wrangler secret put TWILIO_EMERGENCY_WHATSAPP_CONTENT_SID --cwd dist/server
 */
const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

if (!accountSid || !authToken) {
  console.error("Faltan TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN");
  process.exit(1);
}

const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
const FRIENDLY_NAME = "senior_safe_emergency_alert_v1";

const templateBody = {
  friendly_name: FRIENDLY_NAME,
  language: "es",
  variables: { "1": "María", "2": "https://alarmaseniorsafe.cl/a/ejemplo/token" },
  types: {
    "twilio/text": {
      body:
        "🚨 *Senior Safe — URGENTE*\n\n" +
        "{{1}} necesita ayuda inmediata.\n\n" +
        "Confirma aquí: {{2}}",
    },
  },
};

async function twilioFetch(url, init = {}) {
  const resp = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`${resp.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function findExisting() {
  const list = await twilioFetch("https://content.twilio.com/v1/Content?PageSize=100");
  const items = list.contents || [];
  return items.find((c) => c.friendly_name === FRIENDLY_NAME) || null;
}

async function main() {
  let content = await findExisting();
  if (content) {
    console.log("Plantilla existente:", content.sid, content.friendly_name);
  } else {
    content = await twilioFetch("https://content.twilio.com/v1/Content", {
      method: "POST",
      body: JSON.stringify(templateBody),
    });
    console.log("Plantilla creada:", content.sid);
  }

  console.log("\nVariables de plantilla:");
  console.log("  {{1}} = nombre del usuario senior");
  console.log("  {{2}} = enlace de confirmación (ack)");
  console.log("\nSiguiente paso — secret en Cloudflare Workers:");
  console.log(`  TWILIO_EMERGENCY_WHATSAPP_CONTENT_SID=${content.sid}`);
  console.log("\nAprueba la plantilla en Meta Business Manager (Twilio Console → Content Template Builder).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
