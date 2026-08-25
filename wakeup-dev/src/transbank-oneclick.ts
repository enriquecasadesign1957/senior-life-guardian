/**
 * Transbank Oneclick Mall v1.2 — misma cuenta que Senior Safe,
 * username y buy_order con prefijo WK para no cruzar cobros.
 */

export const ONECLICK_SANDBOX_MALL_CC = "597055555541";
export const ONECLICK_SANDBOX_STORE_CC = "597055555542";
export const TRANSBANK_SANDBOX_API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";

const SANDBOX_HOST = "https://webpay3gint.transbank.cl";
const PRODUCTION_HOST = "https://webpay3g.transbank.cl";
const ONECLICK_BASE = "/rswebpaytransaction/api/oneclick/v1.2";

export const CHILE_PLAN_CLP = 25000;
export const BASIC_PLAN_CLP = 9500;
export const BASIC_PLAN_CREDITS = 10;

export type TransbankEnv = {
  TRANSBANK_ENVIRONMENT?: string;
  TRANSBANK_ONECLICK_MALL_CC?: string;
  TRANSBANK_ONECLICK_STORE_CC?: string;
  TRANSBANK_ONECLICK_API_KEY?: string;
  TRANSBANK_API_KEY?: string;
  WEB_ORIGIN?: string;
};

export type OneclickMallConfig = {
  environment: "sandbox" | "production";
  apiHost: string;
  mallCommerceCode: string;
  storeCommerceCode: string;
  apiKey: string;
};

function parseJsonBody(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/** wrangler secret put a veces guarda comillas o saltos de línea del .env. */
function cleanSecret(value?: string): string {
  return (value ?? "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/[\r\n\s]+/g, "");
}

export function getOneclickMallConfig(env: TransbankEnv): OneclickMallConfig {
  const raw = (env.TRANSBANK_ENVIRONMENT ?? "").trim().toLowerCase();
  const isProd = raw === "production" || raw === "prod";
  const mall =
    cleanSecret(env.TRANSBANK_ONECLICK_MALL_CC) ||
    (isProd ? "" : ONECLICK_SANDBOX_MALL_CC);
  const store =
    cleanSecret(env.TRANSBANK_ONECLICK_STORE_CC) ||
    (isProd ? "" : ONECLICK_SANDBOX_STORE_CC);
  const apiKey =
    cleanSecret(env.TRANSBANK_ONECLICK_API_KEY) ||
    cleanSecret(env.TRANSBANK_API_KEY) ||
    (isProd ? "" : TRANSBANK_SANDBOX_API_KEY);

  return {
    environment: isProd ? "production" : "sandbox",
    apiHost: isProd ? PRODUCTION_HOST : SANDBOX_HOST,
    mallCommerceCode: mall,
    storeCommerceCode: store,
    apiKey,
  };
}

export function isOneclickConfigured(cfg: OneclickMallConfig): boolean {
  return Boolean(cfg.mallCommerceCode && cfg.storeCommerceCode && cfg.apiKey);
}

export function generateWkUsername(usuarioId: string): string {
  return `WK${usuarioId.replace(/-/g, "").toUpperCase()}`.slice(0, 40);
}

function randomAlnum(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (const byte of bytes) {
    out += alphabet[byte % alphabet.length];
  }
  return out;
}

export function generateWkBuyOrder(tag: "M" | "S"): string {
  const time = Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `WK${tag}${time}${randomAlnum(8)}`.slice(0, 26);
}

export function generateWkBuyOrders(): {
  mallBuyOrder: string;
  storeBuyOrder: string;
} {
  return {
    mallBuyOrder: generateWkBuyOrder("M"),
    storeBuyOrder: generateWkBuyOrder("S"),
  };
}

function headers(cfg: OneclickMallConfig): Record<string, string> {
  return {
    "Tbk-Api-Key-Id": cfg.mallCommerceCode,
    "Tbk-Api-Key-Secret": cfg.apiKey,
    "Content-Type": "application/json",
  };
}

export async function startOneclickInscription(
  cfg: OneclickMallConfig,
  input: { username: string; email: string; responseUrl: string }
): Promise<{ token: string; urlWebpay: string }> {
  const res = await fetch(`${cfg.apiHost}${ONECLICK_BASE}/inscriptions`, {
    method: "POST",
    headers: headers(cfg),
    body: JSON.stringify({
      username: input.username,
      email: input.email,
      response_url: input.responseUrl,
    }),
  });
  const body = parseJsonBody(await res.text());
  if (!res.ok) {
    const msg =
      (typeof body.error_message === "string" && body.error_message) ||
      (typeof body.description === "string" && body.description) ||
      (typeof body.message === "string" && body.message) ||
      `HTTP ${res.status}`;
    throw new Error(msg.slice(0, 180));
  }
  const token = typeof body.token === "string" ? body.token : "";
  const urlWebpay = typeof body.url_webpay === "string" ? body.url_webpay : "";
  if (!token || !urlWebpay) {
    throw new Error("Transbank no devolvió token de inscripción");
  }
  return { token, urlWebpay };
}

export async function finishOneclickInscription(
  cfg: OneclickMallConfig,
  token: string
): Promise<{
  ok: boolean;
  tbkUser: string | null;
  cardLast4: string | null;
  responseCode: number | null;
}> {
  const res = await fetch(
    `${cfg.apiHost}${ONECLICK_BASE}/inscriptions/${encodeURIComponent(token)}`,
    { method: "PUT", headers: headers(cfg), body: "{}" }
  );
  const body = parseJsonBody(await res.text());
  const responseCode =
    typeof body.response_code === "number" ? body.response_code : null;
  const tbkUser = typeof body.tbk_user === "string" ? body.tbk_user : null;
  const card = typeof body.card_number === "string" ? body.card_number : "";
  const digits = card.replace(/\D/g, "");
  return {
    ok: res.ok && responseCode === 0 && Boolean(tbkUser),
    tbkUser,
    cardLast4: digits.length >= 4 ? digits.slice(-4) : null,
    responseCode,
  };
}

export async function authorizeOneclick(
  cfg: OneclickMallConfig,
  input: {
    username: string;
    tbkUser: string;
    mallBuyOrder: string;
    storeBuyOrder: string;
    amount: number;
  }
): Promise<{
  ok: boolean;
  authorizationCode: string | null;
  responseCode: number | null;
}> {
  const res = await fetch(`${cfg.apiHost}${ONECLICK_BASE}/transactions`, {
    method: "POST",
    headers: headers(cfg),
    body: JSON.stringify({
      username: input.username,
      tbk_user: input.tbkUser,
      buy_order: input.mallBuyOrder,
      details: [
        {
          commerce_code: cfg.storeCommerceCode,
          buy_order: input.storeBuyOrder,
          amount: input.amount,
        },
      ],
    }),
  });
  const body = parseJsonBody(await res.text());
  const details = Array.isArray(body.details) ? body.details : [];
  const primary =
    details[0] && typeof details[0] === "object"
      ? (details[0] as Record<string, unknown>)
      : {};
  const responseCode =
    typeof primary.response_code === "number" ? primary.response_code : null;
  const status = typeof primary.status === "string" ? primary.status : "";
  const authorizationCode =
    typeof primary.authorization_code === "string"
      ? primary.authorization_code
      : null;
  const ok =
    res.ok &&
    responseCode === 0 &&
    (status === "AUTHORIZED" || status === "APPROVED");
  if (!ok) {
    const tbkMsg =
      (typeof body.error_message === "string" && body.error_message) ||
      (typeof body.description === "string" && body.description) ||
      status ||
      `HTTP ${res.status}`;
    console.error("transbank_authorize_rejected", {
      http: res.status,
      response_code: responseCode,
      status,
      message: tbkMsg.slice(0, 180),
    });
  }
  return { ok, authorizationCode, responseCode };
}

export async function deleteOneclickInscription(
  cfg: OneclickMallConfig,
  input: { tbkUser: string; username: string }
): Promise<boolean> {
  const res = await fetch(`${cfg.apiHost}${ONECLICK_BASE}/inscriptions`, {
    method: "DELETE",
    headers: headers(cfg),
    body: JSON.stringify({ tbk_user: input.tbkUser, username: input.username }),
  });
  return res.status === 204 || res.ok;
}
