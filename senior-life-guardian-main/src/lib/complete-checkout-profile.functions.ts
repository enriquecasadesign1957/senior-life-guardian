import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  clearDiscountSignupFields,
  discountSignupFields,
} from "@/lib/discount-codes";
import { resolveDiscountForCheckout } from "@/lib/discount.functions";
import {
  createFirstGuardianAfterPayment,
  savePendingFirstGuardian,
} from "@/lib/first-guardian-checkout";
import {
  CONTRACT_SIGNUP_SELECT,
  CONTRACT_SIGNUPS_TABLE,
} from "@/lib/signups-db";

const phoneField = z
  .string()
  .trim()
  .min(8, "Ingresa un teléfono válido")
  .max(40)
  .regex(/^[0-9+\s-]+$/, "Solo números");

/**
 * Completa dirección + primer guardián (+ código opcional) después del pago.
 * No altera el monto ya cobrado; el descuento solo se registra si el signup aún no tiene convenio.
 */
export const completeCheckoutProfile = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        signupId: z.string().uuid(),
        direccion: z.string().trim().max(255).optional().or(z.literal("")),
        discountCode: z.string().trim().max(64).optional().or(z.literal("")),
        guardianName: z.string().trim().min(2).max(100),
        guardianPhone: phoneField,
        guardianRelation: z.string().trim().min(2).max(40),
        seniorPhone: phoneField.optional(),
      })
      .superRefine((data, ctx) => {
        if (!data.seniorPhone) return;
        const senior = data.seniorPhone.replace(/\D/g, "").slice(-9);
        const guardian = data.guardianPhone.replace(/\D/g, "").slice(-9);
        if (senior.length >= 8 && senior === guardian) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El guardián debe ser otra persona (teléfono distinto).",
            path: ["guardianPhone"],
          });
        }
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: signup, error } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select(CONTRACT_SIGNUP_SELECT)
      .eq("id", data.signupId)
      .maybeSingle();
    if (error) throw error;
    if (!signup) throw new Error("No encontramos tu suscripción.");

    const patch: Record<string, unknown> = {};
    const address = data.direccion?.trim();
    if (address) patch.direccion = address;

    const rawCode = data.discountCode?.trim();
    if (rawCode && !signup.discount_code) {
      try {
        const resolved = await resolveDiscountForCheckout(
          rawCode,
          signup.plan,
          signup.periodo === "anual" ? "anual" : "mensual",
          { email: signup.email },
        );
        Object.assign(patch, discountSignupFields(resolved));
      } catch {
        Object.assign(patch, clearDiscountSignupFields());
        throw new Error("No pudimos validar el código institucional.");
      }
    }

    if (Object.keys(patch).length > 0) {
      const { error: updErr } = await supabaseAdmin
        .from(CONTRACT_SIGNUPS_TABLE)
        .update(patch)
        .eq("id", data.signupId);
      if (updErr) throw updErr;
    }

    await savePendingFirstGuardian(data.signupId, {
      nombre: data.guardianName,
      telefono: data.guardianPhone,
      parentesco: data.guardianRelation,
    });

    const guardianResult = await createFirstGuardianAfterPayment(data.signupId);

    return {
      ok: true as const,
      guardian: guardianResult,
    };
  });
