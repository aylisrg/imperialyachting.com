"use client";

import { useEffect } from "react";

export function BeholdWidget() {
  useEffect(() => {
    if (document.querySelector('script[src="https://w.behold.so/widget.js"]')) return;
    const s = document.createElement("script");
    s.type = "module";
    s.src = "https://w.behold.so/widget.js";
    document.head.append(s);
  }, []);

  return <div data-behold-id="owvikeG3nahTq0Sl00aO" className="w-full" />;
}
