/** Versión internacional (alarmaseniorsafe.com). Chile no define VITE_MARKET. */
export const isInternational = import.meta.env.VITE_MARKET === "international";

export const SITE_ORIGIN = isInternational
  ? "https://alarmaseniorsafe.com"
  : "https://alarmaseniorsafe.cl";

export const LEMON_CHECKOUT = {
  mensual:
    "https://alarma-senior-safe.lemonsqueezy.com/checkout/buy/64a145ef-6ffa-46c4-b959-6f0d62948ed9",
  anual:
    "https://alarma-senior-safe.lemonsqueezy.com/checkout/buy/c7ee027e-6a95-4131-9b46-17d73babbafe",
} as const;

export function lemonCheckoutUrl(periodo: "mensual" | "anual" = "mensual"): string {
  return LEMON_CHECKOUT[periodo];
}

export const paymentLabel = isInternational ? "Lemon Squeezy" : "Webpay Plus";
