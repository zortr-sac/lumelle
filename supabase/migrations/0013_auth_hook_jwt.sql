-- 0013_auth_hook_jwt.sql
-- Custom Access Token Hook injects business_ids[] and current_business_id into JWT
-- Configured in supabase/config.toml under [auth.hook.custom_access_token]

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  user_id uuid;
  business_ids uuid[];
  current_id uuid;
  current_role public.business_role;
  claims jsonb;
begin
  user_id := (event ->> 'user_id')::uuid;

  select array_agg(business_id)
  into business_ids
  from public.business_users
  where user_id = custom_access_token_hook.user_id and is_active;

  select current_business_id
  into current_id
  from public.profiles
  where id = user_id;

  -- if no current set OR user no longer member of current, fall back to first
  if current_id is null or not (current_id = any(coalesce(business_ids, '{}'::uuid[]))) then
    current_id := coalesce(business_ids, '{}'::uuid[])[1];
  end if;

  if current_id is not null then
    select role
    into current_role
    from public.business_users
    where user_id = custom_access_token_hook.user_id
    and business_id = current_id
    and is_active;
  end if;

  claims := coalesce(event -> 'claims', '{}'::jsonb);

  claims := claims
    || jsonb_build_object(
      'business_ids', coalesce(to_jsonb(business_ids), '[]'::jsonb),
      'current_business_id', coalesce(current_id::text, ''),
      'business_role', coalesce(current_role::text, '')
    );

  -- merge app_metadata so getUser() exposes claims
  claims := jsonb_set(
    claims,
    '{app_metadata}',
    coalesce(claims -> 'app_metadata', '{}'::jsonb)
      || jsonb_build_object(
        'business_ids', coalesce(to_jsonb(business_ids), '[]'::jsonb),
        'current_business_id', coalesce(current_id::text, ''),
        'business_role', coalesce(current_role::text, '')
      )
  );

  return jsonb_build_object('claims', claims);
end;
$$;

-- Grant access to supabase auth roles
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

grant select on public.business_users to supabase_auth_admin;
grant select on public.profiles to supabase_auth_admin;
