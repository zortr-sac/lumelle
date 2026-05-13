-- 0018_owner_can_read_own_business.sql
-- Fix INSERT...RETURNING failure on businesses:
-- The Members read policy required `id = any(user_business_ids())`, but during
-- INSERT...RETURNING the AFTER-trigger that populates business_users hasn't
-- fired yet. So users couldn't read the row they just created.
--
-- Solution: also allow SELECT when owner_id matches auth.uid() — guarantees
-- the freshly inserted row is visible regardless of trigger timing.

drop policy if exists "Members read their business" on public.businesses;

create policy "Members read their business"
  on public.businesses for select
  to authenticated
  using (
    id = any(public.user_business_ids())
    or owner_id = (select auth.uid())
  );
