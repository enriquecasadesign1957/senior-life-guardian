import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Crea un signup en modo "contratar" (pago inmediato, sin trial).
 * Se usa antes de iniciar Webpay.
 */
export const createPurchaseSignup = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      nombre: z.string().min(2).max(160),
      email: z.string().email().max(255),
      telefono: z.string().min(8).max(40),
      direccion: z.string().max(255).nullable().optional(),
      plan: z.enum(["basico", "premium"]),
      periodo: z.enum(["mensual", "anual"]),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const columns =
      "id,nombre,email,telefono,plan,periodo,trial_active,trial_end,purchase_mode,payment_status,subscription_status";

    // Si ya existe, reusar pero forzar modo compra
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("trial_signups")
      .select(columns)
      .eq("email", email)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing) {
      const { data: updated, error: updErr } = await supabaseAdmin
        .from("trial_signups")
        .update({
          nombre: data.nombre.trim(),
          telefono: data.telefono.trim(),
          direccion: data.direccion?.trim() || null,
          plan: data.plan,
          periodo: data.periodo,
          purchase_mode: "contratar",
          trial_active: false,
          payment_status: "pending",
          subscription_status: "pending_payment",
        })
        .eq("id", (existing as any).id)
        .select(columns)
        .maybeSingle();
      if (updErr) throw updErr;
      return { signup: updated ?? existing, created: false };
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("trial_signups")
      .insert({
        nombre: data.nombre.trim(),
        email,
        telefono: data.telefono.trim(),
        direccion: data.direccion?.trim() || null,
        plan: data.plan,
        periodo: data.periodo,
        purchase_mode: "contratar",
        trial_active: false,
        payment_status: "pending",
        subscription_status: "pending_payment",
      })
      .select(columns)
      .maybeSingle();

    if (insertError) throw insertError;
    if (!inserted) throw new Error("No pudimos crear la orden de compra.");
    return { signup: inserted, created: true };
  });
