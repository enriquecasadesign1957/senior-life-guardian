import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Alerta creada en app; aún no se envía SMS/WhatsApp/llamada. */
export const ALERT_STATUS_ARMED = "armed";
/** Usuario pulsó «Cancelar — estoy bien». */
export const ALERT_STATUS_CANCELLED = "cancelled_by_senior";
/** Cascada en curso. */
export const ALERT_STATUS_DISPATCHING = "dispatching";

/** Segundos de espera antes del primer SMS/WhatsApp Twilio; cancelable con «Estoy bien». */
export const EMERGENCY_ARM_GRACE_MS = 3_000;

type AlertCancelRow = {
  status: string | null;
  metadata: Record<string, unknown> | null;
};

export function isAlertCancelledFromRow(row: AlertCancelRow | null | undefined): boolean {
  if (!row) return false;
  if (row.status === ALERT_STATUS_CANCELLED) return true;
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return typeof meta.cancelled_at === "string" && meta.cancelled_at.length > 0;
}

export async function isAlertCancelled(alertId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("alert_logs")
    .select("status, metadata")
    .eq("id", alertId)
    .maybeSingle();
  return isAlertCancelledFromRow(data as AlertCancelRow | null);
}

export async function markEmergencyAlertCancelled(
  signupId: string,
  alertId: string,
): Promise<{ ok: true; already: boolean } | { ok: false; error: string }> {
  const { data: row, error } = await supabaseAdmin
    .from("alert_logs")
    .select("id, contract_signup_id, status, metadata")
    .eq("id", alertId)
    .maybeSingle();

  if (error || !row) return { ok: false, error: "not_found" };
  if (row.contract_signup_id !== signupId) return { ok: false, error: "forbidden" };

  if (isAlertCancelledFromRow(row as AlertCancelRow)) {
    return { ok: true, already: true };
  }

  const now = new Date().toISOString();
  const meta = {
    ...((row.metadata ?? {}) as Record<string, unknown>),
    cancelled_at: now,
    cancelled_by: "senior",
    cancel_reason: "estoy_bien",
  };

  const { error: updateErr } = await supabaseAdmin
    .from("alert_logs")
    .update({
      status: ALERT_STATUS_CANCELLED,
      metadata: meta,
      error_message: null,
    } as never)
    .eq("id", alertId);

  if (updateErr) return { ok: false, error: "update_failed" };
  return { ok: true, already: false };
}

const CANCELLABLE_STATUSES = new Set([
  "pending",
  ALERT_STATUS_ARMED,
  ALERT_STATUS_DISPATCHING,
  "partial",
]);

/** Alerta SOS reciente del senior que aún puede cancelarse (sin alertId en el cliente). */
export async function findLatestCancellableAlertId(signupId: string): Promise<string | null> {
  const since = new Date(Date.now() - 3 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("alert_logs")
    .select("id, status, metadata, created_at")
    .eq("contract_signup_id", signupId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error || !data?.length) return null;

  for (const row of data) {
    if (isAlertCancelledFromRow(row as AlertCancelRow)) continue;
    const status = row.status ?? "";
    if (CANCELLABLE_STATUSES.has(status)) return row.id;
  }
  return null;
}

export async function cancelEmergencyAlertForSignup(
  signupId: string,
  alertId?: string,
): Promise<{ ok: true; already: boolean; alertId: string } | { ok: false; error: string }> {
  const resolvedId = alertId ?? (await findLatestCancellableAlertId(signupId));
  if (!resolvedId) return { ok: false, error: "not_found" };
  const result = await markEmergencyAlertCancelled(signupId, resolvedId);
  if (!result.ok) return result;
  return { ok: true, already: result.already, alertId: resolvedId };
}
