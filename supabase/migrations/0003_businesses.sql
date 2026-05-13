-- 0003_businesses.sql
-- Tenant root entity

create type public.subscription_status_t as enum ('trial', 'active', 'past_due', 'cancelled');

create table public.businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug citext not null unique,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  plan text not null default 'basic',
  country text not null default 'PE',
  timezone text not null default 'America/Lima',
  currency text not null default 'PEN',
  logo_url text,
  cover_url text,
  address text,
  district text,
  city text default 'Lima',
  instagram text,
  whatsapp_phone text,
  booking_policy text,
  deposit_policy text,
  is_active boolean not null default true,
  subscription_status public.subscription_status_t not null default 'trial',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

create index idx_businesses_owner on public.businesses(owner_id) where deleted_at is null;
create index idx_businesses_active on public.businesses(is_active) where deleted_at is null;

alter table public.profiles
  add constraint profiles_current_business_fk
  foreign key (current_business_id) references public.businesses(id) on delete set null;

alter table public.businesses enable row level security;

-- Reserved slugs blocklist
create table public.reserved_slugs (
  slug citext primary key
);

insert into public.reserved_slugs (slug) values
  ('app'),('api'),('admin'),('dashboard'),('login'),('signup'),
  ('logout'),('forgot'),('reset'),('onboarding'),('pricing'),
  ('about'),('blog'),('contact'),('b'),('static'),('public'),
  ('terms'),('privacy'),('help'),('support'),('settings'),
  ('ajustes'),('agenda'),('clientas'),('servicios'),('caja'),
  ('reportes'),('equipo'),('_next');

create or replace function public.check_slug_not_reserved()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from public.reserved_slugs where slug = lower(new.slug)) then
    raise exception 'El slug "%" está reservado por el sistema', new.slug;
  end if;
  if new.slug !~ '^[a-z0-9](?:[a-z0-9-]{1,40}[a-z0-9])?$' then
    raise exception 'Slug inválido. Solo letras minúsculas, números y guiones';
  end if;
  return new;
end;
$$;

create trigger validate_business_slug
  before insert or update of slug on public.businesses
  for each row execute function public.check_slug_not_reserved();
