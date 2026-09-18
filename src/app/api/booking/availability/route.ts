import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { jsonError } from "@/lib/api/errors";
import { fetchYachtBySlug } from "@/lib/yachts-db";
import { getYachtBookingInfo } from "@/lib/booking/bookings-db";
import { getAvailableSlots } from "@/lib/booking/availability";
import { getMinHours } from "@/lib/booking/pricing-engine";
import { DUBAI_TZ, MAX_HOURS } from "@/lib/booking/constants";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  yacht: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  hours: z.coerce.number().int().min(1).max(MAX_HOURS).optional(),
});

/** Dubai-local "HH:MM" for a UTC instant. */
function dubaiTimeStr(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DUBAI_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

/** Dubai-local hour (0-23) for a UTC instant. */
function dubaiHour(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DUBAI_TZ,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === "hour")?.value ?? "0");
}

/**
 * GET /api/booking/availability?yacht=slug&date=YYYY-MM-DD&hours=4
 *
 * Public, thin wrapper over getAvailableSlots(). `hours` defaults to the
 * yacht's minimum for the given date and is clamped to [minHours, MAX_HOURS];
 * slots are sized to exactly that many paid hours.
 */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`booking-availability:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!limit.ok) {
    return jsonError(429, "rate_limited", "Too many requests. Please try again later.");
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    yacht: url.searchParams.get("yacht") ?? undefined,
    date: url.searchParams.get("date") ?? undefined,
    hours: url.searchParams.get("hours") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { yacht: yachtSlug, date } = parsed.data;

  const [yacht, yachtInfo] = await Promise.all([
    fetchYachtBySlug(yachtSlug),
    getYachtBookingInfo(yachtSlug),
  ]);

  if (!yacht || !yachtInfo) {
    return jsonError(404, "yacht_not_found", `No yacht found for slug "${yachtSlug}".`);
  }

  // Dubai-local midday on the requested date is enough to resolve
  // weekday/weekend min-hours without touching the calendar-conversion path.
  const [year, month, day] = date.split("-").map(Number);
  const referenceDate = new Date(Date.UTC(year, month - 1, day, 8));
  const minHours = getMinHours(yacht, referenceDate);

  const requestedHours = Math.min(Math.max(parsed.data.hours ?? minHours, minHours), MAX_HOURS);

  const result = await getAvailableSlots({
    yachtId: yachtInfo.id,
    calendarId: yachtInfo.calendarId,
    date,
    minHours: requestedHours,
    maxHours: requestedHours,
  });

  return NextResponse.json({
    date: result.date,
    minHours,
    slots: result.slots.map((slot) => {
      const start = new Date(slot.start);
      return {
        start: dubaiTimeStr(start),
        end: dubaiTimeStr(new Date(slot.end)),
        startHour: dubaiHour(start),
        hours: slot.hours,
      };
    }),
    calendarChecked: result.calendarChecked,
  });
}
