import { google } from "googleapis";

/**
 * Google Calendar integration for yacht charter bookings.
 *
 * Auth: service account JWT, same base64-encoded-JSON-key convention as
 * src/lib/analytics/ga-client.ts. Prefers a dedicated calendar key but
 * falls back to the shared Google service account key so a single
 * service account can be reused across GA + Calendar if desired.
 */

const CALENDAR_SCOPES = ["https://www.googleapis.com/auth/calendar"];

export interface Interval {
  start: Date;
  end: Date;
}

export interface BusyResult {
  busy: Interval[];
  source: "google" | "unavailable";
}

export interface CreateCharterEventInput {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendeesEmail?: string;
}

function getServiceAccountKeyJson(): string | null {
  return (
    process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
    null
  );
}

/** True when a service account key is available for Calendar auth. */
export function isCalendarConfigured(): boolean {
  return Boolean(getServiceAccountKeyJson());
}

/**
 * Builds a service-account JWT client authorized for the Calendar API.
 * Returns null (never throws) when no key is configured.
 */
export function getCalendarAuth(): InstanceType<typeof google.auth.JWT> | null {
  const keyJson = getServiceAccountKeyJson();
  if (!keyJson) return null;

  try {
    const credentials = JSON.parse(Buffer.from(keyJson, "base64").toString("utf-8"));

    return new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: CALENDAR_SCOPES,
    });
  } catch (err) {
    console.error("[calendar] failed to parse service account key:", err);
    return null;
  }
}

function getCalendarClient() {
  const auth = getCalendarAuth();
  if (!auth) return null;
  return google.calendar({ version: "v3", auth });
}

/* ── In-memory freebusy cache (60s TTL, keyed by calendarId + day) ───── */

interface CacheEntry {
  expiresAt: number;
  result: BusyResult;
}

const busyCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

function cacheKey(calendarId: string, timeMin: Date, timeMax: Date): string {
  const day = timeMin.toISOString().slice(0, 10);
  return `${calendarId}:${day}:${timeMin.getTime()}:${timeMax.getTime()}`;
}

/**
 * Fetches busy intervals for a calendar via freebusy.query. Never throws:
 * on missing config or API failure it logs and returns
 * `{ busy: [], source: "unavailable" }` so callers can decide how to treat
 * an unreachable calendar.
 */
export async function getBusyIntervals(
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<BusyResult> {
  const key = cacheKey(calendarId, timeMin, timeMax);
  const cached = busyCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const calendar = getCalendarClient();
  if (!calendar) {
    console.warn("[calendar] not configured; skipping freebusy check for", calendarId);
    return { busy: [], source: "unavailable" };
  }

  try {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    const rawBusy = response.data.calendars?.[calendarId]?.busy ?? [];
    const busy: Interval[] = rawBusy
      .filter((b) => b.start && b.end)
      .map((b) => ({ start: new Date(b.start as string), end: new Date(b.end as string) }));

    const result: BusyResult = { busy, source: "google" };
    busyCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, result });
    return result;
  } catch (err) {
    console.error("[calendar] freebusy.query failed for", calendarId, err);
    return { busy: [], source: "unavailable" };
  }
}

/**
 * Creates a charter event on the yacht's calendar. Returns the created
 * event's id, or null if not configured or the API call fails. Never
 * throws to callers.
 */
export async function createCharterEvent(
  calendarId: string,
  input: CreateCharterEventInput
): Promise<string | null> {
  const calendar = getCalendarClient();
  if (!calendar) {
    console.warn("[calendar] not configured; skipping event creation for", calendarId);
    return null;
  }

  try {
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.start.toISOString(), timeZone: "Asia/Dubai" },
        end: { dateTime: input.end.toISOString(), timeZone: "Asia/Dubai" },
        attendees: input.attendeesEmail ? [{ email: input.attendeesEmail }] : undefined,
      },
    });

    return response.data.id ?? null;
  } catch (err) {
    console.error("[calendar] events.insert failed for", calendarId, err);
    return null;
  }
}

/**
 * Deletes a charter event from the yacht's calendar. Never throws to
 * callers; logs and returns false on failure.
 */
export async function deleteCharterEvent(
  calendarId: string,
  eventId: string
): Promise<boolean> {
  const calendar = getCalendarClient();
  if (!calendar) {
    console.warn("[calendar] not configured; skipping event deletion for", calendarId);
    return false;
  }

  try {
    await calendar.events.delete({ calendarId, eventId });
    return true;
  } catch (err) {
    console.error("[calendar] events.delete failed for", calendarId, eventId, err);
    return false;
  }
}

/** Clears the in-memory freebusy cache. Intended for tests. */
export function __clearBusyCacheForTests(): void {
  busyCache.clear();
}
