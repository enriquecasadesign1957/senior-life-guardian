import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { C as CONTRACT_SIGNUPS_TABLE } from "./signups-db-JWUtXpaW.mjs";
import { e as SENIOR_SAFE_INSTALL_GUIDE_URL, P as PRODUCTION_SITE_URL } from "./index.mjs";
import { h as seniorSafeWhatsAppMeUrl } from "./twilio-DNHuHEFY.mjs";
import { n as normalizeTwilioPhone, b as isWhatsAppActivationMessage } from "./twilio-inbound-_C02bj0d.mjs";
const WHATSAPP_ACTIVATION_KEYWORD = "ACTIVAR";
const SENIOR_SAFE_CHECKOUT_URL = `${PRODUCTION_SITE_URL}/checkout?mode=contratar&plan=unico`;
function phoneLast9(phone) {
  return phone.replace(/\D/g, "").slice(-9);
}
function firstName(nombre) {
  return nombre?.split(/\s+/)?.[0] ?? "usuario";
}
async function findSignupForActivation(phone) {
  const last9 = phoneLast9(normalizeTwilioPhone(phone));
  if (last9.length < 8) return null;
  const { data: users } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select("id, nombre, telefono, payment_status, subscription_status, whatsapp_activated").limit(300);
  return (users ?? []).find((u) => {
    const t = (u.telefono || "").replace(/\D/g, "");
    return t.endsWith(last9);
  }) ?? null;
}
function isSignupPaymentComplete(paymentStatus) {
  return paymentStatus === "paid" || paymentStatus === "comp";
}
function isActivationKeyword(body) {
  return isWhatsAppActivationMessage((body || "").trim().toUpperCase());
}
function whatsAppActivarUrl() {
  return seniorSafeWhatsAppMeUrl(WHATSAPP_ACTIVATION_KEYWORD);
}
function whatsAppAnyReplyUrl() {
  return seniorSafeWhatsAppMeUrl("Hola");
}
async function markSignupWhatsAppActivated(signupId) {
  const { data: signup, error } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select("id, payment_status, whatsapp_activated").eq("id", signupId).maybeSingle();
  if (error || !signup) {
    return { ok: false, error: "signup_not_found" };
  }
  if (!isSignupPaymentComplete(signup.payment_status)) {
    return { ok: false, error: "payment_incomplete" };
  }
  if (signup.whatsapp_activated) {
    return { ok: true, already: true };
  }
  const { error: updateErr } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).update({ whatsapp_activated: true }).eq("id", signupId);
  if (updateErr) {
    return { ok: false, error: "update_failed" };
  }
  await markInstallWhatsAppLinked(signupId).catch((e) => {
    console.warn("[whatsapp] install_step whatsapp_linked", e);
  });
  return { ok: true };
}
async function tryAutoActivatePaidSignup(phone) {
  const signup = await findSignupForActivation(phone);
  if (!signup || !isSignupPaymentComplete(signup.payment_status) || signup.whatsapp_activated) {
    return false;
  }
  const result = await markSignupWhatsAppActivated(signup.id);
  return result.ok;
}
async function processWhatsAppActivation(phone, body) {
  if (!isActivationKeyword(body)) return null;
  const signup = await findSignupForActivation(phone);
  if (!signup) {
    return "Senior Safe 🛡️\nPara vincular WhatsApp, primero debe contratar y pagar su plan aquí:\n" + SENIOR_SAFE_CHECKOUT_URL + "\n\nCuando confirme el pago, envíe ACTIVAR por este chat.";
  }
  if (!isSignupPaymentComplete(signup.payment_status)) {
    return "Senior Safe 🛡️\nEncontramos su registro, pero el pago aún no está confirmado.\nComplete el pago aquí:\n" + SENIOR_SAFE_CHECKOUT_URL + "\n\nLuego envíe ACTIVAR por este chat.";
  }
  if (signup.whatsapp_activated) {
    return `Senior Safe 🛡️
✅ Su WhatsApp ya está vinculado a su cuenta.
Guía de instalación: ${SENIOR_SAFE_INSTALL_GUIDE_URL}`;
  }
  const normalizedPhone = normalizeTwilioPhone(phone);
  const result = await markSignupWhatsAppActivated(signup.id);
  if (!result.ok && !result.already) {
    return "Senior Safe 🛡️\nNo pudimos vincular WhatsApp. Intenta de nuevo o escribe a hola@alarmaseniorsafe.cl";
  }
  if (normalizedPhone && normalizedPhone !== signup.telefono) {
    await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).update({ telefono: normalizedPhone }).eq("id", signup.id);
  }
  const first = firstName(signup.nombre);
  return `Senior Safe 🛡️
✅ ¡Activado, ${first}!

Sus alertas de emergencia llegarán por WhatsApp a sus contactos.
Guía de instalación: ${SENIOR_SAFE_INSTALL_GUIDE_URL}`;
}
const INSTALL_STEPS = [
  "pending",
  "paid",
  "install_link_sent",
  "whatsapp_linked",
  "app_opened",
  "ready"
];
const STEP_INDEX = {
  pending: 0,
  paid: 1,
  install_link_sent: 2,
  whatsapp_linked: 3,
  app_opened: 4,
  ready: 5
};
function installStepIndex(step) {
  if (!step || !(step in STEP_INDEX)) return 0;
  return STEP_INDEX[step];
}
function isInstallStep(value) {
  return INSTALL_STEPS.includes(value);
}
function maxInstallStep(a, b) {
  return installStepIndex(a) >= installStepIndex(b) ? a : b;
}
function canAdvanceInstallStep(from, to) {
  return installStepIndex(to) > installStepIndex(from ?? "pending");
}
const FALL_SENSOR_DEFER_DAYS = 2;
function isMissingInstallStepColumn(message) {
  return message.includes("install_step") || message.includes("app_opened_at") || message.includes("sos_primed_at") || message.includes("schema cache") || message.includes("does not exist") || message.includes("42703");
}
function isPaidRow(row) {
  if (isSignupPaymentComplete(row.payment_status)) return true;
  const sub = row.subscription_status ?? "";
  return sub === "active" || sub === "comp";
}
function inferInstallStep(row) {
  let step = "pending";
  if (isPaidRow(row)) step = "paid";
  if (row.install_instructions_sent_at) step = maxInstallStep(step, "install_link_sent");
  if (row.whatsapp_activated) step = maxInstallStep(step, "whatsapp_linked");
  if (row.app_opened_at) step = maxInstallStep(step, "app_opened");
  if (row.sos_primed_at || row.onboarding_completed || row.install_step === "ready") {
    step = "ready";
  }
  if (isInstallStep(row.install_step) && installStepIndex(row.install_step) > installStepIndex(step)) {
    step = row.install_step;
  }
  return step;
}
async function loadInstallRow(signupId) {
  const { data, error } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select(
    "id, install_step, payment_status, subscription_status, whatsapp_activated, onboarding_completed, install_instructions_sent_at, app_opened_at, sos_primed_at, fall_sensor_prompted_at, created_at"
  ).eq("id", signupId).maybeSingle();
  if (error) {
    if (isMissingInstallStepColumn(error.message ?? "")) return null;
    throw error;
  }
  return data;
}
async function advanceInstallStep(signupId, target, extra) {
  const row = await loadInstallRow(signupId);
  if (!row) return { ok: false };
  const current = inferInstallStep(row);
  if (!canAdvanceInstallStep(current, target) && current !== target) {
    if (installStepIndex(current) >= installStepIndex(target)) {
      return { ok: true, step: current, skipped: true };
    }
  }
  const next = maxInstallStep(current, target);
  const patch = {
    install_step: next,
    install_step_updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...extra
  };
  if (next === "ready") {
    patch.onboarding_completed = true;
  }
  const { error } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).update(patch).eq("id", signupId);
  if (error) {
    if (isMissingInstallStepColumn(error.message ?? "")) return { ok: false };
    console.error("[install-step] advance", error.message);
    return { ok: false };
  }
  return { ok: true, step: next };
}
async function syncInstallStep(signupId) {
  const row = await loadInstallRow(signupId);
  if (!row) return null;
  const inferred = inferInstallStep(row);
  const current = isInstallStep(row.install_step) ? row.install_step : "pending";
  const next = maxInstallStep(current, inferred);
  if (installStepIndex(next) === installStepIndex(current) && row.onboarding_completed === (next === "ready")) {
    return next;
  }
  const patch = {
    install_step: next,
    install_step_updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (next === "ready") patch.onboarding_completed = true;
  const { error } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).update(patch).eq("id", signupId);
  if (error && !isMissingInstallStepColumn(error.message ?? "")) {
    console.error("[install-step] sync", error.message);
  }
  return next;
}
async function markInstallPaid(signupId) {
  await advanceInstallStep(signupId, "paid");
}
async function markInstallLinkSent(signupId) {
  await advanceInstallStep(signupId, "install_link_sent");
}
async function markInstallWhatsAppLinked(signupId) {
  await advanceInstallStep(signupId, "whatsapp_linked");
}
async function markInstallAppOpened(signupId) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await advanceInstallStep(signupId, "app_opened", {
    app_opened_at: now
  });
}
async function markInstallSosPrimed(signupId) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await advanceInstallStep(signupId, "ready", {
    sos_primed_at: now,
    onboarding_completed: true
  });
}
async function markFallSensorPrompted(signupId) {
  const row = await loadInstallRow(signupId);
  if (!row) return;
  const { error } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).update({ fall_sensor_prompted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", signupId);
  if (error && !isMissingInstallStepColumn(error.message ?? "")) {
    console.error("[install-step] fall_sensor_prompted", error.message);
  }
}
async function readInstallProgress(signupId) {
  const row = await loadInstallRow(signupId);
  if (!row) {
    return {
      installStep: "pending",
      onboardingCompleted: false,
      appOpenedAt: null,
      sosPrimedAt: null,
      fallSensorPromptedAt: null
    };
  }
  const installStep = await syncInstallStep(signupId);
  return {
    installStep: installStep ?? inferInstallStep(row),
    onboardingCompleted: Boolean(row.onboarding_completed) || inferInstallStep(row) === "ready",
    appOpenedAt: row.app_opened_at ?? null,
    sosPrimedAt: row.sos_primed_at ?? null,
    fallSensorPromptedAt: row.fall_sensor_prompted_at ?? null
  };
}
export {
  FALL_SENSOR_DEFER_DAYS as F,
  SENIOR_SAFE_CHECKOUT_URL as S,
  isActivationKeyword as a,
  markInstallPaid as b,
  markInstallLinkSent as c,
  markInstallAppOpened as d,
  markInstallSosPrimed as e,
  findSignupForActivation as f,
  markFallSensorPrompted as g,
  whatsAppActivarUrl as h,
  isSignupPaymentComplete as i,
  markSignupWhatsAppActivated as m,
  processWhatsAppActivation as p,
  readInstallProgress as r,
  tryAutoActivatePaidSignup as t,
  whatsAppAnyReplyUrl as w
};
