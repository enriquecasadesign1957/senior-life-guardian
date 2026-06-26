import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizePhoneE164 } from "@/lib/phone-utils";
import { MAX_GUARDIANS } from "@/lib/guardian-limits";
import { syncContactsToEmergencyDb } from "@/lib/emergency-recipients";

const DATA_BUCKET = "seniorsafe-pins";

export type FamilyContact = {
  id: string;
  nombre: string;
  telefono: string;
  parentesco: string;
  created_at: string;
};

export type FamilyContactInput = {
  nombre: string;
  telefono: string;
  parentesco: string;
};

export type FamilyMutationResult =
  | { ok: true; contact?: FamilyContact; contacts?: FamilyContact[] }
  | { ok: false; error: string };

function isMissingTableError(message: string): boolean {
  return (
    message.includes("Could not find the table") ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("42P01")
  );
}

function contactsPath(signupId: string): string {
  return `contacts/${signupId}.json`;
}

function newContactId(): string {
  return crypto.randomUUID();
}

async function readContactsFromStorage(signupId: string): Promise<FamilyContact[] | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(DATA_BUCKET)
    .download(contactsPath(signupId));

  if (error) return null;

  try {
    const parsed = JSON.parse(await data.text()) as { contacts?: FamilyContact[] };
    return Array.isArray(parsed.contacts) ? parsed.contacts : [];
  } catch {
    return null;
  }
}

async function writeContactsToStorage(
  signupId: string,
  contacts: FamilyContact[],
): Promise<{ ok: boolean; error?: string }> {
  const payload = JSON.stringify({
    contacts,
    updated_at: new Date().toISOString(),
  });

  const { error } = await supabaseAdmin.storage
    .from(DATA_BUCKET)
    .upload(contactsPath(signupId), payload, {
      upsert: true,
      contentType: "application/json",
    });

  if (error) {
    console.error("[writeContactsToStorage]", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

async function readContactsFromDb(signupId: string): Promise<FamilyContact[]> {
  const { data: rows, error } = await supabaseAdmin
    .from("emergency_contacts")
    .select("id,nombre,telefono,parentesco,created_at")
    .eq("contract_signup_id", signupId)
    .order("created_at", { ascending: true });

  if (error) {
    if (!isMissingTableError(error.message ?? "")) {
      console.error("[readContactsFromDb]", error.message);
    }
    return [];
  }

  return (rows ?? []) as FamilyContact[];
}

/** Carga contactos (SQL primario; migra legacy desde storage si hace falta). */
export async function listFamilyContacts(signupId: string): Promise<FamilyContact[]> {
  const fromDb = await readContactsFromDb(signupId);
  if (fromDb.length > 0) return fromDb;

  const fromStorage = await readContactsFromStorage(signupId);
  if (fromStorage !== null && fromStorage.length > 0) {
    await syncContactsToEmergencyDb(signupId, fromStorage);
    return fromStorage;
  }

  return fromDb;
}

async function loadMutableContacts(signupId: string): Promise<FamilyContact[]> {
  return listFamilyContacts(signupId);
}

async function persistContacts(
  signupId: string,
  contacts: FamilyContact[],
): Promise<{ ok: boolean; error?: string; method?: string }> {
  if (contacts.length === 0) {
    const { error } = await supabaseAdmin
      .from("emergency_contacts")
      .delete()
      .eq("contract_signup_id", signupId);
    if (error && !isMissingTableError(error.message ?? "")) {
      return { ok: false, error: error.message };
    }
  } else {
    const rows = contacts.map((c, index) => ({
      id: c.id,
      contract_signup_id: signupId,
      nombre: c.nombre,
      telefono: c.telefono,
      parentesco: c.parentesco,
      created_at: c.created_at,
      whatsapp: null,
      prioridad: index + 1,
      activo: true,
      tipo_contacto: "familiar",
      recibe_sms: true,
      recibe_whatsapp: true,
      recibe_llamada: true,
    }));

    const { error } = await supabaseAdmin
      .from("emergency_contacts")
      .upsert(rows, { onConflict: "id" });

    if (error && !isMissingTableError(error.message ?? "")) {
      return { ok: false, error: error.message };
    }
  }

  const storageResult = await writeContactsToStorage(signupId, contacts);
  if (storageResult.ok) return { ok: true, method: "emergency_contacts" };

  if (contacts.length === 0) {
    return { ok: true, method: "emergency_contacts" };
  }

  return { ok: false, error: storageResult.error ?? "save_failed" };
}

function normalizeContactInput(input: FamilyContactInput): FamilyContactInput {
  const rawTel = input.telefono.trim();
  return {
    nombre: input.nombre.trim(),
    telefono: normalizePhoneE164(rawTel) || rawTel,
    parentesco: input.parentesco.trim(),
  };
}

/** Agrega un familiar (máx. 3, sin teléfonos duplicados). */
export async function addFamilyContact(
  signupId: string,
  raw: FamilyContactInput,
): Promise<FamilyMutationResult> {
  const contact = normalizeContactInput(raw);
  const existing = await loadMutableContacts(signupId);

  if (existing.length >= MAX_GUARDIANS) {
    return { ok: false, error: `Máximo ${MAX_GUARDIANS} guardianes.` };
  }
  if (existing.some((c) => c.telefono === contact.telefono)) {
    return { ok: false, error: "Ya existe un familiar con ese teléfono." };
  }

  const row: FamilyContact = {
    id: newContactId(),
    ...contact,
    created_at: new Date().toISOString(),
  };

  const saved = await persistContacts(signupId, [...existing, row]);
  if (!saved.ok) return { ok: false, error: saved.error ?? "save_failed" };
  return { ok: true, contact: row };
}

/** Actualiza un familiar existente. */
export async function updateFamilyContact(
  signupId: string,
  id: string,
  raw: FamilyContactInput,
): Promise<FamilyMutationResult> {
  const contact = normalizeContactInput(raw);
  const existing = await loadMutableContacts(signupId);
  const index = existing.findIndex((c) => c.id === id);
  if (index < 0) return { ok: false, error: "Familiar no encontrado." };

  if (existing.some((c) => c.id !== id && c.telefono === contact.telefono)) {
    return { ok: false, error: "Ya existe un familiar con ese teléfono." };
  }

  const updated = [...existing];
  updated[index] = { ...updated[index], ...contact };

  const saved = await persistContacts(signupId, updated);
  if (!saved.ok) return { ok: false, error: saved.error ?? "save_failed" };
  return { ok: true, contact: updated[index] };
}

/** Elimina un familiar. */
export async function deleteFamilyContact(
  signupId: string,
  id: string,
): Promise<FamilyMutationResult> {
  const existing = await loadMutableContacts(signupId);
  const next = existing.filter((c) => c.id !== id);
  if (next.length === existing.length) return { ok: false, error: "Familiar no encontrado." };

  const saved = await persistContacts(signupId, next);
  if (!saved.ok) return { ok: false, error: saved.error ?? "save_failed" };
  return { ok: true, contacts: next };
}
