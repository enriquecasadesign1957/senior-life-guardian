import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Resetea datos de PRUEBA de Senior Safe.
 * Elimina signups en modo trial (no pagados) y todo lo relacionado.
 * NUNCA toca cuentas con payment_status='paid' o subscription_status='active'.
 *
 * Requiere `confirm: "RESET"` para evitar disparos accidentales.
 */
export const resetTestData = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      confirm: z.literal("RESET"),
    }).parse(input),
  )
  .handler(async () => {
    // Selecciona ids de signups de prueba (trial, sin pago real)
    const { data: testSignups, error: selErr } = await supabaseAdmin
      .from("trial_signups")
      .select("id,email")
      .or("payment_status.eq.trial,purchase_mode.eq.trial")
      .neq("subscription_status", "active");

    if (selErr) throw selErr;

    const ids = (testSignups ?? []).map((s: any) => s.id);
    const emails = (testSignups ?? []).map((s: any) => s.email);

    if (ids.length === 0) {
      return { deleted: 0, emails: [], message: "No hay datos de prueba para eliminar." };
    }

    // Cascade manual
    const { error: ecErr } = await supabaseAdmin
      .from("emergency_contacts").delete().in("trial_signup_id", ids);
    if (ecErr) throw ecErr;

    const { error: pinErr } = await supabaseAdmin
      .from("user_pins").delete().in("trial_signup_id", ids);
    if (pinErr) throw pinErr;

    const { error: wtErr } = await supabaseAdmin
      .from("webpay_transactions").delete().in("trial_signup_id", ids);
    if (wtErr) throw wtErr;

    const { error: tsErr } = await supabaseAdmin
      .from("trial_signups").delete().in("id", ids);
    if (tsErr) throw tsErr;

    return { deleted: ids.length, emails, message: `Eliminados ${ids.length} registros de prueba.` };
  });
