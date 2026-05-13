-- 0017_rls_resilient_helpers.sql
-- Make RLS helpers resilient to the Auth Hook NOT being enabled.
-- Fast path: read JWT custom claims (populated when custom_access_token_hook is active).
-- Fallback: query business_users/profiles directly. Slower but correct.

create or replace function public.user_business_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $func$
  select case
    when jsonb_array_length(coalesce(auth.jwt() -> 'business_ids', '[]'::jsonb)) > 0
      then coalesce(
        array(select jsonb_array_elements_text(auth.jwt() -> 'business_ids')::uuid),
        ARRAY[]::uuid[]
      )
    else coalesce(
      (select array_agg(business_id) from public.business_users
        where user_id = auth.uid() and is_active),
      ARRAY[]::uuid[]
    )
  end;
$func$;

create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $func$
  select coalesce(
    nullif(auth.jwt() ->> 'current_business_id', '')::uuid,
    (select current_business_id from public.profiles where id = auth.uid()),
    (select business_id from public.business_users
      where user_id = auth.uid() and is_active
      order by created_at asc limit 1)
  );
$func$;

create or replace function public.current_business_role()
returns public.business_role
language sql
stable
security definer
set search_path = public
as $func$
  select coalesce(
    nullif(auth.jwt() ->> 'business_role', '')::public.business_role,
    (select role from public.business_users
      where user_id = auth.uid()
      and business_id = public.current_business_id()
      and is_active
      limit 1)
  );
$func$;
