import { createAdminSupabase } from "@/lib/supabase/admin";
import type { BookingExtraRow, BookingRow, Database } from "@/lib/supabase/types";
import type { Booking, BookingExtra } from "@/types/booking";
import { mapBookingExtraFromDB, mapBookingFromDB } from "./mappers";

export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];
export type BookingExtraInsert = Database["public"]["Tables"]["booking_extras"]["Insert"];

export interface YachtBookingInfo {
  id: string;
  slug: string;
  name: string;
  calendarId: string | null;
  bookingEnabled: boolean;
}

export interface BookingWithExtras {
  booking: Booking;
  extras: (BookingExtra & { name: string; slug: string })[];
  yachtName: string;
  yachtSlug: string;
}

/**
 * Looks up the DB-only fields needed to price/check-availability/insert a
 * booking for a yacht (id, calendar id, booking_enabled) by slug. The
 * domain `Yacht` returned by `fetchYachtBySlug()` does not carry the row
 * id, so booking code needs this alongside it.
 */
export async function getYachtBookingInfo(slug: string): Promise<YachtBookingInfo | null> {
  const supabase = createAdminSupabase();

  const { data, error } = await supabase
    .from("yachts")
    .select("id, slug, name, calendar_id, booking_enabled")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    calendarId: data.calendar_id,
    bookingEnabled: data.booking_enabled,
  };
}

/** Inserts a new booking row and returns the mapped domain object. */
export async function insertBooking(row: BookingInsert): Promise<Booking> {
  const supabase = createAdminSupabase();

  const { data, error } = await supabase.from("bookings").insert(row).select().single();

  if (error || !data) {
    throw new Error(`[bookings-db] failed to insert booking: ${error?.message ?? "no data returned"}`);
  }

  return mapBookingFromDB(data as BookingRow);
}

/** Inserts booking_extras rows for a booking. No-op for an empty array. */
export async function insertBookingExtras(rows: BookingExtraInsert[]): Promise<void> {
  if (rows.length === 0) return;

  const supabase = createAdminSupabase();
  const { error } = await supabase.from("booking_extras").insert(rows);

  if (error) {
    throw new Error(`[bookings-db] failed to insert booking_extras: ${error.message}`);
  }
}

/** Fetches a single booking by id. Returns null when not found. */
export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = createAdminSupabase();

  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single();

  if (error || !data) return null;

  return mapBookingFromDB(data as BookingRow);
}

/**
 * Fetches a booking together with its extras (enriched with extra name +
 * slug) and its yacht's name/slug. Returns null when the booking or its
 * yacht cannot be found.
 */
export async function getBookingWithExtras(id: string): Promise<BookingWithExtras | null> {
  const supabase = createAdminSupabase();

  const booking = await getBookingById(id);
  if (!booking) return null;

  const { data: yachtRow, error: yachtError } = await supabase
    .from("yachts")
    .select("name, slug")
    .eq("id", booking.yachtId)
    .single();

  if (yachtError || !yachtRow) return null;

  const { data: extraRows, error: extrasError } = await supabase
    .from("booking_extras")
    .select("*")
    .eq("booking_id", id);

  if (extrasError) {
    console.error("[bookings-db] failed to fetch booking_extras:", extrasError);
  }

  const bookingExtras = ((extraRows ?? []) as BookingExtraRow[]).map(mapBookingExtraFromDB);

  const extraInfoById = new Map<string, { name: string; slug: string }>();
  if (bookingExtras.length > 0) {
    const extraIds = [...new Set(bookingExtras.map((e) => e.extraId))];
    const { data: extraDetails, error: extraDetailsError } = await supabase
      .from("extras")
      .select("id, name, slug")
      .in("id", extraIds);

    if (extraDetailsError) {
      console.error("[bookings-db] failed to fetch extras details:", extraDetailsError);
    }

    for (const row of extraDetails ?? []) {
      extraInfoById.set(row.id, { name: row.name, slug: row.slug });
    }
  }

  const extras = bookingExtras.map((e) => ({
    ...e,
    name: extraInfoById.get(e.extraId)?.name ?? "",
    slug: extraInfoById.get(e.extraId)?.slug ?? "",
  }));

  return { booking, extras, yachtName: yachtRow.name, yachtSlug: yachtRow.slug };
}

/** Applies a partial update to a booking and returns the updated row, or null on failure. */
export async function updateBooking(id: string, patch: BookingUpdate): Promise<Booking | null> {
  const supabase = createAdminSupabase();

  const { data, error } = await supabase
    .from("bookings")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("[bookings-db] failed to update booking:", error);
    return null;
  }

  return mapBookingFromDB(data as BookingRow);
}

/**
 * Safety-net cleanup: flips any `quote` booking whose `quote_expires_at`
 * has passed, and any `hold` booking whose `hold_expires_at` has passed,
 * to `expired`. Intended to be called from a cron route as a backstop to
 * Stripe's own `checkout.session.expired` webhook.
 */
export async function expireStaleQuotesAndHolds(): Promise<{ expired: number }> {
  const supabase = createAdminSupabase();
  const nowIso = new Date().toISOString();

  const [quoteResult, holdResult] = await Promise.all([
    supabase
      .from("bookings")
      .update({ status: "expired" })
      .eq("status", "quote")
      .lt("quote_expires_at", nowIso)
      .select("id"),
    supabase
      .from("bookings")
      .update({ status: "expired" })
      .eq("status", "hold")
      .lt("hold_expires_at", nowIso)
      .select("id"),
  ]);

  if (quoteResult.error) {
    console.error("[bookings-db] failed to expire stale quotes:", quoteResult.error);
  }
  if (holdResult.error) {
    console.error("[bookings-db] failed to expire stale holds:", holdResult.error);
  }

  const expired = (quoteResult.data?.length ?? 0) + (holdResult.data?.length ?? 0);
  return { expired };
}
