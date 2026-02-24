import { SITE_CONFIG } from "@/lib/constants";

type GAEventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: [string, string, GAEventParams?]) => void;
  }
}

/**
 * Sends a custom event to Google Analytics 4.
 * Silently no-ops when gtag is unavailable (ad-blockers, SSR, etc.).
 */
export function trackEvent(
  action: string,
  params?: GAEventParams,
) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, {
    ...params,
    send_to: SITE_CONFIG.googleAnalyticsId,
  });
}

/* ── Pre-defined conversion events ────────────────────────────── */

export function trackWhatsAppClick(location: string) {
  trackEvent("click_whatsapp", { event_location: location });
}

export function trackContactClick(location: string) {
  trackEvent("click_contact", { event_location: location });
}

export function trackPhoneClick(location: string) {
  trackEvent("click_phone", { event_location: location });
}

export function trackEmailClick(location: string) {
  trackEvent("click_email", { event_location: location });
}

export function trackYachtClick(yachtSlug: string, location: string) {
  trackEvent("click_yacht", { yacht_slug: yachtSlug, event_location: location });
}

export function trackDestinationClick(destinationSlug: string) {
  trackEvent("click_destination", { destination_slug: destinationSlug });
}

export function trackExploreFleetClick() {
  trackEvent("click_explore_fleet");
}

export function trackInquirySubmit(yachtName?: string) {
  trackEvent("submit_inquiry", {
    ...(yachtName ? { yacht_name: yachtName } : {}),
  });
}

export function trackPromoPopup(action: "view" | "click" | "dismiss") {
  trackEvent("promo_popup_interact", { popup_action: action });
}

export function trackCtaSectionView() {
  trackEvent("view_cta_section");
}
