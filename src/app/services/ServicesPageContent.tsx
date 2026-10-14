import Link from "next/link";
import { services } from "@/data/services";
import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeHead, WakeHero, WakeMedia, WakeSection, WakeSteps } from "@/components/wake/blocks";

// Clip per service row (design/pages/services @ c0f9dc1); no clip repeats on the page.
const CLIPS: Record<string, string> = {
  "/services/charter": "vd40-aerial",
  "/services/yacht-management": "moneta-golden",
  "/services/cinematography": "route-skyline",
  "/services/brandwave": "route-canal",
};

const processSteps = [
  { title: "Inquire", description: "Reach out via WhatsApp, email, or our contact form with your preferred dates and requirements." },
  { title: "Customize", description: "Our team crafts a tailored proposal with yacht selection, itinerary, and all the details." },
  { title: "Confirm", description: "Review your bespoke package, confirm the booking, and we handle all the preparation." },
  { title: "Experience", description: "Step aboard and enjoy a flawless luxury yacht experience on the waters of Dubai." },
];

export function ServicesPageContent() {
  return (
    <WakePage>
      <WakeHero
        clip="evo43-run"
        alt="Evo 43 running off Dubai"
        crumb="Home / Services"
        title={<>Comprehensive<br />yacht services.</>}
        lead="From luxury charters and fleet management to cinematography and branding, Imperial Yachting delivers end-to-end solutions for the yachting industry."
      />

      <WakeSection>
        <WakeHead title={<>What we<br />offer.</>}>
          Four pillars of excellence covering every aspect of the luxury yachting experience.
        </WakeHead>
        {services.map((s, i) => (
          <div className="w-row" key={s.href}>
            <span className="ix">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="serif">{s.title}</h3>
              <p>{s.description}</p>
              <Link className="cap lnk" href={s.href}>Learn more →</Link>
              {s.externalUrl && (
                <a className="cap ext" href={s.externalUrl} target="_blank" rel="noopener noreferrer">brandwave.imperialyachting.com ↗</a>
              )}
            </div>
            <WakeMedia clip={CLIPS[s.href] ?? "vd40-aerial"} alt={s.title} />
          </div>
        ))}
      </WakeSection>

      <WakeSection tone="light">
        <WakeHead title={<>How it<br />works.</>}>
          From your first inquiry to stepping aboard, we make the process seamless.
        </WakeHead>
        <WakeSteps items={processSteps} />
      </WakeSection>

      <WakeCta clip="harbour-sunset" alt="Dubai Harbour at sunset" title={<>Ready to get<br />started?</>}>
        <a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
        <Link className="btn o" href="/contact">Send Inquiry</Link>
      </WakeCta>
    </WakePage>
  );
}
