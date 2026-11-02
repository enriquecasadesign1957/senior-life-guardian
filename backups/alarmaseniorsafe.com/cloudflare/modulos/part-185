import { c as createServerRpc } from "./createServerRpc-ChaSCZOg.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { a as assertAdminPin } from "./admin-auth-5OIH6Qjw.mjs";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { n as normalizeDiscountCodeInput } from "./discount-codes-BbIma2Cq.mjs";

import "./index.mjs";
import { o as objectType, s as stringType, n as numberType, b as booleanType } from "../_libs/zod.mjs";
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
import "./plans-BJeLFmLc.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




const pinSchema = objectType({
  pin: stringType().min(1).max(64)
});
const createSchema = pinSchema.extend({
  code: stringType().trim().min(2).max(64),
  label: stringType().trim().min(2).max(200),
  partner_slug: stringType().trim().min(2).max(64),
  percent_off: numberType().int().min(1).max(100),
  applies_monthly: booleanType().default(true),
  applies_annual: booleanType().default(true),
  active: booleanType().default(true),
  one_per_customer: booleanType().default(false),
  max_redemptions: numberType().int().min(1).nullable().optional(),
  valid_from: stringType().datetime().nullable().optional(),
  valid_until: stringType().datetime().nullable().optional(),
  notes: stringType().trim().max(2e3).nullable().optional()
});
const updateSchema = pinSchema.extend({
  id: stringType().uuid(),
  active: booleanType().optional(),
  max_redemptions: numberType().int().min(1).nullable().optional(),
  valid_until: stringType().datetime().nullable().optional(),
  notes: stringType().trim().max(2e3).nullable().optional()
});
const DISCOUNT_SELECT = "id,code,label,partner_slug,percent_off,applies_monthly,applies_annual,active,one_per_customer,max_redemptions,redemption_count,valid_from,valid_until,notes,created_at,updated_at";
const adminListDiscountCodes_createServerFn_handler = createServerRpc({
  id: "30aef816d2dd9d7269bc3ef865425125cabc7aadea0fa3df219b22cb1b8daae3",
  name: "adminListDiscountCodes",
  filename: "src/lib/admin-discount.functions.ts"
}, (opts) => adminListDiscountCodes.__executeServer(opts));
const adminListDiscountCodes = createServerFn({
  method: "POST"
}).inputValidator((input) => pinSchema.parse(input)).handler(adminListDiscountCodes_createServerFn_handler, async ({
  data
}) => {
  assertAdminPin(data.pin);
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("discount_codes").select(DISCOUNT_SELECT).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    ok: true,
    codes: rows ?? []
  };
});
const adminCreateDiscountCode_createServerFn_handler = createServerRpc({
  id: "fef21ae8725155f7665a0a68200b91ed27ec5ce45745f274849624a3f90e49d3",
  name: "adminCreateDiscountCode",
  filename: "src/lib/admin-discount.functions.ts"
}, (opts) => adminCreateDiscountCode.__executeServer(opts));
const adminCreateDiscountCode = createServerFn({
  method: "POST"
}).inputValidator((input) => createSchema.parse(input)).handler(adminCreateDiscountCode_createServerFn_handler, async ({
  data
}) => {
  assertAdminPin(data.pin);
  const code = normalizeDiscountCodeInput(data.code);
  if (!code) throw new Error("Código inválido.");
  const {
    data: existing
  } = await supabaseAdmin.from("discount_codes").select("id").ilike("code", code).maybeSingle();
  if (existing) throw new Error("Ya existe un código con ese nombre.");
  const {
    data: row,
    error
  } = await supabaseAdmin.from("discount_codes").insert({
    code,
    label: data.label,
    partner_slug: data.partner_slug,
    percent_off: data.percent_off,
    applies_monthly: data.applies_monthly,
    applies_annual: data.applies_annual,
    active: data.active,
    one_per_customer: data.one_per_customer,
    max_redemptions: data.max_redemptions ?? null,
    valid_from: data.valid_from ?? null,
    valid_until: data.valid_until ?? null,
    notes: data.notes ?? null
  }).select(DISCOUNT_SELECT).single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    code: row
  };
});
const adminUpdateDiscountCode_createServerFn_handler = createServerRpc({
  id: "37f1021d63dc8699956e8d92b927546dcb286d1d65a9561708627ee284f1862d",
  name: "adminUpdateDiscountCode",
  filename: "src/lib/admin-discount.functions.ts"
}, (opts) => adminUpdateDiscountCode.__executeServer(opts));
const adminUpdateDiscountCode = createServerFn({
  method: "POST"
}).inputValidator((input) => updateSchema.parse(input)).handler(adminUpdateDiscountCode_createServerFn_handler, async ({
  data
}) => {
  assertAdminPin(data.pin);
  const patch = {};
  if (data.active !== void 0) patch.active = data.active;
  if (data.max_redemptions !== void 0) patch.max_redemptions = data.max_redemptions;
  if (data.valid_until !== void 0) patch.valid_until = data.valid_until;
  if (data.notes !== void 0) patch.notes = data.notes;
  if (Object.keys(patch).length === 0) {
    throw new Error("Nada que actualizar.");
  }
  const {
    data: row,
    error
  } = await supabaseAdmin.from("discount_codes").update(patch).eq("id", data.id).select(DISCOUNT_SELECT).single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    code: row
  };
});
export {
  adminCreateDiscountCode_createServerFn_handler,
  adminListDiscountCodes_createServerFn_handler,
  adminUpdateDiscountCode_createServerFn_handler
};
