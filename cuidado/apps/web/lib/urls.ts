import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ApiError } from "./errors";

export function normalizeSiteUrl(input: string): string {
  const withScheme = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new ApiError("INVALID_URL", "La dirección no se entiende.", 400);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ApiError("INVALID_URL", "La dirección tiene que empezar por https.", 400);
  }
  if (url.username || url.password) {
    throw new ApiError("INVALID_URL", "La dirección no puede llevar usuario ni contraseña.", 400);
  }
  url.hash = "";
  url.search = "";
  url.hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.pathname !== "/") {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }
  return url.origin + (url.pathname === "/" ? "" : url.pathname);
}

export async function assertPublicUrl(input: string): Promise<URL> {
  const normalized = normalizeSiteUrl(input);
  const url = new URL(normalized);
  if (process.env.ALLOW_PRIVATE_URLS === "true") {
    return url;
  }
  if (url.hostname === "localhost" || url.hostname.endsWith(".local") || url.hostname.endsWith(".internal")) {
    throw new ApiError("URL_BLOCKED", "Esa dirección no se puede revisar desde aquí.", 400);
  }
  const literal = isIP(url.hostname);
  if (literal && isPrivateAddress(url.hostname)) {
    throw new ApiError("URL_BLOCKED", "Esa dirección no se puede revisar desde aquí.", 400);
  }
  if (!literal) {
    const records = await lookup(url.hostname, { all: true, verbatim: true });
    if (records.length === 0 || records.some((record) => isPrivateAddress(record.address))) {
      throw new ApiError("URL_BLOCKED", "Esa dirección no se puede revisar desde aquí.", 400);
    }
  }
  return url;
}

function isPrivateAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const parts = address.split(".").map((part) => Number(part));
    const a = parts[0] ?? 0;
    const b = parts[1] ?? 0;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }
  if (version === 6) {
    const lower = address.toLowerCase().split("%")[0] ?? "";
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped?.[1]) return isPrivateAddress(mapped[1]);
    const mappedHex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (mappedHex?.[1] && mappedHex[2]) {
      const high = Number.parseInt(mappedHex[1], 16);
      const low = Number.parseInt(mappedHex[2], 16);
      const dotted = `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
      return isPrivateAddress(dotted);
    }
    if (lower === "::1" || lower === "::") return true;
    return (
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      lower.startsWith("fe8") ||
      lower.startsWith("fe9") ||
      lower.startsWith("fea") ||
      lower.startsWith("feb")
    );
  }
  return true;
}
