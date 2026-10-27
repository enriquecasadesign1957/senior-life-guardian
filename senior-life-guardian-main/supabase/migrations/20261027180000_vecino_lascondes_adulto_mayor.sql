-- Convenio Tarjeta Vecino Las Condes:
-- 15% tarjeta vecino (VECINO-LASCONDES, ya existente)
-- 20% tarjeta vecino adulto mayor

UPDATE public.discount_codes
SET notes = 'Convenio Tarjeta Vecino (general), Municipalidad de Las Condes. 15% sobre el Plan Único, mensual y anual.'
WHERE upper(trim(code)) = 'VECINO-LASCONDES';

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
  'VECINO-LASCONDES-AM',
  'Tarjeta Vecino Adulto Mayor — Municipalidad de Las Condes',
  'las_condes_adulto_mayor',
  20,
  true,
  true,
  true,
  false,
  'Convenio Tarjeta Vecino Adulto Mayor. 20% sobre el Plan Único, mensual y anual.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.discount_codes WHERE upper(trim(code)) = 'VECINO-LASCONDES-AM'
);
