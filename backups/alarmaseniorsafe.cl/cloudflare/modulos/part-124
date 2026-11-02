import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
function pickField(patchValue, existingValue) {
  return patchValue !== void 0 ? patchValue : existingValue ?? null;
}
async function syncDeviceStatus(patch) {
  const now = patch.last_seen_at ?? (/* @__PURE__ */ new Date()).toISOString();
  const { data: existing } = await supabaseAdmin.from("device_status").select("battery_level, gps_enabled, internet_connected, app_version, last_lat, last_lng").eq("contract_signup_id", patch.contractSignupId).maybeSingle();
  const prev = existing ?? null;
  const merged = {
    contract_signup_id: patch.contractSignupId,
    last_seen_at: now,
    battery_level: pickField(patch.battery_level, prev?.battery_level),
    gps_enabled: pickField(patch.gps_enabled, prev?.gps_enabled),
    internet_connected: pickField(patch.internet_connected, prev?.internet_connected),
    app_version: pickField(patch.app_version, prev?.app_version),
    last_lat: pickField(patch.last_lat, prev?.last_lat),
    last_lng: pickField(patch.last_lng, prev?.last_lng),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const { error } = await supabaseAdmin.from("device_status").upsert(merged, { onConflict: "contract_signup_id" });
  if (error) {
    console.error("[device_status] sync failed:", error.message);
    throw error;
  }
  return { ok: true, at: now };
}
export {
  syncDeviceStatus as s
};
