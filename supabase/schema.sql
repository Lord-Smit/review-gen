-- ============================================================================
-- ReviewGen — Supabase schema (production)
-- ============================================================================
--
-- This file is idempotent: it can be run repeatedly against an existing project
-- and will only add what is missing. Run it in the Supabase SQL editor (or with
-- `supabase db push`) before deploying the application.
--
-- Security model
-- --------------
--   * anon            : can read ACTIVE businesses and insert analytics events.
--   * authenticated   : same as anon, plus full access IF the JWT contains
--                       `app_metadata.role = "admin"`.
--
-- The admin role deliberately lives in `app_metadata` (server-controlled), not
-- `user_metadata` (which an authenticated user can edit themselves).
--
-- Provisioning the first admin (Supabase dashboard):
--   1. Authentication → Users → Add user (email + password, auto-confirm).
--   2. Authentication → Users → <user> → Edit → App metadata, add:
--          { "role": "admin" }
--      or run the SQL at the bottom of this file.
--
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Helper: is the current request an administrator?
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  slug text not null,
  category text,
  description text,
  contact_info jsonb not null default '{}'::jsonb,
  logo_url text,
  primary_color text not null default '#2563EB',
  secondary_color text not null default '#1E40AF',
  background_color text not null default '#FAFAFA',
  button_color text not null default '#2563EB',
  google_review_url text not null,
  welcome_heading text not null default 'How was your experience?',
  welcome_description text not null default 'Your feedback means a lot to us.',
  welcome_message text,
  default_language text not null default 'en',
  review_options jsonb,
  review_templates jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration-safe additions for projects created with the old schema.
alter table public.businesses
  add column if not exists contact_info jsonb not null default '{}'::jsonb;

-- Constraints are added separately so existing projects can be upgraded.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'businesses_slug_format'
  ) then
    alter table public.businesses
      add constraint businesses_slug_format
      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'businesses_slug_key'
  ) then
    alter table public.businesses
      add constraint businesses_slug_key unique (slug);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'businesses_business_name_length'
  ) then
    alter table public.businesses
      add constraint businesses_business_name_length
      check (char_length(btrim(business_name)) between 1 and 120);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'businesses_colors_hex'
  ) then
    alter table public.businesses
      add constraint businesses_colors_hex
      check (
        primary_color ~ '^#[0-9A-Fa-f]{6}$' and
        secondary_color ~ '^#[0-9A-Fa-f]{6}$' and
        background_color ~ '^#[0-9A-Fa-f]{6}$' and
        button_color ~ '^#[0-9A-Fa-f]{6}$'
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'businesses_google_review_url_http'
  ) then
    alter table public.businesses
      add constraint businesses_google_review_url_http
      check (google_review_url ~* '^https?://');
  end if;
end;
$$;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.analytics_events
  add column if not exists metadata jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'analytics_events_type_check'
  ) then
    alter table public.analytics_events
      add constraint analytics_events_type_check
      check (event_type in ('page_visit', 'google_review_click', 'page_view', 'google_click'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'analytics_events_metadata_size'
  ) then
    alter table public.analytics_events
      add constraint analytics_events_metadata_size
      check (octet_length(metadata::text) <= 4096);
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_businesses_active on public.businesses (is_active) where is_active;
create index if not exists idx_businesses_created_at on public.businesses (created_at desc);
create index if not exists idx_analytics_business_created
  on public.analytics_events (business_id, created_at desc);
create index if not exists idx_analytics_event_type on public.analytics_events (event_type);
create index if not exists idx_analytics_created_at on public.analytics_events (created_at desc);

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_businesses_updated_at on public.businesses;
create trigger update_businesses_updated_at
  before update on public.businesses
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.businesses enable row level security;
alter table public.analytics_events enable row level security;

-- Public storefront: only active businesses are visible.
drop policy if exists "Public can view active businesses" on public.businesses;
create policy "Public can view active businesses"
  on public.businesses
  for select
  to anon, authenticated
  using (is_active = true);

-- Admins can do everything (including reading inactive businesses).
drop policy if exists "Admins manage businesses" on public.businesses;
create policy "Admins manage businesses"
  on public.businesses
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Customers may only append anonymous events for an existing business.
drop policy if exists "Public can insert analytics events" on public.analytics_events;
create policy "Public can insert analytics events"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.businesses b
      where b.id = business_id
        and b.is_active = true
    )
  );

-- Only admins can read or remove analytics data.
drop policy if exists "Admins read analytics events" on public.analytics_events;
create policy "Admins read analytics events"
  on public.analytics_events
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins delete analytics events" on public.analytics_events;
create policy "Admins delete analytics events"
  on public.analytics_events
  for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- Privileges (RLS still applies on top of these grants)
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.businesses to anon, authenticated;
grant insert, update, delete on public.businesses to authenticated;

grant insert on public.analytics_events to anon, authenticated;
grant select, delete on public.analytics_events to authenticated;

-- ----------------------------------------------------------------------------
-- OPTIONAL: provision an admin directly.
-- Replace the email, then uncomment and run. Prefer the dashboard UI.
-- ----------------------------------------------------------------------------
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'admin@example.com';
