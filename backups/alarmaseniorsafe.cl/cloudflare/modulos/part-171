import { e as clearSeniorAccessToken } from "./senior-access-auth-Bmk7iyGS.mjs";
function buildAppHandoffSearch(signupId, opts) {
  const search = {};
  if (opts?.training) search.entrenamiento = "1";
  if (signupId) search.ss = signupId;
  return search;
}
function readStoredSignupId() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("seniorsafe_user") || localStorage.getItem("seniorsafe_user_backup") || localStorage.getItem("seniorsafe_native_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed.id === "string" ? parsed.id : null;
  } catch {
    return null;
  }
}
function persistSignupHandoff(signupId, extra) {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem("seniorsafe_user") || localStorage.getItem("seniorsafe_user_backup");
    const existing = raw ? JSON.parse(raw) : {};
    const prevId = typeof existing.id === "string" ? existing.id : null;
    if (prevId && prevId !== signupId) clearSeniorAccessToken();
    const payload = { ...existing, id: signupId, ...extra };
    sessionStorage.setItem("seniorsafe_user", JSON.stringify(payload));
    localStorage.setItem("seniorsafe_user_backup", JSON.stringify(payload));
  } catch {
  }
}
const POST_PAYMENT_INSTALL_PATH = "/instalar-app";
const REQUIRES_PWA_INSTALL_KEY = "seniorsafe_requires_pwa_install";
const TRAINING_DONE_KEY = "seniorsafe_training_done";
function markRequiresPwaInstall() {
  try {
    sessionStorage.setItem(REQUIRES_PWA_INSTALL_KEY, "1");
  } catch {
  }
}
function clearRequiresPwaInstall() {
  try {
    sessionStorage.removeItem(REQUIRES_PWA_INSTALL_KEY);
  } catch {
  }
}
function requiresPwaInstall() {
  try {
    return sessionStorage.getItem(REQUIRES_PWA_INSTALL_KEY) === "1";
  } catch {
    return false;
  }
}
function markTrainingDone() {
  try {
    localStorage.setItem(TRAINING_DONE_KEY, "1");
  } catch {
  }
}
function isTrainingDone() {
  try {
    return localStorage.getItem(TRAINING_DONE_KEY) === "1";
  } catch {
    return false;
  }
}
export {
  POST_PAYMENT_INSTALL_PATH as P,
  markRequiresPwaInstall as a,
  buildAppHandoffSearch as b,
  clearRequiresPwaInstall as c,
  requiresPwaInstall as d,
  isTrainingDone as i,
  markTrainingDone as m,
  persistSignupHandoff as p,
  readStoredSignupId as r
};
