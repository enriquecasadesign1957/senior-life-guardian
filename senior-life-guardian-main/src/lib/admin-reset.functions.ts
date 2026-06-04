import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";

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
      .from(CONTRACT_SIGNUPS_TABLE)
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
      .from("emergency_contacts").delete().in("contract_signup_id", ids);
    if (ecErr) throw ecErr;

    const { error: pinErr } = await supabaseAdmin
      .from("user_pins").delete().in("contract_signup_id", ids);
    if (pinErr) throw pinErr;

    const { error: wtErr } = await supabaseAdmin
      .from("webpay_transactions").delete().in("contract_signup_id", ids);
    if (wtErr) throw wtErr;

    const { error: tsErr } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE).delete().in("id", ids);
    if (tsErr) throw tsErr;

    return { deleted: ids.length, emails, message: `Eliminados ${ids.length} registros de prueba.` };
  });

/**
 * Resetea SOLO los datos de prueba de una cuenta (la mía), sin tocar:
 *  - el registro trial_signups (se mantiene)
 *  - webpay_transactions / pagos
 *  - otras cuentas
 *
 * Borra: emergency_contacts, user_pins, alert_logs.
 * Resetea flags: onboarding_completed=false, whatsapp_activated=false.
 */
export const resetMyAccountData = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      confirm: z.literal("RESET"),
      email: z.string().email().max(255),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();

    const { data: signup, error: selErr } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("id,email,nombre,payment_status,subscription_status")
      .eq("email", email)
      .maybeSingle();
    if (selErr) throw selErr;
    if (!signup) {
      return { ok: false, message: `No se encontró ninguna cuenta con el email ${email}.` };
    }

    const id = signup.id;

    const [{ error: ecErr, count: ecCount }, { error: pinErr, count: pinCount }, { error: alErr, count: alCount }] = await Promise.all([
      supabaseAdmin.from("emergency_contacts").delete({ count: "exact" }).eq("contract_signup_id", id),
      supabaseAdmin.from("user_pins").delete({ count: "exact" }).eq("contract_signup_id", id),
      supabaseAdmin.from("alert_logs").delete({ count: "exact" }).eq("contract_signup_id", id),
    ]);
    if (ecErr) throw ecErr;
    if (pinErr) throw pinErr;
    if (alErr) throw alErr;

    const { error: updErr } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({ onboarding_completed: false, whatsapp_activated: false, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (updErr) throw updErr;

    return {
      ok: true,
      email: signup.email,
      nombre: signup.nombre,
      contactsDeleted: ecCount ?? 0,
      pinsDeleted: pinCount ?? 0,
      alertsDeleted: alCount ?? 0,
      message: `Cuenta ${signup.email} lista para repetir pruebas. Mantenida en backend (pagos intactos).`,
    };
  });
