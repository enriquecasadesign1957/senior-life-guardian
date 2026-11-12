export type PayMarket = "cl" | "intl";

export const MARKET_COOKIE = "cw_market";

/** Defaults públicos (UI). En servidor se pueden sobreescribir con env. */
export const RESCATE_CLP_DEFAULT = 27000;
export const PLAN_CLP_DEFAULT = 18000;

/** Precios fijos CLP (no FX). Ajustables por env en el servidor. */
export function rescueAmountClp(): number {
  if (typeof process === "undefined" || !process.env) return RESCATE_CLP_DEFAULT;
  const n = Number.parseInt(process.env.TRANSBANK_RESCATE_CLP ?? String(RESCATE_CLP_DEFAULT), 10);
  return Number.isFinite(n) && n > 0 ? n : RESCATE_CLP_DEFAULT;
}

export function planAmountClp(): number {
  if (typeof process === "undefined" || !process.env) return PLAN_CLP_DEFAULT;
  const n = Number.parseInt(process.env.TRANSBANK_PLAN_CLP ?? String(PLAN_CLP_DEFAULT), 10);
  return Number.isFinite(n) && n > 0 ? n : PLAN_CLP_DEFAULT;
}

export function formatClp(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function readMarketFromCookie(cookieHeader: string | null): PayMarket | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)cw_market=(cl|intl)(?:;|$)/i);
  if (!match?.[1]) return null;
  return match[1].toLowerCase() === "cl" ? "cl" : "intl";
}

export function resolvePayMarket(input: {
  cookieHeader?: string | null;
  prefer?: string | null;
}): PayMarket {
  if (input.prefer === "cl" || input.prefer === "intl") return input.prefer;
  const fromCookie = readMarketFromCookie(input.cookieHeader ?? null);
  if (fromCookie) return fromCookie;
  return "intl";
}
