-- Tighten RLS on the analytics tables.
--
-- 20260224_analytics_tables.sql created these policies as
-- `FOR ALL USING (true)` without naming a role, so they also applied to
-- `anon` — the public anon key could read and write weekly reports and CRO
-- hypotheses. Restrict both to authenticated users; the pipeline routes write
-- with the service role, which bypasses RLS.

DROP POLICY IF EXISTS "Admin full access on analytics_reports" ON analytics_reports;
DROP POLICY IF EXISTS "Admin full access on analytics_hypotheses" ON analytics_hypotheses;

CREATE POLICY "Authenticated full access on analytics_reports"
  ON analytics_reports FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated full access on analytics_hypotheses"
  ON analytics_hypotheses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
