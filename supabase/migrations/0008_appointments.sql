-- 0008_appointments.sql
-- Appointments with anti-double-booking constraint

create type public.appointment_status_t as enum (
  'requested',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

create type public.appointment_source_t as enum ('public', 'dashboard', 'walkin');

create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  staff_id uuid references public.staff(id) on delete set null,
  service_id uuid not null references public.services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status_t not null default 'requested',
  notes text,
  internal_notes text,
  source public.appointment_source_t not null default 'dashboard',
  deposit_cents bigint not null default 0 check (deposit_cents >= 0),
  reminder_sent_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create trigger appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

create index idx_appointments_business_starts on public.appointments(business_id, starts_at);
create index idx_appointments_staff_starts
  on public.appointments(staff_id, starts_at)
  where status in ('confirmed', 'in_progress');
create index idx_appointments_customer on public.appointments(customer_id, starts_at desc);
create index idx_appointments_status on public.appointments(business_id, status, starts_at);

-- CRITICAL: anti-double-booking constraint at DB level
alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    staff_id with =,
    business_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('confirmed', 'in_progress'));

alter table public.appointments enable row level security;

-- Status history (audit trail per appointment)
create table public.appointment_status_history (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  from_status public.appointment_status_t,
  to_status public.appointment_status_t not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now(),
  reason text
);

create index idx_appt_history_appt on public.appointment_status_history(appointment_id, changed_at desc);

alter table public.appointment_status_history enable row level security;

create or replace function public.log_appointment_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    insert into public.appointment_status_history(appointment_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, new.created_by);
  elsif (TG_OP = 'UPDATE' and old.status is distinct from new.status) then
    insert into public.appointment_status_history(appointment_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger appointments_status_history
  after insert or update of status on public.appointments
  for each row execute function public.log_appointment_status_change();
