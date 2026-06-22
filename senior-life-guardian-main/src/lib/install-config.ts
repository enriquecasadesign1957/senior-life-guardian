import { PRODUCTION_SITE_URL } from "@/lib/app-url";

/** APK oficial — GitHub Releases latest (se actualiza en cada build CI). */
export const APK_DOWNLOAD_URL =
  "https://github.com/enriquecasadesign1957/senior-life-guardian/releases/latest/download/SeniorSafe.apk?v=20260622";

export const NATIVE_APP_PATH = "/native";

const APK_ACK_KEY = "seniorsafe_apk_ack";

export function markAndroidApkAcknowledged(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(APK_ACK_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isAndroidApkAcknowledged(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(APK_ACK_KEY) === "1";
  } catch {
    return false;
  }
}

export function buildNativeHandoffUrl(signupId: string | null, source = "postpay"): string {
  const base =
    typeof window !== "undefined" && !import.meta.env.PROD
      ? window.location.origin
      : PRODUCTION_SITE_URL;
  const u = new URL(NATIVE_APP_PATH, base);
  if (signupId) u.searchParams.set("ss", signupId);
  u.searchParams.set("source", source);
  u.searchParams.set("entrenamiento", "1");
  return u.toString();
}
