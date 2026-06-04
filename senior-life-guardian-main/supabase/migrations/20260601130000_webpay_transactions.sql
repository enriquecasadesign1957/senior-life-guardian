-- Log de transacciones Webpay Plus (requerido por initWebpayTransaction)

CREATE TABLE IF NOT EXISTS public.webpay_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_signup_id UUID REFERENCES public.contract_signups(id) ON DELETE CASCADE,
  buy_order TEXT NOT NULL,
  session_id TEXT,
  amount INTEGER NOT NULL,
  token TEXT,
  status TEXT NOT NULL DEFAULT 'INITIATED',
  response_code INTEGER,
  authorization_code TEXT,
  payment_type_code TEXT,
  card_last4 TEXT,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS webpay_tx_contract_signup_idx ON public.webpay_transactions(contract_signup_id);
CREATE INDEX IF NOT EXISTS webpay_tx_buy_order_idx ON public.webpay_transactions(buy_order);
CREATE INDEX IF NOT EXISTS webpay_tx_token_idx ON public.webpay_transactions(token);

ALTER TABLE public.webpay_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages webpay tx" ON public.webpay_transactions;
CREATE POLICY "Service role manages webpay tx"
  ON public.webpay_transactions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS webpay_transactions_updated_at ON public.webpay_transactions;
CREATE TRIGGER webpay_transactions_updated_at
  BEFORE UPDATE ON public.webpay_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
