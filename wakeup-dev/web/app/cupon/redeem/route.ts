import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { callWakeupBilling } from "@/lib/wakeupApi";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    codigo?: unknown;
  } | null;
  const codigo = typeof body?.codigo === "string" ? body.codigo : "";

  const { status, payload } = await callWakeupBilling("/v1/cupon/redeem", {
    usuario_id: user.id,
    codigo,
  });

  if (status === 0) {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }

  return NextResponse.json(payload, { status: status || 500 });
}
