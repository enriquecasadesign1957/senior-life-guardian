import type { SupabaseClient } from "@supabase/supabase-js";
import {
  detectBillingProvider,
  verifyLemonSqueezy,
  verifyStripe,
  type BillingProvider,
} from "./webhook-signature";

export interface BillingEnv {
  STRIPE_WEBHOOK_SECRET?: string;
  LEMON_SQUEEZY_SIGNING_SECRET?: string;
  BILLING_CREDITS_PRO?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  ADMIN_NOTIFY_EMAIL?: string;
}

const MAX_CREDITOS = 1000;

type Json = Record<string, unknown>;

function asRecord(value: unknown): Json | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : null;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function parseCreditos(
  value: unknown,
  fallback: number
): number | null {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : fallback;
  if (!Number.isInteger(n) || n <= 0 || n > MAX_CREDITOS) return null;
  return n;
}

type ParsedGrant = {
  provider: BillingProvider;
  eventId: string;
  eventType: string;
  usuarioId?: string;
  email?: string;
  creditos: number;
};

function parseStripeEvent(payload: Json, defaultCredits: number): ParsedGrant | null {
  const eventType = asString(payload.type);
  const eventId = asString(payload.id);
  if (!eventType || !eventId) return null;

  const billable =
    eventType === "checkout.session.completed" || eventType === "invoice.paid";
  if (!billable) return null;

  const data = asRecord(payload.data);
  const obj = asRecord(data?.object);
  if (!obj) return null;

  if (eventType === "checkout.session.completed") {
    const paymentStatus = asString(obj.payment_status);
    if (paymentStatus && paymentStatus !== "paid" && paymentStatus !== "no_payment_required") {
      return null;
    }
  }

  const metadata = asRecord(obj.metadata);
  const custom = asRecord(obj.custom_data);
  const customerDetails = asRecord(obj.customer_details);

  const usuarioId =
    asString(obj.client_reference_id) ??
    asString(metadata?.usuario_id) ??
    asString(custom?.usuario_id);

  const email =
    asString(obj.customer_email) ??
    asString(customerDetails?.email) ??
    asString(obj.email);

  const creditos = parseCreditos(
    metadata?.creditos ?? custom?.creditos,
    defaultCredits
  );
  if (creditos === null) return null;

  return {
    provider: "stripe",
    eventId,
    eventType,
    usuarioId,
    email,
    creditos,
  };
}

function parseLemonSqueezyEvent(
  payload: Json,
  defaultCredits: number
): ParsedGrant | null {
  const meta = asRecord(payload.meta);
  const data = asRecord(payload.data);
  const attrs = asRecord(data?.attributes);
  const eventType = asString(meta?.event_name);
  const dataId = data?.id !== undefined ? String(data.id) : undefined;
  if (!eventType || !dataId) return null;

  const billable =
    eventType === "order_created" ||
    eventType === "order_updated" ||
    eventType === "subscription_created" ||
    eventType === "subscription_payment_success";
  if (!billable) return null;

  const status = asString(attrs?.status)?.toLowerCase();
  if (
    (eventType === "order_created" || eventType === "order_updated") &&
    status &&
    status !== "paid"
  ) {
    return null;
  }

  const custom = asRecord(meta?.custom_data);
  const usuarioId =
    asString(custom?.usuario_id) ??
    asString(custom?.user_id) ??
    asString(custom?.userId);
  const email = asString(attrs?.user_email) ?? asString(attrs?.email);

  const creditos = parseCreditos(custom?.creditos, defaultCredits);
  if (creditos === null) return null;

  const webhookId = asString(meta?.webhook_id);
  const eventId = webhookId ?? `${eventType}:${dataId}`;

  return {
    provider: "lemon_squeezy",
    eventId,
    eventType,
    usuarioId,
    email,
    creditos,
  };
}

async function resolveUsuarioId(
  supabase: SupabaseClient,
  grant: ParsedGrant
): Promise<string | null> {
  if (grant.usuarioId) {
    const { data } = await supabase
      .from("usuarios")
      .select("id")
      .eq("id", grant.usuarioId)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }

  if (grant.email) {
    const { data } = await supabase
      .from("usuarios")
      .select("id")
      .ilike("email", grant.email)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }

  return null;
}

export async function handleBillingWebhook(
  request: Request,
  env: BillingEnv,
  supabase: SupabaseClient
): Promise<Response> {
  const provider = detectBillingProvider(request);
  if (!provider) {
    return Response.json(
      { error: "Missing Stripe-Signature or X-Signature" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let signatureOk = false;
  if (provider === "stripe") {
    const secret = env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!secret) {
      return Response.json(
        { error: "STRIPE_WEBHOOK_SECRET is not configured" },
        { status: 503 }
      );
    }
    signatureOk = await verifyStripe(
      rawBody,
      request.headers.get("Stripe-Signature"),
      secret
    );
  } else {
    const secret = env.LEMON_SQUEEZY_SIGNING_SECRET?.trim();
    if (!secret) {
      return Response.json(
        { error: "LEMON_SQUEEZY_SIGNING_SECRET is not configured" },
        { status: 503 }
      );
    }
    signatureOk = await verifyLemonSqueezy(
      rawBody,
      request.headers.get("X-Signature"),
      secret
    );
  }

  if (!signatureOk) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: Json;
  try {
    payload = JSON.parse(rawBody) as Json;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const defaultCredits = parseCreditos(env.BILLING_CREDITS_PRO, 50) ?? 50;
  const grant =
    provider === "stripe"
      ? parseStripeEvent(payload, defaultCredits)
      : parseLemonSqueezyEvent(payload, defaultCredits);

  if (!grant) {
    return Response.json({ received: true, credited: false }, { status: 200 });
  }

  const usuarioId = await resolveUsuarioId(supabase, grant);
  if (!usuarioId) {
    console.error("billing webhook: user_not_found", {
      provider: grant.provider,
      eventType: grant.eventType,
      eventId: grant.eventId,
    });
    return Response.json(
      { received: true, credited: false, reason: "user_not_found" },
      { status: 200 }
    );
  }

  const { data: restantes, error } = await supabase.rpc("acreditar_creditos", {
    p_provider: grant.provider,
    p_event_id: grant.eventId,
    p_event_type: grant.eventType,
    p_usuario_id: usuarioId,
    p_creditos: grant.creditos,
  });

  if (error) {
    return Response.json(
      { error: "Credit grant failed" },
      { status: 500 }
    );
  }

  return Response.json(
    {
      received: true,
      credited: true,
      creditos_restantes: restantes,
    },
    { status: 200 }
  );
}
