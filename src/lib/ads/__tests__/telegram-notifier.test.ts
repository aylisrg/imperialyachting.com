import { describe, it, expect } from "vitest";
import { buildAdsTelegramMessage } from "../telegram-notifier";
import type { AdsRecommendation, AdsReport } from "../types";

const metrics = {
  spend: 120.5,
  impressions: 15400,
  reach: 11200,
  frequency: 1.38,
  clicks: 240,
  ctr: 1.56,
  cpc: 0.5,
  cpm: 7.82,
  results: 6,
  cost_per_result: 20.08,
};

function makeReport(overrides: Partial<AdsReport> = {}): AdsReport {
  return {
    id: "report-1",
    period_start: "2026-09-09",
    period_end: "2026-09-09",
    account_metrics: metrics,
    trends: {
      spend: { value: 120.5, previous_value: 100, change_percent: 20.5, direction: "up" },
      ctr: { value: 1.56, previous_value: 1.9, change_percent: -17.9, direction: "down" },
    },
    entities: [
      {
        level: "ad",
        id: "123",
        name: "Sunset charter — carousel",
        status: "ACTIVE",
        metrics,
        verdict: "scale",
        reasoning: "Cheapest cost per result in the account.",
      },
      {
        level: "campaign",
        id: "999",
        name: "Charter — Dubai",
        status: "ACTIVE",
        metrics,
        verdict: "keep",
        reasoning: "Stable.",
      },
    ],
    summary: "Spend up, CTR softening.",
    opportunity_score: 68,
    anomalies: [
      {
        entity_name: "Sunset charter — carousel",
        metric: "cpm",
        description: "CPM jumped 40% overnight",
        severity: "high",
      },
    ],
    benchmarks: [
      { metric: "ctr", our_value: 1.56, benchmark_value: 1.1, verdict: "above" },
    ],
    site_signals: {
      paid_social_sessions: 180,
      whatsapp_clicks: 9,
      contact_clicks: 3,
      inquiry_submissions: 1,
      utm_tagging_detected: true,
    },
    status: "complete",
    error_message: null,
    created_at: "2026-09-10T06:00:00.000Z",
    ...overrides,
  };
}

function makeRecommendation(
  overrides: Partial<AdsRecommendation> = {},
): AdsRecommendation {
  return {
    id: "rec-1",
    report_id: "report-1",
    title: "Raise budget on the carousel ad",
    entity_level: "ad",
    entity_id: "123",
    entity_name: "Sunset charter — carousel",
    problem: "It is delivery-capped at the current budget.",
    action: "Increase daily budget from 40 to 50 USD.",
    expected_impact: "~25% more results at a similar cost per result.",
    priority: "high",
    action_type: "budget",
    status: "new",
    notes: null,
    created_at: "2026-09-10T06:00:00.000Z",
    updated_at: "2026-09-10T06:00:00.000Z",
    ...overrides,
  };
}

describe("buildAdsTelegramMessage", () => {
  it("includes headline spend and delivery metrics", () => {
    const message = buildAdsTelegramMessage(makeReport(), []);
    expect(message).toContain("Daily Ads Report");
    expect(message).toContain("120.50 USD");
    expect(message).toContain("CTR: 1.56%");
    expect(message).toContain("Results: 6");
  });

  it("renders trend arrows with direction", () => {
    const message = buildAdsTelegramMessage(makeReport(), []);
    expect(message).toContain("+20.5% ↑");
    expect(message).toContain("-17.9% ↓");
  });

  it("uses the currency it is given", () => {
    const message = buildAdsTelegramMessage(makeReport(), [], "AED");
    expect(message).toContain("120.50 AED");
    expect(message).not.toContain("120.50 USD");
  });

  it("shows the GA4 side of the funnel", () => {
    const message = buildAdsTelegramMessage(makeReport(), []);
    expect(message).toContain("WhatsApp clicks: 9");
    expect(message).toContain("Enquiries: 1");
  });

  it("warns loudly when UTM tagging is missing", () => {
    const report = makeReport({
      site_signals: {
        paid_social_sessions: 180,
        whatsapp_clicks: 9,
        contact_clicks: 3,
        inquiry_submissions: 1,
        utm_tagging_detected: false,
      },
    });
    expect(buildAdsTelegramMessage(report, [])).toContain("No UTM tags detected");
  });

  it("lists anomalies and per-ad verdicts", () => {
    const message = buildAdsTelegramMessage(makeReport(), []);
    expect(message).toContain("CPM jumped 40% overnight");
    expect(message).toContain("Sunset charter — carousel");
  });

  it("lists only ad-level rows under per ad", () => {
    const message = buildAdsTelegramMessage(makeReport(), []);
    const perAdSection = message.split("*Per ad:*")[1] ?? "";
    expect(perAdSection).toContain("Sunset charter — carousel");
    expect(perAdSection.split("🔗")[0]).not.toContain("Charter — Dubai");
  });

  it("lists recommended actions", () => {
    const message = buildAdsTelegramMessage(makeReport(), [makeRecommendation()]);
    expect(message).toContain("Raise budget on the carousel ad");
    expect(message).toContain("Increase daily budget from 40 to 50 USD.");
  });

  it("omits optional sections when data is missing", () => {
    const report = makeReport({
      site_signals: null,
      opportunity_score: null,
      anomalies: [],
      entities: [],
      summary: null,
      trends: null,
    });
    const message = buildAdsTelegramMessage(report, []);
    expect(message).not.toContain("Opportunity Score");
    expect(message).not.toContain("On the site");
    expect(message).not.toContain("Anomalies");
    expect(message).toContain("120.50 USD");
  });

  it("omits cost per result when Meta reports none", () => {
    const report = makeReport({
      account_metrics: { ...metrics, cost_per_result: null },
    });
    expect(buildAdsTelegramMessage(report, [])).not.toContain("Cost per result");
  });
});
