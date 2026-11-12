/** Cliente REST Webpay Plus (Transbank) v1.2 para CuidadoWeb. */

export const TRANSBANK_SANDBOX_COMMERCE_CODE = "597055555532";
export const TRANSBANK_SANDBOX_API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";

const SANDBOX_API_HOST = "https://webpay3gint.transbank.cl";
const PRODUCTION_API_HOST = "https://webpay3g.transbank.cl";
const CREATE_PATH = "/rswebpaytransaction/api/webpay/v1.2/transactions";

export type TransbankEnvironment = "sandbox" | "production";

export type TransbankConfig = {
  environment: TransbankEnvironment;
  apiHost: string;
  commerceCode: string;
  apiKey: string;
};

export type CreateWebpayTransactionResult = {
  token: string;
  url: string;
  buyOrder: string;
  sessionId: string;
  amount: number;
};

export type ConfirmWebpayTransactionResult = {
  ok: boolean;
  status: string;
  responseCode: number | null;
  authorizationCode: string | null;
  amount: number | null;
  buyOrder: string | null;
  raw: Record<string, unknown>;
};

export function parseTransbankEnvironment(): TransbankEnvironment {
  if (process.env.TRANSBANK_FORCE_SANDBOX === "1") return "sandbox";
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
      process.env.TRANSBANK_CC?.trim() || (isProd ? "" : TRANSBANK_SANDBOX_COMMERCE_CODE),
    apiKey:
      process.env.TRANSBANK_API_KEY?.trim() || (isProd ? "" : TRANSBANK_SANDBOX_API_KEY),
  };
}

export function isTransbankConfigured(): boolean {
  const cfg = getTransbankConfig();
  return Boolean(cfg.commerceCode && cfg.apiKey);
}

export function generateWebpayBuyOrder(prefix: string): string {
  const suffix = Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${prefix}${suffix}`.replace(/[^A-Z0-9]/g, "").slice(0, 26);
}

export function generateWebpaySessionId(id: string): string {
  const compact = id.replace(/-/g, "").slice(0, 54);
  return `sess-${compact}`.slice(0, 61);
}

function headers(cfg: TransbankConfig): Record<string, string> {
  return {
    "Tbk-Api-Key-Id": cfg.commerceCode,
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

export async function createWebpayPlusTransaction(input: {
  buyOrder: string;
  sessionId: string;
  amount: number;
  returnUrl: string;
}): Promise<CreateWebpayTransactionResult> {
  const cfg = getTransbankConfig();
  if (!cfg.commerceCode || !cfg.apiKey) {
    throw new Error("Webpay Plus no configurado: faltan TRANSBANK_CC o TRANSBANK_API_KEY");
  }
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new Error("Monto inválido para Webpay Plus");
  }

  const res = await fetch(`${cfg.apiHost}${CREATE_PATH}`, {
    method: "POST",
    headers: headers(cfg),
    body: JSON.stringify({
      buy_order: input.buyOrder,
      session_id: input.sessionId,
      amount: input.amount,
      return_url: input.returnUrl,
    }),
  });
  const body = parseJson(await res.text());
  if (!res.ok) {
    const msg =
      (typeof body.error_message === "string" && body.error_message) ||
      (typeof body.message === "string" && body.message) ||
      `HTTP ${res.status}`;
    throw new Error(`Transbank rechazó la creación: ${msg}`);
  }
  const token = typeof body.token === "string" ? body.token : "";
  const url = typeof body.url === "string" ? body.url : "";
  if (!token || !url) throw new Error("Transbank no devolvió token ni URL");
  return {
    token,
    url,
    buyOrder: input.buyOrder,
    sessionId: input.sessionId,
    amount: input.amount,
  };
}

export async function confirmWebpayPlusTransaction(
  token: string,
): Promise<ConfirmWebpayTransactionResult> {
  const cfg = getTransbankConfig();
  if (!cfg.commerceCode || !cfg.apiKey) throw new Error("Webpay Plus no configurado");

  const res = await fetch(`${cfg.apiHost}${CREATE_PATH}/${encodeURIComponent(token)}`, {
    method: "PUT",
    headers: headers(cfg),
  });
  const body = parseJson(await res.text());
  const responseCode = typeof body.response_code === "number" ? body.response_code : null;
  const status = typeof body.status === "string" ? body.status : "UNKNOWN";
  const approved =
    res.ok && responseCode === 0 && (status === "AUTHORIZED" || status === "APPROVED");

  return {
    ok: approved,
    status,
    responseCode,
    authorizationCode:
      typeof body.authorization_code === "string" ? body.authorization_code : null,
    amount: typeof body.amount === "number" ? body.amount : null,
    buyOrder: typeof body.buy_order === "string" ? body.buy_order : null,
    raw: body,
  };
}

export function resolveAppUrl(): string {
  const raw = (process.env.APP_URL ?? "https://cuidadoweb.com").trim().replace(/\/$/, "");
  return raw || "https://cuidadoweb.com";
}
