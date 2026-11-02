import { c as createServerRpc } from "./createServerRpc-ChaSCZOg.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { l as listFamilyContacts, M as MAX_GUARDIANS, a as addFamilyContact, u as updateFamilyContact, d as deleteFamilyContact } from "./contacts-storage-DdsYD-uQ.mjs";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { n as normalizePhoneE164 } from "./phone-utils-D7EH6fht.mjs";
import { c as sendTwilioWhatsAppWithSmsFallback } from "./twilio-DNHuHEFY.mjs";
import { s as seniorAccessTokenSchema, a as assertSeniorAccess, b as assertFamilySession } from "./senior-access-auth-Bmk7iyGS.mjs";

import { s as stringType, o as objectType, b as booleanType, n as numberType } from "../_libs/zod.mjs";
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
async function assertActiveFamilyGuardianAccess(data) {
  await assertFamilySession(data.family_member_id, data.contract_signup_id, data.session_token);
  const {
    data: member
  } = await supabaseAdmin.from("family_members").select("activo").eq("id", data.family_member_id).maybeSingle();
  if (!member?.activo) {
    throw new Error("Sesión inválida. Ingresa de nuevo al Portal Familia.");
  }
  return data.contract_signup_id;
}
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
const GUARDIAN_EXTENDED_SELECT = "id,nombre,telefono,whatsapp,parentesco,prioridad,activo,tipo_contacto,recibe_sms,recibe_whatsapp,recibe_llamada,created_at";
const GUARDIAN_BASIC_SELECT = "id,nombre,telefono,parentesco,created_at";
function isMissingColumnError(message) {
  return /column .* does not exist|Could not find the .* column/i.test(message);
}
function isMissingTableError(message) {
  return message.includes("Could not find the table") || message.includes("schema cache") || message.includes("PGRST205") || message.includes("42P01");
}
function familyContactToGuardian(contact) {
  return normalizeGuardianRow({
    ...contact,
    whatsapp: null,
    prioridad: 1,
    activo: true,
    tipo_contacto: "familiar",
    recibe_sms: true,
    recibe_whatsapp: true,
    recibe_llamada: true
  });
}
function normalizeGuardianRow(row) {
  return {
    id: String(row.id),
    nombre: String(row.nombre ?? ""),
    telefono: String(row.telefono ?? ""),
    whatsapp: row.whatsapp == null ? null : String(row.whatsapp),
    parentesco: String(row.parentesco ?? ""),
    prioridad: typeof row.prioridad === "number" ? row.prioridad : 1,
    activo: typeof row.activo === "boolean" ? row.activo : true,
    tipo_contacto: String(row.tipo_contacto ?? "familiar"),
    recibe_sms: typeof row.recibe_sms === "boolean" ? row.recibe_sms : true,
    recibe_whatsapp: typeof row.recibe_whatsapp === "boolean" ? row.recibe_whatsapp : true,
    recibe_llamada: typeof row.recibe_llamada === "boolean" ? row.recibe_llamada : true,
    created_at: String(row.created_at ?? "")
  };
}
async function fetchGuardiansForSignup(signupId) {
  const extended = await supabaseAdmin.from("emergency_contacts").select(GUARDIAN_EXTENDED_SELECT).eq("contract_signup_id", signupId).order("prioridad", {
    ascending: true
  }).order("created_at", {
    ascending: true
  });
  if (!extended.error) {
    return (extended.data ?? []).map((row) => normalizeGuardianRow(row));
  }
  const errMsg = extended.error.message ?? "";
  if (isMissingTableError(errMsg)) {
    const contacts = await listFamilyContacts(signupId);
    return contacts.map(familyContactToGuardian);
  }
  if (!isMissingColumnError(errMsg)) {
    throw extended.error;
  }
  const basic = await supabaseAdmin.from("emergency_contacts").select(GUARDIAN_BASIC_SELECT).eq("contract_signup_id", signupId).order("created_at", {
    ascending: true
  });
  if (basic.error) {
    if (isMissingTableError(basic.error.message ?? "")) {
      const contacts = await listFamilyContacts(signupId);
      return contacts.map(familyContactToGuardian);
    }
    throw basic.error;
  }
  return (basic.data ?? []).map((row) => normalizeGuardianRow(row));
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
const listGuardians_createServerFn_handler = createServerRpc({
  id: "3967a73ccc758db45cb7c6478ab42df1a6208f305774be3cd611e4ae07cd1235",
  name: "listGuardians",
  filename: "src/lib/guardians.functions.ts"
}, (opts) => listGuardians.__executeServer(opts));
const listGuardians = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType(seniorAuthFields).parse(input)).handler(listGuardians_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  const guardians = await fetchGuardiansForSignup(data.signupId);
  return {
    guardians
  };
});
async function guardianCount(signupId) {
  const {
    count,
    error
  } = await supabaseAdmin.from("emergency_contacts").select("id", {
    count: "exact",
    head: true
  }).eq("contract_signup_id", signupId);
  if (!error) return count ?? 0;
  if (isMissingTableError(error.message ?? "")) {
    return (await listFamilyContacts(signupId)).length;
  }
  throw error;
}
async function performAddGuardian(signupId, guardian) {
  if (await guardianCount(signupId) >= MAX_GUARDIANS) {
    throw new Error(`Máximo ${MAX_GUARDIANS} guardianes.`);
  }
  const tel = normalizePhoneE164(guardian.telefono);
  if (!tel) throw new Error("Teléfono inválido.");
  const wa = guardian.whatsapp ? normalizePhoneE164(guardian.whatsapp) : null;
  const fullRow = {
    contract_signup_id: signupId,
    nombre: guardian.nombre,
    telefono: tel,
    whatsapp: wa,
    parentesco: guardian.parentesco,
    prioridad: guardian.prioridad,
    activo: guardian.activo,
    tipo_contacto: guardian.tipo_contacto,
    recibe_sms: guardian.recibe_sms,
    recibe_whatsapp: guardian.recibe_whatsapp,
    recibe_llamada: guardian.recibe_llamada
  };
  let row = null;
  let insertResult = await supabaseAdmin.from("emergency_contacts").insert(fullRow).select("id").single();
  if (insertResult.error) {
    const insertErr = insertResult.error.message ?? "";
    if (isMissingTableError(insertErr)) {
      const saved = await addFamilyContact(signupId, {
        nombre: guardian.nombre,
        telefono: tel,
        parentesco: guardian.parentesco
      });
      if (!saved.ok || !saved.contact) throw new Error(saved.error ?? "save_failed");
      row = {
        id: saved.contact.id
      };
    } else if (isMissingColumnError(insertErr)) {
      insertResult = await supabaseAdmin.from("emergency_contacts").insert({
        contract_signup_id: signupId,
        nombre: guardian.nombre,
        telefono: tel,
        parentesco: guardian.parentesco
      }).select("id").single();
      if (insertResult.error) throw insertResult.error;
      row = insertResult.data;
    } else {
      throw insertResult.error;
    }
  } else {
    row = insertResult.data;
  }
  if (!row) throw new Error("save_failed");
  try {
    const {
      data: existing
    } = await supabaseAdmin.from("family_members").select("id").eq("contract_signup_id", signupId).eq("telefono", tel).maybeSingle();
    if (!existing) {
      await supabaseAdmin.from("family_members").insert({
        contract_signup_id: signupId,
        nombre: guardian.nombre,
        telefono: tel,
        parentesco: guardian.parentesco
      });
    }
  } catch {
  }
  try {
    const {
      data: senior
    } = await supabaseAdmin.from("contract_signups").select("nombre").eq("id", signupId).maybeSingle();
    await sendGuardianInvite({
      guardianTel: tel,
      guardianWa: wa,
      guardianName: guardian.nombre,
      seniorName: senior?.nombre ?? "Tu familiar",
      parentesco: guardian.parentesco,
      signupId,
      guardianId: row.id
    });
  } catch {
  }
  return {
    id: row.id
  };
}
async function performUpdateGuardian(signupId, id, guardian) {
  const patch = {
    ...guardian
  };
  if (typeof patch.telefono === "string") {
    const t = normalizePhoneE164(patch.telefono);
    if (!t) throw new Error("Teléfono inválido.");
    patch.telefono = t;
  }
  if (typeof patch.whatsapp === "string") {
    patch.whatsapp = normalizePhoneE164(patch.whatsapp);
  }
  const {
    error
  } = await supabaseAdmin.from("emergency_contacts").update(patch).eq("id", id).eq("contract_signup_id", signupId);
  if (error) {
    if (isMissingTableError(error.message ?? "")) {
      const existing = (await listFamilyContacts(signupId)).find((c) => c.id === id);
      if (!existing) throw new Error("Guardián no encontrado.");
      const saved = await updateFamilyContact(signupId, id, {
        nombre: String(patch.nombre ?? existing.nombre),
        telefono: String(patch.telefono ?? existing.telefono),
        parentesco: String(patch.parentesco ?? existing.parentesco)
      });
      if (!saved.ok) throw new Error(saved.error ?? "update_failed");
      return {
        ok: true
      };
    }
    throw error;
  }
  return {
    ok: true
  };
}
async function performDeleteGuardian(signupId, id) {
  const {
    error
  } = await supabaseAdmin.from("emergency_contacts").delete().eq("id", id).eq("contract_signup_id", signupId);
  if (error) {
    if (isMissingTableError(error.message ?? "")) {
      const saved = await deleteFamilyContact(signupId, id);
      if (!saved.ok) throw new Error(saved.error ?? "delete_failed");
      return {
        ok: true
      };
    }
    throw error;
  }
  return {
    ok: true
  };
}
async function performToggleGuardianActive(signupId, id, activo) {
  const {
    error
  } = await supabaseAdmin.from("emergency_contacts").update({
    activo
  }).eq("id", id).eq("contract_signup_id", signupId);
  if (error) {
    if (isMissingTableError(error.message ?? "")) {
      return {
        ok: true
      };
    }
    throw error;
  }
  return {
    ok: true
  };
}
const addGuardian_createServerFn_handler = createServerRpc({
  id: "cda831f9caa83cf01f60daed672052117b1e372271f35770066f0698512821c0",
  name: "addGuardian",
  filename: "src/lib/guardians.functions.ts"
}, (opts) => addGuardian.__executeServer(opts));
const addGuardian = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  guardian: guardianInput
}).parse(input)).handler(addGuardian_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  return performAddGuardian(data.signupId, data.guardian);
});
const updateGuardian_createServerFn_handler = createServerRpc({
  id: "be96532580220357b9a595387044d6d5b95b8dd7dca128dfcfa860c8eec42774",
  name: "updateGuardian",
  filename: "src/lib/guardians.functions.ts"
}, (opts) => updateGuardian.__executeServer(opts));
const updateGuardian = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  id: idSchema,
  guardian: guardianInput.partial()
}).parse(input)).handler(updateGuardian_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  return performUpdateGuardian(data.signupId, data.id, data.guardian);
});
const deleteGuardian_createServerFn_handler = createServerRpc({
  id: "e6d341a323421c0d809d9a880176cc6843cb27f7387fd1d4ac3d9e4ddccdd78a",
  name: "deleteGuardian",
  filename: "src/lib/guardians.functions.ts"
}, (opts) => deleteGuardian.__executeServer(opts));
const deleteGuardian = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  id: idSchema
}).parse(input)).handler(deleteGuardian_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  return performDeleteGuardian(data.signupId, data.id);
});
const toggleGuardianActive_createServerFn_handler = createServerRpc({
  id: "0e9514cc9454dd757190c093d8b6402ba35afc0bb2b1a2408a032a8ef903c1c0",
  name: "toggleGuardianActive",
  filename: "src/lib/guardians.functions.ts"
}, (opts) => toggleGuardianActive.__executeServer(opts));
const toggleGuardianActive = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...seniorAuthFields,
  id: idSchema,
  activo: booleanType()
}).parse(input)).handler(toggleGuardianActive_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  return performToggleGuardianActive(data.signupId, data.id, data.activo);
});
const listGuardiansForFamily_createServerFn_handler = createServerRpc({
  id: "122b4d2c35d5f4c0bdf92dd76d25909e9b21b09afa20d1357066e2b624bd2dde",
  name: "listGuardiansForFamily",
  filename: "src/lib/guardians.functions.ts"
}, (opts) => listGuardiansForFamily.__executeServer(opts));
const listGuardiansForFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType(familySessionFields).parse(input)).handler(listGuardiansForFamily_createServerFn_handler, async ({
  data
}) => {
  const signupId = await assertActiveFamilyGuardianAccess(data);
  const guardians = await fetchGuardiansForSignup(signupId);
  return {
    guardians
  };
});
const addGuardianForFamily_createServerFn_handler = createServerRpc({
  id: "c277e653cfcaf353f1063a817054e616931d8c904f941242901bd7ee3d59c27f",
  name: "addGuardianForFamily",
  filename: "src/lib/guardians.functions.ts"
}, (opts) => addGuardianForFamily.__executeServer(opts));
const addGuardianForFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...familySessionFields,
  guardian: guardianInput
}).parse(input)).handler(addGuardianForFamily_createServerFn_handler, async ({
  data
}) => {
  const signupId = await assertActiveFamilyGuardianAccess(data);
  return performAddGuardian(signupId, data.guardian);
});
const updateGuardianForFamily_createServerFn_handler = createServerRpc({
  id: "18121f8ba5e79db70a487455e310109dbdd4ffb9cb9ca514d4d5ebec438dd397",
  name: "updateGuardianForFamily",
  filename: "src/lib/guardians.functions.ts"
}, (opts) => updateGuardianForFamily.__executeServer(opts));
const updateGuardianForFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...familySessionFields,
  id: idSchema,
  guardian: guardianInput.partial()
}).parse(input)).handler(updateGuardianForFamily_createServerFn_handler, async ({
  data
}) => {
  const signupId = await assertActiveFamilyGuardianAccess(data);
  return performUpdateGuardian(signupId, data.id, data.guardian);
});
const deleteGuardianForFamily_createServerFn_handler = createServerRpc({
  id: "9c56cc837291f0bd3826bbc81bf0b24e052e9c52e00564856ca0d8264773c450",
  name: "deleteGuardianForFamily",
  filename: "src/lib/guardians.functions.ts"
}, (opts) => deleteGuardianForFamily.__executeServer(opts));
const deleteGuardianForFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...familySessionFields,
  id: idSchema
}).parse(input)).handler(deleteGuardianForFamily_createServerFn_handler, async ({
  data
}) => {
  const signupId = await assertActiveFamilyGuardianAccess(data);
  return performDeleteGuardian(signupId, data.id);
});
const toggleGuardianActiveForFamily_createServerFn_handler = createServerRpc({
  id: "4302044dc15b603feee5ce7c90c04e40e5ae43fe1b93e0ca2151577daa83fea5",
  name: "toggleGuardianActiveForFamily",
  filename: "src/lib/guardians.functions.ts"
}, (opts) => toggleGuardianActiveForFamily.__executeServer(opts));
const toggleGuardianActiveForFamily = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  ...familySessionFields,
  id: idSchema,
  activo: booleanType()
}).parse(input)).handler(toggleGuardianActiveForFamily_createServerFn_handler, async ({
  data
}) => {
  const signupId = await assertActiveFamilyGuardianAccess(data);
  return performToggleGuardianActive(signupId, data.id, data.activo);
});
export {
  addGuardianForFamily_createServerFn_handler,
  addGuardian_createServerFn_handler,
  deleteGuardianForFamily_createServerFn_handler,
  deleteGuardian_createServerFn_handler,
  listGuardiansForFamily_createServerFn_handler,
  listGuardians_createServerFn_handler,
  toggleGuardianActiveForFamily_createServerFn_handler,
  toggleGuardianActive_createServerFn_handler,
  updateGuardianForFamily_createServerFn_handler,
  updateGuardian_createServerFn_handler
};
