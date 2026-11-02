-- Guardián del checkout: persiste en SQL (no solo storage) hasta confirmar pago
ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS pending_first_guardian jsonb;

COMMENT ON COLUMN public.contract_signups.pending_first_guardian IS
  'Primer guardián capturado en checkout; se materializa en emergency_contacts tras pago.';

NOTIFY pgrst, 'reload schema';
