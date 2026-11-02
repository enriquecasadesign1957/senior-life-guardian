import process from "node:process";
import { c as createServerRpc } from "./createServerRpc-ChaSCZOg.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { C as CONTRACT_SIGNUPS_TABLE } from "./signups-db-JWUtXpaW.mjs";
import { l as locationShareUrl } from "./maps-BhXedqc-.mjs";
import { d as twilioSmsFrom, e as twilioVoiceFrom, i as isTwilioConfigured, f as twilioResourceSid, g as twilioPost } from "./twilio-DNHuHEFY.mjs";
import { e as emergencyCategorySchema, t as twilioWhatsappEmergencyFrom, f as emergencyCategoryMessageLine, C as CASCADE_VOICE_AFTER_SMS_MS, g as CASCADE_WHATSAPP_AFTER_SMS_MS, h as CASCADE_ALGORITHM_ID, i as isAlertCancelled, A as ALERT_STATUS_CANCELLED, j as ALERT_STATUS_ARMED, k as ALERT_STATUS_DISPATCHING, E as EMERGENCY_ARM_GRACE_MS, l as CASCADE_VOICE_AFTER_WHATSAPP_MS, m as buildCascadeMetadataPatch, n as buildEmergencyWhatsAppSummary, o as buildEmergencyWhatsAppRequestParams, p as buildEmergencyWhatsAppFallbackParams, q as emergencyOutboundCallUrl, r as cancelEmergencyAlertForSignup } from "./emergency-cascade-continuation-BhQV3eMZ.mjs";
import { i as isSubscriptionServiceAllowed, s as subscriptionBlockedMessage } from "./subscription-access-DQDPNP0w.mjs";
import { b as loadEmergencyContactRows, M as MAX_GUARDIANS } from "./contacts-storage-DdsYD-uQ.mjs";
import { g as generateAckToken, c as buildConfirmAlertUrl, d as buildAckAlertUrl } from "./ack-alert-hZc0eMx8.mjs";
import { s as syncDeviceStatus } from "./device-status-sync-CbTBoYX6.mjs";
import { s as seniorAccessTokenSchema, a as assertSeniorAccess } from "./senior-access-auth-Bmk7iyGS.mjs";

import "./index.mjs";
import { a as anyType, o as objectType, s as stringType, n as numberType, e as enumType, b as booleanType } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "./phone-utils-D7EH6fht.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




function createTwilioLatencyTracker() {
  let totalMs = 0;
  const calls = [];
  return {
    async post(path, body) {
      const r = await twilioPost(path, body);
      totalMs += r.durationMs;
      calls.push({ path, ms: r.durationMs });
      return r;
    },
    snapshot() {
      return { totalMs, calls: [...calls] };
    }
  };
}
function computeTiempoSupabaseMs(sosTriggeredAtMs, insertConfirmedAtMs) {
  if (sosTriggeredAtMs == null || !Number.isFinite(sosTriggeredAtMs)) return null;
  const delta = insertConfirmedAtMs - sosTriggeredAtMs;
  if (delta < 0 || delta > 3e5) return null;
  return Math.round(delta);
}
async function persistMetricasLatencia(input) {
  try {
    const { error } = await supabaseAdmin.from("metricas_latencia").insert({
      alert_log_id: input.alertLogId,
      contract_signup_id: input.contractSignupId,
      algorithm: input.algorithm ?? CASCADE_ALGORITHM_ID,
      tiempo_supabase: input.tiempoSupabase,
      tiempo_twilio_api: Math.max(0, Math.round(input.tiempoTwilioApi)),
      twilio_calls: input.twilioCalls?.length ? input.twilioCalls : null,
      training: input.training === true
    });
    if (error) {
      console.error("[metricas-latencia] insert failed:", error.message);
    }
  } catch (e) {
    console.error("[metricas-latencia] insert error:", e);
  }
}
const GpsInput = anyType().transform((raw) => {
  if (raw == null) return null;
  const src = raw && typeof raw === "object" && raw.coords && typeof raw.coords === "object" ? raw.coords : raw;
  const lat = typeof src?.lat === "number" ? src.lat : typeof src?.latitude === "number" ? src.latitude : typeof src?.lat === "string" ? parseFloat(src.lat) : typeof src?.latitude === "string" ? parseFloat(src.latitude) : NaN;
  const lng = typeof src?.lng === "number" ? src.lng : typeof src?.longitude === "number" ? src.longitude : typeof src?.lon === "number" ? src.lon : typeof src?.lng === "string" ? parseFloat(src.lng) : typeof src?.longitude === "string" ? parseFloat(src.longitude) : typeof src?.lon === "string" ? parseFloat(src.lon) : NaN;
  const accRaw = src?.accuracy;
  const accuracy = typeof accRaw === "number" ? accRaw : typeof accRaw === "string" ? parseFloat(accRaw) : void 0;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return {
    lat,
    lng,
    accuracy: Number.isFinite(accuracy) ? accuracy : void 0
  };
}).nullable().optional();
const CancelSchema = objectType({
  signupId: stringType().uuid(),
  accessToken: seniorAccessTokenSchema,
  alertId: stringType().uuid().optional()
});
const Schema = objectType({
  signupId: stringType().uuid(),
  accessToken: seniorAccessTokenSchema,
  gps: GpsInput,
  /** Coordenadas GPS planas (alternativa a `gps`). */
  gpsLat: numberType().finite().optional(),
  gpsLng: numberType().finite().optional(),
  /** Modo entrenamiento: no llama a Twilio (sin costo). */
  trainingMode: booleanType().optional().default(false),
  /** Tipo de emergencia elegido por el usuario en la app. */
  emergencyCategory: emergencyCategorySchema.optional(),
  /** App: espera en servidor antes del primer SMS para permitir «Estoy bien». */
  graceBeforeSend: booleanType().optional().default(false),
  /** send = cascada inmediata (webhooks). arm/dispatch = legado interno. */
  intent: enumType(["send", "arm", "dispatch"]).optional().default("send"),
  /** Requerido cuando intent=dispatch. */
  alertId: stringType().uuid().optional(),
  /** Epoch ms (Date.now()) cuando el cliente gatilló el S.O.S. */
  sosTriggeredAtMs: numberType().int().positive().optional()
});
const WHATSAPP_DELAY_AFTER_SMS_MS = CASCADE_WHATSAPP_AFTER_SMS_MS;
const VOICE_AT_MS = CASCADE_VOICE_AFTER_SMS_MS;
const VOICE_DELAY_AFTER_WHATSAPP_MS = CASCADE_VOICE_AFTER_WHATSAPP_MS;
const ALGORITHM_ID = CASCADE_ALGORITHM_ID;
async function appendActiveCallSid(alertId, callSid) {
  const {
    data: row
  } = await supabaseAdmin.from("alert_logs").select("metadata").eq("id", alertId).maybeSingle();
  const meta = row?.metadata ?? {} ?? {};
  const prev = Array.isArray(meta.active_call_sids) ? meta.active_call_sids.filter((s) => typeof s === "string") : [];
  if (prev.includes(callSid)) return;
  await supabaseAdmin.from("alert_logs").update({
    metadata: {
      ...meta,
      active_call_sids: [...prev, callSid]
    }
  }).eq("id", alertId);
}
function twilioStatusCallbackUrl(alertId, channel) {
  const base = (process.env.PUBLIC_APP_URL || void 0 || "https://alarmaseniorsafe.cl").replace(/\/$/, "");
  return `${base}/api/public/twilio-status-callback?alertId=${encodeURIComponent(alertId)}&channel=${channel}`;
}
function resolveGpsFromInput(data) {
  if (data.gps) {
    return {
      lat: data.gps.lat,
      lng: data.gps.lng,
      accuracy: data.gps.accuracy,
      source: "device"
    };
  }
  if (data.gpsLat != null && data.gpsLng != null && data.gpsLat >= -90 && data.gpsLat <= 90 && data.gpsLng >= -180 && data.gpsLng <= 180) {
    return {
      lat: data.gpsLat,
      lng: data.gpsLng,
      source: "params"
    };
  }
  return null;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function waitGracePeriodForCancel(alertId) {
  const end = Date.now() + EMERGENCY_ARM_GRACE_MS;
  while (Date.now() < end) {
    if (await isAlertCancelled(alertId)) return true;
    await sleep(250);
  }
  return isAlertCancelled(alertId);
}
function isAlertEngagedFromRow(row) {
  if (!row) return false;
  if (row.acknowledged_at) return true;
  const meta = row.metadata ?? {};
  if (typeof meta.acknowledged_at === "string" && meta.acknowledged_at.length > 0) return true;
  return typeof meta.whatsapp_read_at === "string" && meta.whatsapp_read_at.length > 0;
}
async function getAlertEngagement(logId) {
  const {
    data: row
  } = await supabaseAdmin.from("alert_logs").select("acknowledged_at, metadata").eq("id", logId).maybeSingle();
  return row ?? null;
}
async function isAlertEngaged(logId) {
  return isAlertEngagedFromRow(await getAlertEngagement(logId));
}
function normalizePhone(raw) {
  const trimmed = (raw ?? "").replace(/[^\d+]/g, "");
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) return trimmed;
  if (/^\d{8,9}$/.test(trimmed)) return `+56${trimmed}`;
  return `+${trimmed}`;
}
function toEmergencyRecipient(row) {
  const phone = normalizePhone(row.telefono);
  if (!phone) return null;
  const whatsapp = row.whatsapp ?? row.telefono;
  const whatsappPhone = normalizePhone(whatsapp);
  if (!whatsappPhone) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono,
    whatsapp,
    recibe_sms: row.recibe_sms,
    recibe_whatsapp: row.recibe_whatsapp,
    recibe_llamada: row.recibe_llamada,
    parentesco: row.parentesco,
    phone,
    whatsappPhone
  };
}
function buildEmergencyAlertMessage(opts) {
  const confirmBlock = `✅ CONFIRMA QUE RECIBISTE ESTA ALERTA
Toca este enlace (evita la llamada a los 60 s):
` + opts.ackUrl;
  const details = [opts.categoryBlock.trim(), opts.locationBlock, `⏰ Hora:
${opts.timestamp}`].filter(Boolean).join("\n\n");
  return `🚨 URGENTE ALERTA SENIOR

${opts.seniorName} necesita ayuda.

${confirmBlock}

────────────────────
Detalle

${details}

Contacta de inmediato al usuario.`;
}
const sendEmergencyAlert_createServerFn_handler = createServerRpc({
  id: "230816b26689b6ff9837dcee775dcf74513eae1a16e4623b821ff26fc4f356b7",
  name: "sendEmergencyAlert",
  filename: "src/lib/emergency-alert.functions.ts"
}, (opts) => sendEmergencyAlert.__executeServer(opts));
const sendEmergencyAlert = createServerFn({
  method: "POST"
}).inputValidator((input) => Schema.parse(input)).handler(sendEmergencyAlert_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  const twilioLatency = createTwilioLatencyTracker();
  let tiempoSupabaseMs = null;
  let metricsAlertId = null;
  let metricsSignupId = null;
  const flushMetricasLatencia = async () => {
    if (!metricsAlertId || !metricsSignupId) return;
    const {
      totalMs,
      calls
    } = twilioLatency.snapshot();
    await persistMetricasLatencia({
      alertLogId: metricsAlertId,
      contractSignupId: metricsSignupId,
      tiempoSupabase: tiempoSupabaseMs,
      tiempoTwilioApi: totalMs,
      twilioCalls: calls,
      training: data.trainingMode === true
    });
  };
  try {
    const waFrom = twilioWhatsappEmergencyFrom();
    const smsFrom = twilioSmsFrom();
    const voiceFrom = twilioVoiceFrom();
    const {
      data: user,
      error: userErr
    } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select("id, nombre, telefono, subscription_status").eq("id", data.signupId).maybeSingle();
    if (userErr || !user) {
      return {
        ok: false,
        error: "user_not_found",
        results: []
      };
    }
    metricsSignupId = user.id;
    if (!data.trainingMode && !isSubscriptionServiceAllowed(user.subscription_status)) {
      return {
        ok: false,
        error: "subscription_inactive",
        message: subscriptionBlockedMessage(user.subscription_status),
        results: []
      };
    }
    const contactRows = await loadEmergencyContactRows(data.signupId);
    const recipients = contactRows.map((row) => toEmergencyRecipient(row)).filter((r) => r !== null);
    const ts = /* @__PURE__ */ new Date();
    const timestamp = ts.toLocaleString("es-CL", {
      timeZone: "America/Santiago"
    });
    const resolvedGps = resolveGpsFromInput(data);
    const topContacts = recipients.slice(0, MAX_GUARDIANS);
    const callEscalationContacts = topContacts.filter((r) => r.recibe_llamada);
    try {
      await syncDeviceStatus({
        contractSignupId: user.id,
        gps_enabled: resolvedGps != null,
        last_lat: resolvedGps?.lat ?? null,
        last_lng: resolvedGps?.lng ?? null,
        internet_connected: true
      });
    } catch (e) {
      console.error("[emergency] device_status sync failed:", e);
    }
    const mapsLink = resolvedGps ? locationShareUrl(resolvedGps.lat, resolvedGps.lng, user.nombre) : null;
    const ackToken = generateAckToken();
    const ackExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString();
    const locationBlock = mapsLink ? `📍 Ubicación en mapa Senior Safe:
${mapsLink}` : `📍 Ubicación: el usuario activó la alerta, pero el GPS del celular no se pudo sincronizar a tiempo. Por favor contáctalo de inmediato.`;
    const categoryBlock = data.emergencyCategory ? `🏷️ Tipo de emergencia:
${emergencyCategoryMessageLine(data.emergencyCategory)}` : "";
    const baseMetadata = {
      maps_link: mapsLink,
      timestamp,
      ack_token: ackToken,
      ack_expires_at: ackExpiresAt,
      emergency_category: data.emergencyCategory ?? null,
      gps_source: resolvedGps?.source ?? "unavailable",
      algorithm: ALGORITHM_ID,
      max_guardians: MAX_GUARDIANS,
      training: data.trainingMode === true,
      cascade: {
        sms_at_ms: 0,
        whatsapp_at_ms: WHATSAPP_DELAY_AFTER_SMS_MS,
        voice_at_ms: VOICE_AT_MS
      }
    };
    let logRow = null;
    let alertId = null;
    let ackUrl = buildConfirmAlertUrl(ackToken);
    let textMessage = buildEmergencyAlertMessage({
      seniorName: user.nombre,
      categoryBlock,
      locationBlock,
      timestamp,
      ackUrl
    });
    if (data.intent === "dispatch") {
      if (!data.alertId) {
        return {
          ok: false,
          error: "missing_alert_id",
          results: []
        };
      }
      const {
        data: armedRow,
        error: armedErr
      } = await supabaseAdmin.from("alert_logs").select("id, contract_signup_id, status, metadata, acknowledgement_token").eq("id", data.alertId).maybeSingle();
      if (armedErr || !armedRow || armedRow.contract_signup_id !== data.signupId) {
        return {
          ok: false,
          error: "alert_not_found",
          results: []
        };
      }
      if (await isAlertCancelled(data.alertId)) {
        return {
          ok: false,
          status: ALERT_STATUS_CANCELLED,
          results: [],
          alertId: data.alertId
        };
      }
      if (armedRow.status !== ALERT_STATUS_ARMED) {
        return {
          ok: false,
          error: "invalid_alert_state",
          results: []
        };
      }
      await supabaseAdmin.from("alert_logs").update({
        status: ALERT_STATUS_DISPATCHING
      }).eq("id", data.alertId);
      logRow = {
        id: data.alertId
      };
      alertId = data.alertId;
      metricsAlertId = data.alertId;
      const armedMeta = armedRow.metadata ?? {};
      if (typeof armedMeta.text_message === "string" && armedMeta.text_message.length > 0) {
        textMessage = armedMeta.text_message;
      }
      if (typeof armedMeta.ack_url === "string") ackUrl = armedMeta.ack_url;
      if (typeof armedMeta.ack_token === "string") ackToken = armedMeta.ack_token;
      else if (armedRow.acknowledgement_token) ackToken = armedRow.acknowledgement_token;
      if (armedMeta.training === true) {
        data.trainingMode = true;
      }
    } else {
      const logInsertBase = {
        contract_signup_id: user.id,
        event_type: "emergency_pressed",
        status: "pending",
        gps_lat: resolvedGps?.lat ?? null,
        gps_lng: resolvedGps?.lng ?? null,
        gps_accuracy: resolvedGps?.accuracy ?? null,
        recipients: recipients.map((r) => ({
          id: r.id,
          nombre: r.nombre,
          telefono: r.phone,
          parentesco: r.parentesco
        })),
        metadata: baseMetadata,
        acknowledgement_token: ackToken,
        acknowledgement_expires_at: ackExpiresAt
      };
      const {
        data: insertedLog,
        error: logErr
      } = await supabaseAdmin.from("alert_logs").insert(logInsertBase).select("id").single();
      if (logErr) {
        console.error("[emergency] alert_logs insert with ack columns failed:", logErr.message);
        const {
          data: retryLog,
          error: retryErr
        } = await supabaseAdmin.from("alert_logs").insert({
          contract_signup_id: logInsertBase.contract_signup_id,
          event_type: logInsertBase.event_type,
          status: logInsertBase.status,
          gps_lat: logInsertBase.gps_lat,
          gps_lng: logInsertBase.gps_lng,
          gps_accuracy: logInsertBase.gps_accuracy,
          recipients: logInsertBase.recipients,
          metadata: logInsertBase.metadata
        }).select("id").single();
        if (retryErr) {
          console.error("[emergency] alert_logs retry insert failed:", retryErr.message);
        } else {
          logRow = retryLog;
        }
      } else {
        logRow = insertedLog;
      }
      alertId = logRow?.id ?? null;
      metricsAlertId = alertId;
      if (alertId) {
        tiempoSupabaseMs = computeTiempoSupabaseMs(data.sosTriggeredAtMs, Date.now());
      }
      const shortAckUrl = buildConfirmAlertUrl(ackToken);
      ackUrl = shortAckUrl;
      textMessage = buildEmergencyAlertMessage({
        seniorName: user.nombre,
        categoryBlock,
        locationBlock,
        timestamp,
        ackUrl: shortAckUrl
      });
      if (alertId) {
        await supabaseAdmin.from("alert_logs").update({
          metadata: {
            ...baseMetadata,
            ack_url: shortAckUrl,
            ack_url_long: buildAckAlertUrl(alertId, ackToken),
            text_message: textMessage
          },
          acknowledgement_token: ackToken,
          acknowledgement_expires_at: ackExpiresAt
        }).eq("id", alertId);
      }
      if (data.graceBeforeSend && alertId) {
        const cancelledDuringGrace = await waitGracePeriodForCancel(alertId);
        if (cancelledDuringGrace) {
          return {
            ok: false,
            status: ALERT_STATUS_CANCELLED,
            alertId,
            recipients: recipients.length,
            results: []
          };
        }
      } else if (data.intent === "arm") {
        return {
          ok: !!alertId,
          status: alertId ? ALERT_STATUS_ARMED : "failed",
          alertId,
          graceMs: EMERGENCY_ARM_GRACE_MS,
          training: data.trainingMode === true,
          recipients: recipients.length,
          results: [],
          ...alertId ? {} : {
            error: "alert_log_insert_failed"
          }
        };
      }
    }
    const results = [];
    if (alertId && await isAlertCancelled(alertId)) {
      return {
        ok: false,
        status: ALERT_STATUS_CANCELLED,
        recipients: recipients.length,
        results,
        alertId
      };
    }
    if (data.trainingMode) {
      const baseMs = Date.now();
      const simAt = (offsetMs) => new Date(baseMs + offsetMs).toISOString();
      for (const c of topContacts) {
        if (c.recibe_sms) {
          results.push({
            channel: "sms",
            to: c.phone,
            status: "sent",
            sid: "TRAINING_SIM",
            error: null,
            event: "sms_simulated",
            at: simAt(0)
          });
        }
      }
      for (const c of topContacts) {
        if (c.recibe_whatsapp) {
          results.push({
            channel: "whatsapp",
            to: c.whatsappPhone,
            status: "sent",
            sid: "TRAINING_SIM",
            error: null,
            event: "whatsapp_simulated",
            at: simAt(WHATSAPP_DELAY_AFTER_SMS_MS)
          });
        }
      }
      for (const c of callEscalationContacts) {
        if (c.recibe_llamada) {
          results.push({
            channel: "call",
            to: c.phone,
            status: "sent",
            sid: "TRAINING_SIM",
            error: null,
            event: "call_simulated",
            at: simAt(WHATSAPP_DELAY_AFTER_SMS_MS + VOICE_DELAY_AFTER_WHATSAPP_MS)
          });
        }
      }
      if (recipients.length === 0) {
        results.push({
          channel: "whatsapp",
          to: "-",
          status: "skipped",
          error: "no_recipients",
          event: "training_no_recipients",
          at: simAt(0)
        });
      }
      const finalStatus = recipients.length === 0 ? "no_recipients" : "simulated";
      if (logRow?.id) {
        await supabaseAdmin.from("alert_logs").update({
          event_type: "training_simulation",
          status: finalStatus,
          metadata: {
            maps_link: mapsLink,
            timestamp,
            training: true,
            results,
            message: "Entrenamiento: cascada SMS (0s) → WhatsApp (15s) → llamada (60s) sin Twilio",
            algorithm: ALGORITHM_ID
          },
          error_message: null
        }).eq("id", logRow.id);
      }
      return {
        ok: true,
        status: finalStatus,
        training: true,
        recipients: recipients.length,
        results
      };
    }
    if (!isTwilioConfigured()) {
      const err = "twilio_not_configured";
      const at = (/* @__PURE__ */ new Date()).toISOString();
      results.push({
        channel: "whatsapp",
        to: "-",
        status: "failed",
        error: err,
        event: "whatsapp_failed",
        at
      });
      results.push({
        channel: "sms",
        to: "-",
        status: "failed",
        error: err,
        event: "sms_failed",
        at
      });
      results.push({
        channel: "call",
        to: "-",
        status: "failed",
        error: err,
        event: "call_failed",
        at
      });
    } else {
      const nowIso = () => (/* @__PURE__ */ new Date()).toISOString();
      const pushSkipped = (channel, to, error, event) => {
        results.push({
          channel,
          to,
          status: "skipped",
          error,
          event,
          at: nowIso()
        });
      };
      if (!alertId) {
        pushSkipped("sms", "-", "alert_log_missing", "sms_skipped");
        pushSkipped("whatsapp", "-", "alert_log_missing", "whatsapp_skipped");
        pushSkipped("call", "-", "alert_log_missing", "call_skipped");
        return {
          ok: false,
          error: "alert_log_insert_failed",
          status: "failed",
          recipients: recipients.length,
          results,
          message: "No pudimos registrar la alerta. Reintenta o llama directamente."
        };
      }
      if (alertId && await isAlertCancelled(alertId)) {
        return {
          ok: false,
          status: ALERT_STATUS_CANCELLED,
          recipients: recipients.length,
          results,
          alertId
        };
      }
      const smsTasks = [];
      for (const c of topContacts) {
        if (c.recibe_sms) {
          if (!smsFrom) {
            pushSkipped("sms", c.phone, "missing TWILIO_SMS_FROM", "sms_skipped");
          } else {
            const smsBody = {
              To: c.phone,
              From: smsFrom,
              Body: textMessage
            };
            if (alertId) {
              smsBody.StatusCallback = twilioStatusCallbackUrl(alertId, "sms");
            }
            smsTasks.push(twilioLatency.post("/Messages.json", smsBody).then((r) => ({
              channel: "sms",
              to: c.phone,
              status: r.ok ? "sent" : "failed",
              sid: twilioResourceSid(r.data),
              error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
              event: r.ok ? "sms_sent" : "sms_failed",
              at: nowIso()
            })).catch((e) => ({
              channel: "sms",
              to: c.phone,
              status: "failed",
              error: String(e?.message ?? e),
              event: "sms_failed",
              at: nowIso()
            })));
          }
        } else {
          pushSkipped("sms", c.phone, "recibe_sms_disabled", "sms_skipped");
        }
      }
      const smsSettled = await Promise.allSettled(smsTasks);
      for (const outcome of smsSettled) {
        if (outcome.status === "fulfilled") results.push(outcome.value);
      }
      if (alertId) {
        const smsSent = results.filter((r) => r.channel === "sms" && r.status === "sent");
        await supabaseAdmin.from("alert_logs").update({
          status: smsSent.length > 0 ? "partial" : "pending",
          metadata: buildCascadeMetadataPatch({
            mapsLink,
            timestamp,
            ackUrl,
            ackToken,
            ackExpiresAt,
            gpsSource: resolvedGps?.source ?? "unavailable",
            textMessage,
            emergencyCategory: data.emergencyCategory,
            topContactIds: topContacts.map((c) => c.id),
            results: [...results]
          })
        }).eq("id", alertId);
      }
      if (alertId && await isAlertCancelled(alertId)) {
        return {
          ok: false,
          status: ALERT_STATUS_CANCELLED,
          recipients: recipients.length,
          results,
          alertId
        };
      }
      await sleep(WHATSAPP_DELAY_AFTER_SMS_MS);
      const waSummary = buildEmergencyWhatsAppSummary({
        categoryBlock,
        locationBlock,
        timestamp,
        mapsLink
      });
      const waTasks = [];
      for (const c of topContacts) {
        if (c.recibe_whatsapp) {
          waTasks.push((async () => {
            const waBody = buildEmergencyWhatsAppRequestParams({
              toPhoneE164: c.whatsappPhone,
              seniorName: user.nombre,
              ackToken,
              alertSummary: waSummary,
              textMessage,
              alertId
            });
            let r = await twilioLatency.post("/Messages.json", waBody);
            if (!r.ok) {
              r = await twilioLatency.post("/Messages.json", buildEmergencyWhatsAppFallbackParams(waBody, user.nombre, waSummary));
            }
            return {
              channel: "whatsapp",
              to: c.whatsappPhone,
              status: r.ok ? "sent" : "failed",
              sid: twilioResourceSid(r.data),
              error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
              event: r.ok ? "whatsapp_sent" : "whatsapp_failed",
              at: nowIso()
            };
          })().catch((e) => ({
            channel: "whatsapp",
            to: c.whatsappPhone,
            status: "failed",
            error: String(e?.message ?? e),
            event: "whatsapp_failed",
            at: nowIso()
          })));
        } else {
          pushSkipped("whatsapp", c.whatsappPhone, "recibe_whatsapp_disabled", "whatsapp_skipped");
        }
      }
      const waSettled = await Promise.allSettled(waTasks);
      for (const outcome of waSettled) {
        if (outcome.status === "fulfilled") results.push(outcome.value);
      }
      if (alertId) {
        await supabaseAdmin.from("alert_logs").update({
          metadata: {
            maps_link: mapsLink,
            timestamp,
            ack_url: ackUrl,
            ack_token: ackToken,
            text_message: textMessage,
            gps_source: resolvedGps?.source ?? "unavailable",
            algorithm: ALGORITHM_ID,
            phase: "whatsapp_complete",
            sms_contacts: topContacts.map((c) => c.id),
            whatsapp_contacts: topContacts.map((c) => c.id),
            results: [...results]
          }
        }).eq("id", alertId);
      }
      if (alertId && await isAlertCancelled(alertId)) {
        return {
          ok: false,
          status: ALERT_STATUS_CANCELLED,
          recipients: recipients.length,
          results,
          alertId
        };
      }
      await sleep(VOICE_DELAY_AFTER_WHATSAPP_MS);
      const engagedBeforeCalls = alertId ? await isAlertEngaged(alertId) : false;
      if (engagedBeforeCalls) {
        pushSkipped("call", "-", "engaged_before_escalation", "call_escalation_skipped");
      } else if (!voiceFrom) {
        for (const c of callEscalationContacts) {
          pushSkipped("call", c.phone, "missing TWILIO_VOICE_FROM", "call_skipped");
        }
      } else if (callEscalationContacts.length === 0) {
        pushSkipped("call", "-", "no_call_recipients", "call_escalation_skipped");
      } else {
        for (const c of callEscalationContacts) {
          if (alertId && (await isAlertEngaged(alertId) || await isAlertCancelled(alertId))) {
            pushSkipped("call", c.phone, "engaged_during_escalation", "call_escalation_stopped");
            break;
          }
          try {
            if (!alertId) {
              pushSkipped("call", c.phone, "missing_alert_id", "call_skipped");
              continue;
            }
            const r = await twilioLatency.post("/Calls.json", {
              To: c.phone,
              From: voiceFrom,
              Url: emergencyOutboundCallUrl(alertId),
              Method: "GET",
              Timeout: "25"
            });
            const callSid = twilioResourceSid(r.data);
            if (alertId && r.ok && callSid) {
              await appendActiveCallSid(alertId, callSid);
            }
            results.push({
              channel: "call",
              to: c.phone,
              status: r.ok ? "sent" : "failed",
              sid: twilioResourceSid(r.data),
              error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
              event: r.ok ? "call_started" : "call_failed",
              at: nowIso()
            });
          } catch (e) {
            results.push({
              channel: "call",
              to: c.phone,
              status: "failed",
              error: String(e?.message ?? e),
              event: "call_failed",
              at: nowIso()
            });
          }
          if (alertId && await isAlertEngaged(alertId)) break;
        }
      }
      const anySent = results.some((r) => r.status === "sent");
      const finalStatus = recipients.length === 0 ? "no_recipients" : anySent ? results.some((r) => r.status === "failed") ? "partial" : "delivered" : "failed";
      if (alertId) {
        await supabaseAdmin.from("alert_logs").update({
          status: finalStatus,
          metadata: {
            maps_link: mapsLink,
            timestamp,
            ack_url: ackUrl,
            ack_token: ackToken,
            text_message: textMessage,
            gps_source: resolvedGps?.source ?? "unavailable",
            algorithm: ALGORITHM_ID,
            phase: "complete",
            sms_contacts: topContacts.map((c) => c.id),
            whatsapp_contacts: topContacts.map((c) => c.id),
            call_escalation_contacts: callEscalationContacts.map((c) => c.id),
            results,
            from: {
              waFrom,
              smsFrom,
              voiceFrom
            }
          },
          error_message: anySent ? null : results.map((r) => r.error).filter(Boolean).join(" | ").slice(0, 500) || null
        }).eq("id", alertId);
      }
      return {
        ok: anySent || recipients.length === 0,
        status: finalStatus,
        recipients: recipients.length,
        results,
        ack_url: ackUrl,
        alertId
      };
    }
  } finally {
    await flushMetricasLatencia();
  }
});
const cancelEmergencyAlert_createServerFn_handler = createServerRpc({
  id: "fb1afaddadfef2cade4defacd62c0f3ecb8f4933ef8396f125de993f4e5766ba",
  name: "cancelEmergencyAlert",
  filename: "src/lib/emergency-alert.functions.ts"
}, (opts) => cancelEmergencyAlert.__executeServer(opts));
const cancelEmergencyAlert = createServerFn({
  method: "POST"
}).inputValidator((input) => CancelSchema.parse(input)).handler(cancelEmergencyAlert_createServerFn_handler, async ({
  data
}) => {
  await assertSeniorAccess(data.signupId, data.accessToken);
  const result = await cancelEmergencyAlertForSignup(data.signupId, data.alertId);
  if (!result.ok) return {
    ok: false,
    error: result.error
  };
  return {
    ok: true,
    already: result.already,
    alertId: result.alertId
  };
});
export {
  cancelEmergencyAlert_createServerFn_handler,
  sendEmergencyAlert_createServerFn_handler
};
