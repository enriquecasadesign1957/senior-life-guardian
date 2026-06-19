import { PRODUCTION_SITE_URL, SENIOR_SAFE_INSTALL_GUIDE_URL } from "@/lib/app-url";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { seniorSafeWhatsAppMeUrl } from "@/lib/twilio";
import { isWhatsAppActivationMessage, normalizeTwilioPhone } from "@/lib/twilio-inbound";

export const WHATSAPP_ACTIVATION_KEYWORD = "ACTIVAR";
export const SENIOR_SAFE_CHECKOUT_URL = `${PRODUCTION_SITE_URL}/checkout?mode=contratar&plan=unico`;

export type SignupActivationRow = {
  id: string;
  nombre: string | null;
  telefono: string | null;
  payment_status: string;
  subscription_status: string | null;
  whatsapp_activated: boolean | null;
};

function phoneLast9(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

function firstName(nombre: string | null | undefined): string {
  return nombre?.split(/\s+/)?.[0] ?? "usuario";
}

export async function findSignupForActivation(phone: string): Promise<SignupActivationRow | null> {
  const last9 = phoneLast9(normalizeTwilioPhone(phone));
  if (last9.length < 8) return null;

  const { data: users } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("id, nombre, telefono, payment_status, subscription_status, whatsapp_activated")
    .limit(300);

  return (
    (users ?? []).find((u) => {
      const t = (u.telefono || "").replace(/\D/g, "");
      return t.endsWith(last9);
    }) ?? null
  );
}

export function isSignupPaymentComplete(paymentStatus: string | null | undefined): boolean {
  return paymentStatus === "paid" || paymentStatus === "comp";
}

export function isActivationKeyword(body: string): boolean {
  return isWhatsAppActivationMessage((body || "").trim().toUpperCase());
}

export function whatsAppActivarUrl(): string {
  return seniorSafeWhatsAppMeUrl(WHATSAPP_ACTIVATION_KEYWORD);
}

/**
 * Vincula WhatsApp solo si hay cuenta con pago confirmado.
 * Devuelve null si el mensaje no es ACTIVAR (u otra keyword de activación).
 */
export async function processWhatsAppActivation(
  phone: string,
  body: string,
): Promise<string | null> {
  if (!isActivationKeyword(body)) return null;

  const signup = await findSignupForActivation(phone);

  if (!signup) {
    return (
      "Senior Safe 🛡️\n" +
      "Para vincular WhatsApp, primero debe contratar y pagar su plan aquí:\n" +
      SENIOR_SAFE_CHECKOUT_URL +
      "\n\nCuando confirme el pago, envíe ACTIVAR por este chat."
    );
  }

  if (!isSignupPaymentComplete(signup.payment_status)) {
    return (
      "Senior Safe 🛡️\n" +
      "Encontramos su registro, pero el pago aún no está confirmado.\n" +
      "Complete el pago aquí:\n" +
      SENIOR_SAFE_CHECKOUT_URL +
      "\n\nLuego envíe ACTIVAR por este chat."
    );
  }

  if (signup.whatsapp_activated) {
    return (
      "Senior Safe 🛡️\n" +
      "✅ Su WhatsApp ya está vinculado a su cuenta.\n" +
      `Guía de instalación: ${SENIOR_SAFE_INSTALL_GUIDE_URL}`
    );
  }

  const normalizedPhone = normalizeTwilioPhone(phone);
  await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .update({
      whatsapp_activated: true,
      telefono: normalizedPhone || signup.telefono,
    })
    .eq("id", signup.id);

  const first = firstName(signup.nombre);
  return (
    "Senior Safe 🛡️\n" +
    `✅ ¡Activado, ${first}!\n\n` +
    "Sus alertas de emergencia llegarán por WhatsApp a sus contactos.\n" +
    `Guía de instalación: ${SENIOR_SAFE_INSTALL_GUIDE_URL}`
  );
}
