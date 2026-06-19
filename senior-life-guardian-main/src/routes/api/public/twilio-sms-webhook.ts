import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { processWhatsAppActivation } from '@/lib/whatsapp-commercial-activation'

/**
 * Webhook entrante de Twilio para SMS (número chileno +56 2 2914 7733).
 * Configurar en Twilio Console → Phone Numbers → +56229147733 → Messaging:
 *   A MESSAGE COMES IN → Webhook (POST):
 *   https://alarmaseniorsafe.cl/api/public/twilio-sms-webhook
 *
 * Soporta keywords: ACTIVAR (activa WhatsApp/SMS), SOS (dispara alerta),
 * STOP/BAJA (opt-out), cualquier otro texto → ayuda.
 *
 * NO toca lógica de Twilio outbound, ni Supabase schema, ni guardianes.
 */

function normalize(phone: string): string {
  return (phone || '').replace(/^whatsapp:/i, '').replace(/[^\d+]/g, '')
}

function twiml(message: string) {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<Response><Message>${message.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Message></Response>`
  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

async function findUserByPhone(phone: string) {
  const last9 = phone.replace(/\D/g, '').slice(-9)
  if (!last9) return null
  const { data: users } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select('id, nombre, telefono')
    .limit(200)
  return (users ?? []).find((u) => {
    const t = (u.telefono || '').replace(/\D/g, '')
    return t.endsWith(last9)
  }) ?? null
}

export const Route = createFileRoute('/api/public/twilio-sms-webhook')({
  server: {
    handlers: {
      GET: async () =>
        new Response('Senior Safe SMS webhook OK', { status: 200 }),

      POST: async ({ request }) => {
        let from = ''
        let body = ''
        try {
          const ct = request.headers.get('content-type') || ''
          if (ct.includes('application/json')) {
            const j: any = await request.json()
            from = String(j.From ?? '')
            body = String(j.Body ?? '')
          } else {
            const params = new URLSearchParams(await request.text())
            from = params.get('From') ?? ''
            body = params.get('Body') ?? ''
          }
        } catch {
          return twiml('No pudimos procesar tu mensaje. Intenta nuevamente.')
        }

        const phone = normalize(from)
        const text = (body || '').trim().toUpperCase()

        try {
          await supabaseAdmin.from('alert_logs').insert({
            event_type: 'sms_inbound',
            status: 'received',
            metadata: { from, body, phone, text },
          })
        } catch {}

        // STOP / opt-out
        if (/^(STOP|BAJA|CANCELAR|SALIR)$/.test(text)) {
          return twiml('Recibido. No te enviaremos más mensajes. Para reactivar, responde ACTIVAR.')
        }

        const user = await findUserByPhone(phone)

        // SOS por SMS
        if (/\bSOS\b|EMERGENCIA|AYUDA/.test(text)) {
          if (!user) {
            return twiml('Senior Safe 🛡️\nRecibimos tu SOS pero no encontramos tu cuenta. Verifica el número registrado en la app.')
          }
          try {
            const { sendEmergencyAlert } = await import('@/lib/emergency-alert.functions')
            await sendEmergencyAlert({ data: { signupId: user.id, gps: null } })
          } catch (e) {
            try {
              await supabaseAdmin.from('alert_logs').insert({
                contract_signup_id: user.id,
                event_type: 'sms_sos_failed',
                status: 'failed',
                error_message: String((e as any)?.message ?? e).slice(0, 500),
              })
            } catch {}
          }
          return twiml(`Senior Safe 🛡️\n✅ Alerta enviada, ${user.nombre.split(' ')[0]}. Tus guardianes ya fueron notificados.`)
        }

        // ACTIVAR (requiere pago confirmado)
        if (text.includes('ACTIVAR')) {
          const activationReply = await processWhatsAppActivation(phone, body)
          if (activationReply) return twiml(activationReply)
        }

        return twiml(
          'Senior Safe 🛡️\nResponde:\n• ACTIVAR — para activar alertas\n• SOS — para enviar emergencia\n• BAJA — para detener mensajes',
        )
      },
    },
  },
})
