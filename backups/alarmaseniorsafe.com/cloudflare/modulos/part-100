import { c as createServerRpc } from "./createServerRpc-ChaSCZOg.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { p as periodoSchema, a as planKeySchema, n as normalizePlanKey } from "./plans-BJeLFmLc.mjs";
import { t as toPublicDiscountPreview, n as normalizeDiscountCodeInput, a as assertDiscountCodeUsable, b as buildResolvedDiscount } from "./discount-codes-BbIma2Cq.mjs";
import { C as CONTRACT_SIGNUPS_TABLE } from "./signups-db-JWUtXpaW.mjs";

import "./index.mjs";
import { o as objectType, s as stringType, l as literalType } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";



import "../_libs/seroval-plugins.mjs";


import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




const DISCOUNT_CODE_SELECT = "id,code,label,partner_slug,percent_off,applies_monthly,applies_annual,active,one_per_customer,max_redemptions,redemption_count,valid_from,valid_until,notes";
const validateInputSchema = objectType({
  code: stringType().trim().min(2).max(64),
  plan: planKeySchema.transform(normalizePlanKey),
  periodo: periodoSchema,
  email: stringType().trim().email().max(255).optional().or(literalType(""))
});
async function fetchDiscountCode(normalizedCode) {
  const {
    data,
    error
  } = await supabaseAdmin.from("discount_codes").select(DISCOUNT_CODE_SELECT).ilike("code", normalizedCode).maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}
function normalizeCustomerEmail(email) {
  return (email ?? "").trim().toLowerCase();
}
async function assertDiscountNotAlreadyUsedByCustomer(discountCodeId, email, excludeSignupId) {
  const normalizedEmail = normalizeCustomerEmail(email);
  if (!normalizedEmail) {
    throw new Error("Ingresa tu correo en el checkout para aplicar este código promocional.");
  }
  let query = supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select("id").eq("email", normalizedEmail).eq("discount_code_id", discountCodeId).eq("payment_status", "paid").limit(1);
  if (excludeSignupId) {
    query = query.neq("id", excludeSignupId);
  }
  const {
    data,
    error
  } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  if (data) {
    throw new Error("Este código promocional ya fue utilizado con tu correo. Cada usuario puede usarlo una sola vez.");
  }
}
async function resolveDiscountForCheckout(rawCode, plan, periodo, opts = {}) {
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
const validateDiscountCode_createServerFn_handler = createServerRpc({
  id: "3ad3ba7beacd948e4ae5ca2fcc6ab5862cd8dd3aff94a4120f39f878d0bde814",
  name: "validateDiscountCode",
  filename: "src/lib/discount.functions.ts"
}, (opts) => validateDiscountCode.__executeServer(opts));
const validateDiscountCode = createServerFn({
  method: "POST"
}).inputValidator((input) => validateInputSchema.parse(input)).handler(validateDiscountCode_createServerFn_handler, async ({
  data
}) => {
  try {
    const resolved = await resolveDiscountForCheckout(data.code, data.plan, data.periodo, {
      email: data.email || void 0
    });
    return {
      ok: true,
      discount: toPublicDiscountPreview(resolved)
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "No pudimos validar el código de convenio.";
    throw new Error(message);
  }
});
export {
  validateDiscountCode_createServerFn_handler
};
