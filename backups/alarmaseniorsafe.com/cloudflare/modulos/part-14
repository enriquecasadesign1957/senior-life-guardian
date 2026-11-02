import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { P as PRODUCTION_SITE_URL } from "./index.mjs";
import { i as isTwilioConfigured, g as twilioPost } from "./twilio-DNHuHEFY.mjs";
const ACK_ROW_SELECT = "id, acknowledged_at, contract_signup_id, metadata, created_at";
const MIN_ACK_TOKEN_LEN = 6;
const RECENT_ACK_WINDOW_MS = 72 * 60 * 60 * 1e3;
const SCAN_ALERT_LIMIT = 120;
function generateAckToken() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
function normalizeAckToken(raw) {
  return raw.trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 128);
}
function sanitizeRouteToken(raw) {
  return normalizeAckToken(raw.split("?")[0]?.split("#")[0]?.split("&")[0] ?? raw);
}
function sanitizeAlertId(raw) {
  return raw.trim().toLowerCase();
}
function isUuid(value) {
  return /^[0-9a-f-]{36}$/i.test(value);
}
function parseAckPathFromUrl(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const prefix = parts[0];
  if (prefix !== "a" && prefix !== "c") return null;
  if (prefix === "a" && parts.length >= 3 && isUuid(parts[1])) {
    return { alertId: sanitizeAlertId(parts[1]), token: parts[2] };
  }
  if (parts.length >= 2) return { token: parts[1] };
  return null;
}
function ackTokenFromMetadataUrl(metadata) {
  const ackUrl = typeof metadata?.ack_url === "string" ? metadata.ack_url : null;
  if (!ackUrl) return null;
  const withId = ackUrl.match(/\/a\/([0-9a-f-]{36})\/([a-z0-9]+)/i);
  if (withId?.[2]) return normalizeAckToken(withId[2]);
  const shortC = ackUrl.match(/\/c\/([a-z0-9]+)/i);
  if (shortC?.[1]) return normalizeAckToken(shortC[1]);
  const legacy = ackUrl.match(/\/a\/([a-z0-9]+)/i);
  return legacy?.[1] ? normalizeAckToken(legacy[1]) : null;
}
function storedAckToken(row) {
  const meta = row.metadata ?? {};
  const fromMeta = typeof meta.ack_token === "string" ? meta.ack_token : null;
  return fromMeta ?? row.acknowledgement_token ?? null;
}
function storedAckExpiresAt(row) {
  const meta = row.metadata ?? {};
  const fromMeta = typeof meta.ack_expires_at === "string" ? meta.ack_expires_at : null;
  return row.acknowledgement_expires_at ?? fromMeta;
}
function isAcknowledged(row) {
  if (row.acknowledged_at) return true;
  const meta = row.metadata ?? {};
  return typeof meta.acknowledged_at === "string" && meta.acknowledged_at.length > 0;
}
function isRecentUnackedAlert(alert) {
  if (isAcknowledged(alert)) return false;
  const expires = storedAckExpiresAt(alert);
  if (expires && new Date(expires).getTime() < Date.now()) return false;
  const created = alert.created_at ? new Date(alert.created_at).getTime() : Date.now();
  return Date.now() - created <= RECENT_ACK_WINDOW_MS;
}
function rowFromDb(data) {
  const meta = data.metadata ?? {};
  return {
    id: String(data.id),
    acknowledged_at: data.acknowledged_at ?? null,
    contract_signup_id: String(data.contract_signup_id),
    metadata: meta,
    created_at: data.created_at ?? null,
    acknowledgement_token: typeof meta.ack_token === "string" ? meta.ack_token : data.acknowledgement_token ?? null,
    acknowledgement_expires_at: typeof meta.ack_expires_at === "string" ? meta.ack_expires_at : data.acknowledgement_expires_at ?? null
  };
}
function tokenMatches(stored, token) {
  if (!stored) return false;
  const s = normalizeAckToken(stored);
  const t = normalizeAckToken(token);
  if (!s || !t) return false;
  if (s === t || s.toLowerCase() === t.toLowerCase()) return true;
  if (t.length >= MIN_ACK_TOKEN_LEN && s.startsWith(t)) return true;
  if (s.length >= MIN_ACK_TOKEN_LEN && t.startsWith(s)) return true;
  return false;
}
function tokenPresentInAckUrl(meta, token) {
  const ackUrl = typeof meta.ack_url === "string" ? meta.ack_url : "";
  const t = normalizeAckToken(token);
  if (t.length < MIN_ACK_TOKEN_LEN || !ackUrl) return false;
  return ackUrl.toLowerCase().includes(t.toLowerCase());
}
function alertMatchesToken(alert, token) {
  const meta = alert.metadata ?? {};
  const urlToken = ackTokenFromMetadataUrl(meta);
  if (tokenMatches(storedAckToken(alert), token)) return true;
  if (urlToken && tokenMatches(urlToken, token)) return true;
  if (tokenPresentInAckUrl(meta, token)) return true;
  return false;
}
function buildConfirmAlertUrl(token) {
  const base = PRODUCTION_SITE_URL.replace(/\/$/, "");
  return `${base}/c/${normalizeAckToken(token)}`;
}
function buildLegacyAckAlertUrl(token) {
  return buildConfirmAlertUrl(token);
}
function buildAckAlertUrl(alertId, token) {
  const base = PRODUCTION_SITE_URL.replace(/\/$/, "");
  return `${base}/a/${alertId}/${normalizeAckToken(token)}`;
}
async function findAlertById(alertId) {
  const id = sanitizeAlertId(alertId);
  if (!isUuid(id)) return null;
  const { data, error } = await supabaseAdmin.from("alert_logs").select(ACK_ROW_SELECT).eq("id", id).maybeSingle();
  if (error) {
    console.error("[ack-alert] findAlertById:", error.message);
    return null;
  }
  if (!data) return null;
  return rowFromDb(data);
}
async function scanRecentAlertsForToken(token) {
  const normalized = normalizeAckToken(token);
  if (normalized.length < MIN_ACK_TOKEN_LEN) return null;
  const since = new Date(Date.now() - RECENT_ACK_WINDOW_MS).toISOString();
  const { data, error } = await supabaseAdmin.from("alert_logs").select(ACK_ROW_SELECT).gte("created_at", since).order("created_at", { ascending: false }).limit(SCAN_ALERT_LIMIT);
  if (error) {
    console.error("[ack-alert] scan failed:", error.message);
    return null;
  }
  for (const row of data ?? []) {
    const alert = rowFromDb(row);
    if (alertMatchesToken(alert, normalized)) return alert;
  }
  return null;
}
async function findAlertForAckToken(token) {
  const normalized = normalizeAckToken(token);
  if (normalized.length < MIN_ACK_TOKEN_LEN) return null;
  const scanned = await scanRecentAlertsForToken(normalized);
  if (scanned) return scanned;
  if (isUuid(normalized)) {
    const byId = await findAlertById(normalized);
    if (byId && isRecentUnackedAlert(byId)) return byId;
  }
  const { data: byContains } = await supabaseAdmin.from("alert_logs").select(ACK_ROW_SELECT).contains("metadata", { ack_token: normalized }).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (byContains) return rowFromDb(byContains);
  const { data: byCol, error: colErr } = await supabaseAdmin.from("alert_logs").select(ACK_ROW_SELECT).eq("acknowledgement_token", normalized).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!colErr && byCol) return rowFromDb(byCol);
  return null;
}
async function cancelOutboundCallsForAlert(alert) {
  if (!isTwilioConfigured()) return;
  const meta = alert.metadata ?? {};
  const sids = /* @__PURE__ */ new Set();
  const results = Array.isArray(meta.results) ? meta.results : [];
  for (const row of results) {
    if (!row || typeof row !== "object") continue;
    const r = row;
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
async function completeAck(alert, nombre) {
  if (isAcknowledged(alert)) {
    if (nombre) {
      await supabaseAdmin.from("alert_logs").update({ acknowledgement_by_name: nombre.slice(0, 120) }).eq("id", alert.id);
    }
    return { ok: true, already: true, contract_signup_id: alert.contract_signup_id };
  }
  const expires = storedAckExpiresAt(alert);
  if (expires && new Date(expires).getTime() < Date.now()) {
    throw new Error("Este link de confirmación expiró.");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const metaPatch = {
    ...alert.metadata ?? {},
    acknowledged_at: now,
    acknowledgement_by_name: nombre?.slice(0, 120) ?? null
  };
  const { error: metaErr } = await supabaseAdmin.from("alert_logs").update({ metadata: metaPatch, status: "acknowledged" }).eq("id", alert.id);
  if (metaErr) {
    console.error("[ack-alert] completeAck metadata failed:", metaErr.message);
    throw new Error("No pudimos guardar la confirmación.");
  }
  await supabaseAdmin.from("alert_logs").update({
    acknowledged_at: now,
    acknowledgement_by_name: nombre?.slice(0, 120) ?? null,
    status: "acknowledged"
  }).eq("id", alert.id);
  await cancelOutboundCallsForAlert({ ...alert, metadata: metaPatch });
  return { ok: true, already: false, contract_signup_id: alert.contract_signup_id };
}
async function acknowledgeAlertByIdAndToken(alertId, rawToken, nombre) {
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
async function acknowledgeAlertByToken(rawToken, nombre) {
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
export {
  acknowledgeAlertByToken as a,
  acknowledgeAlertByIdAndToken as b,
  buildConfirmAlertUrl as c,
  buildAckAlertUrl as d,
  buildLegacyAckAlertUrl as e,
  generateAckToken as g,
  normalizeAckToken as n,
  parseAckPathFromUrl as p,
  sanitizeRouteToken as s
};
