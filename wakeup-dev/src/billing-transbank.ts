import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  authorizeOneclick,
  BASIC_PLAN_CLP,
  BASIC_PLAN_CREDITS,
  CHILE_PLAN_CLP,
  generateWkBuyOrders,
  generateWkUsername,
  getOneclickMallConfig,
  isOneclickConfigured,
  finishOneclickInscription,
  startOneclickInscription,
  type TransbankEnv,
} from "./transbank-oneclick";
import { notifyAdminOnce } from "./admin-notify";

export type TransbankBillingEnv = TransbankEnv & {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  BILLING_INTERNAL_SECRET?: string;
  BILLING_CREDITS_PRO?: string;
  TRANSBANK_PLAN_CLP?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  ADMIN_NOTIFY_EMAIL?: string;
};

type InscriptionRow = {
  usuario_id: string;
  username: string;
  email: string;
  inscription_token: string | null;
  tbk_user: string | null;
  status: string;
  next_charge_at: string | null;
  last_charged_at: string | null;
  pending_cupon?: string | null;
  pending_cupon_monto?: number | null;
  plan?: string | null;
};

type BillingProduct = "chile" | "basic";

function normalizeBillingProduct(raw: unknown): BillingProduct {
  return typeof raw === "string" && raw.trim().toLowerCase() === "basic"
    ? "basic"
    : "chile";
}

function productListClp(
  env: TransbankBillingEnv,
  product: BillingProduct
): number {
  if (product === "basic") return BASIC_PLAN_CLP;
  return planClp(env);
}

function productCredits(
  env: TransbankBillingEnv,
  product: BillingProduct
): number {
  if (product === "basic") return BASIC_PLAN_CREDITS;
  return planCredits(env);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  env: TransbankBillingEnv
): Response | null {
  const expected = env.BILLING_INTERNAL_SECRET?.trim() ?? "";
  const got = request.headers.get("x-wakeup-internal")?.trim() ?? "";
  if (!expected) {
    return json({ error: "Cobro Chile no configurado" }, 503);
  }
  if (!got || !timingSafeEqual(got, expected)) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

function serviceClient(env: TransbankBillingEnv): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function publicWebOrigin(env: TransbankBillingEnv): string {
  return (env.WEB_ORIGIN?.trim() || "https://wakeupdev.com").replace(/\/$/, "");
}

function planClp(env: TransbankBillingEnv): number {
  const n = Number.parseInt(env.TRANSBANK_PLAN_CLP ?? "", 10);
  return Number.isInteger(n) && n >= 50 ? n : CHILE_PLAN_CLP;
}

function planCredits(env: TransbankBillingEnv): number {
  const n = Number.parseInt(env.BILLING_CREDITS_PRO ?? "50", 10);
  return Number.isInteger(n) && n > 0 && n <= 1000 ? n : 50;
}

function normalizeCupon(raw: unknown): string {
  return typeof raw === "string"
    ? raw.trim().toUpperCase().replace(/\s+/g, "")
    : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const email = raw.trim().toLowerCase();
  return EMAIL_RE.test(email) ? email : "";
}

async function ensureUsuarioByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("usuarios")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (typeof existing?.id === "string" && UUID_RE.test(existing.id)) {
    return existing.id;
  }

  const created = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { signup_source: "transbank_landing" },
  });
  const createdId = created.data.user?.id;
  if (createdId && UUID_RE.test(createdId)) {
    await supabase.from("usuarios").insert({
      id: createdId,
      email,
      creditos_disponibles: 5,
    });
    return createdId;
  }

  const { data: linkData } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const linkedId = linkData.user?.id;
  if (linkedId && UUID_RE.test(linkedId)) {
    await supabase.from("usuarios").insert({
      id: linkedId,
      email,
      creditos_disponibles: 5,
    });
    return linkedId;
  }

  const { data: again } = await supabase
    .from("usuarios")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (typeof again?.id === "string" && UUID_RE.test(again.id)) {
    return again.id;
  }

  console.error("ensure_usuario_failed", created.error?.message);
  return null;
}

type CuponQuote = {
  valido: boolean;
  codigo: string | null;
  monto_clp: number;
};

async function quoteCupon(
  supabase: SupabaseClient,
  codigo: string,
  baseClp: number
): Promise<CuponQuote> {
  if (!codigo) {
    return { valido: false, codigo: null, monto_clp: baseClp };
  }
  const { data, error } = await supabase.rpc("validar_cupon_oncall", {
    p_codigo: codigo,
    p_base_clp: baseClp,
    p_plan: "chile",
  });
  if (error) {
    console.error("cupon_validate_failed", error.message);
    return { valido: false, codigo: null, monto_clp: baseClp };
  }
  const row = (Array.isArray(data) ? data[0] : data) as
    | { valido?: boolean; codigo?: string; monto_clp?: number }
    | undefined;
  const monto =
    typeof row?.monto_clp === "number" && row.monto_clp >= 50
      ? row.monto_clp
      : baseClp;
  return {
    valido: Boolean(row?.valido),
    codigo: typeof row?.codigo === "string" ? row.codigo : codigo,
    monto_clp: Math.min(baseClp, monto),
  };
}

async function cuponAlreadyRedeemed(
  supabase: SupabaseClient,
  codigo: string,
  usuarioId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("oncall_cupon_redenciones")
    .select("id")
    .eq("codigo", codigo)
    .eq("usuario_id", usuarioId)
    .maybeSingle();
  return Boolean(data?.id);
}

/** Oneclick: -98/-3 tope por transacción; -97 tope diario; -99 cantidad diaria. */
function declineReasonFromAuth(responseCode: number | null): string {
  if (responseCode === -98 || responseCode === -3) return "max_amount";
  if (responseCode === -97) return "max_daily_amount";
  if (responseCode === -99) return "max_daily_count";
  return "declined";
}

function addMonthsUtc(from: Date, months: number): Date {
  const next = new Date(from.getTime());
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function addHoursUtc(from: Date, hours: number): Date {
  return new Date(from.getTime() + hours * 60 * 60 * 1000);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

async function readJson(
  request: Request
): Promise<Record<string, unknown> | null> {
  try {
    return asRecord(await request.json());
  } catch {
    return null;
  }
}

async function creditPlan(
  supabase: SupabaseClient,
  env: TransbankBillingEnv,
  usuarioId: string,
  mallBuyOrder: string,
  product: BillingProduct = "chile"
): Promise<{ ok: boolean; restantes: unknown }> {
  const { data, error } = await supabase.rpc("acreditar_creditos", {
    p_provider: "transbank",
    p_event_id: mallBuyOrder,
    p_event_type: "oneclick_authorize",
    p_usuario_id: usuarioId,
    p_creditos: productCredits(env, product),
  });
  if (error) {
    console.error("transbank_credit_failed", {
      usuario_id: usuarioId,
      mall_buy_order: mallBuyOrder,
      message: error.message,
    });
    return { ok: false, restantes: null };
  }
  return { ok: true, restantes: data };
}

async function markActive(
  supabase: SupabaseClient,
  usuarioId: string,
  extras: {
    tbkUser?: string | null;
    cardLast4?: string | null;
  } = {}
): Promise<void> {
  const now = new Date();
  const patch: Record<string, unknown> = {
    status: "active",
    inscription_token: null,
    last_charged_at: now.toISOString(),
    next_charge_at: addMonthsUtc(now, 1).toISOString(),
    actualizada_en: now.toISOString(),
  };
  if (extras.tbkUser !== undefined) patch.tbk_user = extras.tbkUser;
  if (extras.cardLast4 !== undefined) patch.card_last4 = extras.cardLast4;
  await supabase
    .from("transbank_inscriptions")
    .update(patch)
    .eq("usuario_id", usuarioId);
}

async function chargeAndCredit(
  env: TransbankBillingEnv,
  supabase: SupabaseClient,
  inscription: Pick<
    InscriptionRow,
    "usuario_id" | "username" | "tbk_user" | "plan"
  >
): Promise<{ ok: boolean; mallBuyOrder?: string; reason?: string }> {
  if (!inscription.tbk_user) {
    return { ok: false, reason: "missing_tbk_user" };
  }

  const product = normalizeBillingProduct(inscription.plan);
  const cfg = getOneclickMallConfig(env);
  const listPrice = productListClp(env, product);
  let amount = listPrice;
  let cuponCodigo: string | null = null;

  const { data: pending, error: pendingErr } = await supabase
    .from("transbank_inscriptions")
    .select("pending_cupon, pending_cupon_monto, plan")
    .eq("usuario_id", inscription.usuario_id)
    .maybeSingle();
  if (pendingErr) {
    console.error("cupon_pending_select_failed", pendingErr.message);
  }
  const pendingMonto = pending?.pending_cupon_monto;
  const pendingCupon =
    typeof pending?.pending_cupon === "string"
      ? pending.pending_cupon.trim().toUpperCase()
      : "";
  if (
    pendingCupon &&
    typeof pendingMonto === "number" &&
    pendingMonto >= 50 &&
    pendingMonto <= listPrice
  ) {
    amount = pendingMonto;
    cuponCodigo = pendingCupon;
  }
  const since = addHoursUtc(new Date(), -24).toISOString();

  const { data: recent } = await supabase
    .from("transbank_transactions")
    .select("mall_buy_order, status")
    .eq("usuario_id", inscription.usuario_id)
    .eq("status", "authorized")
    .gte("creada_en", since)
    .order("creada_en", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent?.mall_buy_order) {
    const credited = await creditPlan(
      supabase,
      env,
      inscription.usuario_id,
      recent.mall_buy_order as string,
      product
    );
    if (credited.ok) {
      await markActive(supabase, inscription.usuario_id, {
        tbkUser: inscription.tbk_user,
      });
      if (cuponCodigo) {
        await supabase.rpc("consumir_cupon_oncall", {
          p_codigo: cuponCodigo,
          p_usuario_id: inscription.usuario_id,
          p_monto_clp: amount,
        });
        await supabase
          .from("transbank_inscriptions")
          .update({
            pending_cupon: null,
            pending_cupon_monto: null,
            actualizada_en: new Date().toISOString(),
          })
          .eq("usuario_id", inscription.usuario_id);
      }
      return { ok: true, mallBuyOrder: recent.mall_buy_order as string };
    }
    return { ok: false, reason: "credit_retry_failed" };
  }

  const { mallBuyOrder, storeBuyOrder } = generateWkBuyOrders();

  const txBase = {
    usuario_id: inscription.usuario_id,
    mall_buy_order: mallBuyOrder,
    store_buy_order: storeBuyOrder,
    amount,
    operation: "authorize",
    status: "initiated",
  };
  let { error: insertErr } = await supabase
    .from("transbank_transactions")
    .insert(
      (cuponCodigo
        ? { ...txBase, cupon_codigo: cuponCodigo }
        : txBase) as typeof txBase
    );
  if (insertErr && cuponCodigo) {
    console.error("transbank_tx_insert_cupon_failed", insertErr.message);
    ({ error: insertErr } = await supabase
      .from("transbank_transactions")
      .insert(txBase));
  }
  if (insertErr) {
    console.error("transbank_tx_insert_failed", insertErr.message);
    return { ok: false, reason: "tx_insert" };
  }

  const auth = await authorizeOneclick(cfg, {
    username: inscription.username,
    tbkUser: inscription.tbk_user,
    mallBuyOrder,
    storeBuyOrder,
    amount,
  });

  await supabase
    .from("transbank_transactions")
    .update({
      status: auth.ok ? "authorized" : "rejected",
      authorization_code: auth.authorizationCode,
      response_code: auth.responseCode,
    })
    .eq("mall_buy_order", mallBuyOrder);

  if (!auth.ok) {
    return {
      ok: false,
      reason: declineReasonFromAuth(auth.responseCode),
      mallBuyOrder,
    };
  }

  const credited = await creditPlan(
    supabase,
    env,
    inscription.usuario_id,
    mallBuyOrder,
    product
  );
  if (!credited.ok) {
    return { ok: false, reason: "credit_failed", mallBuyOrder };
  }

  await markActive(supabase, inscription.usuario_id, {
    tbkUser: inscription.tbk_user,
  });
  if (cuponCodigo) {
    await supabase.rpc("consumir_cupon_oncall", {
      p_codigo: cuponCodigo,
      p_usuario_id: inscription.usuario_id,
      p_monto_clp: amount,
    });
    await supabase
      .from("transbank_inscriptions")
      .update({
        pending_cupon: null,
        pending_cupon_monto: null,
        actualizada_en: new Date().toISOString(),
      })
      .eq("usuario_id", inscription.usuario_id);
  }
  return { ok: true, mallBuyOrder };
}

export async function handleTransbankStart(
  request: Request,
  env: TransbankBillingEnv
): Promise<Response> {
  const denied = requireInternalSecret(request, env);
  if (denied) return denied;

  const cfg = getOneclickMallConfig(env);
  if (!isOneclickConfigured(cfg)) {
    return json({ error: "Cobro Chile no configurado" }, 503);
  }

  const body = await readJson(request);
  const email = normalizeEmail(body?.email);
  if (!email) {
    return json({ error: "email inválido" }, 400);
  }

  const supabase = serviceClient(env);
  const product = normalizeBillingProduct(body?.plan);
  const requestedId =
    typeof body?.usuario_id === "string" ? body.usuario_id.trim() : "";
  let usuarioId = UUID_RE.test(requestedId) ? requestedId : "";
  if (!usuarioId) {
    const ensured = await ensureUsuarioByEmail(supabase, email);
    if (!ensured) {
      return json({ error: "No se pudo preparar la cuenta" }, 500);
    }
    usuarioId = ensured;
  }
  const listPrice = productListClp(env, product);
  const cuponCode = normalizeCupon(body?.cupon);
  const quoted = await quoteCupon(supabase, cuponCode, listPrice);
  let pendingCupon: string | null = null;
  let pendingMonto: number | null = null;
  if (quoted.valido && quoted.codigo) {
    const used = await cuponAlreadyRedeemed(
      supabase,
      quoted.codigo,
      usuarioId
    );
    if (!used) {
      pendingCupon = quoted.codigo;
      pendingMonto = quoted.monto_clp;
    }
  }
  const { data: existing } = await supabase
    .from("transbank_inscriptions")
    .select(
      "usuario_id, username, email, inscription_token, tbk_user, status, next_charge_at, last_charged_at, plan"
    )
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  const row = existing as InscriptionRow | null;

  if (row?.status === "active" && row.tbk_user) {
    return json({ already_active: true }, 200);
  }

  if (row?.tbk_user && row.status === "failed") {
    await supabase
      .from("transbank_inscriptions")
      .update({
        plan: product,
        actualizada_en: new Date().toISOString(),
        ...(pendingCupon
          ? {
              pending_cupon: pendingCupon,
              pending_cupon_monto: pendingMonto,
            }
          : {}),
      })
      .eq("usuario_id", usuarioId);
    const charged = await chargeAndCredit(env, supabase, {
      ...row,
      plan: product,
    });
    if (charged.ok) {
      void notifyAdminOnce(env, supabase, {
        tipo: "contrato",
        email,
        usuarioId,
      });
      return json({ charged: true }, 200);
    }
    // No borrar la inscripción: la tarjeta ya está en Oneclick.
    // -98 = tope de monto del comercio; reintentar otra tarjeta no sirve.
    return json(
      {
        error: "El cobro fue rechazado",
        declined: true,
        reason: charged.reason,
      },
      402
    );
  }

  const username = generateWkUsername(usuarioId);
  const responseUrl = `${publicWebOrigin(env)}/billing/transbank/retorno`;

  let inscription: { token: string; urlWebpay: string };
  try {
    inscription = await startOneclickInscription(cfg, {
      username,
      email,
      responseUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("transbank_start_failed", { message });
    return json(
      { error: "No se pudo iniciar Transbank", tbk: message.slice(0, 180) },
      502
    );
  }

  const now = new Date().toISOString();
  const inscriptionBase = {
    usuario_id: usuarioId,
    username,
    email,
    inscription_token: inscription.token,
    tbk_user: null,
    status: "pending",
    plan: product,
    actualizada_en: now,
  };
  const inscriptionRow = pendingCupon
    ? {
        ...inscriptionBase,
        pending_cupon: pendingCupon,
        pending_cupon_monto: pendingMonto,
      }
    : inscriptionBase;
  let { error: upsertErr } = await supabase
    .from("transbank_inscriptions")
    .upsert(inscriptionRow, { onConflict: "usuario_id" });
  if (upsertErr && pendingCupon) {
    console.error("transbank_inscription_upsert_cupon_failed", upsertErr.message);
    ({ error: upsertErr } = await supabase
      .from("transbank_inscriptions")
      .upsert(inscriptionBase, { onConflict: "usuario_id" }));
  }

  if (upsertErr) {
    console.error("transbank_inscription_upsert_failed", upsertErr.message);
    return json({ error: "No se pudo guardar la inscripción" }, 500);
  }

  return json({
    token: inscription.token,
    urlWebpay: inscription.urlWebpay,
  });
}

export async function handleTransbankFinish(
  request: Request,
  env: TransbankBillingEnv
): Promise<Response> {
  const denied = requireInternalSecret(request, env);
  if (denied) return denied;

  const cfg = getOneclickMallConfig(env);
  if (!isOneclickConfigured(cfg)) {
    return json({ error: "Cobro Chile no configurado" }, 503);
  }

  const body = await readJson(request);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!token) {
    return json({ error: "Falta TBK_TOKEN" }, 400);
  }

  const supabase = serviceClient(env);
  const { data: existing } = await supabase
    .from("transbank_inscriptions")
    .select(
      "usuario_id, username, email, inscription_token, tbk_user, status, next_charge_at, last_charged_at, plan"
    )
    .eq("inscription_token", token)
    .maybeSingle();

  const row = existing as InscriptionRow | null;
  if (!row) {
    return json({ error: "Inscripción no encontrada" }, 404);
  }

  if (row.status === "active" && row.tbk_user) {
    return json({ ok: true, already_active: true, email: row.email }, 200);
  }

  let tbkUser = row.tbk_user;
  let cardLast4: string | null = null;

  if (!tbkUser) {
    let finished: Awaited<ReturnType<typeof finishOneclickInscription>>;
    try {
      finished = await finishOneclickInscription(cfg, token);
    } catch (err) {
      console.error("transbank_finish_failed", {
        message: err instanceof Error ? err.message : String(err),
      });
      await supabase
        .from("transbank_inscriptions")
        .update({ status: "failed", actualizada_en: new Date().toISOString() })
        .eq("usuario_id", row.usuario_id);
      return json({ error: "No se pudo confirmar la tarjeta" }, 502);
    }

    if (!finished.ok || !finished.tbkUser) {
      await supabase
        .from("transbank_inscriptions")
        .update({ status: "failed", actualizada_en: new Date().toISOString() })
        .eq("usuario_id", row.usuario_id);
      return json({ error: "Inscripción rechazada", declined: true }, 402);
    }

    tbkUser = finished.tbkUser;
    cardLast4 = finished.cardLast4;
    await supabase
      .from("transbank_inscriptions")
      .update({
        tbk_user: tbkUser,
        card_last4: cardLast4,
        actualizada_en: new Date().toISOString(),
      })
      .eq("usuario_id", row.usuario_id);
  }

  const charged = await chargeAndCredit(env, supabase, {
    usuario_id: row.usuario_id,
    username: row.username,
    tbk_user: tbkUser,
  });

  if (!charged.ok) {
    await supabase
      .from("transbank_inscriptions")
      .update({
        status: "failed",
        tbk_user: tbkUser,
        actualizada_en: new Date().toISOString(),
      })
      .eq("usuario_id", row.usuario_id);
    return json(
      {
        error: "El cobro fue rechazado",
        declined: true,
        reason: charged.reason,
        tbk: charged.reason ?? "",
      },
      402
    );
  }

  void notifyAdminOnce(env, supabase, {
    tipo: "contrato",
    email: row.email,
    usuarioId: row.usuario_id,
  });
  return json({ ok: true, charged: true, email: row.email }, 200);
}

export async function renewDueInscriptions(
  env: TransbankBillingEnv
): Promise<{ processed: number; charged: number }> {
  const cfg = getOneclickMallConfig(env);
  if (!isOneclickConfigured(cfg)) {
    return { processed: 0, charged: 0 };
  }

  const supabase = serviceClient(env);
  const now = new Date();
  const { data: due, error } = await supabase
    .from("transbank_inscriptions")
    .select(
      "usuario_id, username, email, inscription_token, tbk_user, status, next_charge_at, last_charged_at, plan"
    )
    .eq("status", "active")
    .not("tbk_user", "is", null)
    .lte("next_charge_at", now.toISOString())
    .limit(25);

  if (error) {
    console.error("transbank_renew_query_failed", error.message);
    return { processed: 0, charged: 0 };
  }

  const rows = (due ?? []) as InscriptionRow[];
  const twentyDaysAgo = addHoursUtc(now, -20 * 24);
  let charged = 0;

  for (const row of rows) {
    if (row.last_charged_at) {
      const last = new Date(row.last_charged_at);
      if (!Number.isNaN(last.getTime()) && last > twentyDaysAgo) {
        continue;
      }
    }

    const claimUntil = addHoursUtc(now, 2).toISOString();
    const { data: claimed } = await supabase
      .from("transbank_inscriptions")
      .update({
        next_charge_at: claimUntil,
        actualizada_en: now.toISOString(),
      })
      .eq("usuario_id", row.usuario_id)
      .eq("status", "active")
      .lte("next_charge_at", now.toISOString())
      .select("usuario_id")
      .maybeSingle();

    if (!claimed) continue;

    try {
      const result = await chargeAndCredit(env, supabase, row);
      if (result.ok) {
        charged += 1;
        continue;
      }

      await supabase
        .from("transbank_inscriptions")
        .update({
          next_charge_at: addHoursUtc(now, 24).toISOString(),
          actualizada_en: new Date().toISOString(),
        })
        .eq("usuario_id", row.usuario_id);

      console.error("transbank_renew_failed", {
        usuario_id: row.usuario_id,
        reason: result.reason,
      });
    } catch (err) {
      console.error("transbank_renew_throw", {
        usuario_id: row.usuario_id,
        message: err instanceof Error ? err.message : String(err),
      });
      await supabase
        .from("transbank_inscriptions")
        .update({
          next_charge_at: addHoursUtc(now, 24).toISOString(),
          actualizada_en: new Date().toISOString(),
        })
        .eq("usuario_id", row.usuario_id);
    }
  }

  return { processed: rows.length, charged };
}
