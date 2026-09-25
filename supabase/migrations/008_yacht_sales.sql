-- ============================================================
-- Migration 008: Yachts for sale — listings, media, gated materials
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
--
-- The /yachts-for-sale section is deliberately NOT linked from the site
-- navigation, but it is in sitemap.xml, llms.txt and IndexNow, so search
-- engines and AI assistants index it. Content is managed through the
-- private admin MCP endpoint (/api/mcp/sales), see docs/YACHT_SALES_RU.md.
-- Idempotent — safe to re-run.
-- ============================================================

-- ── 1. Listings ───────────────────────────────────────────────
-- Any field left NULL/empty falls back to the linked charter-fleet yacht
-- (fleet_yacht_slug), so photos, videos and specs are pulled from /fleet
-- automatically and only sale-specific data has to be written here.
create table if not exists public.sale_listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'under_offer', 'sold')),
  fleet_yacht_slug text,
  name text not null,
  builder text,
  model text,
  year_built int,
  refit_year int,
  length_m numeric(6, 2),
  beam_m numeric(6, 2),
  draft_m numeric(6, 2),
  guests int,
  cabins int,
  engines text,
  top_speed_kn numeric(5, 1),
  lying text,
  flag text,
  price_amount bigint,             -- NULL = price on application
  price_currency text not null default 'AED',
  headline text,                   -- one line under the H1
  summary text,                    -- 1–2 sentences: meta description, cards, llms.txt
  description text,                -- paragraphs separated by blank lines
  highlights text[] not null default '{}',
  features text[] not null default '{}',
  spec_sections jsonb not null default '[]',  -- [{title, items:[{label, value}]}]
  faq jsonb not null default '[]',            -- [{question, answer}]
  seo_title text,
  seo_description text,
  keywords text[] not null default '{}',
  hero_image text,
  -- Co-brokerage terms shown openly on the page, e.g. commission split.
  broker_terms text,
  sort_order int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sale_listings_status on public.sale_listings(status);

drop trigger if exists on_sale_listings_updated on public.sale_listings;
create trigger on_sale_listings_updated
  before update on public.sale_listings
  for each row execute function public.handle_updated_at();

-- ── 2. Media shown on the page (public) ──────────────────────
create table if not exists public.sale_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.sale_listings(id) on delete cascade,
  kind text not null check (kind in ('image', 'video', 'youtube')),
  url text not null,
  storage_path text,               -- set when the file lives in the sale-media bucket
  caption text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_sale_media_listing on public.sale_media(listing_id, sort_order);

-- ── 3. Downloadable materials (gated behind an email) ────────
-- source = 'bundled' → file shipped with the site in private/sales/<location>
-- source = 'storage' → object in the private sale-materials bucket
-- source = 'url'     → external link (e.g. a Google Drive folder)
create table if not exists public.sale_materials (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.sale_listings(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null default 'document'
    check (category in ('specification', 'brochure', 'photos', 'video', 'survey', 'document', 'other')),
  source text not null check (source in ('bundled', 'storage', 'url')),
  location text not null,
  file_name text not null,
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_sale_materials_listing on public.sale_materials(listing_id, sort_order);

-- ── 4. Download log (who took which materials) ───────────────
create table if not exists public.sale_download_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.sale_listings(id) on delete set null,
  listing_slug text not null,
  email text not null,
  is_broker boolean not null default false,
  company text,
  -- A broker can register their client with the download: the timestamped
  -- row is the record of who introduced whom (no "whose client" disputes).
  client_name text,
  materials jsonb not null default '[]',      -- [{id, title}] snapshot
  ip text,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists idx_sale_downloads_created on public.sale_download_requests(created_at desc);
create index if not exists idx_sale_downloads_email on public.sale_download_requests(lower(email));
create index if not exists idx_sale_downloads_listing on public.sale_download_requests(listing_slug, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.sale_listings enable row level security;
alter table public.sale_media enable row level security;
alter table public.sale_materials enable row level security;
alter table public.sale_download_requests enable row level security;

drop policy if exists "Public can view live sale listings" on public.sale_listings;
create policy "Public can view live sale listings" on public.sale_listings
  for select using (status <> 'draft');

drop policy if exists "Public can view live sale media" on public.sale_media;
create policy "Public can view live sale media" on public.sale_media
  for select using (
    exists (
      select 1 from public.sale_listings l
      where l.id = listing_id and l.status <> 'draft'
    )
  );

-- sale_materials: intentionally NO public policy. Material locations are
-- what the email gate protects, so they are only read server-side through
-- the service-role client (src/lib/supabase/admin.ts).
-- sale_download_requests hold buyer/broker emails — admins only.
drop policy if exists "Admins can view sale downloads" on public.sale_download_requests;
create policy "Admins can view sale downloads" on public.sale_download_requests
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE
-- ============================================================
-- Public: photos/videos displayed on listing pages (indexable).
-- file_size_limit NULL = the project's global upload limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sale-media', 'sale-media', true, null,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do nothing;

-- Private: brochures, spec sheets, surveys, hi-res packs. Only reachable
-- through short-lived signed URLs issued after the email gate.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sale-materials', 'sale-materials', false, null, null)
on conflict (id) do nothing;

drop policy if exists "Public can view sale media files" on storage.objects;
create policy "Public can view sale media files"
  on storage.objects for select
  using (bucket_id = 'sale-media');

-- ============================================================
-- SEED: VanDutch 40 "Van Dutch Connect" (from the technical specification)
-- ============================================================
insert into public.sale_listings (
  slug, status, fleet_yacht_slug, name, builder, model, year_built, refit_year,
  length_m, beam_m, draft_m, guests, cabins, engines, top_speed_kn, lying, flag,
  price_amount, headline, summary, description, highlights, features,
  spec_sections, faq, seo_title, seo_description, keywords, broker_terms, sort_order, published_at
) values (
  'vandutch-40-van-dutch-connect',
  'published',
  'vd-40',
  'Van Dutch Connect',
  'VanDutch',
  'VanDutch 40',
  2010, 2025,
  12.00, 3.50, 0.95,
  10, 1,
  '2 × Yanmar 6LY3-STP, 430 hp each',
  30,
  'Dubai Harbour, UAE',
  'United Arab Emirates',
  null,
  $$2010 VanDutch 40 · 2025 refit · twin Yanmar 430 hp · lying Dubai Harbour$$,
  $$VanDutch 40 "Van Dutch Connect" for sale in Dubai: 2010 build, full 2025 refit, twin Yanmar 6LY3-STP (430 hp each), ~1,800 engine hours, 10 guests, UAE-flagged. Sold direct by the owner-operator.$$,
  $$Van Dutch Connect is a 2010 VanDutch 40 — the 12-metre open day cruiser whose low, straight-lined profile made the VanDutch name — offered for sale directly by her owner-operator, Imperial Yachting. She completed a refit in 2025 and lies at Dubai Harbour, UAE-flagged and registered in Dubai, ready to view and sea-trial.

Power comes from twin Yanmar 6LY3-STP diesels rated at 430 hp each, for a top speed of around 30 knots. Recorded engine hours are moderate for her age — about 1,800 h port and 1,850 h starboard — and the full service history is available to serious buyers.

On deck: walk-around side decks, a large aft sun pad, foredeck lounging and a swim platform, plus a 3 kW sound system with Wi-Fi and AirPlay. Below: an air-conditioned cabin with a double berth, electric WC and freshwater shower. Rated for up to 10 guests.$$,
  array[
    'Fresh 2025 refit — turnkey condition',
    'Moderate engine hours (~1,800 h)',
    'Single professional owner-operator',
    'Full service history on request',
    'UAE-flagged, registered in Dubai',
    'Lying Dubai Harbour — ready to view'
  ],
  array[
    '3 kW concert-grade sound system',
    'Wi-Fi + AirPlay streaming',
    'Air-conditioned cabin',
    'Freshwater shower + electric WC',
    'Walk-around side decks',
    'Large aft sun pad + foredeck lounging',
    'Swim platform'
  ],
  $$[
    {"title": "Identity & registration", "items": [
      {"label": "Builder", "value": "VanDutch"},
      {"label": "Model", "value": "VanDutch 40"},
      {"label": "Type", "value": "Motor yacht (open day cruiser)"},
      {"label": "Year built", "value": "2010"},
      {"label": "Refit", "value": "2025"},
      {"label": "Flag", "value": "United Arab Emirates"},
      {"label": "Port of registry", "value": "Dubai"},
      {"label": "Lying", "value": "Dubai Harbour"}
    ]},
    {"title": "Dimensions & hull", "items": [
      {"label": "Length overall", "value": "12.00 m (39 ft 4 in)"},
      {"label": "Beam", "value": "3.50 m"},
      {"label": "Draft", "value": "0.95 m"},
      {"label": "Gross tonnage", "value": "8.10 GT"},
      {"label": "Hull material", "value": "GRP (fibreglass)"},
      {"label": "Fuel", "value": "900 L"},
      {"label": "Fresh water", "value": "200 L"}
    ]},
    {"title": "Machinery & performance", "items": [
      {"label": "Engines", "value": "2 × Yanmar 6LY3-STP"},
      {"label": "Rated power", "value": "430 hp each"},
      {"label": "Engine hours", "value": "1,800 h port / 1,850 h stbd"},
      {"label": "Fuel type", "value": "Diesel"},
      {"label": "Top speed", "value": "~30 knots"}
    ]},
    {"title": "Accommodation", "items": [
      {"label": "Guests (max on board)", "value": "10"},
      {"label": "Cabins", "value": "1"},
      {"label": "Berths", "value": "2"},
      {"label": "Heads", "value": "1 · electric WC + shower"},
      {"label": "Air conditioning", "value": "Yes · cabin"}
    ]}
  ]$$::jsonb,
  $$[
    {"question": "What is the asking price of the VanDutch 40 Van Dutch Connect?",
     "answer": "The price is on application. Contact Imperial Yachting by WhatsApp or email for the current asking price and terms; brokers are welcome."},
    {"question": "Where is the yacht and can I view her?",
     "answer": "She lies at Dubai Harbour, UAE. Viewings are by appointment, and a sea trial can be arranged for serious buyers."},
    {"question": "What engines does she have and how many hours?",
     "answer": "Twin Yanmar 6LY3-STP diesels rated at 430 hp each, with about 1,800 hours on the port engine and 1,850 hours on the starboard engine. The full service history is available on request."},
    {"question": "Has the yacht been refitted?",
     "answer": "Yes. She was built in 2010 and completed a refit in 2025."},
    {"question": "Is co-brokerage possible?",
     "answer": "Yes. Brokers can download the full material pack from the listing page and contact Imperial Yachting directly to register a client."}
  ]$$::jsonb,
  $$VanDutch 40 for Sale in Dubai — "Van Dutch Connect" (2010, refit 2025)$$,
  $$2010 VanDutch 40 for sale in Dubai, refit 2025. Twin Yanmar 430 hp, ~1,800 h, 10 guests, UAE flag, lying Dubai Harbour. Specs, photos and brochure download.$$,
  array['VanDutch 40 for sale', 'Van Dutch 40 for sale Dubai', 'used VanDutch for sale UAE', 'day cruiser for sale Dubai', 'yacht for sale Dubai Harbour'],
  $$Co-brokerage welcome. Register your client when you download the materials — the timestamp is your record of introduction. Commission terms confirmed in writing on request.$$,
  10,
  now()
)
on conflict (slug) do nothing;

insert into public.sale_materials (listing_id, title, description, category, source, location, file_name, mime_type, size_bytes, sort_order)
select l.id,
  'Technical specification (PDF)',
  'Full particulars: identity, dimensions, machinery, accommodation, equipment and sale terms. 4 pages.',
  'specification', 'bundled',
  'van-dutch-connect/technical-specification.pdf',
  'VanDutch-40-Van-Dutch-Connect-Technical-Specification.pdf',
  'application/pdf', 1122467, 10
from public.sale_listings l
where l.slug = 'vandutch-40-van-dutch-connect'
  and not exists (
    select 1 from public.sale_materials m
    where m.listing_id = l.id and m.location = 'van-dutch-connect/technical-specification.pdf'
  );

-- ============================================================
-- SEED: Monte Carlo 6 "Moneta"
-- Year, length, guests, cabins, specs, photos and videos are pulled from
-- the charter-fleet record (fleet_yacht_slug = 'monte-carlo-6'). Add a spec
-- sheet / brochure later through the admin MCP (sales_add_material).
-- ============================================================
insert into public.sale_listings (
  slug, status, fleet_yacht_slug, name, builder, model, lying, flag,
  price_amount, headline, summary, description, highlights, faq,
  seo_title, seo_description, keywords, broker_terms, sort_order, published_at
) values (
  'monte-carlo-6-moneta',
  'published',
  'monte-carlo-6',
  'Moneta',
  'Monte Carlo Yachts',
  'Monte Carlo 6',
  'Dubai Harbour, UAE',
  'United Arab Emirates',
  null,
  $$60 ft Italian flybridge · 3 cabins · lying Dubai Harbour$$,
  $$Monte Carlo 6 "Moneta" for sale in Dubai: 60 ft Italian flybridge motor yacht from Monte Carlo Yachts, three cabins, lying Dubai Harbour. Sold direct by the owner-operator.$$,
  $$Moneta is a Monte Carlo 6 — the 60-foot flybridge motor yacht from Italian builder Monte Carlo Yachts — offered for sale directly by her owner-operator, Imperial Yachting. She is the flagship of our Dubai fleet, maintained by a professional crew and lying at Dubai Harbour, ready to view and sea-trial.

The Monte Carlo 6 pairs Italian exterior styling with a genuine three-cabin layout and a large flybridge, which makes her equally suited to private ownership, family cruising and charter. Full specifications, service records and photo pack are available to buyers and brokers.$$,
  array[
    'Three-cabin 60 ft flybridge',
    'Single professional owner-operator',
    'Service history on request',
    'UAE-flagged, lying Dubai Harbour',
    'Ready to view and sea-trial'
  ],
  $$[
    {"question": "What is the asking price of the Monte Carlo 6 Moneta?",
     "answer": "The price is on application. Contact Imperial Yachting by WhatsApp or email for the current asking price and terms; brokers are welcome."},
    {"question": "Where is the yacht and can I view her?",
     "answer": "She lies at Dubai Harbour, UAE. Viewings are by appointment, and a sea trial can be arranged for serious buyers."},
    {"question": "Is co-brokerage possible?",
     "answer": "Yes. Brokers can download the full material pack from the listing page and contact Imperial Yachting directly to register a client."}
  ]$$::jsonb,
  $$Monte Carlo 6 for Sale in Dubai — "Moneta", 60 ft Flybridge$$,
  $$Monte Carlo 6 "Moneta" for sale in Dubai: 60 ft Italian flybridge motor yacht, 3 cabins, lying Dubai Harbour. Specs, photos and material pack download.$$,
  array['Monte Carlo 6 for sale', 'Monte Carlo Yachts for sale Dubai', '60 ft flybridge for sale Dubai', 'motor yacht for sale Dubai', 'yacht for sale UAE'],
  $$Co-brokerage welcome. Register your client when you download the materials — the timestamp is your record of introduction. Commission terms confirmed in writing on request.$$,
  20,
  now()
)
on conflict (slug) do nothing;
