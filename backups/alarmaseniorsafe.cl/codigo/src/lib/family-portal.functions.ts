import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { normalizePhoneE164, phoneLookupCandidates, buildPhoneColumnOrFilter } from "@/lib/phone-utils";
import { sendTwilioWhatsAppWithSmsFallback } from "@/lib/twilio";
import { acknowledgeAlertByToken } from "@/lib/ack-alert";
import { syncDeviceStatus } from "@/lib/device-status-sync";
import { buildFamilyDeviceView } from "@/lib/family-device-status";
import {
  assertFamilySession,
  assertSeniorAccess,
  issueFamilySessionToken,
  seniorAccessTokenSchema,
} from "@/lib/senior-access-auth";

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

type FamilyMemberRow = {
  id: string;
  contract_signup_id: string;
  nombre: string;
  activo: boolean;
  telefono: string;
};

async function pickPreferredSignupId(signupIds: string[]): Promise<string | null> {
  const unique = [...new Set(signupIds.filter(Boolean))];
  if (unique.length === 0) return null;
  if (unique.length === 1) return unique[0];

  const [{ data: signups }, { data: devices }] = await Promise.all([
    supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("id, subscription_status, payment_status, updated_at, created_at")
      .in("id", unique)
      .order("updated_at", { ascending: false }),
    supabaseAdmin
      .from("device_status")
      .select("contract_signup_id, last_seen_at, updated_at")
      .in("contract_signup_id", unique)
      .order("last_seen_at", { ascending: false }),
  ]);

  const existing = signups ?? [];
  if (existing.length === 0) return null;

  const existingIds = new Set(existing.map((s) => s.id));
  const liveDevice = (devices ?? []).find(
    (d) =>
      d.contract_signup_id &&
      existingIds.has(d.contract_signup_id) &&
      d.last_seen_at &&
      Date.now() - new Date(d.last_seen_at).getTime() <= 48 * 60 * 60 * 1000,
  );
  if (liveDevice?.contract_signup_id) return liveDevice.contract_signup_id;

  const { data: recentAlerts } = await supabaseAdmin
    .from("alert_logs")
    .select("contract_signup_id, created_at")
    .in("contract_signup_id", [...existingIds])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (
    recentAlerts?.contract_signup_id &&
    existingIds.has(recentAlerts.contract_signup_id) &&
    Date.now() - new Date(recentAlerts.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000
  ) {
    return recentAlerts.contract_signup_id;
  }

  const activePaid = existing.find(
    (s) => s.subscription_status === "active" && s.payment_status === "paid",
  );
  return activePaid?.id ?? existing[0]?.id ?? unique.find((id) => existingIds.has(id)) ?? null;
}

async function findAllEmergencyContactSignupIds(tel: string): Promise<string[]> {
  const candidates = phoneLookupCandidates(tel);
  if (candidates.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from("emergency_contacts")
    .select("contract_signup_id")
    .or(buildPhoneColumnOrFilter(["telefono", "whatsapp"], candidates))
    .eq("activo", true);

  if (error) {
    console.error("[family-portal] findAllEmergencyContactSignupIds", error.message);
    return [];
  }
  return [...new Set((data ?? []).map((r) => r.contract_signup_id).filter(Boolean))];
}

async function findFamilyMemberByPhone(tel: string): Promise<FamilyMemberRow | null> {
  const candidates = phoneLookupCandidates(tel);
  if (candidates.length === 0) return null;

  const { data, error } = await supabaseAdmin
    .from("family_members")
    .select("id, contract_signup_id, nombre, activo, telefono, created_at")
    .in("telefono", candidates)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[family-portal] findFamilyMemberByPhone", error.message);
    return null;
  }

  const rows = (data ?? []) as Array<FamilyMemberRow & { created_at?: string }>;
  if (rows.length === 0) return null;

  const { data: existingSignups } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("id")
    .in("id", rows.map((r) => r.contract_signup_id));
  const validSignupIds = new Set((existingSignups ?? []).map((s) => s.id));
  const activeRows = rows.filter((r) => validSignupIds.has(r.contract_signup_id));
  const pool = activeRows.length > 0 ? activeRows : rows;

  if (pool.length === 1) return reconcileFamilyMemberSignup(pool[0]);

  const preferredSignupId = await pickPreferredSignupId(pool.map((r) => r.contract_signup_id));
  const picked = pool.find((r) => r.contract_signup_id === preferredSignupId) ?? pool[0];
  return reconcileFamilyMemberSignup(picked);
}

async function findEmergencyContactByPhone(tel: string): Promise<{
  contract_signup_id: string;
  nombre: string;
  parentesco: string;
} | null> {
  const candidates = phoneLookupCandidates(tel);
  if (candidates.length === 0) return null;

  const { data, error } = await supabaseAdmin
    .from("emergency_contacts")
    .select("contract_signup_id, nombre, parentesco, created_at")
    .or(buildPhoneColumnOrFilter(["telefono", "whatsapp"], candidates))
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[family-portal] findEmergencyContactByPhone", error.message);
    return null;
  }

  const rows = data ?? [];
  if (rows.length === 0) return null;
  if (rows.length === 1) return rows[0];

  const preferredSignupId = await pickPreferredSignupId(rows.map((r) => r.contract_signup_id));
  return rows.find((r) => r.contract_signup_id === preferredSignupId) ?? rows[0];
}

async function reactivateFamilyMember(member: FamilyMemberRow, canonicalTel: string) {
  const { error } = await supabaseAdmin
    .from("family_members")
    .update({ activo: true, telefono: canonicalTel, updated_at: new Date().toISOString() })
    .eq("id", member.id);
  if (error) throw error;
}

async function reconcileFamilyMemberSignup(member: FamilyMemberRow): Promise<FamilyMemberRow> {
  const ecIds = await findAllEmergencyContactSignupIds(member.telefono);
  const candidateIds = [member.contract_signup_id, ...ecIds];

  const { data: currentSignup } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("id")
    .eq("id", member.contract_signup_id)
    .maybeSingle();

  const idsForPick =
    currentSignup || ecIds.length === 0 ? candidateIds : ecIds;
  const preferred = await pickPreferredSignupId(idsForPick);
  if (!preferred || preferred === member.contract_signup_id) return member;

  const { data: signup } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("id")
    .eq("id", preferred)
    .maybeSingle();
  if (!signup) return member;

  const { error } = await supabaseAdmin
    .from("family_members")
    .update({ contract_signup_id: preferred, updated_at: new Date().toISOString() })
    .eq("id", member.id);
  if (error) {
    console.error("[family-portal] reconcile signup", error.message);
    return member;
  }

  await logAccess(member.id, preferred, "signup_reconciled", {
    from: member.contract_signup_id,
    telefono: member.telefono,
  });
  return { ...member, contract_signup_id: preferred };
}

async function ensureFamilyMemberForLogin(tel: string): Promise<FamilyMemberRow> {
  const existing = await findFamilyMemberByPhone(tel);
  if (existing?.activo) return reconcileFamilyMemberSignup(existing);

  if (existing && !existing.activo) {
    await reactivateFamilyMember(existing, tel);
    return { ...existing, activo: true, telefono: tel };
  }

  const ec = await findEmergencyContactByPhone(tel);
  if (!ec) {
    await logAccess(null, null, "code_request_unknown", { telefono: tel });
    throw new Error("Este número no está registrado como familiar.");
  }

  const { data: created, error: insertErr } = await supabaseAdmin
    .from("family_members")
    .insert({
      contract_signup_id: ec.contract_signup_id,
      nombre: ec.nombre,
      telefono: tel,
      parentesco: ec.parentesco,
    })
    .select("id, contract_signup_id, nombre, activo, telefono")
    .single();

  if (!insertErr && created) {
    return reconcileFamilyMemberSignup(created as FamilyMemberRow);
  }

  // Conflicto único (signup+teléfono): reutilizar fila existente en lugar de fallar.
  if (insertErr?.code === "23505") {
    const conflict = await findFamilyMemberByPhone(tel);
    if (conflict) {
      if (!conflict.activo) await reactivateFamilyMember(conflict, tel);
      return reconcileFamilyMemberSignup({ ...conflict, activo: true, telefono: tel });
    }

    const { data: bySignup } = await supabaseAdmin
      .from("family_members")
      .select("id, contract_signup_id, nombre, activo, telefono")
      .eq("contract_signup_id", ec.contract_signup_id)
      .in("telefono", phoneLookupCandidates(tel))
      .order("created_at", { ascending: false })
      .limit(1);

    const row = bySignup?.[0] as FamilyMemberRow | undefined;
    if (row) {
      if (!row.activo) await reactivateFamilyMember(row, tel);
      return reconcileFamilyMemberSignup({ ...row, activo: true, telefono: tel });
    }
  }

  console.error("[family-portal] ensureFamilyMemberForLogin", insertErr?.message ?? "unknown");
  throw new Error("No pudimos registrar tu acceso.");
}

// ============================================================
// 1) Solicitar código por teléfono
// ============================================================
export const requestFamilyCode = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ telefono: z.string().min(4).max(40) }).parse(input))
  .handler(async ({ data }) => {
    const tel = normalizePhoneE164(data.telefono);
    if (!tel) throw new Error("Teléfono inválido.");

    const member = await ensureFamilyMemberForLogin(tel);
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
  const { whatsappOk, smsOk } = await sendTwilioWhatsAppWithSmsFallback(tel, body);

  await logAccess(memberId, null, "code_sent", {
    telefono: tel,
    whatsapp_ok: whatsappOk,
    sms_ok: smsOk,
  });
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

    const member = await ensureFamilyMemberForLogin(tel);
    const token = await issueFamilySessionToken(member.id, member.contract_signup_id);

    await logAccess(member.id, member.contract_signup_id, "login_success", { telefono: tel });

    return {
      ok: true,
      session: {
        family_member_id: member.id,
        contract_signup_id: member.contract_signup_id,
        nombre: member.nombre,
        token,
      },
    };
  });

const sessionSchema = z.object({
  family_member_id: z.string().uuid(),
  contract_signup_id: z.string().uuid(),
  session_token: seniorAccessTokenSchema,
});

async function assertSession(
  familyMemberId: string,
  signupId: string,
  sessionToken: string,
): Promise<FamilyMemberRow> {
  await assertFamilySession(familyMemberId, signupId, sessionToken);
  const { data } = await supabaseAdmin
    .from("family_members")
    .select("id, contract_signup_id, nombre, activo, telefono")
    .eq("id", familyMemberId)
    .maybeSingle();
  if (!data || !data.activo) {
    throw new Error("Sesión inválida.");
  }
  return reconcileFamilyMemberSignup(data as FamilyMemberRow);
}

// ============================================================
// 3) Dashboard del familiar
// ============================================================
export const getFamilyDashboard = createServerFn({ method: "POST" })
  .inputValidator((input) => sessionSchema.parse(input))
  .handler(async ({ data }) => {
    const member = await assertSession(
      data.family_member_id,
      data.contract_signup_id,
      data.session_token,
    );
    const signupId = member.contract_signup_id;

    const [{ data: senior }, { data: deviceRowInitial }, { data: alerts }] = await Promise.all([
      supabaseAdmin
        .from(CONTRACT_SIGNUPS_TABLE)
        .select("id, nombre, telefono")
        .eq("id", signupId)
        .maybeSingle(),
      supabaseAdmin
        .from("device_status")
        .select(
          "last_seen_at, battery_level, gps_enabled, internet_connected, app_version, last_lat, last_lng, updated_at",
        )
        .eq("contract_signup_id", signupId)
        .maybeSingle(),
      supabaseAdmin
        .from("alert_logs")
        .select(
          "id, created_at, event_type, status, gps_lat, gps_lng, acknowledged_at, acknowledgement_by_name, metadata",
        )
        .eq("contract_signup_id", signupId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const lastAlert = alerts?.[0];
    let deviceRow = deviceRowInitial;
    const isActiveAlert = Boolean(
      lastAlert &&
        ["pending", "partial", "delivered", "failed"].includes(lastAlert.status) &&
        !lastAlert.acknowledged_at &&
        Date.now() - new Date(lastAlert.created_at).getTime() < 30 * 60 * 1000,
    );

    // Persistir fila si solo existía actividad por alertas (backfill legacy).
    if (!deviceRow?.last_seen_at && lastAlert) {
      try {
        await syncDeviceStatus({
          contractSignupId: signupId,
          last_seen_at: lastAlert.created_at,
          gps_enabled: lastAlert.gps_lat != null && lastAlert.gps_lng != null,
          last_lat: lastAlert.gps_lat ?? null,
          last_lng: lastAlert.gps_lng ?? null,
          internet_connected: true,
        });
        const { data: refreshed } = await supabaseAdmin
          .from("device_status")
          .select(
            "last_seen_at, battery_level, gps_enabled, internet_connected, app_version, last_lat, last_lng, updated_at",
          )
          .eq("contract_signup_id", signupId)
          .maybeSingle();
        if (refreshed) deviceRow = refreshed;
      } catch (e) {
        console.error("[family-dashboard] device_status backfill failed:", e);
      }
    }

    const deviceView = buildFamilyDeviceView(deviceRow, lastAlert ?? null, isActiveAlert);

    await logAccess(data.family_member_id, signupId, "dashboard_view");

    const sessionRefresh =
      signupId !== data.contract_signup_id
        ? { token: await issueFamilySessionToken(member.id, signupId) }
        : undefined;

    return {
      contract_signup_id: signupId,
      session: sessionRefresh,
      senior,
      device: deviceView.device,
      alerts: alerts ?? [],
      visualStatus: deviceView.visualStatus,
      isLiveConnected: deviceView.isLiveConnected,
      lastActivityAt: deviceView.lastActivityAt,
      lastActivitySource: deviceView.lastActivitySource,
    };
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
  .handler(async ({ data }) => acknowledgeAlertByToken(data.token, data.nombre));

// ============================================================
// 5) ¿Hay acknowledge? (consultado puntualmente desde /native)
// ============================================================
export const checkLastAlertAck = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        signupId: z.string().uuid(),
        accessToken: seniorAccessTokenSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await assertSeniorAccess(data.signupId, data.accessToken);
    const { data: row } = await supabaseAdmin
      .from("alert_logs")
      .select("id, created_at, acknowledged_at, acknowledgement_by_name")
      .eq("contract_signup_id", data.signupId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { alert: row ?? null };
  });
