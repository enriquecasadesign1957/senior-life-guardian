import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { toPublicDiscountPreview } from "@/lib/discount-codes";
import { resolveDiscountForCheckout } from "@/lib/discount.functions";
import { normalizePlanKey, planKeySchema, periodoSchema } from "@/lib/plans";

const bodySchema = z.object({
  code: z.string().trim().min(2).max(64),
  plan: planKeySchema.transform(normalizePlanKey),
  periodo: periodoSchema,
});

export const Route = createFileRoute("/api/public/validate-discount")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "JSON inválido." }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Datos inválidos." }, { status: 400 });
        }

        try {
          const resolved = await resolveDiscountForCheckout(
            parsed.data.code,
            parsed.data.plan,
            parsed.data.periodo,
          );
          return Response.json({
            ok: true,
            discount: toPublicDiscountPreview(resolved),
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "No pudimos validar el código de convenio.";
          return Response.json({ ok: false, error: message }, { status: 400 });
        }
      },
    },
  },
});
