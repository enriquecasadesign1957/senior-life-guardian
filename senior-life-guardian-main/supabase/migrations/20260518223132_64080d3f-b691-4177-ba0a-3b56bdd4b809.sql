-- Drop overly-permissive policies. All legitimate writes go through
-- server functions using the service-role key (which bypasses RLS).

DROP POLICY IF EXISTS "Anyone can create a trial signup" ON public.trial_signups;
DROP POLICY IF EXISTS "Anyone can insert contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Anyone can insert pin" ON public.user_pins;

-- Ensure RLS remains enabled (deny-by-default with no policies for clients).
ALTER TABLE public.trial_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webpay_transactions ENABLE ROW LEVEL SECURITY;