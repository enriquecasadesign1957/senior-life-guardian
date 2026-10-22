import { and, eq } from "drizzle-orm";
import { rescueCheckoutSchema } from "@cuidado/contract";
import { getDb, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { RESCUE_AMOUNT_CENTS, RESCUE_CURRENCY } from "@/lib/rescue";
import { requireUserId } from "@/lib/session";
import { appOrigin, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = rescueCheckoutSchema.parse(await request.json());
    const userId = await requireUserId();
    const site = (
      await getDb()
        .select({ id: sites.id, plan: sites.plan })
        .from(sites)
        .where(and(eq(sites.id, input.siteId), eq(sites.userId, userId), eq(sites.status, "connected")))
        .limit(1)
    )[0];
    if (!site) {
      throw new ApiError("SITE_REQUIRED", "Primero conecta el sitio con el código del plugin.", 409);
    }
    if (site.plan !== "none") {
      throw new ApiError("ALREADY_COVERED", "Este sitio ya tiene un plan. No hace falta el pago de $29.", 409);
    }
    const stripe = getStripe();
    if (!stripe) {
      throw new ApiError(
        "CHECKOUT_UNAVAILABLE",
        "Falta la clave de Stripe. Todavía no se ha cobrado nada.",
        501,
      );
    }

    const origin = appOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: site.id,
      success_url: `${origin}/pago/rescate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${input.returnPath ?? "/"}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: RESCUE_CURRENCY,
            unit_amount: RESCUE_AMOUNT_CENTS,
            product_data: {
              name: "Rescate CuidadoWeb",
              description: "Limpieza única de la base de datos y vigilancia por 30 días.",
            },
          },
        },
      ],
      metadata: {
        purpose: "rescue",
        siteId: site.id,
        userId,
      },
    });
    if (!session.url) {
      throw new ApiError("CHECKOUT_UNAVAILABLE", "Stripe no abrió el cobro. No se ha cobrado nada.", 502);
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return jsonError(error);
  }
}
