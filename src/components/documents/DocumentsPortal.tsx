"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Building2,
  ScrollText,
  Landmark,
  BadgeCheck,
  KeyRound,
  Download,
  Lock,
  LogOut,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SITE_CONFIG } from "@/lib/constants";
import {
  DOCUMENT_CATEGORIES,
  type CompanyDocument,
  type DocumentCategory,
} from "@/lib/documents";
import {
  ACCESS_EMAIL_INPUT_ID,
  DocumentsAccessForm,
} from "./DocumentsAccessForm";

interface DocumentWithAvailability extends CompanyDocument {
  available: boolean;
}

export type AccessNotice = "granted" | "expired";

const ICONS: Record<CompanyDocument["icon"], LucideIcon> = {
  license: ScrollText,
  ejari: KeyRound,
  incorporation: Landmark,
  establishment: BadgeCheck,
  memorandum: FileText,
  profile: Building2,
};

const companyDetails = [
  { label: "Legal Name", value: SITE_CONFIG.legalName },
  { label: "Trade License", value: SITE_CONFIG.license },
  { label: "Company Registration", value: SITE_CONFIG.companyRegistration },
  { label: "Tax Registration Number (TRN)", value: SITE_CONFIG.taxId },
  {
    label: "Office Address",
    value: `${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.area}, ${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.country}`,
  },
];

const bankingDetails = [
  { label: "Bank", value: SITE_CONFIG.bankDetails.bank },
  { label: "IBAN", value: SITE_CONFIG.bankDetails.iban },
  { label: "Account Number", value: SITE_CONFIG.bankDetails.account },
  { label: "SWIFT / BIC", value: SITE_CONFIG.bankDetails.swift },
];

const CATEGORY_ORDER: DocumentCategory[] = ["legal", "corporate"];

/** Brings the email form into view and focuses it. */
function focusAccessForm() {
  document.getElementById("access")?.scrollIntoView({ behavior: "smooth", block: "center" });
  document.getElementById(ACCESS_EMAIL_INPUT_ID)?.focus({ preventScroll: true });
}

function DocumentCard({
  doc,
  unlocked,
}: {
  doc: DocumentWithAvailability;
  unlocked: boolean;
}) {
  const Icon = ICONS[doc.icon];

  return (
    <div className="group relative glass-card rounded-xl p-6 flex flex-col h-full transition-all duration-300 hover:border-gold-500/30 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center transition-colors group-hover:bg-gold-500/15">
          <Icon className="w-6 h-6 text-gold-400" strokeWidth={1.5} />
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-white/30">
          <FileText className="w-3 h-3" />
          PDF
        </span>
      </div>

      <h3 className="font-heading text-lg font-bold text-white mb-2">
        {doc.title}
      </h3>
      <p className="text-sm text-white/50 leading-relaxed mb-6 flex-1">
        {doc.description}
      </p>

      {!doc.available ? (
        <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/40 cursor-default">
          <Clock className="w-4 h-4" />
          Available on request
        </span>
      ) : unlocked ? (
        <a
          href={`/api/documents/file/${doc.slug}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-all duration-300 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
      ) : (
        <button
          type="button"
          onClick={focusAccessForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gold-500/30 px-5 py-2.5 text-sm font-semibold text-gold-300 transition-all duration-300 hover:bg-gold-500/10 hover:border-gold-500/50"
        >
          <Lock className="w-4 h-4" />
          Get access to download
        </button>
      )}
    </div>
  );
}

function AccessGrantedCard({
  email,
  justSignedIn,
  onSignOut,
  signingOut,
}: {
  email: string;
  justSignedIn: boolean;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8" role={justSignedIn ? "status" : undefined}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-white">
            {justSignedIn ? "You're in" : "Access granted"}
          </h2>
          <p className="text-xs text-white/40">All documents are unlocked</p>
        </div>
      </div>
      <p className="text-sm text-white/60">
        Signed in as <span className="text-white font-medium break-all">{email}</span>
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="#library"
          className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400"
        >
          <ArrowDown className="w-4 h-4" />
          Go to documents
        </a>
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/50 transition-colors hover:text-white/80 hover:border-white/20 disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function DocumentsPortal({
  documents,
  viewer,
  notice,
}: {
  documents: DocumentWithAvailability[];
  viewer: { email: string } | null;
  notice: AccessNotice | null;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const unlocked = viewer !== null;

  const availableCount = documents.filter((d) => d.available).length;

  // Drop ?access=… so a refresh or a shared URL doesn't repeat the notice.
  useEffect(() => {
    if (notice) {
      window.history.replaceState(null, "", `/documents${window.location.hash}`);
    }
  }, [notice]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/documents/lock", { method: "POST" });
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      {/* Hero + access */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-500/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sea-500/[0.04] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(201,168,76,0.8) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <Container className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
            <div className="max-w-2xl">
              <div className="origin-left mb-8 animate-hero-line">
                <div className="gold-line" />
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/[0.06] px-3 py-1 mb-6 animate-hero-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-xs font-medium text-gold-300/80 tracking-wide">
                  Verified &amp; licensed in Dubai
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white animate-hero-2">
                Company Documents
              </h1>

              <p className="mt-5 text-lg text-white/50 max-w-xl leading-relaxed animate-hero-3">
                Official licensing, registration and company records of{" "}
                {SITE_CONFIG.legalName}. Check our credentials below and download
                verified PDFs for your due diligence, onboarding or payments.
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-4 max-w-md animate-hero-4">
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-white/35">Trade License</dt>
                  <dd className="mt-1 font-mono text-white/80">{SITE_CONFIG.license}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-white/35">Registration</dt>
                  <dd className="mt-1 font-mono text-white/80">{SITE_CONFIG.companyRegistration}</dd>
                </div>
              </dl>
            </div>

            <div id="access" className="scroll-mt-28 animate-hero-3">
              {viewer ? (
                <AccessGrantedCard
                  email={viewer.email}
                  justSignedIn={notice === "granted"}
                  onSignOut={handleSignOut}
                  signingOut={signingOut}
                />
              ) : (
                <DocumentsAccessForm expired={notice === "expired"} />
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Document downloads */}
      <section id="library" className="py-24 sm:py-28 bg-navy-900 scroll-mt-20">
        <Container>
          <SectionHeading
            title="Document Library"
            subtitle={
              unlocked
                ? `${availableCount} of ${documents.length} documents ready to download. The remainder are available on request.`
                : `${availableCount} of ${documents.length} documents available as PDF after a quick email sign-in. The remainder are available on request.`
            }
          />

          <div className="space-y-16">
            {CATEGORY_ORDER.map((category) => {
              const docs = documents.filter((d) => d.category === category);
              if (docs.length === 0) return null;
              const meta = DOCUMENT_CATEGORIES[category];

              return (
                <div key={category}>
                  <div className="mb-6">
                    <h3 className="font-heading text-xl font-bold text-white">
                      {meta.title}
                    </h3>
                    <p className="text-sm text-white/40 mt-1">{meta.subtitle}</p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {docs.map((doc, i) => (
                      <Reveal key={doc.slug} delay={i * 80}>
                        <DocumentCard doc={doc} unlocked={unlocked} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Company Information */}
      <section className="py-24 sm:py-28 bg-navy-950">
        <Container>
          <SectionHeading
            title="Company Information"
            subtitle="Official registration and licensing details for Imperial Charter Yachting Services."
          />

          <Reveal className="glass-card rounded-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-gold-400" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">
                Registration Details
              </h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {companyDetails.map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm text-white/80 font-mono">{item.value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Banking details */}
      <section className="py-24 sm:py-28 bg-navy-900">
        <Container>
          <SectionHeading
            title="Payment Information"
            subtitle="Banking details for wire transfers and direct payments."
          />

          <Reveal className="glass-card rounded-xl p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">
                  Bank Transfer Details
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  For B2B and charter payments
                </p>
              </div>
            </div>

            {unlocked ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {bankingDetails.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm text-white/80 font-mono break-all">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border border-dashed border-white/10 p-5">
                <Lock className="w-5 h-5 text-gold-400/70 shrink-0" />
                <p className="text-sm text-white/50 flex-1">
                  To protect you from payment fraud, our bank details are shown
                  only after you confirm your email.
                </p>
                <button
                  type="button"
                  onClick={focusAccessForm}
                  className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg border border-gold-500/30 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/10"
                >
                  Get access
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-xs text-white/30">
                Please reference your booking number when making transfers.
                Contact{" "}
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="text-gold-400/60 hover:text-gold-400 transition-colors"
                >
                  {SITE_CONFIG.email}
                </a>{" "}
                for payment queries.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Trust footer */}
      <section className="py-20 bg-navy-950 border-t border-white/5">
        <Container>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-gold-400" />
            </div>
            <p className="text-sm text-white/50 max-w-lg leading-relaxed">
              All documents are official records of {SITE_CONFIG.legalName}. For
              verification or additional documentation, contact{" "}
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="text-gold-400/70 hover:text-gold-400 transition-colors"
              >
                {SITE_CONFIG.email}
              </a>{" "}
              or call{" "}
              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="text-gold-400/70 hover:text-gold-400 transition-colors"
              >
                {SITE_CONFIG.phone}
              </a>
              .
            </p>
            {viewer && (
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-white/40 transition-colors hover:text-white/70 disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out ({viewer.email})
              </button>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
