-- Consentimiento explícito de cobros recurrentes (Oneclick) en checkout.

ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS recurring_billing_consented_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recurring_billing_consent_version TEXT;
