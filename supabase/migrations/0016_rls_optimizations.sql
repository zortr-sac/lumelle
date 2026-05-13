-- 0016_rls_optimizations.sql
-- Performance optimizations from Supabase advisor lint:
--   1. RLS init-plan: wrap auth.uid() in (select ...) so it evaluates once per query
--      instead of once per row.
--   2. Multiple permissive policies: split "ALL" policies into SELECT-only read
--      policies + role-gated write policies so SELECTs run a single policy check.
--   3. Duplicate index drop.

-- 1. Duplicate index
drop index if exists public.idx_sales_business_date;

-- 2. RLS init-plan on profiles + businesses insert
drop policy if exists "Users see their own profile" on public.profiles;
drop policy if exists "Users update their own profile" on public.profiles;

create policy "Users see their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Owners insert their business" on public.businesses;
create policy "Owners insert their business"
  on public.businesses for insert to authenticated
  with check (owner_id = (select auth.uid()));

-- 3. Consolidate permissive policies on key tables
drop policy if exists "Members read appointments" on public.appointments;
drop policy if exists "Members read customers" on public.customers;
drop policy if exists "Members read services" on public.services;
drop policy if exists "Members read staff" on public.staff;
drop policy if exists "Members read staff hours" on public.staff_hours;
drop policy if exists "Members read business hours" on public.business_hours;
drop policy if exists "Members see members of their business" on public.business_users;
drop policy if exists "Members read notifications" on public.notification_queue;
drop policy if exists "Members read service-staff map" on public.service_staff;

create policy "Read customers" on public.customers for select to authenticated
  using (business_id = any(public.user_business_ids()));
create policy "Read appointments" on public.appointments for select to authenticated
  using (business_id = any(public.user_business_ids()));
create policy "Read services" on public.services for select to authenticated
  using (business_id = any(public.user_business_ids()));
create policy "Read staff" on public.staff for select to authenticated
  using (business_id = any(public.user_business_ids()));
create policy "Read business hours" on public.business_hours for select to authenticated
  using (business_id = any(public.user_business_ids()));
create policy "Read business members" on public.business_users for select to authenticated
  using (business_id = any(public.user_business_ids()));
create policy "Read notifications" on public.notification_queue for select to authenticated
  using (business_id = any(public.user_business_ids()));
create policy "Read service-staff map" on public.service_staff for select to authenticated
  using (
    exists (
      select 1 from public.services
      where services.id = service_staff.service_id
      and services.business_id = any(public.user_business_ids())
    )
  );
create policy "Read staff hours" on public.staff_hours for select to authenticated
  using (
    exists (
      select 1 from public.staff
      where staff.id = staff_hours.staff_id
      and staff.business_id = any(public.user_business_ids())
    )
  );

-- Replace each `for all` policy with three role-gated write policies so SELECTs
-- aren't double-evaluated.
drop policy if exists "Reception+ manage customers" on public.customers;
drop policy if exists "Reception+ manage appointments" on public.appointments;
drop policy if exists "Owners manage services" on public.services;
drop policy if exists "Owners manage staff" on public.staff;
drop policy if exists "Owners manage business hours" on public.business_hours;
drop policy if exists "Owners manage members" on public.business_users;
drop policy if exists "Owners manage notifications" on public.notification_queue;
drop policy if exists "Owners manage service-staff map" on public.service_staff;
drop policy if exists "Owners manage staff hours" on public.staff_hours;

-- Customers (receptionist+)
create policy "Write customers" on public.customers for insert to authenticated
  with check (business_id = public.current_business_id() and public.has_role('receptionist'));
create policy "Update customers" on public.customers for update to authenticated
  using (business_id = public.current_business_id() and public.has_role('receptionist'))
  with check (business_id = public.current_business_id() and public.has_role('receptionist'));
create policy "Delete customers" on public.customers for delete to authenticated
  using (business_id = public.current_business_id() and public.has_role('receptionist'));

-- Appointments (receptionist+)
create policy "Write appointments" on public.appointments for insert to authenticated
  with check (business_id = public.current_business_id() and public.has_role('receptionist'));
create policy "Update appointments" on public.appointments for update to authenticated
  using (business_id = public.current_business_id() and public.has_role('receptionist'))
  with check (business_id = public.current_business_id() and public.has_role('receptionist'));
create policy "Delete appointments" on public.appointments for delete to authenticated
  using (business_id = public.current_business_id() and public.has_role('receptionist'));

-- Services (owner only)
create policy "Write services" on public.services for insert to authenticated
  with check (business_id = public.current_business_id() and public.has_role('owner'));
create policy "Update services" on public.services for update to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'))
  with check (business_id = public.current_business_id() and public.has_role('owner'));
create policy "Delete services" on public.services for delete to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'));

-- Staff (owner only)
create policy "Write staff" on public.staff for insert to authenticated
  with check (business_id = public.current_business_id() and public.has_role('owner'));
create policy "Update staff" on public.staff for update to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'))
  with check (business_id = public.current_business_id() and public.has_role('owner'));
create policy "Delete staff" on public.staff for delete to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'));

-- Business hours (owner only)
create policy "Write business hours" on public.business_hours for insert to authenticated
  with check (business_id = public.current_business_id() and public.has_role('owner'));
create policy "Update business hours" on public.business_hours for update to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'))
  with check (business_id = public.current_business_id() and public.has_role('owner'));
create policy "Delete business hours" on public.business_hours for delete to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'));

-- Business members (owner only)
create policy "Write business members" on public.business_users for insert to authenticated
  with check (business_id = public.current_business_id() and public.has_role('owner'));
create policy "Update business members" on public.business_users for update to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'))
  with check (business_id = public.current_business_id() and public.has_role('owner'));
create policy "Delete business members" on public.business_users for delete to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'));

-- Notifications (owner)
create policy "Write notifications" on public.notification_queue for insert to authenticated
  with check (business_id = public.current_business_id() and public.has_role('owner'));
create policy "Update notifications" on public.notification_queue for update to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'))
  with check (business_id = public.current_business_id() and public.has_role('owner'));
create policy "Delete notifications" on public.notification_queue for delete to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'));

-- Service-staff (owner)
create policy "Write service-staff map" on public.service_staff for insert to authenticated
  with check (
    exists (
      select 1 from public.services
      where services.id = service_staff.service_id
      and services.business_id = public.current_business_id()
      and public.has_role('owner')
    )
  );
create policy "Delete service-staff map" on public.service_staff for delete to authenticated
  using (
    exists (
      select 1 from public.services
      where services.id = service_staff.service_id
      and services.business_id = public.current_business_id()
      and public.has_role('owner')
    )
  );

-- Staff hours (owner)
create policy "Write staff hours" on public.staff_hours for insert to authenticated
  with check (
    exists (
      select 1 from public.staff
      where staff.id = staff_hours.staff_id
      and staff.business_id = public.current_business_id()
      and public.has_role('owner')
    )
  );
create policy "Update staff hours" on public.staff_hours for update to authenticated
  using (
    exists (
      select 1 from public.staff
      where staff.id = staff_hours.staff_id
      and staff.business_id = public.current_business_id()
      and public.has_role('owner')
    )
  );
create policy "Delete staff hours" on public.staff_hours for delete to authenticated
  using (
    exists (
      select 1 from public.staff
      where staff.id = staff_hours.staff_id
      and staff.business_id = public.current_business_id()
      and public.has_role('owner')
    )
  );
