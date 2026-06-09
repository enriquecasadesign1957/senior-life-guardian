-- Bootstrap producción: emergency_contacts + columnas extendidas (idempotente)
-- Proyecto: cgcnjnhifdmornedzpid

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_signup_id uuid NOT NULL REFERENCES public.contract_signups(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  telefono text NOT NULL,
  parentesco text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_contacts
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS prioridad integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tipo_contacto text NOT NULL DEFAULT 'familiar',
  ADD COLUMN IF NOT EXISTS recibe_sms boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS recibe_whatsapp boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS recibe_llamada boolean NOT NULL DEFAULT true;

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages emergency_contacts" ON public.emergency_contacts;
CREATE POLICY "Service role manages emergency_contacts"
  ON public.emergency_contacts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE UNIQUE INDEX IF NOT EXISTS emergency_contacts_signup_phone_unique
  ON public.emergency_contacts (contract_signup_id, telefono);

-- Recargar caché de PostgREST
NOTIFY pgrst, 'reload schema';
