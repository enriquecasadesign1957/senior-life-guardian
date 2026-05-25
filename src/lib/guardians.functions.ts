import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizePhoneE164 } from "@/lib/phone-utils";

const idSchema = z.string().uuid();

const TWILIO_GATEWAY = "https://connector-gateway.lovable.dev/twilio";
const PORTAL_FAMILIA_URL = "https://alarmaseniorsafe.cl/familia";

async function twilioSend(to: string, body: string, channel: "whatsapp" | "sms"): Promise<boolean> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const twilioKey = process.env.TWILIO_API_KEY;
  if (!lovableKey || !twilioKey) return false;
  const from = channel === "whatsapp" ? "whatsapp:+14155238886" : process.env.TWILIO_SMS_FROM || "";
  if (!from) return false;
  const To = channel === "whatsapp" ? `whatsapp:${to}` : to;
  try {
    const resp = await fetch(`${TWILIO_GATEWAY}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": twilioKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To, From: from, Body: body }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function sendGuardianInvite(opts: {
  guardianTel: string;
  guardianWa: string | null;
  guardianName: string;
  seniorName: string;
  parentesco: string;
  signupId: string;
  guardianId: string;
}) {
  const body =
    `Hola ${opts.guardianName}, ${opts.seniorName} te ha designado como su guardián en Senior Safe ` +
    `(como ${opts.parentesco}). Recibirás alertas de emergencia y podrás ver su estado en el Portal Familia: ` +
    `${PORTAL_FAMILIA_URL} — Ingresa con este número de teléfono para recibir tu código de acceso.`;

  const waNumber = opts.guardianWa || opts.guardianTel;
  const okWA = await twilioSend(waNumber, body, "whatsapp");
  const okSMS = await twilioSend(opts.guardianTel, body, "sms");

  try {
    await supabaseAdmin.from("family_access_log").insert({
      family_member_id: null,
      trial_signup_id: opts.signupId,
      action: "guardian_invite_sent",
      metadata: {
        guardian_contact_id: opts.guardianId,
        telefono: opts.guardianTel,
        whatsapp_ok: okWA,
        sms_ok: okSMS,
        portal_url: PORTAL_FAMILIA_URL,
      } as never,
    });
  } catch {
    /* silencioso */
  }
}

const guardianInput = z.object({
  nombre: z.string().trim().min(1).max(160),
  telefono: z.string().trim().min(4).max(40),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  parentesco: z.string().trim().min(1).max(60),
  prioridad: z.number().int().min(1).max(10).default(1),
  activo: z.boolean().default(true),
  tipo_contacto: z.string().trim().max(40).default("familiar"),
  recibe_sms: z.boolean().default(true),
  recibe_whatsapp: z.boolean().default(true),
  recibe_llamada: z.boolean().default(true),
});

/** Lista guardianes con todos los campos extendidos. */
export const listGuardians = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ signupId: idSchema }).parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("emergency_contacts")
      .select(
        "id,nombre,telefono,whatsapp,parentesco,prioridad,activo,tipo_contacto,recibe_sms,recibe_whatsapp,recibe_llamada,created_at",
      )
      .eq("trial_signup_id", data.signupId)
      .order("prioridad", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return { guardians: rows ?? [] };
  });

export const addGuardian = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, guardian: guardianInput }).parse(input),
  )
  .handler(async ({ data }) => {
    const { count } = await supabaseAdmin
      .from("emergency_contacts")
      .select("id", { count: "exact", head: true })
      .eq("trial_signup_id", data.signupId);
    if ((count ?? 0) >= 10) throw new Error("Máximo 10 guardianes.");

    const tel = normalizePhoneE164(data.guardian.telefono);
    if (!tel) throw new Error("Teléfono inválido.");
    const wa = data.guardian.whatsapp ? normalizePhoneE164(data.guardian.whatsapp) : null;

    const { data: row, error } = await supabaseAdmin
      .from("emergency_contacts")
      .insert({
        trial_signup_id: data.signupId,
        nombre: data.guardian.nombre,
        telefono: tel,
        whatsapp: wa,
        parentesco: data.guardian.parentesco,
        prioridad: data.guardian.prioridad,
        activo: data.guardian.activo,
        tipo_contacto: data.guardian.tipo_contacto,
        recibe_sms: data.guardian.recibe_sms,
        recibe_whatsapp: data.guardian.recibe_whatsapp,
        recibe_llamada: data.guardian.recibe_llamada,
      })
      .select("id")
      .single();
    if (error) throw error;

    // Pre-registrar como family_member para que pueda hacer OTP login en el Portal Familia.
    try {
      const { data: existing } = await supabaseAdmin
        .from("family_members")
        .select("id")
        .eq("trial_signup_id", data.signupId)
        .eq("telefono", tel)
        .maybeSingle();
      if (!existing) {
        await supabaseAdmin.from("family_members").insert({
          trial_signup_id: data.signupId,
          nombre: data.guardian.nombre,
          telefono: tel,
          parentesco: data.guardian.parentesco,
        });
      }
    } catch {
      /* no bloquear si falla */
    }

    // Enviar invitación con link al Portal Familia (no bloqueante para la respuesta UI).
    try {
      const { data: senior } = await supabaseAdmin
        .from("trial_signups")
        .select("nombre")
        .eq("id", data.signupId)
        .maybeSingle();
      await sendGuardianInvite({
        guardianTel: tel,
        guardianWa: wa,
        guardianName: data.guardian.nombre,
        seniorName: senior?.nombre ?? "Tu familiar",
        parentesco: data.guardian.parentesco,
        signupId: data.signupId,
        guardianId: row.id,
      });
    } catch {
      /* la invitación es best-effort */
    }

    return { id: row.id };
  });

export const updateGuardian = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, id: idSchema, guardian: guardianInput.partial() }).parse(input),
  )
  .handler(async ({ data }) => {
    const patch: Record<string, unknown> = { ...data.guardian };
    if (typeof patch.telefono === "string") {
      const t = normalizePhoneE164(patch.telefono);
      if (!t) throw new Error("Teléfono inválido.");
      patch.telefono = t;
    }
    if (typeof patch.whatsapp === "string") {
      patch.whatsapp = normalizePhoneE164(patch.whatsapp);
    }
    const { error } = await supabaseAdmin
      .from("emergency_contacts")
      .update(patch as never)
      .eq("id", data.id)
      .eq("trial_signup_id", data.signupId);
    if (error) throw error;
    return { ok: true };
  });

export const deleteGuardian = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ signupId: idSchema, id: idSchema }).parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("emergency_contacts")
      .delete()
      .eq("id", data.id)
      .eq("trial_signup_id", data.signupId);
    if (error) throw error;
    return { ok: true };
  });

export const toggleGuardianActive = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, id: idSchema, activo: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("emergency_contacts")
      .update({ activo: data.activo })
      .eq("id", data.id)
      .eq("trial_signup_id", data.signupId);
    if (error) throw error;
    return { ok: true };
  });
