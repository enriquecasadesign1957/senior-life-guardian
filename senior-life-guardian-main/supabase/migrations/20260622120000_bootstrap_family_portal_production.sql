-- Bootstrap producción: Portal Familia (family_members, OTP, access log)
-- Idempotente para cgcnjnhifdmornedzpid y entornos nuevos.

CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_signup_id uuid NOT NULL,
  nombre text NOT NULL,
  email text,
  telefono text NOT NULL,
  parentesco text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS family_members_signup_phone_idx
  ON public.family_members (contract_signup_id, telefono);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages family_members" ON public.family_members;
CREATE POLICY "service_role manages family_members"
  ON public.family_members FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.family_login_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telefono text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS family_login_codes_phone_idx
  ON public.family_login_codes (telefono, created_at DESC);

ALTER TABLE public.family_login_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages family_login_codes" ON public.family_login_codes;
CREATE POLICY "service_role manages family_login_codes"
  ON public.family_login_codes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.family_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id uuid,
  contract_signup_id uuid,
  action text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS family_access_log_member_idx
  ON public.family_access_log (family_member_id, created_at DESC);

ALTER TABLE public.family_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages family_access_log" ON public.family_access_log;
CREATE POLICY "service_role manages family_access_log"
  ON public.family_access_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
