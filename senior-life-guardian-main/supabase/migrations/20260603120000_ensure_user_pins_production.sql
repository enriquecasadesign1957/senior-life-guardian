-- Producción: tablas mínimas para PIN y familiares (idempotente)

CREATE TABLE IF NOT EXISTS public.user_pins (
  contract_signup_id uuid PRIMARY KEY REFERENCES public.contract_signups(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages user_pins" ON public.user_pins;
CREATE POLICY "Service role manages user_pins"
  ON public.user_pins FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS pin_hash text;

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_signup_id uuid NOT NULL REFERENCES public.contract_signups(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  telefono text NOT NULL,
  parentesco text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages emergency_contacts" ON public.emergency_contacts;
CREATE POLICY "Service role manages emergency_contacts"
  ON public.emergency_contacts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE UNIQUE INDEX IF NOT EXISTS emergency_contacts_signup_phone_unique
  ON public.emergency_contacts (contract_signup_id, telefono);
