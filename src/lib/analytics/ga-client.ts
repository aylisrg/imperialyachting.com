import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { GACollectedData, GAMetricsResponse, GAPageData, GAEventData, GATrafficData } from "./types";

function getClient() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set");

  const credentials = JSON.parse(
    Buffer.from(keyJson, "base64").toString("utf-8"),
  );

  return new BetaAnalyticsDataClient({ credentials });
}

function getPropertyId() {
  const id = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  if (!id) throw new Error("GOOGLE_ANALYTICS_PROPERTY_ID is not set");
  return id;
}

/**
 * Fetches a full weekly snapshot from GA4 Data API.
 */
export async function fetchWeeklyData(
  startDate: string,
  endDate: string,
): Promise<GACollectedData> {
  const client = getClient();
  const property = `properties/${getPropertyId()}`;

  const [overview, pages, events, traffic, devices, countries] =
    await Promise.all([
      fetchOverview(client, property, startDate, endDate),
      fetchPageData(client, property, startDate, endDate),
      fetchEventData(client, property, startDate, endDate),
      fetchTrafficData(client, property, startDate, endDate),
      fetchDeviceSplit(client, property, startDate, endDate),
      fetchCountrySplit(client, property, startDate, endDate),
    ]);

  return {
    overview,
    pages,
    events,
    traffic,
    device_split: devices,
    country_split: countries,
  };
}

/* ── Individual queries ───────────────────────────────────────── */

async function fetchOverview(
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string,
): Promise<GAMetricsResponse> {
  const [response] = await client.runReport({
    property,
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
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string,
): Promise<GAPageData[]> {
  const [response] = await client.runReport({
    property,
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
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string,
): Promise<GAEventData[]> {
  const [response] = await client.runReport({
    property,
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
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string,
): Promise<GATrafficData[]> {
  const [response] = await client.runReport({
    property,
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
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string,
): Promise<{ category: string; sessions: number }[]> {
  const [response] = await client.runReport({
    property,
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
  client: BetaAnalyticsDataClient,
  property: string,
  startDate: string,
  endDate: string,
): Promise<{ country: string; sessions: number }[]> {
  const [response] = await client.runReport({
    property,
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
