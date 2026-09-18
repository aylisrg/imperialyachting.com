/**
 * Booking / pricing engine constants.
 *
 * Business rules sourced from src/app/terms/page.tsx and the pricing
 * behaviour currently implemented client-side in PriceConstructor.tsx.
 */

/** Deposit required to confirm a booking (50% of total charter fee). */
export const DEPOSIT_RATE = 0.5;

/** For every N paid hours, 1 bonus hour is granted for free. */
export const BONUS_HOURS_EVERY = 4;

/** Yacht operating window, in Dubai local time (24h clock). */
export const OPERATING_HOURS = { start: 8, end: 22 } as const;

/** IANA timezone used for all "local day" calculations (UAE has one zone, no DST). */
export const DUBAI_TZ = "Asia/Dubai";

/** Minutes required between the end of one charter and the start of the next. */
export const TURNAROUND_MINUTES = 60;

/** How long an unpaid quote remains valid before it must be re-generated. */
export const QUOTE_TTL_MINUTES = 30;

/** How long a soft hold on a calendar slot is kept before it is released. */
export const HOLD_TTL_MINUTES = 30;

/** Maximum charter length (paid hours) accepted in a single booking. */
export const MAX_HOURS = 12;

/**
 * Fallback minimum paid hours when a yacht record does not specify its own
 * minHoursWeekday / minHoursWeekend.
 */
export const MIN_HOURS_FALLBACK = { weekday: 2, weekend: 4 } as const;

/**
 * Days of week (per Intl.DateTimeFormat "en-US" short weekday index mapping
 * used in isWeekendOrHoliday: 0=Sun..6=Sat) treated as "weekend" for pricing
 * and minimum-hours purposes in the UAE.
 *
 * In the UAE the weekend is Friday/Saturday (Sunday is a normal working day).
 * 5 = Friday, 6 = Saturday.
 */
export const WEEKEND_DAYS = [5, 6];

/**
 * UAE public holidays for 2026, treated as "weekend" for min-hours purposes.
 * Dates for Islamic (Hijri) holidays are approximate/estimated — they are
 * confirmed officially only shortly before they occur (moon-sighting based).
 * Gregorian holidays (New Year, National Day) are exact.
 */
export const UAE_PUBLIC_HOLIDAYS_2026: string[] = [
  "2026-01-01", // New Year's Day
  // Eid al-Fitr (approximate — end of Ramadan)
  "2026-03-20",
  "2026-03-21",
  "2026-03-22",
  // Arafat Day / Eid al-Adha (approximate)
  "2026-05-26",
  "2026-05-27",
  "2026-05-28",
  "2026-05-29",
  // Islamic New Year / Hijri New Year (approximate)
  "2026-06-16",
  // Prophet's Birthday / Mawlid al-Nabi (approximate)
  "2026-08-25",
  // National Day
  "2026-12-02",
  "2026-12-03",
];
