import {
  decideLasCondesDiscount,
  mapOficialTarjetaVecino,
  type LasCondesDecision,
  type LasCondesTier,
  type OficialTarjetaVecino,
} from "@/lib/tarjeta-vecino";

const TARJETA_API_URL = "https://api.lascondes.cl/maestros/vecinos/tarjeta";
const TARJETA_API_TIMEOUT_MS = 8_000;

export class TarjetaVecinoPortalError extends Error {
  constructor(
    message = "No pudimos consultar la Tarjeta Vecino. Intenta nuevamente en unos minutos.",
  ) {
    super(message);
    this.name = "TarjetaVecinoPortalError";
  }
}

function rutSinPuntos(formattedRut: string): string {
  return formattedRut.replace(/\./g, "").replace(/\s+/g, "");
}

export async function consultarTarjetaVecino(
  formattedRut: string,
  tier: LasCondesTier,
  periodo: "mensual" | "anual",
): Promise<LasCondesDecision> {
  const token = process.env.LAS_CONDES_TARJETA_API_TOKEN?.trim();
  if (!token) {
    throw new TarjetaVecinoPortalError(
      "La consulta de Tarjeta Vecino no está configurada en el servidor.",
    );
  }

  const rut = rutSinPuntos(formattedRut);
  if (!/^\d{7,8}-[0-9K]$/i.test(rut)) {
    throw new TarjetaVecinoPortalError("Ingresa un RUT chileno válido, con dígito verificador.");
  }

  const url = new URL(TARJETA_API_URL);
  url.searchParams.set("rut", rut.toUpperCase());

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TARJETA_API_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    if (res.status === 401 || res.status === 403) {
      throw new TarjetaVecinoPortalError(
        "La municipalidad rechazó la credencial de consulta de Tarjeta Vecino.",
      );
    }
    if (!res.ok) {
      throw new TarjetaVecinoPortalError();
    }

    let payload: { vecino?: OficialTarjetaVecino | null };
    try {
      payload = (await res.json()) as { vecino?: OficialTarjetaVecino | null };
    } catch {
      throw new TarjetaVecinoPortalError();
    }

    const mapped = mapOficialTarjetaVecino(payload.vecino);
    return decideLasCondesDiscount({
      tier,
      periodo,
      found: mapped.found,
      estado: mapped.estado,
      tipo: mapped.tipo,
    });
  } catch (err) {
    if (err instanceof TarjetaVecinoPortalError) throw err;
    throw new TarjetaVecinoPortalError();
  } finally {
    clearTimeout(timeout);
  }
}
