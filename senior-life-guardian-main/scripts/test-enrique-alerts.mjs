/**
 * Prueba alertas/invitaciones para cuenta asociada a +56972189727
 */
import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const raw = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const base = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  Accept: "application/json",
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const PHONE = "+56972189727";

async function get(path) {
  const res = await fetch(`${base}/rest/v1/${path}`, { headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function post(path, body) {
  const res = await fetch(`${base}/rest/v1/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

const signups = await get(
  `contract_signups?telefono=eq.${encodeURIComponent(PHONE)}&select=id,nombre,email,telefono,payment_status,subscription_status&order=created_at.desc`,
);
const signup = Array.isArray(signups.data)
  ? signups.data.find((s) => s.payment_status === "paid") ?? signups.data[0]
  : null;

if (!signup) {
  console.error("No se encontró cuenta para", PHONE);
  process.exit(1);
}

console.log("Cuenta:", signup.nombre, signup.id);

const contacts = await get(
  `emergency_contacts?contract_signup_id=eq.${signup.id}&select=id,nombre,telefono,parentesco,activo,recibe_sms,recibe_whatsapp,recibe_llamada`,
);
console.log("Guardianes:", contacts.data?.length ?? 0);
for (const c of contacts.data ?? []) {
  console.log(`  - ${c.nombre} (${c.parentesco}) ${c.telefono}`);
}

// 1) Simulación entrenamiento (sin Twilio)
const trainingLog = await post("alert_logs", {
  contract_signup_id: signup.id,
  event_type: "training_simulation",
  status: "simulated",
  metadata: {
    training: true,
    message: "Prueba manual script — sin envíos Twilio",
    recipients: (contacts.data ?? []).length,
    tested_by: "test-enrique-alerts.mjs",
  },
});
console.log("\n[1] Entrenamiento simulado:", trainingLog.status === 201 ? "OK" : trainingLog.data);

// 2) Invitación real vía Twilio REST (si hay guardianes)
const sid = env.TWILIO_ACCOUNT_SID;
const token = env.TWILIO_AUTH_TOKEN;
const smsFrom = env.TWILIO_SMS_FROM;
const waFrom = env.TWILIO_WHATSAPP_FROM?.replace(/^whatsapp:/i, "") || smsFrom;

async function twilioSend(to, from, body, channel) {
  const To = channel === "whatsapp" ? `whatsapp:${to.replace(/^\+/, "+")}` : to;
  const From = channel === "whatsapp" ? `whatsapp:${from.replace(/^\+/, "+")}` : from;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To, From, Body: body }),
    },
  );
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, sid: data.sid, error: data.message };
}

const testBody =
  `[PRUEBA Senior Safe] ${signup.nombre}: simulacro de invitación/alerta para validar Twilio. ` +
  `Portal Familia: https://alarmaseniorsafe.cl/familia`;

console.log("\n[2] Enviando SMS de prueba a", PHONE);
const sms = await twilioSend(PHONE, smsFrom, testBody, "sms");
console.log("  SMS:", sms.ok ? `OK sid=${sms.sid}` : `FAIL ${sms.error}`);

console.log("\n[3] Enviando WhatsApp de prueba a", PHONE);
const wa = await twilioSend(PHONE, waFrom, testBody, "whatsapp");
console.log("  WA:", wa.ok ? `OK sid=${wa.sid}` : `FAIL ${wa.error}`);

console.log("\nURLs útiles:");
console.log(`  App entrenamiento: https://alarmaseniorsafe.cl/app?entrenamiento=1&ss=${signup.id}`);
console.log(`  Mis guardianes:    https://alarmaseniorsafe.cl/familia/guardianes`);
