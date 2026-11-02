function normalizePhoneE164(raw) {
  if (!raw) return null;
  let s = String(raw).replace(/[^\d+]/g, "");
  if (!s) return null;
  if (s.startsWith("+")) {
    s = s.replace(/^\+56(0+)/, "+56");
    return s.length >= 8 ? s : null;
  }
  if (/^\d{9}$/.test(s)) return `+56${s}`;
  if (/^\d{8}$/.test(s)) return `+569${s}`;
  if (s.startsWith("56")) return `+${s}`;
  return `+${s}`;
}
function phoneLookupCandidates(raw) {
  const normalized = normalizePhoneE164(raw);
  if (!normalized) return [];
  const digits = normalized.replace(/\D/g, "");
  const out = /* @__PURE__ */ new Set([normalized, digits]);
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
function buildPhoneColumnOrFilter(columns, candidates) {
  const parts = [];
  for (const column of columns) {
    for (const phone of candidates) {
      parts.push(`${column}.eq.${phone}`);
    }
  }
  return parts.join(",");
}
export {
  buildPhoneColumnOrFilter as b,
  normalizePhoneE164 as n,
  phoneLookupCandidates as p
};
