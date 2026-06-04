/** Tras pago Webpay (o mock), el usuario entra directo a la app en modo entrenamiento. */
export const APP_ENTRENAMIENTO_URL = "/app?entrenamiento=1";

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

/** URL que el usuario escanea en desktop para abrir el flujo de instalación en el teléfono. */
export function buildMobileInstallPageUrl(signupId?: string | null): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) ||
        (import.meta.env.PUBLIC_APP_URL as string | undefined) ||
        "https://alarmaseniorsafe.cl";
  const u = new URL(POST_PAYMENT_INSTALL_PATH, origin);
  u.searchParams.set("entrenamiento", "1");
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
