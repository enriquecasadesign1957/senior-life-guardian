import { createFileRoute } from "@tanstack/react-router";
import {
  acknowledgeAlertByIdAndToken,
  acknowledgeAlertByToken,
  parseAckPathFromUrl,
  sanitizeRouteToken,
} from "@/lib/ack-alert";
import { renderAckErrorHtml, renderAckSuccessHtml } from "@/lib/ack-alert-page";

/** Enlace corto de confirmación desde SMS: /a/{token} */
export const Route = createFileRoute("/a/$token")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        try {
          const parsed = parseAckPathFromUrl(new URL(request.url).pathname);
          const pathname = new URL(request.url).pathname;
          const pathToken = pathname.split("/").filter(Boolean).slice(1).join("/");
          const tokenParam = parsed?.token ?? pathToken ?? params.token;
          const result = parsed?.alertId
            ? await acknowledgeAlertByIdAndToken(parsed.alertId, tokenParam)
            : await acknowledgeAlertByToken(tokenParam);
          return new Response(
            renderAckSuccessHtml({ token: sanitizeRouteToken(tokenParam), already: result.already }),
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
          const parsed = parseAckPathFromUrl(new URL(request.url).pathname);
          const pathname = new URL(request.url).pathname;
          const pathToken = pathname.split("/").filter(Boolean).slice(1).join("/");
          const tokenParam = parsed?.token ?? pathToken ?? params.token;
          const result = parsed?.alertId
            ? await acknowledgeAlertByIdAndToken(parsed.alertId, tokenParam, nombre)
            : await acknowledgeAlertByToken(tokenParam, nombre);
          return new Response(
            renderAckSuccessHtml({
              token: sanitizeRouteToken(tokenParam),
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
