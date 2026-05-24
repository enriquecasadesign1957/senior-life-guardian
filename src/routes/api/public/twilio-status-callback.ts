import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

/**
 * Status Callback de Twilio (delivery status para SMS/WhatsApp/Voice).
 * Configurar opcionalmente como:
 *   StatusCallback → https://alarmaseniorsafe.cl/api/public/twilio-status-callback
 *
 * Twilio envía MessageStatus / CallStatus + MessageSid / CallSid + ErrorCode.
 * Solo registramos en alert_logs para auditoría. No bloquea ningún flujo.
 */

export const Route = createFileRoute('/api/public/twilio-status-callback')({
  server: {
    handlers: {
      GET: async () =>
        new Response('Senior Safe Twilio status callback OK', { status: 200 }),

      POST: async ({ request }) => {
        let payload: Record<string, string> = {}
        try {
          const ct = request.headers.get('content-type') || ''
          if (ct.includes('application/json')) {
            payload = (await request.json()) as Record<string, string>
          } else {
            const params = new URLSearchParams(await request.text())
            params.forEach((v, k) => (payload[k] = v))
          }
        } catch {}

        const sid = payload.MessageSid || payload.CallSid || null
        const status =
          payload.MessageStatus || payload.CallStatus || payload.SmsStatus || 'unknown'
        const errorCode = payload.ErrorCode || null
        const to = payload.To || null
        const from = payload.From || null
        const kind = payload.CallSid ? 'call' : 'message'

        try {
          await supabaseAdmin.from('alert_logs').insert({
            event_type: `twilio_${kind}_status`,
            status,
            error_message: errorCode ? `Twilio ErrorCode ${errorCode}` : null,
            metadata: { sid, status, errorCode, to, from, kind, raw: payload },
          })
        } catch {}

        return new Response('ok', { status: 200 })
      },
    },
  },
})
