import { createFileRoute } from "@tanstack/react-router";
import { acknowledgeAlertByToken, sanitizeRouteToken } from "@/lib/ack-alert";
import { renderAckErrorHtml, renderAckSuccessHtml } from "@/lib/ack-alert-page";

/** Confirmación WhatsApp (botón Meta): /a/{token}/c */
export const Route = createFileRoute("/a/$token/c")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const result = await acknowledgeAlertByToken(params.token);
          return new Response(
            renderAckSuccessHtml({ token: sanitizeRouteToken(params.token), already: result.already }),
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
          /* optional */
        }

        try {
          const result = await acknowledgeAlertByToken(params.token, nombre);
          return new Response(
            renderAckSuccessHtml({
              token: sanitizeRouteToken(params.token),
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
