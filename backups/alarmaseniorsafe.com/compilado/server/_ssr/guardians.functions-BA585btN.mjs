import { c as createSsrRpc } from "./createSsrRpc-14pD3De2.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { c as sendTwilioWhatsAppWithSmsFallback } from "./twilio-DNHuHEFY.mjs";
import { s as seniorAccessTokenSchema } from "./senior-access-auth-Bmk7iyGS.mjs";
import { o as objectType, b as booleanType, s as stringType, n as numberType } from "../_libs/zod.mjs";
const idSchema = stringType().uuid();
const seniorAuthFields = {
  signupId: idSchema,
  accessToken: seniorAccessTokenSchema
};
const familySessionFields = {
  family_member_id: idSchema,
  contract_signup_id: idSchema,
  session_token: seniorAccessTokenSchema
};
const PORTAL_FAMILIA_URL = "https://alarmaseniorsafe.cl/familia";
async function sendGuardianInvite(opts) {
  const body = `Hola ${opts.guardianName}, ${opts.seniorName} te ha designado como su guardián en Senior Safe (como ${opts.parentesco}). Recibirás alertas de emergencia y podrás ver su estado en el Portal Familia: ${PORTAL_FAMILIA_URL} — Ingresa con este número de teléfono para recibir tu código de acceso.`;
  const waNumber = opts.guardianWa || opts.guardianTel;
  const {
    whatsappOk: okWA,
    smsOk: okSMS
  } = await sendTwilioWhatsAppWithSmsFallback(opts.guardianTel, body, waNumber);
  try {
    await supabaseAdmin.from("family_access_log").insert({
      family_member_id: null,
      contract_signup_id: opts.signupId,
      action: "guardian_invite_sent",
      metadata: {
        guardian_contact_id: opts.guardianId,
        telefono: opts.guardianTel,
        whatsapp_ok: okWA,
        sms_ok: okSMS,
        portal_url: PORTAL_FAMILIA_URL
      }
    });
  } catch {
  }
}
const guardianInput = objectType({
  nombre: stringType().trim().min(1).max(160),
  telefono: stringType().trim().min(4).max(40),
  whatsapp: stringType().trim().max(40).optional().nullable(),
  parentesco: stringType().trim().min(1).max(60),
  prioridad: numberType().int().min(1).max(10).default(1),
  activo: booleanType().default(true),
  tipo_contacto: stringType().trim().max(40).default("familiar"),
  recibe_sms: booleanType().default(true),
  recibe_whatsapp: booleanType().default(true),
  recibe_llamada: booleanType().default(true)
});
createServerFn({
  method: "POST"
}).inputValidator((input) => objectType(seniorAuthFields).parse(input)).handler(createSsrRpc("3967a73ccc758db45cb7c6478ab42df1a6208f305774be3cd611e4ae07cd1235"));
createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  guardian: guardianInput
}).parse(input)).handler(createSsrRpc("cda831f9caa83cf01f60daed672052117b1e372271f35770066f0698512821c0"));
createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  id: idSchema,
  guardian: guardianInput.partial()
}).parse(input)).handler(createSsrRpc("be96532580220357b9a595387044d6d5b95b8dd7dca128dfcfa860c8eec42774"));
createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  id: idSchema
}).parse(input)).handler(createSsrRpc("e6d341a323421c0d809d9a880176cc6843cb27f7387fd1d4ac3d9e4ddccdd78a"));
createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  id: idSchema,
  activo: booleanType()
}).parse(input)).handler(createSsrRpc("0e9514cc9454dd757190c093d8b6402ba35afc0bb2b1a2408a032a8ef903c1c0"));
const listGuardiansForFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType(familySessionFields).parse(input)).handler(createSsrRpc("122b4d2c35d5f4c0bdf92dd76d25909e9b21b09afa20d1357066e2b624bd2dde"));
const addGuardianForFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...familySessionFields,
  guardian: guardianInput
}).parse(input)).handler(createSsrRpc("c277e653cfcaf353f1063a817054e616931d8c904f941242901bd7ee3d59c27f"));
const updateGuardianForFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...familySessionFields,
  id: idSchema,
  guardian: guardianInput.partial()
}).parse(input)).handler(createSsrRpc("18121f8ba5e79db70a487455e310109dbdd4ffb9cb9ca514d4d5ebec438dd397"));
const deleteGuardianForFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...familySessionFields,
  id: idSchema
}).parse(input)).handler(createSsrRpc("9c56cc837291f0bd3826bbc81bf0b24e052e9c52e00564856ca0d8264773c450"));
const toggleGuardianActiveForFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...familySessionFields,
  id: idSchema,
  activo: booleanType()
}).parse(input)).handler(createSsrRpc("4302044dc15b603feee5ce7c90c04e40e5ae43fe1b93e0ca2151577daa83fea5"));
export {
  addGuardianForFamily as a,
  deleteGuardianForFamily as d,
  listGuardiansForFamily as l,
  sendGuardianInvite as s,
  toggleGuardianActiveForFamily as t,
  updateGuardianForFamily as u
};
