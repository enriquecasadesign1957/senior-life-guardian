/**
 * Plantilla v4: cumple reglas Meta (sin variable al final del body ni de la URL).
 *   node scripts/create-emergency-whatsapp-template-v4.mjs
 */
const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

if (!accountSid || !authToken) {
  console.error("Faltan TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN");
  process.exit(1);
}

const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
const FRIENDLY_NAME = "senior_safe_emergency_alert_v4";

const templateBody = {
  friendly_name: FRIENDLY_NAME,
  language: "es",
  variables: {
    "1": "María",
    "2": "Caída · GPS: maps.google.com · Hora: 12/06/2026 14:30",
    "3": "abc123def456789012345678",
  },
  types: {
    "twilio/call-to-action": {
      body:
        "🚨 *Senior Safe — URGENTE*\n\n" +
        "{{1}} necesita ayuda inmediata.\n\n" +
        "{{2}}\n\n" +
        "Toca el botón para confirmar. — Senior Safe",
      actions: [
        {
          type: "URL",
          title: "Confirmar alerta",
          url: "https://alarmaseniorsafe.cl/a/{{3}}/c",
        },
      ],
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
    console.log("Plantilla v4 creada:", content.sid);
  } else {
    console.log("Plantilla v4 existente:", content.sid);
  }
  console.log("SID:", content.sid);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
