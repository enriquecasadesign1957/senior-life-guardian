-- Métricas de latencia del algoritmo ecosystem_v3/v4 cascade (auditoría SOS).

CREATE TABLE IF NOT EXISTS public.metricas_latencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_log_id uuid REFERENCES public.alert_logs(id) ON DELETE CASCADE,
  contract_signup_id uuid REFERENCES public.contract_signups(id) ON DELETE CASCADE,
  algorithm text,
  tiempo_supabase integer,
  tiempo_twilio_api integer NOT NULL DEFAULT 0,
  twilio_calls jsonb,
  training boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.metricas_latencia.tiempo_supabase IS
  'ms desde sosTriggeredAtMs (cliente) hasta confirmación del insert en alert_logs';
COMMENT ON COLUMN public.metricas_latencia.tiempo_twilio_api IS
  'Suma de duraciones HTTP (ms) de llamadas twilioPost en la cascada de esa alerta';

CREATE INDEX IF NOT EXISTS metricas_latencia_alert_log_idx
  ON public.metricas_latencia (alert_log_id);

CREATE INDEX IF NOT EXISTS metricas_latencia_signup_created_idx
  ON public.metricas_latencia (contract_signup_id, created_at DESC);

ALTER TABLE public.metricas_latencia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages metricas_latencia" ON public.metricas_latencia;
CREATE POLICY "service_role manages metricas_latencia"
  ON public.metricas_latencia FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

GRANT ALL ON public.metricas_latencia TO service_role;
GRANT ALL ON public.metricas_latencia TO postgres;
