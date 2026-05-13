-- 0015_dashboard_rpc.sql
-- Server-side aggregations to keep dashboard at 1 round-trip and let Postgres
-- use partial indexes instead of pulling rows to the app. Lima timezone is
-- baked in because the SaaS is Peru-only at this stage.

create or replace function public.dashboard_stats(p_business_id uuid)
returns table (
  appointments_today bigint,
  sales_today_cents bigint,
  pending_bookings bigint,
  weekly_revenue_cents bigint
)
language sql
stable
security definer
set search_path = public
as $func$
  with today_range as (
    select
      date_trunc('day', now() at time zone 'America/Lima') as day_start,
      date_trunc('day', now() at time zone 'America/Lima') + interval '1 day' as day_end,
      date_trunc('day', now() at time zone 'America/Lima') - interval '7 days' as week_start
  )
  select
    (select count(*)::bigint
       from public.appointments a, today_range
       where a.business_id = p_business_id
         and a.starts_at >= day_start at time zone 'America/Lima'
         and a.starts_at <  day_end   at time zone 'America/Lima'
         and a.status in ('confirmed','in_progress','completed')) as appointments_today,
    coalesce((select sum(total_cents)::bigint
       from public.sales s, today_range
       where s.business_id = p_business_id
         and s.created_at >= day_start at time zone 'America/Lima'
         and s.created_at <  day_end   at time zone 'America/Lima'), 0) as sales_today_cents,
    (select count(*)::bigint
       from public.appointments a
       where a.business_id = p_business_id
         and a.status = 'requested') as pending_bookings,
    coalesce((select sum(total_cents)::bigint
       from public.sales s, today_range
       where s.business_id = p_business_id
         and s.created_at >= week_start at time zone 'America/Lima'
         and s.created_at <  day_end    at time zone 'America/Lima'), 0) as weekly_revenue_cents;
$func$;

grant execute on function public.dashboard_stats(uuid) to authenticated;

create or replace function public.count_customers_by_status(p_business_id uuid)
returns table (status text, count bigint)
language sql
stable
security definer
set search_path = public
as $func$
  select c.status::text, count(*)::bigint
  from public.customers c
  where c.business_id = p_business_id
  group by c.status;
$func$;

grant execute on function public.count_customers_by_status(uuid) to authenticated;

-- Supporting indexes
create index if not exists idx_appointments_today
  on public.appointments(business_id, starts_at)
  where status in ('confirmed','in_progress','completed');

create index if not exists idx_appointments_pending
  on public.appointments(business_id, created_at desc)
  where status = 'requested';

create index if not exists idx_sales_business_created
  on public.sales(business_id, created_at desc);

create extension if not exists pg_trgm;
create index if not exists idx_customers_name_trgm
  on public.customers using gin (name gin_trgm_ops);

create index if not exists idx_customers_cursor
  on public.customers(business_id, created_at desc, id desc);

create index if not exists idx_audit_business_created
  on public.audit_logs(business_id, created_at desc) where business_id is not null;
