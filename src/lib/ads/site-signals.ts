import { getClient, getPropertyId } from "@/lib/analytics/ga-client";
import type { SiteSignals } from "./types";

/**
 * GA4 source values Meta traffic arrives under. Ads tagged through Meta's own
 * URL builder land as `facebook`/`instagram`; untagged clicks arrive as
 * referrals from `l.facebook.com`, `m.facebook.com`, `lm.instagram.com` etc.
 * Audience Network shows up as the bare `an`.
 */
const META_SOURCE_PATTERNS = ["facebook", "instagram", "fb", "ig", "an", "meta"];

/** Campaign values GA4 uses when no utm_campaign was present. */
const EMPTY_CAMPAIGN_VALUES = new Set([
  "(not set)",
  "(direct)",
  "(organic)",
  "(referral)",
  "(none)",
  "",
]);

const CONVERSION_EVENTS = {
  whatsapp: "click_whatsapp",
  contact: "click_contact",
  inquiry: "submit_inquiry",
} as const;

/**
 * Whether a GA4 `sessionSource` value is Meta traffic.
 * Matches whole tokens so that `an` does not swallow every source containing
 * those two letters (e.g. `analytics-vendor.com`).
 */
export function isMetaSource(source: string): boolean {
  const normalized = source.toLowerCase();
  return META_SOURCE_PATTERNS.some(
    (pattern) =>
      normalized === pattern ||
      normalized.split(/[.\-_/]/).includes(pattern),
  );
}

export function hasUtmCampaign(campaign: string): boolean {
  return !EMPTY_CAMPAIGN_VALUES.has(campaign.trim().toLowerCase());
}

/**
 * Pulls the site side of the funnel for Meta traffic on a given day.
 *
 * Meta reports link clicks; it cannot see that someone then opened WhatsApp.
 * Filtering happens in TypeScript rather than in a GA dimension filter so the
 * matching rules stay testable and easy to extend.
 */
export async function fetchPaidSocialSignals(
  startDate: string,
  endDate: string,
): Promise<SiteSignals> {
  const client = getClient();
  const property = `properties/${getPropertyId()}`;

  const [trafficResponse, eventResponse, campaignResponse] = await Promise.all([
    client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 100,
    }),
    client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }, { name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      limit: 500,
    }),
    client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }, { name: "sessionCampaignName" }],
      metrics: [{ name: "sessions" }],
      limit: 100,
    }),
  ]);

  const paidSocialSessions = (trafficResponse[0].rows ?? [])
    .filter((row) => isMetaSource(row.dimensionValues?.[0]?.value ?? ""))
    .reduce((sum, row) => sum + Number(row.metricValues?.[0]?.value ?? 0), 0);

  const eventCounts = new Map<string, number>();
  for (const row of eventResponse[0].rows ?? []) {
    const source = row.dimensionValues?.[0]?.value ?? "";
    if (!isMetaSource(source)) continue;
    const eventName = row.dimensionValues?.[1]?.value ?? "";
    const count = Number(row.metricValues?.[0]?.value ?? 0);
    eventCounts.set(eventName, (eventCounts.get(eventName) ?? 0) + count);
  }

  const utmTaggingDetected = (campaignResponse[0].rows ?? []).some(
    (row) =>
      isMetaSource(row.dimensionValues?.[0]?.value ?? "") &&
      hasUtmCampaign(row.dimensionValues?.[1]?.value ?? ""),
  );

  return {
    paid_social_sessions: paidSocialSessions,
    whatsapp_clicks: eventCounts.get(CONVERSION_EVENTS.whatsapp) ?? 0,
    contact_clicks: eventCounts.get(CONVERSION_EVENTS.contact) ?? 0,
    inquiry_submissions: eventCounts.get(CONVERSION_EVENTS.inquiry) ?? 0,
    utm_tagging_detected: utmTaggingDetected,
  };
}
