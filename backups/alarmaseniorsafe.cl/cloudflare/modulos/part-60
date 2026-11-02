import process from "node:process";
import { s as stringType } from "../_libs/zod.mjs";
function getSigningSecret() {
  const secret = process.env.SENIOR_ACCESS_SECRET?.trim() || process.env.CRON_SECRET?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) {
    throw new Error("Sesión no configurada (falta SENIOR_ACCESS_SECRET o CRON_SECRET).");
  }
  return secret;
}
function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - padded.length % 4);
  return atob(padded + pad);
}
async function hmacSign(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toBase64Url(new Uint8Array(sig));
}
async function issueSignedSession(payload, ttlMs) {
  const now = Date.now();
  const full = { ...payload, iat: now, exp: now + ttlMs };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(full)));
  const sig = await hmacSign(body, getSigningSecret());
  return `${body}.${sig}`;
}
async function verifySignedSession(token, expected) {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) throw new Error("Token inválido.");
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = await hmacSign(body, getSigningSecret());
  if (sig !== expectedSig) throw new Error("Token inválido.");
  const payload = JSON.parse(fromBase64Url(body));
  if (payload.typ !== expected.typ) throw new Error("Token inválido.");
  if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
    throw new Error("Sesión expirada.");
  }
  if (expected.sub && payload.sub !== expected.sub) throw new Error("Token inválido.");
  if (expected.signup && payload.signup !== expected.signup) throw new Error("Token inválido.");
  return payload;
}
const SENIOR_ACCESS_TTL_MS = 90 * 24 * 60 * 60 * 1e3;
const FAMILY_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1e3;
const SENIOR_ACCESS_TOKEN_KEY = "seniorsafe_access_token";
const SENIOR_ACCESS_TOKEN_FOR_KEY = "seniorsafe_access_token_for";
function readStoredSignupIdLocal() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("seniorsafe_user") || localStorage.getItem("seniorsafe_user_backup") || localStorage.getItem("seniorsafe_native_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed.id === "string" ? parsed.id : null;
  } catch {
    return null;
  }
}
const seniorAccessTokenSchema = stringType().min(32).max(512);
async function issueSeniorAccessToken(signupId) {
  return issueSignedSession({ typ: "senior", sub: signupId }, SENIOR_ACCESS_TTL_MS);
}
async function issueFamilySessionToken(familyMemberId, contractSignupId) {
  return issueSignedSession(
    { typ: "family", sub: familyMemberId, signup: contractSignupId },
    FAMILY_SESSION_TTL_MS
  );
}
async function assertSeniorAccess(signupId, accessToken) {
  if (!accessToken?.trim()) {
    throw new Error(
      "Se requiere autenticación. Abre la app desde tu enlace de instalación o inicia sesión de nuevo."
    );
  }
  await verifySignedSession(accessToken.trim(), { typ: "senior", sub: signupId });
}
async function assertFamilySession(familyMemberId, contractSignupId, sessionToken) {
  if (!sessionToken?.trim()) {
    throw new Error("Sesión inválida. Ingresa de nuevo al Portal Familia.");
  }
  await verifySignedSession(sessionToken.trim(), {
    typ: "family",
    sub: familyMemberId,
    signup: contractSignupId
  });
}
function tokenMatchesAccount(accountId) {
  if (!accountId || typeof window === "undefined") return true;
  const forId = localStorage.getItem(SENIOR_ACCESS_TOKEN_FOR_KEY);
  return !forId || forId === accountId;
}
function readSeniorAccessToken(expectedSignupId) {
  if (typeof window === "undefined") return null;
  const accountId = expectedSignupId ?? readStoredSignupIdLocal();
  try {
    const direct = localStorage.getItem(SENIOR_ACCESS_TOKEN_KEY);
    if (direct && tokenMatchesAccount(accountId)) return direct;
    const raw = sessionStorage.getItem("seniorsafe_user") || localStorage.getItem("seniorsafe_user_backup") || localStorage.getItem("seniorsafe_native_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.accessToken !== "string") return null;
    if (accountId && parsed.id && parsed.id !== accountId) return null;
    return parsed.accessToken;
  } catch {
    return null;
  }
}
function clearSeniorAccessToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SENIOR_ACCESS_TOKEN_KEY);
    localStorage.removeItem(SENIOR_ACCESS_TOKEN_FOR_KEY);
    for (const key of ["seniorsafe_user", "seniorsafe_user_backup", "seniorsafe_native_user"]) {
      const raw = key === "seniorsafe_user" ? sessionStorage.getItem(key) : localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!("accessToken" in parsed)) continue;
      const { accessToken: _removed, ...rest } = parsed;
      const next = JSON.stringify(rest);
      if (key === "seniorsafe_user") sessionStorage.setItem(key, next);
      else localStorage.setItem(key, next);
    }
  } catch {
  }
}
function persistSeniorAccessToken(token, signupId) {
  if (typeof window === "undefined") return;
  const accountId = signupId ?? readStoredSignupIdLocal();
  try {
    localStorage.setItem(SENIOR_ACCESS_TOKEN_KEY, token);
    if (accountId) localStorage.setItem(SENIOR_ACCESS_TOKEN_FOR_KEY, accountId);
    const raw = sessionStorage.getItem("seniorsafe_user") || localStorage.getItem("seniorsafe_user_backup") || localStorage.getItem("seniorsafe_native_user");
    const existing = raw ? JSON.parse(raw) : {};
    const payload = { ...existing, accessToken: token, ...accountId ? { id: accountId } : {} };
    sessionStorage.setItem("seniorsafe_user", JSON.stringify(payload));
    localStorage.setItem("seniorsafe_user_backup", JSON.stringify(payload));
  } catch {
  }
}
function requireSeniorAccessToken(signupId) {
  const token = readSeniorAccessToken(signupId);
  if (!token) {
    throw new Error("Sesión expirada. Abre la app desde tu enlace de instalación.");
  }
  return token;
}
const seniorAccessAuth = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  FAMILY_SESSION_TTL_MS,
  SENIOR_ACCESS_TOKEN_FOR_KEY,
  SENIOR_ACCESS_TOKEN_KEY,
  SENIOR_ACCESS_TTL_MS,
  assertFamilySession,
  assertSeniorAccess,
  clearSeniorAccessToken,
  issueFamilySessionToken,
  issueSeniorAccessToken,
  persistSeniorAccessToken,
  readSeniorAccessToken,
  requireSeniorAccessToken,
  seniorAccessTokenSchema
}, Symbol.toStringTag, { value: "Module" }));
export {
  assertSeniorAccess as a,
  assertFamilySession as b,
  issueSeniorAccessToken as c,
  requireSeniorAccessToken as d,
  clearSeniorAccessToken as e,
  seniorAccessAuth as f,
  issueFamilySessionToken as i,
  persistSeniorAccessToken as p,
  readSeniorAccessToken as r,
  seniorAccessTokenSchema as s,
  verifySignedSession as v
};
