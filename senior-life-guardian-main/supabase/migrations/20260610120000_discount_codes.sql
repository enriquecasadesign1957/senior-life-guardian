-- Códigos de convenio municipal / descuento en checkout

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  partner_slug TEXT NOT NULL,
  percent_off INTEGER NOT NULL CHECK (percent_off > 0 AND percent_off <= 100),
  applies_monthly BOOLEAN NOT NULL DEFAULT true,
  applies_annual BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  max_redemptions INTEGER,
  redemption_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS discount_codes_code_unique
  ON public.discount_codes (upper(trim(code)));

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages discount_codes" ON public.discount_codes;
CREATE POLICY "Service role manages discount_codes"
  ON public.discount_codes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS discount_codes_updated_at ON public.discount_codes;
CREATE TRIGGER discount_codes_updated_at
  BEFORE UPDATE ON public.discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES public.discount_codes(id),
  ADD COLUMN IF NOT EXISTS discount_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_partner TEXT,
  ADD COLUMN IF NOT EXISTS discount_percent INTEGER,
  ADD COLUMN IF NOT EXISTS list_price INTEGER;

-- Convenio piloto: Tarjeta Vecino Las Condes (15% mensual y anual)
INSERT INTO public.discount_codes (
  code,
  label,
  partner_slug,
  percent_off,
  applies_monthly,
  applies_annual,
  active,
  notes
)
SELECT
  'VECINO-LASCONDES',
  'Tarjeta Vecino — Municipalidad de Las Condes',
  'las_condes',
  15,
  true,
  true,
  true,
  'Convenio municipal. Activar comunicación pública tras acuerdo formal.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.discount_codes WHERE upper(trim(code)) = 'VECINO-LASCONDES'
);
