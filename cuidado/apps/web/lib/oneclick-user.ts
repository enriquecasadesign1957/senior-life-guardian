const ANON_EMAIL_SUFFIX = "@users.cuidadoweb.invalid";
const ONECLICK_FALLBACK_EMAIL = "enriquecasadesign@gmail.com";

/** Transbank rechaza el correo sintético de la sesión anónima. */
export function oneclickEmailForUser(email: string | null | undefined): string {
  const value = (email ?? "").trim();
  if (!value || value.toLowerCase().endsWith(ANON_EMAIL_SUFFIX)) return ONECLICK_FALLBACK_EMAIL;
  return value;
}

export function oneclickUsernameForUser(userId: string): string {
  return `cw${userId.replace(/-/g, "").slice(0, 12)}`;
}
