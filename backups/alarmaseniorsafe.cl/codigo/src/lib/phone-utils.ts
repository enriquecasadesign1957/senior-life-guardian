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

/** Variantes comunes del mismo móvil chileno para búsquedas en BD. */
export function phoneLookupCandidates(raw: string | null | undefined): string[] {
  const normalized = normalizePhoneE164(raw);
  if (!normalized) return [];

  const digits = normalized.replace(/\D/g, "");
  const out = new Set<string>([normalized, digits]);

  if (digits.startsWith("56") && digits.length >= 11) {
    out.add(`+${digits}`);
    out.add(digits.slice(2));
    const local = digits.slice(-9);
    if (/^9\d{8}$/.test(local)) out.add(local);
  }

  if (/^9\d{8}$/.test(digits)) {
    out.add(`+56${digits}`);
    out.add(`56${digits}`);
  }

  return [...out];
}

/** Filtro PostgREST `or=(telefono.eq.X,whatsapp.eq.X,...)` para columnas de teléfono. */
export function buildPhoneColumnOrFilter(
  columns: string[],
  candidates: string[],
): string {
  const parts: string[] = [];
  for (const column of columns) {
    for (const phone of candidates) {
      parts.push(`${column}.eq.${phone}`);
    }
  }
  return parts.join(",");
}
