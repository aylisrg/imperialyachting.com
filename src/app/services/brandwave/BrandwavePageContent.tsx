import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeHead, WakeHero, WakeSection, WakeSteps } from "@/components/wake/blocks";

// Layout: Wake redesign (issue #46, design/pages/services-brandwave @ c0f9dc1). Copy unchanged.

const brandwaveServices = [
  { title: "Brand Identity", description: "Complete visual identity design for yacht companies and maritime businesses — logo, typography, color systems, and brand guidelines." },
  { title: "Yacht Wrapping", description: "Custom yacht wrapping and exterior branding. Premium vinyl graphics that transform your vessel into a floating showcase." },
  { title: "Digital Campaigns", description: "Performance-driven digital advertising on Google, Meta, and LinkedIn targeting luxury yacht clientele in the UAE and internationally." },
  { title: "Luxury Positioning", description: "Strategic brand positioning in the luxury yachting market. We craft narratives that resonate with high-net-worth audiences." },
  { title: "Website & SEO", description: "Bespoke website design and search engine optimization to establish your digital presence and drive qualified leads." },
  { title: "Social Media", description: "End-to-end social media management including content strategy, production, community management, and influencer partnerships." },
];

const processSteps = [
  { title: "Discovery", description: "Deep dive into your brand, audience, competitive landscape, and business objectives." },
  { title: "Strategy", description: "Develop a comprehensive branding and marketing roadmap tailored to your goals." },
  { title: "Creation", description: "Design and produce all brand assets, content, and campaign materials." },
  { title: "Launch", description: "Deploy campaigns, monitor performance, and iterate for continuous improvement." },
];

const selectedWork = [
  { title: "Yacht Charter Rebrand", description: "Brand Identity" },
  { title: "Marina Club Wrapping", description: "Yacht Wrapping" },
  { title: "Luxury Charter Campaign", description: "Digital Campaign" },
  { title: "Premium Fleet Website", description: "Website Design" },
];

export function BrandwavePageContent() {
  return (
    <WakePage>
      <WakeHero
        clip="ilia-harbour"
        alt="Imperial Yachting at Dubai Harbour"
        crumb="Home / Services / Brandwave"
        title={<>Yacht branding &amp;<br /><i>marketing services</i></>}
        lead="Brandwave is Imperial Yachting's creative division dedicated to elevating yacht brands through identity design, digital marketing, and luxury positioning."
      >
        <div className="acts">
          <a className="btn" href={SITE_CONFIG.brandwave} target="_blank" rel="noopener noreferrer">Visit Brandwave ↗</a>
        </div>
      </WakeHero>

      <WakeSection>
        <WakeHead title={<>What we<br />do.</>}>Full-service branding and marketing for the luxury yachting industry.</WakeHead>
        <WakeSteps items={brandwaveServices} cols={3} />
      </WakeSection>

      <WakeSection tone="light">
        <WakeHead title={<>Our<br />process.</>}>A proven four-step approach to building powerful yacht brands.</WakeHead>
        <WakeSteps items={processSteps} />
      </WakeSection>

      <WakeSection tone="sand">
        <WakeHead title={<>Selected<br />work.</>}>A glimpse into projects delivered by the Brandwave team.</WakeHead>
        <WakeSteps items={selectedWork} />
      </WakeSection>

      <WakeCta clip="moneta-golden" alt="Moneta at golden hour" title={<>Elevate your<br />yacht brand.</>}>
        <a className="btn" href={SITE_CONFIG.brandwave} target="_blank" rel="noopener noreferrer">Visit Brandwave ↗</a>
        <Link className="btn o" href="/contact">Request a Consultation</Link>
        <p className="sub">Let Brandwave create a brand identity and marketing strategy that sets you apart in the luxury yachting market.</p>
      </WakeCta>
    </WakePage>
  );
}
