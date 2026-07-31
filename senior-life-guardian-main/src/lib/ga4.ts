/** Google Analytics 4 + Google Ads — Senior Safe. */
export const GA4_MEASUREMENT_ID = "G-MWTYRRE3YE";
export const GOOGLE_ADS_ID = "AW-18356247992";

/** Fragmento de evento: conversión "Suscripción (2)". */
export const GOOGLE_ADS_SUBSCRIPTION_SEND_TO = "AW-18356247992/nvz8CNGdgdgcELi7-LBE";

/** Valor por defecto si no hay monto del pago (plan mensual CLP). */
const DEFAULT_SUBSCRIPTION_VALUE_CLP = 6900;

const CONVERSION_PREFIX = "seniorsafe_ads_subscription_conv:";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function shouldLoadGoogleTags(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return false;
  if (host.includes("lovableproject.com") || host.includes("lovable.app")) return false;
  return true;
}

/** @deprecated usar shouldLoadGoogleTags */
export const shouldLoadGa4 = shouldLoadGoogleTags;

/** Pageview en navegación SPA (TanStack Router). */
export function trackGa4Pageview(path: string, title?: string): void {
  if (typeof window === "undefined" || !window.gtag || !shouldLoadGoogleTags()) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

function alreadyTrackedConversion(transactionId: string): boolean {
  try {
    return localStorage.getItem(CONVERSION_PREFIX + transactionId) === "1";
  } catch {
    return false;
  }
}

function markTrackedConversion(transactionId: string): void {
  try {
    localStorage.setItem(CONVERSION_PREFIX + transactionId, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Conversión Google Ads solo con pago real verificado.
 * Requiere transactionId de Webpay/Oneclick (orden o código de autorización).
 * No usar solo ?pago=ok ni el signup id como transactionId.
 */
export function trackGoogleAdsSubscriptionConversion(opts: {
  value?: number | null;
  currency?: string;
  /** Orden de compra o código de autorización Transbank (obligatorio). */
  transactionId: string;
  signupId?: string | null;
}): void {
  if (typeof window === "undefined" || !window.gtag || !shouldLoadGoogleTags()) return;

  const transactionId = opts.transactionId.trim();
  if (!transactionId || transactionId.length < 4) return;

  // Evita contar visitas a /instalar-app?pago=ok o el UUID del signup como “venta”.
  if (opts.signupId && transactionId === opts.signupId) return;

  if (alreadyTrackedConversion(transactionId)) return;
  markTrackedConversion(transactionId);

  const value =
    opts.value != null && Number.isFinite(opts.value) && opts.value > 0
      ? opts.value
      : DEFAULT_SUBSCRIPTION_VALUE_CLP;
  const currency = opts.currency ?? "CLP";

  window.gtag("event", "conversion", {
    send_to: GOOGLE_ADS_SUBSCRIPTION_SEND_TO,
    value,
    currency,
    transaction_id: transactionId,
  });
  window.gtag("event", "purchase", {
    currency,
    value,
    transaction_id: transactionId,
  });
}
