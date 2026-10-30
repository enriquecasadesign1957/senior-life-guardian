-- Evidencia de la consulta a Tarjeta Vecino al contratar con convenio Las Condes.
-- Si estas columnas aún no existen en producción, el checkout reintenta el alta sin ellas.

ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS tarjeta_vecino_rut text,
  ADD COLUMN IF NOT EXISTS tarjeta_vecino_estado text,
  ADD COLUMN IF NOT EXISTS tarjeta_vecino_tipo text,
  ADD COLUMN IF NOT EXISTS tarjeta_vecino_checked_at timestamptz;

COMMENT ON COLUMN public.contract_signups.tarjeta_vecino_rut IS
  'RUT consultado en el portal de comercio de Tarjeta Vecino Las Condes.';
COMMENT ON COLUMN public.contract_signups.tarjeta_vecino_estado IS
  'Estado devuelto por el portal (por ejemplo vigente o renovación).';
COMMENT ON COLUMN public.contract_signups.tarjeta_vecino_tipo IS
  'tipo_vecino devuelto por el portal. No basta para probar la tarjeta si el estado es SIN TARJETA.';
COMMENT ON COLUMN public.contract_signups.tarjeta_vecino_checked_at IS
  'Momento de la consulta al portal, antes de abrir el pago.';
