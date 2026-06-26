import { buildPostPaymentInstallUrl } from "@/lib/post-payment-install-notify";
import { PRODUCTION_SITE_URL } from "@/lib/app-url";
import type { InstallStep } from "@/lib/install-step";

export type InstallGuideContent = {
  title: string;
  body: string;
  cta?: string;
};

/** Mensaje en app según paso actual (siguiente acción). */
export function inAppGuideForStep(step: InstallStep, signupId?: string): InstallGuideContent | null {
  switch (step) {
    case "pending":
    case "paid":
      return {
        title: "Instala la app",
        body: "Abre el enlace de instalación en el celular del adulto mayor. Si no lo tienes, revisa tu correo o WhatsApp.",
        cta: signupId ? "Abrir enlace de instalación" : undefined,
      };
    case "install_link_sent":
      return {
        title: "Siguiente: instalar",
        body: "Abre el enlace que te enviamos e instala Senior Safe en el teléfono. Luego vuelve aquí.",
        cta: signupId ? "Ver enlace de instalación" : undefined,
      };
    case "whatsapp_linked":
      return {
        title: "Abre la app instalada",
        body: "Entra a Senior Safe desde el ícono en tu teléfono (no desde el navegador).",
      };
    case "app_opened":
      return {
        title: "Presiona el botón rojo una vez",
        body: "La primera pulsación activa ubicación y WhatsApp. No avisa a tu familia.",
      };
    case "ready":
      return null;
    default:
      return null;
  }
}

export function installGuideActionUrl(signupId: string): string {
  return buildPostPaymentInstallUrl(signupId);
}

/** Guía corta por WhatsApp tras avanzar un paso. */
export function whatsAppGuideForStep(step: InstallStep, signupId: string, firstName: string): string | null {
  const installUrl = buildPostPaymentInstallUrl(signupId);
  switch (step) {
    case "paid":
    case "install_link_sent":
      return (
        `Senior Safe 🛡️\n` +
        `Hola ${firstName}, tu plan está activo.\n\n` +
        `1) Instala la app en el celular del adulto mayor:\n${installUrl}\n\n` +
        `2) Responde cualquier mensaje por aquí para vincular alertas.\n\n` +
        `Ayuda: hola@alarmaseniorsafe.cl`
      );
    case "whatsapp_linked":
      return (
        `Senior Safe 🛡️\n` +
        `✅ WhatsApp vinculado, ${firstName}.\n\n` +
        `Ahora abre la app instalada en el teléfono (ícono Senior Safe).\n` +
        `Guía: ${PRODUCTION_SITE_URL}/guia`
      );
    case "app_opened":
      return (
        `Senior Safe 🛡️\n` +
        `${firstName}, ya casi listo.\n\n` +
        `Presiona el botón rojo UNA vez dentro de la app.\n` +
        `Eso activa ubicación y WhatsApp sin enviar alertas.\n\n` +
        `Después el botón funcionará en emergencias reales.`
      );
    case "ready":
      return (
        `Senior Safe 🛡️\n` +
        `✅ Todo listo, ${firstName}. Tu botón de emergencia ya puede avisar a tu familia.\n` +
        `En unos días te recordaremos activar el sensor de caídas (opcional).`
      );
    default:
      return null;
  }
}
