import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";

export function normalizeTwilioPhone(phone: string): string {
  return (phone || "").replace(/^whatsapp:/i, "").replace(/[^\d+]/g, "");
}

/** Normaliza números Twilio para comparación agnóstica (whatsapp:/+, espacios). */
export function cleanTwilioAddress(num: string): string {
  return (num || "").replace(/^whatsapp:/i, "").replace(/^\+/, "").trim();
}

export function escapeTwimlText(message: string): string {
  return message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function twimlMessage(message: string): Response {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<Response><Message>${escapeTwimlText(message)}</Message></Response>`;
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
      "Cache-Control": "no-cache",
    },
  });
}

export async function parseTwilioInbound(
  request: Request,
): Promise<{ from: string; to: string; body: string }> {
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = (await request.json()) as Record<string, unknown>;
    return {
      from: String(j.From ?? ""),
      to: String(j.To ?? ""),
      body: String(j.Body ?? ""),
    };
  }
  const text = await request.text();
  const params = new URLSearchParams(text);
  return {
    from: params.get("From") ?? "",
    to: params.get("To") ?? "",
    body: params.get("Body") ?? "",
  };
}

export async function logInbound(eventType: string, meta: Record<string, unknown>) {
  try {
    await supabaseAdmin.from("alert_logs").insert({
      event_type: eventType,
      status: "received",
      metadata: meta as never,
    });
  } catch {
    /* best-effort */
  }
}

export async function findSignupByPhone(phone: string) {
  const last9 = phone.replace(/\D/g, "").slice(-9);
  if (!last9) return null;

  const { data: users } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("id, nombre, telefono")
    .limit(200);

  return (
    (users ?? []).find((u) => {
      const t = (u.telefono || "").replace(/\D/g, "");
      return t.endsWith(last9);
    }) ?? null
  );
}

export function isWhatsAppActivationMessage(textUpper: string): boolean {
  return (
    textUpper.includes("ACTIVAR") ||
    textUpper.includes("JOIN ASK-HE") ||
    textUpper.includes("ASK-HE")
  );
}

export function isSosMessage(textUpper: string): boolean {
  return /\bSOS\b/.test(textUpper) || /EMERGENCIA|AYUDA URGENTE/.test(textUpper);
}

export function isOptOutMessage(textUpper: string): boolean {
  return /^(STOP|BAJA|CANCELAR|SALIR)$/.test(textUpper);
}
