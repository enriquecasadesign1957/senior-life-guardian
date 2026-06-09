-- Avisos de renovación (7d / 1d) y suspensión tras 3 días sin pago

ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS renewal_reminder_7d_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS renewal_reminder_1d_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspension_email_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.contract_signups.renewal_reminder_7d_for IS
  'renewal_date del ciclo para el que ya se envió aviso 7 días antes';
COMMENT ON COLUMN public.contract_signups.renewal_reminder_1d_for IS
  'renewal_date del ciclo para el que ya se envió aviso 1 día antes';
