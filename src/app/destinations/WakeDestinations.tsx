import Link from "next/link";
import type { Destination } from "@/types/common";
import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeHead, WakeHero, WakeMedia, WakeSection } from "@/components/wake/blocks";
import { destinationClips } from "@/components/wake/destinationClips";
import { routeCountTitle } from "./count";

// Layout: Wake redesign (issue #46, design/pages/destinations @ c0f9dc1).
// Routes and copy come from the destinations data (Supabase, with the
// src/data fallback); nothing is written in here.

export function WakeDestinations({ destinations }: { destinations: Destination[] }) {
  return (
    <WakePage>
      <WakeHero
        clip="route-canal"
        alt="Dubai Water Canal from the water"
        crumb="Home / Destinations"
        title={<>Where<br />we go.</>}
        lead="Discover Dubai's best yacht cruise routes departing from Dubai Harbour."
      />

      <WakeSection>
        <WakeHead title={routeCountTitle(destinations.length)}>
          Routes start from Dubai Harbour Yacht Club (Van Dutch 40, Monte Carlo 6) or Marasi Bay (EVO 43).
        </WakeHead>
        <div className="w-dgrid">
          {destinations.map((d, i) => (
            <Link className="w-dcard" href={`/destinations/${d.slug}`} key={d.slug}>
              <WakeMedia clip={destinationClips(d.slug).card} alt={d.name} />
              <span className="cap w-kicker">{String(i + 1).padStart(2, "0")} · {d.sailingTime}</span>
              <h3 className="serif">{d.name}</h3>
              <p>{d.shortDescription}</p>
            </Link>
          ))}
          <Link className="w-dcard dd" href="/destinations/dock-and-dine-dubai">
            <span className="cap w-kicker">Guide</span>
            <h3 className="serif">Dock &amp; Dine Dubai</h3>
            <p>Waterfront restaurants where a yacht can moor while you dine.</p>
            <span className="cap">Read the guide →</span>
          </Link>
        </div>
      </WakeSection>

      <WakeCta clip="route-skyline" alt="Cruising past the Dubai skyline" title={<>Pick a route.<br />We pick the yacht.</>}>
        <a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">Write on WhatsApp</a>
        <a className="btn o" href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
      </WakeCta>
    </WakePage>
  );
}
