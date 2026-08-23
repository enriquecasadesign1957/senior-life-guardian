export const OAUTH_NEXT_COOKIE = "wakeup_oauth_next";

export function safeAuthNext(raw: string | null | undefined): string {
  if (!raw) return "/dashboard";
  let path = raw.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    return "/dashboard";
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return "/dashboard";
  }
  if (path.startsWith("/billing/transbank/start")) return path;
  if (path === "/dashboard" || path.startsWith("/dashboard?")) return path;
  if (path === "/gracias" || path.startsWith("/gracias?")) return path;
  return "/dashboard";
}
