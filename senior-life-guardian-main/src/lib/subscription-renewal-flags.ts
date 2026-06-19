import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";

/** Tras un pago exitoso: reactivar y limpiar avisos del ciclo anterior. */
export async function clearRenewalNoticeFlags(signupId: string): Promise<void> {
  await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .update({
      renewal_reminder_7d_for: null,
      renewal_reminder_1d_for: null,
      recurring_billing_charge_for: null,
      suspended_at: null,
      suspension_email_sent_at: null,
      subscription_status: "active",
    } as never)
    .eq("id", signupId);
}
