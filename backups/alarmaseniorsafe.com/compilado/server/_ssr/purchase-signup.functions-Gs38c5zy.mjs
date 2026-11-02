import { c as createServerRpc } from "./createServerRpc-ChaSCZOg.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { p as periodoSchema, a as planKeySchema, n as normalizePlanKey } from "./plans-BJeLFmLc.mjs";
import { d as discountSignupFields, c as clearDiscountSignupFields } from "./discount-codes-BbIma2Cq.mjs";
import { r as resolveDiscountForCheckout } from "./discount.functions-CbzrjeJP.mjs";
import { s as savePendingFirstGuardian } from "./first-guardian-checkout-BEB7AGrd.mjs";
import { c as contractSignupPendingPayload, C as CONTRACT_SIGNUPS_TABLE, a as CONTRACT_SIGNUP_SELECT, i as isSignupPaidAndActive } from "./signups-db-JWUtXpaW.mjs";

import "./index.mjs";
import { o as objectType, s as stringType, b as booleanType, l as literalType } from "../_libs/zod.mjs";
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
import "./createSsrRpc-14pD3De2.mjs";
import "./contacts-storage-DdsYD-uQ.mjs";
import "./phone-utils-D7EH6fht.mjs";
import "./guardians.functions-BA585btN.mjs";
import "./twilio-DNHuHEFY.mjs";
import "./senior-access-auth-Bmk7iyGS.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




const RECURRING_BILLING_CONSENT_VERSION = "2026-06";
const createPurchaseSignup_createServerFn_handler = createServerRpc({
  id: "49263aa3ee9117f2df910b74868e6dffc188033bbea71c85d356956dc46dec62",
  name: "createPurchaseSignup",
  filename: "src/lib/purchase-signup.functions.ts"
}, (opts) => createPurchaseSignup.__executeServer(opts));
const createPurchaseSignup = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  nombre: stringType().min(2).max(160),
  email: stringType().email().max(255),
  telefono: stringType().min(8).max(40),
  direccion: stringType().max(255).nullable().optional(),
  plan: planKeySchema.transform(normalizePlanKey),
  periodo: periodoSchema,
  discountCode: stringType().trim().max(64).optional().or(literalType("")),
  recurringBillingConsent: booleanType().optional().default(true),
  firstGuardian: objectType({
    nombre: stringType().trim().min(2).max(100),
    telefono: stringType().trim().min(8).max(40),
    parentesco: stringType().trim().min(2).max(40)
  }).optional()
}).parse(input)).handler(createPurchaseSignup_createServerFn_handler, async ({
  data
}) => {
  const email = data.email.trim().toLowerCase();
  const basePayload = contractSignupPendingPayload({
    nombre: data.nombre,
    email,
    telefono: data.telefono,
    direccion: data.direccion,
    plan: data.plan,
    periodo: data.periodo
  });
  let discountFields = clearDiscountSignupFields();
  const rawCode = data.discountCode?.trim();
  if (rawCode) {
    const resolved = await resolveDiscountForCheckout(rawCode, data.plan, data.periodo, {
      email
    });
    discountFields = discountSignupFields(resolved);
  }
  const consentRecurring = data.recurringBillingConsent !== false;
  const payload = {
    ...basePayload,
    ...discountFields,
    ...consentRecurring ? {
      recurring_billing_consented_at: (/* @__PURE__ */ new Date()).toISOString(),
      recurring_billing_consent_version: RECURRING_BILLING_CONSENT_VERSION
    } : {
      recurring_billing_consented_at: null,
      recurring_billing_consent_version: null
    }
  };
  const {
    data: existing,
    error: existingError
  } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select(CONTRACT_SIGNUP_SELECT).eq("email", email).maybeSingle();
  if (existingError) throw existingError;
  if (existing) {
    const alreadyPaid = isSignupPaidAndActive(existing);
    const updatePayload = alreadyPaid ? {
      nombre: basePayload.nombre,
      telefono: basePayload.telefono,
      direccion: basePayload.direccion,
      plan: basePayload.plan,
      periodo: basePayload.periodo,
      ...discountFields,
      ...consentRecurring ? {
        recurring_billing_consented_at: (/* @__PURE__ */ new Date()).toISOString(),
        recurring_billing_consent_version: RECURRING_BILLING_CONSENT_VERSION
      } : {}
    } : payload;
    const {
      data: updated,
      error: updErr
    } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).update(updatePayload).eq("id", existing.id).select(CONTRACT_SIGNUP_SELECT).maybeSingle();
    if (updErr) throw updErr;
    const signup = updated ?? existing;
    if (data.firstGuardian) {
      await savePendingFirstGuardian(signup.id, data.firstGuardian);
    }
    return {
      signup,
      created: false,
      alreadyPaid
    };
  }
  const {
    data: inserted,
    error: insertError
  } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).insert(payload).select(CONTRACT_SIGNUP_SELECT).maybeSingle();
  if (insertError) throw insertError;
  if (!inserted) throw new Error("No pudimos crear la orden de compra.");
  if (data.firstGuardian) {
    await savePendingFirstGuardian(inserted.id, data.firstGuardian);
  }
  return {
    signup: inserted,
    created: true
  };
});
export {
  createPurchaseSignup_createServerFn_handler
};
