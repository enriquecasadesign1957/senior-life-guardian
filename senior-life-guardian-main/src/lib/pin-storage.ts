import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PIN_BUCKET = "seniorsafe-pins";

export type SavePinResult = { ok: boolean; error?: string; method?: string };

function isMissingTableError(message: string): boolean {
  return (
    message.includes("Could not find the table") ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("42P01")
  );
}

function isMissingColumnError(message: string): boolean {
  return message.includes("pin_hash") && message.includes("column");
}

function pinObjectPath(signupId: string): string {
  return `pins/${signupId}.json`;
}

async function readPinFromStorage(signupId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(PIN_BUCKET)
    .download(pinObjectPath(signupId));

  if (error || !data) return null;

  try {
    const parsed = JSON.parse(await data.text()) as { pin_hash?: string };
    return typeof parsed.pin_hash === "string" ? parsed.pin_hash : null;
  } catch {
    return null;
  }
}

async function savePinToStorage(signupId: string, pinHash: string): Promise<SavePinResult> {
  const payload = JSON.stringify({
    pin_hash: pinHash,
    updated_at: new Date().toISOString(),
  });

  const { error } = await supabaseAdmin.storage
    .from(PIN_BUCKET)
    .upload(pinObjectPath(signupId), payload, {
      upsert: true,
      contentType: "application/json",
    });

  if (error) {
    console.error("[persistUserPin] storage:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, method: "storage" };
}

/** Lee el hash del PIN guardado (storage → user_pins → contract_signups → alert_logs). */
export async function readStoredPinHash(signupId: string): Promise<string | null> {
  const fromStorage = await readPinFromStorage(signupId);
  if (fromStorage) return fromStorage;

  const { data: pinRow, error: pinError } = await supabaseAdmin
    .from("user_pins")
    .select("pin_hash")
    .eq("contract_signup_id", signupId)
    .maybeSingle();

  if (!pinError && pinRow?.pin_hash) return pinRow.pin_hash as string;
  if (pinError && !isMissingTableError(pinError.message ?? "")) {
    console.error("[readStoredPinHash] user_pins:", pinError.message);
  }

  const { data: signupRow, error: signupError } = await supabaseAdmin
    .from("contract_signups")
    .select("pin_hash")
    .eq("id", signupId)
    .maybeSingle();

  if (!signupError && signupRow?.pin_hash) return signupRow.pin_hash as string;
  if (signupError && !isMissingColumnError(signupError.message ?? "")) {
    console.error("[readStoredPinHash] contract_signups.pin_hash:", signupError.message);
  }

  try {
    const { data: logRow, error: logError } = await supabaseAdmin
      .from("alert_logs")
      .select("metadata")
      .eq("contract_signup_id", signupId)
      .eq("event_type", "pin_configured")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!logError) {
      const meta = logRow?.metadata as { pin_hash?: string } | null;
      if (meta?.pin_hash) return meta.pin_hash;
    }
  } catch {
    /* alert_logs opcional */
  }

  return null;
}

/** Guarda el hash del PIN (bucket privado seniorsafe-pins o tablas SQL cuando existan). */
export async function persistUserPin(signupId: string, pinHash: string): Promise<SavePinResult> {
  const storageResult = await savePinToStorage(signupId, pinHash);
  if (storageResult.ok) return storageResult;

  const updatedAt = new Date().toISOString();

  const modern = await supabaseAdmin
    .from("user_pins")
    .upsert(
      { contract_signup_id: signupId, pin_hash: pinHash, updated_at: updatedAt },
      { onConflict: "contract_signup_id" },
    );

  if (!modern.error) return { ok: true, method: "user_pins" };

  const modernMsg = modern.error.message ?? "";
  console.error("[persistUserPin] user_pins:", modernMsg);

  if (!isMissingTableError(modernMsg)) {
    const legacy = await supabaseAdmin
      .from("user_pins")
      .upsert(
        { trial_signup_id: signupId, pin_hash: pinHash, updated_at: updatedAt },
        { onConflict: "trial_signup_id" },
      );
    if (!legacy.error) return { ok: true, method: "user_pins_legacy" };
    console.error("[persistUserPin] trial_signup_id:", legacy.error.message);
  }

  const onSignup = await supabaseAdmin
    .from("contract_signups")
    .update({ pin_hash: pinHash, updated_at: updatedAt })
    .eq("id", signupId);

  if (!onSignup.error) return { ok: true, method: "contract_signups.pin_hash" };

  const signupMsg = onSignup.error.message ?? "";
  if (!isMissingColumnError(signupMsg)) {
    console.error("[persistUserPin] contract_signups:", signupMsg);
  }

  try {
    const viaLog = await supabaseAdmin.from("alert_logs").insert({
      contract_signup_id: signupId,
      event_type: "pin_configured",
      status: "stored",
      metadata: { pin_hash: pinHash },
    });
    if (!viaLog.error) return { ok: true, method: "alert_logs" };
    console.error("[persistUserPin] alert_logs:", viaLog.error.message);
  } catch (e) {
    console.error("[persistUserPin] alert_logs unexpected:", e);
  }

  return storageResult;
}
