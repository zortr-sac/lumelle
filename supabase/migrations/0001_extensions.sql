-- 0001_extensions.sql
-- Required PostgreSQL extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "btree_gist"; -- needed for EXCLUDE constraint on appointments
create extension if not exists "citext"; -- case-insensitive unique slugs/emails

-- Reusable updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
