import {
  decideLasCondesDiscount,
  type LasCondesDecision,
  type LasCondesTier,
} from "@/lib/tarjeta-vecino";

const PORTAL_URL = "https://portalvecino.lascondes.cl/api/public/comercio/consultar";
const PORTAL_TIMEOUT_MS = 8_000;

type PortalPayload = {
  found?: boolean;
  estado?: string;
  tipo_vecino?: string;
};

export class TarjetaVecinoPortalError extends Error {
  constructor(message = "No pudimos consultar el portal de Tarjeta Vecino. Intenta nuevamente en unos minutos.") {
    super(message);
    this.name = "TarjetaVecinoPortalError";
  }
}

export async function consultarTarjetaVecino(
  formattedRut: string,
  tier: LasCondesTier,
  periodo: "mensual" | "anual",
): Promise<LasCondesDecision> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PORTAL_TIMEOUT_MS);

  try {
    const res = await fetch(PORTAL_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ rut: formattedRut }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new TarjetaVecinoPortalError();
    }

    let payload: PortalPayload;
    try {
      payload = (await res.json()) as PortalPayload;
    } catch {
      throw new TarjetaVecinoPortalError();
    }

    return decideLasCondesDiscount({
      tier,
      periodo,
      found: payload.found === true,
      estado: typeof payload.estado === "string" ? payload.estado : "",
      tipo: typeof payload.tipo_vecino === "string" ? payload.tipo_vecino : "",
    });
  } catch (err) {
    if (err instanceof TarjetaVecinoPortalError) throw err;
    throw new TarjetaVecinoPortalError();
  } finally {
    clearTimeout(timeout);
  }
}
