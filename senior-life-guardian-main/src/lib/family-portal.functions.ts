import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { normalizePhoneE164 } from "@/lib/phone-utils";
import { sendTwilioChannelMessage } from "@/lib/twilio";

const CODE_TTL_MIN = 10;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_S = 60;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomCode6(): string {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return String(a[0] % 1_000_000).padStart(6, "0");
}

async function logAccess(
  family_member_id: string | null,
  contract_signup_id: string | null,
  action: string,
  metadata?: unknown,
) {
  try {
    await supabaseAdmin.from("family_access_log").insert({
      family_member_id,
      contract_signup_id,
      action,
      metadata: (metadata ?? null) as never,
    });
  } catch {
    /* silencioso */
  }
}

// ============================================================
// 1) Solicitar código por teléfono
// ============================================================
export const requestFamilyCode = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ telefono: z.string().min(4).max(40) }).parse(input))
  .handler(async ({ data }) => {
    const tel = normalizePhoneE164(data.telefono);
    if (!tel) throw new Error("Teléfono inválido.");

    // ¿Existe como familiar registrado por algún senior?
    const { data: member } = await supabaseAdmin
      .from("family_members")
      .select("id, contract_signup_id, nombre")
      .eq("telefono", tel)
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!member) {
      // ¿Existe como emergency_contact? Auto-migrar a family_members.
      const { data: ec } = await supabaseAdmin
        .from("emergency_contacts")
        .select("contract_signup_id, nombre, parentesco")
        .or(`telefono.eq.${tel},whatsapp.eq.${tel}`)
        .limit(1)
        .maybeSingle();
      if (!ec) {
        await logAccess(null, null, "code_request_unknown", { telefono: tel });
        throw new Error("Este número no está registrado como familiar.");
      }
      const { data: created, error: cErr } = await supabaseAdmin
        .from("family_members")
        .insert({
          contract_signup_id: ec.contract_signup_id,
          nombre: ec.nombre,
          telefono: tel,
          parentesco: ec.parentesco,
        })
        .select("id, contract_signup_id, nombre")
        .single();
      if (cErr || !created) throw new Error("No pudimos registrar tu acceso.");
      Object.assign({}, member ?? {});
      // continue with created
      return await sendCode(created.id, tel);
    }

    return await sendCode(member.id, tel);
  });

async function sendCode(memberId: string, tel: string) {
  // Cooldown contra spam
  const { data: recent } = await supabaseAdmin
    .from("family_login_codes")
    .select("created_at")
    .eq("telefono", tel)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recent) {
    const ageSec = (Date.now() - new Date(recent.created_at).getTime()) / 1000;
    if (ageSec < RESEND_COOLDOWN_S) {
      throw new Error(`Espera ${Math.ceil(RESEND_COOLDOWN_S - ageSec)}s antes de reintentar.`);
    }
  }

  const code = randomCode6();
  const hash = await sha256(code);
  const expires = new Date(Date.now() + CODE_TTL_MIN * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin.from("family_login_codes").insert({
    telefono: tel,
    code_hash: hash,
    expires_at: expires,
  });
  if (error) throw error;

  const body = `Senior Safe — tu código es ${code}. Expira en ${CODE_TTL_MIN} minutos.`;
  const okWA = (await sendTwilioChannelMessage(tel, body, "whatsapp")).ok;
  if (!okWA) await sendTwilioChannelMessage(tel, body, "sms");

  await logAccess(memberId, null, "code_sent", { telefono: tel });
  return { ok: true, ttl_minutes: CODE_TTL_MIN };
}

// ============================================================
// 2) Verificar código → emitir session token
// ============================================================
export const verifyFamilyCode = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ telefono: z.string().min(4).max(40), code: z.string().regex(/^\d{6}$/) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const tel = normalizePhoneE164(data.telefono);
    if (!tel) throw new Error("Teléfono inválido.");

    const { data: row } = await supabaseAdmin
      .from("family_login_codes")
      .select("id, code_hash, expires_at, attempts, consumed_at")
      .eq("telefono", tel)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) throw new Error("Solicita un nuevo código.");
    if (new Date(row.expires_at).getTime() < Date.now()) throw new Error("El código expiró.");
    if (row.attempts >= MAX_ATTEMPTS) throw new Error("Demasiados intentos. Solicita otro código.");

    const hash = await sha256(data.code);
    if (hash !== row.code_hash) {
      await supabaseAdmin
        .from("family_login_codes")
        .update({ attempts: row.attempts + 1 })
        .eq("id", row.id);
      throw new Error("Código incorrecto.");
    }

    await supabaseAdmin
      .from("family_login_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", row.id);

    const { data: member } = await supabaseAdmin
      .from("family_members")
      .select("id, contract_signup_id, nombre")
      .eq("telefono", tel)
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!member) throw new Error("Familiar no encontrado.");

    // session token simple (no JWT) — válido 30 días
    const token = await sha256(`${member.id}.${Date.now()}.${crypto.randomUUID()}`);
    // Reutilizamos family_login_codes con un marcador: NO — mejor metemos en metadata. Para mantener simple,
    // guardamos en family_access_log el token activo. Pero necesitamos validarlo barato.
    // Plan B: usar memoria de sesión solo en cliente y revalidar familyId en cada server fn.
    // Mejor: el cliente guarda { telefono, family_member_id } y revalidamos contra DB en cada call.

    await logAccess(member.id, member.contract_signup_id, "login_success", { telefono: tel });

    return {
      ok: true,
      session: {
        family_member_id: member.id,
        contract_signup_id: member.contract_signup_id,
        nombre: member.nombre,
        token, // opaco, no usado para auth — futuro
      },
    };
  });

const sessionSchema = z.object({
  family_member_id: z.string().uuid(),
  contract_signup_id: z.string().uuid(),
});

async function assertSession(familyMemberId: string, signupId: string) {
  const { data } = await supabaseAdmin
    .from("family_members")
    .select("id, contract_signup_id, activo")
    .eq("id", familyMemberId)
    .maybeSingle();
  if (!data || !data.activo || data.contract_signup_id !== signupId) {
    throw new Error("Sesión inválida.");
  }
  return data;
}

// ============================================================
// 3) Dashboard del familiar
// ============================================================
export const getFamilyDashboard = createServerFn({ method: "POST" })
  .inputValidator((input) => sessionSchema.parse(input))
  .handler(async ({ data }) => {
    await assertSession(data.family_member_id, data.contract_signup_id);

    const [{ data: senior }, { data: device }, { data: alerts }] = await Promise.all([
      supabaseAdmin
        .from(CONTRACT_SIGNUPS_TABLE)
        .select("id, nombre, telefono")
        .eq("id", data.contract_signup_id)
        .maybeSingle(),
      supabaseAdmin
        .from("device_status")
        .select(
          "last_seen_at, battery_level, gps_enabled, internet_connected, app_version, last_lat, last_lng",
        )
        .eq("contract_signup_id", data.contract_signup_id)
        .maybeSingle(),
      supabaseAdmin
        .from("alert_logs")
        .select(
          "id, created_at, event_type, status, gps_lat, gps_lng, acknowledged_at, acknowledgement_by_name, metadata",
        )
        .eq("contract_signup_id", data.contract_signup_id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    // Estado visual
    const lastAlert = alerts?.[0];
    const isActiveAlert =
      lastAlert &&
      ["pending", "partial", "delivered", "failed"].includes(lastAlert.status) &&
      !lastAlert.acknowledged_at &&
      Date.now() - new Date(lastAlert.created_at).getTime() < 30 * 60 * 1000;

    const lastSeenMs = device?.last_seen_at
      ? Date.now() - new Date(device.last_seen_at).getTime()
      : Infinity;
    const isDisconnected = lastSeenMs > 10 * 60 * 1000;

    let visualStatus: "alert" | "disconnected" | "no_gps" | "ok";
    if (isActiveAlert) visualStatus = "alert";
    else if (isDisconnected) visualStatus = "disconnected";
    else if (device && device.gps_enabled === false) visualStatus = "no_gps";
    else visualStatus = "ok";

    await logAccess(data.family_member_id, data.contract_signup_id, "dashboard_view");

    return { senior, device, alerts: alerts ?? [], visualStatus };
  });

// ============================================================
// 4) Acknowledge desde link (público con token de un solo uso)
// ============================================================
export const ackAlertByToken = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ token: z.string().min(16).max(128), nombre: z.string().max(120).optional() })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: alert } = await supabaseAdmin
      .from("alert_logs")
      .select("id, acknowledged_at, acknowledgement_expires_at, contract_signup_id")
      .eq("acknowledgement_token", data.token)
      .maybeSingle();

    if (!alert) throw new Error("Link no válido.");
    if (alert.acknowledged_at) {
      return { ok: true, already: true, contract_signup_id: alert.contract_signup_id };
    }
    if (
      alert.acknowledgement_expires_at &&
      new Date(alert.acknowledgement_expires_at).getTime() < Date.now()
    ) {
      throw new Error("Este link de confirmación expiró.");
    }

    const { error } = await supabaseAdmin
      .from("alert_logs")
      .update({
        acknowledged_at: new Date().toISOString(),
        acknowledgement_by_name: data.nombre?.slice(0, 120) ?? null,
      })
      .eq("id", alert.id);
    if (error) throw error;

    return { ok: true, already: false, contract_signup_id: alert.contract_signup_id };
  });

// ============================================================
// 5) ¿Hay acknowledge? (consultado puntualmente desde /native)
// ============================================================
export const checkLastAlertAck = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ signupId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("alert_logs")
      .select("id, created_at, acknowledged_at, acknowledgement_by_name")
      .eq("contract_signup_id", data.signupId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { alert: row ?? null };
  });
