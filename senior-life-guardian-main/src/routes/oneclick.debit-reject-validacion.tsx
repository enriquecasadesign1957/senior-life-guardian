import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs/promises";
import {
  authorizeOneclickMallTransaction,
  finishOneclickMallInscription,
  generateOneclickBuyOrders,
  getOneclickMallConfig,
} from "@/lib/transbank-oneclick-mall";

const REJECT_AMOUNT = 10_000_000;

export const Route = createFileRoute("/oneclick/debit-reject-validacion")({
  component: () => null,
  server: {
    handlers: {
      GET: async () => {
        let meta: { username?: string; token?: string; tbk_user?: string } = {};
        try {
          const raw = await fs.readFile("public/oneclick-debit-inscription.json", "utf8");
          meta = JSON.parse(raw) as typeof meta;
        } catch {
          return html(
            "Falta public/oneclick-debit-inscription.json. Ejecuta la inscripción débito primero.",
            null,
          );
        }

        let tbkUser = meta.tbk_user;
        let username = meta.username;

        let finishHint = "";
        if (!tbkUser && meta.token) {
          const finish = await finishOneclickMallInscription(meta.token);
          if (finish.ok && finish.tbkUser) {
            tbkUser = finish.tbkUser;
            await fs.writeFile(
              "public/oneclick-debit-inscription.json",
              JSON.stringify({ ...meta, tbk_user: tbkUser }, null, 2),
            );
          } else {
            const code = finish.responseCode ?? "?";
            finishHint =
              code === -96
                ? "<br/><br/><strong>Token expirado o inscripción no completada (-96).</strong> Genera uno nuevo con <code>node scripts/oneclick-validation-start-debit-inscription.mjs</code> y completa Webpay antes de volver aquí."
                : `<br/><br/>Transbank respondió <code>response_code: ${code}</code>. Completa Webpay primero.`;
          }
        }

        if (!tbkUser || !username) {
          return html(
            `<strong>Paso 1:</strong> inscribe la tarjeta débito en Webpay<br/>
            <a href="/oneclick-debit-inscription.html">/oneclick-debit-inscription.html</a><br/>
            Tarjeta Redcompra: <code>4051 8842 3993 7763</code> · RUT <code>11.111.111-1</code> / clave <code>123</code><br/><br/>
            <strong>Paso 2:</strong> al terminar Webpay, vuelve a esta misma página para el cobro de $10.000.000 (-98).${finishHint}`,
            null,
          );
        }

        const cfg = getOneclickMallConfig();
        const { mallBuyOrder, storeBuyOrder } = generateOneclickBuyOrders();
        const auth = await authorizeOneclickMallTransaction({
          username,
          tbkUser,
          buyOrder: mallBuyOrder,
          details: [
            {
              commerceCode: cfg.storeCommerceCode,
              buyOrder: storeBuyOrder,
              amount: REJECT_AMOUNT,
            },
          ],
        });

        const detail = auth.details[0];
        return html(
          `Transacción débito rechazada (-98)<br/>
          <strong>buy_order PADRE:</strong> <code>${mallBuyOrder}</code><br/>
          buy_order tienda: <code>${storeBuyOrder}</code><br/>
          response_code: ${detail?.responseCode ?? "—"}<br/>
          status: ${detail?.status ?? "—"}<br/>
          payment_type_code: ${detail?.paymentTypeCode ?? "—"}`,
          mallBuyOrder,
        );
      },
    },
  },
});

function html(message: string, buyOrder: string | null) {
  return new Response(
    `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Validación débito rechazada</title></head>
<body style="font-family:sans-serif;padding:2rem;max-width:720px;line-height:1.6">
<h1>Oneclick · débito rechazada</h1>
<p>${message}</p>
${buyOrder ? `<p>Copia este buy_order PADRE para Transbank:</p><p style="font-size:1.25rem"><code>${buyOrder}</code></p>` : ""}
<p><a href="/oneclick-debit-inscription.html">Inscripción débito</a></p>
</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
