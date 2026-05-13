-- 0012_rls_policies.sql
-- Row Level Security policies (depend on JWT custom claims from 0013)

-- Helper to read current_business_id from JWT
create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'current_business_id', '')::uuid,
    null::uuid
  );
$$;

create or replace function public.user_business_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    array(
      select jsonb_array_elements_text(auth.jwt() -> 'business_ids')::uuid
    ),
    '{}'::uuid[]
  );
$$;

create or replace function public.current_business_role()
returns public.business_role
language sql
stable
security definer
set search_path = public
as $$
  select nullif(auth.jwt() ->> 'business_role', '')::public.business_role;
$$;

create or replace function public.has_role(required public.business_role)
returns boolean
language sql
stable
as $$
  select case
    when public.current_business_role() = 'owner' then true
    when public.current_business_role() = 'receptionist' and required in ('receptionist','staff') then true
    when public.current_business_role() = 'staff' and required = 'staff' then true
    else false
  end;
$$;

-- profiles
create policy "Users see their own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Users update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- businesses
create policy "Members read their business"
  on public.businesses for select
  to authenticated
  using (id = any(public.user_business_ids()));

create policy "Owners update their business"
  on public.businesses for update
  to authenticated
  using (id = public.current_business_id() and public.has_role('owner'));

create policy "Owners insert their business"
  on public.businesses for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "Public read active businesses by slug"
  on public.businesses for select
  to anon
  using (is_active and deleted_at is null);

-- business_users
create policy "Members see members of their business"
  on public.business_users for select
  to authenticated
  using (business_id = any(public.user_business_ids()));

create policy "Owners manage members"
  on public.business_users for all
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'))
  with check (business_id = public.current_business_id() and public.has_role('owner'));

-- business_invitations
create policy "Owners manage invitations"
  on public.business_invitations for all
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'))
  with check (business_id = public.current_business_id() and public.has_role('owner'));

-- business_hours
create policy "Members read business hours"
  on public.business_hours for select
  to authenticated
  using (business_id = any(public.user_business_ids()));

create policy "Public read business hours"
  on public.business_hours for select
  to anon
  using (
    exists (
      select 1 from public.businesses
      where id = business_hours.business_id
      and is_active and deleted_at is null
    )
  );

create policy "Owners manage business hours"
  on public.business_hours for all
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'))
  with check (business_id = public.current_business_id() and public.has_role('owner'));

-- staff
create policy "Members read staff"
  on public.staff for select
  to authenticated
  using (business_id = any(public.user_business_ids()));

create policy "Public read bookable staff"
  on public.staff for select
  to anon
  using (
    is_bookable
    and exists (
      select 1 from public.businesses
      where id = staff.business_id
      and is_active and deleted_at is null
    )
  );

create policy "Owners manage staff"
  on public.staff for all
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'))
  with check (business_id = public.current_business_id() and public.has_role('owner'));

create policy "Members read staff hours"
  on public.staff_hours for select
  to authenticated
  using (
    exists (
      select 1 from public.staff
      where staff.id = staff_hours.staff_id
      and staff.business_id = any(public.user_business_ids())
    )
  );

create policy "Owners manage staff hours"
  on public.staff_hours for all
  to authenticated
  using (
    exists (
      select 1 from public.staff
      where staff.id = staff_hours.staff_id
      and staff.business_id = public.current_business_id()
      and public.has_role('owner')
    )
  );

-- services
create policy "Members read services"
  on public.services for select
  to authenticated
  using (business_id = any(public.user_business_ids()));

create policy "Public read active services"
  on public.services for select
  to anon
  using (
    is_active
    and exists (
      select 1 from public.businesses
      where id = services.business_id
      and is_active and deleted_at is null
    )
  );

create policy "Owners manage services"
  on public.services for all
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'))
  with check (business_id = public.current_business_id() and public.has_role('owner'));

create policy "Members read service-staff map"
  on public.service_staff for select
  to authenticated
  using (
    exists (
      select 1 from public.services
      where services.id = service_staff.service_id
      and services.business_id = any(public.user_business_ids())
    )
  );

create policy "Public read service-staff map"
  on public.service_staff for select
  to anon
  using (
    exists (
      select 1 from public.services s
      join public.businesses b on b.id = s.business_id
      where s.id = service_staff.service_id
      and s.is_active and b.is_active and b.deleted_at is null
    )
  );

create policy "Owners manage service-staff map"
  on public.service_staff for all
  to authenticated
  using (
    exists (
      select 1 from public.services
      where services.id = service_staff.service_id
      and services.business_id = public.current_business_id()
      and public.has_role('owner')
    )
  );

-- customers
create policy "Members read customers"
  on public.customers for select
  to authenticated
  using (business_id = any(public.user_business_ids()));

create policy "Reception+ manage customers"
  on public.customers for all
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('receptionist'))
  with check (business_id = public.current_business_id() and public.has_role('receptionist'));

-- appointments
create policy "Members read appointments"
  on public.appointments for select
  to authenticated
  using (business_id = any(public.user_business_ids()));

create policy "Reception+ manage appointments"
  on public.appointments for all
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('receptionist'))
  with check (business_id = public.current_business_id() and public.has_role('receptionist'));

create policy "Members read appointment history"
  on public.appointment_status_history for select
  to authenticated
  using (
    exists (
      select 1 from public.appointments
      where appointments.id = appointment_status_history.appointment_id
      and appointments.business_id = any(public.user_business_ids())
    )
  );

-- cash sessions, sales, payments, expenses (receptionist+)
create policy "Reception+ manage cash sessions"
  on public.cash_sessions for all
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('receptionist'))
  with check (business_id = public.current_business_id() and public.has_role('receptionist'));

create policy "Reception+ manage sales"
  on public.sales for all
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('receptionist'))
  with check (business_id = public.current_business_id() and public.has_role('receptionist'));

create policy "Reception+ manage sale items"
  on public.sale_items for all
  to authenticated
  using (
    exists (
      select 1 from public.sales
      where sales.id = sale_items.sale_id
      and sales.business_id = public.current_business_id()
      and public.has_role('receptionist')
    )
  )
  with check (
    exists (
      select 1 from public.sales
      where sales.id = sale_items.sale_id
      and sales.business_id = public.current_business_id()
      and public.has_role('receptionist')
    )
  );

create policy "Reception+ manage payments"
  on public.payments for all
  to authenticated
  using (
    exists (
      select 1 from public.sales
      where sales.id = payments.sale_id
      and sales.business_id = public.current_business_id()
      and public.has_role('receptionist')
    )
  )
  with check (
    exists (
      select 1 from public.sales
      where sales.id = payments.sale_id
      and sales.business_id = public.current_business_id()
      and public.has_role('receptionist')
    )
  );

create policy "Reception+ manage expenses"
  on public.expenses for all
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('receptionist'))
  with check (business_id = public.current_business_id() and public.has_role('receptionist'));

-- audit logs (read-only, owner only)
create policy "Owners read audit logs"
  on public.audit_logs for select
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'));

-- notification queue (read by members, manage by owner)
create policy "Members read notifications"
  on public.notification_queue for select
  to authenticated
  using (business_id = any(public.user_business_ids()));

create policy "Owners manage notifications"
  on public.notification_queue for all
  to authenticated
  using (business_id = public.current_business_id() and public.has_role('owner'))
  with check (business_id = public.current_business_id() and public.has_role('owner'));
