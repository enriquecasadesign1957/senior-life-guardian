import { payloadOverLimit, pluginErrorSchema, snapshotSchema, type Snapshot } from "@cuidado/contract";
import { ApiError } from "./errors";
import { assertPublicUrl } from "./urls";

export type PluginFailure = {
  ok: false;
  code: "INNODB_REQUIRED" | "PAYLOAD_LIMIT" | "PAIR_EXPIRED" | "PAIR_INVALID" | "UNAUTHORIZED" | "UNREACHABLE";
  message: string;
  counts?: Snapshot["counts"];
};

async function pluginFetch(baseUrl: string, path: string, init: RequestInit): Promise<Response> {
  const url = await assertPublicUrl(baseUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(new URL(path, url), {
      ...init,
      redirect: "manual",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function redeemPairCode(
  baseUrl: string,
  code: string,
  secret: string,
): Promise<{ siteName: string; homeUrl: string; wpVersion: string; phpVersion: string }> {
  let response: Response;
  try {
    response = await pluginFetch(baseUrl, "/wp-json/cuidado/v1/pair/redeem", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, secret }),
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("UNREACHABLE", "No pudimos hablar con el sitio.", 502);
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = readPluginError(body);
    const codeName = parsed.success ? parsed.data.code : "PAIR_INVALID";
    const message = codeName === "PAIR_EXPIRED" ? "El código venció. Genera otro." : "El código no sirve.";
    throw new ApiError(codeName, message, response.status === 429 ? 429 : 401);
  }
  return {
    siteName: String(body?.siteName ?? ""),
    homeUrl: String(body?.homeUrl ?? baseUrl),
    wpVersion: String(body?.wpVersion ?? ""),
    phpVersion: String(body?.phpVersion ?? ""),
  };
}

export async function readSnapshot(baseUrl: string, secret: string): Promise<Snapshot | PluginFailure> {
  let response: Response;
  try {
    response = await pluginFetch(baseUrl, "/wp-json/cuidado/v1/snapshot", {
      method: "GET",
      headers: { authorization: `Bearer ${secret}` },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return { ok: false, code: "UNREACHABLE", message: "No pudimos leer el sitio." };
  }
  const body = await response.json().catch(() => null);
  if (response.ok) {
    const parsed = snapshotSchema.safeParse(body);
    if (!parsed.success || parsed.data.engine !== "InnoDB") {
      return { ok: false, code: "INNODB_REQUIRED", message: "La base del sitio no usa InnoDB." };
    }
    if (payloadOverLimit(parsed.data.counts, parsed.data.bytes)) {
      return {
        ok: false,
        code: "PAYLOAD_LIMIT",
        message: "La limpieza supera 2000 filas o 32 MB.",
        counts: parsed.data.counts,
      };
    }
    return parsed.data;
  }
  const parsed = readPluginError(body);
  if (!parsed.success) {
    return { ok: false, code: "UNREACHABLE", message: "El conector no respondió un informe válido." };
  }
  return { ok: false, code: parsed.data.code, message: parsed.data.message, counts: parsed.data.counts };
}

function readPluginError(body: unknown) {
  const record = body as { code?: unknown; message?: unknown; data?: { counts?: unknown } } | null;
  return pluginErrorSchema.safeParse({
    code: record?.code,
    message: typeof record?.message === "string" ? record.message : "El conector rechazó la lectura.",
    counts: record?.data?.counts,
  });
}

async function readHtmlMarker(response: Response): Promise<boolean> {
  const reader = response.body?.getReader();
  if (!reader) return false;
  let received = 0;
  const chunks: Uint8Array[] = [];
  while (received < 65_536) {
    const step = await reader.read();
    if (step.done) break;
    chunks.push(step.value);
    received += step.value.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  const html = Buffer.concat(chunks).toString("utf8").toLowerCase();
  return html.includes("wp-content") || html.includes("wp-includes") || html.includes("wordpress");
}

export async function detectWordPress(baseUrl: string): Promise<boolean> {
  const url = await assertPublicUrl(baseUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, { redirect: "manual", signal: controller.signal });
    if (response.status >= 300 && response.status < 400) {
      const next = response.headers.get("location");
      if (!next) return false;
      const followed = await assertPublicUrl(new URL(next, url).toString());
      const second = await fetch(followed, { redirect: "manual", signal: controller.signal });
      return readHtmlMarker(second);
    }
    return readHtmlMarker(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return false;
  } finally {
    clearTimeout(timer);
  }
}
