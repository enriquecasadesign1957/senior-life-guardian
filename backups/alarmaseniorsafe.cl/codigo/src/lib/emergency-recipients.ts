import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { listFamilyContacts, type FamilyContact } from "@/lib/contacts-storage";

export type EmergencyContactRow = {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp: string | null;
  parentesco: string;
  recibe_sms: boolean;
  recibe_whatsapp: boolean;
  recibe_llamada: boolean;
};

const EXTENDED_SELECT =
  "id, nombre, telefono, whatsapp, parentesco, recibe_sms, recibe_whatsapp, recibe_llamada, activo, prioridad, created_at";

function storageContactToRow(contact: FamilyContact): EmergencyContactRow {
  return {
    id: contact.id,
    nombre: contact.nombre,
    telefono: contact.telefono,
    whatsapp: null,
    parentesco: contact.parentesco,
    recibe_sms: true,
    recibe_whatsapp: true,
    recibe_llamada: true,
  };
}

/** Sincroniza contactos del storage JSON → tabla emergency_contacts (alertas Twilio). */
export async function syncContactsToEmergencyDb(
  signupId: string,
  contacts: FamilyContact[],
): Promise<void> {
  try {
    if (contacts.length === 0) {
      await supabaseAdmin.from("emergency_contacts").delete().eq("contract_signup_id", signupId);
      return;
    }

    const { data: existing } = await supabaseAdmin
      .from("emergency_contacts")
      .select("id")
      .eq("contract_signup_id", signupId);

    const keepIds = new Set(contacts.map((c) => c.id));
    const deleteIds = (existing ?? []).filter((row) => !keepIds.has(row.id)).map((row) => row.id);
    if (deleteIds.length > 0) {
      await supabaseAdmin.from("emergency_contacts").delete().in("id", deleteIds);
    }

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

    await supabaseAdmin.from("emergency_contacts").upsert(rows, { onConflict: "id" });
  } catch (e) {
    console.error("[syncContactsToEmergencyDb]", e);
  }
}

/**
 * Carga guardianes activos para alertas.
 * La app guarda contactos en storage JSON; las alertas usan emergency_contacts.
 * Si la tabla está vacía, sincroniza desde storage y devuelve esos contactos.
 */
export async function loadEmergencyContactRows(signupId: string): Promise<EmergencyContactRow[]> {
  const extended = await supabaseAdmin
    .from("emergency_contacts")
    .select(EXTENDED_SELECT)
    .eq("contract_signup_id", signupId)
    .eq("activo", true)
    .order("prioridad", { ascending: true })
    .order("created_at", { ascending: true });

  if (!extended.error && (extended.data?.length ?? 0) > 0) {
    return (extended.data ?? []).map((row) => ({
      id: String(row.id),
      nombre: String(row.nombre ?? ""),
      telefono: String(row.telefono ?? ""),
      whatsapp: row.whatsapp == null ? null : String(row.whatsapp),
      parentesco: String(row.parentesco ?? ""),
      recibe_sms: row.recibe_sms !== false,
      recibe_whatsapp: row.recibe_whatsapp !== false,
      recibe_llamada: row.recibe_llamada !== false,
    }));
  }

  const fromStorage = await listFamilyContacts(signupId);
  if (fromStorage.length === 0) {
    return [];
  }

  await syncContactsToEmergencyDb(signupId, fromStorage);
  return fromStorage.map(storageContactToRow);
}
