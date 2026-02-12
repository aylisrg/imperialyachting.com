-- ============================================================
-- Migration: Add hourly pricing columns + Destinations table
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add hourly pricing columns to yacht_pricing
ALTER TABLE public.yacht_pricing ADD COLUMN IF NOT EXISTS hourly int;
ALTER TABLE public.yacht_pricing ADD COLUMN IF NOT EXISTS hourly_b2b int;

-- 2. Create destinations table
CREATE TABLE IF NOT EXISTS public.destinations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  sailing_time text NOT NULL DEFAULT '',
  best_for text[] NOT NULL DEFAULT '{}',
  image text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_destinations_slug ON public.destinations(slug);

CREATE TRIGGER on_destinations_updated
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view destinations" ON public.destinations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage destinations" ON public.destinations
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. Storage bucket for destination photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'destination-photos',
  'destination-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view destination photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'destination-photos');

CREATE POLICY "Admins can upload destination photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'destination-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update destination photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'destination-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete destination photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'destination-photos' AND auth.role() = 'authenticated');
