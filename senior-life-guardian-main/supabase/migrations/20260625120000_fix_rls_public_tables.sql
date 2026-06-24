-- Supabase Security Advisor: rls_disabled_in_public
-- Todas las tablas expuestas vía PostgREST deben tener RLS (deny-by-default).
-- El backend usa service_role, que bypassa RLS.

ALTER TABLE public.whatsapp_inbox_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages whatsapp_inbox_messages" ON public.whatsapp_inbox_messages;
CREATE POLICY "Service role manages whatsapp_inbox_messages"
  ON public.whatsapp_inbox_messages
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

ALTER TABLE public.pin_reset_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages pin_reset_codes" ON public.pin_reset_codes;
CREATE POLICY "service_role manages pin_reset_codes"
  ON public.pin_reset_codes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
