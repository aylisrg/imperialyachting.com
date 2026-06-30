"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export function DocumentsGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/documents/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Re-render the now-unlocked server component.
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => null);
      setError(data?.error || "Incorrect password. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden bg-navy-950">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-500/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sea-500/[0.05] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(201,168,76,0.8) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 mb-6">
            <Lock className="w-7 h-7 text-gold-400" strokeWidth={1.5} />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-400/70 mb-3">
            {SITE_CONFIG.name}
          </p>
          <h1 className="font-heading text-3xl font-bold text-white">
            Confidential Documents
          </h1>
          <p className="mt-3 text-sm text-white/50 leading-relaxed">
            This area is private. Enter the access password to view and download
            our corporate documents.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-8 space-y-5"
        >
          <div>
            <label
              htmlFor="docs-password"
              className="block text-sm font-medium text-white/60 mb-2"
            >
              Access password
            </label>
            <div className="relative">
              <input
                id="docs-password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                placeholder="Enter password"
                className="w-full rounded-lg bg-navy-950/60 border border-white/10 px-4 py-3 pr-11 text-white placeholder:text-white/25 outline-none transition-colors focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                aria-label={show ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {show ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400/90 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="group w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold-500 px-6 py-3.5 text-sm font-semibold text-navy-950 transition-all duration-300 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Unlocking…
              </>
            ) : (
              <>
                Unlock Documents
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-white/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure, encrypted access</span>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-white/30">
          Need access? Contact{" "}
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="text-gold-400/70 hover:text-gold-400 transition-colors"
          >
            {SITE_CONFIG.email}
          </a>
        </p>
      </div>
    </section>
  );
}
