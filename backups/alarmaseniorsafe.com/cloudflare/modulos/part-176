import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { n as normalizePhoneE164 } from "./phone-utils-D7EH6fht.mjs";
const MAX_GUARDIANS = 3;
const EXTENDED_SELECT = "id, nombre, telefono, whatsapp, parentesco, recibe_sms, recibe_whatsapp, recibe_llamada, activo, prioridad, created_at";
function storageContactToRow(contact) {
  return {
    id: contact.id,
    nombre: contact.nombre,
    telefono: contact.telefono,
    whatsapp: null,
    parentesco: contact.parentesco,
    recibe_sms: true,
    recibe_whatsapp: true,
    recibe_llamada: true
  };
}
async function syncContactsToEmergencyDb(signupId, contacts) {
  try {
    if (contacts.length === 0) {
      await supabaseAdmin.from("emergency_contacts").delete().eq("contract_signup_id", signupId);
      return;
    }
    const { data: existing } = await supabaseAdmin.from("emergency_contacts").select("id").eq("contract_signup_id", signupId);
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
      recibe_llamada: true
    }));
    await supabaseAdmin.from("emergency_contacts").upsert(rows, { onConflict: "id" });
  } catch (e) {
    console.error("[syncContactsToEmergencyDb]", e);
  }
}
async function loadEmergencyContactRows(signupId) {
  const extended = await supabaseAdmin.from("emergency_contacts").select(EXTENDED_SELECT).eq("contract_signup_id", signupId).eq("activo", true).order("prioridad", { ascending: true }).order("created_at", { ascending: true });
  if (!extended.error && (extended.data?.length ?? 0) > 0) {
    return (extended.data ?? []).map((row) => ({
      id: String(row.id),
      nombre: String(row.nombre ?? ""),
      telefono: String(row.telefono ?? ""),
      whatsapp: row.whatsapp == null ? null : String(row.whatsapp),
      parentesco: String(row.parentesco ?? ""),
      recibe_sms: row.recibe_sms !== false,
      recibe_whatsapp: row.recibe_whatsapp !== false,
      recibe_llamada: row.recibe_llamada !== false
    }));
  }
  const fromStorage = await listFamilyContacts(signupId);
  if (fromStorage.length === 0) {
    return [];
  }
  await syncContactsToEmergencyDb(signupId, fromStorage);
  return fromStorage.map(storageContactToRow);
}
const DATA_BUCKET = "seniorsafe-pins";
function isMissingTableError(message) {
  return message.includes("Could not find the table") || message.includes("schema cache") || message.includes("does not exist") || message.includes("42P01");
}
function contactsPath(signupId) {
  return `contacts/${signupId}.json`;
}
function newContactId() {
  return crypto.randomUUID();
}
async function readContactsFromStorage(signupId) {
  const { data, error } = await supabaseAdmin.storage.from(DATA_BUCKET).download(contactsPath(signupId));
  if (error) return null;
  try {
    const parsed = JSON.parse(await data.text());
    return Array.isArray(parsed.contacts) ? parsed.contacts : [];
  } catch {
    return null;
  }
}
async function writeContactsToStorage(signupId, contacts) {
  const payload = JSON.stringify({
    contacts,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  const { error } = await supabaseAdmin.storage.from(DATA_BUCKET).upload(contactsPath(signupId), payload, {
    upsert: true,
    contentType: "application/json"
  });
  if (error) {
    console.error("[writeContactsToStorage]", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
async function readContactsFromDb(signupId) {
  const { data: rows, error } = await supabaseAdmin.from("emergency_contacts").select("id,nombre,telefono,parentesco,created_at").eq("contract_signup_id", signupId).order("created_at", { ascending: true });
  if (error) {
    if (!isMissingTableError(error.message ?? "")) {
      console.error("[readContactsFromDb]", error.message);
    }
    return [];
  }
  return rows ?? [];
}
async function listFamilyContacts(signupId) {
  const fromDb = await readContactsFromDb(signupId);
  if (fromDb.length > 0) return fromDb;
  const fromStorage = await readContactsFromStorage(signupId);
  if (fromStorage !== null && fromStorage.length > 0) {
    await syncContactsToEmergencyDb(signupId, fromStorage);
    return fromStorage;
  }
  return fromDb;
}
async function loadMutableContacts(signupId) {
  return listFamilyContacts(signupId);
}
async function persistContacts(signupId, contacts) {
  if (contacts.length === 0) {
    const { error } = await supabaseAdmin.from("emergency_contacts").delete().eq("contract_signup_id", signupId);
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
      recibe_llamada: true
    }));
    const { error } = await supabaseAdmin.from("emergency_contacts").upsert(rows, { onConflict: "id" });
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
function normalizeContactInput(input) {
  const rawTel = input.telefono.trim();
  return {
    nombre: input.nombre.trim(),
    telefono: normalizePhoneE164(rawTel) || rawTel,
    parentesco: input.parentesco.trim()
  };
}
async function addFamilyContact(signupId, raw) {
  const contact = normalizeContactInput(raw);
  const existing = await loadMutableContacts(signupId);
  if (existing.length >= MAX_GUARDIANS) {
    return { ok: false, error: `Máximo ${MAX_GUARDIANS} guardianes.` };
  }
  if (existing.some((c) => c.telefono === contact.telefono)) {
    return { ok: false, error: "Ya existe un familiar con ese teléfono." };
  }
  const row = {
    id: newContactId(),
    ...contact,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const saved = await persistContacts(signupId, [...existing, row]);
  if (!saved.ok) return { ok: false, error: saved.error ?? "save_failed" };
  return { ok: true, contact: row };
}
async function updateFamilyContact(signupId, id, raw) {
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
async function deleteFamilyContact(signupId, id) {
  const existing = await loadMutableContacts(signupId);
  const next = existing.filter((c) => c.id !== id);
  if (next.length === existing.length) return { ok: false, error: "Familiar no encontrado." };
  const saved = await persistContacts(signupId, next);
  if (!saved.ok) return { ok: false, error: saved.error ?? "save_failed" };
  return { ok: true, contacts: next };
}
export {
  MAX_GUARDIANS as M,
  addFamilyContact as a,
  loadEmergencyContactRows as b,
  deleteFamilyContact as d,
  listFamilyContacts as l,
  updateFamilyContact as u
};
