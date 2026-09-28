-- ============================================================
-- Migration 010: one date standard for VanDutch 40 "Van Dutch Connect"
--   Built 2010 (per HIN NL-VDU40030G010: July 2010, model year 2010)
--   Refit 2023–2024 (per the restoration dossier: Dec 2023 – Jul 2024)
-- Short fields use 2024. Idempotent.
-- ============================================================

-- Charter-fleet record said 2011.
update public.yachts set year = 2010 where slug = 'vd-40' and year <> 2010;

-- Sale listing said "refit 2025".
update public.sale_listings
set
  refit_year = 2024,
  headline = replace(headline, '2025 refit', '2023–24 refit'),
  summary = replace(summary, 'full 2025 refit', 'full 2023–2024 refit'),
  description = replace(
    description,
    'She completed a refit in 2025',
    'She completed a full refit between December 2023 and July 2024 — 28 documented works across propulsion, electrics, navigation, plumbing and hull'
  ),
  highlights = array_replace(
    highlights,
    'Fresh 2025 refit — turnkey condition',
    'Full 2023–2024 refit — 28 documented works'
  ),
  spec_sections = replace(spec_sections::text, '"value": "2025"', '"value": "2023–2024"')::jsonb,
  faq = replace(
    faq::text,
    'She was built in 2010 and completed a refit in 2025.',
    'She was built in 2010 and completed a full refit between December 2023 and July 2024 (28 documented works). The restoration dossier is in the material pack.'
  )::jsonb,
  seo_title = replace(seo_title, 'refit 2025', 'refit 2023–24'),
  seo_description = replace(seo_description, 'refit 2025', 'refit 2023–24')
where slug = 'vandutch-40-van-dutch-connect';
