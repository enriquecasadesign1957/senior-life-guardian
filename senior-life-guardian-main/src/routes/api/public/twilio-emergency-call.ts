import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { isAlertCancelled } from "@/lib/emergency-alert-cancel";
import type { EmergencyCategory } from "@/lib/emergency-category";
import {
  buildEmergencyVoiceMessage,
  buildEmergencyVoiceTwiml,
  buildEmergencyVoiceTwimlHangup,
} from "@/lib/emergency-voice-twiml";

type AlertVoiceRow = {
  id: string;
  contract_signup_id: string;
  acknowledged_at: string | null;
  metadata: Record<string, unknown> | null;
};

/** Solo cuenta confirmación explícita (no lectura de WhatsApp). */
function isAcknowledgedForCall(row: AlertVoiceRow | null): boolean {
  if (!row) return false;
  if (row.acknowledged_at) return true;
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return typeof meta.acknowledged_at === "string" && meta.acknowledged_at.length > 0;
}

async function loadAlertVoiceContext(alertId: string): Promise<{
  alert: AlertVoiceRow | null;
  seniorName: string;
  category: EmergencyCategory | null;
}> {
  const { data: alert } = await supabaseAdmin
    .from("alert_logs")
    .select("id, contract_signup_id, acknowledged_at, metadata")
    .eq("id", alertId)
    .maybeSingle();

  const row = (alert as AlertVoiceRow | null) ?? null;
  if (!row) return { alert: null, seniorName: "el usuario", category: null };

  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  const categoryRaw = meta.emergency_category;
  const category =
    typeof categoryRaw === "string" ? (categoryRaw as EmergencyCategory) : null;

  const { data: user } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("nombre")
    .eq("id", row.contract_signup_id)
    .maybeSingle();

  return {
    alert: row,
    seniorName: typeof user?.nombre === "string" && user.nombre.trim() ? user.nombre.trim() : "el usuario",
    category,
  };
}

async function handleEmergencyCall(request: Request): Promise<Response> {
  const alertId = new URL(request.url).searchParams.get("alertId")?.trim();
  if (!alertId) {
    return new Response(buildEmergencyVoiceTwimlHangup(), {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  if (await isAlertCancelled(alertId)) {
    return new Response(buildEmergencyVoiceTwimlHangup(), {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  const ctx = await loadAlertVoiceContext(alertId);
  if (ctx.alert && isAcknowledgedForCall(ctx.alert)) {
    return new Response(buildEmergencyVoiceTwimlHangup(), {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  const text = buildEmergencyVoiceMessage(ctx.seniorName, ctx.category);
  return new Response(buildEmergencyVoiceTwiml(text), {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

/** TwiML dinámico (reserva). Producción usa Twiml inline en la llamada saliente. */
export const Route = createFileRoute("/api/public/twilio-emergency-call")({
  server: {
    handlers: {
      GET: async ({ request }) => handleEmergencyCall(request),
      POST: async ({ request }) => handleEmergencyCall(request),
    },
  },
});
