/**
 * Plantilla v6: nombre + detalle/GPS + revisar SMS.
 *   node scripts/create-emergency-whatsapp-template-v6.mjs
 */
const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

if (!accountSid || !authToken) {
  console.error("Faltan TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN");
  process.exit(1);
}

const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
const FRIENDLY_NAME = "senior_safe_emergency_alert_v6";

const templateBody = {
  friendly_name: FRIENDLY_NAME,
  language: "es",
  variables: {
    "1": "Clara Ventura",
    "2": "GPS: https://maps.google.com/?q=-33.4,-70.6 · Caída · Hora: 12/06/2026 14:30",
  },
  types: {
    "twilio/text": {
      body:
        "🚨 *Senior Safe — URGENTE*\n\n" +
        "{{1}} necesita ayuda urgente.\n\n" +
        "{{2}}\n\n" +
        "Revisa tu SMS para ver todos los detalles de la alerta y confirmar. — Senior Safe",
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
  if (!resp.ok) throw new Error(`${resp.status} ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  const list = await twilioFetch("https://content.twilio.com/v1/Content?PageSize=100");
  const items = list.contents || [];
  let content = items.find((c) => c.friendly_name === FRIENDLY_NAME);
  if (!content) {
    content = await twilioFetch("https://content.twilio.com/v1/Content", {
      method: "POST",
      body: JSON.stringify(templateBody),
    });
    console.log("Plantilla v6 creada:", content.sid);
  } else {
    console.log("Plantilla v6 existente:", content.sid);
  }
  console.log("SID:", content.sid);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
