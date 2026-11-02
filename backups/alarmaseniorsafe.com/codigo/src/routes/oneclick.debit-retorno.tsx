import { createFileRoute } from "@tanstack/react-router";
import {
  authorizeOneclickMallTransaction,
  finishOneclickMallInscription,
  generateOneclickBuyOrders,
  getOneclickMallConfig,
} from "@/lib/transbank-oneclick-mall";

export const Route = createFileRoute("/oneclick/debit-retorno")({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();
        const params = new URLSearchParams();
        for (const [k, v] of form.entries()) {
          if (typeof v === "string") params.set(k, v);
        }
        const url = new URL(request.url);
        url.search = params.toString();
        return Response.redirect(url.pathname + "?" + params.toString(), 303);
      },
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("TBK_TOKEN")?.trim();
        if (!token) {
          return new Response("Falta TBK_TOKEN", { status: 400 });
        }

        let meta: { username?: string; storeCommerceCode?: string } = {};
        try {
          const fs = await import("node:fs/promises");
          const raw = await fs.readFile("public/oneclick-debit-inscription.json", "utf8");
          meta = JSON.parse(raw) as { username?: string };
        } catch {
          /* ignore */
        }

        const finish = await finishOneclickMallInscription(token);
        if (!finish.ok || !finish.tbkUser || !meta.username) {
          return new Response(
            `<html><body style="font-family:sans-serif;padding:2rem"><h1>Inscripción no completada</h1><p>response_code: ${finish.responseCode ?? "?"}</p><p><a href="/oneclick-debit-inscription.html">Reintentar</a></p></body></html>`,
            { headers: { "Content-Type": "text/html; charset=utf-8" } },
          );
        }

        const cfg = getOneclickMallConfig();
        const { mallBuyOrder, storeBuyOrder } = generateOneclickBuyOrders();
        const auth = await authorizeOneclickMallTransaction({
          username: meta.username,
          tbkUser: finish.tbkUser,
          buyOrder: mallBuyOrder,
          details: [
            {
              commerceCode: cfg.storeCommerceCode,
              buyOrder: storeBuyOrder,
              amount: 6900,
            },
          ],
        });

        try {
          const fs = await import("node:fs/promises");
          await fs.writeFile(
            "public/oneclick-debit-inscription.json",
            JSON.stringify(
              { ...meta, tbk_user: finish.tbkUser, username: meta.username },
              null,
              2,
            ),
          );
        } catch {
          /* ignore */
        }

        const detail = auth.details[0];
        const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Débito OK</title></head>
<body style="font-family:sans-serif;padding:2rem;max-width:640px">
<h1>Transacción débito ${auth.ok ? "aprobada" : "fallida"}</h1>
<p><strong>buy_order PADRE:</strong> <code>${mallBuyOrder}</code></p>
<p>buy_order tienda: <code>${storeBuyOrder}</code></p>
<p>payment_type_code: ${detail?.paymentTypeCode ?? "—"}</p>
<p>response_code: ${detail?.responseCode ?? "—"}</p>
<p>authorization_code: ${detail?.authorizationCode ?? "—"}</p>
<p>Copia el buy_order PADRE para el formulario Transbank.</p>
</body></html>`;
        return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
      },
    },
  },
});
