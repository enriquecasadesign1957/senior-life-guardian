-- Renombra trial_signup_id → contract_signup_id (FK a contract_signups)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'webpay_transactions' AND column_name = 'trial_signup_id'
  ) THEN
    ALTER TABLE public.webpay_transactions RENAME COLUMN trial_signup_id TO contract_signup_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'alert_logs' AND column_name = 'trial_signup_id'
  ) THEN
    ALTER TABLE public.alert_logs RENAME COLUMN trial_signup_id TO contract_signup_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'device_status' AND column_name = 'trial_signup_id'
  ) THEN
    ALTER TABLE public.device_status RENAME COLUMN trial_signup_id TO contract_signup_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'emergency_contacts' AND column_name = 'trial_signup_id'
  ) THEN
    ALTER TABLE public.emergency_contacts RENAME COLUMN trial_signup_id TO contract_signup_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'family_access_log' AND column_name = 'trial_signup_id'
  ) THEN
    ALTER TABLE public.family_access_log RENAME COLUMN trial_signup_id TO contract_signup_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'family_members' AND column_name = 'trial_signup_id'
  ) THEN
    ALTER TABLE public.family_members RENAME COLUMN trial_signup_id TO contract_signup_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_pins' AND column_name = 'trial_signup_id'
  ) THEN
    ALTER TABLE public.user_pins RENAME COLUMN trial_signup_id TO contract_signup_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'trial_signup_id'
  ) THEN
    ALTER TABLE public.user_roles RENAME COLUMN trial_signup_id TO contract_signup_id;
  END IF;
END $$;

-- Índices / FK webpay (si existían con nombre legacy)
DROP INDEX IF EXISTS public.webpay_tx_signup_idx;
CREATE INDEX IF NOT EXISTS webpay_tx_contract_signup_idx ON public.webpay_transactions(contract_signup_id);

ALTER TABLE public.webpay_transactions
  DROP CONSTRAINT IF EXISTS webpay_transactions_trial_signup_id_fkey;

ALTER TABLE public.webpay_transactions
  DROP CONSTRAINT IF EXISTS webpay_transactions_signup_fkey;

ALTER TABLE public.webpay_transactions
  DROP CONSTRAINT IF EXISTS webpay_transactions_contract_signup_id_fkey;

ALTER TABLE public.webpay_transactions
  ADD CONSTRAINT webpay_transactions_contract_signup_id_fkey
  FOREIGN KEY (contract_signup_id) REFERENCES public.contract_signups(id) ON DELETE CASCADE;
