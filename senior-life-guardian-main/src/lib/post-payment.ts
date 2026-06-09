import { PRODUCTION_SITE_URL, resolveProductionSiteOrigin } from "@/lib/app-url";

/** Tras pago Webpay, el usuario configura la app (primer uso guiado). */
export const APP_ENTRENAMIENTO_SEARCH = { entrenamiento: "1" } as const;

export type AppHandoffSearch = {
  entrenamiento: "1";
  ss?: string;
};

/** Parámetros de búsqueda al abrir /app tras pago o escaneo QR (propaga contract_signup id). */
export function buildAppHandoffSearch(signupId?: string | null): AppHandoffSearch {
  const search: AppHandoffSearch = { entrenamiento: "1" };
  if (signupId) search.ss = signupId;
  return search;
}

/** Lee el contract_signup id guardado en sesión o respaldo local. */
export function readStoredSignupId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem("seniorsafe_user") ||
      localStorage.getItem("seniorsafe_user_backup") ||
      localStorage.getItem("seniorsafe_native_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string };
    return typeof parsed.id === "string" ? parsed.id : null;
  } catch {
    return null;
  }
}

/** Guarda el vínculo mínimo contratante ↔ dispositivo (session + backup local). */
export function persistSignupHandoff(
  signupId: string,
  extra?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  try {
    const raw =
      sessionStorage.getItem("seniorsafe_user") ||
      localStorage.getItem("seniorsafe_user_backup");
    const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const payload = { ...existing, id: signupId, ...extra };
    sessionStorage.setItem("seniorsafe_user", JSON.stringify(payload));
    localStorage.setItem("seniorsafe_user_backup", JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

/** Ruta obligatoria post-pago: instalar PWA/WAM antes del panel web. */
export const POST_PAYMENT_INSTALL_PATH = "/instalar-app";

export const REQUIRES_PWA_INSTALL_KEY = "seniorsafe_requires_pwa_install";

export const TRAINING_DONE_KEY = "seniorsafe_training_done";

export function markRequiresPwaInstall() {
  try {
    sessionStorage.setItem(REQUIRES_PWA_INSTALL_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearRequiresPwaInstall() {
  try {
    sessionStorage.removeItem(REQUIRES_PWA_INSTALL_KEY);
  } catch {
    /* ignore */
  }
}

export function requiresPwaInstall(): boolean {
  try {
    return sessionStorage.getItem(REQUIRES_PWA_INSTALL_KEY) === "1";
  } catch {
    return false;
  }
}

/** URL absoluta que codifica el QR de instalación (siempre dominio de producción en build PROD). */
export function buildMobileInstallPageUrl(
  signupId?: string | null,
  opts?: { paymentSuccess?: boolean },
): string {
  const origin = import.meta.env.PROD ? PRODUCTION_SITE_URL : resolveProductionSiteOrigin();
  const u = new URL(POST_PAYMENT_INSTALL_PATH, origin);
  u.searchParams.set("entrenamiento", "1");
  if (opts?.paymentSuccess) u.searchParams.set("pago", "ok");
  if (signupId) u.searchParams.set("ss", signupId);
  return u.toString();
}

export function markTrainingDone() {
  try {
    localStorage.setItem(TRAINING_DONE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isTrainingDone(): boolean {
  try {
    return localStorage.getItem(TRAINING_DONE_KEY) === "1";
  } catch {
    return false;
  }
}
