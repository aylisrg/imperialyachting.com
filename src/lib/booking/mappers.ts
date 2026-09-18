import type { BookingExtraRow, BookingRow, ExtraRow } from "@/lib/supabase/types";
import type { Booking, BookingExtra, BookingStatus, BookingSource, Extra, ExtraUnit } from "@/types/booking";

export function mapExtraFromDB(row: ExtraRow): Extra {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    unit: row.unit as ExtraUnit,
    category: row.category,
    image: row.image,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

export function mapBookingFromDB(row: BookingRow): Booking {
  return {
    id: row.id,
    yachtId: row.yacht_id,
    status: row.status as BookingStatus,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    hours: row.hours,
    guests: row.guests,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    source: row.source as BookingSource,
    baseAmount: row.base_amount,
    extrasAmount: row.extras_amount,
    bonusHours: row.bonus_hours,
    totalAmount: row.total_amount,
    depositAmount: row.deposit_amount,
    currency: row.currency,
    quoteExpiresAt: row.quote_expires_at,
    holdExpiresAt: row.hold_expires_at,
    stripeCheckoutId: row.stripe_checkout_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    gcalEventId: row.gcal_event_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBookingExtraFromDB(row: BookingExtraRow): BookingExtra {
  return {
    id: row.id,
    bookingId: row.booking_id,
    extraId: row.extra_id,
    qty: row.qty,
    unitPrice: row.unit_price,
    amount: row.amount,
  };
}
