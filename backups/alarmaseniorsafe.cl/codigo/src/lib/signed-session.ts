type SessionKind = "senior" | "family";

export type SignedSessionPayload = {
  typ: SessionKind;
  /** signupId (senior) o family_member_id (family). */
  sub: string;
  /** contract_signup_id — solo sesión familia. */
  signup?: string;
  exp: number;
  iat: number;
};

function getSigningSecret(): string {
  const secret =
    process.env.SENIOR_ACCESS_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) {
    throw new Error("Sesión no configurada (falta SENIOR_ACCESS_SECRET o CRON_SECRET).");
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toBase64Url(new Uint8Array(sig));
}

/** Emite token HMAC firmado con TTL. */
export async function issueSignedSession(
  payload: Pick<SignedSessionPayload, "typ" | "sub" | "signup">,
  ttlMs: number,
): Promise<string> {
  const now = Date.now();
  const full: SignedSessionPayload = { ...payload, iat: now, exp: now + ttlMs };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(full)));
  const sig = await hmacSign(body, getSigningSecret());
  return `${body}.${sig}`;
}

/** Verifica firma, tipo, expiración y campos esperados. */
export async function verifySignedSession(
  token: string,
  expected: { typ: SessionKind; sub?: string; signup?: string },
): Promise<SignedSessionPayload> {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) throw new Error("Token inválido.");
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = await hmacSign(body, getSigningSecret());
  if (sig !== expectedSig) throw new Error("Token inválido.");

  const payload = JSON.parse(fromBase64Url(body)) as SignedSessionPayload;
  if (payload.typ !== expected.typ) throw new Error("Token inválido.");
  if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
    throw new Error("Sesión expirada.");
  }
  if (expected.sub && payload.sub !== expected.sub) throw new Error("Token inválido.");
  if (expected.signup && payload.signup !== expected.signup) throw new Error("Token inválido.");
  return payload;
}
