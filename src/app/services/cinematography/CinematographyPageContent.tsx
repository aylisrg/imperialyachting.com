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

// Our own clips, captioned yacht and place as in the mockup (no client projects until real ones exist).
const reel = [
  { clip: "vd40-aerial", name: "Van Dutch 40", place: "Drone, off Dubai Harbour" },
  { clip: "moneta-golden", name: "Moneta \u00b7 Monte Carlo 6", place: "Golden hour, Dubai Harbour" },
  { clip: "route-canal", name: "Dubai Water Canal", place: "On the water" },
  { clip: "vd40-skyline", name: "Van Dutch 40", place: "Guests on board, Dubai Marina" },
];

export function CinematographyPageContent() {
  return (
    <WakePage>
      <WakeHero
        clip="evo43-run"
        alt="Evo 43 under way off Dubai"
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
        <WakeHead title={<>Our<br />work.</>}>Shot by the Bureau on our own fleet. Every clip on this site comes from our channel, youtube.com/@imperial_wave.</WakeHead>
        <div className="w-reels">
          {reel.map((r) => (
            <figure className="w-reel" key={r.clip}>
              <WakeMedia clip={r.clip} alt={`${r.name}, ${r.place}`} />
              <figcaption>
                <span className="cap w-kicker">{r.place}</span>
                <b>{r.name}</b>
              </figcaption>
            </figure>
          ))}
        </div>
      </WakeSection>

      <WakeCta clip="route-skyline" alt="Dubai Marina skyline from the water" title={<>Ready to create<br />something stunning?</>}>
        <Link className="btn" href="/contact">Send an Inquiry</Link>
        <a className="btn o" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
        <p className="sub">Share your vision and our production team will craft a proposal tailored to your project.</p>
      </WakeCta>
    </WakePage>
  );
}
