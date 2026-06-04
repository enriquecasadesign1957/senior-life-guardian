
-- A: persist onboarding/whatsapp state
ALTER TABLE public.trial_signups
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_activated boolean NOT NULL DEFAULT false;

-- B: dedupe emergency_contacts then add unique constraint
DELETE FROM public.emergency_contacts a
USING public.emergency_contacts b
WHERE a.ctid < b.ctid
  AND a.trial_signup_id = b.trial_signup_id
  AND a.telefono = b.telefono;

ALTER TABLE public.emergency_contacts
  ADD CONSTRAINT emergency_contacts_signup_phone_unique
  UNIQUE (trial_signup_id, telefono);

-- C: alert_logs table
CREATE TABLE IF NOT EXISTS public.alert_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_signup_id uuid REFERENCES public.trial_signups(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  gps_lat double precision,
  gps_lng double precision,
  gps_accuracy double precision,
  recipients jsonb,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alert_logs_signup_created_idx
  ON public.alert_logs (trial_signup_id, created_at DESC);
CREATE INDEX IF NOT EXISTS alert_logs_event_type_idx
  ON public.alert_logs (event_type);

ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages alert_logs"
  ON public.alert_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- E: enable RLS on previously unprotected tables
ALTER TABLE public.trial_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages trial_signups"
  ON public.trial_signups FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages emergency_contacts"
  ON public.emergency_contacts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages user_pins"
  ON public.user_pins FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
