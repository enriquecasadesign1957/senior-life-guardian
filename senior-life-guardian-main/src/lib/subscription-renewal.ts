import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { buildRenewalEmail } from "@/lib/subscription-renewal-emails";
import { sendBillingEmailViaZoho } from "@/lib/zoho-smtp";

const CHILE_TZ = "America/Santiago";
const GRACE_DAYS_AFTER_DUE = 3;
const REMINDER_DAYS_BEFORE = [7, 1] as const;

export type SubscriptionRenewalJobResult = {
  ok: boolean;
  processed: number;
  reminders7d: number;
  reminders1d: number;
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

/** Tras un pago exitoso: reactivar y limpiar avisos del ciclo anterior. */
export async function clearRenewalNoticeFlags(signupId: string): Promise<void> {
  await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .update({
      renewal_reminder_7d_for: null,
      renewal_reminder_1d_for: null,
      suspended_at: null,
      suspension_email_sent_at: null,
      subscription_status: "active",
    } as never)
    .eq("id", signupId);
}

export async function runSubscriptionRenewalJob(): Promise<SubscriptionRenewalJobResult> {
  const result: SubscriptionRenewalJobResult = {
    ok: true,
    processed: 0,
    reminders7d: 0,
    reminders1d: 0,
    suspended: 0,
    suspensionEmails: 0,
    errors: [],
  };

  const todayKey = chileTodayKey();

  const { data: rows, error } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select(
      "id, nombre, email, periodo, payment_status, subscription_status, renewal_date, renewal_reminder_7d_for, renewal_reminder_1d_for, suspension_email_sent_at",
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

    try {
      if (row.subscription_status === "active") {
        if (daysUntil === REMINDER_DAYS_BEFORE[0] && !sameRenewalCycle(row.renewal_reminder_7d_for, row.renewal_date)) {
          await sendRenewalEmail(row.email, "reminder_7d", row);
          await supabaseAdmin
            .from(CONTRACT_SIGNUPS_TABLE)
            .update({ renewal_reminder_7d_for: row.renewal_date } as never)
            .eq("id", row.id);
          result.reminders7d += 1;
        }

        if (daysUntil === REMINDER_DAYS_BEFORE[1] && !sameRenewalCycle(row.renewal_reminder_1d_for, row.renewal_date)) {
          await sendRenewalEmail(row.email, "reminder_1d", row);
          await supabaseAdmin
            .from(CONTRACT_SIGNUPS_TABLE)
            .update({ renewal_reminder_1d_for: row.renewal_date } as never)
            .eq("id", row.id);
          result.reminders1d += 1;
        }

        if (daysOverdue >= GRACE_DAYS_AFTER_DUE) {
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
