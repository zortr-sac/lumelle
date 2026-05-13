-- 0004_business_users.sql
-- Membership and invitations

create type public.business_role as enum ('owner', 'receptionist', 'staff');

create table public.business_users (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.business_role not null,
  is_active boolean not null default true,
  accepted_at timestamptz default now(),
  created_at timestamptz not null default now(),
  unique(business_id, user_id)
);

create index idx_business_users_user on public.business_users(user_id) where is_active;
create index idx_business_users_business on public.business_users(business_id) where is_active;

alter table public.business_users enable row level security;

-- Invitations (pending acceptance)
create table public.business_invitations (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  email citext not null,
  role public.business_role not null default 'staff',
  token text not null unique,
  expires_at timestamptz not null default (now() + interval '7 days'),
  invited_by uuid not null references public.profiles(id) on delete restrict,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_invitations_business on public.business_invitations(business_id);
create unique index idx_invitations_pending
  on public.business_invitations(business_id, email)
  where accepted_at is null;

alter table public.business_invitations enable row level security;

-- When a business is created, auto-create owner membership
create or replace function public.handle_new_business()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_users (business_id, user_id, role, is_active, accepted_at)
  values (new.id, new.owner_id, 'owner', true, now())
  on conflict do nothing;

  -- set as current business if user has none
  update public.profiles
  set current_business_id = new.id
  where id = new.owner_id and current_business_id is null;

  return new;
end;
$$;

create trigger on_business_created
  after insert on public.businesses
  for each row execute function public.handle_new_business();
