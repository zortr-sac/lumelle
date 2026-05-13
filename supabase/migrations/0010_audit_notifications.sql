-- 0010_audit_notifications.sql
-- Audit log (Ley 29733) and notification queue (prepared for Fase 2)

create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_audit_business_date on public.audit_logs(business_id, created_at desc);
create index idx_audit_user on public.audit_logs(user_id, created_at desc);

alter table public.audit_logs enable row level security;

create type public.notification_type_t as enum (
  'reminder',
  'birthday',
  'retoque',
  'campaign',
  'system'
);
create type public.notification_status_t as enum ('pending', 'sent', 'failed', 'cancelled');

create table public.notification_queue (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type public.notification_type_t not null,
  target_phone text,
  target_email text,
  payload jsonb not null default '{}'::jsonb,
  status public.notification_status_t not null default 'pending',
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  error_message text,
  appointment_id uuid references public.appointments(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_notif_pending
  on public.notification_queue(business_id, scheduled_for)
  where status = 'pending';

alter table public.notification_queue enable row level security;
