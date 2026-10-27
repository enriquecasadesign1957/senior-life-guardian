/**
 * Convenio Tarjeta Vecino (Las Condes).
 * El portal público devuelve estado y tipo_vecino a partir del RUT.
 * El tipo no demuestra que la tarjeta esté activa: sin tarjeta también puede venir "RESIDENTE".
 */

export const LAS_CONDES_CODE = "VECINO-LASCONDES";
export const LAS_CONDES_AM_CODE = "VECINO-LASCONDES-AM";
export const LAS_CONDES_CHECKOUT_ORIGIN = "https://alarmaseniorsafe.cl";

export type LasCondesTier = "general" | "adulto_mayor";

export type ParsedChileanRut = {
  body: string;
  dv: string;
  formatted: string;
};

const INACTIVE_ESTADOS = new Set([
  "MENOR",
  "BLOQUEADO",
  "ANULADA",
  "TARJETA_BLOQUEADA",
  "VENCIDO",
  "VENCIDO_PERIODO",
  "SIN_TARJETA",
  "ELIMINADO",
]);

export function normalizeDiscountCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function lasCondesTier(rawCode: string | null | undefined): LasCondesTier | null {
  const code = normalizeDiscountCode(rawCode ?? "");
  if (code === LAS_CONDES_AM_CODE) return "adulto_mayor";
  if (code === LAS_CONDES_CODE) return "general";
  return null;
}

export function computeRutDv(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const rest = 11 - (sum % 11);
  if (rest === 11) return "0";
  if (rest === 10) return "K";
  return String(rest);
}

export function formatChileanRut(body: string, dv: string): string {
  const groups: string[] = [];
  for (let i = body.length; i > 0; i -= 3) {
    groups.unshift(body.slice(Math.max(0, i - 3), i));
  }
  return `${groups.join(".")}-${dv}`;
}

/** Acepta 12.345.678-5, 12345678-5 o 123456785. Rechaza dígito verificador incorrecto. */
export function parseChileanRut(raw: string): ParsedChileanRut | null {
  const compact = raw.trim().toUpperCase().replace(/\./g, "").replace(/\s+/g, "");
  const match = compact.match(/^(\d{7,8})-?([0-9K])$/);
  if (!match) return null;
  const body = match[1];
  const dv = match[2];
  if (computeRutDv(body) !== dv) return null;
  return { body, dv, formatted: formatChileanRut(body, dv) };
}

export function normalizePortalToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Tarjeta usable para el convenio.
 * ELIMINADO no cuenta, aunque el portal a veces lo pinte como vigente.
 * RENOVACION sigue vigente: el vecino debe actualizar domicilio, pero la tarjeta no está vencida.
 */
export function isTarjetaVecinoActiva(found: boolean | undefined, estadoRaw: string): boolean {
  const estado = normalizePortalToken(estadoRaw);
  if (INACTIVE_ESTADOS.has(estado)) return false;
  if (estado === "RENOVACION") return true;
  if (found === true) return true;
  if (estado === "VIGENTE" || estado === "ACTIVA" || estado === "ACTIVO") return true;
  return false;
}

/**
 * Coincidencias explícitas. No basta "MAYOR" suelto ni el tipo que el portal devuelve
 * cuando no hay tarjeta (por ejemplo RESIDENTE).
 */
export function isAdultoMayorTipo(tipoRaw: string): boolean {
  const token = normalizePortalToken(tipoRaw);
  if (!token) return false;
  const compact = token.replace(/_/g, "");
  if (compact.includes("ADULTO") && compact.includes("MAYOR")) return true;
  if (compact.includes("TERCERAEDAD")) return true;
  if (compact.includes("SENIOR")) return true;
  const parts = token.split("_").filter(Boolean);
  return parts.includes("AM");
}

export function lasCondesCheckoutPath(code: string, periodo: "mensual" | "anual"): string {
  const params = new URLSearchParams({
    mode: "contratar",
    plan: "unico",
    periodo,
    codigo: code,
  });
  return `/checkout?${params.toString()}`;
}

export function lasCondesCheckoutUrl(code: string, periodo: "mensual" | "anual"): string {
  return `${LAS_CONDES_CHECKOUT_ORIGIN}${lasCondesCheckoutPath(code, periodo)}`;
}

export type LasCondesDecision = {
  activo: boolean;
  adultoMayor: boolean;
  eligible: boolean;
  estado: string;
  tipo: string;
  message: string;
  alternateCode?: string;
  alternateUrl?: string;
};

export function decideLasCondesDiscount(input: {
  tier: LasCondesTier;
  periodo: "mensual" | "anual";
  found?: boolean;
  estado?: string | null;
  tipo?: string | null;
}): LasCondesDecision {
  const estado = (input.estado ?? "").trim();
  const tipo = (input.tipo ?? "").trim();
  const activo = isTarjetaVecinoActiva(input.found, estado);
  const adultoMayor = isAdultoMayorTipo(tipo);
  const estadoLabel = normalizePortalToken(estado) || "SIN_DATO";
  const tipoLabel = normalizePortalToken(tipo) || "SIN_DATO";

  if (!activo) {
    return {
      activo: false,
      adultoMayor,
      eligible: false,
      estado,
      tipo,
      message: `No encontramos una Tarjeta Vecino activa para ese RUT (estado: ${estadoLabel}). El descuento solo aplica con la tarjeta vigente.`,
    };
  }

  if (input.tier === "adulto_mayor" && !adultoMayor) {
    const alternateCode = LAS_CONDES_CODE;
    return {
      activo: true,
      adultoMayor: false,
      eligible: false,
      estado,
      tipo,
      alternateCode,
      alternateUrl: lasCondesCheckoutUrl(alternateCode, input.periodo),
      message:
        `La tarjeta está activa, pero el portal no la identifica como Adulto Mayor (tipo: ${tipoLabel}). ` +
        `El 20% no aplica. El 15% de Tarjeta Vecino está en ${lasCondesCheckoutUrl(alternateCode, input.periodo)}.`,
    };
  }

  if (input.tier === "general" && adultoMayor) {
    const alternateCode = LAS_CONDES_AM_CODE;
    return {
      activo: true,
      adultoMayor: true,
      eligible: true,
      estado,
      tipo,
      alternateCode,
      alternateUrl: lasCondesCheckoutUrl(alternateCode, input.periodo),
      message:
        "Tarjeta Vecino vigente. Este enlace aplica 15%. Si tu tarjeta es Adulto Mayor, puedes usar el 20% en el otro convenio.",
    };
  }

  return {
    activo: true,
    adultoMayor,
    eligible: true,
    estado,
    tipo,
    message: adultoMayor
      ? "Tarjeta Vecino Adulto Mayor vigente. El 20% queda aplicado."
      : "Tarjeta Vecino vigente. El 15% queda aplicado.",
  };
}
