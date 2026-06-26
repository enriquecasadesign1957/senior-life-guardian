import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type DeviceStatusPatch = {
  contractSignupId: string;
  last_seen_at?: string;
  /** undefined = conservar valor anterior */
  battery_level?: number | null;
  gps_enabled?: boolean | null;
  internet_connected?: boolean | null;
  app_version?: string | null;
  last_lat?: number | null;
  last_lng?: number | null;
};

type DeviceStatusRow = {
  battery_level: number | null;
  gps_enabled: boolean | null;
  internet_connected: boolean | null;
  app_version: string | null;
  last_lat: number | null;
  last_lng: number | null;
};

function pickField<T>(
  patchValue: T | undefined,
  existingValue: T | null | undefined,
): T | null {
  return patchValue !== undefined ? patchValue : (existingValue ?? null);
}

/** Una fila por adulto mayor. Solo actualiza campos enviados (no borra batería/internet al sincronizar GPS). */
export async function syncDeviceStatus(patch: DeviceStatusPatch) {
  const now = patch.last_seen_at ?? new Date().toISOString();

  const { data: existing } = await supabaseAdmin
    .from("device_status")
    .select("battery_level, gps_enabled, internet_connected, app_version, last_lat, last_lng")
    .eq("contract_signup_id", patch.contractSignupId)
    .maybeSingle();

  const prev = (existing ?? null) as DeviceStatusRow | null;

  const merged = {
    contract_signup_id: patch.contractSignupId,
    last_seen_at: now,
    battery_level: pickField(patch.battery_level, prev?.battery_level),
    gps_enabled: pickField(patch.gps_enabled, prev?.gps_enabled),
    internet_connected: pickField(patch.internet_connected, prev?.internet_connected),
    app_version: pickField(patch.app_version, prev?.app_version),
    last_lat: pickField(patch.last_lat, prev?.last_lat),
    last_lng: pickField(patch.last_lng, prev?.last_lng),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("device_status")
    .upsert(merged, { onConflict: "contract_signup_id" });

  if (error) {
    console.error("[device_status] sync failed:", error.message);
    throw error;
  }
  return { ok: true as const, at: now };
}
