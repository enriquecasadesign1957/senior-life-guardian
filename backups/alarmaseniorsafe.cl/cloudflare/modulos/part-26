import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { C as CONTRACT_SIGNUPS_TABLE } from "./signups-db-JWUtXpaW.mjs";
function normalizeTwilioPhone(phone) {
  return (phone || "").replace(/^whatsapp:/i, "").replace(/[^\d+]/g, "");
}
function escapeTwimlText(message) {
  return message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function twimlMessage(message) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeTwimlText(message)}</Message></Response>`;
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
      "Cache-Control": "no-cache"
    }
  });
}
async function parseTwilioInbound(request) {
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = await request.json();
    return {
      from: String(j.From ?? ""),
      to: String(j.To ?? ""),
      body: String(j.Body ?? "")
    };
  }
  const text = await request.text();
  const params = new URLSearchParams(text);
  return {
    from: params.get("From") ?? "",
    to: params.get("To") ?? "",
    body: params.get("Body") ?? ""
  };
}
async function logInbound(eventType, meta) {
  try {
    await supabaseAdmin.from("alert_logs").insert({
      event_type: eventType,
      status: "received",
      metadata: meta
    });
  } catch {
  }
}
async function findSignupByPhone(phone) {
  const last9 = phone.replace(/\D/g, "").slice(-9);
  if (!last9) return null;
  const { data: users } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select("id, nombre, telefono").limit(200);
  return (users ?? []).find((u) => {
    const t = (u.telefono || "").replace(/\D/g, "");
    return t.endsWith(last9);
  }) ?? null;
}
function isWhatsAppActivationMessage(textUpper) {
  return textUpper.includes("ACTIVAR") || textUpper.includes("JOIN ASK-HE") || textUpper.includes("ASK-HE");
}
function isSosMessage(textUpper) {
  return /\bSOS\b/.test(textUpper) || /EMERGENCIA|AYUDA URGENTE/.test(textUpper);
}
function isOptOutMessage(textUpper) {
  return /^(STOP|BAJA|CANCELAR|SALIR)$/.test(textUpper);
}
export {
  isSosMessage as a,
  isWhatsAppActivationMessage as b,
  findSignupByPhone as f,
  isOptOutMessage as i,
  logInbound as l,
  normalizeTwilioPhone as n,
  parseTwilioInbound as p,
  twimlMessage as t
};
