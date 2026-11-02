-- alert_logs para SOS (contract_signups; sin trial_signups legacy)

CREATE TABLE IF NOT EXISTS public.alert_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_signup_id uuid REFERENCES public.contract_signups(id) ON DELETE CASCADE,
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

ALTER TABLE public.alert_logs
  ADD COLUMN IF NOT EXISTS acknowledged_by uuid,
  ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS acknowledgement_token text,
  ADD COLUMN IF NOT EXISTS acknowledgement_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS acknowledgement_by_name text;

CREATE INDEX IF NOT EXISTS alert_logs_signup_created_idx
  ON public.alert_logs (contract_signup_id, created_at DESC);
CREATE INDEX IF NOT EXISTS alert_logs_event_type_idx
  ON public.alert_logs (event_type);

CREATE UNIQUE INDEX IF NOT EXISTS alert_logs_ack_token_idx
  ON public.alert_logs (acknowledgement_token)
  WHERE acknowledgement_token IS NOT NULL;

ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages alert_logs" ON public.alert_logs;
DROP POLICY IF EXISTS "service_role manages alert_logs" ON public.alert_logs;
CREATE POLICY "service_role manages alert_logs"
  ON public.alert_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

GRANT ALL ON public.alert_logs TO service_role;
GRANT ALL ON public.alert_logs TO postgres;
