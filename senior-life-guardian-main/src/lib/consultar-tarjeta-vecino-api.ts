import type { BillingPeriod } from "@/lib/plans";

const CONSULTA_TIMEOUT_MS = 12_000;

export type TarjetaVecinoConsulta = {
  activo: boolean;
  adultoMayor: boolean;
  eligible: boolean;
  estado: string;
  tipo: string;
  message: string;
  alternateCode?: string;
  alternateUrl?: string;
};

type ConsultaResponse =
  | ({ ok: true } & TarjetaVecinoConsulta)
  | { ok: false; error?: string };

export async function consultarTarjetaVecinoViaApi(input: {
  rut: string;
  code: string;
  periodo: BillingPeriod;
}): Promise<TarjetaVecinoConsulta> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONSULTA_TIMEOUT_MS);

  try {
    const res = await fetch("/api/public/consultar-tarjeta-vecino", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    let json: ConsultaResponse;
    try {
      json = (await res.json()) as ConsultaResponse;
    } catch {
      throw new Error("Respuesta inválida del servidor.");
    }

    if (!res.ok || !json.ok) {
      throw new Error(("error" in json && json.error) || "No pudimos consultar la Tarjeta Vecino.");
    }

    return json;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Tiempo de espera agotado. Intenta de nuevo.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
