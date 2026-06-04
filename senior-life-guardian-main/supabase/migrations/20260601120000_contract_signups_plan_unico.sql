-- Plan Único: contratación directa (reemplazo de trial_signups eliminada)

CREATE TABLE IF NOT EXISTS public.contract_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  direccion TEXT,
  plan TEXT NOT NULL DEFAULT 'unico',
  periodo TEXT NOT NULL DEFAULT 'mensual',
  purchase_mode TEXT NOT NULL DEFAULT 'contratar',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  subscription_status TEXT NOT NULL DEFAULT 'pending_payment',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  whatsapp_activated BOOLEAN NOT NULL DEFAULT false,
  renewal_date TIMESTAMPTZ,
  last_payment_at TIMESTAMPTZ,
  webpay_buy_order TEXT,
  webpay_session_id TEXT,
  webpay_token TEXT,
  webpay_authorization_code TEXT,
  webpay_amount INTEGER,
  webpay_response_code INTEGER,
  webpay_environment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS contract_signups_email_unique
  ON public.contract_signups (lower(email));

ALTER TABLE public.contract_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages contract_signups" ON public.contract_signups;
CREATE POLICY "Service role manages contract_signups"
  ON public.contract_signups
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS contract_signups_updated_at ON public.contract_signups;
CREATE TRIGGER contract_signups_updated_at
  BEFORE UPDATE ON public.contract_signups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Alinear FK de webpay_transactions si la tabla ya existía con nombre legacy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'webpay_transactions' AND column_name = 'trial_signup_id'
  ) THEN
    ALTER TABLE public.webpay_transactions RENAME COLUMN trial_signup_id TO contract_signup_id;
  END IF;
END $$;

ALTER TABLE public.webpay_transactions
  DROP CONSTRAINT IF EXISTS webpay_transactions_trial_signup_id_fkey;

ALTER TABLE public.webpay_transactions
  DROP CONSTRAINT IF EXISTS webpay_transactions_signup_fkey;

ALTER TABLE public.webpay_transactions
  DROP CONSTRAINT IF EXISTS webpay_transactions_contract_signup_id_fkey;

ALTER TABLE public.webpay_transactions
  ADD CONSTRAINT webpay_transactions_contract_signup_id_fkey
  FOREIGN KEY (contract_signup_id) REFERENCES public.contract_signups(id) ON DELETE CASCADE;
