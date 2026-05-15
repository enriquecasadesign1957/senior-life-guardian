import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'Senior Safe'
const SUPPORT_PHONE = '+56 9 7140 4580'
const ACTIVACION_URL = 'https://alarmaseniorsafe.cl/activacion'
const TUTORIAL_URL = 'https://alarmaseniorsafe.cl/tutorial'

interface WelcomeTrialProps {
  nombre?: string
  plan?: string
  trialDays?: number
}

const WelcomeTrialEmail = ({ nombre, plan, trialDays = 7 }: WelcomeTrialProps) => {
  const firstName = nombre?.split(' ')[0] || ''
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Premium'

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{`Tu prueba gratuita de ${trialDays} días ya está activa`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brand}>Senior Safe</Heading>
            <Text style={tagline}>Cuidamos a quien más quieres</Text>
          </Section>

          <Section style={card}>
            <Heading style={h1}>
              {firstName ? `¡Bienvenido(a), ${firstName}!` : '¡Bienvenido(a) a Senior Safe!'}
            </Heading>

            <Text style={text}>
              Tu prueba gratuita del <strong>plan {planLabel}</strong> ya está activa.
              Tienes <strong>{trialDays} días</strong> para configurar tu red de cuidado
              y proteger a tu ser querido sin ningún cobro.
            </Text>

            <Section style={badge}>
              <Text style={badgeText}>✅ Trial activo · {trialDays} días gratis</Text>
            </Section>

            <Heading style={h2}>Próximos pasos</Heading>
            <Text style={text}>
              <strong>1.</strong> Activa tu cuenta y conecta a tus familiares.<br />
              <strong>2.</strong> Configura el botón de emergencia.<br />
              <strong>3.</strong> Realiza una prueba de alerta.
            </Text>

            <Section style={ctaWrap}>
              <Button href={ACTIVACION_URL} style={cta}>
                Activar mi cuenta
              </Button>
            </Section>

            <Text style={small}>
              ¿Necesitas ayuda? Mira el{' '}
              <Link href={TUTORIAL_URL} style={link}>tutorial paso a paso</Link>{' '}
              o escríbenos por WhatsApp al{' '}
              <Link href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, '')}`} style={link}>
                {SUPPORT_PHONE}
              </Link>.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              Gracias por confiar en {SITE_NAME}. Estamos aquí para protegerte 24/7.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WelcomeTrialEmail,
  subject: (data: Record<string, any>) =>
    data.nombre
      ? `¡Bienvenido(a) ${String(data.nombre).split(' ')[0]} a Senior Safe! Tu prueba gratuita está activa`
      : '¡Bienvenido(a) a Senior Safe! Tu prueba gratuita está activa',
  displayName: 'Bienvenida prueba gratuita',
  previewData: { nombre: 'María González', plan: 'premium', trialDays: 7 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 20px' }
const header = { textAlign: 'center' as const, paddingBottom: '24px' }
const brand = { fontSize: '24px', fontWeight: 700, color: '#0f4c5c', margin: 0, letterSpacing: '-0.02em' }
const tagline = { fontSize: '13px', color: '#6b7280', margin: '4px 0 0', letterSpacing: '0.04em' }
const card = { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '32px 28px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px', lineHeight: '1.2' }
const h2 = { fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '24px 0 8px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px' }
const badge = { backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '999px', padding: '10px 16px', textAlign: 'center' as const, margin: '20px 0' }
const badgeText = { fontSize: '14px', fontWeight: 600, color: '#047857', margin: 0 }
const ctaWrap = { textAlign: 'center' as const, margin: '24px 0 16px' }
const cta = { backgroundColor: '#0f4c5c', color: '#ffffff', fontSize: '15px', fontWeight: 700, padding: '14px 28px', borderRadius: '999px', textDecoration: 'none', display: 'inline-block' }
const link = { color: '#0f4c5c', textDecoration: 'underline' }
const small = { fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: '12px 0 0', textAlign: 'center' as const }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, margin: 0 }
