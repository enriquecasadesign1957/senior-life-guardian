
-- Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('senior','family_member','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_signup_id uuid NOT NULL,
  family_member_id uuid,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_unique_idx
  ON public.user_roles (COALESCE(trial_signup_id::text,''), COALESCE(family_member_id::text,''), role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role manages user_roles" ON public.user_roles;
CREATE POLICY "service_role manages user_roles" ON public.user_roles
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Extend emergency_contacts (aditivo)
ALTER TABLE public.emergency_contacts
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS prioridad integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tipo_contacto text NOT NULL DEFAULT 'familiar',
  ADD COLUMN IF NOT EXISTS recibe_sms boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS recibe_whatsapp boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS recibe_llamada boolean NOT NULL DEFAULT true;

-- Device status
CREATE TABLE IF NOT EXISTS public.device_status (
  trial_signup_id uuid PRIMARY KEY,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  battery_level integer,
  gps_enabled boolean,
  internet_connected boolean,
  app_version text,
  last_lat double precision,
  last_lng double precision,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.device_status ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role manages device_status" ON public.device_status;
CREATE POLICY "service_role manages device_status" ON public.device_status
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Extend alert_logs for acknowledgements
ALTER TABLE public.alert_logs
  ADD COLUMN IF NOT EXISTS acknowledged_by uuid,
  ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS acknowledgement_token text,
  ADD COLUMN IF NOT EXISTS acknowledgement_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS acknowledgement_by_name text;

CREATE UNIQUE INDEX IF NOT EXISTS alert_logs_ack_token_idx
  ON public.alert_logs (acknowledgement_token) WHERE acknowledgement_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS alert_logs_signup_created_idx
  ON public.alert_logs (trial_signup_id, created_at DESC);

-- Family members (sin auth.users)
CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_signup_id uuid NOT NULL,
  nombre text NOT NULL,
  email text,
  telefono text NOT NULL,
  parentesco text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS family_members_signup_phone_idx
  ON public.family_members (trial_signup_id, telefono);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role manages family_members" ON public.family_members;
CREATE POLICY "service_role manages family_members" ON public.family_members
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Login codes (OTP)
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
CREATE POLICY "service_role manages family_login_codes" ON public.family_login_codes
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Access log
CREATE TABLE IF NOT EXISTS public.family_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id uuid,
  trial_signup_id uuid,
  action text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS family_access_log_member_idx
  ON public.family_access_log (family_member_id, created_at DESC);
ALTER TABLE public.family_access_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role manages family_access_log" ON public.family_access_log;
CREATE POLICY "service_role manages family_access_log" ON public.family_access_log
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
