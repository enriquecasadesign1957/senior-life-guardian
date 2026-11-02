const FAMILY_SESSION_KEY = "seniorsafe_family_session";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isFamilyPortalSession(value) {
  if (!value || typeof value !== "object") return false;
  const session = value;
  return typeof session.family_member_id === "string" && UUID_RE.test(session.family_member_id) && typeof session.contract_signup_id === "string" && UUID_RE.test(session.contract_signup_id) && typeof session.token === "string" && session.token.length >= 32;
}
function clearFamilyPortalSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FAMILY_SESSION_KEY);
}
function readFamilyPortalSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FAMILY_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
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
function writeFamilyPortalSession(value) {
  if (!isFamilyPortalSession(value)) {
    throw new Error("No se pudo crear una sesión familiar válida.");
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(FAMILY_SESSION_KEY, JSON.stringify(value));
  }
  return value;
}
export {
  clearFamilyPortalSession as c,
  readFamilyPortalSession as r,
  writeFamilyPortalSession as w
};
