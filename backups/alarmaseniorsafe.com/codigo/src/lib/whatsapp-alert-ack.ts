import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { acknowledgeAlertByToken, acknowledgeAlertByIdAndToken, normalizeAckToken } from "@/lib/ack-alert";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";

function phoneLast9(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

/** Respuestas típicas de guardianes confirmando recepción de alerta. */
export function isEmergencyAlertAckMessage(body: string): boolean {
  const t = (body || "").trim();
  if (!t) return false;
  const upper = t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "");

  if (/FAMILIA\/ACK\/[A-Z0-9]+/i.test(t)) return true;
  if (/\/a\/[a-f0-9]{12,}/i.test(t)) return true;
  if (/\b[A-F0-9]{12,48}\b/i.test(t) && t.length < 80) return true;

  return (
    /^(SI|SÍ|OK|OKEY|LISTO|VISTO|ACEPTO|CONFIRMO|CONFIRMADO|RECIBIDO|RECIBIDA|RECIBI|YA RECIBI|YA LO VI|ALERTA RECIBIDA|CONFIRMACION)\b/.test(
      upper,
    ) ||
    /\b(CONFIRMO QUE RECIBI|YA RECIBI LA ALERTA|RECIBI LA ALERTA|VI LA ALERTA)\b/.test(upper)
  );
}

function extractAckToken(body: string): { alertId?: string; token: string } | null {
  const withId = body.match(/\/a\/([0-9a-f-]{36})\/([a-z0-9]+)/i);
  if (withId?.[1] && withId?.[2]) {
    return { alertId: withId[1], token: normalizeAckToken(withId[2]) };
  }
  const short = body.match(/\/a\/([a-z0-9]+)/i);
  if (short?.[1] && short[1].length >= 12) return { token: normalizeAckToken(short[1]) };
  const api = body.match(/ack-alert\/([a-z0-9]+)/i);
  if (api?.[1]) return { token: normalizeAckToken(api[1]) };
  const legacy = body.match(/familia\/ack\/([a-z0-9]+)/i);
  if (legacy?.[1]) return { token: normalizeAckToken(legacy[1]) };
  const bare = body.trim().match(/\b([a-f0-9]{12,48})\b/i);
  return bare?.[1] ? { token: normalizeAckToken(bare[1]) } : null;
}

async function ackByToken(
  parsed: { alertId?: string; token: string },
  guardianName?: string | null,
): Promise<string | null> {
  try {
    const result = parsed.alertId
      ? await acknowledgeAlertByIdAndToken(parsed.alertId, parsed.token, guardianName ?? undefined)
      : await acknowledgeAlertByToken(parsed.token, guardianName ?? undefined);
    const seniorName = await fetchSeniorFirstName(result.contract_signup_id);
    if (result.already) {
      return "Senior Safe 🛡️\n✅ Esta alerta ya había sido confirmada. Gracias.";
    }
    return `Senior Safe 🛡️\n✅ Alerta confirmada. Le avisaremos a ${seniorName} que ya recibiste la notificación. Gracias.`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("expiró")) {
      return "Senior Safe 🛡️\nEl link de confirmación expiró. Si aún necesitas ayuda, contacta al senior directamente.";
    }
    return null;
  }
}

async function fetchSeniorFirstName(signupId: string | null): Promise<string> {
  if (!signupId) return "el usuario";
  const { data } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("nombre")
    .eq("id", signupId)
    .maybeSingle();
  return data?.nombre?.split(" ")?.[0] ?? "el usuario";
}

async function findGuardianByPhone(phone: string) {
  const last9 = phoneLast9(phone);
  if (last9.length < 8) return null;

  const { data: contacts } = await supabaseAdmin
    .from("emergency_contacts")
    .select("id, nombre, contract_signup_id, telefono, whatsapp")
    .eq("activo", true)
    .limit(200);

  return (
    (contacts ?? []).find((c) => {
      const t = (c.telefono || "").replace(/\D/g, "");
      const w = (c.whatsapp || c.telefono || "").replace(/\D/g, "");
      return t.endsWith(last9) || w.endsWith(last9);
    }) ?? null
  );
}

/**
 * Procesa confirmación de alerta por WhatsApp (guardianes).
 * Devuelve TwiML message o null si no aplica.
 */
export async function processWhatsAppAlertAck(
  phone: string,
  body: string,
  options?: { forceAck?: boolean },
): Promise<string | null> {
  const parsed = extractAckToken(body);
  if (parsed) {
    const guardian = await findGuardianByPhone(phone);
    return ackByToken(parsed, guardian?.nombre ?? null);
  }

  if (!options?.forceAck && !isEmergencyAlertAckMessage(body)) return null;

  const guardian = await findGuardianByPhone(phone);
  if (!guardian) return null;

  const { data: alert } = await supabaseAdmin
    .from("alert_logs")
    .select("id, acknowledged_at, acknowledgement_expires_at, contract_signup_id, created_at")
    .eq("contract_signup_id", guardian.contract_signup_id)
    .eq("event_type", "emergency_pressed")
    .is("acknowledged_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!alert) {
    return (
      "Senior Safe 🛡️\nNo hay alertas de emergencia pendientes por confirmar desde tu número. " +
      "Si necesitas ayuda con el servicio, escribe tu consulta."
    );
  }

  if (
    alert.acknowledgement_expires_at &&
    new Date(alert.acknowledgement_expires_at).getTime() < Date.now()
  ) {
    return "Senior Safe 🛡️\nLa ventana de confirmación de esta alerta expiró. Por favor contacta al usuario directamente.";
  }

  await supabaseAdmin
    .from("alert_logs")
    .update({
      acknowledged_at: new Date().toISOString(),
      acknowledgement_by_name: guardian.nombre?.slice(0, 120) ?? null,
    })
    .eq("id", alert.id);

  const seniorName = await fetchSeniorFirstName(guardian.contract_signup_id);
  const first = guardian.nombre?.split(" ")?.[0] ?? "Guardián";
  return (
    `Senior Safe 🛡️\n✅ Gracias ${first}, confirmamos que recibiste la alerta de ${seniorName}. ` +
    `Le informaremos que ya estás al tanto.`
  );
}
