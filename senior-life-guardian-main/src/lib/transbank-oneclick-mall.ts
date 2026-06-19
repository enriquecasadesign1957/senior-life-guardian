/**
 * Cliente REST Oneclick Mall (Transbank) v1.2.
 * @see https://www.transbankdevelopers.cl/referencia/oneclick
 */

import {
  generateWebpayBuyOrder,
  getTransbankConfig,
  isTransbankLocalValidation,
  resolvePublicAppUrl,
  TRANSBANK_SANDBOX_API_KEY,
  type TransbankConfig,
  type TransbankEnvironment,
} from "@/lib/transbank-webpay";

/** Mall integración (sandbox público). */
export const ONECLICK_SANDBOX_MALL_CC = "597055555541";

/** Tienda 1 integración (sandbox público). */
export const ONECLICK_SANDBOX_STORE_CC = "597055555542";

const ONECLICK_BASE = "/rswebpaytransaction/api/oneclick/v1.2";

export type OneclickMallConfig = TransbankConfig & {
  mallCommerceCode: string;
  storeCommerceCode: string;
};

export type StartInscriptionInput = {
  username: string;
  email: string;
  responseUrl: string;
};

export type StartInscriptionResult = {
  token: string;
  urlWebpay: string;
  raw: Record<string, unknown>;
};

export type FinishInscriptionResult = {
  ok: boolean;
  responseCode: number | null;
  tbkUser: string | null;
  authorizationCode: string | null;
  cardType: string | null;
  cardLast4: string | null;
  raw: Record<string, unknown>;
};

export type AuthorizeMallDetail = {
  commerceCode: string;
  buyOrder: string;
  amount: number;
  installmentsNumber?: number;
};

export type AuthorizeMallInput = {
  username: string;
  tbkUser: string;
  buyOrder: string;
  details: AuthorizeMallDetail[];
};

export type AuthorizeMallDetailResult = {
  commerceCode: string | null;
  buyOrder: string | null;
  amount: number | null;
  status: string | null;
  responseCode: number | null;
  authorizationCode: string | null;
  paymentTypeCode: string | null;
};

export type AuthorizeMallResult = {
  ok: boolean;
  buyOrder: string | null;
  cardLast4: string | null;
  details: AuthorizeMallDetailResult[];
  raw: Record<string, unknown>;
};

export type RefundMallInput = {
  mallBuyOrder: string;
  storeCommerceCode: string;
  storeBuyOrder: string;
  amount: number;
};

export type RefundMallResult = {
  ok: boolean;
  type: string | null;
  raw: Record<string, unknown>;
};

export type StatusMallResult = {
  buyOrder: string | null;
  cardLast4: string | null;
  details: AuthorizeMallDetailResult[];
  raw: Record<string, unknown>;
};

function parseTransbankEnvironment(): TransbankEnvironment {
  return getTransbankConfig().environment;
}

export function isOneclickMallPaymentEnabled(): boolean {
  if (isTransbankLocalValidation()) {
    const mode = (process.env.TRANSBANK_PAYMENT_MODE ?? "").trim().toLowerCase();
    if (mode === "webpay_plus" || mode === "webpay") return false;
    return true;
  }
  const mode = (process.env.TRANSBANK_PAYMENT_MODE ?? "").trim().toLowerCase();
  if (mode === "oneclick_mall" || mode === "oneclick") return true;
  if (mode === "webpay_plus" || mode === "webpay") return false;
  return Boolean(
    process.env.TRANSBANK_ONECLICK_MALL_CC?.trim() ||
      process.env.TRANSBANK_ONECLICK_STORE_CC?.trim(),
  );
}

export function getOneclickMallConfig(): OneclickMallConfig {
  const base = getTransbankConfig();
  const isProd = base.environment === "production";
  const localValidation = isTransbankLocalValidation();

  const mallCommerceCode = localValidation
    ? ONECLICK_SANDBOX_MALL_CC
    : process.env.TRANSBANK_ONECLICK_MALL_CC?.trim() ||
      (isProd ? "" : ONECLICK_SANDBOX_MALL_CC);

  const storeCommerceCode = localValidation
    ? ONECLICK_SANDBOX_STORE_CC
    : process.env.TRANSBANK_ONECLICK_STORE_CC?.trim() ||
      (isProd ? "" : ONECLICK_SANDBOX_STORE_CC);

  const apiKey = localValidation
    ? TRANSBANK_SANDBOX_API_KEY
    : process.env.TRANSBANK_ONECLICK_API_KEY?.trim() || base.apiKey;

  return {
    ...base,
    commerceCode: mallCommerceCode,
    apiKey,
    mallCommerceCode,
    storeCommerceCode,
  };
}

export function buildOneclickReturnUrl(): string {
  return `${resolvePublicAppUrl()}/oneclick/retorno`;
}

/** username: máx. 40 alfanumérico (requisito Transbank). */
export function generateOneclickUsername(signupId: string): string {
  return signupId.replace(/-/g, "").slice(0, 40);
}

export function generateOneclickBuyOrders(): { mallBuyOrder: string; storeBuyOrder: string } {
  const mallBuyOrder = generateWebpayBuyOrder();
  let storeBuyOrder = generateWebpayBuyOrder();
  if (storeBuyOrder === mallBuyOrder) {
    storeBuyOrder = generateWebpayBuyOrder();
  }
  return { mallBuyOrder, storeBuyOrder };
}

function oneclickHeaders(cfg: OneclickMallConfig): Record<string, string> {
  return {
    "Tbk-Api-Key-Id": cfg.mallCommerceCode,
    "Tbk-Api-Key-Secret": cfg.apiKey,
    "Content-Type": "application/json",
  };
}

function enableSandboxTlsBypass(cfg: OneclickMallConfig) {
  if (cfg.environment === "production") return;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

function parseJsonBody(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function cardLast4FromMasked(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 4 ? digits.slice(-4) : null;
}

function parseDetail(raw: unknown): AuthorizeMallDetailResult {
  const d = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    commerceCode: typeof d.commerce_code === "string" ? d.commerce_code : null,
    buyOrder: typeof d.buy_order === "string" ? d.buy_order : null,
    amount: typeof d.amount === "number" ? d.amount : null,
    status: typeof d.status === "string" ? d.status : null,
    responseCode: typeof d.response_code === "number" ? d.response_code : null,
    authorizationCode:
      typeof d.authorization_code === "string" ? d.authorization_code : null,
    paymentTypeCode:
      typeof d.payment_type_code === "string" ? d.payment_type_code : null,
  };
}

function assertOneclickConfigured(cfg: OneclickMallConfig) {
  if (!cfg.mallCommerceCode || !cfg.storeCommerceCode || !cfg.apiKey) {
    throw new Error(
      "Oneclick Mall no configurado: faltan TRANSBANK_ONECLICK_MALL_CC, TRANSBANK_ONECLICK_STORE_CC o API Key",
    );
  }
}

export async function startOneclickMallInscription(
  input: StartInscriptionInput,
): Promise<StartInscriptionResult> {
  const cfg = getOneclickMallConfig();
  assertOneclickConfigured(cfg);

  console.info("[oneclick] start inscription", {
    environment: cfg.environment,
    mall: cfg.mallCommerceCode,
    store: cfg.storeCommerceCode,
    username: input.username,
    response_url: input.responseUrl,
  });

  enableSandboxTlsBypass(cfg);

  const res = await fetch(`${cfg.apiHost}${ONECLICK_BASE}/inscriptions`, {
    method: "POST",
    headers: oneclickHeaders(cfg),
    body: JSON.stringify({
      username: input.username,
      email: input.email,
      response_url: input.responseUrl,
    }),
  });

  const text = await res.text();
  const body = parseJsonBody(text);

  if (!res.ok) {
    console.error("[oneclick] start inscription failed", res.status, body);
    const msg =
      (typeof body.error_message === "string" && body.error_message) ||
      (typeof body.message === "string" && body.message) ||
      text.slice(0, 200);
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
    "\n=================================================\n",
  );

  return { token, urlWebpay, raw: body };
}

export async function finishOneclickMallInscription(
  token: string,
): Promise<FinishInscriptionResult> {
  const cfg = getOneclickMallConfig();
  assertOneclickConfigured(cfg);

  console.log(
    "\n===== TOKEN ONECLICK CONFIRMAR INSCRIPCIÓN =====\n",
    token,
    "\n===============================================\n",
  );

  enableSandboxTlsBypass(cfg);

  const res = await fetch(
    `${cfg.apiHost}${ONECLICK_BASE}/inscriptions/${encodeURIComponent(token)}`,
    {
      method: "PUT",
      headers: oneclickHeaders(cfg),
      body: JSON.stringify({}),
    },
  );

  const text = await res.text();
  const body = parseJsonBody(text);

  const responseCode =
    typeof body.response_code === "number" ? body.response_code : null;
  const tbkUser = typeof body.tbk_user === "string" ? body.tbk_user : null;

  return {
    ok: res.ok && responseCode === 0 && Boolean(tbkUser),
    responseCode,
    tbkUser,
    authorizationCode:
      typeof body.authorization_code === "string" ? body.authorization_code : null,
    cardType: typeof body.card_type === "string" ? body.card_type : null,
    cardLast4: cardLast4FromMasked(
      typeof body.card_number === "string" ? body.card_number : null,
    ),
    raw: body,
  };
}

export async function deleteOneclickMallInscription(
  tbkUser: string,
  username: string,
): Promise<{ ok: boolean }> {
  const cfg = getOneclickMallConfig();
  assertOneclickConfigured(cfg);
  enableSandboxTlsBypass(cfg);

  const res = await fetch(`${cfg.apiHost}${ONECLICK_BASE}/inscriptions`, {
    method: "DELETE",
    headers: oneclickHeaders(cfg),
    body: JSON.stringify({ tbk_user: tbkUser, username }),
  });

  if (res.status === 204 || res.ok) {
    return { ok: true };
  }

  const text = await res.text();
  const body = parseJsonBody(text);
  const msg =
    (typeof body.error_message === "string" && body.error_message) ||
    text.slice(0, 200);
  throw new Error(`No se pudo eliminar la inscripción (${res.status}): ${msg}`);
}

export async function authorizeOneclickMallTransaction(
  input: AuthorizeMallInput,
): Promise<AuthorizeMallResult> {
  const cfg = getOneclickMallConfig();
  assertOneclickConfigured(cfg);

  if (!Number.isInteger(input.details[0]?.amount) || input.details[0].amount <= 0) {
    throw new Error("Monto inválido para Oneclick Mall");
  }

  console.info("[oneclick] authorize", {
    environment: cfg.environment,
    buy_order: input.buyOrder,
    username: input.username,
    details: input.details,
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
        ...(d.installmentsNumber != null
          ? { installments_number: d.installmentsNumber }
          : {}),
      })),
    }),
  });

  const text = await res.text();
  const body = parseJsonBody(text);

  const detailsRaw = Array.isArray(body.details) ? body.details : [];
  const details = detailsRaw.map(parseDetail);
  const primary = details[0];
  const approved =
    res.ok &&
    primary?.responseCode === 0 &&
    (primary?.status === "AUTHORIZED" || primary?.status === "APPROVED");

  const cardDetail =
    body.card_detail && typeof body.card_detail === "object"
      ? (body.card_detail as Record<string, unknown>)
      : null;

  return {
    ok: approved,
    buyOrder: typeof body.buy_order === "string" ? body.buy_order : input.buyOrder,
    cardLast4: cardLast4FromMasked(
      (cardDetail && typeof cardDetail.card_number === "string"
        ? cardDetail.card_number
        : null) ??
        (typeof body.card_number === "string" ? body.card_number : null),
    ),
    details,
    raw: body,
  };
}

export async function statusOneclickMallTransaction(
  mallBuyOrder: string,
): Promise<StatusMallResult> {
  const cfg = getOneclickMallConfig();
  assertOneclickConfigured(cfg);
  enableSandboxTlsBypass(cfg);

  const res = await fetch(
    `${cfg.apiHost}${ONECLICK_BASE}/transactions/${encodeURIComponent(mallBuyOrder)}`,
    {
      method: "GET",
      headers: oneclickHeaders(cfg),
    },
  );

  const text = await res.text();
  const body = parseJsonBody(text);
  const detailsRaw = Array.isArray(body.details) ? body.details : [];

  return {
    buyOrder: typeof body.buy_order === "string" ? body.buy_order : mallBuyOrder,
    cardLast4: cardLast4FromMasked(
      typeof body.card_number === "string" ? body.card_number : null,
    ),
    details: detailsRaw.map(parseDetail),
    raw: body,
  };
}

export async function refundOneclickMallTransaction(
  input: RefundMallInput,
): Promise<RefundMallResult> {
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
        amount: input.amount,
      }),
    },
  );

  const text = await res.text();
  const body = parseJsonBody(text);

  return {
    ok: res.ok,
    type: typeof body.type === "string" ? body.type : null,
    raw: body,
  };
}

export function oneclickEnvironmentLabel(): TransbankEnvironment {
  return parseTransbankEnvironment();
}
