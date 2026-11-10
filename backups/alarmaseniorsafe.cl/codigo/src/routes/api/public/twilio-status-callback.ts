import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

/**
 * Status Callback de Twilio (delivery/read para SMS/WhatsApp/Voice).
 * Configurar como StatusCallback en cada mensaje de alerta:
 *   /api/public/twilio-status-callback?alertId={uuid}&channel=whatsapp|sms
 *
 * Si WhatsApp reporta `read`, marca la alerta como leída y cancela el escalamiento por voz.
 */

export const Route = createFileRoute('/api/public/twilio-status-callback')({
  server: {
    handlers: {
      GET: async () =>
        new Response('Senior Safe Twilio status callback OK', { status: 200 }),

      POST: async ({ request }) => {
        const url = new URL(request.url)
        const alertId = url.searchParams.get('alertId')
        const channel = url.searchParams.get('channel')

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

        if (alertId && channel === 'whatsapp' && status === 'read') {
          try {
            const { data: existing } = await supabaseAdmin
              .from('alert_logs')
              .select('metadata')
              .eq('id', alertId)
              .maybeSingle()

            const prevMeta = (existing?.metadata ?? {}) as Record<string, unknown>
            if (!prevMeta.whatsapp_read_at) {
              await supabaseAdmin
                .from('alert_logs')
                .update({
                  metadata: {
                    ...prevMeta,
                    whatsapp_read_at: new Date().toISOString(),
                    whatsapp_read_sid: sid,
                    whatsapp_read_to: to,
                  },
                } as never)
                .eq('id', alertId)
            }
          } catch {}
        }

        try {
          await supabaseAdmin.from('alert_logs').insert({
            contract_signup_id: null,
            event_type: `twilio_${kind}_status`,
            status,
            error_message: errorCode ? `Twilio ErrorCode ${errorCode}` : null,
            metadata: { sid, status, errorCode, to, from, kind, alertId, channel, raw: payload },
          })
        } catch {}

        return new Response('ok', { status: 200 })
      },
    },
  },
})
