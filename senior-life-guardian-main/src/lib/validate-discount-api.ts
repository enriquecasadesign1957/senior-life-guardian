import type { BillingPeriod } from "@/lib/plans";
import type { PublicDiscountPreview } from "@/lib/discount-codes";

const VALIDATE_TIMEOUT_MS = 12_000;

type ValidateDiscountResponse =
  | { ok: true; discount: PublicDiscountPreview }
  | { ok: false; error?: string };

/** Valida código de convenio vía API HTTP (más fiable que server fn en dev local). */
export async function validateDiscountViaApi(
  code: string,
  plan: string,
  periodo: BillingPeriod,
): Promise<PublicDiscountPreview> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VALIDATE_TIMEOUT_MS);

  try {
    const res = await fetch("/api/public/validate-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, plan, periodo }),
      signal: controller.signal,
    });

    let json: ValidateDiscountResponse;
    try {
      json = (await res.json()) as ValidateDiscountResponse;
    } catch {
      throw new Error("Respuesta inválida del servidor.");
    }

    if (!res.ok || !json.ok || !json.discount) {
      throw new Error(json.error ?? "No pudimos validar el código.");
    }

    return json.discount;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Tiempo de espera agotado. Intenta de nuevo.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
