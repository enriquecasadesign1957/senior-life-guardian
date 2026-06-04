import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { isTwilioConfigured, sendTwilioMessage, twilioWhatsappFrom } from '@/lib/twilio'

const Schema = z.object({
  signupId: z.string().uuid(),
})

function normalizePhone(raw: string): string | null {
  const trimmed = raw.replace(/[^\d+]/g, '')
  if (!trimmed) return null
  if (trimmed.startsWith('+')) return trimmed
  // Asume Chile si vienen 8-9 dígitos sin código país
  if (/^\d{8,9}$/.test(trimmed)) return `+56${trimmed}`
  return `+${trimmed}`
}

export const Route = createFileRoute('/api/public/send-welcome-whatsapp')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ error: 'Server config error' }, { status: 500 })
        }
        if (!isTwilioConfigured()) {
          return Response.json({ error: 'Twilio not configured' }, { status: 500 })
        }

        const fromNumber = twilioWhatsappFrom()

        let parsed: z.infer<typeof Schema>
        try {
          parsed = Schema.parse(await request.json())
        } catch {
          return Response.json({ error: 'Invalid request body' }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { data: signup, error: signupErr } = await supabase
          .from('contract_signups')
          .select('id, nombre, telefono, plan, created_at, purchase_mode, payment_status, subscription_status')
          .eq('id', parsed.signupId)
          .maybeSingle()

        if (signupErr || !signup) {
          return Response.json({ error: 'Signup not found' }, { status: 404 })
        }

        if (
          signup.purchase_mode === 'trial' ||
          signup.payment_status !== 'paid' ||
          signup.subscription_status !== 'active'
        ) {
          return Response.json(
            { error: 'payment_required', message: 'WhatsApp de bienvenida solo tras pago activo (Plan Único).' },
            { status: 410 },
          )
        }

        // Ventana de idempotencia: solo enviar en los primeros 5 min
        const createdMs = new Date(signup.created_at).getTime()
        if (Date.now() - createdMs > 5 * 60 * 1000) {
          return Response.json({ success: false, reason: 'expired_window' })
        }

        const phone = normalizePhone(signup.telefono)
        if (!phone) {
          return Response.json({ error: 'Invalid phone' }, { status: 400 })
        }

        // Content Template SID aprobado (Twilio)
        // Variables: {{1}} = nombre, {{2}} = link activación
        const contentSid = process.env.TWILIO_WHATSAPP_CONTENT_SID || 'HXb5b62575e6e4ff6129ad7c8efe1f983e'
        const activationLink = 'https://alarmaseniorsafe.cl/instalar-app?entrenamiento=1'
        const contentVariables = JSON.stringify({
          '1': signup.nombre,
          '2': activationLink,
        })

        try {
          const result = await sendTwilioMessage({
            to: `whatsapp:${phone}`,
            from: fromNumber,
            contentSid,
            contentVariables,
          })

          await supabase.from('email_send_log').insert({
            template_name: 'whatsapp-welcome-trial',
            recipient_email: phone,
            status: result.ok ? 'sent' : 'failed',
            message_id: result.sid ?? null,
            error_message: result.error,
            metadata: {
              signup_id: signup.id,
              channel: 'whatsapp',
              event: result.ok ? 'whatsapp_sent' : 'whatsapp_failed',
              content_sid: contentSid,
              content_variables: { '1': signup.nombre, '2': activationLink },
              from: fromNumber,
            },
          })

          if (!result.ok) {
            return Response.json({ success: false, error: result.error }, { status: 502 })
          }
          return Response.json({ success: true, sid: result.sid })
        } catch (err: any) {
          await supabase.from('email_send_log').insert({
            template_name: 'whatsapp-welcome-trial',
            recipient_email: phone,
            status: 'failed',
            error_message: String(err?.message ?? err),
            metadata: { signup_id: signup.id, channel: 'whatsapp', event: 'whatsapp_failed' },
          })
          return Response.json({ success: false, error: 'send_failed' }, { status: 500 })
        }
      },
    },
  },
})
