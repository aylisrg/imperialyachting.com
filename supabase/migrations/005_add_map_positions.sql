-- ============================================================
-- Migration: Add map_x and map_y to destinations for draggable schematic map
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS map_x double precision,
  ADD COLUMN IF NOT EXISTS map_y double precision;
