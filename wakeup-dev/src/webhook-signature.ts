const HEX64 = /^[0-9a-f]{64}$/i;

function hexToBytes(hex: string): Uint8Array | null {
  const h = hex.trim().toLowerCase();
  if (!HEX64.test(h)) return null;
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function hmacKey(
  secret: string,
  usages: Array<"sign" | "verify">
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );
}

export async function hmacSha256Hex(
  secret: string,
  message: string
): Promise<string> {
  const mac = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret, ["sign"]),
    new TextEncoder().encode(message)
  );
  return [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyMac(
  secret: string,
  message: string,
  hexSig: string
): Promise<boolean> {
  const sig = hexToBytes(hexSig);
  if (!sig || !secret) return false;
  try {
    return await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret, ["verify"]),
      sig,
      new TextEncoder().encode(message)
    );
  } catch {
    return false;
  }
}

/** Lemon Squeezy: HMAC-SHA256(raw body). Header `X-Signature` (hex). */
export function verifyLemonSqueezy(
  rawBody: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  return verifyMac(secret, rawBody, signature ?? "");
}

/**
 * Stripe: HMAC-SHA256(`${t}.${rawBody}`). Header `Stripe-Signature`.
 * Rechaza replays fuera de `toleranceSec` (default 300s).
 * Acepta varios `v1` (rotación de signing secret).
 */
export async function verifyStripe(
  rawBody: string,
  header: string | null,
  secret: string,
  toleranceSec = 300
): Promise<boolean> {
  if (!header || !secret) return false;

  const v1: string[] = [];
  let t: string | undefined;
  for (const part of header.split(",")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    const k = part.slice(0, i).trim();
    const val = part.slice(i + 1).trim();
    if (k === "t") t = val;
    if (k === "v1") v1.push(val);
  }

  if (!t || !/^\d+$/.test(t) || v1.length === 0) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(t)) > toleranceSec) {
    return false;
  }

  const message = `${t}.${rawBody}`;
  const results = await Promise.all(v1.map((s) => verifyMac(secret, message, s)));
  return results.some(Boolean);
}

export type BillingProvider = "stripe" | "lemon_squeezy";

export function detectBillingProvider(request: Request): BillingProvider | null {
  if (request.headers.get("Stripe-Signature")) return "stripe";
  if (request.headers.get("X-Signature")) return "lemon_squeezy";
  return null;
}
