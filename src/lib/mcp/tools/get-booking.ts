import { z } from "zod";
import { getBookingWithExtras } from "@/lib/booking/bookings-db";
import { sanitizeText } from "../sanitize";
import type { BookingStatus } from "@/types/booking";
import type { ToolAnnotations, ToolMeta } from "./types";

export const getBookingInputSchema = z.object({
  bookingId: z.string().uuid().describe("The booking id, from `create_quote`'s `quoteId` or `create_checkout`'s `bookingId`."),
});
export type GetBookingInput = z.infer<typeof getBookingInputSchema>;

const extraLineSchema = z.object({
  slug: z.string(),
  name: z.string(),
  qty: z.number(),
  unitPrice: z.number(),
  amount: z.number(),
});

const customerSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
});

export const getBookingOutputSchema = z.object({
  found: z.boolean(),
  message: z.string().optional(),
  bookingId: z.string().optional(),
  status: z.string().optional(),
  statusExplanation: z.string().optional(),
  yacht: z.object({ slug: z.string(), name: z.string() }).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  hours: z.number().optional(),
  bonusHours: z.number().optional(),
  guests: z.number().optional(),
  totalAmount: z.number().optional(),
  depositAmount: z.number().optional(),
  balanceAmount: z.number().optional(),
  currency: z.string().optional(),
  extras: z.array(extraLineSchema).optional(),
  customer: customerSchema.optional(),
  holdExpiresAt: z.string().nullable().optional(),
  quoteExpiresAt: z.string().nullable().optional(),
  paid: z.boolean().optional(),
});
export type GetBookingOutput = z.infer<typeof getBookingOutputSchema>;

export const getBookingAnnotations: ToolAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: true,
};

export const getBookingMeta: ToolMeta = {
  name: "get_booking",
  title: "Get Booking Status",
  description:
    "Look up a booking's current status and details by `bookingId` (the id returned by `create_quote` or " +
    "`create_checkout`). Use this to confirm whether a deposit has been paid, or to check whether a quote/hold " +
    "is still valid. Never exposes Stripe ids or internal notes; the customer's email and phone are masked " +
    "(e.g. \"j***@example.com\"). If the id is not found, returns `found: false`.",
  annotations: getBookingAnnotations,
};

const STATUS_EXPLANATIONS: Record<BookingStatus, string> = {
  quote: "A price has been quoted but no deposit hold has been placed yet; the quote may expire.",
  hold: "The slot is held while the customer completes the deposit checkout; the hold may expire.",
  deposit_paid: "The 50% deposit has been paid; the booking is confirmed and the balance is due before departure.",
  paid: "The booking has been paid in full.",
  cancelled: "The booking was cancelled.",
  expired: "The quote or hold expired before the deposit was paid; a new quote is needed to rebook.",
};

/** Masks an email as "j***@example.com". Non-email input is masked generically. */
function maskEmail(email: string | null): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, 1) || "*";
  return `${visible}***@${domain}`;
}

/** Masks a phone number, keeping only the last 2 digits (e.g. "***45"). */
function maskPhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 2) return "***";
  return `***${digits.slice(-2)}`;
}

/**
 * Fetches a booking's status and details. Pure function — no MCP
 * transport dependency. Strips Stripe ids and internal notes, and masks
 * customer PII before returning.
 */
export async function getBooking(
  input: GetBookingInput
): Promise<{ structured: GetBookingOutput; text: string; isError?: boolean }> {
  const data = await getBookingWithExtras(input.bookingId);

  if (!data) {
    const message = `No booking found for id "${input.bookingId}".`;
    return { structured: { found: false, message }, text: message, isError: true };
  }

  const { booking, extras, yachtName, yachtSlug } = data;
  const paid = booking.status === "deposit_paid" || booking.status === "paid";

  const structured: GetBookingOutput = {
    found: true,
    bookingId: booking.id,
    status: booking.status,
    statusExplanation: STATUS_EXPLANATIONS[booking.status],
    yacht: { slug: yachtSlug, name: sanitizeText(yachtName, 200) },
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    hours: booking.hours,
    bonusHours: booking.bonusHours,
    guests: booking.guests,
    totalAmount: booking.totalAmount,
    depositAmount: booking.depositAmount,
    balanceAmount: booking.totalAmount - booking.depositAmount,
    currency: booking.currency,
    extras: extras.map((e) => ({
      slug: e.slug,
      name: sanitizeText(e.name, 200),
      qty: e.qty,
      unitPrice: e.unitPrice,
      amount: e.amount,
    })),
    customer: {
      name: sanitizeText(booking.customerName ?? "", 200),
      email: maskEmail(booking.customerEmail),
      phone: maskPhone(booking.customerPhone),
    },
    holdExpiresAt: booking.holdExpiresAt,
    quoteExpiresAt: booking.quoteExpiresAt,
    paid,
  };

  const text =
    `Booking ${booking.id} for ${structured.yacht?.name}: status ${booking.status} — ${structured.statusExplanation} ` +
    `Total ${booking.currency} ${booking.totalAmount.toLocaleString("en-US")}, deposit ${booking.currency} ${booking.depositAmount.toLocaleString("en-US")}.`;

  return { structured, text };
}
