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
  savePendingFirstGuardian,
  type PendingFirstGuardian,
} from "@/lib/first-guardian-checkout";
import {
  CONTRACT_SIGNUP_SELECT,
  CONTRACT_SIGNUPS_TABLE,
  contractSignupPendingPayload,
  isSignupPaidAndActive,
} from "@/lib/signups-db";
import { RECURRING_BILLING_CONSENT_VERSION } from "@/lib/recurring-billing-consent";
import { consultarTarjetaVecino } from "@/lib/tarjeta-vecino.server";
import { lasCondesTier, parseChileanRut } from "@/lib/tarjeta-vecino";
import type { Database } from "@/integrations/supabase/types";

type SignupInsert = Database["public"]["Tables"]["contract_signups"]["Insert"];
type SignupUpdate = Database["public"]["Tables"]["contract_signups"]["Update"];

type TarjetaVecinoEvidence = {
  tarjeta_vecino_rut: string;
  tarjeta_vecino_estado: string;
  tarjeta_vecino_tipo: string;
  tarjeta_vecino_checked_at: string;
};

function isMissingTarjetaVecinoColumn(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("tarjeta_vecino") ||
    normalized.includes("schema cache") ||
    normalized.includes("42703")
  );
}

/**
 * Crea un registro de contratación directa (Plan Único) antes de iniciar Webpay/Oneclick.
 * Guardián y dirección son opcionales (se completan post-pago).
 * Por defecto registra consentimiento de cobros recurrentes (Oneclick).
 */
export const createPurchaseSignup = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        nombre: z.string().min(2).max(160),
        email: z.string().email().max(255),
        telefono: z.string().min(8).max(40),
        direccion: z.string().max(255).nullable().optional(),
        plan: planKeySchema.transform(normalizePlanKey),
        periodo: periodoSchema,
        discountCode: z.string().trim().max(64).optional().or(z.literal("")),
        tarjetaVecinoRut: z.string().trim().max(16).optional().or(z.literal("")),
        recurringBillingConsent: z.boolean().optional().default(true),
        firstGuardian: z
          .object({
            nombre: z.string().trim().min(2).max(100),
            telefono: z.string().trim().min(8).max(40),
            parentesco: z.string().trim().min(2).max(40),
          })
          .optional(),
      })
      .parse(input),
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
    let tarjetaVecino: TarjetaVecinoEvidence | null = null;
    const rawCode = data.discountCode?.trim();
    if (rawCode) {
      const tier = lasCondesTier(rawCode);
      if (tier) {
        const rut = parseChileanRut(data.tarjetaVecinoRut ?? "");
        if (!rut) {
          throw new Error("Ingresa el RUT del titular para verificar la Tarjeta Vecino.");
        }
        const decision = await consultarTarjetaVecino(rut.formatted, tier, data.periodo);
        if (!decision.eligible) {
          throw new Error(decision.message);
        }
        tarjetaVecino = {
          tarjeta_vecino_rut: rut.formatted,
          tarjeta_vecino_estado: decision.estado.slice(0, 80),
          tarjeta_vecino_tipo: decision.tipo.slice(0, 80),
          tarjeta_vecino_checked_at: new Date().toISOString(),
        };
      }
      const resolved = await resolveDiscountForCheckout(rawCode, data.plan, data.periodo, {
        email,
      });
      discountFields = discountSignupFields(resolved);
    }

    const consentRecurring = data.recurringBillingConsent !== false;

    const payload = {
      ...basePayload,
      ...discountFields,
      ...(consentRecurring
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
      const alreadyPaid = isSignupPaidAndActive(existing);
      const updatePayload = alreadyPaid
        ? {
            nombre: basePayload.nombre,
            telefono: basePayload.telefono,
            direccion: basePayload.direccion,
            plan: basePayload.plan,
            periodo: basePayload.periodo,
            ...discountFields,
            ...(consentRecurring
              ? {
                  recurring_billing_consented_at: new Date().toISOString(),
                  recurring_billing_consent_version: RECURRING_BILLING_CONSENT_VERSION,
                }
              : {}),
          }
        : payload;

      const updated = await writeSignup("update", existing.id, updatePayload, tarjetaVecino);
      const signup = updated ?? existing;
      if (data.firstGuardian) {
        await savePendingFirstGuardian(signup.id, data.firstGuardian as PendingFirstGuardian);
      }
      return { signup, created: false, alreadyPaid };
    }

    const inserted = await writeSignup("insert", null, payload, tarjetaVecino);
    if (!inserted) throw new Error("No pudimos crear la orden de compra.");

    if (data.firstGuardian) {
      await savePendingFirstGuardian(inserted.id, data.firstGuardian as PendingFirstGuardian);
    }

    return { signup: inserted, created: true };
  });

async function writeSignup(
  mode: "insert" | "update",
  id: string | null,
  payload: SignupUpdate,
  tarjetaVecino: TarjetaVecinoEvidence | null,
) {
  const withEvidence: SignupUpdate = tarjetaVecino ? { ...payload, ...tarjetaVecino } : payload;

  const run = (body: SignupUpdate) => {
    if (mode === "insert") {
      return supabaseAdmin
        .from(CONTRACT_SIGNUPS_TABLE)
        .insert(body as SignupInsert)
        .select(CONTRACT_SIGNUP_SELECT)
        .maybeSingle();
    }
    return supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update(body)
      .eq("id", id ?? "")
      .select(CONTRACT_SIGNUP_SELECT)
      .maybeSingle();
  };

  const first = await run(withEvidence);
  if (first.error && tarjetaVecino && isMissingTarjetaVecinoColumn(first.error.message ?? "")) {
    const retry = await run(payload);
    if (retry.error) throw retry.error;
    return retry.data;
  }
  if (first.error) throw first.error;
  return first.data;
}
