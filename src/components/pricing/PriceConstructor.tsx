"use client";

import { useState, useMemo } from "react";
import { Clock, Gift, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "971528355939";
const UTM_PARAMS = "utm_source=website&utm_medium=price_constructor&utm_campaign=4plus1_hours";

interface PriceConstructorProps {
  yachtName: string;
  hourlyRate: number; // lowest hourly rate across seasons
}

function getWhatsAppBookingUrl(yachtName: string, hours: number, bonusHours: number, totalPrice: number) {
  const totalTime = hours + bonusHours;
  const bonusText = bonusHours > 0
    ? ` (${hours} paid + ${bonusHours} FREE bonus hour${bonusHours > 1 ? "s" : ""})`
    : "";

  const message = `Hi! I'd like to book the ${yachtName} for ${totalTime} hours${bonusText}. Total: AED ${totalPrice.toLocaleString("en-US")}. Please confirm availability!`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}&${UTM_PARAMS}`;
}

export function PriceConstructor({ yachtName, hourlyRate }: PriceConstructorProps) {
  const [hours, setHours] = useState(3);

  const { bonusHours, totalPrice, totalTime, savedAmount } = useMemo(() => {
    // For every 4 hours paid, 1 bonus hour is given
    const bonus = Math.floor(hours / 4);
    const total = hours + bonus;
    const price = hours * hourlyRate;
    const saved = bonus * hourlyRate;
    return { bonusHours: bonus, totalPrice: price, totalTime: total, savedAmount: saved };
  }, [hours, hourlyRate]);

  const whatsappUrl = getWhatsAppBookingUrl(yachtName, hours, bonusHours, totalPrice);

  return (
    <div className="rounded-2xl bg-navy-800 border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-white/5">
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
          Build Your Charter
        </h3>
        <p className="mt-1 text-sm text-white/50">
          Select your hours and see the price instantly. Book 4 hours, get 1 FREE.
        </p>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        {/* Slider section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-white/60 font-medium">
              Charter Duration
            </label>
            <span className="text-sm text-white/40">
              AED {hourlyRate.toLocaleString("en-US")}/hr
            </span>
          </div>

          <input
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
        </div>

        {/* Visual hours blocks */}
        <div className="mb-8">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
            Your Charter Time
          </p>
          <div className="flex flex-wrap gap-2">
            {/* Paid hours */}
            {Array.from({ length: hours }, (_, i) => (
              <div
                key={`paid-${i}`}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-navy-700 border border-white/10 flex flex-col items-center justify-center transition-all duration-300"
              >
                <Clock className="w-3.5 h-3.5 text-white/50 mb-0.5" />
                <span className="text-[10px] text-white/60 font-medium">
                  {i + 1}h
                </span>
              </div>
            ))}

            {/* Bonus hours */}
            {bonusHours > 0 && (
              <>
                <div className="flex items-center px-1">
                  <ArrowRight className="w-4 h-4 text-gold-500" />
                </div>
                {Array.from({ length: bonusHours }, (_, i) => (
                  <div
                    key={`bonus-${i}`}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gold-500/15 border border-gold-500/30 flex flex-col items-center justify-center transition-all duration-300"
                    style={{ animation: "popup-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
                  >
                    <Gift className="w-3.5 h-3.5 text-gold-400 mb-0.5" />
                    <span className="text-[10px] text-gold-400 font-bold">
                      FREE
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Bonus message */}
          {bonusHours > 0 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-500/10 border border-gold-500/20">
              <Gift className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <span className="text-sm text-gold-400">
                {bonusHours} bonus hour{bonusHours > 1 ? "s" : ""} FREE!
                You save AED {savedAmount.toLocaleString("en-US")}
              </span>
            </div>
          )}

          {/* Hint when close to bonus */}
          {hours % 4 !== 0 && hours >= 3 && (
            <div className="mt-2 text-xs text-white/30">
              {4 - (hours % 4) === 1
                ? "Add 1 more hour to unlock a FREE bonus hour!"
                : `Add ${4 - (hours % 4)} more hours to unlock a FREE bonus hour`}
            </div>
          )}
        </div>

        {/* Price summary */}
        <div className="rounded-xl bg-navy-900/50 border border-white/5 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/50">
              {hours} hours x AED {hourlyRate.toLocaleString("en-US")}
            </span>
            <span className="text-sm text-white/70 font-medium">
              AED {totalPrice.toLocaleString("en-US")}
            </span>
          </div>

          {bonusHours > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gold-400/70">
                +{bonusHours} bonus hour{bonusHours > 1 ? "s" : ""}
              </span>
              <span className="text-sm text-gold-400 font-medium line-through decoration-gold-400/40">
                AED {savedAmount.toLocaleString("en-US")}
              </span>
            </div>
          )}

          <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-white/40 uppercase tracking-wider block">
                Total
              </span>
              <span className="font-heading text-2xl font-bold text-white">
                AED {totalPrice.toLocaleString("en-US")}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-white/40 block">
                {totalTime} hours total
              </span>
              {bonusHours > 0 && (
                <span className="text-xs text-gold-400 font-medium">
                  Saving AED {savedAmount.toLocaleString("en-US")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#20bd5a] transition-colors text-base"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Book {totalTime} Hours — {yachtName}
        </a>
      </div>
    </div>
  );
}
