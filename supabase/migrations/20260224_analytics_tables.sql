-- Analytics Improvement System: Weekly reports & hypotheses
-- Run this migration in Supabase SQL Editor

-- ── analytics_reports ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  raw_metrics JSONB NOT NULL DEFAULT '{}',
  trends JSONB,
  summary TEXT,
  page_insights JSONB,
  traffic_analysis JSONB,
  quick_wins JSONB,
  status TEXT NOT NULL DEFAULT 'collecting'
    CHECK (status IN ('collecting', 'analyzing', 'complete', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick lookups by date and status
CREATE INDEX IF NOT EXISTS idx_analytics_reports_period
  ON analytics_reports (period_start DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_status
  ON analytics_reports (status);

-- ── analytics_hypotheses ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES analytics_reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  expected_impact TEXT,
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT NOT NULL DEFAULT 'ux'
    CHECK (category IN ('ux', 'content', 'technical', 'marketing')),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'accepted', 'rejected', 'implemented', 'tested')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for filtering hypotheses
CREATE INDEX IF NOT EXISTS idx_hypotheses_report
  ON analytics_hypotheses (report_id);
CREATE INDEX IF NOT EXISTS idx_hypotheses_status
  ON analytics_hypotheses (status);
CREATE INDEX IF NOT EXISTS idx_hypotheses_priority
  ON analytics_hypotheses (priority);

-- ── RLS policies ─────────────────────────────────────────────────
-- Enable RLS
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_hypotheses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admin) full access
CREATE POLICY "Admin full access on analytics_reports"
  ON analytics_reports FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on analytics_hypotheses"
  ON analytics_hypotheses FOR ALL
  USING (true)
  WITH CHECK (true);
