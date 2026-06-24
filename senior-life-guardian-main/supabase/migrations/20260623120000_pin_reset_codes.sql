-- Códigos de un solo uso para recuperar PIN vía correo registrado.
CREATE TABLE IF NOT EXISTS public.pin_reset_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_signup_id uuid NOT NULL,
  email text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pin_reset_codes_signup_idx
  ON public.pin_reset_codes (contract_signup_id, created_at DESC);

ALTER TABLE public.pin_reset_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages pin_reset_codes" ON public.pin_reset_codes;
CREATE POLICY "service_role manages pin_reset_codes"
  ON public.pin_reset_codes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
