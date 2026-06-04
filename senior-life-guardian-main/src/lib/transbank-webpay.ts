/**
 * Cliente REST oficial Webpay Plus (Transbank) v1.2.
 * @see https://www.transbankdevelopers.cl/referencia/webpay
 */

/** Código de comercio integración Webpay Plus (sandbox público). */
export const TRANSBANK_SANDBOX_COMMERCE_CODE = "597055555532";

/** API Key secreta integración (sandbox público). */
export const TRANSBANK_SANDBOX_API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";

const SANDBOX_API_HOST = "https://webpay3gint.transbank.cl";
const PRODUCTION_API_HOST = "https://webpay3g.transbank.cl";

/** Dominio oficial — fallback si el hosting no expone URL pública o apunta a localhost. */
export const OFFICIAL_APP_URL = "https://alarmaseniorsafe.cl";

const CREATE_PATH = "/rswebpaytransaction/api/webpay/v1.2/transactions";

export type TransbankEnvironment = "sandbox" | "production";

export type TransbankConfig = {
  environment: TransbankEnvironment;
  apiHost: string;
  commerceCode: string;
  apiKey: string;
};

export type CreateWebpayTransactionInput = {
  buyOrder: string;
  sessionId: string;
  amount: number;
  returnUrl: string;
};

export type CreateWebpayTransactionResult = {
  /** Token oficial Transbank (se envía como token_ws al formulario POST). */
  token: string;
  /** URL de la pasarela (webpayserver/initTransaction en integración). */
  url: string;
  buyOrder: string;
  sessionId: string;
  amount: number;
  raw: Record<string, unknown>;
};

export type ConfirmWebpayTransactionResult = {
  ok: boolean;
  status: string;
  responseCode: number | null;
  authorizationCode: string | null;
  amount: number | null;
  buyOrder: string | null;
  cardLast4: string | null;
  raw: Record<string, unknown>;
};

function normalizeAppBaseUrl(raw: string | undefined): string | null {
  const trimmed = (raw ?? "").trim().replace(/\/$/, "");
  if (!trimmed) return null;
  if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function resolvePublicAppUrl(): string {
  const fromEnv =
    normalizeAppBaseUrl(process.env.PUBLIC_APP_URL) ||
    normalizeAppBaseUrl(process.env.WEBPAY_RETURN_URL) ||
    normalizeAppBaseUrl(process.env.WEBPAY_FINAL_URL) ||
    normalizeAppBaseUrl(process.env.APP_URL) ||
    normalizeAppBaseUrl(process.env.VITE_PUBLIC_APP_URL);

  return fromEnv ?? OFFICIAL_APP_URL;
}

export function buildWebpayReturnUrl(): string {
  return `${resolvePublicAppUrl()}/webpay/retorno`;
}

function parseTransbankEnvironment(): TransbankEnvironment {
  const raw = (process.env.TRANSBANK_ENVIRONMENT ?? "sandbox").trim().toLowerCase();
  if (raw === "production" || raw === "prod") return "production";
  return "sandbox";
}

export function getTransbankConfig(): TransbankConfig {
  const environment = parseTransbankEnvironment();
  const isProd = environment === "production";
  return {
    environment,
    apiHost: isProd ? PRODUCTION_API_HOST : SANDBOX_API_HOST,
    commerceCode:
      process.env.TRANSBANK_CC?.trim() ||
      (isProd ? "" : TRANSBANK_SANDBOX_COMMERCE_CODE),
    apiKey:
      process.env.TRANSBANK_API_KEY?.trim() ||
      (isProd ? "" : TRANSBANK_SANDBOX_API_KEY),
  };
}

/** buy_order: máx. 26, alfanumérico (requisito Transbank). */
export function generateWebpayBuyOrder(): string {
  const suffix = Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `SS${suffix}`.slice(0, 26);
}

/** session_id: máx. 61 caracteres. */
export function generateWebpaySessionId(signupId: string): string {
  const compact = signupId.replace(/-/g, "").slice(0, 54);
  return `sess-${compact}`.slice(0, 61);
}

function transbankHeaders(cfg: TransbankConfig): Record<string, string> {
  return {
    "Tbk-Api-Key-Id": cfg.commerceCode,
    "Tbk-Api-Key-Secret": cfg.apiKey,
    "Content-Type": "application/json",
  };
}

function enableSandboxTlsBypass(cfg: TransbankConfig) {
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

/**
 * Crea transacción en servidores Transbank (POST /transactions).
 * Devuelve token + url para redirigir al tarjetahabiente.
 */
export async function createWebpayPlusTransaction(
  input: CreateWebpayTransactionInput,
): Promise<CreateWebpayTransactionResult> {
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
    return_url: input.returnUrl,
  };

  console.info("[transbank] create transaction", {
    environment: cfg.environment,
    host: cfg.apiHost,
    commerceCode: cfg.commerceCode,
    buy_order: input.buyOrder,
    amount: input.amount,
    return_url: input.returnUrl,
  });

  enableSandboxTlsBypass(cfg);

  const res = await fetch(`${cfg.apiHost}${CREATE_PATH}`, {
    method: "POST",
    headers: transbankHeaders(cfg),
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  const body = parseJsonBody(text);

  if (!res.ok) {
    console.error("[transbank] create failed", res.status, body);
    const msg =
      (typeof body.error_message === "string" && body.error_message) ||
      (typeof body.message === "string" && body.message) ||
      text.slice(0, 200);
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
    "\n====================================\n",
  );

  return {
    token,
    url,
    buyOrder: input.buyOrder,
    sessionId: input.sessionId,
    amount: input.amount,
    raw: body,
  };
}

/**
 * Confirma (commit) la transacción tras el retorno con token_ws (PUT /transactions/{token}).
 */
export async function confirmWebpayPlusTransaction(
  token: string,
): Promise<ConfirmWebpayTransactionResult> {
  const cfg = getTransbankConfig();
  if (!cfg.commerceCode || !cfg.apiKey) {
    throw new Error("Webpay Plus no configurado");
  }

  console.log(
    "\n===== TOKEN TRANSBANK DE PRUEBA (confirm) =====\n",
    token,
    "\n=============================================\n",
  );

  enableSandboxTlsBypass(cfg);

  const res = await fetch(`${cfg.apiHost}${CREATE_PATH}/${encodeURIComponent(token)}`, {
    method: "PUT",
    headers: transbankHeaders(cfg),
  });

  const text = await res.text();
  const body = parseJsonBody(text);

  const responseCode =
    typeof body.response_code === "number" ? body.response_code : null;
  const status = typeof body.status === "string" ? body.status : "UNKNOWN";
  const approved =
    res.ok &&
    responseCode === 0 &&
    (status === "AUTHORIZED" || status === "APPROVED");

  const cardDetail =
    body.card_detail && typeof body.card_detail === "object"
      ? (body.card_detail as Record<string, unknown>)
      : null;

  return {
    ok: approved,
    status,
    responseCode,
    authorizationCode:
      typeof body.authorization_code === "string" ? body.authorization_code : null,
    amount: typeof body.amount === "number" ? body.amount : null,
    buyOrder: typeof body.buy_order === "string" ? body.buy_order : null,
    cardLast4:
      cardDetail && typeof cardDetail.card_number === "string"
        ? cardDetail.card_number
        : null,
    raw: body,
  };
}
