
-- Add subscription + Webpay structure to trial_signups
ALTER TABLE public.trial_signups
  ADD COLUMN IF NOT EXISTS purchase_mode TEXT NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trialing',
  ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS webpay_buy_order TEXT,
  ADD COLUMN IF NOT EXISTS webpay_session_id TEXT,
  ADD COLUMN IF NOT EXISTS webpay_authorization_code TEXT,
  ADD COLUMN IF NOT EXISTS webpay_amount INTEGER,
  ADD COLUMN IF NOT EXISTS webpay_response_code INTEGER,
  ADD COLUMN IF NOT EXISTS webpay_environment TEXT,
  ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMPTZ;

-- Webpay transactions log (for audit + future reconciliation)
CREATE TABLE IF NOT EXISTS public.webpay_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_signup_id UUID REFERENCES public.trial_signups(id) ON DELETE CASCADE,
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

ALTER TABLE public.webpay_transactions ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write — no direct client access
CREATE POLICY "Service role manages webpay tx"
  ON public.webpay_transactions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS webpay_tx_signup_idx ON public.webpay_transactions(trial_signup_id);
CREATE INDEX IF NOT EXISTS webpay_tx_buy_order_idx ON public.webpay_transactions(buy_order);
