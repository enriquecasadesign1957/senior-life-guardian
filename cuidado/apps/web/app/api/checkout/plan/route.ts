import { rescueCheckoutSchema } from "@cuidado/contract";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { resolvePayMarket } from "@/lib/market";
import { currentUserId } from "@/lib/session";
import { ensureCheckoutSite, startCheckout } from "@/lib/start-checkout";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const raw = (await request.json()) as Record<string, unknown>;
    const input = rescueCheckoutSchema.parse(raw);
    const userId = await currentUserId();
    const market = resolvePayMarket({
      cookieHeader: request.headers.get("cookie"),
      prefer: typeof raw.market === "string" ? raw.market : null,
    });
    const siteId = await ensureCheckoutSite({ userId, siteId: input.siteId, url: input.url });
    const result = await startCheckout({
      purpose: "cuidado",
      siteId,
      userId,
      market,
    });
    return NextResponse.json({ ...result, siteId });
  } catch (error) {
    return jsonError(error);
  }
}
