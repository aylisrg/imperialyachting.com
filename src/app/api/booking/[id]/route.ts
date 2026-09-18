import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { jsonError } from "@/lib/api/errors";
import { getBookingWithExtras } from "@/lib/booking/bookings-db";

export const dynamic = "force-dynamic";

/** Masks an email's local part, keeping the first char and the domain: "i***@gmail.com". */
function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

/**
 * GET /api/booking/[id]
 * Public-safe booking summary for the /booking/[id] confirmation page and
 * its status-polling client. Deliberately excludes Stripe ids, notes, and
 * the customer's phone number; the customer's email is masked.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request);
  const limit = rateLimit(`booking-status:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!limit.ok) {
    return jsonError(429, "rate_limited", "Too many requests. Please try again later.");
  }

  const { id } = await params;

  const data = await getBookingWithExtras(id);
  if (!data) {
    return jsonError(404, "not_found", `No booking found for id "${id}".`);
  }

  const { booking, extras, yachtName, yachtSlug } = data;

  return NextResponse.json({
    id: booking.id,
    status: booking.status,
    yacht: { slug: yachtSlug, name: yachtName },
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    hours: booking.hours,
    bonusHours: booking.bonusHours,
    guests: booking.guests,
    currency: booking.currency,
    baseAmount: booking.baseAmount,
    extrasAmount: booking.extrasAmount,
    totalAmount: booking.totalAmount,
    depositAmount: booking.depositAmount,
    balanceAmount: booking.totalAmount - booking.depositAmount,
    extras: extras.map((e) => ({ slug: e.slug, name: e.name, qty: e.qty, amount: e.amount })),
    customer: {
      name: booking.customerName,
      email: maskEmail(booking.customerEmail),
    },
    quoteExpiresAt: booking.quoteExpiresAt,
    holdExpiresAt: booking.holdExpiresAt,
  });
}
