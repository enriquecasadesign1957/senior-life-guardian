// Normalización compartida de teléfonos chilenos a E.164.
// No-throw: devuelve null si no se puede normalizar.
export function normalizePhoneE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = String(raw).replace(/[^\d+]/g, "");
  if (!s) return null;
  if (s.startsWith("+")) {
    // limpiar ceros sobrantes después del país (+56 0 9...)
    s = s.replace(/^\+56(0+)/, "+56");
    return s.length >= 8 ? s : null;
  }
  // 9 dígitos => +56XXXXXXXXX
  if (/^\d{9}$/.test(s)) return `+56${s}`;
  if (/^\d{8}$/.test(s)) return `+569${s}`;
  if (s.startsWith("56")) return `+${s}`;
  return `+${s}`;
}
