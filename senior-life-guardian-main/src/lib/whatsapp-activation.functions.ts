import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { markSignupWhatsAppActivated } from "@/lib/whatsapp-commercial-activation";

const Schema = z.object({
  signupId: z.string().uuid(),
});

/** Vincula WhatsApp al completar la primera pulsación S.O.S en la app (sin escribir ACTIVAR). */
export const activateWhatsAppFromApp = createServerFn({ method: "POST" })
  .inputValidator((input) => Schema.parse(input))
  .handler(async ({ data }) => {
    return markSignupWhatsAppActivated(data.signupId);
  });
