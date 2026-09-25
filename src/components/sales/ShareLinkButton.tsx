"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/** Copies the listing URL — the one link a broker forwards to a client. */
export function ShareLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:border-gold-500/40 hover:text-gold-400"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
