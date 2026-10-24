import Link from "next/link";
import { managementFAQ } from "@/data/faq";
import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeFaq, WakeHead, WakeHero, WakeMedia, WakeSection, WakeSteps } from "@/components/wake/blocks";

// Layout: Wake redesign (issue #46, design/pages/services-management @ c0f9dc1). Copy unchanged.

const valueProps = [
  { title: "Revenue Generation", description: "Maximize your yacht's earning potential through our optimized charter management, dynamic pricing, and extensive B2B booking network." },
  { title: "Full Maintenance", description: "Comprehensive maintenance scheduling and oversight, ensuring your vessel is always in peak condition and ready for charter." },
  { title: "Crew Management", description: "Professional crew recruitment, training, and management. We handle everything from hiring to ongoing performance standards." },
];

const managementServices = [
  { title: "Charter Management", description: "End-to-end charter operations including booking management, guest coordination, and itinerary planning to keep your yacht booked and profitable." },
  { title: "Accounting & Reporting", description: "Transparent financial reporting with monthly statements, expense tracking, and revenue analytics so you always know how your asset performs." },
  { title: "Maintenance Scheduling", description: "Proactive maintenance planning including annual surveys, engine servicing, hull cleaning, and equipment inspections to protect your investment." },
  { title: "Crew Hiring & Training", description: "Recruitment of experienced, licensed crew members with ongoing training in safety, hospitality, and vessel-specific operations." },
  { title: "Marketing & Listings", description: "Professional photography, multi-platform listing management, social media marketing, and SEO to drive charter demand year-round." },
  { title: "Berth Management", description: "Securing and managing premium berth locations at Dubai Harbour and handling all marina coordination and port authority requirements." },
];

const processSteps = [
  { title: "Consultation", description: "We assess your yacht, understand your goals, and outline a tailored management strategy." },
  { title: "Onboarding", description: "Vessel inspection, crew setup, marketing materials, and listing activation across all channels." },
  { title: "Operations", description: "Full-service management with regular reporting, optimized scheduling, and ongoing maintenance." },
  { title: "Growth", description: "Continuous optimization of pricing, marketing, and operations to maximize your returns." },
];

const stats = [
  { label: "Yachts we manage", value: "40-60ft" },
  { label: "Dubai charter season", value: "Oct-Apr" },
  { label: "Owner statement", value: "Monthly" },
];

export function YachtManagementPageContent() {
  return (
    <WakePage>
      <WakeHero
        clip="moneta-golden"
        alt="Moneta, Monte Carlo 6, at golden hour"
        crumb="Home / Services / Yacht Management"
        title={<>Maximize your<br /><i>yacht&apos;s potential</i></>}
        lead="Comprehensive fleet management for yacht owners in Dubai. From charter revenue optimization to crew and maintenance, we handle everything."
      >
        <div className="acts">
          <Link className="btn" href="/contact">Schedule a Consultation</Link>
          <a className="btn o" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
        </div>
      </WakeHero>

      <WakeSection>
        <WakeHead title={<>Why partner<br />with us.</>}>
          Three pillars of professional yacht management that protect and grow your investment.
        </WakeHead>
        <WakeSteps items={valueProps} cols={3} />
      </WakeSection>

      <WakeSection tone="light">
        <WakeHead title={<>Management<br />services.</>}>
          A detailed breakdown of what our full-service yacht management includes.
        </WakeHead>
        <WakeSteps items={managementServices} cols={3} />
      </WakeSection>

      <WakeSection>
        <div className="w-split-media">
          <div>
            <span className="cap w-kicker">Revenue Potential</span>
            <h2 className="serif w-h3">
              Turn your yacht into a performing asset
            </h2>
            <p className="w-prose">
              What your yacht earns comes down to three things: her size, her condition, and how many weeks you keep
              for yourself. We won&apos;t quote you an average, because an average is a number about somebody
              else&apos;s boat. Tell us the vessel and the dates you want to hold, and we&apos;ll put the charter
              calendar and the running costs into a <span className="w-kicker">written projection</span>{" "}
              before you sign anything. Pricing across the season is our job. The arithmetic stays yours to check.
            </p>
            <div className="w-stats">
              {stats.map((s) => (
                <div key={s.label}><b>{s.value}</b><span className="cap">{s.label}</span></div>
              ))}
            </div>
          </div>
          <WakeMedia clip="harbour-traffic" alt="Yacht traffic at Dubai Harbour" className="tall" />
        </div>
      </WakeSection>

      <WakeSection tone="light">
        <WakeHead title={<>How we<br />work.</>}>From initial consultation to ongoing growth optimization.</WakeHead>
        <WakeSteps items={processSteps} />
      </WakeSection>

      <WakeFaq title={<>Management<br />FAQ.</>} lead="Common questions about our yacht management services." items={managementFAQ} />

      <WakeCta clip="vd40-skyline" alt="Van Dutch 40 with the Dubai Marina skyline" title={<>Schedule a<br />consultation.</>}>
        <Link className="btn" href="/contact">Get in Touch</Link>
        <a className="btn o" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
        <p className="sub">Let us show you how Imperial Yachting can maximize your yacht&apos;s potential in Dubai&apos;s charter market.</p>
        <p className="contacts cap">
          <a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phone}</a>
          <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
        </p>
      </WakeCta>
    </WakePage>
  );
}
