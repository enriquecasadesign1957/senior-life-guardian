import { createFileRoute } from "@tanstack/react-router";
import {
  classifyWhatsAppInboundMessage,
  generateSeniorSafeWhatsAppReply,
} from "@/lib/senior-safe-ai";
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
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Webhook entrante Twilio WhatsApp.
 * Twilio Console → WhatsApp Sandbox / Business → When a message comes in (POST):
 *   https://alarmaseniorsafe.cl/api/public/twilio-whatsapp-webhook
 *
 * Flujos:
 * 1) Confirmación de alerta de emergencia (guardianes: SI, OK, RECIBIDO, token ack…)
 * 2) ACTIVAR / join sandbox → vincula WhatsApp del contratante
 * 3) SOS → dispara alerta real
 * 4) Texto libre → Groq enrutador (EMERGENCY_ACK | COMMERCIAL_QUERY) + respuesta IA
 * 5) Respuesta TwiML <Message> en segundos
 */

export const Route = createFileRoute("/api/public/twilio-whatsapp-webhook")({
  server: {
    handlers: {
      GET: async () =>
        new Response("Senior Safe WhatsApp webhook OK", { status: 200 }),

      POST: async ({ request }) => {
        let from = "";
        let body = "";
        try {
          const parsed = await parseTwilioInbound(request);
          from = parsed.from;
          body = parsed.body;
        } catch {
          return twimlMessage("No pudimos procesar tu mensaje. Intenta nuevamente.");
        }

        const phone = normalizeTwilioPhone(from);
        const rawBody = (body || "").trim();
        const textUpper = rawBody.toUpperCase();

        await logInbound("whatsapp_inbound", { from, body: rawBody, phone, textUpper });

        if (isOptOutMessage(textUpper)) {
          return twimlMessage(
            "Recibido. No te enviaremos más mensajes por aquí. Para reactivar alertas, responde ACTIVAR.",
          );
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
            await sendEmergencyAlert({ data: { signupId: signup.id, gps: null } });
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

        // 2) Activación WhatsApp del contratante
        if (isWhatsAppActivationMessage(textUpper)) {
          if (!signup) {
            return twimlMessage(
              "Senior Safe 🛡️\n\nRecibimos tu mensaje pero no encontramos tu cuenta. Verifica que el número de WhatsApp coincida con el registrado al contratar en alarmaseniorsafe.cl.",
            );
          }

          await supabaseAdmin
            .from(CONTRACT_SIGNUPS_TABLE)
            .update({ whatsapp_activated: true, telefono: phone || signup.telefono })
            .eq("id", signup.id);

          const first = signup.nombre?.split(" ")?.[0] ?? "usuario";
          return twimlMessage(
            `Senior Safe 🛡️\n\n✅ ¡Activado, ${first}!\n\nTus alertas de emergencia llegarán por WhatsApp a tus guardianes. Mantén este chat disponible.`,
          );
        }

        // 4) Texto libre → enrutador Groq + ack o respuesta comercial
        if (rawBody.length >= 2) {
          try {
            const route = await classifyWhatsAppInboundMessage(rawBody);

            if (route === "EMERGENCY_ACK") {
              const ackReply = await processWhatsAppAlertAck(phone, rawBody, { forceAck: true });
              if (ackReply) return twimlMessage(ackReply);
              return twimlMessage(
                "Senior Safe 🛡️\nRecibimos tu mensaje. Si respondes a una alerta activa, verifica que tu número esté registrado como guardián en la familia.",
              );
            }

            const aiReply = await generateSeniorSafeWhatsAppReply(rawBody);
            return twimlMessage(aiReply);
          } catch (e) {
            console.error("[whatsapp-webhook] ai", e);
          }
        }

        return twimlMessage(
          "Senior Safe 🛡️\n\nResponde:\n• ACTIVAR — vincular alertas WhatsApp (tras contratar)\n• SOS — emergencia real\n• O escribe tu pregunta sobre el servicio",
        );
      },
    },
  },
});
