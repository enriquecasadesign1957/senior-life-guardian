import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { locationShareUrl } from "@/lib/maps";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { sendTwilioChannelMessage } from "@/lib/twilio";
import { syncDeviceStatus } from "@/lib/device-status-sync";
import { assertSeniorAccess, seniorAccessTokenSchema } from "@/lib/senior-access-auth";

/**
 * Flujo INDEPENDIENTE del botón "Estoy bien".
 * - NO usa la lógica de emergencia.
 * - NO realiza llamadas automáticas.
 * - NO usa plantilla SOS ni escalamiento.
 * - Solo envía un único mensaje informativo (WhatsApp + SMS best-effort) a los
 *   guardianes activos del adulto mayor.
 * - Registra el evento en alert_logs con event_type = 'wellness_ok' para trazabilidad.
 */

const Schema = z.object({
  signupId: z.string().uuid(),
  accessToken: seniorAccessTokenSchema,
  gps: z
    .object({ lat: z.number(), lng: z.number(), accuracy: z.number().optional() })
    .nullable()
    .optional(),
});

function normalizePhone(raw: string): string | null {
  const trimmed = (raw ?? "").replace(/[^\d+]/g, "");
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) return trimmed;
  if (/^\d{8,9}$/.test(trimmed)) return `+56${trimmed}`;
  return `+${trimmed}`;
}

export const sendWellnessNotice = createServerFn({ method: "POST" })
  .inputValidator((input) => Schema.parse(input))
  .handler(async ({ data }) => {
    await assertSeniorAccess(data.signupId, data.accessToken);
    const { data: user } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("id, nombre")
      .eq("id", data.signupId)
      .maybeSingle();
    if (!user) return { ok: false, error: "user_not_found", recipients: 0 };

    const { data: contacts } = await supabaseAdmin
      .from("emergency_contacts")
      .select("id, nombre, telefono, parentesco, activo")
      .eq("contract_signup_id", user.id);

    const recipients = (contacts ?? [])
      .filter((c) => c.activo !== false)
      .map((c) => ({ ...c, phone: normalizePhone(c.telefono) }))
      .filter((c) => c.phone) as Array<{ id: string; nombre: string; phone: string }>;

    const timestamp = new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" });
    const mapsLink = data.gps
      ? `\nUbicación: ${locationShareUrl(data.gps.lat, data.gps.lng, user.nombre)}`
      : "";

    const body =
      `${user.nombre} informa que se encuentra bien ✅\n` +
      `No se requiere acción.\n\n` +
      `Hora: ${timestamp}${mapsLink}`;

    const results: Array<{
      to: string;
      channel: "whatsapp" | "sms";
      status: "sent" | "failed";
      error?: string | null;
    }> = [];

    // Mensaje informativo único: 1 WhatsApp + 1 SMS por guardián. SIN llamadas. SIN reintentos.
    for (const r of recipients) {
      const wa = await sendTwilioChannelMessage(r.phone, body, "whatsapp");
      results.push({ to: r.phone, channel: "whatsapp", status: wa.ok ? "sent" : "failed", error: wa.error });
      const sms = await sendTwilioChannelMessage(r.phone, body, "sms");
      results.push({ to: r.phone, channel: "sms", status: sms.ok ? "sent" : "failed", error: sms.error });
    }

    // Registrar como evento informativo (NO emergencia) para auditoría.
    try {
      await supabaseAdmin.from("alert_logs").insert({
        contract_signup_id: user.id,
        event_type: "wellness_ok",
        status: results.some((r) => r.status === "sent") ? "delivered" : "no_recipients",
        gps_lat: data.gps?.lat ?? null,
        gps_lng: data.gps?.lng ?? null,
        gps_accuracy: data.gps?.accuracy ?? null,
        recipients: recipients.map((r) => ({ id: r.id, nombre: r.nombre, telefono: r.phone })),
        metadata: { kind: "wellness_ok", timestamp, results } as never,
      } as never);
    } catch {
      /* best-effort */
    }

    try {
      await syncDeviceStatus({
        contractSignupId: user.id,
        gps_enabled: data.gps != null,
        last_lat: data.gps?.lat ?? null,
        last_lng: data.gps?.lng ?? null,
        internet_connected: true,
        app_version: "native-wellness",
      });
    } catch (e) {
      console.error("[wellness] device_status sync failed:", e);
    }

    return { ok: true, recipients: recipients.length, results };
  });
