import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeHead, WakeHero, WakeList, WakeMedia, WakeSection, WakeSplitTitle, WakeSteps } from "@/components/wake/blocks";

// Layout: Wake redesign (issue #46, design/pages/services-cinematography @ c0f9dc1). Copy unchanged.

const cinematographyServices = [
  { title: "Drone Footage", description: "Cinematic aerial shots of yachts, marinas, and Dubai's coastline using professional-grade drones with 4K+ capability." },
  { title: "Event Filming", description: "Full coverage of yacht events, parties, corporate gatherings, and celebrations with multi-camera setups." },
  { title: "Yacht Promo Videos", description: "High-production promotional videos showcasing your yacht's features, interiors, and sailing experience." },
  { title: "Social Media Content", description: "Scroll-stopping reels, stories, and short-form content optimized for Instagram, TikTok, and YouTube." },
  { title: "Brand Videos", description: "Brand storytelling and corporate films for yacht companies, luxury brands, and maritime businesses." },
];

const equipment = [
  "Cinema-grade cameras",
  "Licensed drone operators",
  "Professional lighting rigs",
  "Post-production editing",
  "Color grading & VFX",
  "Stabilized gimbal systems",
];

// Portfolio entries as on the live page; each is shown over one of our own existing clips.
const portfolio = [
  { title: "Monte Carlo 6 Promo", category: "Yacht Promo", clip: "moneta-golden" },
  { title: "Corporate Event Highlight", category: "Event Film", clip: "misha-onboard" },
  { title: "Dubai Marina Aerial", category: "Drone Footage", clip: "evo43-run" },
  { title: "Sunset Charter Reel", category: "Social Content", clip: "harbour-sunset" },
  { title: "Van Dutch 40 Showcase", category: "Yacht Promo", clip: "vd40-aerial" },
  { title: "Brand Story — Imperial Yachting", category: "Brand Video", clip: "ilia-harbour" },
];

export function CinematographyPageContent() {
  return (
    <WakePage>
      <WakeHero
        clip="vd40-aerial"
        alt="Aerial shot of the Van Dutch 40"
        crumb="Home / Services / Cinematographic Bureau"
        title={<>Yacht cinematography &amp;<br /><i>content production</i></>}
        lead="Professional film production, drone footage, and content creation for yachts, brands, and events. Powered by Imperial Yachting's in-house Cinematographic Bureau."
      />

      <WakeSection>
        <WakeHead title={<>Our<br />services.</>}>
          Full-spectrum video production tailored for the luxury yachting and marine industry.
        </WakeHead>
        <WakeSteps items={cinematographyServices} cols={3} />
      </WakeSection>

      <WakeSection tone="light">
        <div className="w-split">
          <WakeSplitTitle ix="01" title={<>Equipment &amp;<br />capabilities.</>}>
            <p>Professional-grade tools and expertise for exceptional results.</p>
          </WakeSplitTitle>
          <WakeList items={equipment} />
        </div>
      </WakeSection>

      <WakeSection>
        <WakeHead title={<>Our<br />work.</>}>A selection of recent projects from our Cinematographic Bureau.</WakeHead>
        <div className="w-reels">
          {portfolio.map((p) => (
            <figure className="w-reel" key={p.title}>
              <WakeMedia clip={p.clip} alt={p.title} />
              <figcaption>
                <span className="cap" style={{ color: "var(--copper)" }}>{p.category}</span>
                <b>{p.title}</b>
              </figcaption>
            </figure>
          ))}
        </div>
      </WakeSection>

      <WakeCta clip="evo43-run" alt="Evo 43 running off Dubai" title={<>Ready to create<br />something stunning?</>}>
        <Link className="btn" href="/contact">Send an Inquiry</Link>
        <a className="btn o" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
        <p className="sub">Share your vision and our production team will craft a proposal tailored to your project.</p>
      </WakeCta>
    </WakePage>
  );
}
