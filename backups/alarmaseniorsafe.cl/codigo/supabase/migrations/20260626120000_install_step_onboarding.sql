-- Máquina de estados de instalación / onboarding Día 1 → ready
ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS install_step text NOT NULL DEFAULT 'pending';

ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS install_step_updated_at timestamptz;

ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS app_opened_at timestamptz;

ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS sos_primed_at timestamptz;

ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS fall_sensor_prompted_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contract_signups_install_step_check'
  ) THEN
    ALTER TABLE public.contract_signups
      ADD CONSTRAINT contract_signups_install_step_check
      CHECK (
        install_step IN (
          'pending',
          'paid',
          'install_link_sent',
          'whatsapp_linked',
          'app_opened',
          'ready'
        )
      );
  END IF;
END $$;

-- Cuentas ya pagadas: arrancar en paid o más según flags existentes
UPDATE public.contract_signups
SET install_step = CASE
  WHEN onboarding_completed = true OR sos_primed_at IS NOT NULL THEN 'ready'
  WHEN app_opened_at IS NOT NULL THEN 'app_opened'
  WHEN whatsapp_activated = true THEN 'whatsapp_linked'
  WHEN install_instructions_sent_at IS NOT NULL THEN 'install_link_sent'
  WHEN payment_status IN ('paid', 'comp') OR subscription_status IN ('active', 'comp') THEN 'paid'
  ELSE 'pending'
END,
install_step_updated_at = COALESCE(install_step_updated_at, NOW())
WHERE install_step = 'pending' OR install_step IS NULL;

UPDATE public.contract_signups
SET onboarding_completed = true
WHERE install_step = 'ready' AND onboarding_completed IS NOT TRUE;
