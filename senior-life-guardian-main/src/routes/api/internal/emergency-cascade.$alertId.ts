import { createFileRoute } from "@tanstack/react-router";
import { continueEmergencyCascade } from "@/lib/emergency-cascade-continuation";
import { verifyCronSecret } from "@/lib/subscription-renewal";

export const Route = createFileRoute("/api/internal/emergency-cascade/$alertId")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        if (!verifyCronSecret(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          await continueEmergencyCascade(params.alertId);
          return Response.json({ ok: true });
        } catch (err) {
          console.error("[emergency-cascade]", params.alertId, err);
          return Response.json(
            { ok: false, error: err instanceof Error ? err.message : "cascade_failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});
