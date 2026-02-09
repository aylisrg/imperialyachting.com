"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Building2,

  ScrollText,
  Shield,
  ClipboardCheck,
  Landmark,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const companyDetails = [
  {
    label: "Legal Name",
    value: SITE_CONFIG.legalName,
  },
  {
    label: "Trade License",
    value: SITE_CONFIG.license,
  },
  {
    label: "Company Registration",
    value: SITE_CONFIG.companyRegistration,
  },
  {
    label: "Tax Registration Number (TRN)",
    value: SITE_CONFIG.taxId,
  },
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

const guestDocuments = [
  {
    title: "Charter Agreement",
    description:
      "Standard charter agreement covering terms, itinerary, and guest responsibilities for all bookings.",
    icon: ScrollText,
  },
  {
    title: "Safety Briefing",
    description:
      "Comprehensive safety briefing document provided to all guests before departure, covering vessel safety equipment and procedures.",
    icon: Shield,
  },
  {
    title: "Insurance Certificate",
    description:
      "Proof of comprehensive marine insurance covering all vessels in the Imperial Yachting fleet.",
    icon: ClipboardCheck,
  },
];

export function DocumentsPageClient() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
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
          <div className="max-w-3xl">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 1,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="origin-left mb-8"
            >
              <div className="gold-line" />
            </motion.div>

            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mb-6"
            >
              <FileText
                className="w-8 h-8 text-gold-500/60"
                strokeWidth={1.5}
              />
            </motion.div>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            >
              Documents &amp; Resources
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-5 text-lg text-white/50 max-w-xl leading-relaxed"
            >
              Company information, banking details, and guest documentation for
              partners and charter clients.
            </motion.p>
          </div>
        </Container>
      </section>

      {/* Company Information */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Company Information"
            subtitle="Official registration and licensing details for Imperial Charter Yachting Services."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            custom={0}
            className="glass-card rounded-xl p-8"
          >
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
                  <p className="text-sm text-white/80 font-mono">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Payment / Banking Details */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="Payment Information"
            subtitle="Banking details for wire transfers and direct payments."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            custom={0}
            className="glass-card rounded-xl p-8 max-w-2xl"
          >
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
          </motion.div>
        </Container>
      </section>

      {/* Guest Documents */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Guest Documents"
            subtitle="Standard documents provided to all charter guests. Available upon booking confirmation."
          />

          <div className="grid gap-6 md:grid-cols-3">
            {guestDocuments.map((doc, i) => (
              <motion.div
                key={doc.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                className="glass-card rounded-xl p-6 group"
              >
                <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center mb-5">
                  <doc.icon className="w-6 h-6 text-gold-400" />
                </div>

                <h3 className="font-heading text-lg font-bold text-white mb-2">
                  {doc.title}
                </h3>

                <p className="text-sm text-white/50 leading-relaxed mb-4">
                  {doc.description}
                </p>

                <Badge variant="white">Available on request</Badge>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-white/40">
              To request any documents, please contact us at{" "}
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="text-gold-400/60 hover:text-gold-400 transition-colors"
              >
                {SITE_CONFIG.email}
              </a>{" "}
              or call{" "}
              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="text-gold-400/60 hover:text-gold-400 transition-colors"
              >
                {SITE_CONFIG.phone}
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
