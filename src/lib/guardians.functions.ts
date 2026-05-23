import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizePhoneE164 } from "@/lib/phone-utils";

const idSchema = z.string().uuid();

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

/** Lista guardianes con todos los campos extendidos. */
export const listGuardians = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ signupId: idSchema }).parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("emergency_contacts")
      .select(
        "id,nombre,telefono,whatsapp,parentesco,prioridad,activo,tipo_contacto,recibe_sms,recibe_whatsapp,recibe_llamada,created_at",
      )
      .eq("trial_signup_id", data.signupId)
      .order("prioridad", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return { guardians: rows ?? [] };
  });

export const addGuardian = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, guardian: guardianInput }).parse(input),
  )
  .handler(async ({ data }) => {
    const { count } = await supabaseAdmin
      .from("emergency_contacts")
      .select("id", { count: "exact", head: true })
      .eq("trial_signup_id", data.signupId);
    if ((count ?? 0) >= 10) throw new Error("Máximo 10 guardianes.");

    const tel = normalizePhoneE164(data.guardian.telefono);
    if (!tel) throw new Error("Teléfono inválido.");
    const wa = data.guardian.whatsapp ? normalizePhoneE164(data.guardian.whatsapp) : null;

    const { data: row, error } = await supabaseAdmin
      .from("emergency_contacts")
      .insert({
        trial_signup_id: data.signupId,
        nombre: data.guardian.nombre,
        telefono: tel,
        whatsapp: wa,
        parentesco: data.guardian.parentesco,
        prioridad: data.guardian.prioridad,
        activo: data.guardian.activo,
        tipo_contacto: data.guardian.tipo_contacto,
        recibe_sms: data.guardian.recibe_sms,
        recibe_whatsapp: data.guardian.recibe_whatsapp,
        recibe_llamada: data.guardian.recibe_llamada,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: row.id };
  });

export const updateGuardian = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, id: idSchema, guardian: guardianInput.partial() }).parse(input),
  )
  .handler(async ({ data }) => {
    const patch: Record<string, unknown> = { ...data.guardian };
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
      .eq("id", data.id)
      .eq("trial_signup_id", data.signupId);
    if (error) throw error;
    return { ok: true };
  });

export const deleteGuardian = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ signupId: idSchema, id: idSchema }).parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("emergency_contacts")
      .delete()
      .eq("id", data.id)
      .eq("trial_signup_id", data.signupId);
    if (error) throw error;
    return { ok: true };
  });

export const toggleGuardianActive = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, id: idSchema, activo: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("emergency_contacts")
      .update({ activo: data.activo })
      .eq("id", data.id)
      .eq("trial_signup_id", data.signupId);
    if (error) throw error;
    return { ok: true };
  });
