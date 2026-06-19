import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs/promises";

export const Route = createFileRoute("/oneclick/inscripcion-abandonada")({
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
        const tbkToken = url.searchParams.get("TBK_TOKEN") ?? "—";
        const tbkIdSesion = url.searchParams.get("TBK_ID_SESION") ?? "—";
        const tbkOrdenCompra = url.searchParams.get("TBK_ORDEN_COMPRA") ?? "—";

        let createToken = "—";
        try {
          const raw = await fs.readFile("public/oneclick-abandon-inscription.json", "utf8");
          createToken = (JSON.parse(raw) as { token?: string }).token ?? "—";
        } catch {
          /* ignore */
        }

        const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Inscripción abandonada</title></head>
<body style="font-family:sans-serif;padding:2rem;max-width:720px;line-height:1.6">
<h1>Inscripción abandonada — caso validación</h1>
<p>Parámetros recibidos en la URL de retorno:</p>
<ul>
<li><strong>TBK_TOKEN:</strong> <code>${escapeHtml(tbkToken)}</code></li>
<li><strong>TBK_ID_SESION:</strong> <code>${escapeHtml(tbkIdSesion)}</code></li>
<li><strong>TBK_ORDEN_COMPRA:</strong> <code>${escapeHtml(tbkOrdenCompra)}</code></li>
</ul>
<p><strong>Para el formulario Transbank</strong> pega el token recibido <em>al crear</em> la inscripción (API), no el TBK_TOKEN de arriba:</p>
<p style="font-size:1.1rem;word-break:break-all"><code>${escapeHtml(createToken)}</code></p>
<p><a href="/oneclick-abandon-inscription.html">Nueva prueba</a></p>
</body></html>`;

        return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
      },
    },
  },
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
