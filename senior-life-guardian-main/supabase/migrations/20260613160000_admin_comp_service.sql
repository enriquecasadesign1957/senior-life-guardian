-- Servicio en gratuidad (cortesía admin) — no participa en cobros ni renovación automática

ALTER TABLE public.contract_signups
  ADD COLUMN IF NOT EXISTS comp_reason TEXT,
  ADD COLUMN IF NOT EXISTS comp_granted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS comp_granted_by TEXT;

COMMENT ON COLUMN public.contract_signups.comp_reason IS 'Motivo de cortesía (convenio municipal, beca, soporte, etc.)';
COMMENT ON COLUMN public.contract_signups.comp_granted_by IS 'Identificador del admin que otorgó la cortesía';
