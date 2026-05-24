import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

/**
 * Webhook entrante de Twilio para llamadas de voz (+56 2 2914 7733).
 * Configurar en Twilio Console → Phone Numbers → +56229147733 → Voice:
 *   A CALL COMES IN → Webhook (POST):
 *   https://alarmaseniorsafe.cl/api/public/twilio-voice-webhook
 *
 * Comportamiento:
 *   - Si el llamante coincide con un usuario registrado → dispara
 *     sendEmergencyAlert (sin GPS) y reproduce confirmación por voz.
 *   - Si no coincide → mensaje genérico Senior Safe.
 *
 * No bloquea ningún flujo existente. Solo agrega entrada por llamada.
 */

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function voiceTwiml(text: string) {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<Response>` +
    `<Say language="es-MX" voice="Polly.Mia">${escapeXml(text)}</Say>` +
    `<Pause length="1"/>` +
    `<Say language="es-MX" voice="Polly.Mia">${escapeXml(text)}</Say>` +
    `</Response>`
  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

function normalize(phone: string): string {
  return (phone || '').replace(/[^\d+]/g, '')
}

async function findUserByPhone(phone: string) {
  const last9 = phone.replace(/\D/g, '').slice(-9)
  if (!last9) return null
  const { data: users } = await supabaseAdmin
    .from('trial_signups')
    .select('id, nombre, telefono')
    .limit(200)
  return (users ?? []).find((u) => {
    const t = (u.telefono || '').replace(/\D/g, '')
    return t.endsWith(last9)
  }) ?? null
}

export const Route = createFileRoute('/api/public/twilio-voice-webhook')({
  server: {
    handlers: {
      GET: async () =>
        new Response('Senior Safe Voice webhook OK', { status: 200 }),

      POST: async ({ request }) => {
        let from = ''
        let callSid = ''
        try {
          const ct = request.headers.get('content-type') || ''
          if (ct.includes('application/json')) {
            const j: any = await request.json()
            from = String(j.From ?? '')
            callSid = String(j.CallSid ?? '')
          } else {
            const params = new URLSearchParams(await request.text())
            from = params.get('From') ?? ''
            callSid = params.get('CallSid') ?? ''
          }
        } catch {}

        const phone = normalize(from)
        const user = await findUserByPhone(phone)

        try {
          await supabaseAdmin.from('alert_logs').insert({
            trial_signup_id: user?.id ?? null,
            event_type: 'voice_inbound',
            status: 'received',
            metadata: { from, phone, callSid, matched: !!user },
          })
        } catch {}

        if (!user) {
          return voiceTwiml(
            'Senior Safe. Este número solo recibe llamadas de usuarios registrados. Si necesita ayuda, llame al uno cuatro nueve.',
          )
        }

        // Disparar alerta SOS por voz (sin GPS — viene de llamada telefónica)
        try {
          const { sendEmergencyAlert } = await import('@/lib/emergency-alert.functions')
          await sendEmergencyAlert({ data: { signupId: user.id, gps: null } })
        } catch (e) {
          try {
            await supabaseAdmin.from('alert_logs').insert({
              trial_signup_id: user.id,
              event_type: 'voice_sos_failed',
              status: 'failed',
              error_message: String((e as any)?.message ?? e).slice(0, 500),
            })
          } catch {}
        }

        const nombre = (user.nombre || '').split(' ')[0] || ''
        return voiceTwiml(
          `Senior Safe. Hola ${nombre}. Alerta de emergencia recibida. Sus guardianes están siendo notificados ahora. Mantenga la calma. Repito: sus guardianes están siendo notificados.`,
        )
      },
    },
  },
})
