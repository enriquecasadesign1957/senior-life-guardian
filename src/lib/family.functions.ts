import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
      .from("trial_signups")
      .select("id,nombre,email,telefono,plan,periodo,trial_active,trial_end,purchase_mode,subscription_status,payment_status")
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
        .eq("trial_signup_id", user.id)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("user_pins")
        .select("trial_signup_id")
        .eq("trial_signup_id", user.id)
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

/** Lista familiares del usuario (por trial_signup_id). */
export const listFamily = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ signupId: idSchema }).parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("emergency_contacts")
      .select("id,nombre,telefono,parentesco,created_at")
      .eq("trial_signup_id", data.signupId)
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
      .eq("trial_signup_id", data.signupId);
    if ((count ?? 0) >= 5) throw new Error("Máximo 5 familiares.");

    const telefono = data.contact.telefono.trim();
    const { data: existing } = await supabaseAdmin
      .from("emergency_contacts")
      .select("id")
      .eq("trial_signup_id", data.signupId)
      .eq("telefono", telefono)
      .maybeSingle();
    if (existing) throw new Error("Ya existe un familiar con ese teléfono.");

    const { data: row, error } = await supabaseAdmin
      .from("emergency_contacts")
      .insert({
        trial_signup_id: data.signupId,
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
      .eq("trial_signup_id", data.signupId)
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
      .eq("trial_signup_id", data.signupId);
    if (error) throw error;
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
        { trial_signup_id: data.signupId, pin_hash: data.pinHash, updated_at: new Date().toISOString() },
        { onConflict: "trial_signup_id" },
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
      .eq("trial_signup_id", data.signupId)
      .maybeSingle();
    if (error) throw error;
    if (!row) return { ok: false, configured: false };
    return { ok: row.pin_hash === data.pinHash, configured: true };
  });
