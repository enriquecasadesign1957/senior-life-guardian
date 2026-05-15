import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'Senior Safe'
const SENDER_DOMAIN = 'notify.alarmaseniorsafe.cl'
const FROM_DOMAIN = 'alarmaseniorsafe.cl'

const Schema = z.object({
  signupId: z.string().uuid(),
})

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function redactEmail(email: string): string {
  const [l, d] = email.split('@')
  return l && d ? `${l[0]}***@${d}` : '***'
}

export const Route = createFileRoute('/api/public/send-welcome-trial')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }

        let parsed: z.infer<typeof Schema>
        try {
          parsed = Schema.parse(await request.json())
        } catch {
          return Response.json({ error: 'Invalid request body' }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Look up the trial signup
        const { data: signup, error: signupErr } = await supabase
          .from('trial_signups')
          .select('id, nombre, email, plan, trial_end, created_at')
          .eq('id', parsed.signupId)
          .maybeSingle()

        if (signupErr || !signup) {
          return Response.json({ error: 'Signup not found' }, { status: 404 })
        }

        // Idempotency: only send within first 5 min after creation
        const createdMs = new Date(signup.created_at).getTime()
        if (Date.now() - createdMs > 5 * 60 * 1000) {
          return Response.json({ success: false, reason: 'expired_window' })
        }

        const normalizedEmail = signup.email.toLowerCase()
        const messageId = crypto.randomUUID()
        const idempotencyKey = `welcome-trial-${signup.id}`
        const templateName = 'welcome-trial'

        // 2. Skip if already sent (idempotency)
        const { data: alreadySent } = await supabase
          .from('email_send_log')
          .select('id')
          .eq('template_name', templateName)
          .eq('recipient_email', normalizedEmail)
          .in('status', ['sent', 'pending'])
          .maybeSingle()

        if (alreadySent) {
          return Response.json({ success: true, reason: 'already_sent' })
        }

        // 3. Suppression check
        const { data: suppressed } = await supabase
          .from('suppressed_emails')
          .select('email')
          .eq('email', normalizedEmail)
          .maybeSingle()

        if (suppressed) {
          await supabase.from('email_send_log').insert({
            message_id: messageId, template_name: templateName,
            recipient_email: normalizedEmail, status: 'suppressed',
            error_message: 'Email is suppressed',
          })
          return Response.json({ success: false, reason: 'email_suppressed' })
        }

        // 4. Get or create unsubscribe token
        let unsubscribeToken: string
        const { data: existing } = await supabase
          .from('email_unsubscribe_tokens')
          .select('token, used_at')
          .eq('email', normalizedEmail)
          .maybeSingle()

        if (existing && !existing.used_at) {
          unsubscribeToken = existing.token
        } else if (!existing) {
          const newToken = generateToken()
          await supabase.from('email_unsubscribe_tokens').upsert(
            { email: normalizedEmail, token: newToken },
            { onConflict: 'email' }
          )
          const { data: stored } = await supabase
            .from('email_unsubscribe_tokens').select('token').eq('email', normalizedEmail).maybeSingle()
          unsubscribeToken = stored?.token ?? newToken
        } else {
          return Response.json({ success: false, reason: 'token_used' })
        }

        // 5. Render template
        const template = TEMPLATES[templateName]
        if (!template) {
          return Response.json({ error: 'Template not found' }, { status: 500 })
        }

        const trialDays = Math.max(
          1,
          Math.ceil((new Date(signup.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        )
        const data = { nombre: signup.nombre, plan: signup.plan, trialDays }
        const element = React.createElement(template.component, data)
        const html = await render(element)
        const text = await render(element, { plainText: true })
        const subject = typeof template.subject === 'function' ? template.subject(data) : template.subject

        // 6. Log pending + enqueue
        await supabase.from('email_send_log').insert({
          message_id: messageId, template_name: templateName,
          recipient_email: normalizedEmail, status: 'pending',
        })

        const { error: enqErr } = await supabase.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            message_id: messageId,
            to: normalizedEmail,
            from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject, html, text,
            purpose: 'transactional',
            label: templateName,
            idempotency_key: idempotencyKey,
            unsubscribe_token: unsubscribeToken,
            queued_at: new Date().toISOString(),
          },
        })

        if (enqErr) {
          await supabase.from('email_send_log').insert({
            message_id: messageId, template_name: templateName,
            recipient_email: normalizedEmail, status: 'failed',
            error_message: 'Failed to enqueue email',
          })
          return Response.json({ error: 'Failed to enqueue email' }, { status: 500 })
        }

        console.log('Welcome trial email enqueued', {
          recipient_redacted: redactEmail(normalizedEmail),
        })

        return Response.json({ success: true, queued: true })
      },
    },
  },
})
