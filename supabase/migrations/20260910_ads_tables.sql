-- Meta Ads daily analysis: reports & recommendations
-- Run this migration in Supabase SQL Editor

-- ── ads_reports ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ads_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  account_metrics JSONB NOT NULL DEFAULT '{}',
  trends JSONB,
  entities JSONB,
  summary TEXT,
  -- Meta's own optimization score (0-100) from ads_get_opportunity_score
  opportunity_score INTEGER
    CHECK (opportunity_score IS NULL OR (opportunity_score BETWEEN 0 AND 100)),
  anomalies JSONB,
  benchmarks JSONB,
  -- GA4 side of the funnel: Meta cannot see WhatsApp enquiries
  site_signals JSONB,
  status TEXT NOT NULL DEFAULT 'collecting'
    CHECK (status IN ('collecting', 'analyzing', 'complete', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ads_reports_period
  ON ads_reports (period_start DESC);
CREATE INDEX IF NOT EXISTS idx_ads_reports_status
  ON ads_reports (status);

-- One report per day; a re-run replaces rather than duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS idx_ads_reports_unique_day
  ON ads_reports (period_start, period_end);

-- ── ads_recommendations ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ads_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES ads_reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  entity_level TEXT NOT NULL DEFAULT 'account'
    CHECK (entity_level IN ('account', 'campaign', 'adset', 'ad')),
  entity_id TEXT,
  entity_name TEXT,
  problem TEXT NOT NULL,
  action TEXT NOT NULL,
  expected_impact TEXT,
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  action_type TEXT NOT NULL DEFAULT 'creative'
    CHECK (action_type IN ('budget', 'creative', 'targeting', 'bidding',
                           'landing_page', 'tracking', 'structure')),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'accepted', 'rejected', 'applied', 'tested')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ads_recommendations_report
  ON ads_recommendations (report_id);
CREATE INDEX IF NOT EXISTS idx_ads_recommendations_status
  ON ads_recommendations (status);
CREATE INDEX IF NOT EXISTS idx_ads_recommendations_priority
  ON ads_recommendations (priority);

-- ── RLS policies ─────────────────────────────────────────────────
ALTER TABLE ads_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on ads_reports"
  ON ads_reports FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on ads_recommendations"
  ON ads_recommendations FOR ALL
  USING (true)
  WITH CHECK (true);
