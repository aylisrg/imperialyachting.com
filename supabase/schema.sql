-- ============================================================
-- Imperial Yachting — Supabase Database Schema
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Yachts
create table public.yachts (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  builder text not null default '',
  year int not null default 2020,
  refit int,
  length_ft int not null default 0,
  length_m int not null default 0,
  capacity int not null default 0,
  cabins int,
  location text not null default 'Dubai Harbour',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Yacht Images
create table public.yacht_images (
  id uuid primary key default uuid_generate_v4(),
  yacht_id uuid not null references public.yachts(id) on delete cascade,
  url text not null,
  storage_path text not null default '',
  category text not null default 'other'
    check (category in ('hero', 'exterior', 'interior', 'cabin', 'deck', 'dining', 'other')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Yacht Specs
create table public.yacht_specs (
  id uuid primary key default uuid_generate_v4(),
  yacht_id uuid not null references public.yachts(id) on delete cascade,
  label text not null,
  value text not null,
  sort_order int not null default 0
);

-- Yacht Amenities
create table public.yacht_amenities (
  id uuid primary key default uuid_generate_v4(),
  yacht_id uuid not null references public.yachts(id) on delete cascade,
  icon text not null default 'anchor',
  label text not null,
  sort_order int not null default 0
);

-- Yacht Pricing
create table public.yacht_pricing (
  id uuid primary key default uuid_generate_v4(),
  yacht_id uuid not null references public.yachts(id) on delete cascade,
  season text not null,
  period text not null,
  daily int,
  weekly int,
  monthly int,
  daily_b2b int,
  weekly_b2b int,
  monthly_b2b int,
  sort_order int not null default 0
);

-- Yacht Included Items
create table public.yacht_included (
  id uuid primary key default uuid_generate_v4(),
  yacht_id uuid not null references public.yachts(id) on delete cascade,
  item text not null,
  sort_order int not null default 0
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_yacht_images_yacht_id on public.yacht_images(yacht_id);
create index idx_yacht_specs_yacht_id on public.yacht_specs(yacht_id);
create index idx_yacht_amenities_yacht_id on public.yacht_amenities(yacht_id);
create index idx_yacht_pricing_yacht_id on public.yacht_pricing(yacht_id);
create index idx_yacht_included_yacht_id on public.yacht_included(yacht_id);
create index idx_yachts_slug on public.yachts(slug);
create index idx_yachts_featured on public.yachts(featured) where featured = true;

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_yachts_updated
  before update on public.yachts
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.yachts enable row level security;
alter table public.yacht_images enable row level security;
alter table public.yacht_specs enable row level security;
alter table public.yacht_amenities enable row level security;
alter table public.yacht_pricing enable row level security;
alter table public.yacht_included enable row level security;

-- Public read access (for website)
create policy "Public can view yachts" on public.yachts
  for select using (true);
create policy "Public can view yacht images" on public.yacht_images
  for select using (true);
create policy "Public can view yacht specs" on public.yacht_specs
  for select using (true);
create policy "Public can view yacht amenities" on public.yacht_amenities
  for select using (true);
create policy "Public can view yacht pricing" on public.yacht_pricing
  for select using (true);
create policy "Public can view yacht included" on public.yacht_included
  for select using (true);

-- Authenticated users (admins) can do everything
create policy "Admins can manage yachts" on public.yachts
  for all using (auth.role() = 'authenticated');
create policy "Admins can manage yacht images" on public.yacht_images
  for all using (auth.role() = 'authenticated');
create policy "Admins can manage yacht specs" on public.yacht_specs
  for all using (auth.role() = 'authenticated');
create policy "Admins can manage yacht amenities" on public.yacht_amenities
  for all using (auth.role() = 'authenticated');
create policy "Admins can manage yacht pricing" on public.yacht_pricing
  for all using (auth.role() = 'authenticated');
create policy "Admins can manage yacht included" on public.yacht_included
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Create storage bucket for yacht photos
-- Run this separately in the SQL Editor:
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'yacht-photos',
  'yacht-photos',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);

-- Public read access for yacht photos
create policy "Public can view yacht photos"
  on storage.objects for select
  using (bucket_id = 'yacht-photos');

-- Authenticated users can upload/delete photos
create policy "Admins can upload yacht photos"
  on storage.objects for insert
  with check (bucket_id = 'yacht-photos' and auth.role() = 'authenticated');

create policy "Admins can update yacht photos"
  on storage.objects for update
  using (bucket_id = 'yacht-photos' and auth.role() = 'authenticated');

create policy "Admins can delete yacht photos"
  on storage.objects for delete
  using (bucket_id = 'yacht-photos' and auth.role() = 'authenticated');
