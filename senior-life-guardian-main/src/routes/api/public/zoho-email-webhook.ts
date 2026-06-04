import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateSeniorSafeEmailReply, SENIOR_SAFE_SUPPORT_EMAIL } from "@/lib/senior-safe-ai";
import {
  parseZohoWebhookRequest,
  shouldSkipAutoReply,
} from "@/lib/zoho-inbound-email";
import {
  getZohoSmtpConfig,
  sendSupportEmailViaZoho,
  wrapSupportHtmlReply,
} from "@/lib/zoho-smtp";

/**
 * Webhook de correo entrante Zoho Mail → respuesta automática con IA + SMTP.
 *
 * Configuración en Zoho Mail (Developer Space / Filtros):
 *   URL POST: https://alarmaseniorsafe.cl/api/public/zoho-email-webhook
 *   Header opcional: X-Webhook-Secret: <ZOHO_EMAIL_WEBHOOK_SECRET>
 *
 * Payload esperado (JSON): fromAddress, toAddress, subject, summary/html, messageId
 * @see https://www.zoho.com/mail/help/dev-platform/webhook.html
 */

function verifyWebhookSecret(request: Request): boolean {
  const expected = process.env.ZOHO_EMAIL_WEBHOOK_SECRET?.trim();
  if (!expected) return true;

  const header =
    request.headers.get("x-webhook-secret") ||
    request.headers.get("x-zoho-webhook-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");

  return header === expected || querySecret === expected;
}

function replySubject(original: string): string {
  const clean = original.replace(/^(re:\s*)+/i, "").trim();
  return `Re: ${clean || "Consulta Senior Safe"}`;
}

export const Route = createFileRoute("/api/public/zoho-email-webhook")({
  server: {
    handlers: {
      GET: async () =>
        new Response("Senior Safe Zoho email webhook OK", { status: 200 }),

      POST: async ({ request }) => {
        if (!verifyWebhookSecret(request)) {
          return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        }

        if (!getZohoSmtpConfig()) {
          return Response.json(
            { ok: false, error: "zoho_smtp_not_configured" },
            { status: 503 },
          );
        }

        let inbound;
        try {
          inbound = await parseZohoWebhookRequest(request);
        } catch (e) {
          console.error("[zoho-email-webhook] parse", e);
          return Response.json({ ok: false, error: "invalid_payload" }, { status: 400 });
        }

        if (!inbound) {
          return Response.json({ ok: false, error: "empty_payload" }, { status: 400 });
        }

        const skip = shouldSkipAutoReply(inbound);
        if (skip) {
          return Response.json({ ok: true, skipped: skip });
        }

        const to = inbound.fromAddress;
        const question =
          inbound.bodyText ||
          `Consulta sin cuerpo. Asunto: ${inbound.subject}`;

        let aiText: string;
        try {
          aiText = await generateSeniorSafeEmailReply(question, inbound.subject);
        } catch (e) {
          console.error("[zoho-email-webhook] ai", e);
          aiText =
            "Gracias por escribir a Senior Safe. Hemos recibido su mensaje. " +
            `Para asistencia sobre contratación, instalación o funcionamiento, visite https://alarmaseniorsafe.cl o responda a ${SENIOR_SAFE_SUPPORT_EMAIL}.`;
        }

        const textBody = aiText;
        const htmlBody = wrapSupportHtmlReply(aiText, inbound.fromName ?? undefined);
        const subject = replySubject(inbound.subject);

        try {
          await sendSupportEmailViaZoho({
            to,
            subject,
            textBody,
            htmlBody,
            inReplyTo: inbound.messageId,
            references: inbound.messageId,
          });
        } catch (e) {
          const errMsg = String((e as Error)?.message ?? e).slice(0, 500);
          console.error("[zoho-email-webhook] smtp", e);
          try {
            await supabaseAdmin.from("email_send_log").insert({
              template_name: "zoho_support_auto",
              recipient_email: to,
              status: "failed",
              error_message: errMsg,
              metadata: {
                subject: inbound.subject,
                inbound_message_id: inbound.messageId,
              } as never,
            });
          } catch {
            /* ignore */
          }
          return Response.json({ ok: false, error: "smtp_failed" }, { status: 502 });
        }

        try {
          await supabaseAdmin.from("email_send_log").insert({
            template_name: "zoho_support_auto",
            recipient_email: to,
            status: "sent",
            metadata: {
              subject,
              inbound_subject: inbound.subject,
              inbound_message_id: inbound.messageId,
              bcc_audit: process.env.ZOHO_SMTP_BCC || "enriquecasadesign@gmail.com",
            } as never,
          });
        } catch {
          /* best-effort */
        }

        try {
          await supabaseAdmin.from("alert_logs").insert({
            event_type: "support_email_auto_reply",
            status: "sent",
            metadata: {
              to,
              subject,
              inbound_subject: inbound.subject,
            } as never,
          });
        } catch {
          /* ignore */
        }

        return Response.json({
          ok: true,
          replied_to: to,
          subject,
        });
      },
    },
  },
});
