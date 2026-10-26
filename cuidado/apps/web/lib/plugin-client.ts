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

export type SiteProbe = {
  /** true = WP signals found; false = reachable page without WP; null = blocked by a waiting gate */
  wordpress: boolean | null;
  gate: boolean;
};

const GATE_MARKERS = [
  "one moment, please",
  "just a moment",
  "checking your browser",
  "checking if the site connection is secure",
  "enable javascript and cookies",
  "cf-browser-verification",
  "cf-challenge",
  "attention required",
  "ddos protection by",
  "please wait while we verify",
];

export function htmlLooksLikeWordPress(html: string): boolean {
  const low = html.toLowerCase();
  return (
    low.includes("wp-content") ||
    low.includes("wp-includes") ||
    low.includes("wp-json") ||
    low.includes("wordpress") ||
    /name=["']generator["'][^>]*wordpress/i.test(html) ||
    /wordpress\s+\d/i.test(html)
  );
}

export function htmlLooksLikeWaitingGate(html: string): boolean {
  const low = html.toLowerCase();
  return GATE_MARKERS.some((marker) => low.includes(marker));
}

export function headersLookLikeWordPress(headers: Headers): boolean {
  const link = headers.get("link") ?? "";
  if (/api\.w\.org/i.test(link) || /wp-json/i.test(link)) return true;
  const powered = headers.get("x-powered-by") ?? "";
  return /wordpress/i.test(powered);
}

async function readBodyText(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  let received = 0;
  const chunks: Uint8Array[] = [];
  while (received < 65_536) {
    const step = await reader.read();
    if (step.done) break;
    chunks.push(step.value);
    received += step.value.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  return Buffer.concat(chunks).toString("utf8");
}

async function fetchOnce(url: URL, signal: AbortSignal): Promise<Response> {
  const response = await fetch(url, { redirect: "manual", signal });
  if (response.status < 300 || response.status >= 400) return response;
  const next = response.headers.get("location");
  if (!next) return response;
  const followed = await assertPublicUrl(new URL(next, url).toString());
  return fetch(followed, { redirect: "manual", signal });
}

function mergeProbe(current: SiteProbe, next: SiteProbe): SiteProbe {
  const gate = current.gate || next.gate;
  if (current.wordpress === true || next.wordpress === true) {
    return { wordpress: true, gate: false };
  }
  if (current.wordpress === null || next.wordpress === null || gate) {
    return { wordpress: null, gate };
  }
  return { wordpress: false, gate: false };
}

function probeFromResponse(response: Response, body: string): SiteProbe {
  if (headersLookLikeWordPress(response.headers) || htmlLooksLikeWordPress(body)) {
    return { wordpress: true, gate: false };
  }
  if (htmlLooksLikeWaitingGate(body)) {
    return { wordpress: null, gate: true };
  }
  const type = response.headers.get("content-type") ?? "";
  if (/application\/json/i.test(type)) {
    try {
      const data = JSON.parse(body) as { namespaces?: unknown; name?: unknown; description?: unknown };
      if (Array.isArray(data.namespaces) || typeof data.name === "string" || typeof data.description === "string") {
        if (/wordpress/i.test(JSON.stringify(data))) return { wordpress: true, gate: false };
      }
    } catch {
      // ignore malformed JSON
    }
  }
  return { wordpress: false, gate: false };
}

async function probePath(base: URL, path: string, signal: AbortSignal): Promise<SiteProbe> {
  const response = await fetchOnce(new URL(path, base), signal);
  const body = await readBodyText(response);
  return probeFromResponse(response, body);
}

/** Confirms WordPress from homepage, headers, wp-json and wp-login when a waiting gate blocks the HTML. */
export async function probeSite(baseUrl: string): Promise<SiteProbe> {
  const url = await assertPublicUrl(baseUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    let result = await probePath(url, "/", controller.signal);
    if (result.wordpress === true) return result;
    for (const path of ["/wp-json/", "/wp-login.php"]) {
      try {
        result = mergeProbe(result, await probePath(url, path, controller.signal));
        if (result.wordpress === true) return result;
      } catch {
        // keep probing other paths
      }
    }
    if (result.gate) return { wordpress: null, gate: true };
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return { wordpress: null, gate: false };
  } finally {
    clearTimeout(timer);
  }
}

export async function detectWordPress(baseUrl: string): Promise<boolean> {
  const probe = await probeSite(baseUrl);
  return probe.wordpress === true;
}
