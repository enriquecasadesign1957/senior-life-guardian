import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type CuponCreditosEnv = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  BILLING_INTERNAL_SECRET?: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RedeemRow = {
  ok?: boolean;
  motivo?: string;
  creditos_agregados?: number;
  creditos_disponibles?: number;
  expira_en?: string | null;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function requireInternalSecret(
  request: Request,
  env: CuponCreditosEnv
): Response | null {
  const expected = env.BILLING_INTERNAL_SECRET?.trim() ?? "";
  const got = request.headers.get("x-wakeup-internal")?.trim() ?? "";
  if (!expected) {
    return json({ error: "Canje de cupón no configurado" }, 503);
  }
  if (!got || !timingSafeEqual(got, expected)) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

function serviceClient(env: CuponCreditosEnv): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function normalizeCupon(raw: unknown): string {
  return typeof raw === "string"
    ? raw.trim().toUpperCase().replace(/\s+/g, "")
    : "";
}

function statusForMotivo(motivo: string): number {
  switch (motivo) {
    case "ya_canjeado":
      return 409;
    case "usuario_no_encontrado":
      return 404;
    case "no_vigente":
    case "inactivo":
    case "agotado":
    case "codigo_invalido":
      return 400;
    default:
      return 400;
  }
}

export async function handleCuponRedeem(
  request: Request,
  env: CuponCreditosEnv
): Promise<Response> {
  const denied = requireInternalSecret(request, env);
  if (denied) return denied;

  let body: { usuario_id?: unknown; codigo?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const usuarioId =
    typeof body.usuario_id === "string" ? body.usuario_id.trim() : "";
  const codigo = normalizeCupon(body.codigo);

  if (!UUID_RE.test(usuarioId)) {
    return json({ error: "usuario_id inválido" }, 400);
  }
  if (!codigo) {
    return json({ ok: false, motivo: "codigo_invalido" }, 400);
  }

  const supabase = serviceClient(env);
  const { data, error } = await supabase.rpc("canjear_cupon_creditos", {
    p_codigo: codigo,
    p_usuario_id: usuarioId,
  });

  if (error) {
    console.error("cupon_redeem_rpc_failed", error.message);
    const missing =
      /schema cache|could not find|does not exist/i.test(error.message);
    return json(
      {
        error: missing
          ? "Falta aplicar la migración oncall_cupones_credito en Supabase."
          : "No se pudo canjear el cupón.",
      },
      missing ? 503 : 500
    );
  }

  const row = (Array.isArray(data) ? data[0] : data) as RedeemRow | undefined;
  const motivo = typeof row?.motivo === "string" ? row.motivo : "codigo_invalido";
  const payload = {
    ok: Boolean(row?.ok),
    motivo,
    codigo,
    creditos_agregados:
      typeof row?.creditos_agregados === "number" ? row.creditos_agregados : 0,
    creditos_disponibles:
      typeof row?.creditos_disponibles === "number"
        ? row.creditos_disponibles
        : 0,
    expira_en: typeof row?.expira_en === "string" ? row.expira_en : null,
  };

  if (!payload.ok) {
    return json(payload, statusForMotivo(motivo));
  }

  console.info("cupon_redeem_ok", {
    codigo,
    usuario_id: usuarioId,
    creditos: payload.creditos_agregados,
  });
  return json(payload, 200);
}

export async function expireGiftCredits(
  env: CuponCreditosEnv
): Promise<{ expired: number }> {
  if (!env.SUPABASE_URL?.trim() || !env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return { expired: 0 };
  }

  const supabase = serviceClient(env);
  const { data, error } = await supabase.rpc("expirar_creditos_regalo");
  if (error) {
    console.error("cupon_expire_rpc_failed", error.message);
    throw error;
  }

  const expired = typeof data === "number" ? data : Number(data) || 0;
  return { expired };
}
