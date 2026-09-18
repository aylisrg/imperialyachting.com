"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Gift, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { trackBookingStart, trackCheckoutRedirect } from "@/lib/analytics";

const WHATSAPP_NUMBER = "971528355939";
const UTM_PARAMS = "utm_source=website&utm_medium=booking_widget&utm_campaign=4plus1_hours";

interface BookingWidgetProps {
  yachtSlug: string;
  yachtName: string;
  hourlyRate: number;
  capacity: number;
}

interface ExtraDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  unit: "per_booking" | "per_hour" | "per_guest";
  category: string;
  active: boolean;
  sortOrder: number;
}

interface AvailabilitySlot {
  start: string;
  end: string;
  startHour: number;
  hours: number;
}

interface QuoteExtraLine {
  slug: string;
  name: string;
  qty: number;
  unitPrice: number;
  unit: string;
  amount: number;
}

interface QuoteOkDto {
  currency: string;
  hourlyRate: number;
  hours: number;
  bonusHours: number;
  totalHours: number;
  baseAmount: number;
  extras: QuoteExtraLine[];
  extrasAmount: number;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
}

interface CreateQuoteOkResponse {
  ok: true;
  quoteId: string;
  quote: QuoteOkDto;
  yacht: { slug: string; name: string };
  startsAt: string;
  endsAt: string;
  expiresAt: string;
  summary: string;
}

interface ApiErrorResponse {
  error: string;
  message?: string;
  errors?: { code: string; message: string }[];
  conflicts?: { source: string; start: string; end: string }[];
}

function todayDubaiStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getWhatsAppUrl(yachtName: string, quote: QuoteOkDto | null, date: string, startHour: number | null) {
  const when = date && startHour !== null ? ` on ${date} at ${startHour}:00` : "";
  const message = quote
    ? `Hi! I'd like to book the ${yachtName}${when} for ${quote.hours} hours${
        quote.bonusHours > 0 ? ` (+${quote.bonusHours} FREE bonus hour${quote.bonusHours > 1 ? "s" : ""})` : ""
      }. Total: ${quote.currency} ${quote.totalAmount.toLocaleString("en-US")}. Please confirm availability!`
    : `Hi! I'd like to book the ${yachtName}${when}. Please confirm availability!`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}&${UTM_PARAMS}`;
}

export function BookingWidget({ yachtSlug, yachtName, hourlyRate, capacity }: BookingWidgetProps) {
  // --- Step 1: date / guests / hours / start time ---------------------
  const [date, setDate] = useState(todayDubaiStr());
  const [guests, setGuests] = useState(Math.min(6, capacity));
  const [hours, setHours] = useState(4);
  const [startHour, setStartHour] = useState<number | null>(null);

  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState<string | null>(null);
  const [minHours, setMinHours] = useState<number | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  // --- Step 2: extras ---------------------------------------------------
  const [extras, setExtras] = useState<ExtraDto[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});

  // --- Quote --------------------------------------------------------------
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<ApiErrorResponse | null>(null);
  const [quote, setQuote] = useState<CreateQuoteOkResponse | null>(null);

  // --- Step 3: customer + checkout ----------------------------------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const bonusHours = Math.floor(hours / 4);

  // Fetch extras catalogue once.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/booking/extras")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.extras)) setExtras(data.extras);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch availability whenever date/hours change.
  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setAvailLoading(true);
    setAvailError(null);
    setStartHour(null);
    setQuote(null);

    fetch(`/api/booking/availability?yacht=${encodeURIComponent(yachtSlug)}&date=${date}&hours=${hours}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw data;
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setMinHours(data.minHours);
        setSlots(data.slots ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setSlots([]);
        setAvailError(err?.message ?? "Could not check availability. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setAvailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [yachtSlug, date, hours]);

  function extraQty(extra: ExtraDto): number {
    if (extra.unit === "per_guest") return guests;
    if (extra.unit === "per_hour") return hours;
    return 1;
  }

  async function handleGetQuote() {
    if (startHour === null) return;
    setQuoteLoading(true);
    setQuoteError(null);
    setQuote(null);

    const chosenExtras = extras
      .filter((e) => selectedExtras[e.slug])
      .map((e) => ({ slug: e.slug, qty: extraQty(e) }));

    try {
      const res = await fetch("/api/booking/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yachtSlug,
          date,
          startHour,
          hours,
          guests,
          extras: chosenExtras,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQuoteError(data as ApiErrorResponse);
        return;
      }
      setQuote(data as CreateQuoteOkResponse);
      trackBookingStart(yachtSlug, data.quote.totalAmount, data.quote.currency);
    } catch {
      setQuoteError({ error: "network_error", message: "Network error. Please try again." });
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleCheckout() {
    if (!quote || !acceptTerms) return;
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/booking/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: quote.quoteId,
          customer: { name, email, phone: phone || undefined },
          acceptTerms: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.message ?? "Could not start checkout. Please try again.");
        return;
      }
      trackCheckoutRedirect(yachtSlug, quote.quote.depositAmount, quote.quote.currency);
      window.location.href = data.checkoutUrl;
    } catch {
      setCheckoutError("Network error. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  const whatsappUrl = useMemo(
    () => getWhatsAppUrl(yachtName, quote?.quote ?? null, date, startHour),
    [yachtName, quote, date, startHour]
  );

  const belowMinHours = minHours !== null && hours < minHours;

  return (
    <div className="rounded-2xl bg-navy-800 border border-white/5 overflow-hidden">
      <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-white/5">
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">Build Your Charter</h3>
        <p className="mt-1 text-sm text-white/50">
          Select your date, hours and extras, then reserve with a 50% deposit. Book 4 hours, get 1 FREE.
        </p>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-8">
        {/* Step 1: date + guests */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="booking-date" className="text-sm text-white/60 font-medium block mb-2">
              Date
            </label>
            <input
              id="booking-date"
              type="date"
              min={todayDubaiStr()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg bg-navy-900/60 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>
          <div>
            <label htmlFor="booking-guests" className="text-sm text-white/60 font-medium block mb-2">
              Guests
            </label>
            <input
              id="booking-guests"
              type="number"
              min={1}
              max={capacity}
              value={guests}
              onChange={(e) =>
                setGuests(Math.min(capacity, Math.max(1, Number(e.target.value) || 1)))
              }
              className="w-full rounded-lg bg-navy-900/60 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>
        </div>

        {/* Hours slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="booking-hours" className="text-sm text-white/60 font-medium">
              Charter Duration
            </label>
            <span className="text-sm text-white/40">AED {hourlyRate.toLocaleString("en-US")}/hr</span>
          </div>

          <input
            id="booking-hours"
            type="range"
            min={2}
            max={12}
            step={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="price-slider w-full"
            aria-label="Select number of hours"
          />

          <div className="flex justify-between mt-2 px-0.5">
            {Array.from({ length: 11 }, (_, i) => i + 2).map((h) => (
              <span
                key={h}
                className={`text-[10px] sm:text-xs transition-colors ${
                  h === hours ? "text-gold-400 font-bold" : "text-white/25"
                }`}
              >
                {h}h
              </span>
            ))}
          </div>

          {bonusHours > 0 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-500/10 border border-gold-500/20">
              <Gift className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <span className="text-sm text-gold-400">
                {bonusHours} bonus hour{bonusHours > 1 ? "s" : ""} FREE!
              </span>
            </div>
          )}

          {belowMinHours && (
            <p className="mt-2 text-xs text-red-400" role="alert" data-testid="min-hours-hint">
              Minimum charter length for this date is {minHours} hour{minHours === 1 ? "" : "s"}.
            </p>
          )}
        </div>

        {/* Start time chips */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Start Time</p>
          {availLoading && (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking availability…
            </div>
          )}
          {!availLoading && availError && (
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {availError}
            </p>
          )}
          {!availLoading && !availError && slots.length === 0 && (
            <p className="text-sm text-white/40">
              No {hours}-hour slots available on this date. Try another date or a shorter duration.
            </p>
          )}
          {!availLoading && slots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => setStartHour(slot.startHour)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    startHour === slot.startHour
                      ? "bg-gold-500 border-gold-500 text-navy-950"
                      : "bg-navy-900/60 border-white/10 text-white/70 hover:border-gold-500/50"
                  }`}
                >
                  {slot.start}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: extras */}
        {extras.length > 0 && (
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Add-ons</p>
            <div className="space-y-2">
              {extras.map((extra) => {
                const qty = extraQty(extra);
                const qtyLabel =
                  extra.unit === "per_guest" ? `×${qty} guests` : extra.unit === "per_hour" ? `×${qty} hours` : "";
                return (
                  <label
                    key={extra.slug}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-navy-900/40 border border-white/5 cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={!!selectedExtras[extra.slug]}
                        onChange={(e) =>
                          setSelectedExtras((prev) => ({ ...prev, [extra.slug]: e.target.checked }))
                        }
                        className="accent-gold-500"
                      />
                      {extra.name}
                      {qtyLabel && <span className="text-white/40">{qtyLabel}</span>}
                    </span>
                    <span className="text-sm text-white/50">AED {extra.price.toLocaleString("en-US")}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Get quote */}
        {!quote && (
          <div>
            <button
              type="button"
              onClick={handleGetQuote}
              disabled={startHour === null || quoteLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gold-500 text-navy-950 font-semibold hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {quoteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Get Quote
            </button>
            {quoteError && (
              <div className="mt-3 text-sm text-red-400 space-y-1" role="alert">
                <p>{quoteError.message ?? "Could not create a quote."}</p>
                {quoteError.errors?.map((e) => <p key={e.code}>- {e.message}</p>)}
                {quoteError.error === "unavailable" && (
                  <p>Please pick a different start time or date above.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quote breakdown */}
        {quote && (
          <div className="rounded-xl bg-navy-900/50 border border-white/5 p-5 space-y-2">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>
                {quote.quote.hours}h × AED {quote.quote.hourlyRate.toLocaleString("en-US")}
              </span>
              <span>AED {quote.quote.baseAmount.toLocaleString("en-US")}</span>
            </div>
            {quote.quote.bonusHours > 0 && (
              <div className="flex items-center justify-between text-sm text-gold-400/80">
                <span>+{quote.quote.bonusHours} bonus hour{quote.quote.bonusHours > 1 ? "s" : ""}</span>
                <span>FREE</span>
              </div>
            )}
            {quote.quote.extras.map((e) => (
              <div key={e.slug} className="flex items-center justify-between text-sm text-white/60">
                <span>
                  {e.name} ×{e.qty}
                </span>
                <span>AED {e.amount.toLocaleString("en-US")}</span>
              </div>
            ))}
            <div className="border-t border-white/5 pt-2 mt-2 flex items-center justify-between">
              <span className="text-xs text-white/40 uppercase tracking-wider">Total</span>
              <span className="font-heading text-xl font-bold text-white">
                AED {quote.quote.totalAmount.toLocaleString("en-US")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gold-400">Deposit (50%, due now)</span>
              <span className="text-gold-400 font-semibold">
                AED {quote.quote.depositAmount.toLocaleString("en-US")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/50">
              <span>Balance (due 48h before)</span>
              <span>AED {quote.quote.balanceAmount.toLocaleString("en-US")}</span>
            </div>
            <p className="text-xs text-white/30 pt-1">
              Quote valid until {new Date(quote.expiresAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} Dubai time.
            </p>
          </div>
        )}

        {/* Step 3: customer details + checkout */}
        {quote && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-navy-900/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-navy-900/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg bg-navy-900/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
            <label className="flex items-start gap-2 text-xs text-white/50">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 accent-gold-500"
              />
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-white/70">
                Terms
              </a>{" "}
              (50% non-refundable deposit).
            </label>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={!name || !email || !acceptTerms || checkoutLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gold-500 text-navy-950 font-semibold hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Pay {quote.quote.currency} {quote.quote.depositAmount.toLocaleString("en-US")} deposit securely
            </button>
            {checkoutError && (
              <p className="text-sm text-red-400" role="alert">
                {checkoutError}
              </p>
            )}
          </div>
        )}

        {/* WhatsApp fallback */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl border border-[#25D366]/40 text-[#25D366] font-medium hover:bg-[#25D366]/10 transition-colors text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Or ask on WhatsApp
        </a>

        <p className="flex items-center gap-1.5 text-[11px] text-white/30">
          <Clock className="w-3 h-3" /> Reserved slots are held for 30 minutes while you complete payment.
        </p>
      </div>
    </div>
  );
}
