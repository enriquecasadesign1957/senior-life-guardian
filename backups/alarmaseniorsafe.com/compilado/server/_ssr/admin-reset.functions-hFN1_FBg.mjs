import { c as createServerRpc } from "./createServerRpc-ChaSCZOg.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { a as assertAdminPin } from "./admin-auth-5OIH6Qjw.mjs";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { C as CONTRACT_SIGNUPS_TABLE } from "./signups-db-JWUtXpaW.mjs";

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
const resetTestData_createServerFn_handler = createServerRpc({
  id: "303d4d806158d51b2bd7f29802806d4cc9b23a0448575e3a8cceaaadaf5faf45",
  name: "resetTestData",
  filename: "src/lib/admin-reset.functions.ts"
}, (opts) => resetTestData.__executeServer(opts));
const resetTestData = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  confirm: literalType("RESET"),
  pin: stringType().min(1).max(64)
}).parse(input)).handler(resetTestData_createServerFn_handler, async ({
  data
}) => {
  assertAdminPin(data.pin);
  const {
    data: testSignups,
    error: selErr
  } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select("id,email").or("payment_status.eq.trial,purchase_mode.eq.trial").neq("subscription_status", "active");
  if (selErr) throw selErr;
  const ids = (testSignups ?? []).map((s) => s.id);
  const emails = (testSignups ?? []).map((s) => s.email);
  if (ids.length === 0) {
    return {
      deleted: 0,
      emails: [],
      message: "No hay datos de prueba para eliminar."
    };
  }
  const {
    error: ecErr
  } = await supabaseAdmin.from("emergency_contacts").delete().in("contract_signup_id", ids);
  if (ecErr) throw ecErr;
  const {
    error: pinErr
  } = await supabaseAdmin.from("user_pins").delete().in("contract_signup_id", ids);
  if (pinErr) throw pinErr;
  const {
    error: wtErr
  } = await supabaseAdmin.from("webpay_transactions").delete().in("contract_signup_id", ids);
  if (wtErr) throw wtErr;
  const {
    error: tsErr
  } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).delete().in("id", ids);
  if (tsErr) throw tsErr;
  return {
    deleted: ids.length,
    emails,
    message: `Eliminados ${ids.length} registros de prueba.`
  };
});
const resetMyAccountData_createServerFn_handler = createServerRpc({
  id: "c7d01bf199875a53070189b5b003f24d77b88e339e7eb0af33ca1f493354124f",
  name: "resetMyAccountData",
  filename: "src/lib/admin-reset.functions.ts"
}, (opts) => resetMyAccountData.__executeServer(opts));
const resetMyAccountData = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  confirm: literalType("RESET"),
  email: stringType().email().max(255),
  pin: stringType().min(1).max(64)
}).parse(input)).handler(resetMyAccountData_createServerFn_handler, async ({
  data
}) => {
  assertAdminPin(data.pin);
  const email = data.email.trim().toLowerCase();
  const {
    data: signup,
    error: selErr
  } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select("id,email,nombre,payment_status,subscription_status").eq("email", email).maybeSingle();
  if (selErr) throw selErr;
  if (!signup) {
    return {
      ok: false,
      message: `No se encontró ninguna cuenta con el email ${email}.`
    };
  }
  const id = signup.id;
  const [{
    error: ecErr,
    count: ecCount
  }, {
    error: pinErr,
    count: pinCount
  }, {
    error: alErr,
    count: alCount
  }] = await Promise.all([supabaseAdmin.from("emergency_contacts").delete({
    count: "exact"
  }).eq("contract_signup_id", id), supabaseAdmin.from("user_pins").delete({
    count: "exact"
  }).eq("contract_signup_id", id), supabaseAdmin.from("alert_logs").delete({
    count: "exact"
  }).eq("contract_signup_id", id)]);
  if (ecErr) throw ecErr;
  if (pinErr) throw pinErr;
  if (alErr) throw alErr;
  const {
    error: updErr
  } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).update({
    onboarding_completed: false,
    whatsapp_activated: false,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", id);
  if (updErr) throw updErr;
  return {
    ok: true,
    email: signup.email,
    nombre: signup.nombre,
    contactsDeleted: ecCount ?? 0,
    pinsDeleted: pinCount ?? 0,
    alertsDeleted: alCount ?? 0,
    message: `Cuenta ${signup.email} lista para repetir pruebas. Mantenida en backend (pagos intactos).`
  };
});
export {
  resetMyAccountData_createServerFn_handler,
  resetTestData_createServerFn_handler
};
