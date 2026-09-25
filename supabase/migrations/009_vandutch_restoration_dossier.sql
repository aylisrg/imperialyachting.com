-- ============================================================
-- Migration 009: VanDutch 40 restoration dossier in the material pack
-- The PDF ships with the site in private/sales/van-dutch-connect/ and is
-- served only through signed links after the email gate. Idempotent.
-- ============================================================
insert into public.sale_materials (listing_id, title, description, category, source, location, file_name, mime_type, size_bytes, sort_order)
select l.id,
  'Restoration & refit dossier (PDF)',
  '28 documented works across 6 system groups, Dec 2023 – Jul 2024: propulsion, electrics, navigation, plumbing, hull. 7 pages.',
  'document', 'bundled',
  'van-dutch-connect/restoration-dossier-2023-2024.pdf',
  'VanDutch-40-Van-Dutch-Connect-Restoration-Dossier-2023-2024.pdf',
  'application/pdf', 578391, 20
from public.sale_listings l
where l.slug = 'vandutch-40-van-dutch-connect'
  and not exists (
    select 1 from public.sale_materials m
    where m.listing_id = l.id and m.location = 'van-dutch-connect/restoration-dossier-2023-2024.pdf'
  );
