import { rescueCheckoutSchema } from "@cuidado/contract";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { resolvePayMarket } from "@/lib/market";
import { requireUserId } from "@/lib/session";
import { startCheckout } from "@/lib/start-checkout";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const raw = (await request.json()) as Record<string, unknown>;
    const input = rescueCheckoutSchema.parse(raw);
    const userId = await requireUserId();
    const market = resolvePayMarket({
      cookieHeader: request.headers.get("cookie"),
      prefer: typeof raw.market === "string" ? raw.market : null,
    });
    const result = await startCheckout({
      purpose: "rescue",
      siteId: input.siteId,
      userId,
      market,
    });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
