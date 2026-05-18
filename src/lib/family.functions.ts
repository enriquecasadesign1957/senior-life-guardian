import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const idSchema = z.string().uuid();
const contactInput = z.object({
  nombre: z.string().min(1).max(160),
  telefono: z.string().min(4).max(40),
  parentesco: z.string().min(1).max(60),
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

    const { data: row, error } = await supabaseAdmin
      .from("emergency_contacts")
      .insert({
        trial_signup_id: data.signupId,
        nombre: data.contact.nombre.trim(),
        telefono: data.contact.telefono.trim(),
        parentesco: data.contact.parentesco.trim(),
      })
      .select("id,nombre,telefono,parentesco,created_at")
      .single();
    if (error) throw error;
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
