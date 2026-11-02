import { c as createServerRpc } from "./createServerRpc-ChaSCZOg.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { f as fetchAppConfiguration, p as persistUserPin, r as readStoredPinHash } from "./account-lookup-CBKDZ0Aw.mjs";
import { l as listFamilyContacts, a as addFamilyContact, u as updateFamilyContact, d as deleteFamilyContact } from "./contacts-storage-DdsYD-uQ.mjs";
import { s as sendGuardianInvite } from "./guardians.functions-BA585btN.mjs";
import { s as seniorAccessTokenSchema, a as assertSeniorAccess } from "./senior-access-auth-Bmk7iyGS.mjs";
import { C as CONTRACT_SIGNUPS_TABLE } from "./signups-db-JWUtXpaW.mjs";

import "./index.mjs";
import { s as stringType, o as objectType } from "../_libs/zod.mjs";
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
import "./install-step-sync-65QKjQIB.mjs";
import "./twilio-DNHuHEFY.mjs";
import "./twilio-inbound-_C02bj0d.mjs";
import "./phone-utils-D7EH6fht.mjs";
import "./createSsrRpc-14pD3De2.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




const idSchema = stringType().uuid();
const seniorAuthFields = {
  signupId: idSchema,
  accessToken: seniorAccessTokenSchema
};
const contactInput = objectType({
  nombre: stringType().min(1).max(160),
  telefono: stringType().min(4).max(40),
  parentesco: stringType().min(1).max(60)
});
const appConfigInput = objectType({
  signupId: idSchema.optional(),
  email: stringType().email().max(255).optional(),
  telefono: stringType().min(4).max(40).optional(),
  accessToken: seniorAccessTokenSchema.optional()
}).refine((data) => Boolean(data.signupId || data.email || data.telefono), {
  message: "Se requiere una cuenta para cargar la configuración."
});
async function sendInviteBestEffort(signupId, contact) {
  try {
    const {
      data: senior
    } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select("nombre").eq("id", signupId).maybeSingle();
    await sendGuardianInvite({
      guardianTel: contact.telefono,
      guardianWa: null,
      guardianName: contact.nombre,
      seniorName: senior?.nombre ?? "Tu familiar",
      parentesco: contact.parentesco,
      signupId,
      guardianId: contact.id
    });
  } catch {
  }
}
const getAppConfiguration_createServerFn_handler = createServerRpc({
  id: "8ec988b1ec129494f6915b9e1d8d18f708b1bdc143c63ec18b9228ab06d63219",
  name: "getAppConfiguration",
  filename: "src/lib/family.functions.ts"
}, (opts) => getAppConfiguration.__executeServer(opts));
const getAppConfiguration = createServerFn({
  method: "POST"
}).inputValidator((input) => appConfigInput.parse(input)).handler(getAppConfiguration_createServerFn_handler, async ({
  data
}) => fetchAppConfiguration(data));
const listFamily_createServerFn_handler = createServerRpc({
  id: "3be681a33b33cb86fba3d4e0ac3bca20ea26b242f01edd24a4e704ecb61697cf",
  name: "listFamily",
  filename: "src/lib/family.functions.ts"
}, (opts) => listFamily.__executeServer(opts));
const listFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType(seniorAuthFields).parse(input)).handler(listFamily_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  const contacts = await listFamilyContacts(data.signupId);
  return {
    contacts
  };
});
const addFamily_createServerFn_handler = createServerRpc({
  id: "f3f1ef40414c3f47bc1651ef20f516ac2e248174c7b3eb95ad4cb3babab6e182",
  name: "addFamily",
  filename: "src/lib/family.functions.ts"
}, (opts) => addFamily.__executeServer(opts));
const addFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  contact: contactInput
}).parse(input)).handler(addFamily_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  const result = await addFamilyContact(data.signupId, data.contact);
  if (!result.ok) throw new Error(result.error);
  const row = result.contact;
  try {
    const {
      data: existingFm
    } = await supabaseAdmin.from("family_members").select("id").eq("contract_signup_id", data.signupId).eq("telefono", row.telefono).maybeSingle();
    if (!existingFm) {
      await supabaseAdmin.from("family_members").insert({
        contract_signup_id: data.signupId,
        nombre: row.nombre,
        telefono: row.telefono,
        parentesco: row.parentesco
      });
    }
  } catch {
  }
  await sendInviteBestEffort(data.signupId, row);
  return {
    contact: row
  };
});
const updateFamily_createServerFn_handler = createServerRpc({
  id: "4663d5420c2be39bc36cdeaf601b48729132d7e22f6ffcf0ea499e960cedb532",
  name: "updateFamily",
  filename: "src/lib/family.functions.ts"
}, (opts) => updateFamily.__executeServer(opts));
const updateFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  id: idSchema,
  contact: contactInput
}).parse(input)).handler(updateFamily_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  const result = await updateFamilyContact(data.signupId, data.id, data.contact);
  if (!result.ok) throw new Error(result.error);
  return {
    contact: result.contact
  };
});
const deleteFamily_createServerFn_handler = createServerRpc({
  id: "f57474d5164d60b5538080a511af550c350019658c9e3c891c9fc11b8eefb25d",
  name: "deleteFamily",
  filename: "src/lib/family.functions.ts"
}, (opts) => deleteFamily.__executeServer(opts));
const deleteFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  id: idSchema
}).parse(input)).handler(deleteFamily_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  const result = await deleteFamilyContact(data.signupId, data.id);
  if (!result.ok) throw new Error(result.error);
  return {
    ok: true
  };
});
const resendFamilyInvite_createServerFn_handler = createServerRpc({
  id: "509a9a2e3522816d5339866552bd5894e7842dc8fa764af28499cebb6a6cd464",
  name: "resendFamilyInvite",
  filename: "src/lib/family.functions.ts"
}, (opts) => resendFamilyInvite.__executeServer(opts));
const resendFamilyInvite = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  contactId: idSchema
}).parse(input)).handler(resendFamilyInvite_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  const contacts = await listFamilyContacts(data.signupId);
  const contact = contacts.find((c) => c.id === data.contactId);
  if (!contact) throw new Error("Guardián no encontrado.");
  await sendInviteBestEffort(data.signupId, contact);
  return {
    ok: true
  };
});
const setUserPin_createServerFn_handler = createServerRpc({
  id: "440e55caad90d86eb07882d142a02908fd50cdbd1b2394477f9f74ff47879d96",
  name: "setUserPin",
  filename: "src/lib/family.functions.ts"
}, (opts) => setUserPin.__executeServer(opts));
const setUserPin = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  pinHash: stringType().min(16).max(256)
}).parse(input)).handler(setUserPin_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  const result = await persistUserPin(data.signupId, data.pinHash);
  if (!result.ok) throw new Error(result.error ?? "pin_save_failed");
  return {
    ok: true
  };
});
const verifyPin_createServerFn_handler = createServerRpc({
  id: "dc9d21f4a02b80175ca7fc43528d010ae7703c94db95e67de97ae4140897b72a",
  name: "verifyPin",
  filename: "src/lib/family.functions.ts"
}, (opts) => verifyPin.__executeServer(opts));
const verifyPin = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  pinHash: stringType().min(16).max(256)
}).parse(input)).handler(verifyPin_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  const stored = await readStoredPinHash(data.signupId);
  if (!stored) return {
    ok: false,
    configured: false
  };
  return {
    ok: stored === data.pinHash,
    configured: true
  };
});
export {
  addFamily_createServerFn_handler,
  deleteFamily_createServerFn_handler,
  getAppConfiguration_createServerFn_handler,
  listFamily_createServerFn_handler,
  resendFamilyInvite_createServerFn_handler,
  setUserPin_createServerFn_handler,
  updateFamily_createServerFn_handler,
  verifyPin_createServerFn_handler
};
