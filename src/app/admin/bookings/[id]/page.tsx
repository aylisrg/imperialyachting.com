"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  Ban,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";
import { AdminHeader } from "../../components/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { BookingRow, ExtraRow } from "@/lib/supabase/types";

const STATUS_STYLES: Record<string, string> = {
  quote: "bg-white/5 text-white/50",
  hold: "bg-gold-500/15 text-gold-400",
  deposit_paid: "bg-sea-400/15 text-sea-400",
  paid: "bg-sea-500/15 text-sea-400",
  cancelled: "bg-red-500/15 text-red-400",
  expired: "bg-white/5 text-white/30",
};

function formatDubai(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface BookingExtraLine {
  id: string;
  qty: number;
  unit_price: number;
  amount: number;
  extra: ExtraRow | null;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [yachtName, setYachtName] = useState<string>("");
  const [lines, setLines] = useState<BookingExtraLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (bookingData) {
        const b = bookingData as BookingRow;
        setBooking(b);

        const { data: yacht } = await supabase
          .from("yachts")
          .select("name")
          .eq("id", b.yacht_id)
          .single();
        if (yacht) setYachtName((yacht as { name: string }).name);

        const { data: extraLines } = await supabase
          .from("booking_extras")
          .select("id, qty, unit_price, amount, extra_id")
          .eq("booking_id", id);

        if (extraLines && extraLines.length > 0) {
          const extraIds = Array.from(
            new Set((extraLines as { extra_id: string }[]).map((l) => l.extra_id))
          );
          const { data: extras } = await supabase
            .from("extras")
            .select("*")
            .in("id", extraIds);
          const extrasById: Record<string, ExtraRow> = {};
          if (extras) {
            for (const e of extras as ExtraRow[]) extrasById[e.id] = e;
          }
          setLines(
            (extraLines as { id: string; qty: number; unit_price: number; amount: number; extra_id: string }[]).map(
              (l) => ({
                id: l.id,
                qty: l.qty,
                unit_price: l.unit_price,
                amount: l.amount,
                extra: extrasById[l.extra_id] || null,
              })
            )
          );
        } else {
          setLines([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(action: "cancel" | "mark_paid" | "confirm_offline", label: string) {
    if (!confirm(`${label}? This action will be recorded on the booking.`)) return;
    const notes = prompt("Optional note to attach to this action:") || undefined;
    setActionLoading(action);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Request failed");
      }
      await load();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <AdminHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white/50">
          Booking not found.
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push("/admin/bookings")}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Bookings
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">
              {yachtName || booking.yacht_id}
            </h1>
            <p className="text-white/40 text-sm mt-1">Booking {booking.id}</p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              STATUS_STYLES[booking.status] || "bg-white/5 text-white/40"
            }`}
          >
            {booking.status.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="p-5 bg-navy-800 rounded-xl border border-white/5 space-y-3">
            <h3 className="font-heading text-sm font-bold text-white/60 uppercase tracking-wider">
              Charter Details
            </h3>
            <Row label="Starts" value={formatDubai(booking.starts_at)} />
            <Row label="Ends" value={formatDubai(booking.ends_at)} />
            <Row label="Hours" value={String(booking.hours)} />
            <Row label="Guests" value={String(booking.guests)} />
            <Row label="Source" value={booking.source} />
          </div>

          <div className="p-5 bg-navy-800 rounded-xl border border-white/5 space-y-3">
            <h3 className="font-heading text-sm font-bold text-white/60 uppercase tracking-wider">
              Customer
            </h3>
            <Row label="Name" value={booking.customer_name || "—"} />
            <Row
              label="Email"
              value={
                booking.customer_email ? (
                  <a href={`mailto:${booking.customer_email}`} className="text-gold-400 hover:text-gold-300">
                    {booking.customer_email}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label="Phone"
              value={
                booking.customer_phone ? (
                  <a href={`tel:${booking.customer_phone}`} className="text-gold-400 hover:text-gold-300">
                    {booking.customer_phone}
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </div>

          <div className="p-5 bg-navy-800 rounded-xl border border-white/5 space-y-3">
            <h3 className="font-heading text-sm font-bold text-white/60 uppercase tracking-wider">
              Payment
            </h3>
            <Row label="Base amount" value={`${booking.base_amount.toLocaleString()} ${booking.currency}`} />
            <Row label="Extras amount" value={`${booking.extras_amount.toLocaleString()} ${booking.currency}`} />
            <Row label="Total" value={`${booking.total_amount.toLocaleString()} ${booking.currency}`} />
            <Row label="Deposit" value={`${booking.deposit_amount.toLocaleString()} ${booking.currency}`} />
            <Row label="Bonus hours" value={String(booking.bonus_hours)} />
            <Row
              label="Stripe"
              value={
                booking.stripe_payment_intent_id ? (
                  <a
                    href={`https://dashboard.stripe.com/payments/${booking.stripe_payment_intent_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gold-400 hover:text-gold-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View payment
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </div>

          <div className="p-5 bg-navy-800 rounded-xl border border-white/5 space-y-3">
            <h3 className="font-heading text-sm font-bold text-white/60 uppercase tracking-wider">
              Expiry
            </h3>
            <Row label="Quote expires" value={formatDubai(booking.quote_expires_at)} />
            <Row label="Hold expires" value={formatDubai(booking.hold_expires_at)} />
            <Row label="Calendar event" value={booking.gcal_event_id || "—"} />
          </div>
        </div>

        <div className="p-5 bg-navy-800 rounded-xl border border-white/5 mb-8">
          <h3 className="font-heading text-sm font-bold text-white/60 uppercase tracking-wider mb-4">
            Extras
          </h3>
          {lines.length === 0 ? (
            <p className="text-white/30 text-sm">No extras attached to this booking.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                  <th className="py-2 font-medium">Extra</th>
                  <th className="py-2 font-medium">Qty</th>
                  <th className="py-2 font-medium">Unit Price</th>
                  <th className="py-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-t border-white/5">
                    <td className="py-2 text-white">{line.extra?.name || "Unknown extra"}</td>
                    <td className="py-2 text-white/60">{line.qty}</td>
                    <td className="py-2 text-white/60">{line.unit_price.toLocaleString()} {booking.currency}</td>
                    <td className="py-2 text-gold-400">{line.amount.toLocaleString()} {booking.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-5 bg-navy-800 rounded-xl border border-white/5 mb-8">
          <h3 className="font-heading text-sm font-bold text-white/60 uppercase tracking-wider mb-2">
            Notes
          </h3>
          <pre className="whitespace-pre-wrap text-sm text-white/60 font-sans">
            {booking.notes || "No notes yet."}
          </pre>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => runAction("confirm_offline", "Confirm manually (deposit received offline)")}
            disabled={actionLoading !== null}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sea-500/10 text-sea-400 hover:bg-sea-500/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {actionLoading === "confirm_offline" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BadgeCheck className="w-4 h-4" />
            )}
            Confirm manually (deposit received offline)
          </button>
          <button
            onClick={() => runAction("mark_paid", "Mark as paid (balance received)")}
            disabled={actionLoading !== null}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {actionLoading === "mark_paid" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Mark as paid (balance received)
          </button>
          <button
            onClick={() => runAction("cancel", "Cancel this booking")}
            disabled={actionLoading !== null}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {actionLoading === "cancel" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
            Cancel booking
          </button>
        </div>

        <div className="mt-8">
          <Link href="/admin/bookings" className="text-sm text-white/40 hover:text-white/60">
            ← Back to all bookings
          </Link>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80 text-right">{value}</span>
    </div>
  );
}
