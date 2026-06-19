import { createFileRoute } from "@tanstack/react-router";
import { runSubscriptionRenewalJob, verifyCronSecret } from "@/lib/subscription-renewal";

/**
 * Job diario: avisos de renovación (sin consentimiento recurrente), cobro Oneclick automático
 * (con consentimiento) y suspensión a los 3 días sin pago.
 * Protegido con CRON_SECRET (Bearer).
 *
 * Cloudflare Cron o manual:
 *   curl -X POST https://alarmaseniorsafe.cl/api/cron/process-subscription-renewals \
 *     -H "Authorization: Bearer $CRON_SECRET"
 */
export const Route = createFileRoute("/api/cron/process-subscription-renewals")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!verifyCronSecret(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const result = await runSubscriptionRenewalJob();
        return Response.json(result);
      },

      POST: async ({ request }) => {
        if (!verifyCronSecret(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const result = await runSubscriptionRenewalJob();
        return Response.json(result);
      },
    },
  },
});
