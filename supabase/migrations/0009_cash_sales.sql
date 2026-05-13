-- 0009_cash_sales.sql
-- Cash sessions, sales, payments, expenses

create type public.cash_session_status_t as enum ('open', 'closed');
create type public.sale_type_t as enum ('appointment', 'walkin', 'product');
create type public.payment_method_t as enum ('cash', 'yape', 'plin', 'transfer', 'pos', 'other');

create table public.cash_sessions (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  opened_by uuid not null references public.profiles(id) on delete restrict,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  closed_by uuid references public.profiles(id) on delete set null,
  opening_cents bigint not null default 0,
  expected_cents bigint,
  closing_cents bigint,
  difference_cents bigint,
  status public.cash_session_status_t not null default 'open',
  notes text,
  created_at timestamptz not null default now()
);

create unique index idx_cash_sessions_open_per_business
  on public.cash_sessions(business_id)
  where status = 'open';

create index idx_cash_sessions_business on public.cash_sessions(business_id, opened_at desc);

alter table public.cash_sessions enable row level security;

create table public.sales (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  cash_session_id uuid references public.cash_sessions(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  sale_type public.sale_type_t not null default 'walkin',
  total_cents bigint not null check (total_cents >= 0),
  discount_cents bigint not null default 0 check (discount_cents >= 0),
  tip_cents bigint not null default 0 check (tip_cents >= 0),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_sales_business_date on public.sales(business_id, created_at desc);
create index idx_sales_session on public.sales(cash_session_id) where cash_session_id is not null;
create index idx_sales_customer on public.sales(customer_id) where customer_id is not null;

alter table public.sales enable row level security;

create table public.sale_items (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  staff_id uuid references public.staff(id) on delete set null,
  name text not null,
  qty integer not null default 1 check (qty > 0),
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  subtotal_cents bigint not null check (subtotal_cents >= 0)
);

create index idx_sale_items_sale on public.sale_items(sale_id);
alter table public.sale_items enable row level security;

create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  method public.payment_method_t not null,
  amount_cents bigint not null check (amount_cents > 0),
  reference text,
  paid_at timestamptz not null default now()
);

create index idx_payments_sale on public.payments(sale_id);
create index idx_payments_method_date
  on public.payments(method, paid_at);

alter table public.payments enable row level security;

create table public.expenses (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  cash_session_id uuid references public.cash_sessions(id) on delete set null,
  category text not null,
  description text,
  amount_cents bigint not null check (amount_cents > 0),
  paid_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create index idx_expenses_business_date on public.expenses(business_id, paid_at desc);
create index idx_expenses_session on public.expenses(cash_session_id) where cash_session_id is not null;

alter table public.expenses enable row level security;

-- Update customer aggregates after a completed sale
create or replace function public.update_customer_aggregates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_visits integer;
  v_last timestamptz;
  v_first timestamptz;
  v_total bigint;
  v_status public.customer_status_t;
begin
  if new.customer_id is null then return new; end if;

  select
    count(*),
    max(created_at),
    min(created_at),
    coalesce(sum(total_cents), 0)
  into v_visits, v_last, v_first, v_total
  from public.sales
  where customer_id = new.customer_id;

  v_status := public.compute_customer_status(v_visits, v_last);

  update public.customers set
    total_visits = v_visits,
    last_visit_at = v_last,
    first_visit_at = coalesce(first_visit_at, v_first),
    total_spent_cents = v_total,
    status = v_status
  where id = new.customer_id;

  return new;
end;
$$;

create trigger sales_update_customer_aggregates
  after insert on public.sales
  for each row execute function public.update_customer_aggregates();
