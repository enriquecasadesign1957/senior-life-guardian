import { createServerFn } from "@tanstack/react-start";
import { MAX_GUARDIANS } from "@/lib/guardian-limits";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  addFamilyContact,
  deleteFamilyContact,
  listFamilyContacts,
  updateFamilyContact,
} from "@/lib/contacts-storage";
import { normalizePhoneE164 } from "@/lib/phone-utils";
import { sendTwilioWhatsAppWithSmsFallback } from "@/lib/twilio";
import { assertSeniorAccess, assertFamilySession, seniorAccessTokenSchema } from "@/lib/senior-access-auth";

const idSchema = z.string().uuid();
const seniorAuthFields = {
  signupId: idSchema,
  accessToken: seniorAccessTokenSchema,
};

const familySessionFields = {
  family_member_id: idSchema,
  contract_signup_id: idSchema,
  session_token: seniorAccessTokenSchema,
};

async function assertActiveFamilyGuardianAccess(data: {
  family_member_id: string;
  contract_signup_id: string;
  session_token: string;
}): Promise<string> {
  await assertFamilySession(data.family_member_id, data.contract_signup_id, data.session_token);
  const { data: member } = await supabaseAdmin
    .from("family_members")
    .select("activo")
    .eq("id", data.family_member_id)
    .maybeSingle();
  if (!member?.activo) {
    throw new Error("Sesión inválida. Ingresa de nuevo al Portal Familia.");
  }
  return data.contract_signup_id;
}

const PORTAL_FAMILIA_URL = "https://alarmaseniorsafe.cl/familia";

export async function sendGuardianInvite(opts: {
  guardianTel: string;
  guardianWa: string | null;
  guardianName: string;
  seniorName: string;
  parentesco: string;
  signupId: string;
  guardianId: string;
}) {
  const body =
    `Hola ${opts.guardianName}, ${opts.seniorName} te ha designado como su guardián en Senior Safe ` +
    `(como ${opts.parentesco}). Recibirás alertas de emergencia y podrás ver su estado en el Portal Familia: ` +
    `${PORTAL_FAMILIA_URL} — Ingresa con este número de teléfono para recibir tu código de acceso.`;

  const waNumber = opts.guardianWa || opts.guardianTel;
  const { whatsappOk: okWA, smsOk: okSMS } = await sendTwilioWhatsAppWithSmsFallback(
    opts.guardianTel,
    body,
    waNumber,
  );

  try {
    await supabaseAdmin.from("family_access_log").insert({
      family_member_id: null,
      contract_signup_id: opts.signupId,
      action: "guardian_invite_sent",
      metadata: {
        guardian_contact_id: opts.guardianId,
        telefono: opts.guardianTel,
        whatsapp_ok: okWA,
        sms_ok: okSMS,
        portal_url: PORTAL_FAMILIA_URL,
      } as never,
    });
  } catch {
    /* silencioso */
  }
}

const GUARDIAN_EXTENDED_SELECT =
  "id,nombre,telefono,whatsapp,parentesco,prioridad,activo,tipo_contacto,recibe_sms,recibe_whatsapp,recibe_llamada,created_at";
const GUARDIAN_BASIC_SELECT = "id,nombre,telefono,parentesco,created_at";

function isMissingColumnError(message: string): boolean {
  return /column .* does not exist|Could not find the .* column/i.test(message);
}

function isMissingTableError(message: string): boolean {
  return (
    message.includes("Could not find the table") ||
    message.includes("schema cache") ||
    message.includes("PGRST205") ||
    message.includes("42P01")
  );
}

function familyContactToGuardian(contact: {
  id: string;
  nombre: string;
  telefono: string;
  parentesco: string;
  created_at: string;
}) {
  return normalizeGuardianRow({
    ...contact,
    whatsapp: null,
    prioridad: 1,
    activo: true,
    tipo_contacto: "familiar",
    recibe_sms: true,
    recibe_whatsapp: true,
    recibe_llamada: true,
  });
}

function normalizeGuardianRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    nombre: String(row.nombre ?? ""),
    telefono: String(row.telefono ?? ""),
    whatsapp: row.whatsapp == null ? null : String(row.whatsapp),
    parentesco: String(row.parentesco ?? ""),
    prioridad: typeof row.prioridad === "number" ? row.prioridad : 1,
    activo: typeof row.activo === "boolean" ? row.activo : true,
    tipo_contacto: String(row.tipo_contacto ?? "familiar"),
    recibe_sms: typeof row.recibe_sms === "boolean" ? row.recibe_sms : true,
    recibe_whatsapp: typeof row.recibe_whatsapp === "boolean" ? row.recibe_whatsapp : true,
    recibe_llamada: typeof row.recibe_llamada === "boolean" ? row.recibe_llamada : true,
    created_at: String(row.created_at ?? ""),
  };
}

async function fetchGuardiansForSignup(signupId: string) {
  const extended = await supabaseAdmin
    .from("emergency_contacts")
    .select(GUARDIAN_EXTENDED_SELECT)
    .eq("contract_signup_id", signupId)
    .order("prioridad", { ascending: true })
    .order("created_at", { ascending: true });

  if (!extended.error) {
    return (extended.data ?? []).map((row) => normalizeGuardianRow(row as Record<string, unknown>));
  }

  const errMsg = extended.error.message ?? "";
  if (isMissingTableError(errMsg)) {
    const contacts = await listFamilyContacts(signupId);
    return contacts.map(familyContactToGuardian);
  }

  if (!isMissingColumnError(errMsg)) {
    throw extended.error;
  }

  const basic = await supabaseAdmin
    .from("emergency_contacts")
    .select(GUARDIAN_BASIC_SELECT)
    .eq("contract_signup_id", signupId)
    .order("created_at", { ascending: true });

  if (basic.error) {
    if (isMissingTableError(basic.error.message ?? "")) {
      const contacts = await listFamilyContacts(signupId);
      return contacts.map(familyContactToGuardian);
    }
    throw basic.error;
  }
  return (basic.data ?? []).map((row) => normalizeGuardianRow(row as Record<string, unknown>));
}

const guardianInput = z.object({
  nombre: z.string().trim().min(1).max(160),
  telefono: z.string().trim().min(4).max(40),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  parentesco: z.string().trim().min(1).max(60),
  prioridad: z.number().int().min(1).max(10).default(1),
  activo: z.boolean().default(true),
  tipo_contacto: z.string().trim().max(40).default("familiar"),
  recibe_sms: z.boolean().default(true),
  recibe_whatsapp: z.boolean().default(true),
  recibe_llamada: z.boolean().default(true),
});

/** Lista guardianes con todos los campos extendidos (fallback a columnas básicas). */
export const listGuardians = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object(seniorAuthFields).parse(input))
  .handler(async ({ data }) => {
    await assertSeniorAccess(data.signupId, data.accessToken);
    const guardians = await fetchGuardiansForSignup(data.signupId);
    return { guardians };
  });

async function guardianCount(signupId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("emergency_contacts")
    .select("id", { count: "exact", head: true })
    .eq("contract_signup_id", signupId);

  if (!error) return count ?? 0;
  if (isMissingTableError(error.message ?? "")) {
    return (await listFamilyContacts(signupId)).length;
  }
  throw error;
}

async function performAddGuardian(
  signupId: string,
  guardian: z.infer<typeof guardianInput>,
): Promise<{ id: string }> {
  if ((await guardianCount(signupId)) >= MAX_GUARDIANS) {
    throw new Error(`Máximo ${MAX_GUARDIANS} guardianes.`);
  }

  const tel = normalizePhoneE164(guardian.telefono);
  if (!tel) throw new Error("Teléfono inválido.");
  const wa = guardian.whatsapp ? normalizePhoneE164(guardian.whatsapp) : null;

  const fullRow = {
    contract_signup_id: signupId,
    nombre: guardian.nombre,
    telefono: tel,
    whatsapp: wa,
    parentesco: guardian.parentesco,
    prioridad: guardian.prioridad,
    activo: guardian.activo,
    tipo_contacto: guardian.tipo_contacto,
    recibe_sms: guardian.recibe_sms,
    recibe_whatsapp: guardian.recibe_whatsapp,
    recibe_llamada: guardian.recibe_llamada,
  };

  let row: { id: string } | null = null;

  let insertResult = await supabaseAdmin
    .from("emergency_contacts")
    .insert(fullRow)
    .select("id")
    .single();

  if (insertResult.error) {
    const insertErr = insertResult.error.message ?? "";
    if (isMissingTableError(insertErr)) {
      const saved = await addFamilyContact(signupId, {
        nombre: guardian.nombre,
        telefono: tel,
        parentesco: guardian.parentesco,
      });
      if (!saved.ok || !saved.contact) throw new Error(saved.error ?? "save_failed");
      row = { id: saved.contact.id };
    } else if (isMissingColumnError(insertErr)) {
      insertResult = await supabaseAdmin
        .from("emergency_contacts")
        .insert({
          contract_signup_id: signupId,
          nombre: guardian.nombre,
          telefono: tel,
          parentesco: guardian.parentesco,
        })
        .select("id")
        .single();
      if (insertResult.error) throw insertResult.error;
      row = insertResult.data;
    } else {
      throw insertResult.error;
    }
  } else {
    row = insertResult.data;
  }

  if (!row) throw new Error("save_failed");

  try {
    const { data: existing } = await supabaseAdmin
      .from("family_members")
      .select("id")
      .eq("contract_signup_id", signupId)
      .eq("telefono", tel)
      .maybeSingle();
    if (!existing) {
      await supabaseAdmin.from("family_members").insert({
        contract_signup_id: signupId,
        nombre: guardian.nombre,
        telefono: tel,
        parentesco: guardian.parentesco,
      });
    }
  } catch {
    /* no bloquear si falla */
  }

  try {
    const { data: senior } = await supabaseAdmin
      .from("contract_signups")
      .select("nombre")
      .eq("id", signupId)
      .maybeSingle();
    await sendGuardianInvite({
      guardianTel: tel,
      guardianWa: wa,
      guardianName: guardian.nombre,
      seniorName: senior?.nombre ?? "Tu familiar",
      parentesco: guardian.parentesco,
      signupId,
      guardianId: row.id,
    });
  } catch {
    /* la invitación es best-effort */
  }

  return { id: row.id };
}

async function performUpdateGuardian(
  signupId: string,
  id: string,
  guardian: Partial<z.infer<typeof guardianInput>>,
): Promise<{ ok: true }> {
  const patch: Record<string, unknown> = { ...guardian };
  if (typeof patch.telefono === "string") {
    const t = normalizePhoneE164(patch.telefono);
    if (!t) throw new Error("Teléfono inválido.");
    patch.telefono = t;
  }
  if (typeof patch.whatsapp === "string") {
    patch.whatsapp = normalizePhoneE164(patch.whatsapp);
  }
  const { error } = await supabaseAdmin
    .from("emergency_contacts")
    .update(patch as never)
    .eq("id", id)
    .eq("contract_signup_id", signupId);
  if (error) {
    if (isMissingTableError(error.message ?? "")) {
      const existing = (await listFamilyContacts(signupId)).find((c) => c.id === id);
      if (!existing) throw new Error("Guardián no encontrado.");
      const saved = await updateFamilyContact(signupId, id, {
        nombre: String(patch.nombre ?? existing.nombre),
        telefono: String(patch.telefono ?? existing.telefono),
        parentesco: String(patch.parentesco ?? existing.parentesco),
      });
      if (!saved.ok) throw new Error(saved.error ?? "update_failed");
      return { ok: true };
    }
    throw error;
  }
  return { ok: true };
}

async function performDeleteGuardian(signupId: string, id: string): Promise<{ ok: true }> {
  const { error } = await supabaseAdmin
    .from("emergency_contacts")
    .delete()
    .eq("id", id)
    .eq("contract_signup_id", signupId);
  if (error) {
    if (isMissingTableError(error.message ?? "")) {
      const saved = await deleteFamilyContact(signupId, id);
      if (!saved.ok) throw new Error(saved.error ?? "delete_failed");
      return { ok: true };
    }
    throw error;
  }
  return { ok: true };
}

async function performToggleGuardianActive(
  signupId: string,
  id: string,
  activo: boolean,
): Promise<{ ok: true }> {
  const { error } = await supabaseAdmin
    .from("emergency_contacts")
    .update({ activo })
    .eq("id", id)
    .eq("contract_signup_id", signupId);
  if (error) {
    if (isMissingTableError(error.message ?? "")) {
      return { ok: true };
    }
    throw error;
  }
  return { ok: true };
}

export const addGuardian = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...seniorAuthFields, guardian: guardianInput }).parse(input),
  )
  .handler(async ({ data }) => {
    await assertSeniorAccess(data.signupId, data.accessToken);
    return performAddGuardian(data.signupId, data.guardian);
  });

export const updateGuardian = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...seniorAuthFields, id: idSchema, guardian: guardianInput.partial() }).parse(input),
  )
  .handler(async ({ data }) => {
    await assertSeniorAccess(data.signupId, data.accessToken);
    return performUpdateGuardian(data.signupId, data.id, data.guardian);
  });

export const deleteGuardian = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ ...seniorAuthFields, id: idSchema }).parse(input))
  .handler(async ({ data }) => {
    await assertSeniorAccess(data.signupId, data.accessToken);
    return performDeleteGuardian(data.signupId, data.id);
  });

export const toggleGuardianActive = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...seniorAuthFields, id: idSchema, activo: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    await assertSeniorAccess(data.signupId, data.accessToken);
    return performToggleGuardianActive(data.signupId, data.id, data.activo);
  });

/** Portal Familia — lista guardianes con sesión familiar (sin token senior). */
export const listGuardiansForFamily = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object(familySessionFields).parse(input))
  .handler(async ({ data }) => {
    const signupId = await assertActiveFamilyGuardianAccess(data);
    const guardians = await fetchGuardiansForSignup(signupId);
    return { guardians };
  });

export const addGuardianForFamily = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...familySessionFields, guardian: guardianInput }).parse(input),
  )
  .handler(async ({ data }) => {
    const signupId = await assertActiveFamilyGuardianAccess(data);
    return performAddGuardian(signupId, data.guardian);
  });

export const updateGuardianForFamily = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ ...familySessionFields, id: idSchema, guardian: guardianInput.partial() })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const signupId = await assertActiveFamilyGuardianAccess(data);
    return performUpdateGuardian(signupId, data.id, data.guardian);
  });

export const deleteGuardianForFamily = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ ...familySessionFields, id: idSchema }).parse(input))
  .handler(async ({ data }) => {
    const signupId = await assertActiveFamilyGuardianAccess(data);
    return performDeleteGuardian(signupId, data.id);
  });

export const toggleGuardianActiveForFamily = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...familySessionFields, id: idSchema, activo: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const signupId = await assertActiveFamilyGuardianAccess(data);
    return performToggleGuardianActive(signupId, data.id, data.activo);
  });
