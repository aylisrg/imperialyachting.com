-- ============================================================
-- Migration 007: Booking core — extras, bookings, leads, Stripe
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. Yachts: booking configuration ────────────────────────
alter table public.yachts
  add column if not exists min_hours_weekday int not null default 2,
  add column if not exists min_hours_weekend int not null default 4,
  add column if not exists currency text not null default 'AED',
  add column if not exists calendar_id text,
  add column if not exists booking_enabled boolean not null default true;

-- ── 2. Yacht pricing: date-based seasons ────────────────────
alter table public.yacht_pricing
  add column if not exists valid_from date,
  add column if not exists valid_to date,
  add column if not exists is_weekend boolean not null default false;

-- ── 3. Extras (add-on services) ──────────────────────────────
create table if not exists public.extras (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  price int not null, -- AED, whole dirhams
  unit text not null
    check (unit in ('per_booking', 'per_hour', 'per_guest')),
  category text not null default 'general',
  image text not null default '',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_extras_slug on public.extras(slug);
create index if not exists idx_extras_active on public.extras(active) where active = true;

create trigger on_extras_updated
  before update on public.extras
  for each row execute function public.handle_updated_at();

insert into public.extras (slug, name, description, price, unit, category, sort_order) values
  ('catering-basic', 'Light catering platter', 'Assorted snacks, fruit and soft drinks for the group.', 150, 'per_guest', 'catering', 10),
  ('catering-premium', 'Premium catering menu', 'Chef-curated multi-course menu with premium ingredients.', 350, 'per_guest', 'catering', 20),
  ('birthday-decor', 'Birthday/celebration decoration set', 'Balloons, banners and table styling for celebrations.', 800, 'per_booking', 'decor', 30),
  ('photographer', 'Professional photographer (2 hours)', 'On-board photographer capturing the charter, edited gallery delivered after.', 1200, 'per_booking', 'media', 40),
  ('dj', 'DJ with sound system', 'Live DJ and sound system for the duration of the charter.', 1500, 'per_booking', 'entertainment', 50),
  ('jet-ski', 'Jet ski (30 minutes)', '30-minute jet ski session with safety briefing included.', 600, 'per_booking', 'watersports', 60),
  ('wakeboard', 'Wakeboard / water toys session', 'Wakeboard and water toys session with equipment and crew supervision.', 400, 'per_booking', 'watersports', 70),
  ('champagne', 'Champagne bottle', 'Chilled bottle of champagne served on board.', 450, 'per_booking', 'drinks', 80)
on conflict (slug) do nothing;

-- ── 4. Bookings ───────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  yacht_id uuid not null references public.yachts(id) on delete restrict,
  status text not null default 'quote'
    check (status in ('quote', 'hold', 'deposit_paid', 'paid', 'cancelled', 'expired')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  hours int not null,
  guests int not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  source text not null default 'web'
    check (source in ('mcp', 'web', 'admin')),
  base_amount int not null default 0,
  extras_amount int not null default 0,
  bonus_hours int not null default 0,
  total_amount int not null default 0,
  deposit_amount int not null default 0,
  currency text not null default 'AED',
  quote_expires_at timestamptz,
  hold_expires_at timestamptz,
  stripe_checkout_id text,
  stripe_payment_intent_id text,
  gcal_event_id text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_yacht_starts on public.bookings(yacht_id, starts_at);
create index if not exists idx_bookings_status on public.bookings(status);
create unique index if not exists idx_bookings_stripe_checkout_id
  on public.bookings(stripe_checkout_id) where stripe_checkout_id is not null;

create trigger on_bookings_updated
  before update on public.bookings
  for each row execute function public.handle_updated_at();

-- ── 5. Booking extras (line items) ───────────────────────────
create table if not exists public.booking_extras (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  extra_id uuid not null references public.extras(id) on delete restrict,
  qty int not null default 1,
  unit_price int not null,
  amount int not null
);

create index if not exists idx_booking_extras_booking_id on public.booking_extras(booking_id);

-- ── 6. Leads (contact form) ──────────────────────────────────
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text not null default '',
  inquiry_type text not null default 'General',
  preferred_date date,
  message text not null default '',
  source text not null default 'web',
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_created_at on public.leads(created_at desc);

-- ── 7. Stripe events (webhook idempotency) ───────────────────
create table if not exists public.stripe_events (
  id text primary key, -- Stripe event id
  type text not null,
  processed_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.extras enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_extras enable row level security;
alter table public.leads enable row level security;
alter table public.stripe_events enable row level security;

-- Extras: public catalog, safe to expose active items and let admins manage them.
create policy "Public can view active extras" on public.extras
  for select using (active = true);

create policy "Admins can manage extras" on public.extras
  for all using (auth.role() = 'authenticated');

-- Bookings / booking_extras / leads / stripe_events hold customer PII,
-- payment references and internal state. There is intentionally NO
-- public (anon) policy on these tables — every write from the site or
-- the MCP server goes through the service-role client
-- (`src/lib/supabase/admin.ts`), which bypasses RLS entirely. Only the
-- admin dashboard (authenticated users) may read them here.
create policy "Admins can view bookings" on public.bookings
  for select using (auth.role() = 'authenticated');

create policy "Admins can view booking extras" on public.booking_extras
  for select using (auth.role() = 'authenticated');

create policy "Admins can view leads" on public.leads
  for select using (auth.role() = 'authenticated');

-- stripe_events is purely an internal webhook idempotency ledger —
-- no UI reads it, so it gets no policies at all beyond RLS being on
-- (service role bypasses RLS regardless).
