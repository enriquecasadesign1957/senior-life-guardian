import { createFileRoute } from "@tanstack/react-router";
import { SENIOR_SAFE_SOS_SIMULATOR_URL } from "@/lib/app-url";
import {
  classifyWhatsAppInboundMessage,
  generateSeniorSafeWhatsAppReply,
} from "@/lib/senior-safe-ai";
import { twilioWhatsappCommercialFrom } from "@/lib/twilio";
import {
  findSignupByPhone,
  isOptOutMessage,
  isSosMessage,
  isWhatsAppActivationMessage,
  logInbound,
  normalizeTwilioPhone,
  parseTwilioInbound,
  twimlMessage,
} from "@/lib/twilio-inbound";
import { isEmergencyAlertAckMessage, processWhatsAppAlertAck } from "@/lib/whatsapp-alert-ack";
import { saveWhatsAppInboxMessage } from "@/lib/whatsapp-inbox";
import {
  processWhatsAppActivation,
  tryAutoActivatePaidSignup,
  isActivationKeyword,
  findSignupForActivation,
  markSignupWhatsAppActivated,
} from "@/lib/whatsapp-commercial-activation";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Webhook entrante Twilio WhatsApp.
 * Twilio Console → WhatsApp Sandbox / Business → When a message comes in (POST):
 *   https://alarmaseniorsafe.cl/api/public/twilio-whatsapp-webhook
 *
 * Flujos:
 * - Inbox comercial (TWILIO_WHATSAPP_COMMERCIAL_FROM / +56971404580): IA comercial Groq
 * - Inbox alertas (+56229147733): confirmación emergencia, ACTIVAR, SOS, texto libre
 */

function isCommercialInbox(recipientClean: string, commercialClean: string): boolean {
  if (!recipientClean || !commercialClean) return false;
  if (recipientClean === commercialClean) return true;
  const recipientDigits = recipientClean.replace(/\D/g, "");
  const commercialDigits = commercialClean.replace(/\D/g, "");
  return (
    recipientDigits === commercialDigits ||
    recipientDigits.endsWith(commercialDigits.slice(-9)) ||
    commercialDigits.endsWith(recipientDigits.slice(-9))
  );
}

async function replyCommercial(phone: string, message: string): Promise<Response> {
  await saveWhatsAppInboxMessage({
    inbox: "commercial",
    direction: "outbound",
    peerPhone: phone,
    body: message,
  });
  return twimlMessage(message);
}

async function handleCommercialInbox(
  phone: string,
  rawBody: string,
  textUpper: string,
): Promise<Response> {
  await saveWhatsAppInboxMessage({
    inbox: "commercial",
    direction: "inbound",
    peerPhone: phone,
    body: rawBody,
  });

  if (isOptOutMessage(textUpper)) {
    return replyCommercial(
      phone,
      "Recibido. No te enviaremos más mensajes por aquí. Para consultas sobre Senior Safe, escríbenos cuando quieras.",
    );
  }

  const signupForAuto = await findSignupForActivation(phone);
  if (
    signupForAuto &&
    isSignupPaymentComplete(signupForAuto.payment_status) &&
    !signupForAuto.whatsapp_activated
  ) {
    await markSignupWhatsAppActivated(signupForAuto.id);
  }

  if (isActivationKeyword(rawBody)) {
    const activationReply = await processWhatsAppActivation(phone, rawBody);
    if (activationReply) return replyCommercial(phone, activationReply);
  }

  if (rawBody.length >= 2) {
    try {
      // Inbox comercial: solo consultas comerciales con historial Groq (sin ack de emergencia).
      const aiReply = await generateSeniorSafeWhatsAppReply(rawBody, phone);
      return replyCommercial(phone, aiReply);
    } catch (e) {
      console.error("[whatsapp-webhook] commercial ai", e);
    }
  }

  return replyCommercial(
    phone,
    "Senior Safe 🛡️\n\n¡Hola! Pregúntanos por el Plan Único ($6.900/mes), instalación o cómo funciona.\n" +
      `Prueba el simulador S.O.S: ${SENIOR_SAFE_SOS_SIMULATOR_URL}\n` +
      "También puedes escribir a hola@alarmaseniorsafe.cl",
  );
}

export const Route = createFileRoute("/api/public/twilio-whatsapp-webhook")({
  server: {
    handlers: {
      GET: async () =>
        new Response("Senior Safe WhatsApp webhook OK", { status: 200 }),

      POST: async ({ request }) => {
        let from = "";
        let to = "";
        let body = "";
        try {
          const parsed = await parseTwilioInbound(request);
          from = parsed.from;
          to = parsed.to;
          body = parsed.body;

          const cleanString = (num: string) =>
            num.replace(/^whatsapp:/i, "").replace(/^\+/, "").trim();
          const recipientClean = cleanString(parsed.to || "");
          const commercialClean = cleanString(twilioWhatsappCommercialFrom());

          console.log("[DIAGNÓSTICO SENIOR SAFE]", {
            recipientClean,
            commercialClean,
            rawTo: parsed.to,
          });

          if (isCommercialInbox(recipientClean, commercialClean)) {
            const phone = normalizeTwilioPhone(from);
            const rawBody = (body || "").trim();
            const textUpper = rawBody.toUpperCase();

            await logInbound("whatsapp_commercial_inbound", {
              from,
              to,
              body: rawBody,
              phone,
              recipientClean,
              commercialClean,
            });

            return handleCommercialInbox(phone, rawBody, textUpper);
          }
        } catch {
          return twimlMessage("No pudimos procesar tu mensaje. Intenta nuevamente.");
        }

        const phone = normalizeTwilioPhone(from);
        const rawBody = (body || "").trim();
        const textUpper = rawBody.toUpperCase();

        await logInbound("whatsapp_inbound", { from, to, body: rawBody, phone, textUpper });

        if (isOptOutMessage(textUpper)) {
          return twimlMessage(
            "Recibido. No te enviaremos más mensajes por aquí. Para reactivar alertas, escribe cualquier mensaje.",
          );
        }

        // Día 1: cualquier mensaje del titular pagado activa WhatsApp (no solo ACTIVAR)
        if (rawBody.length >= 1) {
          await tryAutoActivatePaidSignup(phone);
        }

        // 1) Confirmación de alerta de emergencia (guardianes)
        if (isEmergencyAlertAckMessage(rawBody)) {
          try {
            const ackReply = await processWhatsAppAlertAck(phone, rawBody);
            if (ackReply) return twimlMessage(ackReply);
          } catch (e) {
            console.error("[whatsapp-webhook] ack", e);
            return twimlMessage(
              "Senior Safe 🛡️\nRecibimos tu confirmación pero hubo un error al registrarla. Intenta de nuevo o usa el link del mensaje de alerta.",
            );
          }
        }

        const signup = await findSignupByPhone(phone);

        // 3) SOS — usuario senior con cuenta
        if (isSosMessage(textUpper)) {
          if (!signup) {
            return twimlMessage(
              "Senior Safe 🛡️\nRecibimos tu SOS pero no encontramos tu cuenta. Verifica que el número coincida con el registrado al contratar.",
            );
          }
          try {
            const { sendEmergencyAlert } = await import("@/lib/emergency-alert.functions");
            const { issueSeniorAccessToken } = await import("@/lib/senior-access-auth");
            const accessToken = await issueSeniorAccessToken(signup.id);
            await sendEmergencyAlert({ data: { signupId: signup.id, gps: null, accessToken } });
          } catch (e) {
            console.error("[whatsapp-webhook] sos", e);
            try {
              await supabaseAdmin.from("alert_logs").insert({
                contract_signup_id: signup.id,
                event_type: "whatsapp_sos_failed",
                status: "failed",
                error_message: String((e as Error)?.message ?? e).slice(0, 500),
              });
            } catch {
              /* ignore */
            }
            return twimlMessage(
              "Senior Safe 🛡️\nNo pudimos enviar la alerta en este momento. Llama al 131 si es urgente y contacta a tus guardianes.",
            );
          }
          const first = signup.nombre?.split(" ")?.[0] ?? "usuario";
          return twimlMessage(
            `Senior Safe 🛡️\n✅ Alerta enviada, ${first}. Tus guardianes están siendo notificados por llamada, WhatsApp y SMS.`,
          );
        }

        // 2) Activación WhatsApp del contratante (requiere pago confirmado)
        if (isWhatsAppActivationMessage(textUpper)) {
          const activationReply = await processWhatsAppActivation(phone, rawBody);
          if (activationReply) return twimlMessage(activationReply);
        }

        // 4) Texto libre → enrutador Groq + ack o respuesta comercial
        if (rawBody.length >= 2) {
          try {
            const route = await classifyWhatsAppInboundMessage(rawBody);

            if (route === "EMERGENCY_ACK") {
              const ackReply = await processWhatsAppAlertAck(phone, rawBody, { forceAck: true });
              const noPendingAlert =
                ackReply?.includes("No hay alertas de emergencia pendientes") ?? false;
              if (ackReply && !noPendingAlert) return twimlMessage(ackReply);
              if (!ackReply && !noPendingAlert) {
                return twimlMessage(
                  "Senior Safe 🛡️\nRecibimos tu mensaje. Si respondes a una alerta activa, verifica que tu número esté registrado como guardián en la familia.",
                );
              }
            }

            const aiReply = await generateSeniorSafeWhatsAppReply(rawBody, phone);
            return twimlMessage(aiReply);
          } catch (e) {
            console.error("[whatsapp-webhook] ai", e);
          }
        }

        return twimlMessage(
          "Senior Safe 🛡️\n\nResponde:\n• Cualquier mensaje — vincular alertas WhatsApp (tras contratar)\n• SOS — emergencia real\n• O escribe tu pregunta sobre el servicio",
        );
      },
    },
  },
});
