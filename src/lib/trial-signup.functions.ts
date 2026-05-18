import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const activateTrialSignup = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      nombre: z.string().min(2).max(160),
      email: z.string().email().max(255),
      telefono: z.string().min(8).max(40),
      direccion: z.string().max(255).nullable().optional(),
      plan: z.string().min(1).max(30).default("premium"),
      periodo: z.string().min(1).max(30).default("mensual"),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const columns = "id,nombre,email,telefono,plan,periodo,trial_active,trial_end";

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("trial_signups")
      .select(columns)
      .eq("email", email)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) return { signup: existing, created: false };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("trial_signups")
      .insert({
        nombre: data.nombre.trim(),
        email,
        telefono: data.telefono.trim(),
        direccion: data.direccion?.trim() || null,
        plan: data.plan,
        periodo: data.periodo,
        trial_active: true,
        trial_end: trialEnd,
        payment_status: "trial",
      })
      .select(columns)
      .maybeSingle();

    if (insertError) {
      if (insertError.code === "23505" || /duplicate|unique/i.test(insertError.message)) {
        const { data: repeated, error: repeatedError } = await supabaseAdmin
          .from("trial_signups")
          .select(columns)
          .eq("email", email)
          .maybeSingle();
        if (repeatedError) throw repeatedError;
        if (repeated) return { signup: repeated, created: false };
      }
      throw insertError;
    }

    if (!inserted) throw new Error("No pudimos activar la prueba gratis.");
    return { signup: inserted, created: true };
  });