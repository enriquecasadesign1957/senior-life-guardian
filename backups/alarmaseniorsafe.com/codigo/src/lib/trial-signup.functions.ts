import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TRIAL_DISABLED_MSG =
  "El período de prueba gratuita está deshabilitado. Contrata Senior Safe con pago Webpay en /checkout.";

/**
 * Trial de 7 días deshabilitado antes del lanzamiento (evita costos Twilio).
 * Se mantiene el export por compatibilidad con imports existentes.
 */
export const activateTrialSignup = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        nombre: z.string().min(2).max(160),
        email: z.string().email().max(255),
        telefono: z.string().min(8).max(40),
        direccion: z.string().max(255).nullable().optional(),
        plan: z.string().min(1).max(30).optional(),
        periodo: z.string().min(1).max(30).optional(),
      })
      .parse(input),
  )
  .handler(async () => {
    throw new Error(TRIAL_DISABLED_MSG);
  });
