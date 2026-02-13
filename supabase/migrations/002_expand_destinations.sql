-- ============================================================
-- Migration: Expand destinations table for rich experience pages
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add new columns (all nullable/defaulted — no breaking changes)
ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'destination',
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS price_from integer,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS map_label text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS what_included text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS itinerary text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS gallery_images text[] NOT NULL DEFAULT '{}';

-- 2. Migrate existing image values to cover_image
UPDATE public.destinations
SET cover_image = image
WHERE image IS NOT NULL AND image != '' AND cover_image IS NULL;

-- 3. Add check constraint for category values
ALTER TABLE public.destinations
  ADD CONSTRAINT destinations_category_check
  CHECK (category IN ('destination', 'experience', 'activity'));

-- 4. Add indexes for filtering and lookups
CREATE INDEX IF NOT EXISTS idx_destinations_category ON public.destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON public.destinations(featured);
