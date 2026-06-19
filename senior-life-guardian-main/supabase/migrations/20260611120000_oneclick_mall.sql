-- Oneclick Mall: inscripción de tarjeta + cobros recurrentes (validación Transbank)

ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'webpay_plus',
  ADD COLUMN IF NOT EXISTS oneclick_username TEXT,
  ADD COLUMN IF NOT EXISTS oneclick_tbk_user TEXT,
  ADD COLUMN IF NOT EXISTS oneclick_inscription_token TEXT,
  ADD COLUMN IF NOT EXISTS oneclick_inscription_status TEXT,
  ADD COLUMN IF NOT EXISTS oneclick_card_last4 TEXT,
  ADD COLUMN IF NOT EXISTS oneclick_mall_buy_order TEXT,
  ADD COLUMN IF NOT EXISTS oneclick_store_buy_order TEXT;

CREATE TABLE IF NOT EXISTS public.oneclick_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_signup_id UUID REFERENCES public.contract_signups(id) ON DELETE CASCADE,
  mall_buy_order TEXT NOT NULL,
  store_buy_order TEXT NOT NULL,
  amount INTEGER NOT NULL,
  operation TEXT NOT NULL DEFAULT 'authorize',
  status TEXT NOT NULL DEFAULT 'INITIATED',
  response_code INTEGER,
  authorization_code TEXT,
  payment_type_code TEXT,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS oneclick_tx_contract_signup_idx ON public.oneclick_transactions(contract_signup_id);
CREATE INDEX IF NOT EXISTS oneclick_tx_mall_buy_order_idx ON public.oneclick_transactions(mall_buy_order);
CREATE INDEX IF NOT EXISTS oneclick_tx_store_buy_order_idx ON public.oneclick_transactions(store_buy_order);

ALTER TABLE public.oneclick_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages oneclick tx" ON public.oneclick_transactions;
CREATE POLICY "Service role manages oneclick tx"
  ON public.oneclick_transactions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS oneclick_transactions_updated_at ON public.oneclick_transactions;
CREATE TRIGGER oneclick_transactions_updated_at
  BEFORE UPDATE ON public.oneclick_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
