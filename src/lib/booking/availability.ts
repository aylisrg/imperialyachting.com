import { createAdminSupabase, isAdminSupabaseConfigured } from "@/lib/supabase/admin";
import { getBusyIntervals } from "@/lib/google/calendar";
import { OPERATING_HOURS, TURNAROUND_MINUTES } from "@/lib/booking/constants";

export interface Interval {
  start: Date;
  end: Date;
}

export interface AvailabilityConflict {
  source: "booking" | "calendar";
  start: Date;
  end: Date;
}

export interface CheckAvailabilityInput {
  yachtId: string;
  calendarId: string | null;
  startsAt: Date;
  endsAt: Date;
}

export interface CheckAvailabilityResult {
  available: boolean;
  conflicts: AvailabilityConflict[];
  calendarChecked: boolean;
}

export interface AvailableSlot {
  start: string;
  end: string;
  hours: number;
}

export interface GetAvailableSlotsInput {
  yachtId: string;
  calendarId: string | null;
  /** YYYY-MM-DD, interpreted in Dubai local time. */
  date: string;
  minHours: number;
  maxHours: number;
}

export interface GetAvailableSlotsResult {
  date: string;
  slots: AvailableSlot[];
  busy: Interval[];
  calendarChecked: boolean;
}

const BOOKED_STATUSES = ["hold", "deposit_paid", "paid"] as const;

/**
 * Two intervals overlap when a `bufferMinutes` turnaround gap is required
 * between them (e.g. one charter's end plus buffer must not intrude on
 * the next charter's start).
 */
export function intervalsOverlap(a: Interval, b: Interval, bufferMinutes = 0): boolean {
  const bufferMs = bufferMinutes * 60_000;
  const aStart = a.start.getTime() - bufferMs;
  const aEnd = a.end.getTime() + bufferMs;
  const bStart = b.start.getTime();
  const bEnd = b.end.getTime();
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Fetches booking-derived busy intervals for a yacht overlapping the given
 * window. Includes bookings in status hold / deposit_paid / paid; holds are
 * only counted while `hold_expires_at` is still in the future (filtered in
 * JS after fetch to keep the query simple).
 */
export async function getBookedIntervals(
  yachtId: string,
  dayStart: Date,
  dayEnd: Date
): Promise<Interval[]> {
  if (!isAdminSupabaseConfigured()) {
    console.warn("[availability] Supabase admin client not configured; returning no booked intervals");
    return [];
  }

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("starts_at, ends_at, status, hold_expires_at")
    .eq("yacht_id", yachtId)
    .in("status", [...BOOKED_STATUSES])
    .lt("starts_at", dayEnd.toISOString())
    .gt("ends_at", dayStart.toISOString());

  if (error) {
    console.error("[availability] failed to fetch booked intervals:", error);
    return [];
  }

  const now = Date.now();

  return (data ?? [])
    .filter((row) => {
      if (row.status === "hold") {
        return row.hold_expires_at ? new Date(row.hold_expires_at).getTime() > now : false;
      }
      return true;
    })
    .map((row) => ({ start: new Date(row.starts_at), end: new Date(row.ends_at) }));
}

/**
 * Checks whether a proposed charter window is available, combining
 * confirmed/held bookings (Supabase) with the yacht's Google Calendar
 * busy periods (if configured). `calendarChecked` is false when the
 * calendar could not be queried (unconfigured or API failure) — callers
 * should still trust the booking-based result in that case.
 */
export async function checkAvailability(
  input: CheckAvailabilityInput
): Promise<CheckAvailabilityResult> {
  const { yachtId, calendarId, startsAt, endsAt } = input;
  const conflicts: AvailabilityConflict[] = [];

  const bookedIntervals = await getBookedIntervals(yachtId, startsAt, endsAt);
  for (const interval of bookedIntervals) {
    if (intervalsOverlap({ start: startsAt, end: endsAt }, interval, TURNAROUND_MINUTES)) {
      conflicts.push({ source: "booking", start: interval.start, end: interval.end });
    }
  }

  let calendarChecked = false;
  if (calendarId) {
    const busyResult = await getBusyIntervals(calendarId, startsAt, endsAt);
    calendarChecked = busyResult.source === "google";
    for (const interval of busyResult.busy) {
      if (intervalsOverlap({ start: startsAt, end: endsAt }, interval, TURNAROUND_MINUTES)) {
        conflicts.push({ source: "calendar", start: interval.start, end: interval.end });
      }
    }
  }

  return { available: conflicts.length === 0, conflicts, calendarChecked };
}

/**
 * Converts a Dubai local (Asia/Dubai, fixed UTC+4, no DST) date + hour into
 * a UTC Date, without pulling in an external timezone library.
 */
export function dubaiLocalToUtc(date: string, hour: number): Date {
  const [year, month, day] = date.split("-").map(Number);
  const wholeHour = Math.floor(hour);
  const minutes = Math.round((hour - wholeHour) * 60);
  // Dubai is UTC+4 year-round, so local hour H == UTC hour (H - 4).
  return new Date(Date.UTC(year, month - 1, day, wholeHour - 4, minutes));
}

/**
 * Enumerates possible charter start times (1-hour steps) within the
 * yacht's operating hours for a given Dubai-local day, and for each,
 * the longest available run (capped at maxHours) before hitting a busy
 * interval or the end of the operating window. Only runs of at least
 * minHours are returned.
 */
export async function getAvailableSlots(
  input: GetAvailableSlotsInput
): Promise<GetAvailableSlotsResult> {
  const { yachtId, calendarId, date, minHours, maxHours } = input;

  const dayStart = dubaiLocalToUtc(date, OPERATING_HOURS.start);
  const dayEnd = dubaiLocalToUtc(date, OPERATING_HOURS.end);

  const bookedIntervals = await getBookedIntervals(yachtId, dayStart, dayEnd);

  let calendarChecked = false;
  let calendarBusy: Interval[] = [];
  if (calendarId) {
    const busyResult = await getBusyIntervals(calendarId, dayStart, dayEnd);
    calendarChecked = busyResult.source === "google";
    calendarBusy = busyResult.busy;
  }

  const busy = [...bookedIntervals, ...calendarBusy];

  const slots: AvailableSlot[] = [];

  for (let startHour = OPERATING_HOURS.start; startHour < OPERATING_HOURS.end; startHour += 1) {
    const slotStart = dubaiLocalToUtc(date, startHour);
    if (slotStart.getTime() < dayStart.getTime()) continue;

    // Find the longest free run starting at slotStart, capped by maxHours
    // and by the operating window close.
    const hardCapEnd = new Date(
      Math.min(
        dubaiLocalToUtc(date, startHour + maxHours).getTime(),
        dayEnd.getTime()
      )
    );

    let freeEnd = hardCapEnd;
    for (const interval of busy) {
      // Buffer applies on both sides of an existing busy interval.
      const bufferedStart = new Date(interval.start.getTime() - TURNAROUND_MINUTES * 60_000);
      const bufferedEnd = new Date(interval.end.getTime() + TURNAROUND_MINUTES * 60_000);

      if (bufferedStart.getTime() <= slotStart.getTime()) {
        // Busy interval (plus buffer) covers or precedes the slot start —
        // no availability at this start time at all.
        if (bufferedEnd.getTime() > slotStart.getTime()) {
          freeEnd = slotStart; // zero-length: unavailable
          break;
        }
        continue;
      }

      if (bufferedStart.getTime() < freeEnd.getTime()) {
        freeEnd = bufferedStart;
      }
    }

    const availableMs = freeEnd.getTime() - slotStart.getTime();
    const availableHours = availableMs / (60 * 60_000);

    if (availableHours >= minHours) {
      const hours = Math.min(maxHours, Math.floor(availableHours));
      const slotEnd = new Date(slotStart.getTime() + hours * 60 * 60_000);
      slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString(), hours });
    }
  }

  return { date, slots, busy, calendarChecked };
}
