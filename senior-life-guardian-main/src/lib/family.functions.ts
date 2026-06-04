import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizePhoneE164 } from "@/lib/phone-utils";
import { sendGuardianInvite } from "@/lib/guardians.functions";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";

const idSchema = z.string().uuid();
const contactInput = z.object({
  nombre: z.string().min(1).max(160),
  telefono: z.string().min(4).max(40),
  parentesco: z.string().min(1).max(60),
});

const appConfigInput = z.object({
  signupId: idSchema.optional(),
  email: z.string().email().max(255).optional(),
  telefono: z.string().min(4).max(40).optional(),
}).refine((data) => Boolean(data.signupId || data.email || data.telefono), {
  message: "Se requiere una cuenta para cargar la configuración.",
});

/** Carga la configuración existente para que la app no reinicie el onboarding. */
export const getAppConfiguration = createServerFn({ method: "POST" })
  .inputValidator((input) => appConfigInput.parse(input))
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("id,nombre,email,telefono,plan,periodo,purchase_mode,subscription_status,payment_status")
      .limit(1);

    if (data.signupId) query = query.eq("id", data.signupId);
    else if (data.email) query = query.eq("email", data.email.trim().toLowerCase());
    else if (data.telefono) query = query.eq("telefono", data.telefono.trim());

    const { data: user, error: userError } = await query.maybeSingle();
    if (userError) throw userError;
    if (!user) return { configured: false, user: null, contacts: [], pinConfigured: false };

    const [{ data: contacts, error: contactsError }, { data: pin, error: pinError }] = await Promise.all([
      supabaseAdmin
        .from("emergency_contacts")
        .select("id,nombre,telefono,parentesco,created_at")
        .eq("contract_signup_id", user.id)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("user_pins")
        .select("contract_signup_id")
        .eq("contract_signup_id", user.id)
        .maybeSingle(),
    ]);

    if (contactsError) throw contactsError;
    if (pinError) throw pinError;

    return {
      configured: true,
      user,
      contacts: contacts ?? [],
      pinConfigured: Boolean(pin),
    };
  });

/** Lista familiares del usuario (por contract_signup_id). */
export const listFamily = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ signupId: idSchema }).parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("emergency_contacts")
      .select("id,nombre,telefono,parentesco,created_at")
      .eq("contract_signup_id", data.signupId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return { contacts: rows ?? [] };
  });

export const addFamily = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, contact: contactInput }).parse(input),
  )
  .handler(async ({ data }) => {
    const { count } = await supabaseAdmin
      .from("emergency_contacts")
      .select("id", { count: "exact", head: true })
      .eq("contract_signup_id", data.signupId);
    if ((count ?? 0) >= 5) throw new Error("Máximo 5 familiares.");

    const rawTel = data.contact.telefono.trim();
    const telefono = normalizePhoneE164(rawTel) || rawTel;
    const { data: existing } = await supabaseAdmin
      .from("emergency_contacts")
      .select("id")
      .eq("contract_signup_id", data.signupId)
      .eq("telefono", telefono)
      .maybeSingle();
    if (existing) throw new Error("Ya existe un familiar con ese teléfono.");

    const { data: row, error } = await supabaseAdmin
      .from("emergency_contacts")
      .insert({
        contract_signup_id: data.signupId,
        nombre: data.contact.nombre.trim(),
        telefono,
        parentesco: data.contact.parentesco.trim(),
      })
      .select("id,nombre,telefono,parentesco,created_at")
      .single();
    if (error) {
      if ((error as any).code === "23505") throw new Error("Ya existe un familiar con ese teléfono.");
      throw error;
    }

    // Pre-registrar como family_member para OTP del Portal Familia (best-effort).
    try {
      const { data: existingFm } = await supabaseAdmin
        .from("family_members")
        .select("id")
        .eq("contract_signup_id", data.signupId)
        .eq("telefono", telefono)
        .maybeSingle();
      if (!existingFm) {
        await supabaseAdmin.from("family_members").insert({
          contract_signup_id: data.signupId,
          nombre: data.contact.nombre.trim(),
          telefono,
          parentesco: data.contact.parentesco.trim(),
        });
      }
    } catch { /* silencioso */ }

    // Enviar invitación al Portal Familia (best-effort, no bloquea la UI del onboarding).
    try {
      const { data: senior } = await supabaseAdmin
        .from(CONTRACT_SIGNUPS_TABLE)
        .select("nombre")
        .eq("id", data.signupId)
        .maybeSingle();
      await sendGuardianInvite({
        guardianTel: telefono,
        guardianWa: null,
        guardianName: data.contact.nombre.trim(),
        seniorName: (senior as any)?.nombre ?? "Tu familiar",
        parentesco: data.contact.parentesco.trim(),
        signupId: data.signupId,
        guardianId: row.id,
      });
    } catch { /* best-effort */ }

    return { contact: row };
  });

export const updateFamily = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, id: idSchema, contact: contactInput }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("emergency_contacts")
      .update({
        nombre: data.contact.nombre.trim(),
        telefono: data.contact.telefono.trim(),
        parentesco: data.contact.parentesco.trim(),
      })
      .eq("id", data.id)
      .eq("contract_signup_id", data.signupId)
      .select("id,nombre,telefono,parentesco,created_at")
      .single();
    if (error) throw error;
    return { contact: row };
  });

export const deleteFamily = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, id: idSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("emergency_contacts")
      .delete()
      .eq("id", data.id)
      .eq("contract_signup_id", data.signupId);
    if (error) throw error;
    return { ok: true };
  });

/**
 * Reenvía la invitación al Portal Familia para un guardián existente.
 * Reutiliza sendGuardianInvite (mismo canal WhatsApp + SMS). No duplica contactos.
 */
export const resendFamilyInvite = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, contactId: idSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: contact, error } = await supabaseAdmin
      .from("emergency_contacts")
      .select("id, nombre, telefono, whatsapp, parentesco")
      .eq("id", data.contactId)
      .eq("contract_signup_id", data.signupId)
      .maybeSingle();
    if (error) throw error;
    if (!contact) throw new Error("Guardián no encontrado.");

    const { data: senior } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("nombre")
      .eq("id", data.signupId)
      .maybeSingle();

    await sendGuardianInvite({
      guardianTel: contact.telefono,
      guardianWa: (contact as any).whatsapp ?? null,
      guardianName: contact.nombre,
      seniorName: (senior as any)?.nombre ?? "Tu familiar",
      parentesco: contact.parentesco,
      signupId: data.signupId,
      guardianId: contact.id,
    });

    return { ok: true };
  });

/** Crea/actualiza el PIN del usuario (hash ya calculado en cliente). */
export const setUserPin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, pinHash: z.string().min(16).max(256) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("user_pins")
      .upsert(
        { contract_signup_id: data.signupId, pin_hash: data.pinHash, updated_at: new Date().toISOString() },
        { onConflict: "contract_signup_id" },
      );
    if (error) throw error;
    return { ok: true };
  });

/** Verifica PIN (solo para configuraciones sensibles). */
export const verifyPin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, pinHash: z.string().min(16).max(256) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("user_pins")
      .select("pin_hash")
      .eq("contract_signup_id", data.signupId)
      .maybeSingle();
    if (error) throw error;
    if (!row) return { ok: false, configured: false };
    return { ok: row.pin_hash === data.pinHash, configured: true };
  });
