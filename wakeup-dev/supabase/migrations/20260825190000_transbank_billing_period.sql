-- Record monthly vs annual Transbank subscriptions.
alter table public.transbank_inscriptions
  add column if not exists billing_period text not null default 'monthly';

alter table public.transbank_inscriptions
  drop constraint if exists transbank_inscriptions_billing_period_check;

alter table public.transbank_inscriptions
  add constraint transbank_inscriptions_billing_period_check
  check (billing_period in ('monthly', 'annual'));

update public.transbank_inscriptions
set billing_period = 'monthly'
where billing_period is distinct from 'monthly'
  and billing_period is distinct from 'annual';
