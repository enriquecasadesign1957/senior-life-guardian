import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAppOrigin } from "@/lib/appOrigin";
import { OAUTH_NEXT_COOKIE, safeAuthNext } from "@/lib/oauthNext";

export async function GET(request: NextRequest) {
  const appOrigin = resolveAppOrigin(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.redirect(`${appOrigin}/?auth=error&reason=missing_env`);
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${appOrigin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    const reason = encodeURIComponent(
      (error?.message ?? "oauth_start").slice(0, 120)
    );
    return NextResponse.redirect(`${appOrigin}/?auth=error&reason=${reason}`);
  }

  const next = safeAuthNext(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(data.url);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, {
      ...(options as Record<string, unknown>),
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });
  response.cookies.set(OAUTH_NEXT_COOKIE, next, {
    path: "/",
    sameSite: "lax",
    secure: true,
    httpOnly: true,
    maxAge: 600,
  });
  return response;
}
