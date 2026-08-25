-- Store which Transbank product the inscription belongs to (Pro Chile vs Basic).
alter table public.transbank_inscriptions
  add column if not exists plan text not null default 'chile';

alter table public.transbank_inscriptions
  drop constraint if exists transbank_inscriptions_plan_check;

alter table public.transbank_inscriptions
  add constraint transbank_inscriptions_plan_check
  check (plan in ('chile', 'basic'));

update public.transbank_inscriptions
set plan = 'chile'
where plan is distinct from 'chile' and plan is distinct from 'basic';
