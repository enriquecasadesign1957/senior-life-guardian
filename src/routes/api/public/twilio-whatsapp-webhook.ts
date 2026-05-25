import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

/**
 * Webhook entrante de Twilio para WhatsApp.
 * Configurar en Twilio Sandbox / WhatsApp Business:
 *   When a message comes in →
 *   https://alarmaseniorsafe.cl/api/public/twilio-whatsapp-webhook  (POST)
 *
 * Twilio envía application/x-www-form-urlencoded con campos:
 *   From  = "whatsapp:+569XXXXXXXX"
 *   Body  = "ACTIVAR"
 *   To    = "whatsapp:+14155238886"
 *
 * Si el mensaje contiene "ACTIVAR" buscamos el usuario por teléfono
 * y marcamos whatsapp_activated=true. Respondemos TwiML con confirmación.
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

export const Route = createFileRoute('/api/public/twilio-whatsapp-webhook')({
  server: {
    handlers: {
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
            const text = await request.text()
            const params = new URLSearchParams(text)
            from = params.get('From') ?? ''
            body = params.get('Body') ?? ''
          }
        } catch {
          return twiml('No pudimos procesar tu mensaje. Intenta nuevamente.')
        }

        const phone = normalize(from)
        const text = (body || '').trim().toUpperCase()

        // Log para auditoría (best-effort)
        try {
          await supabaseAdmin.from('alert_logs').insert({
            event_type: 'whatsapp_inbound',
            status: 'received',
            metadata: { from, body, phone, text },
          })
        } catch {}

        // Aceptamos cualquiera de estas palabras como activación:
        //  - "join ask-he" (código sandbox Twilio — lo envía nuestro CTA)
        //  - "ACTIVAR" (compatibilidad con usuarios que escriben manual)
        const isActivation =
          text.includes('ACTIVAR') ||
          text.includes('JOIN ASK-HE') ||
          text.includes('ASK-HE');

        if (!isActivation) {
          return twiml(
            'Senior Safe 🛡️\n\nPara activar tus alertas por WhatsApp responde con la palabra: ACTIVAR',
          )
        }

        // Buscar usuario por teléfono. Acepta con/sin +56.
        const last9 = phone.replace(/\D/g, '').slice(-9)
        const { data: users } = await supabaseAdmin
          .from('trial_signups')
          .select('id, nombre, telefono')
          .limit(50)

        const match = (users ?? []).find((u) => {
          const t = (u.telefono || '').replace(/\D/g, '')
          return t.endsWith(last9)
        })

        if (!match) {
          return twiml(
            'Senior Safe 🛡️\n\nRecibimos tu mensaje pero no encontramos tu cuenta. Verifica que el número de WhatsApp coincida con el registrado en la app.',
          )
        }

        await supabaseAdmin
          .from('trial_signups')
          .update({ whatsapp_activated: true, telefono: phone || match.telefono })
          .eq('id', match.id)

        return twiml(
          `Senior Safe 🛡️\n\n✅ ¡Activado, ${match.nombre.split(' ')[0]}!\n\nTus alertas de emergencia ahora llegarán por WhatsApp a tus guardianes. Mantén este chat disponible.`,
        )
      },

      // Twilio a veces hace GET para validar el endpoint
      GET: async () =>
        new Response('Senior Safe WhatsApp webhook OK', { status: 200 }),
    },
  },
})
