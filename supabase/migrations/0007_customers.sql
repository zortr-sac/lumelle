-- 0007_customers.sql
-- Customers (clientas) per business

create type public.customer_status_t as enum ('new', 'active', 'frequent', 'inactive');

create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  email citext,
  birthday date,
  district text,
  instagram text,
  notes text,
  allergies text,
  first_visit_at timestamptz,
  last_visit_at timestamptz,
  total_spent_cents bigint not null default 0,
  total_visits integer not null default 0,
  status public.customer_status_t not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create index idx_customers_business on public.customers(business_id, status);
create index idx_customers_birthday on public.customers(business_id, birthday)
  where birthday is not null;

create unique index idx_customers_phone_unique
  on public.customers(business_id, phone)
  where phone is not null;

alter table public.customers enable row level security;

-- Recompute customer status from frequency
create or replace function public.compute_customer_status(
  p_total_visits integer,
  p_last_visit timestamptz
) returns public.customer_status_t
language plpgsql
immutable
as $$
begin
  if p_total_visits = 0 then return 'new'; end if;
  if p_last_visit is null then return 'new'; end if;
  if p_last_visit < now() - interval '60 days' then return 'inactive'; end if;
  if p_total_visits >= 5 then return 'frequent'; end if;
  return 'active';
end;
$$;
