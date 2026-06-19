import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { PRODUCTION_SITE_URL } from "@/lib/app-url";
import { isTwilioConfigured, twilioPost } from "@/lib/twilio";

export type AckAlertResult = {
  ok: true;
  already: boolean;
  contract_signup_id: string;
};

type AlertAckRow = {
  id: string;
  acknowledged_at: string | null;
  acknowledgement_expires_at: string | null;
  contract_signup_id: string;
  acknowledgement_token: string | null;
  metadata: Record<string, unknown> | null;
  created_at?: string | null;
};

/** Solo columnas que existen en todas las instalaciones; el resto vive en metadata. */
const ACK_ROW_SELECT = "id, acknowledged_at, contract_signup_id, metadata, created_at";

const MIN_ACK_TOKEN_LEN = 6;
const RECENT_ACK_WINDOW_MS = 72 * 60 * 60 * 1000;
const SCAN_ALERT_LIMIT = 120;

/** Token corto (24 hex) — más fiable en SMS que UUID largo. */
export function generateAckToken(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Limpia token recortado o con caracteres extra al abrir desde SMS/WhatsApp. */
export function normalizeAckToken(raw: string): string {
  return raw.trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 128);
}

export function sanitizeRouteToken(raw: string): string {
  return normalizeAckToken(raw.split("?")[0]?.split("#")[0]?.split("&")[0] ?? raw);
}

function sanitizeAlertId(raw: string): string {
  return raw.trim().toLowerCase();
}

function isUuid(value: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(value);
}

/** /a/{token}, /a/{alertId}/{token}, /c/{token} */
export function parseAckPathFromUrl(pathname: string): { alertId?: string; token: string } | null {
  const parts = pathname.split("/").filter(Boolean);
  const prefix = parts[0];
  if (prefix !== "a" && prefix !== "c") return null;
  if (prefix === "a" && parts.length >= 3 && isUuid(parts[1]!)) {
    return { alertId: sanitizeAlertId(parts[1]!), token: parts[2]! };
  }
  if (parts.length >= 2) return { token: parts[1]! };
  return null;
}

function ackTokenFromMetadataUrl(metadata: Record<string, unknown> | null | undefined): string | null {
  const ackUrl = typeof metadata?.ack_url === "string" ? metadata.ack_url : null;
  if (!ackUrl) return null;
  const withId = ackUrl.match(/\/a\/([0-9a-f-]{36})\/([a-z0-9]+)/i);
  if (withId?.[2]) return normalizeAckToken(withId[2]);
  const shortC = ackUrl.match(/\/c\/([a-z0-9]+)/i);
  if (shortC?.[1]) return normalizeAckToken(shortC[1]);
  const legacy = ackUrl.match(/\/a\/([a-z0-9]+)/i);
  return legacy?.[1] ? normalizeAckToken(legacy[1]) : null;
}

function storedAckToken(row: AlertAckRow): string | null {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  const fromMeta = typeof meta.ack_token === "string" ? meta.ack_token : null;
  return fromMeta ?? row.acknowledgement_token ?? null;
}

function storedAckExpiresAt(row: AlertAckRow): string | null {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  const fromMeta = typeof meta.ack_expires_at === "string" ? meta.ack_expires_at : null;
  return row.acknowledgement_expires_at ?? fromMeta;
}

function isAcknowledged(row: AlertAckRow): boolean {
  if (row.acknowledged_at) return true;
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return typeof meta.acknowledged_at === "string" && meta.acknowledged_at.length > 0;
}

function isRecentUnackedAlert(alert: AlertAckRow): boolean {
  if (isAcknowledged(alert)) return false;
  const expires = storedAckExpiresAt(alert);
  if (expires && new Date(expires).getTime() < Date.now()) return false;
  const created = alert.created_at ? new Date(alert.created_at).getTime() : Date.now();
  return Date.now() - created <= RECENT_ACK_WINDOW_MS;
}

function rowFromDb(data: Record<string, unknown>): AlertAckRow {
  const meta = (data.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(data.id),
    acknowledged_at: (data.acknowledged_at as string | null) ?? null,
    contract_signup_id: String(data.contract_signup_id),
    metadata: meta,
    created_at: (data.created_at as string | null) ?? null,
    acknowledgement_token:
      typeof meta.ack_token === "string"
        ? meta.ack_token
        : ((data.acknowledgement_token as string | null) ?? null),
    acknowledgement_expires_at:
      typeof meta.ack_expires_at === "string"
        ? meta.ack_expires_at
        : ((data.acknowledgement_expires_at as string | null) ?? null),
  };
}

function tokenMatches(stored: string | null | undefined, token: string): boolean {
  if (!stored) return false;
  const s = normalizeAckToken(stored);
  const t = normalizeAckToken(token);
  if (!s || !t) return false;
  if (s === t || s.toLowerCase() === t.toLowerCase()) return true;
  if (t.length >= MIN_ACK_TOKEN_LEN && s.startsWith(t)) return true;
  if (s.length >= MIN_ACK_TOKEN_LEN && t.startsWith(s)) return true;
  return false;
}

function tokenPresentInAckUrl(meta: Record<string, unknown>, token: string): boolean {
  const ackUrl = typeof meta.ack_url === "string" ? meta.ack_url : "";
  const t = normalizeAckToken(token);
  if (t.length < MIN_ACK_TOKEN_LEN || !ackUrl) return false;
  return ackUrl.toLowerCase().includes(t.toLowerCase());
}

function alertMatchesToken(alert: AlertAckRow, token: string): boolean {
  const meta = (alert.metadata ?? {}) as Record<string, unknown>;
  const urlToken = ackTokenFromMetadataUrl(meta);
  if (tokenMatches(storedAckToken(alert), token)) return true;
  if (urlToken && tokenMatches(urlToken, token)) return true;
  if (tokenPresentInAckUrl(meta, token)) return true;
  return false;
}

/** Enlace corto preferido en SMS: /c/{token} */
export function buildConfirmAlertUrl(token: string): string {
  const base = PRODUCTION_SITE_URL.replace(/\/$/, "");
  return `${base}/c/${normalizeAckToken(token)}`;
}

/** Compatibilidad con enlaces antiguos /a/{token}. */
export function buildLegacyAckAlertUrl(token: string): string {
  return buildConfirmAlertUrl(token);
}

/** Enlace con UUID (portal / depuración). */
export function buildAckAlertUrl(alertId: string, token: string): string {
  const base = PRODUCTION_SITE_URL.replace(/\/$/, "");
  return `${base}/a/${alertId}/${normalizeAckToken(token)}`;
}

async function findAlertById(alertId: string): Promise<AlertAckRow | null> {
  const id = sanitizeAlertId(alertId);
  if (!isUuid(id)) return null;

  const { data, error } = await supabaseAdmin
    .from("alert_logs")
    .select(ACK_ROW_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[ack-alert] findAlertById:", error.message);
    return null;
  }
  if (!data) return null;
  return rowFromDb(data as Record<string, unknown>);
}

async function scanRecentAlertsForToken(token: string): Promise<AlertAckRow | null> {
  const normalized = normalizeAckToken(token);
  if (normalized.length < MIN_ACK_TOKEN_LEN) return null;

  const since = new Date(Date.now() - RECENT_ACK_WINDOW_MS).toISOString();
  const { data, error } = await supabaseAdmin
    .from("alert_logs")
    .select(ACK_ROW_SELECT)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(SCAN_ALERT_LIMIT);

  if (error) {
    console.error("[ack-alert] scan failed:", error.message);
    return null;
  }

  for (const row of data ?? []) {
    const alert = rowFromDb(row as Record<string, unknown>);
    if (alertMatchesToken(alert, normalized)) return alert;
  }
  return null;
}

async function findAlertForAckToken(token: string): Promise<AlertAckRow | null> {
  const normalized = normalizeAckToken(token);
  if (normalized.length < MIN_ACK_TOKEN_LEN) return null;

  // 1) Escaneo en memoria (más fiable que filtros JSON en PostgREST)
  const scanned = await scanRecentAlertsForToken(normalized);
  if (scanned) return scanned;

  // 2) UUID en /a/{uuid} truncado
  if (isUuid(normalized)) {
    const byId = await findAlertById(normalized);
    if (byId && isRecentUnackedAlert(byId)) return byId;
  }

  // 3) metadata @> { ack_token }
  const { data: byContains } = await supabaseAdmin
    .from("alert_logs")
    .select(ACK_ROW_SELECT)
    .contains("metadata", { ack_token: normalized })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (byContains) return rowFromDb(byContains as Record<string, unknown>);

  // 4) Columna acknowledgement_token (si existe)
  const { data: byCol, error: colErr } = await supabaseAdmin
    .from("alert_logs")
    .select(ACK_ROW_SELECT)
    .eq("acknowledgement_token", normalized)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!colErr && byCol) return rowFromDb(byCol as Record<string, unknown>);

  return null;
}

async function cancelOutboundCallsForAlert(alert: AlertAckRow): Promise<void> {
  if (!isTwilioConfigured()) return;
  const meta = (alert.metadata ?? {}) as Record<string, unknown>;
  const sids = new Set<string>();
  const results = Array.isArray(meta.results) ? meta.results : [];
  for (const row of results) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (r.channel === "call" && r.status === "sent" && typeof r.sid === "string") {
      sids.add(r.sid);
    }
  }
  if (Array.isArray(meta.active_call_sids)) {
    for (const sid of meta.active_call_sids) {
      if (typeof sid === "string" && sid.startsWith("CA")) sids.add(sid);
    }
  }
  for (const sid of sids) {
    try {
      await twilioPost(`/Calls/${sid}.json`, { Status: "completed" });
    } catch (e) {
      console.warn("[ack-alert] cancel call failed:", sid, e);
    }
  }
}

async function completeAck(alert: AlertAckRow, nombre?: string): Promise<AckAlertResult> {
  if (isAcknowledged(alert)) {
    if (nombre) {
      await supabaseAdmin
        .from("alert_logs")
        .update({ acknowledgement_by_name: nombre.slice(0, 120) } as never)
        .eq("id", alert.id);
    }
    return { ok: true, already: true, contract_signup_id: alert.contract_signup_id };
  }

  const expires = storedAckExpiresAt(alert);
  if (expires && new Date(expires).getTime() < Date.now()) {
    throw new Error("Este link de confirmación expiró.");
  }

  const now = new Date().toISOString();
  const metaPatch = {
    ...((alert.metadata ?? {}) as Record<string, unknown>),
    acknowledged_at: now,
    acknowledgement_by_name: nombre?.slice(0, 120) ?? null,
  };

  const { error: metaErr } = await supabaseAdmin
    .from("alert_logs")
    .update({ metadata: metaPatch, status: "acknowledged" } as never)
    .eq("id", alert.id);

  if (metaErr) {
    console.error("[ack-alert] completeAck metadata failed:", metaErr.message);
    throw new Error("No pudimos guardar la confirmación.");
  }

  await supabaseAdmin
    .from("alert_logs")
    .update({
      acknowledged_at: now,
      acknowledgement_by_name: nombre?.slice(0, 120) ?? null,
      status: "acknowledged",
    } as never)
    .eq("id", alert.id);

  await cancelOutboundCallsForAlert({ ...alert, metadata: metaPatch });

  return { ok: true, already: false, contract_signup_id: alert.contract_signup_id };
}

export async function acknowledgeAlertByIdAndToken(
  alertId: string,
  rawToken: string,
  nombre?: string,
): Promise<AckAlertResult> {
  const id = sanitizeAlertId(alertId);
  if (isUuid(id)) {
    const alert = await findAlertById(id);
    if (alert) {
      if (isAcknowledged(alert)) {
        return { ok: true, already: true, contract_signup_id: alert.contract_signup_id };
      }
      if (!isRecentUnackedAlert(alert)) {
        throw new Error("Este link de confirmación expiró.");
      }
      return completeAck(alert, nombre);
    }
  }

  return acknowledgeAlertByToken(rawToken, nombre);
}

export async function acknowledgeAlertByToken(
  rawToken: string,
  nombre?: string,
): Promise<AckAlertResult> {
  const token = sanitizeRouteToken(rawToken);
  if (token.length < MIN_ACK_TOKEN_LEN) {
    throw new Error("Link no válido.");
  }

  if (isUuid(token)) {
    const byId = await findAlertById(token);
    if (byId) {
      if (isAcknowledged(byId)) {
        return { ok: true, already: true, contract_signup_id: byId.contract_signup_id };
      }
      if (isRecentUnackedAlert(byId)) return completeAck(byId, nombre);
      throw new Error("Este link de confirmación expiró.");
    }
  }

  const alert = await findAlertForAckToken(token);
  if (!alert) throw new Error("Link no válido.");

  return completeAck(alert, nombre);
}
