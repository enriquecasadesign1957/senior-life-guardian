import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CASCADE_ALGORITHM_ID } from "@/lib/emergency-cascade-timing";
import { twilioPost } from "@/lib/twilio";

export type TwilioCallLatency = {
  path: string;
  ms: number;
};

export type MetricasLatenciaInput = {
  alertLogId: string;
  contractSignupId: string;
  tiempoSupabase: number | null;
  tiempoTwilioApi: number;
  twilioCalls?: TwilioCallLatency[];
  training?: boolean;
  algorithm?: string;
};

/** Acumula duraciones HTTP de twilioPost durante una cascada. */
export function createTwilioLatencyTracker() {
  let totalMs = 0;
  const calls: TwilioCallLatency[] = [];
  return {
    async post(path: string, body: Record<string, string>) {
      const r = await twilioPost(path, body);
      totalMs += r.durationMs;
      calls.push({ path, ms: r.durationMs });
      return r;
    },
    snapshot(): { totalMs: number; calls: TwilioCallLatency[] } {
      return { totalMs, calls: [...calls] };
    },
  };
}

export type MetricasLatenciaInput = {
  alertLogId: string;
  contractSignupId: string;
  tiempoSupabase: number | null;
  tiempoTwilioApi: number;
  twilioCalls?: TwilioCallLatency[];
  training?: boolean;
  algorithm?: string;
};

/** Calcula ms cliente → insert confirmado; null si falta o es inválido el timestamp. */
export function computeTiempoSupabaseMs(
  sosTriggeredAtMs: number | undefined,
  insertConfirmedAtMs: number,
): number | null {
  if (sosTriggeredAtMs == null || !Number.isFinite(sosTriggeredAtMs)) return null;
  const delta = insertConfirmedAtMs - sosTriggeredAtMs;
  if (delta < 0 || delta > 300_000) return null;
  return Math.round(delta);
}

/** Persiste métricas; no lanza — no debe bloquear la cascada SOS. */
export async function persistMetricasLatencia(input: MetricasLatenciaInput): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("metricas_latencia").insert({
      alert_log_id: input.alertLogId,
      contract_signup_id: input.contractSignupId,
      algorithm: input.algorithm ?? CASCADE_ALGORITHM_ID,
      tiempo_supabase: input.tiempoSupabase,
      tiempo_twilio_api: Math.max(0, Math.round(input.tiempoTwilioApi)),
      twilio_calls: input.twilioCalls?.length ? input.twilioCalls : null,
      training: input.training === true,
    } as never);
    if (error) {
      console.error("[metricas-latencia] insert failed:", error.message);
    }
  } catch (e) {
    console.error("[metricas-latencia] insert error:", e);
  }
}
