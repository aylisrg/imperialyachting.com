"use client";

import { X, Gift, Clock } from "lucide-react";

const WHATSAPP_NUMBER = "971528355939";
const UTM_PARAMS = "utm_source=website&utm_medium=promo_banner&utm_campaign=4plus1_hours";

function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}&${UTM_PARAMS}`;
}

interface PromoBannerProps {
  onDismiss?: () => void;
}

export function PromoBanner({ onDismiss }: PromoBannerProps) {
  const whatsappUrl = getWhatsAppUrl(
    "Hi! I saw your 4+1 offer (buy 4 hours, get 1 FREE). I'd like to learn more!"
  );

  return (
    <div className="relative bg-navy-950/95 backdrop-blur-xl border-b border-gold-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
            <Gift className="w-4 h-4 text-gold-400" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-heading font-bold text-white">
              4+1 Special
            </span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="text-xs sm:text-sm text-white/70">
              Book 4 hours, get the 5th
              <span className="text-gold-400 font-semibold"> FREE</span>
            </span>
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#25D366] text-white text-xs sm:text-sm font-semibold hover:bg-[#20bd5a] transition-colors"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Claim Offer</span>
          <span className="sm:hidden">Claim</span>
        </a>

        <button
          onClick={onDismiss}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
