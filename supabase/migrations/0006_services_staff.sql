-- 0006_services_staff.sql
-- Catalog of services and staff (technicians)

create table public.staff (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  role_label text,
  color text default '#957DAD',
  photo_url text,
  instagram text,
  bio text,
  is_bookable boolean not null default true,
  commission_pct numeric(5,2),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger staff_updated_at
  before update on public.staff
  for each row execute function public.set_updated_at();

create index idx_staff_business on public.staff(business_id) where is_bookable;
create index idx_staff_user on public.staff(user_id) where user_id is not null;

alter table public.staff enable row level security;

create table public.staff_hours (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  opens_at time not null,
  closes_at time not null,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  check (is_closed or opens_at < closes_at)
);

create index idx_staff_hours_staff on public.staff_hours(staff_id, day_of_week);
alter table public.staff_hours enable row level security;

create table public.services (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  category text,
  description text,
  price_cents bigint not null check (price_cents >= 0),
  duration_minutes smallint not null check (duration_minutes between 5 and 480),
  buffer_minutes smallint not null default 0 check (buffer_minutes between 0 and 60),
  image_url text,
  is_active boolean not null default true,
  requires_staff_selection boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create index idx_services_business on public.services(business_id) where is_active;

alter table public.services enable row level security;

create table public.service_staff (
  service_id uuid not null references public.services(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  primary key (service_id, staff_id)
);

create index idx_service_staff_staff on public.service_staff(staff_id);
alter table public.service_staff enable row level security;
