"use client";

import { useState, useEffect } from "react";
import { X, Gift, Clock, ArrowRight } from "lucide-react";
import { trackPromoPopup } from "@/lib/analytics";

const WHATSAPP_NUMBER = "971528355939";
const UTM_PARAMS = "utm_source=website&utm_medium=promo_popup&utm_campaign=4plus1_hours";
const POPUP_STORAGE_KEY = "iy_promo_popup_dismissed";
const POPUP_DELAY_MS = 35000; // Show after 35 seconds

function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}&${UTM_PARAMS}`;
}

export function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed in this session
    try {
      const dismissed = sessionStorage.getItem(POPUP_STORAGE_KEY);
      if (dismissed) return;
    } catch {
      // sessionStorage not available
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      trackPromoPopup("view");
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    trackPromoPopup("dismiss");
    setIsVisible(false);
    try {
      sessionStorage.setItem(POPUP_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!isVisible) return null;

  const whatsappUrl = getWhatsAppUrl(
    "Hi! I saw your 4+1 offer on the website — buy 4 hours, get the 5th hour FREE. I'd like to book!"
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm animate-[fade-in_0.3s_ease]"
        onClick={dismiss}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md pointer-events-auto rounded-2xl overflow-hidden border border-gold-500/20 shadow-2xl shadow-gold-500/10"
          style={{ animation: "popup-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          {/* Gold gradient top bar */}
          <div className="h-1.5 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

          <div className="bg-navy-800 p-6 sm:p-8">
            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 p-1.5 rounded-full text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-400/10 border border-gold-500/20 flex items-center justify-center mb-5">
              <Gift className="w-7 h-7 text-gold-400" />
            </div>

            {/* Title */}
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Book 4 Hours,{" "}
              <span className="text-gold-gradient">Get 1 FREE</span>
            </h3>

            {/* Description */}
            <p className="mt-3 text-white/60 text-sm sm:text-base leading-relaxed">
              Enjoy an extra hour on us with any yacht from our fleet.
              Charter 4 hours and the 5th hour is our gift to you.
            </p>

            {/* Visual hours indicator */}
            <div className="mt-6 flex items-center gap-2">
              {[1, 2, 3, 4].map((hr) => (
                <div
                  key={hr}
                  className="flex-1 h-10 rounded-lg bg-navy-700 border border-white/10 flex items-center justify-center"
                >
                  <Clock className="w-3.5 h-3.5 text-white/50 mr-1" />
                  <span className="text-xs text-white/70 font-medium">{hr}h</span>
                </div>
              ))}
              <div className="flex items-center">
                <ArrowRight className="w-4 h-4 text-gold-500 mx-1" />
              </div>
              <div className="flex-1 h-10 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center">
                <Gift className="w-3.5 h-3.5 text-gold-400 mr-1" />
                <span className="text-xs text-gold-400 font-bold">FREE</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20bd5a] transition-colors"
                onClick={() => trackPromoPopup("click")}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Claim via WhatsApp
              </a>
              <button
                onClick={dismiss}
                className="flex-1 px-5 py-3 rounded-xl border border-white/10 text-white/50 text-sm font-medium hover:bg-white/5 hover:text-white/70 transition-colors"
              >
                Maybe Later
              </button>
            </div>

            <p className="mt-4 text-[11px] text-white/25 text-center">
              Limited time offer. Terms apply.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
