import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizePlanKey, planKeySchema, periodoSchema } from "@/lib/plans";
import {
  assertDiscountCodeUsable,
  buildResolvedDiscount,
  normalizeDiscountCodeInput,
  toPublicDiscountPreview,
  type DiscountCodeRow,
} from "@/lib/discount-codes";

const validateInputSchema = z.object({
  code: z.string().trim().min(2).max(64),
  plan: planKeySchema.transform(normalizePlanKey),
  periodo: periodoSchema,
});

async function fetchDiscountCode(normalizedCode: string): Promise<DiscountCodeRow | null> {
  const { data, error } = await supabaseAdmin
    .from("discount_codes")
    .select(
      "id,code,label,partner_slug,percent_off,applies_monthly,applies_annual,active,max_redemptions,redemption_count,valid_from,valid_until,notes",
    )
    .ilike("code", normalizedCode)
    .maybeSingle();

    if (error) throw new Error(error.message);
  return (data as DiscountCodeRow | null) ?? null;
}

export async function resolveDiscountForCheckout(
  rawCode: string,
  plan: string,
  periodo: z.infer<typeof periodoSchema>,
) {
  const normalizedCode = normalizeDiscountCodeInput(rawCode);
  if (!normalizedCode) {
    throw new Error("Ingresa un código de convenio.");
  }

  const row = await fetchDiscountCode(normalizedCode);
  if (!row) {
    throw new Error("Código no válido. Verifica e intenta nuevamente.");
  }

  assertDiscountCodeUsable(row, periodo);
  return buildResolvedDiscount(row, plan, periodo);
}

/** Valida un código de convenio municipal y devuelve el precio con descuento. */
export const validateDiscountCode = createServerFn({ method: "POST" })
  .inputValidator((input) => validateInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const resolved = await resolveDiscountForCheckout(data.code, data.plan, data.periodo);
      return {
        ok: true as const,
        discount: toPublicDiscountPreview(resolved),
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No pudimos validar el código de convenio.";
      throw new Error(message);
    }
  });

/** Incrementa el contador de uso tras un pago autorizado. */
export async function recordDiscountRedemption(signup: {
  discount_code_id: string | null;
  payment_status?: string | null;
}) {
  if (!signup.discount_code_id || signup.payment_status === "paid") return;

  const { data: row, error: fetchErr } = await supabaseAdmin
    .from("discount_codes")
    .select("id,redemption_count")
    .eq("id", signup.discount_code_id)
    .maybeSingle();
  if (fetchErr || !row) return;

  await supabaseAdmin
    .from("discount_codes")
    .update({ redemption_count: (row.redemption_count ?? 0) + 1 })
    .eq("id", row.id);
}
