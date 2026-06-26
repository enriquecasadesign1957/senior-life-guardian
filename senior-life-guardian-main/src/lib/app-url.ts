/** Dominio público oficial (producción). */
export const PRODUCTION_SITE_URL = "https://alarmaseniorsafe.cl";

/** Guía pública de descarga, instalación y uso diario. */
export const SENIOR_SAFE_INSTALL_GUIDE_URL = `${PRODUCTION_SITE_URL}/guia`;

/** Simulador S.O.S interactivo (HTML autónomo, ideal para WhatsApp y correos). */
export const SENIOR_SAFE_SOS_SIMULATOR_URL = `${PRODUCTION_SITE_URL}/simulador-senior-safe.html`;

const NON_PRODUCTION_HOST_RE =
  /localhost|127\.0\.0\.1|0\.0\.0\.0|lovable\.dev|lovable\.app|lovableproject\.com|id-preview--|\.workers\.dev$/i;

/** Origen seguro para QR, enlaces de instalación y "Go home" (nunca sandbox/Lovable/localhost). */
export function resolveProductionSiteOrigin(): string {
  if (import.meta.env.PROD) {
    return PRODUCTION_SITE_URL;
  }

  const fromEnv =
    (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim() ||
    (import.meta.env.PUBLIC_APP_URL as string | undefined)?.trim() ||
    PRODUCTION_SITE_URL;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (!NON_PRODUCTION_HOST_RE.test(host)) {
      return window.location.origin;
    }
  }

  return fromEnv.replace(/\/$/, "") || PRODUCTION_SITE_URL;
}

export function productionHomeUrl(): string {
  return PRODUCTION_SITE_URL;
}
