import { c as createServerRpc } from "./createServerRpc-ChaSCZOg.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { r as readInstallProgress, d as markInstallAppOpened, e as markInstallSosPrimed, g as markFallSensorPrompted } from "./install-step-sync-65QKjQIB.mjs";
import { s as seniorAccessTokenSchema, a as assertSeniorAccess } from "./senior-access-auth-Bmk7iyGS.mjs";

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




const signupSchema = objectType({
  signupId: stringType().uuid(),
  accessToken: seniorAccessTokenSchema
});
const getInstallProgress_createServerFn_handler = createServerRpc({
  id: "7250cf59222a6629bf78e657b04ea63cac9dfee7008edb64ac71b073cb8057f5",
  name: "getInstallProgress",
  filename: "src/lib/install-step.functions.ts"
}, (opts) => getInstallProgress.__executeServer(opts));
const getInstallProgress = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  signupId: stringType().uuid()
}).parse(input)).handler(getInstallProgress_createServerFn_handler, async ({
  data
}) => {
  const progress = await readInstallProgress(data.signupId);
  return progress ?? {
    installStep: "pending",
    onboardingCompleted: false,
    appOpenedAt: null,
    sosPrimedAt: null,
    fallSensorPromptedAt: null
  };
});
const reportAppOpened_createServerFn_handler = createServerRpc({
  id: "873b2cf0b78578ee868a90139361de98063bee5b8b3bbc84ca30c237a409df8c",
  name: "reportAppOpened",
  filename: "src/lib/install-step.functions.ts"
}, (opts) => reportAppOpened.__executeServer(opts));
const reportAppOpened = createServerFn({
  method: "POST"
}).inputValidator((input) => signupSchema.parse(input)).handler(reportAppOpened_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  await markInstallAppOpened(data.signupId);
  return readInstallProgress(data.signupId);
});
const reportSosPrimed_createServerFn_handler = createServerRpc({
  id: "f109b7c4d6759a9f0d49b4960c44e13366c4a1d1f01894b7143eeb71bf54f0b6",
  name: "reportSosPrimed",
  filename: "src/lib/install-step.functions.ts"
}, (opts) => reportSosPrimed.__executeServer(opts));
const reportSosPrimed = createServerFn({
  method: "POST"
}).inputValidator((input) => signupSchema.parse(input)).handler(reportSosPrimed_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  await markInstallSosPrimed(data.signupId);
  return readInstallProgress(data.signupId);
});
const reportFallSensorPrompted_createServerFn_handler = createServerRpc({
  id: "cb8c52d05c781d97ae10026983549f22966b649b134312ffc0f8e656f7866a18",
  name: "reportFallSensorPrompted",
  filename: "src/lib/install-step.functions.ts"
}, (opts) => reportFallSensorPrompted.__executeServer(opts));
const reportFallSensorPrompted = createServerFn({
  method: "POST"
}).inputValidator((input) => signupSchema.parse(input)).handler(reportFallSensorPrompted_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  await markFallSensorPrompted(data.signupId);
  return {
    ok: true
  };
});
export {
  getInstallProgress_createServerFn_handler,
  reportAppOpened_createServerFn_handler,
  reportFallSensorPrompted_createServerFn_handler,
  reportSosPrimed_createServerFn_handler
};
