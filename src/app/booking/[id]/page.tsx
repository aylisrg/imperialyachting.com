import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, MapPin, MessageCircle, XCircle } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { getBookingWithExtras } from "@/lib/booking/bookings-db";
import { DUBAI_TZ } from "@/lib/booking/constants";
import { SITE_CONFIG } from "@/lib/constants";
import { StatusPoller } from "./StatusPoller";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking Status",
  robots: { index: false, follow: false },
};

function formatDubaiDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DUBAI_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

function formatDubaiTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DUBAI_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export default async function BookingStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status: statusParam } = await searchParams;

  const data = await getBookingWithExtras(id);
  if (!data) {
    notFound();
  }

  const { booking, extras, yachtName, yachtSlug } = data;
  const balance = booking.totalAmount - booking.depositAmount;

  const isSuccess = statusParam === "success";
  const isCancelled = statusParam === "cancelled";
  const isConfirmed = booking.status === "deposit_paid" || booking.status === "paid";
  const isPending = booking.status === "hold";

  return (
    <div className="min-h-screen bg-navy-950 pt-28 pb-20 sm:pt-32">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Status banner */}
          <div className="rounded-2xl bg-navy-800 border border-white/5 p-6 sm:p-8 mb-6">
            {isSuccess && isConfirmed && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h1 className="font-heading text-2xl font-bold text-white">Deposit Received</h1>
                  <p className="mt-1 text-sm text-white/60">
                    Your charter is being confirmed. We&apos;ll be in touch shortly on WhatsApp or email.
                  </p>
                </div>
              </div>
            )}

            {isSuccess && isPending && (
              <div className="flex items-start gap-3">
                <Clock className="w-7 h-7 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h1 className="font-heading text-2xl font-bold text-white">Payment Received</h1>
                  <p className="mt-1 text-sm text-white/60">
                    Your payment is being confirmed. This can take a few moments.
                  </p>
                  <StatusPoller bookingId={booking.id} initialStatus={booking.status} />
                </div>
              </div>
            )}

            {isCancelled && (
              <div className="flex items-start gap-3">
                <XCircle className="w-7 h-7 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h1 className="font-heading text-2xl font-bold text-white">Payment Not Completed</h1>
                  <p className="mt-1 text-sm text-white/60">
                    Your deposit payment was not completed.
                    {booking.holdExpiresAt && (
                      <>
                        {" "}
                        Your held slot expires at{" "}
                        <span className="text-white/80 font-medium">
                          {formatDubaiTime(booking.holdExpiresAt)} Dubai time
                        </span>
                        .
                      </>
                    )}
                  </p>
                  <Link
                    href={`/fleet/${yachtSlug}`}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    Retry booking on the {yachtName} page →
                  </Link>
                </div>
              </div>
            )}

            {!isSuccess && !isCancelled && (
              <div className="flex items-start gap-3">
                <Clock className="w-7 h-7 text-white/40 flex-shrink-0 mt-0.5" />
                <div>
                  <h1 className="font-heading text-2xl font-bold text-white">Booking Status</h1>
                  <p className="mt-1 text-sm text-white/60">Status: {booking.status}</p>
                </div>
              </div>
            )}
          </div>

          {/* Charter summary */}
          <div className="rounded-2xl bg-navy-800 border border-white/5 p-6 sm:p-8 mb-6">
            <h2 className="font-heading text-lg font-bold text-white mb-4">{yachtName}</h2>

            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-white/50">Departure</dt>
                <dd className="text-white/80 font-medium">{formatDubaiDateTime(booking.startsAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Return</dt>
                <dd className="text-white/80 font-medium">{formatDubaiDateTime(booking.endsAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Duration</dt>
                <dd className="text-white/80 font-medium">
                  {booking.hours}h paid
                  {booking.bonusHours > 0 ? ` + ${booking.bonusHours}h bonus FREE` : ""}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Guests</dt>
                <dd className="text-white/80 font-medium">{booking.guests}</dd>
              </div>

              {extras.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <dt className="text-white/50 mb-1.5">Extras</dt>
                  {extras.map((e) => (
                    <dd key={e.id} className="flex justify-between text-white/70">
                      <span>
                        {e.name} ×{e.qty}
                      </span>
                      <span>
                        {booking.currency} {e.amount.toLocaleString("en-US")}
                      </span>
                    </dd>
                  ))}
                </div>
              )}

              <div className="pt-3 mt-1 border-t border-white/5 flex justify-between">
                <dt className="text-white/50">Total</dt>
                <dd className="text-white font-heading text-lg font-bold">
                  {booking.currency} {booking.totalAmount.toLocaleString("en-US")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gold-400">Deposit (50%, paid now)</dt>
                <dd className="text-gold-400 font-semibold">
                  {booking.currency} {booking.depositAmount.toLocaleString("en-US")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Balance (due 48h before)</dt>
                <dd className="text-white/70">
                  {booking.currency} {balance.toLocaleString("en-US")}
                </dd>
              </div>
            </dl>

            <p className="mt-5 text-xs text-white/30">Booking reference: {booking.id}</p>
          </div>

          {/* What happens next */}
          <div className="rounded-2xl bg-navy-800 border border-white/5 p-6 sm:p-8">
            <h2 className="font-heading text-lg font-bold text-white mb-4">What Happens Next</h2>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                The remaining balance ({booking.currency} {balance.toLocaleString("en-US")}) is due 48 hours
                before departure.
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                Meeting point: {SITE_CONFIG.harbour.name}, {SITE_CONFIG.harbour.area}.
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                Questions? WhatsApp us at{" "}
                <a href={SITE_CONFIG.whatsapp} className="text-gold-400 hover:text-gold-300 underline">
                  {SITE_CONFIG.phone}
                </a>{" "}
                or email{" "}
                <a href={`mailto:${SITE_CONFIG.email}`} className="text-gold-400 hover:text-gold-300 underline">
                  {SITE_CONFIG.email}
                </a>
                .
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
