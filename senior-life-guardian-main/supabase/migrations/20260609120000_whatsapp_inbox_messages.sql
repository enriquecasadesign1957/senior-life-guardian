-- Bandeja simple WhatsApp (Twilio API): historial entrante/saliente para /admin/inbox
create table if not exists public.whatsapp_inbox_messages (
  id uuid primary key default gen_random_uuid(),
  inbox text not null check (inbox in ('commercial', 'alerts')),
  direction text not null check (direction in ('inbound', 'outbound')),
  peer_phone text not null,
  body text not null,
  twilio_sid text,
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_inbox_messages_inbox_created_idx
  on public.whatsapp_inbox_messages (inbox, created_at desc);

create index if not exists whatsapp_inbox_messages_peer_idx
  on public.whatsapp_inbox_messages (peer_phone, created_at desc);

ALTER TABLE public.whatsapp_inbox_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages whatsapp_inbox_messages" ON public.whatsapp_inbox_messages;
CREATE POLICY "Service role manages whatsapp_inbox_messages"
  ON public.whatsapp_inbox_messages
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
