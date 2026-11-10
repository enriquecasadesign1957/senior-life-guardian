import { a as assertAdminPin } from "./admin-auth-5OIH6Qjw.mjs";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { a as sendTwilioMessage, t as twilioWhatsappCommercialFrom, b as twilioWhatsappFrom } from "./twilio-DNHuHEFY.mjs";
import { n as normalizeTwilioPhone } from "./twilio-inbound-_C02bj0d.mjs";
function assertInboxPin(pin) {
  assertAdminPin(pin);
}
function toWhatsAppAddress(e164ish) {
  const digits = (e164ish || "").replace(/\D/g, "");
  if (!digits) return "";
  return `whatsapp:+${digits}`;
}
function commercialFromAddress() {
  const raw = twilioWhatsappCommercialFrom();
  return toWhatsAppAddress(raw.startsWith("whatsapp:") ? raw.replace(/^whatsapp:/i, "") : raw);
}
function alertsFromAddress() {
  return twilioWhatsappFrom();
}
async function saveWhatsAppInboxMessage(opts) {
  const peer = normalizeTwilioPhone(opts.peerPhone);
  const body = (opts.body || "").trim();
  if (!peer || !body) return;
  try {
    await supabaseAdmin.from("whatsapp_inbox_messages").insert({
      inbox: opts.inbox,
      direction: opts.direction,
      peer_phone: peer,
      body: body.slice(0, 4e3),
      twilio_sid: opts.twilioSid ?? null
    });
  } catch (e) {
    console.warn("[whatsapp-inbox] save skipped", e);
  }
}
async function listWhatsAppThreads(pin, inbox = "commercial") {
  assertInboxPin(pin);
  const { data, error } = await supabaseAdmin.from("whatsapp_inbox_messages").select("peer_phone, body, direction, created_at").eq("inbox", inbox).order("created_at", { ascending: false }).limit(400);
  if (error) throw error;
  const map = /* @__PURE__ */ new Map();
  for (const row of data ?? []) {
    const peer = String(row.peer_phone ?? "");
    if (!peer || map.has(peer)) continue;
    map.set(peer, {
      peer_phone: peer,
      last_body: String(row.body ?? ""),
      last_at: String(row.created_at ?? ""),
      inbound_count: (data ?? []).filter(
        (r) => r.peer_phone === peer && r.direction === "inbound"
      ).length
    });
  }
  return Array.from(map.values());
}
async function listWhatsAppThreadMessages(pin, peerPhone, inbox = "commercial") {
  assertInboxPin(pin);
  const peer = normalizeTwilioPhone(peerPhone);
  if (!peer) return [];
  const { data, error } = await supabaseAdmin.from("whatsapp_inbox_messages").select("id, inbox, direction, peer_phone, body, twilio_sid, created_at").eq("inbox", inbox).eq("peer_phone", peer).order("created_at", { ascending: true }).limit(200);
  if (error) throw error;
  return data ?? [];
}
async function sendWhatsAppInboxReply(opts) {
  assertInboxPin(opts.pin);
  const inbox = opts.inbox ?? "commercial";
  const peer = normalizeTwilioPhone(opts.peerPhone);
  const body = (opts.body || "").trim();
  if (!peer || body.length < 1) {
    return { ok: false, error: "Mensaje vacío o número inválido." };
  }
  const from = inbox === "commercial" ? commercialFromAddress() : alertsFromAddress();
  const to = toWhatsAppAddress(peer);
  if (!from || !to) {
    return { ok: false, error: "Remitente Twilio no configurado." };
  }
  const sent = await sendTwilioMessage({ to, from, body });
  if (!sent.ok) {
    return { ok: false, error: sent.error ?? "Error al enviar por Twilio." };
  }
  await saveWhatsAppInboxMessage({
    inbox,
    direction: "outbound",
    peerPhone: peer,
    body,
    twilioSid: sent.sid
  });
  return { ok: true };
}
export {
  listWhatsAppThreadMessages as a,
  sendWhatsAppInboxReply as b,
  listWhatsAppThreads as l,
  saveWhatsAppInboxMessage as s
};
