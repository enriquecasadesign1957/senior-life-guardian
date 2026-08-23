import { NextResponse, type NextRequest } from "next/server";
import { callWakeupBilling } from "@/lib/wakeupApi";

export const dynamic = "force-dynamic";

function appOrigin(): string {
  return "https://wakeupdev.com";
}

async function extractToken(request: NextRequest): Promise<string> {
  const fromQuery = request.nextUrl.searchParams.get("TBK_TOKEN")?.trim() ?? "";
  if (request.method === "GET") return fromQuery;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("form")) {
    const form = await request.formData();
    const fromForm = String(form.get("TBK_TOKEN") ?? "").trim();
    if (fromForm) return fromForm;
  }
  return fromQuery;
}

async function finishInscription(token: string): Promise<NextResponse> {
  const origin = appOrigin();
  if (!token) {
    return NextResponse.redirect(`${origin}/?billing=failed&why=token`);
  }

  const { status, payload } = await callWakeupBilling(
    "/v1/billing/transbank/finish",
    { token }
  );

  if (payload.ok || payload.charged || payload.already_active) {
    const email =
      typeof payload.email === "string" ? payload.email.trim() : "";
    const qs = email ? `?email=${encodeURIComponent(email)}` : "";
    return NextResponse.redirect(`${origin}/gracias${qs}`);
  }
  if (status === 0) {
    return NextResponse.redirect(`${origin}/?billing=failed&why=network`);
  }
  if (status === 401) {
    return NextResponse.redirect(`${origin}/?billing=failed&why=secret`);
  }
  if (status === 402 || payload.declined) {
    const reason =
      typeof payload.reason === "string" ? payload.reason : "";
    const qs = new URLSearchParams({ billing: "declined" });
    if (reason) qs.set("why", reason);
    const hint =
      typeof payload.tbk === "string" ? payload.tbk.slice(0, 120) : "";
    if (hint) qs.set("hint", hint);
    return NextResponse.redirect(`${origin}/?${qs.toString()}`);
  }
  if (status === 503) {
    return NextResponse.redirect(`${origin}/?billing=unconfigured`);
  }
  if (status === 404) {
    return NextResponse.redirect(`${origin}/?billing=failed&why=token`);
  }
  return NextResponse.redirect(`${origin}/?billing=failed&why=finish`);
}

export async function GET(request: NextRequest) {
  return finishInscription(await extractToken(request));
}

export async function POST(request: NextRequest) {
  return finishInscription(await extractToken(request));
}
