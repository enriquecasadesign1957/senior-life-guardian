import { P as PRODUCTION_SITE_URL } from "./index.mjs";
const APK_DOWNLOAD_URL = "https://github.com/enriquecasadesign1957/senior-life-guardian/releases/latest/download/SeniorSafe.apk?v=20260607";
const NATIVE_APP_PATH = "/native";
const APK_ACK_KEY = "seniorsafe_apk_ack";
function markAndroidApkAcknowledged() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(APK_ACK_KEY, "1");
  } catch {
  }
}
function isAndroidApkAcknowledged() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(APK_ACK_KEY) === "1";
  } catch {
    return false;
  }
}
function buildNativeHandoffUrl(signupId, source = "postpay") {
  const base = PRODUCTION_SITE_URL;
  const u = new URL(NATIVE_APP_PATH, base);
  if (signupId) u.searchParams.set("ss", signupId);
  u.searchParams.set("source", source);
  return u.toString();
}
function isPwaStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches === true || window.navigator.standalone === true;
}
function isNativeApp() {
  if (typeof window === "undefined") return false;
  const cap = window.Capacitor;
  return cap?.isNativePlatform?.() === true;
}
function isAppInstalled() {
  if (isPwaStandalone() || isNativeApp()) return true;
  const { isAndroid } = detectPlatform();
  return isAndroid && isAndroidApkAcknowledged();
}
function detectPlatform() {
  if (typeof navigator === "undefined") {
    return { isIOS: false, isAndroid: false, isSafari: false };
  }
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/i.test(ua);
  return { isIOS, isAndroid, isSafari };
}
function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const mobileUa = /Android|webOS|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);
  const coarse = window.matchMedia?.("(pointer: coarse)").matches === true;
  const narrow = window.matchMedia?.("(max-width: 900px)").matches === true;
  return mobileUa || coarse && narrow;
}
export {
  APK_DOWNLOAD_URL as A,
  isAppInstalled as a,
  buildNativeHandoffUrl as b,
  isMobileDevice as c,
  detectPlatform as d,
  isPwaStandalone as e,
  isNativeApp as i,
  markAndroidApkAcknowledged as m
};
