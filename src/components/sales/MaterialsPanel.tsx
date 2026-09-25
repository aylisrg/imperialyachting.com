"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  ExternalLink,
  FileText,
  Film,
  Images,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaleDownloadFile, SaleMaterialSummary } from "@/types/sale";

interface MaterialsPanelProps {
  slug: string;
  items: SaleMaterialSummary[];
  /** Co-brokerage terms shown under the form, if any. */
  brokerTerms?: string;
}

interface SavedProfile {
  email: string;
  isBroker: boolean;
  company: string;
}

const PROFILE_KEY = "imperial_sales_profile";

function loadProfile(): SavedProfile | null {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as SavedProfile) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile: SavedProfile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Private mode / blocked storage: the form simply isn't prefilled next time.
  }
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ItemIcon({ category }: { category: string }) {
  const className = "w-4 h-4 text-gold-400/80 flex-shrink-0";
  if (category === "photos") return <Images className={className} />;
  if (category === "video") return <Film className={className} />;
  return <FileText className={className} />;
}

/**
 * Starts every file download without navigating away: one hidden iframe per
 * file (the server answers with Content-Disposition: attachment), staggered
 * so browsers don't drop parallel downloads.
 */
function startDownloads(files: SaleDownloadFile[]) {
  files
    .filter((f) => f.kind === "file")
    .forEach((file, i) => {
      window.setTimeout(() => {
        const frame = document.createElement("iframe");
        frame.style.display = "none";
        frame.src = file.url;
        document.body.appendChild(frame);
        window.setTimeout(() => frame.remove(), 120_000);
      }, i * 700);
    });
}

/**
 * DocSend-style material pack: everything is ticked by default, one click
 * asks for an email (remembered for next time), then the files download
 * straight away. Brokers can register a client in the same step.
 */
export function MaterialsPanel({ slug, items, brokerTerms }: MaterialsPanelProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(items.map((i) => i.id)));
  const [step, setStep] = useState<"select" | "details" | "done">("select");
  const [email, setEmail] = useState("");
  const [isBroker, setIsBroker] = useState(false);
  const [company, setCompany] = useState("");
  const [clientName, setClientName] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<SaleDownloadFile[]>([]);

  useEffect(() => {
    const profile = loadProfile();
    if (profile) {
      setEmail(profile.email);
      setIsBroker(profile.isBroker);
      setCompany(profile.company);
    }
  }, []);

  const allSelected = selected.size === items.length;
  const fileCount = useMemo(
    () => items.filter((i) => selected.has(i.id)).reduce((sum, i) => sum + i.fileCount, 0),
    [items, selected]
  );

  if (items.length === 0) {
    return (
      <p className="text-sm text-white/50">
        Materials are being prepared — ask us on WhatsApp for the current pack.
      </p>
    );
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || selected.size === 0) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/sales/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          email,
          materialIds: Array.from(selected),
          isBroker,
          company: isBroker ? company : undefined,
          clientName: isBroker ? clientName : undefined,
          website,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const issue = data?.issues?.[0]?.message;
        setError(issue || data?.message || "Something went wrong. Please try again.");
        return;
      }

      const received: SaleDownloadFile[] = data?.files ?? [];
      saveProfile({ email, isBroker, company });
      setFiles(received);
      setStep("done");
      startDownloads(received);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    const links = files.filter((f) => f.kind === "link");
    const downloads = files.filter((f) => f.kind === "file");
    return (
      <div>
        <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/80">
            <p className="font-semibold text-white">Download started</p>
            <p className="mt-1 text-white/60">
              A copy of the links is on its way to {email}.
              {clientName && isBroker ? ` Client “${clientName}” is registered to you.` : ""}
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {[...downloads, ...links].map((file) => (
            <li key={file.url}>
              <a
                href={file.url}
                target={file.kind === "link" ? "_blank" : undefined}
                rel={file.kind === "link" ? "noopener noreferrer" : undefined}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-gold-400 transition-colors"
              >
                <span className="truncate">{file.name}</span>
                {file.kind === "link" ? (
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Download className="w-4 h-4 flex-shrink-0" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setStep("select")}
          className="mt-4 text-xs text-white/40 hover:text-gold-400 transition-colors"
        >
          Download something else
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-white/40">
          {selected.size} of {items.length} selected
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium text-gold-400/80 hover:text-gold-400 transition-colors"
        >
          {allSelected ? "Clear" : "Select all"}
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const checked = selected.has(item.id);
          return (
            <li key={item.id}>
              <label
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3.5 py-3 cursor-pointer transition-colors",
                  checked
                    ? "border-gold-500/40 bg-gold-500/[0.06]"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(item.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border",
                    checked ? "border-gold-500 bg-gold-500" : "border-white/30"
                  )}
                >
                  {checked && <Check className="h-3 w-3 text-navy-950" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <ItemIcon category={item.category} />
                    <span className="text-sm font-medium text-white">{item.title}</span>
                    {item.kind === "link" && <ExternalLink className="w-3.5 h-3.5 text-white/30" />}
                  </span>
                  {(item.description || item.sizeBytes) && (
                    <span className="mt-0.5 block text-xs text-white/45">
                      {[item.description, formatSize(item.sizeBytes)].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {step === "select" ? (
        <button
          type="button"
          disabled={selected.size === 0}
          onClick={() => setStep("details")}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3.5 text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Download className="w-4 h-4" />
          Download{fileCount > 0 ? ` ${fileCount} file${fileCount === 1 ? "" : "s"}` : ""}
        </button>
      ) : (
        <div className="mt-5 space-y-3">
          <div>
            <label htmlFor="sale-email" className="block text-xs font-medium text-white/50 mb-1.5">
              Your email — we send a copy of the links there
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                id="sale-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-lg bg-navy-950/60 border border-white/10 pl-10 pr-3 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-white/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isBroker}
              onChange={(e) => setIsBroker(e.target.checked)}
              className="h-4 w-4 accent-[#c9a84c]"
            />
            I&apos;m a broker
          </label>

          {isBroker && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Brokerage (optional)"
                autoComplete="organization"
                className="w-full rounded-lg bg-navy-950/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-gold-500/50"
              />
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Register client (optional)"
                className="w-full rounded-lg bg-navy-950/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-gold-500/50"
              />
            </div>
          )}

          {/* Honeypot — hidden from people. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          {error && (
            <p className="text-sm text-red-400/90 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3.5 text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {loading ? "Preparing…" : "Download now"}
          </button>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs text-white/35 leading-relaxed">
        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>
          {brokerTerms || "No calls, no waiting — files download instantly."}
        </span>
      </p>
    </form>
  );
}
