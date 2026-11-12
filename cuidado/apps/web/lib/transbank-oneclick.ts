/** Cliente REST Oneclick Mall (Transbank) v1.2 — Plan Cuidado Chile. */

import {
  getTransbankConfig,
  parseTransbankEnvironment,
  TRANSBANK_SANDBOX_API_KEY,
  type TransbankConfig,
} from "./transbank-webpay";

export const ONECLICK_SANDBOX_MALL_CC = "597055555541";
export const ONECLICK_SANDBOX_STORE_CC = "597055555542";

const ONECLICK_BASE = "/rswebpaytransaction/api/oneclick/v1.2";

export type OneclickMallConfig = TransbankConfig & {
  mallCommerceCode: string;
  storeCommerceCode: string;
};

export function getOneclickConfig(): OneclickMallConfig {
  const base = getTransbankConfig();
  const isProd = parseTransbankEnvironment() === "production";
  return {
    ...base,
    mallCommerceCode:
      process.env.TRANSBANK_ONECLICK_MALL_CC?.trim() ||
      (isProd ? "" : ONECLICK_SANDBOX_MALL_CC),
    storeCommerceCode:
      process.env.TRANSBANK_ONECLICK_STORE_CC?.trim() ||
      (isProd ? "" : ONECLICK_SANDBOX_STORE_CC),
    apiKey:
      process.env.TRANSBANK_ONECLICK_API_KEY?.trim() ||
      process.env.TRANSBANK_API_KEY?.trim() ||
      (isProd ? "" : TRANSBANK_SANDBOX_API_KEY),
    commerceCode:
      process.env.TRANSBANK_ONECLICK_MALL_CC?.trim() ||
      (isProd ? "" : ONECLICK_SANDBOX_MALL_CC),
  };
}

export function isOneclickConfigured(): boolean {
  const cfg = getOneclickConfig();
  return Boolean(cfg.mallCommerceCode && cfg.storeCommerceCode && cfg.apiKey);
}

function headers(cfg: OneclickMallConfig): Record<string, string> {
  return {
    "Tbk-Api-Key-Id": cfg.mallCommerceCode,
    "Tbk-Api-Key-Secret": cfg.apiKey,
    "Content-Type": "application/json",
  };
}

function parseJson(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function startOneclickInscription(input: {
  username: string;
  email: string;
  responseUrl: string;
}): Promise<{ token: string; urlWebpay: string }> {
  const cfg = getOneclickConfig();
  if (!isOneclickConfigured()) {
    throw new Error("Oneclick no configurado: faltan códigos Mall/Store o API key");
  }
  const res = await fetch(`${cfg.apiHost}${ONECLICK_BASE}/inscriptions`, {
    method: "POST",
    headers: headers(cfg),
    body: JSON.stringify({
      username: input.username,
      email: input.email,
      response_url: input.responseUrl,
    }),
  });
  const body = parseJson(await res.text());
  if (!res.ok) {
    const msg =
      (typeof body.error_message === "string" && body.error_message) ||
      (typeof body.message === "string" && body.message) ||
      `HTTP ${res.status}`;
    throw new Error(`Oneclick inscripción falló: ${msg}`);
  }
  const token = typeof body.token === "string" ? body.token : "";
  const urlWebpay = typeof body.url_webpay === "string" ? body.url_webpay : "";
  if (!token || !urlWebpay) throw new Error("Oneclick no devolvió token/url");
  return { token, urlWebpay };
}

export async function finishOneclickInscription(token: string): Promise<{
  ok: boolean;
  tbkUser: string | null;
  responseCode: number | null;
  raw: Record<string, unknown>;
}> {
  const cfg = getOneclickConfig();
  const res = await fetch(
    `${cfg.apiHost}${ONECLICK_BASE}/inscriptions/${encodeURIComponent(token)}`,
    { method: "PUT", headers: headers(cfg) },
  );
  const body = parseJson(await res.text());
  const responseCode = typeof body.response_code === "number" ? body.response_code : null;
  const tbkUser = typeof body.tbk_user === "string" ? body.tbk_user : null;
  return {
    ok: res.ok && responseCode === 0 && Boolean(tbkUser),
    tbkUser,
    responseCode,
    raw: body,
  };
}

export async function authorizeOneclickMall(input: {
  username: string;
  tbkUser: string;
  buyOrder: string;
  amount: number;
}): Promise<{ ok: boolean; raw: Record<string, unknown> }> {
  const cfg = getOneclickConfig();
  const storeBuyOrder = `S${input.buyOrder}`.replace(/[^A-Z0-9]/g, "").slice(0, 26);
  const res = await fetch(`${cfg.apiHost}${ONECLICK_BASE}/transactions`, {
    method: "POST",
    headers: headers(cfg),
    body: JSON.stringify({
      username: input.username,
      tbk_user: input.tbkUser,
      buy_order: input.buyOrder,
      details: [
        {
          commerce_code: cfg.storeCommerceCode,
          buy_order: storeBuyOrder,
          amount: input.amount,
          installments_number: 1,
        },
      ],
    }),
  });
  const body = parseJson(await res.text());
  const details = Array.isArray(body.details) ? body.details : [];
  const first = details[0] && typeof details[0] === "object" ? (details[0] as Record<string, unknown>) : null;
  const responseCode = first && typeof first.response_code === "number" ? first.response_code : null;
  const status = first && typeof first.status === "string" ? first.status : "";
  const ok = res.ok && responseCode === 0 && (status === "AUTHORIZED" || status === "APPROVED");
  return { ok, raw: body };
}
