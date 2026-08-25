import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { callWakeupBilling, transbankRedirectHtml } from "@/lib/wakeupApi";

export const dynamic = "force-dynamic";

function appOrigin(): string {
  return "https://wakeupdev.com";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  return EMAIL_RE.test(email) ? email : "";
}

function graciasUrl(origin: string, email?: string): string {
  if (!email) return `${origin}/gracias`;
  return `${origin}/gracias?email=${encodeURIComponent(email)}`;
}

async function startAndRespond(args: {
  origin: string;
  usuarioId?: string;
  email: string;
  cupon: string;
  plan: string;
  guest: boolean;
}): Promise<NextResponse> {
  const { origin, email, cupon, plan, guest } = args;
  const body: Record<string, string> = { email, cupon, plan };
  if (args.usuarioId) body.usuario_id = args.usuarioId;

  const { status, payload } = await callWakeupBilling(
    "/v1/billing/transbank/start",
    body
  );

  if (payload.already_active) {
    if (guest) {
      return NextResponse.redirect(graciasUrl(origin, email));
    }
    return NextResponse.redirect(`${origin}/dashboard?billing=already`);
  }
  if (payload.charged) {
    return NextResponse.redirect(graciasUrl(origin, email));
  }
  if (status === 402 || payload.declined) {
    const reason =
      typeof payload.reason === "string" ? payload.reason : "";
    const qs = new URLSearchParams({ billing: "declined" });
    if (reason) qs.set("why", reason);
    return NextResponse.redirect(`${origin}/?${qs.toString()}`);
  }
  if (status === 0) {
    return NextResponse.redirect(`${origin}/?billing=failed&why=network`);
  }
  if (status === 401) {
    return NextResponse.redirect(`${origin}/?billing=failed&why=secret`);
  }
  if (status === 503) {
    return NextResponse.redirect(`${origin}/?billing=unconfigured`);
  }
  if (status === 502) {
    const hint =
      typeof payload.tbk === "string" ? payload.tbk.slice(0, 120) : "";
    const qs = new URLSearchParams({ billing: "failed", why: "start" });
    if (hint) qs.set("hint", hint);
    return NextResponse.redirect(`${origin}/?${qs.toString()}`);
  }
  if (status === 400 || status === 500) {
    return NextResponse.redirect(`${origin}/?billing=failed&why=start`);
  }

  const token = typeof payload.token === "string" ? payload.token : "";
  const urlWebpay =
    typeof payload.urlWebpay === "string" ? payload.urlWebpay : "";
  if (!token || !urlWebpay) {
    return NextResponse.redirect(`${origin}/?billing=failed&why=start`);
  }

  return new NextResponse(transbankRedirectHtml(token, urlWebpay), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const origin = appOrigin();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/#precios`);
  }

  const email = normalizeEmail(user.email ?? "");
  if (!email) {
    return NextResponse.redirect(`${origin}/?billing=failed&why=no_email`);
  }

  return startAndRespond({
    origin,
    usuarioId: user.id,
    email,
    cupon: request.nextUrl.searchParams.get("cupon") ?? "",
    plan: request.nextUrl.searchParams.get("plan") ?? "chile",
    guest: false,
  });
}

export async function POST(request: NextRequest) {
  const origin = appOrigin();
  const contentType = request.headers.get("content-type") ?? "";
  let emailRaw = "";
  let cupon = "";
  let plan = "chile";

  if (contentType.includes("json")) {
    const body = (await request.json().catch(() => null)) as {
      email?: unknown;
      cupon?: unknown;
      plan?: unknown;
    } | null;
    emailRaw = typeof body?.email === "string" ? body.email : "";
    cupon = typeof body?.cupon === "string" ? body.cupon : "";
    plan = typeof body?.plan === "string" ? body.plan : "chile";
  } else {
    const form = await request.formData();
    emailRaw = String(form.get("email") ?? "");
    cupon = String(form.get("cupon") ?? "");
    plan = String(form.get("plan") ?? "chile");
  }

  const email = normalizeEmail(emailRaw);
  if (!email) {
    return NextResponse.redirect(`${origin}/?billing=failed&why=start`);
  }

  return startAndRespond({
    origin,
    email,
    cupon,
    plan,
    guest: true,
  });
}
