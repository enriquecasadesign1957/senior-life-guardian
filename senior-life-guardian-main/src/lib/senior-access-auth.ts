import { z } from "zod";
import { issueSignedSession, verifySignedSession } from "@/lib/signed-session";

/** 90 días — cubre renovaciones anuales con margen. */
export const SENIOR_ACCESS_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/** 30 días — portal familia. */
export const FAMILY_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const SENIOR_ACCESS_TOKEN_KEY = "seniorsafe_access_token";
export const SENIOR_ACCESS_TOKEN_FOR_KEY = "seniorsafe_access_token_for";

function readStoredSignupIdLocal(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem("seniorsafe_user") ||
      localStorage.getItem("seniorsafe_user_backup") ||
      localStorage.getItem("seniorsafe_native_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string };
    return typeof parsed.id === "string" ? parsed.id : null;
  } catch {
    return null;
  }
}

export const seniorAccessTokenSchema = z.string().min(32).max(512);

export async function issueSeniorAccessToken(signupId: string): Promise<string> {
  return issueSignedSession({ typ: "senior", sub: signupId }, SENIOR_ACCESS_TTL_MS);
}

export async function issueFamilySessionToken(
  familyMemberId: string,
  contractSignupId: string,
): Promise<string> {
  return issueSignedSession(
    { typ: "family", sub: familyMemberId, signup: contractSignupId },
    FAMILY_SESSION_TTL_MS,
  );
}

export async function assertSeniorAccess(signupId: string, accessToken?: string): Promise<void> {
  if (!accessToken?.trim()) {
    throw new Error(
      "Se requiere autenticación. Abre la app desde tu enlace de instalación o inicia sesión de nuevo.",
    );
  }
  await verifySignedSession(accessToken.trim(), { typ: "senior", sub: signupId });
}

export async function assertFamilySession(
  familyMemberId: string,
  contractSignupId: string,
  sessionToken?: string,
): Promise<void> {
  if (!sessionToken?.trim()) {
    throw new Error("Sesión inválida. Ingresa de nuevo al Portal Familia.");
  }
  await verifySignedSession(sessionToken.trim(), {
    typ: "family",
    sub: familyMemberId,
    signup: contractSignupId,
  });
}

function tokenMatchesAccount(accountId: string | null | undefined): boolean {
  if (!accountId || typeof window === "undefined") return true;
  const forId = localStorage.getItem(SENIOR_ACCESS_TOKEN_FOR_KEY);
  return !forId || forId === accountId;
}

/** Lee token de acceso senior desde storage del navegador. */
export function readSeniorAccessToken(expectedSignupId?: string | null): string | null {
  if (typeof window === "undefined") return null;
  const accountId = expectedSignupId ?? readStoredSignupIdLocal();
  try {
    const direct = localStorage.getItem(SENIOR_ACCESS_TOKEN_KEY);
    if (direct && tokenMatchesAccount(accountId)) return direct;
    const raw =
      sessionStorage.getItem("seniorsafe_user") ||
      localStorage.getItem("seniorsafe_user_backup") ||
      localStorage.getItem("seniorsafe_native_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string; accessToken?: string };
    if (typeof parsed.accessToken !== "string") return null;
    if (accountId && parsed.id && parsed.id !== accountId) return null;
    return parsed.accessToken;
  } catch {
    return null;
  }
}

export function clearSeniorAccessToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SENIOR_ACCESS_TOKEN_KEY);
    localStorage.removeItem(SENIOR_ACCESS_TOKEN_FOR_KEY);
    for (const key of ["seniorsafe_user", "seniorsafe_user_backup", "seniorsafe_native_user"] as const) {
      const raw = key === "seniorsafe_user" ? sessionStorage.getItem(key) : localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (!("accessToken" in parsed)) continue;
      const { accessToken: _removed, ...rest } = parsed;
      const next = JSON.stringify(rest);
      if (key === "seniorsafe_user") sessionStorage.setItem(key, next);
      else localStorage.setItem(key, next);
    }
  } catch {
    /* ignore */
  }
}

/** Persiste token junto al handoff de usuario. */
export function persistSeniorAccessToken(token: string, signupId?: string | null): void {
  if (typeof window === "undefined") return;
  const accountId = signupId ?? readStoredSignupIdLocal();
  try {
    localStorage.setItem(SENIOR_ACCESS_TOKEN_KEY, token);
    if (accountId) localStorage.setItem(SENIOR_ACCESS_TOKEN_FOR_KEY, accountId);
    const raw =
      sessionStorage.getItem("seniorsafe_user") ||
      localStorage.getItem("seniorsafe_user_backup") ||
      localStorage.getItem("seniorsafe_native_user");
    const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const payload = { ...existing, accessToken: token, ...(accountId ? { id: accountId } : {}) };
    sessionStorage.setItem("seniorsafe_user", JSON.stringify(payload));
    localStorage.setItem("seniorsafe_user_backup", JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

/** Token requerido para server functions; lanza si falta o no coincide con la cuenta. */
export function requireSeniorAccessToken(signupId?: string | null): string {
  const token = readSeniorAccessToken(signupId);
  if (!token) {
    throw new Error("Sesión expirada. Abre la app desde tu enlace de instalación.");
  }
  return token;
}
