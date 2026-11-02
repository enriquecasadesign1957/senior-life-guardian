import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs/promises";

export const Route = createFileRoute("/oneclick/credit-retorno")({
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

        const { finishOneclickMallInscription } = await import("@/lib/transbank-oneclick-mall");
        const finish = await finishOneclickMallInscription(token);

        let meta: { username?: string; email?: string } = {};
        try {
          const raw = await fs.readFile("public/oneclick-credit-inscription.json", "utf8");
          meta = JSON.parse(raw) as typeof meta;
        } catch {
          /* ignore */
        }

        if (finish.ok && finish.tbkUser) {
          await fs.writeFile(
            "public/oneclick-credit-inscription.json",
            JSON.stringify(
              {
                ...meta,
                token,
                tbk_user: finish.tbkUser,
                username: finish.raw?.username ?? meta.username,
                card_type: finish.cardType,
                card_last4: finish.cardLast4,
              },
              null,
              2,
            ),
          );
        }

        const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Crédito inscrito</title></head>
<body style="font-family:sans-serif;padding:2rem;max-width:640px">
<h1>Inscripción crédito ${finish.ok ? "OK" : "fallida"}</h1>
<p>response_code: ${finish.responseCode ?? "—"}</p>
<p>card_type: ${finish.cardType ?? "—"}</p>
<p>tbk_user: ${finish.ok ? "guardado" : "—"}</p>
<p><a href="/oneclick-credit-inscription.html">Reintentar</a></p>
<p>Ejecuta: <code>node scripts/oneclick-validation-credit-partial-refund.mjs</code></p>
</body></html>`;
        return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
      },
    },
  },
});
