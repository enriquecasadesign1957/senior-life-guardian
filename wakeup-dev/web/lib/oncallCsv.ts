export const ONCALL_MAX_MEMBERS = 50;

export type OncallDraft = {
  nombre: string;
  telefono: string;
  orden: number;
  email: string;
  ok: boolean;
  error: string | null;
};

const PHONE_E164 = /^\+[1-9]\d{7,14}$/;

export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  let digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`;
  if (digits.startsWith("+")) {
    return `+${digits.slice(1).replace(/\D/g, "")}`;
  }
  const only = digits.replace(/\D/g, "");
  if (only.startsWith("56") && only.length >= 11) return `+${only}`;
  if (only.startsWith("9") && only.length === 9) return `+56${only}`;
  if (only.length >= 8) return `+${only}`;
  return only ? `+${only}` : "";
}

export function validateDraft(input: {
  nombre: string;
  telefono: string;
  orden: number;
  email: string;
}): OncallDraft {
  const nombre = input.nombre.trim();
  const telefono = normalizePhone(input.telefono);
  const email = input.email.trim();
  const orden = Number.isInteger(input.orden)
    ? Math.min(100, Math.max(1, input.orden))
    : 1;

  let error: string | null = null;
  if (!nombre) error = "Falta el nombre";
  else if (!PHONE_E164.test(telefono))
    error = "Teléfono inválido (usa E.164, ej. +56912345678)";
  else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    error = "Email inválido";

  return {
    nombre,
    telefono,
    orden,
    email,
    ok: !error,
    error,
  };
}

function parseCsvLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === sep && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function detectSeparator(headerLine: string): string {
  const commas = (headerLine.match(/,/g) ?? []).length;
  const semis = (headerLine.match(/;/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

function headerIndex(headers: string[], names: string[]): number {
  const normalized = headers.map((h) =>
    h
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  );
  for (const name of names) {
    const i = normalized.indexOf(name);
    if (i >= 0) return i;
  }
  return -1;
}

export function parseOncallCsv(text: string): {
  rows: OncallDraft[];
  warning: string | null;
} {
  const cleaned = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = cleaned.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { rows: [], warning: "El archivo no tiene filas de datos." };
  }

  const sep = detectSeparator(lines[0]);
  const headers = parseCsvLine(lines[0], sep);
  const iNombre = headerIndex(headers, ["nombre", "name", "miembro"]);
  const iTel = headerIndex(headers, [
    "telefono",
    "teléfono",
    "phone",
    "celular",
    "mobile",
  ]);
  const iOrden = headerIndex(headers, [
    "orden",
    "order",
    "escalamiento",
    "prioridad",
  ]);
  const iEmail = headerIndex(headers, ["email", "correo", "mail"]);

  if (iNombre < 0 || iTel < 0) {
    return {
      rows: [],
      warning:
        "Faltan columnas nombre y telefono. Descarga ejemplo_oncall.csv.",
    };
  }

  const seen = new Set<string>();
  const rows: OncallDraft[] = [];
  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line, sep);
    const ordenRaw = iOrden >= 0 ? Number.parseInt(cols[iOrden] ?? "", 10) : rows.length + 1;
    const draft = validateDraft({
      nombre: cols[iNombre] ?? "",
      telefono: cols[iTel] ?? "",
      orden: Number.isInteger(ordenRaw) ? ordenRaw : rows.length + 1,
      email: iEmail >= 0 ? (cols[iEmail] ?? "") : "",
    });
    if (draft.ok && seen.has(draft.telefono)) {
      draft.ok = false;
      draft.error = "Teléfono duplicado en el archivo";
    }
    if (draft.telefono) seen.add(draft.telefono);
    rows.push(draft);
  }

  let warning: string | null = null;
  if (rows.length > ONCALL_MAX_MEMBERS) {
    warning = `Solo se importan los primeros ${ONCALL_MAX_MEMBERS} miembros.`;
  }
  return {
    rows: rows.slice(0, ONCALL_MAX_MEMBERS),
    warning,
  };
}
