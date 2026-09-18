"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Loader2, ExternalLink } from "lucide-react";
import { AdminHeader } from "../components/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { BookingRow } from "@/lib/supabase/types";

const STATUS_FILTERS = [
  "all",
  "quote",
  "hold",
  "deposit_paid",
  "paid",
  "cancelled",
  "expired",
] as const;

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

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [yachtNames, setYachtNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");

  const loadBookings = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        const rows = data as BookingRow[];
        setBookings(rows);

        const yachtIds = Array.from(new Set(rows.map((b) => b.yacht_id)));
        if (yachtIds.length > 0) {
          const { data: yachts } = await supabase
            .from("yachts")
            .select("id, name")
            .in("id", yachtIds);
          if (yachts) {
            const names: Record<string, string> = {};
            for (const y of yachts as { id: string; name: string }[]) {
              names[y.id] = y.name;
            }
            setYachtNames(names);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filtered = useMemo(
    () => (statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter)),
    [bookings, statusFilter]
  );

  return (
    <>
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/admin" className="text-white/40 hover:text-white/60 text-sm">
            Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/60 text-sm">Bookings</span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-white mb-1">Bookings</h1>
        <p className="mt-1 text-white/50 mb-6">
          All charter bookings, newest first. Times shown in Dubai local time.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-gold-500/20 text-gold-400"
                  : "bg-navy-800 text-white/40 hover:text-white/60 border border-white/5"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-navy-800 rounded-2xl border border-white/5">
            <CalendarDays className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-white/50">No bookings</h2>
          </div>
        ) : (
          <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-white/40 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Yacht</th>
                  <th className="px-5 py-3 font-medium">Dates (Dubai)</th>
                  <th className="px-5 py-3 font-medium">Hours</th>
                  <th className="px-5 py-3 font-medium">Guests</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Total / Deposit</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Expiry</th>
                  <th className="px-5 py-3 font-medium">Stripe</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => (window.location.href = `/admin/bookings/${b.id}`)}
                  >
                    <td className="px-5 py-3 text-white font-medium whitespace-nowrap">
                      <Link href={`/admin/bookings/${b.id}`} className="hover:text-gold-400">
                        {yachtNames[b.yacht_id] || b.yacht_id}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-white/60 whitespace-nowrap">
                      {formatDubai(b.starts_at)} → {formatDubai(b.ends_at)}
                    </td>
                    <td className="px-5 py-3 text-white/50">{b.hours}</td>
                    <td className="px-5 py-3 text-white/50">{b.guests}</td>
                    <td className="px-5 py-3 text-white/60 whitespace-nowrap">
                      <p>{b.customer_name || "—"}</p>
                      <p className="text-white/30 text-xs">{b.customer_email || ""}</p>
                    </td>
                    <td className="px-5 py-3 text-white/40">{b.source}</td>
                    <td className="px-5 py-3 text-gold-400 whitespace-nowrap">
                      {b.total_amount.toLocaleString()} / {b.deposit_amount.toLocaleString()} {b.currency}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          STATUS_STYLES[b.status] || "bg-white/5 text-white/40"
                        }`}
                      >
                        {b.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/40 whitespace-nowrap text-xs">
                      {b.status === "hold" && b.hold_expires_at
                        ? `Hold: ${formatDubai(b.hold_expires_at)}`
                        : b.status === "quote" && b.quote_expires_at
                        ? `Quote: ${formatDubai(b.quote_expires_at)}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      {b.stripe_payment_intent_id ? (
                        <a
                          href={`https://dashboard.stripe.com/payments/${b.stripe_payment_intent_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gold-400 hover:text-gold-300 text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </a>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
