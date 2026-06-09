import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendTwilioMessage, twilioWhatsappCommercialFrom, twilioWhatsappFrom } from "@/lib/twilio";
import { normalizeTwilioPhone } from "@/lib/twilio-inbound";

export type WhatsAppInboxKind = "commercial" | "alerts";

export type InboxMessage = {
  id: string;
  inbox: WhatsAppInboxKind;
  direction: "inbound" | "outbound";
  peer_phone: string;
  body: string;
  twilio_sid: string | null;
  created_at: string;
};

export type InboxThread = {
  peer_phone: string;
  last_body: string;
  last_at: string;
  inbound_count: number;
};

function assertInboxPin(pin: string): void {
  const expected = process.env.ADMIN_INBOX_PIN?.trim();
  if (!expected) {
    throw new Error("Bandeja no configurada (falta ADMIN_INBOX_PIN en el servidor).");
  }
  if (pin !== expected) {
    throw new Error("PIN incorrecto.");
  }
}

function toWhatsAppAddress(e164ish: string): string {
  const digits = (e164ish || "").replace(/\D/g, "");
  if (!digits) return "";
  return `whatsapp:+${digits}`;
}

function commercialFromAddress(): string {
  const raw = twilioWhatsappCommercialFrom();
  return toWhatsAppAddress(raw.startsWith("whatsapp:") ? raw.replace(/^whatsapp:/i, "") : raw);
}

function alertsFromAddress(): string {
  return twilioWhatsappFrom();
}

export async function saveWhatsAppInboxMessage(opts: {
  inbox: WhatsAppInboxKind;
  direction: "inbound" | "outbound";
  peerPhone: string;
  body: string;
  twilioSid?: string | null;
}): Promise<void> {
  const peer = normalizeTwilioPhone(opts.peerPhone);
  const body = (opts.body || "").trim();
  if (!peer || !body) return;

  try {
    await supabaseAdmin.from("whatsapp_inbox_messages").insert({
      inbox: opts.inbox,
      direction: opts.direction,
      peer_phone: peer,
      body: body.slice(0, 4000),
      twilio_sid: opts.twilioSid ?? null,
    });
  } catch (e) {
    console.warn("[whatsapp-inbox] save skipped", e);
  }
}

export async function listWhatsAppThreads(
  pin: string,
  inbox: WhatsAppInboxKind = "commercial",
): Promise<InboxThread[]> {
  assertInboxPin(pin);

  const { data, error } = await supabaseAdmin
    .from("whatsapp_inbox_messages")
    .select("peer_phone, body, direction, created_at")
    .eq("inbox", inbox)
    .order("created_at", { ascending: false })
    .limit(400);

  if (error) throw error;

  const map = new Map<string, InboxThread>();
  for (const row of data ?? []) {
    const peer = String(row.peer_phone ?? "");
    if (!peer || map.has(peer)) continue;
    map.set(peer, {
      peer_phone: peer,
      last_body: String(row.body ?? ""),
      last_at: String(row.created_at ?? ""),
      inbound_count: (data ?? []).filter(
        (r) => r.peer_phone === peer && r.direction === "inbound",
      ).length,
    });
  }

  return Array.from(map.values());
}

export async function listWhatsAppThreadMessages(
  pin: string,
  peerPhone: string,
  inbox: WhatsAppInboxKind = "commercial",
): Promise<InboxMessage[]> {
  assertInboxPin(pin);
  const peer = normalizeTwilioPhone(peerPhone);
  if (!peer) return [];

  const { data, error } = await supabaseAdmin
    .from("whatsapp_inbox_messages")
    .select("id, inbox, direction, peer_phone, body, twilio_sid, created_at")
    .eq("inbox", inbox)
    .eq("peer_phone", peer)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) throw error;
  return (data ?? []) as InboxMessage[];
}

export async function sendWhatsAppInboxReply(opts: {
  pin: string;
  peerPhone: string;
  body: string;
  inbox?: WhatsAppInboxKind;
}): Promise<{ ok: boolean; error?: string }> {
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
    twilioSid: sent.sid,
  });

  return { ok: true };
}
