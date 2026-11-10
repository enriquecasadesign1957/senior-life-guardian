import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { attemptOneclickRecurringCharge } from "@/lib/oneclick-renewal-charge";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { buildRenewalEmail } from "@/lib/subscription-renewal-emails";
import { clearRenewalNoticeFlags } from "@/lib/subscription-renewal-flags";
import { sendBillingEmailViaZoho } from "@/lib/zoho-smtp";

export { clearRenewalNoticeFlags } from "@/lib/subscription-renewal-flags";

const CHILE_TZ = "America/Santiago";
const GRACE_DAYS_AFTER_DUE = 3;
/** Ventana de aviso: envía si el cron no corrió el día exacto (7 o 1). */
const REMINDER_7D_MIN_DAYS = 2;
const REMINDER_1D_MIN_DAYS = 0;

export type SubscriptionRenewalJobResult = {
  ok: boolean;
  processed: number;
  reminders7d: number;
  reminders1d: number;
  autoChargesAttempted: number;
  autoChargesSucceeded: number;
  autoChargesFailed: number;
  suspended: number;
  suspensionEmails: number;
  errors: string[];
};

type SignupBillingRow = {
  id: string;
  nombre: string;
  email: string;
  periodo: string;
  payment_status: string;
  subscription_status: string;
  renewal_date: string;
  renewal_reminder_7d_for: string | null;
  renewal_reminder_1d_for: string | null;
  suspension_email_sent_at: string | null;
  recurring_billing_consented_at: string | null;
  recurring_billing_charge_for: string | null;
  oneclick_username: string | null;
  oneclick_tbk_user: string | null;
};

function chileDateKey(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHILE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function chileTodayKey(): string {
  return chileDateKey(new Date());
}

/** Días calendario Chile: positivo si `to` es posterior a `from`. */
function daysBetweenChile(fromKey: string, toKey: string): number {
  const parse = (k: string) => {
    const [y, m, d] = k.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((parse(toKey) - parse(fromKey)) / 86_400_000);
}

function sameRenewalCycle(a: string | null, renewalDate: string): boolean {
  if (!a) return false;
  return chileDateKey(a) === chileDateKey(renewalDate);
}

function hasRecurringAutoBilling(row: SignupBillingRow): boolean {
  return Boolean(
    row.recurring_billing_consented_at &&
      row.oneclick_username &&
      row.oneclick_tbk_user,
  );
}

async function sendRenewalEmail(
  to: string,
  kind: "reminder_7d" | "reminder_1d" | "suspended",
  row: SignupBillingRow,
): Promise<void> {
  const { subject, textBody, htmlBody } = buildRenewalEmail(kind, {
    nombre: row.nombre,
    email: row.email,
    periodo: row.periodo,
    renewalDate: row.renewal_date,
  });
  await sendBillingEmailViaZoho({ to, subject, textBody, htmlBody });
}

async function suspendSignup(row: SignupBillingRow, result: SubscriptionRenewalJobResult): Promise<void> {
  const now = new Date().toISOString();
  await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .update({
      subscription_status: "suspended",
      suspended_at: now,
    } as never)
    .eq("id", row.id);
  result.suspended += 1;

  if (!row.suspension_email_sent_at) {
    await sendRenewalEmail(row.email, "suspended", row);
    await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({ suspension_email_sent_at: now } as never)
      .eq("id", row.id);
    result.suspensionEmails += 1;
  }
}

export async function runSubscriptionRenewalJob(): Promise<SubscriptionRenewalJobResult> {
  const result: SubscriptionRenewalJobResult = {
    ok: true,
    processed: 0,
    reminders7d: 0,
    reminders1d: 0,
    autoChargesAttempted: 0,
    autoChargesSucceeded: 0,
    autoChargesFailed: 0,
    suspended: 0,
    suspensionEmails: 0,
    errors: [],
  };

  const todayKey = chileTodayKey();

  const { data: rows, error } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select(
      "id, nombre, email, periodo, payment_status, subscription_status, renewal_date, renewal_reminder_7d_for, renewal_reminder_1d_for, suspension_email_sent_at, recurring_billing_consented_at, recurring_billing_charge_for, oneclick_username, oneclick_tbk_user",
    )
    .eq("payment_status", "paid")
    .not("renewal_date", "is", null)
    .in("subscription_status", ["active", "suspended"]);

  if (error) {
    result.ok = false;
    result.errors.push(error.message);
    return result;
  }

  for (const raw of rows ?? []) {
    const row = raw as SignupBillingRow;
    result.processed += 1;

    const renewalKey = chileDateKey(row.renewal_date);
    const daysUntil = daysBetweenChile(todayKey, renewalKey);
    const daysOverdue = daysBetweenChile(renewalKey, todayKey);
    const autoBilling = hasRecurringAutoBilling(row);

    try {
      if (row.subscription_status === "active") {
        if (autoBilling) {
          if (
            daysUntil <= 0 &&
            !sameRenewalCycle(row.recurring_billing_charge_for, row.renewal_date)
          ) {
            result.autoChargesAttempted += 1;
            const charge = await attemptOneclickRecurringCharge(row.id);
            await supabaseAdmin
              .from(CONTRACT_SIGNUPS_TABLE)
              .update({ recurring_billing_charge_for: row.renewal_date } as never)
              .eq("id", row.id);

            if (charge.skipped) {
              result.errors.push(`${row.email}: cobro automático omitido (${charge.reason ?? "desconocido"})`);
            } else if (charge.ok) {
              result.autoChargesSucceeded += 1;
              continue;
            } else {
              result.autoChargesFailed += 1;
            }
          }
        } else {
          if (
            daysUntil <= 7 &&
            daysUntil >= REMINDER_7D_MIN_DAYS &&
            !sameRenewalCycle(row.renewal_reminder_7d_for, row.renewal_date)
          ) {
            await sendRenewalEmail(row.email, "reminder_7d", row);
            await supabaseAdmin
              .from(CONTRACT_SIGNUPS_TABLE)
              .update({ renewal_reminder_7d_for: row.renewal_date } as never)
              .eq("id", row.id);
            result.reminders7d += 1;
          }

          if (
            daysUntil <= 1 &&
            daysUntil >= REMINDER_1D_MIN_DAYS &&
            !sameRenewalCycle(row.renewal_reminder_1d_for, row.renewal_date)
          ) {
            await sendRenewalEmail(row.email, "reminder_1d", row);
            await supabaseAdmin
              .from(CONTRACT_SIGNUPS_TABLE)
              .update({ renewal_reminder_1d_for: row.renewal_date } as never)
              .eq("id", row.id);
            result.reminders1d += 1;
          }
        }

        if (daysOverdue >= GRACE_DAYS_AFTER_DUE) {
          await suspendSignup(row, result);
        }
      } else if (row.subscription_status === "suspended" && !row.suspension_email_sent_at) {
        const now = new Date().toISOString();
        await sendRenewalEmail(row.email, "suspended", row);
        await supabaseAdmin
          .from(CONTRACT_SIGNUPS_TABLE)
          .update({ suspension_email_sent_at: now } as never)
          .eq("id", row.id);
        result.suspensionEmails += 1;
      }
    } catch (e) {
      result.ok = false;
      result.errors.push(`${row.email}: ${String((e as Error)?.message ?? e)}`);
    }
  }

  console.log("[subscription-renewal]", JSON.stringify(result));
  return result;
}

export function verifyCronSecret(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${expected}`;
}
