-- Un solo uso por cliente (email) + código promocional primer mes 50% off

ALTER TABLE public.discount_codes
  ADD COLUMN IF NOT EXISTS one_per_customer BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.discount_codes.one_per_customer IS
  'Si true, cada email solo puede canjear este código una vez (pago confirmado).';

-- Promoción barra superior: primer mes 50% en plan mensual
INSERT INTO public.discount_codes (
  code,
  label,
  partner_slug,
  percent_off,
  applies_monthly,
  applies_annual,
  active,
  one_per_customer,
  notes
)
SELECT
  'PRIMER50',
  'Promoción — 50% en tu primer mes',
  'promo_lanzamiento',
  50,
  true,
  false,
  true,
  true,
  'Barra promocional: Sin permanencia · Primer mes 50% · Un uso por correo · Solo plan mensual.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.discount_codes WHERE upper(trim(code)) = 'PRIMER50'
);
