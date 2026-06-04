
CREATE TABLE public.trial_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  direccion TEXT,
  plan TEXT NOT NULL DEFAULT 'premium',
  periodo TEXT NOT NULL DEFAULT 'mensual',
  trial_active BOOLEAN NOT NULL DEFAULT true,
  trial_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  payment_status TEXT NOT NULL DEFAULT 'trial',
  webpay_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX trial_signups_email_unique ON public.trial_signups (lower(email));

ALTER TABLE public.trial_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a trial signup"
ON public.trial_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trial_signups_updated_at
BEFORE UPDATE ON public.trial_signups
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
