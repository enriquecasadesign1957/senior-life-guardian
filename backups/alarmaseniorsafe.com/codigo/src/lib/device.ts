import { isAndroidApkAcknowledged } from "@/lib/install-config";

/** App instalada como PWA / WAM (modo standalone). */
export function isPwaStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** App nativa Capacitor (APK / iOS shell). */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return cap?.isNativePlatform?.() === true;
}

/** PWA standalone, APK nativa, o Android con instalación APK confirmada por el usuario. */
export function isAppInstalled(): boolean {
  if (isPwaStandalone() || isNativeApp()) return true;
  const { isAndroid } = detectPlatform();
  return isAndroid && isAndroidApkAcknowledged();
}

export function detectPlatform() {
  if (typeof navigator === "undefined") {
    return { isIOS: false, isAndroid: false, isSafari: false };
  }
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
  const isAndroid = /Android/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/i.test(ua);
  return { isIOS, isAndroid, isSafari };
}

/** Teléfono o tablet — prioriza instalación en dispositivo, no panel web de escritorio. */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const mobileUa = /Android|webOS|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);
  const coarse = window.matchMedia?.("(pointer: coarse)").matches === true;
  const narrow = window.matchMedia?.("(max-width: 900px)").matches === true;
  return mobileUa || (coarse && narrow);
}

export function isDesktopDevice(): boolean {
  return !isMobileDevice();
}
