import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/site-layout'

export const Route = createFileRoute('/unsubscribe')({
  validateSearch: (s: Record<string, unknown>) => ({ token: typeof s.token === 'string' ? s.token : '' }),
  head: () => ({ meta: [{ title: 'Cancelar suscripción — Senior Safe' }] }),
  component: UnsubscribePage,
})

const DEEP = 'var(--brand-petrol-deep)'

function UnsubscribePage() {
  const { token } = Route.useSearch()
  const [state, setState] = useState<'loading' | 'valid' | 'already' | 'invalid' | 'submitting' | 'done' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setState('invalid'); return }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.valid) setState('valid')
        else if (j.reason === 'already_unsubscribed') setState('already')
        else setState('invalid')
      })
      .catch(() => setState('error'))
  }, [token])

  const confirm = async () => {
    setState('submitting')
    try {
      const r = await fetch('/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const j = await r.json()
      if (j.success || j.reason === 'already_unsubscribed') setState('done')
      else setState('error')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-sm text-center">
          {state === 'loading' && (
            <>
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Validando enlace…</p>
            </>
          )}

          {state === 'valid' && (
            <>
              <h1 className="text-2xl font-bold text-foreground">¿Cancelar suscripción?</h1>
              <p className="mt-3 text-muted-foreground text-sm">
                Dejarás de recibir correos de Senior Safe en esta dirección.
              </p>
              <button
                onClick={confirm}
                className="mt-6 w-full px-6 py-3 rounded-full text-white font-bold"
                style={{ background: DEEP }}
              >
                Confirmar cancelación
              </button>
            </>
          )}

          {state === 'submitting' && (
            <>
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Procesando…</p>
            </>
          )}

          {(state === 'done' || state === 'already') && (
            <>
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
              <h1 className="mt-4 text-2xl font-bold text-foreground">
                {state === 'already' ? 'Ya estabas dado de baja' : 'Suscripción cancelada'}
              </h1>
              <p className="mt-3 text-muted-foreground text-sm">
                No recibirás más correos en esta dirección.
              </p>
            </>
          )}

          {(state === 'invalid' || state === 'error') && (
            <>
              <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
              <h1 className="mt-4 text-2xl font-bold text-foreground">Enlace inválido</h1>
              <p className="mt-3 text-muted-foreground text-sm">
                El enlace de cancelación no es válido o ha expirado.
              </p>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
