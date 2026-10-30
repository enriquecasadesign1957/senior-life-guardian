import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { periodoSchema } from "@/lib/plans";
import { consultarTarjetaVecino } from "@/lib/tarjeta-vecino.server";
import { lasCondesTier, parseChileanRut } from "@/lib/tarjeta-vecino";

const bodySchema = z.object({
  rut: z.string().trim().min(8).max(16),
  code: z.string().trim().min(2).max(64),
  periodo: periodoSchema,
});

export const Route = createFileRoute("/api/public/consultar-tarjeta-vecino")({
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

        const tier = lasCondesTier(parsed.data.code);
        if (!tier) {
          return Response.json(
            { ok: false, error: "Este código no requiere Tarjeta Vecino." },
            { status: 400 },
          );
        }

        const rut = parseChileanRut(parsed.data.rut);
        if (!rut) {
          return Response.json(
            { ok: false, error: "Ingresa un RUT chileno válido, con dígito verificador." },
            { status: 400 },
          );
        }

        try {
          const decision = await consultarTarjetaVecino(rut.formatted, tier, parsed.data.periodo);
          return Response.json({
            ok: true,
            activo: decision.activo,
            adultoMayor: decision.adultoMayor,
            eligible: decision.eligible,
            estado: decision.estado,
            tipo: decision.tipo,
            message: decision.message,
            alternateCode: decision.alternateCode,
            alternateUrl: decision.alternateUrl,
          });
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "No pudimos consultar el portal de Tarjeta Vecino. Intenta nuevamente en unos minutos.";
          return Response.json({ ok: false, error: message }, { status: 502 });
        }
      },
    },
  },
});
