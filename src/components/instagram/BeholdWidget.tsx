"use client";

import { useEffect } from "react";

interface BeholdWidgetProps {
  widgetId: string;
}

/**
 * Loads the Behold.so Instagram feed widget.
 *
 * Setup (2 minutes):
 * 1. Go to https://behold.so and sign up (free)
 * 2. Connect your @dubai.yachts.rental Instagram account
 * 3. Create a feed → copy the Widget ID (looks like "BeholdWidget-XXXXXXXXXXXXXXXX")
 * 4. In Vercel → Settings → Environment Variables add:
 *      NEXT_PUBLIC_BEHOLD_WIDGET_ID = BeholdWidget-XXXXXXXXXXXXXXXX
 * 5. Redeploy — real Instagram photos appear automatically
 *
 * Free tier: up to 16 posts, auto-updates when you post new content.
 */
export function BeholdWidget({ widgetId }: BeholdWidgetProps) {
  useEffect(() => {
    // Avoid injecting the script twice
    if (document.querySelector('script[src="https://w.behold.so/widget.js"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://w.behold.so/widget.js";
    script.type = "module";
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return <div id={widgetId} className="w-full" />;
}
