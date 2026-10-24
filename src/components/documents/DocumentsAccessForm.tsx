"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, MailCheck, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export const ACCESS_EMAIL_INPUT_ID = "docs-email";

const inputClass =
  "w-full rounded-lg bg-navy-950/60 border border-white/10 px-4 py-3 text-white placeholder:text-white/25 outline-none transition-colors focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20";

function errorMessage(data: unknown): string {
  const body = data as { message?: string; issues?: Array<{ message?: string }> } | null;
  return (
    body?.message ||
    body?.issues?.[0]?.message ||
    "Something went wrong. Please try again."
  );
}

/**
 * Email gate for /documents: the visitor leaves their email (name and company
 * optional) and gets a sign-in link in their inbox.
 */
export function DocumentsAccessForm({ expired = false }: { expired?: boolean }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/documents/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, company, website }),
      });
      if (res.ok) {
        trackEvent("docs_access_requested", { has_company: Boolean(company) });
        setSentTo(email.trim());
        return;
      }
      setError(errorMessage(await res.json().catch(() => null)));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center" role="status">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 mb-5">
          <MailCheck className="w-6 h-6 text-gold-400" strokeWidth={1.5} />
        </div>
        <h2 className="font-heading text-2xl font-bold text-white">Check your inbox</h2>
        <p className="mt-3 text-sm text-white/60 leading-relaxed">
          We&apos;ve sent a sign-in link to{" "}
          <span className="text-white font-medium break-all">{sentTo}</span>. Open it
          on this device to unlock the documents. The link works for 24 hours.
        </p>
        <p className="mt-4 text-xs text-white/35">
          Nothing arrived? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="text-gold-400/80 hover:text-gold-400 underline underline-offset-2"
          >
            try another email
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-4" noValidate>
      <div>
        <h2 className="font-heading text-2xl font-bold text-white">Get access</h2>
        <p className="mt-2 text-sm text-white/50 leading-relaxed">
          Enter your email and we&apos;ll send you a sign-in link to download the
          documents and view our banking details.
        </p>
      </div>

      {expired && (
        <p className="text-sm text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          That sign-in link has expired or is invalid. Request a new one below.
        </p>
      )}

      <div>
        <label htmlFor={ACCESS_EMAIL_INPUT_ID} className="block text-sm font-medium text-white/60 mb-2">
          Work email
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            id={ACCESS_EMAIL_INPUT_ID}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            placeholder="you@company.com"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="docs-name" className="block text-sm font-medium text-white/60 mb-2">
            Name <span className="text-white/30 font-normal">(optional)</span>
          </label>
          <input
            id="docs-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={200}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="docs-company" className="block text-sm font-medium text-white/60 mb-2">
            Company <span className="text-white/30 font-normal">(optional)</span>
          </label>
          <input
            id="docs-company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            autoComplete="organization"
            maxLength={200}
            className={inputClass}
          />
        </div>
      </div>

      {/* Honeypot: hidden from people, bots fill it in. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="docs-website">Website</label>
        <input
          id="docs-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400/90 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !email}
        className="group w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold-500 px-6 py-3.5 text-sm font-semibold text-navy-950 transition-all duration-300 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending link…
          </>
        ) : (
          <>
            Email me a sign-in link
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="flex items-start gap-2 text-xs text-white/35 leading-relaxed">
        <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          By requesting access you agree that Imperial Yachting may store your
          details and contact you regarding our services. See our{" "}
          <Link href="/privacy" className="text-gold-400/70 hover:text-gold-400 underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </span>
      </p>
    </form>
  );
}
