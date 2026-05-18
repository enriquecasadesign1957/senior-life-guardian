
CREATE TABLE public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  trial_signup_id uuid not null,
  nombre text not null,
  telefono text not null,
  parentesco text not null,
  created_at timestamptz not null default now()
);
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contacts" ON public.emergency_contacts FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.user_pins (
  trial_signup_id uuid primary key,
  pin_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert pin" ON public.user_pins FOR INSERT TO anon, authenticated WITH CHECK (true);
