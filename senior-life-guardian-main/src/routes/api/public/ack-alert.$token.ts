import { createFileRoute } from "@tanstack/react-router";
import {
  acknowledgeAlertByIdAndToken,
  acknowledgeAlertByToken,
  normalizeAckToken,
} from "@/lib/ack-alert";
import { renderAckErrorHtml, renderAckSuccessHtml } from "@/lib/ack-alert-page";

export const Route = createFileRoute("/api/public/ack-alert/$token")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        try {
          const url = new URL(request.url);
          const alertId = url.searchParams.get("alert") ?? url.searchParams.get("id");
          const result = alertId
            ? await acknowledgeAlertByIdAndToken(alertId, params.token)
            : await acknowledgeAlertByToken(params.token);
          return new Response(
            renderAckSuccessHtml({ token: normalizeAckToken(params.token), already: result.already }),
            { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : "Link inválido o expirado.";
          return new Response(renderAckErrorHtml(message), {
            status: 400,
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
      },

      POST: async ({ params, request }) => {
        let nombre: string | undefined;
        try {
          const ct = request.headers.get("content-type") ?? "";
          if (ct.includes("application/json")) {
            const json = (await request.json()) as { nombre?: string };
            nombre = json.nombre?.trim();
          } else {
            const form = await request.formData();
            nombre = String(form.get("nombre") ?? "").trim() || undefined;
          }
        } catch {
          /* optional name */
        }

        try {
          const result = await acknowledgeAlertByToken(params.token, nombre);
          return new Response(
            renderAckSuccessHtml({
              token: normalizeAckToken(params.token),
              already: result.already,
              nombre,
            }),
            { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : "Link inválido o expirado.";
          return new Response(renderAckErrorHtml(message), {
            status: 400,
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
      },
    },
  },
});
