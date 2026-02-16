-- ============================================================
-- Migration 004: Seed initial yacht data
-- Ensures the DB always has yacht data after migrations.
-- Idempotent — uses ON CONFLICT / NOT EXISTS guards.
-- ============================================================

-- Moneta (Monte Carlo 6)
INSERT INTO public.yachts (slug, name, tagline, description, builder, year, refit, length_ft, length_m, capacity, cabins, location, featured)
VALUES (
  'monte-carlo-6',
  'Moneta',
  '60ft of Pure Italian Elegance',
  'Moneta is the flagship of our fleet — a 60-foot Italian masterpiece by Monte Carlo Yachts, designed for those who demand the very best. With a 2023 refit, this vessel combines breathtaking design with cutting-edge technology. The Seakeeper gyroscopic stabilizer ensures a smooth ride even in choppy waters, while the twin Cummins 600hp engines deliver effortless performance.',
  'Monte Carlo Yachts', 2016, 2023, 60, 18, 18, 3, 'Dubai Harbour', true
) ON CONFLICT (slug) DO NOTHING;

-- Van Dutch 40
INSERT INTO public.yachts (slug, name, tagline, description, builder, year, refit, length_ft, length_m, capacity, cabins, location, featured)
VALUES (
  'vd-40',
  'Van Dutch 40',
  'Iconic Dutch Design, Dubai Style',
  'The Van Dutch 40 is an iconic day cruiser that turns heads wherever she goes. Originally built in 2010 and freshly refitted in 2024, this 40-foot Dutch masterpiece is the ultimate vessel for stylish day charters.',
  'Van Dutch', 2010, 2024, 40, 12, 10, 1, 'Dubai Harbour, Berth BD2', true
) ON CONFLICT (slug) DO NOTHING;

-- Specs for Moneta
INSERT INTO public.yacht_specs (yacht_id, label, value, sort_order)
SELECT y.id, s.label, s.value, s.sort_order
FROM public.yachts y
CROSS JOIN (VALUES
  ('Length', '60 ft / 18 m', 1),
  ('Builder', 'Monte Carlo Yachts', 2),
  ('Year / Refit', '2016 / 2023', 3),
  ('Guests', '18', 4),
  ('Cabins', '3', 5),
  ('Engines', 'Twin Cummins 600 HP', 6),
  ('Stabilizer', 'Seakeeper Gyroscopic', 7)
) AS s(label, value, sort_order)
WHERE y.slug = 'monte-carlo-6'
  AND NOT EXISTS (SELECT 1 FROM public.yacht_specs WHERE yacht_id = y.id);

-- Specs for Van Dutch 40
INSERT INTO public.yacht_specs (yacht_id, label, value, sort_order)
SELECT y.id, s.label, s.value, s.sort_order
FROM public.yachts y
CROSS JOIN (VALUES
  ('Length', '40 ft / 12 m', 1),
  ('Builder', 'Van Dutch', 2),
  ('Year / Refit', '2010 / 2024', 3),
  ('Guests', '10', 4),
  ('Cabin', '1 (Air-Conditioned)', 5)
) AS s(label, value, sort_order)
WHERE y.slug = 'vd-40'
  AND NOT EXISTS (SELECT 1 FROM public.yacht_specs WHERE yacht_id = y.id);

-- Amenities for Moneta
INSERT INTO public.yacht_amenities (yacht_id, icon, label, sort_order)
SELECT y.id, a.icon, a.label, a.sort_order
FROM public.yachts y
CROSS JOIN (VALUES
  ('wifi', 'WiFi', 1),
  ('speaker', 'Bose 5.1 Sound', 2),
  ('utensils', 'Full Galley & Grill', 3),
  ('waves', 'E-Foil', 4),
  ('shield', 'Seakeeper Stabilizer', 5),
  ('sun', 'Flybridge & Sundeck', 6),
  ('anchor', 'Dubai Harbour Berth', 7)
) AS a(icon, label, sort_order)
WHERE y.slug = 'monte-carlo-6'
  AND NOT EXISTS (SELECT 1 FROM public.yacht_amenities WHERE yacht_id = y.id);

-- Amenities for Van Dutch 40
INSERT INTO public.yacht_amenities (yacht_id, icon, label, sort_order)
SELECT y.id, a.icon, a.label, a.sort_order
FROM public.yachts y
CROSS JOIN (VALUES
  ('wifi', 'WiFi', 1),
  ('speaker', '3kW Sound + AirPlay', 2),
  ('snowflake', 'Air Conditioning', 3),
  ('sun', 'Large Sun Pad', 4),
  ('waves', 'Swim Platform', 5),
  ('anchor', 'Dubai Harbour Berth', 6)
) AS a(icon, label, sort_order)
WHERE y.slug = 'vd-40'
  AND NOT EXISTS (SELECT 1 FROM public.yacht_amenities WHERE yacht_id = y.id);

-- Pricing for Moneta
INSERT INTO public.yacht_pricing (yacht_id, season, period, hourly, daily, weekly, monthly, sort_order)
SELECT y.id, p.season, p.period, p.hourly, p.daily, p.weekly, p.monthly, p.sort_order
FROM public.yachts y
CROSS JOIN (VALUES
  ('Regular Season', 'October — April', NULL::int, 18000, 75000, 250000, 1),
  ('Shoulder Season', 'May & September', NULL, 15000, 60000, 200000, 2),
  ('Low Season', 'June — August', NULL, NULL, NULL, 160000, 3),
  ('Super Season', 'December', NULL, 20000, 90000, 280000, 4)
) AS p(season, period, hourly, daily, weekly, monthly, sort_order)
WHERE y.slug = 'monte-carlo-6'
  AND NOT EXISTS (SELECT 1 FROM public.yacht_pricing WHERE yacht_id = y.id);

-- Pricing for Van Dutch 40
INSERT INTO public.yacht_pricing (yacht_id, season, period, hourly, daily, weekly, monthly, daily_b2b, weekly_b2b, monthly_b2b, sort_order)
SELECT y.id, p.season, p.period, p.hourly, p.daily, p.weekly, p.monthly, p.daily_b2b, p.weekly_b2b, p.monthly_b2b, p.sort_order
FROM public.yachts y
CROSS JOIN (VALUES
  ('Regular Season', 'October — April', NULL::int, 13000, 45000, 95000, 10000, 34000, 72000, 1),
  ('Shoulder Season', 'May & September', NULL, 12000, 18000, 75000, 9000, 14000, 57000, 2),
  ('Low Season', 'June — August', NULL, NULL, NULL, 45000, NULL, NULL, 25000, 3),
  ('Super Season', 'December', NULL, 15500, 38000, 110000, 13500, 32000, 95000, 4)
) AS p(season, period, hourly, daily, weekly, monthly, daily_b2b, weekly_b2b, monthly_b2b, sort_order)
WHERE y.slug = 'vd-40'
  AND NOT EXISTS (SELECT 1 FROM public.yacht_pricing WHERE yacht_id = y.id);

-- Included items for Moneta
INSERT INTO public.yacht_included (yacht_id, item, sort_order)
SELECT y.id, i.item, i.sort_order
FROM public.yachts y
CROSS JOIN (VALUES
  ('Professional Captain & Crew', 1),
  ('Fuel for standard cruising routes', 2),
  ('Fresh towels, ice & soft drinks', 3),
  ('Water sports equipment (E-Foil)', 4),
  ('BBQ grill & basic catering setup', 5),
  ('WiFi & Bose entertainment system', 6),
  ('Swimming & snorkeling gear', 7)
) AS i(item, sort_order)
WHERE y.slug = 'monte-carlo-6'
  AND NOT EXISTS (SELECT 1 FROM public.yacht_included WHERE yacht_id = y.id);

-- Included items for Van Dutch 40
INSERT INTO public.yacht_included (yacht_id, item, sort_order)
SELECT y.id, i.item, i.sort_order
FROM public.yachts y
CROSS JOIN (VALUES
  ('Professional Captain', 1),
  ('Fuel for standard routes', 2),
  ('Fresh towels & ice', 3),
  ('WiFi & premium sound system', 4),
  ('Swimming & snorkeling gear', 5)
) AS i(item, sort_order)
WHERE y.slug = 'vd-40'
  AND NOT EXISTS (SELECT 1 FROM public.yacht_included WHERE yacht_id = y.id);
