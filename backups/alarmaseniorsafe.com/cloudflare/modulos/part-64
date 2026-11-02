import { c as createServerRpc } from "./createServerRpc-ChaSCZOg.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { s as seniorAccessTokenSchema, a as assertSeniorAccess } from "./senior-access-auth-Bmk7iyGS.mjs";
import { m as markSignupWhatsAppActivated } from "./install-step-sync-65QKjQIB.mjs";

import "./index.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";



import "../_libs/seroval-plugins.mjs";


import "./client.server-U_pH-Evd.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "./signups-db-JWUtXpaW.mjs";
import "./twilio-DNHuHEFY.mjs";
import "./twilio-inbound-_C02bj0d.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




const Schema = objectType({
  signupId: stringType().uuid(),
  accessToken: seniorAccessTokenSchema
});
const activateWhatsAppFromApp_createServerFn_handler = createServerRpc({
  id: "46a4a9651c3151df248984eb322707475d13cc0b0ba258591c6afc0b50104a5e",
  name: "activateWhatsAppFromApp",
  filename: "src/lib/whatsapp-activation.functions.ts"
}, (opts) => activateWhatsAppFromApp.__executeServer(opts));
const activateWhatsAppFromApp = createServerFn({
  method: "POST"
}).inputValidator((input) => Schema.parse(input)).handler(activateWhatsAppFromApp_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  return markSignupWhatsAppActivated(data.signupId);
});
export {
  activateWhatsAppFromApp_createServerFn_handler
};
