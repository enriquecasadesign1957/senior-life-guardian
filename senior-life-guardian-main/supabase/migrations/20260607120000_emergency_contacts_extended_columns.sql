-- Asegura columnas extendidas en emergency_contacts (idempotente para producción)

ALTER TABLE public.emergency_contacts
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS prioridad integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tipo_contacto text NOT NULL DEFAULT 'familiar',
  ADD COLUMN IF NOT EXISTS recibe_sms boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS recibe_whatsapp boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS recibe_llamada boolean NOT NULL DEFAULT true;
