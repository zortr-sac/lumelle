-- 0005_business_hours.sql
-- Working hours per business (and overrides per staff)

create table public.business_hours (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  opens_at time not null,
  closes_at time not null,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  check (is_closed or opens_at < closes_at)
);

create index idx_business_hours_business on public.business_hours(business_id, day_of_week);

alter table public.business_hours enable row level security;

-- Seed default 7-day weekly schedule (Mon-Sat 9-18, Sun closed) on business creation
create or replace function public.seed_business_hours()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_hours (business_id, day_of_week, opens_at, closes_at, is_closed)
  values
    (new.id, 0, '09:00', '18:00', true),  -- Domingo
    (new.id, 1, '09:00', '20:00', false), -- Lunes
    (new.id, 2, '09:00', '20:00', false), -- Martes
    (new.id, 3, '09:00', '20:00', false), -- Miércoles
    (new.id, 4, '09:00', '20:00', false), -- Jueves
    (new.id, 5, '09:00', '21:00', false), -- Viernes
    (new.id, 6, '09:00', '19:00', false); -- Sábado
  return new;
end;
$$;

create trigger seed_hours_on_business_creation
  after insert on public.businesses
  for each row execute function public.seed_business_hours();
