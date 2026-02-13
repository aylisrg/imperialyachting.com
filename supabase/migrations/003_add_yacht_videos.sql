-- ============================================================
-- Migration 003: Add YouTube video support to yachts
-- Adds shorts array, main video URL, and visibility toggle
-- ============================================================

alter table public.yachts
  add column if not exists youtube_shorts text[] not null default '{}',
  add column if not exists youtube_video text not null default '',
  add column if not exists show_videos boolean not null default false;
