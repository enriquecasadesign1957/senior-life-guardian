-- Columnas de confirmación de alerta (SMS link). Idempotente para producción.
ALTER TABLE public.alert_logs
  ADD COLUMN IF NOT EXISTS acknowledged_by uuid,
  ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS acknowledgement_token text,
  ADD COLUMN IF NOT EXISTS acknowledgement_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS acknowledgement_by_name text;

CREATE UNIQUE INDEX IF NOT EXISTS alert_logs_ack_token_idx
  ON public.alert_logs (acknowledgement_token)
  WHERE acknowledgement_token IS NOT NULL;
