import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizePlanKey, planKeySchema, periodoSchema } from "@/lib/plans";
import {
  clearDiscountSignupFields,
  discountSignupFields,
} from "@/lib/discount-codes";
import { resolveDiscountForCheckout } from "@/lib/discount.functions";
import {
  CONTRACT_SIGNUP_SELECT,
  CONTRACT_SIGNUPS_TABLE,
  contractSignupPendingPayload,
} from "@/lib/signups-db";
import { RECURRING_BILLING_CONSENT_VERSION } from "@/lib/recurring-billing-consent";

/**
 * Crea un registro de contratación directa (Plan Único) antes de iniciar Webpay.
 */
export const createPurchaseSignup = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      nombre: z.string().min(2).max(160),
      email: z.string().email().max(255),
      telefono: z.string().min(8).max(40),
      direccion: z.string().max(255).nullable().optional(),
      plan: planKeySchema.transform(normalizePlanKey),
      periodo: periodoSchema,
      discountCode: z.string().trim().max(64).optional().or(z.literal("")),
      recurringBillingConsent: z.boolean().optional().default(false),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const basePayload = contractSignupPendingPayload({
      nombre: data.nombre,
      email,
      telefono: data.telefono,
      direccion: data.direccion,
      plan: data.plan,
      periodo: data.periodo,
    });

    let discountFields = clearDiscountSignupFields();
    const rawCode = data.discountCode?.trim();
    if (rawCode) {
      const resolved = await resolveDiscountForCheckout(rawCode, data.plan, data.periodo);
      discountFields = discountSignupFields(resolved);
    }

    const payload = {
      ...basePayload,
      ...discountFields,
      ...(data.recurringBillingConsent
        ? {
            recurring_billing_consented_at: new Date().toISOString(),
            recurring_billing_consent_version: RECURRING_BILLING_CONSENT_VERSION,
          }
        : {
            recurring_billing_consented_at: null,
            recurring_billing_consent_version: null,
          }),
    };

    const { data: existing, error: existingError } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select(CONTRACT_SIGNUP_SELECT)
      .eq("email", email)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing) {
      const { data: updated, error: updErr } = await supabaseAdmin
        .from(CONTRACT_SIGNUPS_TABLE)
        .update(payload)
        .eq("id", existing.id)
        .select(CONTRACT_SIGNUP_SELECT)
        .maybeSingle();
      if (updErr) throw updErr;
      return { signup: updated ?? existing, created: false };
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .insert(payload)
      .select(CONTRACT_SIGNUP_SELECT)
      .maybeSingle();

    if (insertError) throw insertError;
    if (!inserted) throw new Error("No pudimos crear la orden de compra.");
    return { signup: inserted, created: true };
  });
