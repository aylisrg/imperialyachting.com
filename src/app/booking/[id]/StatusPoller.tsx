"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 5_000;
const MAX_POLL_MS = 2 * 60_000;

/**
 * Polls `/api/booking/[id]` every 5s (up to 2 minutes) while a booking is
 * still `hold` right after a successful Stripe redirect — the webhook that
 * flips it to `deposit_paid` can lag behind the browser redirect by a few
 * seconds. Refreshes the server component once the status changes.
 */
export function StatusPoller({ bookingId, initialStatus }: { bookingId: string; initialStatus: string }) {
  const router = useRouter();
  const stoppedRef = useRef(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (initialStatus !== "hold") return;

    const interval = setInterval(async () => {
      if (stoppedRef.current) return;

      elapsedRef.current += POLL_INTERVAL_MS;
      if (elapsedRef.current >= MAX_POLL_MS) {
        stoppedRef.current = true;
        clearInterval(interval);
      }

      try {
        const res = await fetch(`/api/booking/${bookingId}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status && data.status !== "hold") {
          stoppedRef.current = true;
          clearInterval(interval);
          router.refresh();
        }
      } catch {
        // Ignore transient errors — the next tick will retry.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [bookingId, initialStatus, router]);

  if (initialStatus !== "hold") return null;

  return (
    <p className="text-sm text-gold-400/80 flex items-center gap-2 mt-2">
      <span className="inline-block w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
      Payment is being confirmed — this page will refresh automatically. Please wait a moment…
    </p>
  );
}
