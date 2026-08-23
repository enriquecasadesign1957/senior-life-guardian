import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAppOrigin } from "@/lib/appOrigin";
import { OAUTH_NEXT_COOKIE } from "@/lib/oauthNext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const appOrigin = resolveAppOrigin(request);
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
  } | null;
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "email_invalid" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "missing_env" }, { status: 503 });
  }

  const pendingCookies: {
    name: string;
    value: string;
    options?: Record<string, unknown>;
  }[] = [];

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[]
      ) {
        pendingCookies.push(...cookiesToSet);
      },
    },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${appOrigin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: "otp_failed", message: error.message.slice(0, 160) },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ ok: true });
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, {
      ...(options as Record<string, unknown>),
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });
  response.cookies.set(OAUTH_NEXT_COOKIE, "/dashboard", {
    path: "/",
    sameSite: "lax",
    secure: true,
    httpOnly: true,
    maxAge: 600,
  });
  return response;
}
