ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS recurring_billing_charge_for TIMESTAMPTZ;

COMMENT ON COLUMN public.contract_signups.recurring_billing_charge_for IS
  'renewal_date del ciclo en que se intentó el cobro Oneclick automático (evita reintentos diarios).';
