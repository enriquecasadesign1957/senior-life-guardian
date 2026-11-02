import process from "node:process";
import { P as PRODUCTION_SITE_URL } from "./index.mjs";

import "../_libs/h3-v2.mjs";
import "../_libs/unenv.mjs";


import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";





const TRANSBANK_SANDBOX_COMMERCE_CODE = "597055555532";
const TRANSBANK_SANDBOX_API_KEY = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const SANDBOX_API_HOST = "https://webpay3gint.transbank.cl";
const PRODUCTION_API_HOST = "https://webpay3g.transbank.cl";
const OFFICIAL_APP_URL = PRODUCTION_SITE_URL;
const CREATE_PATH = "/rswebpaytransaction/api/webpay/v1.2/transactions";
function normalizeAppBaseUrl(raw) {
  const trimmed = (raw ?? "").trim().replace(/\/$/, "");
  if (!trimmed) return null;
  if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}
function normalizeLocalAppUrl(raw) {
  const trimmed = (raw ?? "").trim().replace(/\/$/, "");
  if (!trimmed) return null;
  if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}
function isTransbankLocalValidation() {
  return process.env.TRANSBANK_FORCE_SANDBOX === "1" || Boolean(normalizeLocalAppUrl(process.env.LOCAL_PUBLIC_APP_URL));
}
function resolvePublicAppUrl() {
  const localOverride = normalizeLocalAppUrl(process.env.LOCAL_PUBLIC_APP_URL);
  if (localOverride) return localOverride;
  const fromEnv = normalizeAppBaseUrl(process.env.PUBLIC_APP_URL) || normalizeAppBaseUrl(process.env.WEBPAY_RETURN_URL) || normalizeAppBaseUrl(process.env.WEBPAY_FINAL_URL) || normalizeAppBaseUrl(process.env.APP_URL) || normalizeAppBaseUrl(process.env.VITE_PUBLIC_APP_URL);
  return fromEnv ?? OFFICIAL_APP_URL;
}
function buildWebpayReturnUrl() {
  return `${resolvePublicAppUrl()}/webpay/retorno`;
}
function parseTransbankEnvironment() {
  if (isTransbankLocalValidation()) return "sandbox";
  const raw = (process.env.TRANSBANK_ENVIRONMENT ?? "sandbox").trim().toLowerCase();
  if (raw === "production" || raw === "prod") return "production";
  return "sandbox";
}
function getTransbankConfig() {
  const environment = parseTransbankEnvironment();
  const isProd = environment === "production";
  const localValidation = isTransbankLocalValidation();
  return {
    environment,
    apiHost: isProd ? PRODUCTION_API_HOST : SANDBOX_API_HOST,
    commerceCode: localValidation ? TRANSBANK_SANDBOX_COMMERCE_CODE : process.env.TRANSBANK_CC?.trim() || (isProd ? "" : TRANSBANK_SANDBOX_COMMERCE_CODE),
    apiKey: localValidation ? TRANSBANK_SANDBOX_API_KEY : process.env.TRANSBANK_API_KEY?.trim() || (isProd ? "" : TRANSBANK_SANDBOX_API_KEY)
  };
}
function generateWebpayBuyOrder() {
  const suffix = Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `SS${suffix}`.slice(0, 26);
}
function generateWebpaySessionId(signupId) {
  const compact = signupId.replace(/-/g, "").slice(0, 54);
  return `sess-${compact}`.slice(0, 61);
}
function transbankHeaders(cfg) {
  return {
    "Tbk-Api-Key-Id": cfg.commerceCode,
    "Tbk-Api-Key-Secret": cfg.apiKey,
    "Content-Type": "application/json"
  };
}
function enableSandboxTlsBypass$1(cfg) {
  if (cfg.environment === "production") return;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
function parseJsonBody$1(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
async function createWebpayPlusTransaction(input) {
  const cfg = getTransbankConfig();
  if (!cfg.commerceCode || !cfg.apiKey) {
    throw new Error("Webpay Plus no configurado: faltan TRANSBANK_CC o TRANSBANK_API_KEY");
  }
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new Error("Monto inválido para Webpay Plus");
  }
  const payload = {
    buy_order: input.buyOrder,
    session_id: input.sessionId,
    amount: input.amount,
    return_url: input.returnUrl
  };
  console.info("[transbank] create transaction", {
    environment: cfg.environment,
    host: cfg.apiHost,
    commerceCode: cfg.commerceCode,
    buy_order: input.buyOrder,
    amount: input.amount,
    return_url: input.returnUrl
  });
  enableSandboxTlsBypass$1(cfg);
  const res = await fetch(`${cfg.apiHost}${CREATE_PATH}`, {
    method: "POST",
    headers: transbankHeaders(cfg),
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  const body = parseJsonBody$1(text);
  if (!res.ok) {
    console.error("[transbank] create failed", res.status, body);
    const msg = typeof body.error_message === "string" && body.error_message || typeof body.message === "string" && body.message || text.slice(0, 200);
    throw new Error(`Transbank rechazó la creación (${res.status}): ${msg}`);
  }
  const token = typeof body.token === "string" ? body.token : "";
  const url = typeof body.url === "string" ? body.url : "";
  if (!token || !url) {
    console.error("[transbank] create missing token/url", body);
    throw new Error("Transbank no devolvió token ni URL de redirección");
  }
  console.log(
    "\n===== TOKEN TRANSBANK (token_ws) =====\n",
    token,
    "\n===== URL PASARELA WEBPAY =====\n",
    url,
    "\n====================================\n"
  );
  return {
    token,
    url,
    buyOrder: input.buyOrder,
    sessionId: input.sessionId,
    amount: input.amount,
    raw: body
  };
}
async function confirmWebpayPlusTransaction(token) {
  const cfg = getTransbankConfig();
  if (!cfg.commerceCode || !cfg.apiKey) {
    throw new Error("Webpay Plus no configurado");
  }
  console.log(
    "\n===== TOKEN TRANSBANK DE PRUEBA (confirm) =====\n",
    token,
    "\n=============================================\n"
  );
  enableSandboxTlsBypass$1(cfg);
  const res = await fetch(`${cfg.apiHost}${CREATE_PATH}/${encodeURIComponent(token)}`, {
    method: "PUT",
    headers: transbankHeaders(cfg)
  });
  const text = await res.text();
  const body = parseJsonBody$1(text);
  const responseCode = typeof body.response_code === "number" ? body.response_code : null;
  const status = typeof body.status === "string" ? body.status : "UNKNOWN";
  const approved = res.ok && responseCode === 0 && (status === "AUTHORIZED" || status === "APPROVED");
  const cardDetail = body.card_detail && typeof body.card_detail === "object" ? body.card_detail : null;
  return {
    ok: approved,
    status,
    responseCode,
    authorizationCode: typeof body.authorization_code === "string" ? body.authorization_code : null,
    amount: typeof body.amount === "number" ? body.amount : null,
    buyOrder: typeof body.buy_order === "string" ? body.buy_order : null,
    cardLast4: cardDetail && typeof cardDetail.card_number === "string" ? cardDetail.card_number : null,
    raw: body
  };
}
const ONECLICK_SANDBOX_MALL_CC = "597055555541";
const ONECLICK_SANDBOX_STORE_CC = "597055555542";
const ONECLICK_BASE = "/rswebpaytransaction/api/oneclick/v1.2";
function isOneclickMallPaymentEnabled() {
  if (isTransbankLocalValidation()) {
    const mode2 = (process.env.TRANSBANK_PAYMENT_MODE ?? "").trim().toLowerCase();
    if (mode2 === "webpay_plus" || mode2 === "webpay") return false;
    return true;
  }
  const mode = (process.env.TRANSBANK_PAYMENT_MODE ?? "").trim().toLowerCase();
  if (mode === "oneclick_mall" || mode === "oneclick") return true;
  if (mode === "webpay_plus" || mode === "webpay") return false;
  return Boolean(
    process.env.TRANSBANK_ONECLICK_MALL_CC?.trim() || process.env.TRANSBANK_ONECLICK_STORE_CC?.trim()
  );
}
function getOneclickMallConfig() {
  const base = getTransbankConfig();
  const isProd = base.environment === "production";
  const localValidation = isTransbankLocalValidation();
  const mallCommerceCode = localValidation ? ONECLICK_SANDBOX_MALL_CC : process.env.TRANSBANK_ONECLICK_MALL_CC?.trim() || (isProd ? "" : ONECLICK_SANDBOX_MALL_CC);
  const storeCommerceCode = localValidation ? ONECLICK_SANDBOX_STORE_CC : process.env.TRANSBANK_ONECLICK_STORE_CC?.trim() || (isProd ? "" : ONECLICK_SANDBOX_STORE_CC);
  const apiKey = localValidation ? TRANSBANK_SANDBOX_API_KEY : process.env.TRANSBANK_ONECLICK_API_KEY?.trim() || base.apiKey;
  return {
    ...base,
    commerceCode: mallCommerceCode,
    apiKey,
    mallCommerceCode,
    storeCommerceCode
  };
}
function buildOneclickReturnUrl() {
  return `${resolvePublicAppUrl()}/oneclick/retorno`;
}
function generateOneclickUsername(signupId) {
  return signupId.replace(/-/g, "").slice(0, 40);
}
function generateOneclickBuyOrders() {
  const mallBuyOrder = generateWebpayBuyOrder();
  let storeBuyOrder = generateWebpayBuyOrder();
  if (storeBuyOrder === mallBuyOrder) {
    storeBuyOrder = generateWebpayBuyOrder();
  }
  return { mallBuyOrder, storeBuyOrder };
}
function oneclickHeaders(cfg) {
  return {
    "Tbk-Api-Key-Id": cfg.mallCommerceCode,
    "Tbk-Api-Key-Secret": cfg.apiKey,
    "Content-Type": "application/json"
  };
}
function enableSandboxTlsBypass(cfg) {
  if (cfg.environment === "production") return;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
function parseJsonBody(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function cardLast4FromMasked(value) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 4 ? digits.slice(-4) : null;
}
function parseDetail(raw) {
  const d = raw && typeof raw === "object" ? raw : {};
  return {
    commerceCode: typeof d.commerce_code === "string" ? d.commerce_code : null,
    buyOrder: typeof d.buy_order === "string" ? d.buy_order : null,
    amount: typeof d.amount === "number" ? d.amount : null,
    status: typeof d.status === "string" ? d.status : null,
    responseCode: typeof d.response_code === "number" ? d.response_code : null,
    authorizationCode: typeof d.authorization_code === "string" ? d.authorization_code : null,
    paymentTypeCode: typeof d.payment_type_code === "string" ? d.payment_type_code : null
  };
}
function assertOneclickConfigured(cfg) {
  if (!cfg.mallCommerceCode || !cfg.storeCommerceCode || !cfg.apiKey) {
    throw new Error(
      "Oneclick Mall no configurado: faltan TRANSBANK_ONECLICK_MALL_CC, TRANSBANK_ONECLICK_STORE_CC o API Key"
    );
  }
}
async function startOneclickMallInscription(input) {
  const cfg = getOneclickMallConfig();
  assertOneclickConfigured(cfg);
  console.info("[oneclick] start inscription", {
    environment: cfg.environment,
    mall: cfg.mallCommerceCode,
    store: cfg.storeCommerceCode,
    username: input.username,
    response_url: input.responseUrl
  });
  enableSandboxTlsBypass(cfg);
  const res = await fetch(`${cfg.apiHost}${ONECLICK_BASE}/inscriptions`, {
    method: "POST",
    headers: oneclickHeaders(cfg),
    body: JSON.stringify({
      username: input.username,
      email: input.email,
      response_url: input.responseUrl
    })
  });
  const text = await res.text();
  const body = parseJsonBody(text);
  if (!res.ok) {
    console.error("[oneclick] start inscription failed", res.status, body);
    const msg = typeof body.error_message === "string" && body.error_message || typeof body.message === "string" && body.message || text.slice(0, 200);
    throw new Error(`Transbank rechazó la inscripción (${res.status}): ${msg}`);
  }
  const token = typeof body.token === "string" ? body.token : "";
  const urlWebpay = typeof body.url_webpay === "string" ? body.url_webpay : "";
  if (!token || !urlWebpay) {
    throw new Error("Transbank no devolvió token ni URL de inscripción");
  }
  console.log(
    "\n===== TOKEN ONECLICK INSCRIPCIÓN (TBK_TOKEN) =====\n",
    token,
    "\n===== URL INSCRIPCIÓN =====\n",
    urlWebpay,
    "\n=================================================\n"
  );
  return { token, urlWebpay, raw: body };
}
async function finishOneclickMallInscription(token) {
  const cfg = getOneclickMallConfig();
  assertOneclickConfigured(cfg);
  console.log(
    "\n===== TOKEN ONECLICK CONFIRMAR INSCRIPCIÓN =====\n",
    token,
    "\n===============================================\n"
  );
  enableSandboxTlsBypass(cfg);
  const res = await fetch(
    `${cfg.apiHost}${ONECLICK_BASE}/inscriptions/${encodeURIComponent(token)}`,
    {
      method: "PUT",
      headers: oneclickHeaders(cfg),
      body: JSON.stringify({})
    }
  );
  const text = await res.text();
  const body = parseJsonBody(text);
  const responseCode = typeof body.response_code === "number" ? body.response_code : null;
  const tbkUser = typeof body.tbk_user === "string" ? body.tbk_user : null;
  return {
    ok: res.ok && responseCode === 0 && Boolean(tbkUser),
    responseCode,
    tbkUser,
    authorizationCode: typeof body.authorization_code === "string" ? body.authorization_code : null,
    cardType: typeof body.card_type === "string" ? body.card_type : null,
    cardLast4: cardLast4FromMasked(
      typeof body.card_number === "string" ? body.card_number : null
    ),
    raw: body
  };
}
async function deleteOneclickMallInscription(tbkUser, username) {
  const cfg = getOneclickMallConfig();
  assertOneclickConfigured(cfg);
  enableSandboxTlsBypass(cfg);
  const res = await fetch(`${cfg.apiHost}${ONECLICK_BASE}/inscriptions`, {
    method: "DELETE",
    headers: oneclickHeaders(cfg),
    body: JSON.stringify({ tbk_user: tbkUser, username })
  });
  if (res.status === 204 || res.ok) {
    return { ok: true };
  }
  const text = await res.text();
  const body = parseJsonBody(text);
  const msg = typeof body.error_message === "string" && body.error_message || text.slice(0, 200);
  throw new Error(`No se pudo eliminar la inscripción (${res.status}): ${msg}`);
}
async function authorizeOneclickMallTransaction(input) {
  const cfg = getOneclickMallConfig();
  assertOneclickConfigured(cfg);
  if (!Number.isInteger(input.details[0]?.amount) || input.details[0].amount <= 0) {
    throw new Error("Monto inválido para Oneclick Mall");
  }
  console.info("[oneclick] authorize", {
    environment: cfg.environment,
    buy_order: input.buyOrder,
    username: input.username,
    details: input.details
  });
  enableSandboxTlsBypass(cfg);
  const res = await fetch(`${cfg.apiHost}${ONECLICK_BASE}/transactions`, {
    method: "POST",
    headers: oneclickHeaders(cfg),
    body: JSON.stringify({
      username: input.username,
      tbk_user: input.tbkUser,
      buy_order: input.buyOrder,
      details: input.details.map((d) => ({
        commerce_code: d.commerceCode,
        buy_order: d.buyOrder,
        amount: d.amount,
        ...d.installmentsNumber != null ? { installments_number: d.installmentsNumber } : {}
      }))
    })
  });
  const text = await res.text();
  const body = parseJsonBody(text);
  const detailsRaw = Array.isArray(body.details) ? body.details : [];
  const details = detailsRaw.map(parseDetail);
  const primary = details[0];
  const approved = res.ok && primary?.responseCode === 0 && (primary?.status === "AUTHORIZED" || primary?.status === "APPROVED");
  const cardDetail = body.card_detail && typeof body.card_detail === "object" ? body.card_detail : null;
  return {
    ok: approved,
    buyOrder: typeof body.buy_order === "string" ? body.buy_order : input.buyOrder,
    cardLast4: cardLast4FromMasked(
      (cardDetail && typeof cardDetail.card_number === "string" ? cardDetail.card_number : null) ?? (typeof body.card_number === "string" ? body.card_number : null)
    ),
    details,
    raw: body
  };
}
async function statusOneclickMallTransaction(mallBuyOrder) {
  const cfg = getOneclickMallConfig();
  assertOneclickConfigured(cfg);
  enableSandboxTlsBypass(cfg);
  const res = await fetch(
    `${cfg.apiHost}${ONECLICK_BASE}/transactions/${encodeURIComponent(mallBuyOrder)}`,
    {
      method: "GET",
      headers: oneclickHeaders(cfg)
    }
  );
  const text = await res.text();
  const body = parseJsonBody(text);
  const detailsRaw = Array.isArray(body.details) ? body.details : [];
  return {
    buyOrder: typeof body.buy_order === "string" ? body.buy_order : mallBuyOrder,
    cardLast4: cardLast4FromMasked(
      typeof body.card_number === "string" ? body.card_number : null
    ),
    details: detailsRaw.map(parseDetail),
    raw: body
  };
}
async function refundOneclickMallTransaction(input) {
  const cfg = getOneclickMallConfig();
  assertOneclickConfigured(cfg);
  enableSandboxTlsBypass(cfg);
  const res = await fetch(
    `${cfg.apiHost}${ONECLICK_BASE}/transactions/${encodeURIComponent(input.mallBuyOrder)}/refunds`,
    {
      method: "POST",
      headers: oneclickHeaders(cfg),
      body: JSON.stringify({
        commerce_code: input.storeCommerceCode,
        detail_buy_order: input.storeBuyOrder,
        amount: input.amount
      })
    }
  );
  const text = await res.text();
  const body = parseJsonBody(text);
  return {
    ok: res.ok,
    type: typeof body.type === "string" ? body.type : null,
    raw: body
  };
}
const transbankOneclickMall = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ONECLICK_SANDBOX_MALL_CC,
  ONECLICK_SANDBOX_STORE_CC,
  authorizeOneclickMallTransaction,
  buildOneclickReturnUrl,
  deleteOneclickMallInscription,
  finishOneclickMallInscription,
  generateOneclickBuyOrders,
  generateOneclickUsername,
  getOneclickMallConfig,
  isOneclickMallPaymentEnabled,
  refundOneclickMallTransaction,
  startOneclickMallInscription,
  statusOneclickMallTransaction
}, Symbol.toStringTag, { value: "Module" }));
export {
  generateOneclickBuyOrders as a,
  authorizeOneclickMallTransaction as b,
  generateOneclickUsername as c,
  buildOneclickReturnUrl as d,
  isTransbankLocalValidation as e,
  finishOneclickMallInscription as f,
  getOneclickMallConfig as g,
  statusOneclickMallTransaction as h,
  isOneclickMallPaymentEnabled as i,
  deleteOneclickMallInscription as j,
  getTransbankConfig as k,
  generateWebpayBuyOrder as l,
  generateWebpaySessionId as m,
  buildWebpayReturnUrl as n,
  createWebpayPlusTransaction as o,
  confirmWebpayPlusTransaction as p,
  refundOneclickMallTransaction as r,
  startOneclickMallInscription as s,
  transbankOneclickMall as t
};
