import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAppOrigin } from "@/lib/appOrigin";
import { callWakeupBilling } from "@/lib/wakeupApi";
import { OAUTH_NEXT_COOKIE, safeAuthNext } from "@/lib/oauthNext";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const oauthError = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const code = searchParams.get("code");
  const next = safeAuthNext(
    request.cookies.get(OAUTH_NEXT_COOKIE)?.value ?? searchParams.get("next")
  );

  const appOrigin = resolveAppOrigin(request);

  if (oauthError || errorDescription) {
    const reason = encodeURIComponent(
      (errorDescription || oauthError || "oauth_error").slice(0, 160)
    );
    return NextResponse.redirect(`${appOrigin}/?auth=error&reason=${reason}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appOrigin}/?auth=error&reason=missing_code`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.redirect(`${appOrigin}/?auth=error&reason=missing_env`);
  }

  let redirectResponse = NextResponse.redirect(`${appOrigin}${next}`);
  redirectResponse.cookies.set(OAUTH_NEXT_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });

  const supabase = createServerClient(url, anonKey, {
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
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, {
            ...(options as Record<string, unknown>),
            path: "/",
            sameSite: "lax",
            secure: true,
          });
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback]", error.message);
    const reason = encodeURIComponent(error.message.slice(0, 120));
    return NextResponse.redirect(`${appOrigin}/?auth=error&reason=${reason}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email && user.created_at) {
    const ageMs = Date.now() - new Date(user.created_at).getTime();
    if (Number.isFinite(ageMs) && ageMs >= 0 && ageMs < 15 * 60 * 1000) {
      await callWakeupBilling("/v1/internal/notify", {
        tipo: "prueba",
        email: user.email,
        usuario_id: user.id,
      }).catch(() => undefined);
    }
  }

  return redirectResponse;
}
