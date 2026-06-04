export const FAMILY_SESSION_KEY = "seniorsafe_family_session";

export type FamilyPortalSession = {
  family_member_id: string;
  contract_signup_id: string;
  nombre?: string | null;
  token?: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isFamilyPortalSession(value: unknown): value is FamilyPortalSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Record<string, unknown>;
  return (
    typeof session.family_member_id === "string" &&
    UUID_RE.test(session.family_member_id) &&
    typeof session.contract_signup_id === "string" &&
    UUID_RE.test(session.contract_signup_id)
  );
}

export function clearFamilyPortalSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FAMILY_SESSION_KEY);
}

export function readFamilyPortalSession(): FamilyPortalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FAMILY_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isFamilyPortalSession(parsed)) {
      clearFamilyPortalSession();
      return null;
    }
    return parsed;
  } catch {
    clearFamilyPortalSession();
    return null;
  }
}

export function writeFamilyPortalSession(value: unknown): FamilyPortalSession {
  if (!isFamilyPortalSession(value)) {
    throw new Error("No se pudo crear una sesión familiar válida.");
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(FAMILY_SESSION_KEY, JSON.stringify(value));
  }
  return value;
}
