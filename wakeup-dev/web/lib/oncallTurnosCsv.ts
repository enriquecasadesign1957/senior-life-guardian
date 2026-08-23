import { normalizePhone } from "@/lib/oncallCsv";

export const ONCALL_MAX_SHIFTS = 350;
export const ONCALL_DEFAULT_TZ = "America/Santiago";

export const DIA_LABELS = [
  "Dom",
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
] as const;

export type OncallShiftDraft = {
  telefono: string;
  diasRaw: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  tz: string;
  ok: boolean;
  error: string | null;
};

export type OncallShift = {
  id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  tz: string;
  activo: boolean;
  nombre: string;
  telefono: string;
};

type NestedShift = {
  id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  tz: string;
  activo: boolean;
  oncall_miembros:
    | { nombre: string; telefono: string }
    | { nombre: string; telefono: string }[]
    | null;
};

export function flattenShifts(data: unknown): OncallShift[] {
  if (!Array.isArray(data)) return [];
  return (data as NestedShift[]).map((row) => {
    const member = Array.isArray(row.oncall_miembros)
      ? row.oncall_miembros[0]
      : row.oncall_miembros;
    return {
      id: row.id,
      dia_semana: row.dia_semana,
      hora_inicio: row.hora_inicio,
      hora_fin: row.hora_fin,
      tz: row.tz,
      activo: row.activo,
      nombre: member?.nombre ?? "—",
      telefono: member?.telefono ?? "",
    };
  });
}

const PHONE_E164 = /^\+[1-9]\d{7,14}$/;
const TIME_HM = /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
const TZ_OK = /^(UTC|[A-Za-z]+\/[A-Za-z0-9_+\-]+)$/;

const DAY_ALIASES: Record<string, number> = {
  "0": 0,
  dom: 0,
  do: 0,
  domingo: 0,
  sun: 0,
  sunday: 0,
  "1": 1,
  lun: 1,
  lu: 1,
  lunes: 1,
  mon: 1,
  monday: 1,
  "2": 2,
  mar: 2,
  martes: 2,
  tue: 2,
  tuesday: 2,
  "3": 3,
  mie: 3,
  mi: 3,
  miercoles: 3,
  wed: 3,
  wednesday: 3,
  "4": 4,
  jue: 4,
  ju: 4,
  jueves: 4,
  thu: 4,
  thursday: 4,
  "5": 5,
  vie: 5,
  vi: 5,
  viernes: 5,
  fri: 5,
  friday: 5,
  "6": 6,
  sab: 6,
  sa: 6,
  sabado: 6,
  sat: 6,
  saturday: 6,
};

function fold(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
  const normalized = headers.map((h) => fold(h.replace(/^\uFEFF/, "")));
  for (const name of names) {
    const i = normalized.indexOf(name);
    if (i >= 0) return i;
  }
  return -1;
}

function parseDayToken(raw: string): number | null {
  const key = fold(raw).replace(/\./g, "");
  if (key in DAY_ALIASES) return DAY_ALIASES[key];
  return null;
}

function expandRange(from: number, to: number): number[] {
  if (from === to) return [from];
  if (from < to) {
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  }
  const out: number[] = [];
  for (let d = from; d <= 6; d += 1) out.push(d);
  for (let d = 0; d <= to; d += 1) out.push(d);
  return out;
}

export function parseDias(raw: string): number[] | null {
  const text = raw.trim();
  if (!text) return null;
  const parts = text.split(/[;/]+/).flatMap((p) => p.split(","));
  const days = new Set<number>();
  for (const part of parts) {
    const token = part.trim();
    if (!token) continue;
    const rangeParts = token.split("-").map((s) => s.trim()).filter(Boolean);
    if (rangeParts.length === 2) {
      const a = parseDayToken(rangeParts[0]);
      const b = parseDayToken(rangeParts[1]);
      if (a === null || b === null) return null;
      for (const d of expandRange(a, b)) days.add(d);
      continue;
    }
    if (rangeParts.length !== 1) return null;
    const one = parseDayToken(rangeParts[0]);
    if (one === null) return null;
    days.add(one);
  }
  if (days.size < 1) return null;
  return [...days].sort((a, b) => a - b);
}

export function normalizeTime(raw: string): string | null {
  const m = raw.trim().match(TIME_HM);
  if (!m) return null;
  const hh = m[1].padStart(2, "0");
  const mm = m[2];
  return `${hh}:${mm}`;
}

export function formatHora(value: string): string {
  return value.slice(0, 5);
}

function validateTz(raw: string): string | null {
  const tz = raw.trim() || ONCALL_DEFAULT_TZ;
  if (!TZ_OK.test(tz)) return null;
  return tz;
}

export function parseOncallTurnosCsv(
  text: string,
  knownPhones: Set<string>
): { rows: OncallShiftDraft[]; warning: string | null } {
  const cleaned = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = cleaned.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { rows: [], warning: "El archivo no tiene filas de datos." };
  }

  const sep = detectSeparator(lines[0]);
  const headers = parseCsvLine(lines[0], sep);
  const iTel = headerIndex(headers, [
    "telefono",
    "teléfono",
    "phone",
    "celular",
  ]);
  const iDias = headerIndex(headers, ["dias", "días", "days", "dia", "día"]);
  const iIni = headerIndex(headers, [
    "hora_inicio",
    "inicio",
    "desde",
    "start",
  ]);
  const iFin = headerIndex(headers, ["hora_fin", "fin", "hasta", "end"]);
  const iTz = headerIndex(headers, ["tz", "timezone", "zona", "zona_horaria"]);

  if (iTel < 0 || iDias < 0 || iIni < 0 || iFin < 0) {
    return {
      rows: [],
      warning:
        "Faltan columnas telefono, dias, hora_inicio y hora_fin. Descarga ejemplo_oncall_turnos.csv.",
    };
  }

  const rows: OncallShiftDraft[] = [];
  const seen = new Set<string>();

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line, sep);
    const telefono = normalizePhone(cols[iTel] ?? "");
    const diasRaw = cols[iDias] ?? "";
    const horaInicio = normalizeTime(cols[iIni] ?? "");
    const horaFin = normalizeTime(cols[iFin] ?? "");
    const tz = validateTz(iTz >= 0 ? (cols[iTz] ?? "") : "");
    const dias = parseDias(diasRaw);

    const push = (diaSemana: number, error: string | null) => {
      const key = `${telefono}|${diaSemana}|${horaInicio ?? ""}|${horaFin ?? ""}`;
      let err = error;
      if (!err && seen.has(key)) err = "Turno duplicado en el archivo";
      if (telefono) seen.add(key);
      rows.push({
        telefono,
        diasRaw,
        diaSemana,
        horaInicio: horaInicio ?? "",
        horaFin: horaFin ?? "",
        tz: tz ?? ONCALL_DEFAULT_TZ,
        ok: !err,
        error: err,
      });
    };

    let baseError: string | null = null;
    if (!PHONE_E164.test(telefono)) {
      baseError = "Teléfono inválido (usa E.164, ej. +56912345678)";
    } else if (knownPhones.size > 0 && !knownPhones.has(telefono)) {
      baseError = "Ese teléfono no está en Equipo on-call";
    } else if (!dias) {
      baseError = "Días inválidos (ej. 1-5, lun-vie o \"0,6\")";
    } else if (!horaInicio || !horaFin) {
      baseError = "Hora inválida (usa HH:MM)";
    } else if (!tz) {
      baseError = "Zona horaria inválida (ej. America/Santiago)";
    }

    if (baseError || !dias) {
      push(dias?.[0] ?? 0, baseError ?? "Días inválidos");
      continue;
    }
    for (const d of dias) push(d, null);
  }

  let warning: string | null = null;
  if (rows.length > ONCALL_MAX_SHIFTS) {
    warning = `Solo se importan los primeros ${ONCALL_MAX_SHIFTS} turnos.`;
  }
  return { rows: rows.slice(0, ONCALL_MAX_SHIFTS), warning };
}
