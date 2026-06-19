import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertAdminPin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { clearRenewalNoticeFlags } from "@/lib/subscription-renewal-flags";

const pinSchema = z.object({ pin: z.string().min(1).max(64) });

const lookupSchema = pinSchema.extend({
  email: z.string().email().optional(),
  signupId: z.string().uuid().optional(),
});

const grantSchema = pinSchema.extend({
  email: z.string().email().optional(),
  signupId: z.string().uuid().optional(),
  reason: z.string().trim().min(3).max(500),
  grantedBy: z.string().trim().min(1).max(120).optional(),
  /** Meses de vigencia; null = sin fecha de fin (sin cobro automático). */
  durationMonths: z.number().int().min(1).max(120).nullable().optional(),
});

const revokeSchema = pinSchema.extend({
  signupId: z.string().uuid(),
  reason: z.string().trim().min(3).max(500).optional(),
});

const ADMIN_ACCOUNT_SELECT =
  "id,nombre,email,telefono,plan,periodo,payment_status,subscription_status,renewal_date,comp_reason,comp_granted_at,comp_granted_by,discount_code,discount_percent,created_at,last_payment_at";

function computeCompRenewalDate(durationMonths: number | null | undefined): string | null {
  if (durationMonths == null) return null;
  const d = new Date();
  d.setMonth(d.getMonth() + durationMonths);
  return d.toISOString();
}

async function findSignup(email?: string, signupId?: string) {
  if (signupId) {
    const { data, error } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select(ADMIN_ACCOUNT_SELECT)
      .eq("id", signupId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }
  if (email) {
    const normalized = email.trim().toLowerCase();
    const { data, error } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select(ADMIN_ACCOUNT_SELECT)
      .eq("email", normalized)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }
  return null;
}

export const adminLookupAccount = createServerFn({ method: "POST" })
  .inputValidator((input) => lookupSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);
    if (!data.email && !data.signupId) {
      throw new Error("Indica email o ID de cuenta.");
    }
    const row = await findSignup(data.email, data.signupId);
    if (!row) {
      return { ok: false as const, message: "No se encontró la cuenta." };
    }
    return { ok: true as const, account: row };
  });

export const adminGrantFreeService = createServerFn({ method: "POST" })
  .inputValidator((input) => grantSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);
    if (!data.email && !data.signupId) {
      throw new Error("Indica email o ID de cuenta.");
    }

    const row = await findSignup(data.email, data.signupId);
    if (!row) throw new Error("No se encontró la cuenta.");

    const now = new Date().toISOString();
    const renewalDate = computeCompRenewalDate(data.durationMonths ?? null);

    const { error } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({
        payment_status: "comp",
        subscription_status: "active",
        renewal_date: renewalDate,
        comp_reason: data.reason,
        comp_granted_at: now,
        comp_granted_by: data.grantedBy?.trim() || "admin",
        last_payment_at: null,
      } as never)
      .eq("id", row.id);

    if (error) throw new Error(error.message);

    await clearRenewalNoticeFlags(row.id);

    return {
      ok: true as const,
      signupId: row.id,
      email: row.email,
      message: renewalDate
        ? `Servicio activado en gratuidad hasta ${new Date(renewalDate).toLocaleDateString("es-CL")}.`
        : "Servicio activado en gratuidad (sin fecha de término automática).",
    };
  });

export const adminRevokeFreeService = createServerFn({ method: "POST" })
  .inputValidator((input) => revokeSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);

    const { data: row, error: fetchErr } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("id,email,payment_status")
      .eq("id", data.signupId)
      .maybeSingle();

    if (fetchErr) throw new Error(fetchErr.message);
    if (!row) throw new Error("Cuenta no encontrada.");
    if (row.payment_status !== "comp") {
      throw new Error("Esta cuenta no tiene cortesía activa (payment_status ≠ comp).");
    }

    const { error } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({
        payment_status: "pending",
        subscription_status: "cancelled",
        comp_reason: data.reason ? `Revocado: ${data.reason}` : "Revocado por administrador",
        renewal_date: null,
      } as never)
      .eq("id", data.signupId);

    if (error) throw new Error(error.message);

    return {
      ok: true as const,
      message: `Cortesía revocada para ${row.email}.`,
    };
  });
