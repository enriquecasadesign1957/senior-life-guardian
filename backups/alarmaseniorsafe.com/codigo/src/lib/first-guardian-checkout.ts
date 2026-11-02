import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { addFamilyContact, listFamilyContacts, type FamilyContactInput } from "@/lib/contacts-storage";
import { sendGuardianInvite } from "@/lib/guardians.functions";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";

const DATA_BUCKET = "seniorsafe-pins";

export type PendingFirstGuardian = FamilyContactInput;

type PendingPayload = {
  nombre: string;
  telefono: string;
  parentesco: string;
  saved_at: string;
};

function pendingPath(signupId: string): string {
  return `pending-first-guardian/${signupId}.json`;
}

function isMissingColumnError(message: string): boolean {
  return (
    message.includes("pending_first_guardian") ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("42703")
  );
}

function normalizePending(guardian: PendingFirstGuardian): PendingPayload {
  return {
    nombre: guardian.nombre.trim(),
    telefono: guardian.telefono.trim(),
    parentesco: guardian.parentesco.trim(),
    saved_at: new Date().toISOString(),
  };
}

function parsePendingPayload(raw: unknown): PendingFirstGuardian | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const nombre = String(row.nombre ?? "").trim();
  const telefono = String(row.telefono ?? "").trim();
  const parentesco = String(row.parentesco ?? "").trim();
  if (!nombre || !telefono || !parentesco) return null;
  return { nombre, telefono, parentesco };
}

export async function savePendingFirstGuardian(
  signupId: string,
  guardian: PendingFirstGuardian,
): Promise<void> {
  const payload = normalizePending(guardian);

  const { error: sqlError } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .update({ pending_first_guardian: payload })
    .eq("id", signupId);

  if (sqlError && !isMissingColumnError(sqlError.message ?? "")) {
    console.error("[savePendingFirstGuardian] sql:", sqlError.message);
    throw new Error("No pudimos guardar al primer guardián.");
  }

  const { error: storageError } = await supabaseAdmin.storage
    .from(DATA_BUCKET)
    .upload(pendingPath(signupId), JSON.stringify(payload), {
      upsert: true,
      contentType: "application/json",
    });

  if (storageError) {
    console.error("[savePendingFirstGuardian] storage:", storageError.message);
    if (sqlError) {
      throw new Error("No pudimos guardar al primer guardián.");
    }
  }
}

async function readPendingFirstGuardian(signupId: string): Promise<PendingFirstGuardian | null> {
  const { data: signup, error: sqlError } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("pending_first_guardian")
    .eq("id", signupId)
    .maybeSingle();

  if (!sqlError) {
    const fromSql = parsePendingPayload(signup?.pending_first_guardian);
    if (fromSql) return fromSql;
  } else if (!isMissingColumnError(sqlError.message ?? "")) {
    console.error("[readPendingFirstGuardian] sql:", sqlError.message);
  }

  const { data, error } = await supabaseAdmin.storage
    .from(DATA_BUCKET)
    .download(pendingPath(signupId));

  if (error) return null;

  try {
    return parsePendingPayload(JSON.parse(await data.text()));
  } catch {
    return null;
  }
}

async function deletePendingFirstGuardian(signupId: string): Promise<void> {
  await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .update({ pending_first_guardian: null })
    .eq("id", signupId);

  await supabaseAdmin.storage.from(DATA_BUCKET).remove([pendingPath(signupId)]);
}

/** Tras pago confirmado: crea el 1.er guardián del checkout e invita al Portal Familia. */
export async function createFirstGuardianAfterPayment(
  signupId: string,
): Promise<{ ok: boolean; created?: boolean; skipped?: string }> {
  const existing = await listFamilyContacts(signupId);
  if (existing.length > 0) {
    await deletePendingFirstGuardian(signupId).catch(() => {});
    return { ok: true, skipped: "already_has_guardians" };
  }

  const pending = await readPendingFirstGuardian(signupId);
  if (!pending) {
    console.warn("[createFirstGuardianAfterPayment] no pending guardian for", signupId);
    return { ok: false, skipped: "no_pending_guardian" };
  }

  const { data: signup } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("nombre")
    .eq("id", signupId)
    .maybeSingle();

  const result = await addFamilyContact(signupId, pending);
  if (!result.ok || !result.contact) {
    console.error("[createFirstGuardianAfterPayment]", result.error, { signupId, pending });
    return { ok: false, skipped: result.error ?? "add_failed" };
  }

  try {
    await sendGuardianInvite({
      guardianTel: result.contact.telefono,
      guardianWa: result.contact.telefono,
      guardianName: result.contact.nombre,
      seniorName: signup?.nombre?.trim() || "su familiar",
      parentesco: result.contact.parentesco,
      signupId,
      guardianId: result.contact.id,
    });
  } catch (e) {
    console.error("[createFirstGuardianAfterPayment] invite", e);
  }

  await deletePendingFirstGuardian(signupId).catch(() => {});
  return { ok: true, created: true };
}

/** Idempotente: asegura guardián del checkout tras pago (incluye reintentos / alreadyActive). */
export async function ensureFirstGuardianAfterPayment(signupId: string): Promise<void> {
  const result = await createFirstGuardianAfterPayment(signupId);
  if (!result.ok && result.skipped !== "no_pending_guardian") {
    throw new Error(result.skipped ?? "first_guardian_failed");
  }
}
