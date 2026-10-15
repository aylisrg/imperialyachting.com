-- ============================================================
-- Migration 011: Fix Moneta (Monte Carlo 6) fleet data
-- Production drifted from seed 004 (which uses ON CONFLICT DO NOTHING,
-- so it never corrects existing rows): capacity 15 -> 18,
-- builder 'Benetau' -> 'Monte Carlo Yachts'. Confirmed by owner.
-- Idempotent: safe to run any number of times; no-op once correct.
-- ============================================================

UPDATE public.yachts
SET capacity = 18
WHERE slug = 'monte-carlo-6'
  AND capacity IS DISTINCT FROM 18;

UPDATE public.yachts
SET builder = 'Monte Carlo Yachts'
WHERE slug = 'monte-carlo-6'
  AND builder IS DISTINCT FROM 'Monte Carlo Yachts';

-- Keep the spec rows shown on the yacht page in sync.
UPDATE public.yacht_specs s
SET value = '18'
FROM public.yachts y
WHERE s.yacht_id = y.id
  AND y.slug = 'monte-carlo-6'
  AND s.label = 'Guests'
  AND s.value IS DISTINCT FROM '18';

UPDATE public.yacht_specs s
SET value = 'Monte Carlo Yachts'
FROM public.yachts y
WHERE s.yacht_id = y.id
  AND y.slug = 'monte-carlo-6'
  AND s.label = 'Builder'
  AND s.value IS DISTINCT FROM 'Monte Carlo Yachts';
