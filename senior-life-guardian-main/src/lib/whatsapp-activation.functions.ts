import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertSeniorAccess, seniorAccessTokenSchema } from "@/lib/senior-access-auth";
import { markSignupWhatsAppActivated } from "@/lib/whatsapp-commercial-activation";

const Schema = z.object({
  signupId: z.string().uuid(),
  accessToken: seniorAccessTokenSchema,
});

/** Vincula WhatsApp al completar la primera pulsación S.O.S en la app (sin escribir ACTIVAR). */
export const activateWhatsAppFromApp = createServerFn({ method: "POST" })
  .inputValidator((input) => Schema.parse(input))
  .handler(async ({ data }) => {
    await assertSeniorAccess(data.signupId, data.accessToken);
    return markSignupWhatsAppActivated(data.signupId);
  });
