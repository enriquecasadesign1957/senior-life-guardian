import { createFileRoute } from '@tanstack/react-router'

/** Trial deshabilitado antes del lanzamiento (evita emails/WhatsApp automáticos de prueba). */
export const Route = createFileRoute('/api/public/send-welcome-trial')({
  server: {
    handlers: {
      POST: async () =>
        Response.json(
          { error: 'trial_disabled', message: 'Prueba gratuita deshabilitada. Usa /checkout con Webpay.' },
          { status: 410 },
        ),
      GET: async () =>
        new Response('Senior Safe welcome-trial endpoint disabled', { status: 410 }),
    },
  },
})
