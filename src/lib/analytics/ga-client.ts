import type { GACollectedData, GAMetricsResponse, GAPageData, GAEventData, GATrafficData } from "./types";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GA_API_BASE = "https://analyticsdata.googleapis.com/v1beta";

/**
 * Exchanges a refresh token for a short-lived access token.
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.GA_CLIENT_ID;
  const clientSecret = process.env.GA_CLIENT_SECRET;
  const refreshToken = process.env.GA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "GA OAuth2 credentials not configured. Set GA_CLIENT_ID, GA_CLIENT_SECRET, and GA_REFRESH_TOKEN.",
    );
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to refresh GA access token: ${response.status} — ${body}`);
  }

  const data = await response.json();
  return data.access_token;
}

function getPropertyId(): string {
  const id = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  if (!id) throw new Error("GOOGLE_ANALYTICS_PROPERTY_ID is not set");
  return id;
}

/* ── GA Data API v1 REST caller ───────────────────────────────── */

interface GARunReportRequest {
  dateRanges: { startDate: string; endDate: string }[];
  metrics: { name: string }[];
  dimensions?: { name: string }[];
  orderBys?: { metric: { metricName: string }; desc: boolean }[];
  limit?: number;
}

interface GAMetricValue {
  value?: string;
}

interface GADimensionValue {
  value?: string;
}

interface GARow {
  metricValues?: GAMetricValue[];
  dimensionValues?: GADimensionValue[];
}

interface GARunReportResponse {
  rows?: GARow[];
}

async function runReport(
  accessToken: string,
  property: string,
  request: GARunReportRequest,
): Promise<GARunReportResponse> {
  const url = `${GA_API_BASE}/${property}:runReport`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GA Data API error: ${response.status} — ${body}`);
  }

  return response.json();
}

/**
 * Fetches a full weekly snapshot from GA4 Data API via OAuth2.
 */
export async function fetchWeeklyData(
  startDate: string,
  endDate: string,
): Promise<GACollectedData> {
  const accessToken = await getAccessToken();
  const property = `properties/${getPropertyId()}`;

  const [overview, pages, events, traffic, devices, countries] =
    await Promise.all([
      fetchOverview(accessToken, property, startDate, endDate),
      fetchPageData(accessToken, property, startDate, endDate),
      fetchEventData(accessToken, property, startDate, endDate),
      fetchTrafficData(accessToken, property, startDate, endDate),
      fetchDeviceSplit(accessToken, property, startDate, endDate),
      fetchCountrySplit(accessToken, property, startDate, endDate),
    ]);

  return { overview, pages, events, traffic, device_split: devices, country_split: countries };
}

/* ── Individual queries ───────────────────────────────────────── */

async function fetchOverview(
  token: string,
  property: string,
  startDate: string,
  endDate: string,
): Promise<GAMetricsResponse> {
  const response = await runReport(token, property, {
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "newUsers" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
      { name: "screenPageViews" },
    ],
  });

  const values = response.rows?.[0]?.metricValues ?? [];
  return {
    sessions: Number(values[0]?.value ?? 0),
    totalUsers: Number(values[1]?.value ?? 0),
    newUsers: Number(values[2]?.value ?? 0),
    bounceRate: Number(values[3]?.value ?? 0),
    averageSessionDuration: Number(values[4]?.value ?? 0),
    screenPageViews: Number(values[5]?.value ?? 0),
  };
}

async function fetchPageData(
  token: string,
  property: string,
  startDate: string,
  endDate: string,
): Promise<GAPageData[]> {
  const response = await runReport(token, property, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
    ],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 20,
  });

  return (response.rows ?? []).map((row) => ({
    pagePath: row.dimensionValues?.[0]?.value ?? "",
    screenPageViews: Number(row.metricValues?.[0]?.value ?? 0),
    bounceRate: Number(row.metricValues?.[1]?.value ?? 0),
    averageSessionDuration: Number(row.metricValues?.[2]?.value ?? 0),
  }));
}

async function fetchEventData(
  token: string,
  property: string,
  startDate: string,
  endDate: string,
): Promise<GAEventData[]> {
  const response = await runReport(token, property, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 50,
  });

  return (response.rows ?? []).map((row) => ({
    eventName: row.dimensionValues?.[0]?.value ?? "",
    eventCount: Number(row.metricValues?.[0]?.value ?? 0),
  }));
}

async function fetchTrafficData(
  token: string,
  property: string,
  startDate: string,
  endDate: string,
): Promise<GATrafficData[]> {
  const response = await runReport(token, property, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 20,
  });

  return (response.rows ?? []).map((row) => ({
    sessionSource: row.dimensionValues?.[0]?.value ?? "",
    sessionMedium: row.dimensionValues?.[1]?.value ?? "",
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
  }));
}

async function fetchDeviceSplit(
  token: string,
  property: string,
  startDate: string,
  endDate: string,
): Promise<{ category: string; sessions: number }[]> {
  const response = await runReport(token, property, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "deviceCategory" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });

  return (response.rows ?? []).map((row) => ({
    category: row.dimensionValues?.[0]?.value ?? "",
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
  }));
}

async function fetchCountrySplit(
  token: string,
  property: string,
  startDate: string,
  endDate: string,
): Promise<{ country: string; sessions: number }[]> {
  const response = await runReport(token, property, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "country" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 15,
  });

  return (response.rows ?? []).map((row) => ({
    country: row.dimensionValues?.[0]?.value ?? "",
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
  }));
}
