import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizePlanKey, planAmount, planKeySchema, periodoSchema } from "@/lib/plans";
import {
  assertDiscountCodeUsable,
  buildResolvedDiscount,
  normalizeDiscountCodeInput,
  toPublicDiscountPreview,
  type DiscountCodeRow,
} from "@/lib/discount-codes";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";

const DISCOUNT_CODE_SELECT =
  "id,code,label,partner_slug,percent_off,applies_monthly,applies_annual,active,one_per_customer,max_redemptions,redemption_count,valid_from,valid_until,notes";

const validateInputSchema = z.object({
  code: z.string().trim().min(2).max(64),
  plan: planKeySchema.transform(normalizePlanKey),
  periodo: periodoSchema,
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
});

export type ResolveDiscountOptions = {
  email?: string | null;
  /** Excluye este signup al comprobar uso previo (revalidación de pago). */
  excludeSignupId?: string | null;
  /** Si el signup ya pagó, promos one_per_customer no aplican de nuevo (renovaciones). */
  signupAlreadyPaid?: boolean;
};

async function fetchDiscountCode(normalizedCode: string): Promise<DiscountCodeRow | null> {
  const { data, error } = await supabaseAdmin
    .from("discount_codes")
    .select(DISCOUNT_CODE_SELECT)
    .ilike("code", normalizedCode)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as DiscountCodeRow | null) ?? null;
}

function normalizeCustomerEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

/** Bloquea reutilización del mismo código por el mismo correo tras un pago confirmado. */
export async function assertDiscountNotAlreadyUsedByCustomer(
  discountCodeId: string,
  email: string,
  excludeSignupId?: string | null,
): Promise<void> {
  const normalizedEmail = normalizeCustomerEmail(email);
  if (!normalizedEmail) {
    throw new Error("Ingresa tu correo en el checkout para aplicar este código promocional.");
  }

  let query = supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("id")
    .eq("email", normalizedEmail)
    .eq("discount_code_id", discountCodeId)
    .eq("payment_status", "paid")
    .limit(1);

  if (excludeSignupId) {
    query = query.neq("id", excludeSignupId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  if (data) {
    throw new Error(
      "Este código promocional ya fue utilizado con tu correo. Cada usuario puede usarlo una sola vez.",
    );
  }
}

export async function resolveDiscountForCheckout(
  rawCode: string,
  plan: string,
  periodo: z.infer<typeof periodoSchema>,
  opts: ResolveDiscountOptions = {},
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

  if (row.one_per_customer && opts.signupAlreadyPaid) {
    throw new Error("Esta promoción aplica solo al primer pago. Las renovaciones usan el precio regular.");
  }

  if (row.one_per_customer) {
    const email = normalizeCustomerEmail(opts.email);
    if (!email) {
      throw new Error("Ingresa tu correo en el checkout para aplicar este código promocional.");
    }
    await assertDiscountNotAlreadyUsedByCustomer(row.id, email, opts.excludeSignupId);
  }

  return buildResolvedDiscount(row, plan, periodo);
}

/** Monto a cobrar en Webpay/Oneclick según signup y estado de pago. */
export async function resolveChargeAmountForSignup(
  signup: {
    id?: string;
    plan: string | null;
    periodo: string | null;
    discount_code: string | null;
    list_price: number | null;
    discount_percent: number | null;
    payment_status?: string | null;
    email?: string | null;
  },
  plan: string,
  periodo: "mensual" | "anual",
): Promise<number> {
  const normalizedPlan = normalizePlanKey(plan);
  const listPrice = planAmount(normalizedPlan, periodo);

  if (!signup.discount_code?.trim()) {
    return listPrice;
  }

  const alreadyPaid = signup.payment_status === "paid";

  if (alreadyPaid) {
    const row = await fetchDiscountCode(normalizeDiscountCodeInput(signup.discount_code));
    if (row?.one_per_customer) {
      return listPrice;
    }
  }

  try {
    const resolved = await resolveDiscountForCheckout(
      signup.discount_code,
      normalizedPlan,
      periodo,
      {
        email: signup.email,
        excludeSignupId: signup.id,
        signupAlreadyPaid: alreadyPaid,
      },
    );
    return resolved.finalPrice;
  } catch {
    return listPrice;
  }
}

/** Valida un código de convenio municipal y devuelve el precio con descuento. */
export const validateDiscountCode = createServerFn({ method: "POST" })
  .inputValidator((input) => validateInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const resolved = await resolveDiscountForCheckout(data.code, data.plan, data.periodo, {
        email: data.email || undefined,
      });
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
