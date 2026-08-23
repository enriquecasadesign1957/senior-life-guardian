import { getCloudflareContext } from "@opennextjs/cloudflare";

export function wakeupApiUrl(): string {
  return (process.env.WAKEUP_API_URL || "https://api.wakeupdev.com").replace(
    /\/$/,
    ""
  );
}

type CfEnv = {
  BILLING_INTERNAL_SECRET?: string;
  WAKEUP_API_URL?: string;
  WAKEUP_API?: { fetch: typeof fetch };
};

async function cloudflareEnv(): Promise<CfEnv> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return (ctx.env ?? {}) as CfEnv;
  } catch {
    return {};
  }
}

export async function billingInternalSecret(): Promise<string | null> {
  const cf = await cloudflareEnv();
  const secret = (
    cf.BILLING_INTERNAL_SECRET ||
    process.env.BILLING_INTERNAL_SECRET ||
    ""
  ).trim();
  return secret || null;
}

export async function callWakeupBilling(
  path: string,
  body: unknown
): Promise<{ status: number; payload: Record<string, unknown> }> {
  const secret = await billingInternalSecret();
  if (!secret) {
    return { status: 503, payload: { error: "Cobro Chile no configurado" } };
  }

  const headers = {
    "Content-Type": "application/json",
    "x-wakeup-internal": secret,
  };
  const init: RequestInit = {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  };

  const cf = await cloudflareEnv();
  let res: Response;
  try {
    if (cf.WAKEUP_API?.fetch) {
      res = await cf.WAKEUP_API.fetch(
        new Request(`https://wakeup-api.internal${path}`, init)
      );
    } else {
      res = await fetch(`${wakeupApiUrl()}${path}`, init);
    }
  } catch {
    return { status: 0, payload: { error: "network" } };
  }

  const payload = (await res.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  return { status: res.status, payload };
}

export function htmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function transbankRedirectHtml(token: string, urlWebpay: string): string {
  const action = htmlEscape(urlWebpay);
  const tbk = htmlEscape(token);
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redirigiendo a Transbank…</title>
</head>
<body>
  <p>Redirigiendo a Transbank para inscribir tu tarjeta…</p>
  <form id="tbk" method="POST" action="${action}">
    <input type="hidden" name="TBK_TOKEN" value="${tbk}" />
  </form>
  <script>document.getElementById("tbk").submit();</script>
</body>
</html>`;
}
