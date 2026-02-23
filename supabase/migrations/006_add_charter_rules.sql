-- ============================================================
-- Migration 006: Add daily and weekly charter rules to yachts
-- These text fields describe conditions included in daily
-- or weekly charter packages, displayed below Charter Rates.
-- ============================================================

alter table public.yachts
  add column if not exists daily_rules text not null default '',
  add column if not exists weekly_rules text not null default '';
