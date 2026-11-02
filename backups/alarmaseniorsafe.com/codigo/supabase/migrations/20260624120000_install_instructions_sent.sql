-- Marca envío de instrucciones de instalación post-pago (correo / WhatsApp / SMS).
ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS install_instructions_sent_at timestamptz;

COMMENT ON COLUMN public.contract_signups.install_instructions_sent_at IS
  'Cuándo se envió el enlace de instalación tras el primer pago exitoso.';
