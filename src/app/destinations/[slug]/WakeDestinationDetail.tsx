import Link from "next/link";
import type { Destination } from "@/types/common";
import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeBand, WakeCta, WakeHead, WakeHero, WakeList, WakeMedia, WakeSection, WakeSplitTitle } from "@/components/wake/blocks";
import { destinationClips } from "@/components/wake/destinationClips";
import { destinationFacts } from "./facts";

// Layout: Wake redesign (issue #46, design/pages/destinations-palm-jumeirah
// @ c0f9dc1). Every figure comes from the destination's own data; a fact the
// data does not have is left out, not filled in.

export function WakeDestinationDetail({ destination: d, related }: { destination: Destination; related: Destination[] }) {
  const clips = destinationClips(d.slug);
  const facts = destinationFacts(d);
  return (
    <WakePage>
      <WakeHero clip={clips.hero} alt={d.name} crumb={`Home / Destinations / ${d.name}`} title={d.name} lead={d.shortDescription} />

      {facts.length ? (
        <WakeSection>
          <div className="w-facts cap">
            {facts.map((f) => <div key={f.label}>{f.label}<b>{f.value}</b></div>)}
          </div>
        </WakeSection>
      ) : null}

      <WakeSection>
        <div className="w-split">
          <WakeSplitTitle ix="01" title={<>The<br />route.</>}>
            <p className="w-prose">{d.description}</p>
          </WakeSplitTitle>
          {d.highlights?.length ? <WakeList items={d.highlights} dark /> : null}
        </div>
      </WakeSection>

      {d.itinerary?.length || d.whatIncluded?.length ? (
        <WakeSection tone="light">
          <div className="w-split">
            {d.itinerary?.length ? (
              <div><WakeHead title="Itinerary." /><WakeList items={d.itinerary} /></div>
            ) : null}
            {d.whatIncluded?.length ? (
              <div><WakeHead title="Included." /><WakeList items={d.whatIncluded} /></div>
            ) : null}
          </div>
        </WakeSection>
      ) : null}

      <WakeBand clip={clips.band} alt={`On the water near ${d.name}`} />

      {related.length ? (
        <WakeSection>
          <WakeHead title={<>More<br />routes.</>}>Every route starts at Dubai Harbour.</WakeHead>
          <div className="w-dgrid">
            {related.map((r) => (
              <Link className="w-dcard" href={`/destinations/${r.slug}`} key={r.slug}>
                <WakeMedia clip={destinationClips(r.slug).card} alt={r.name} />
                <span className="cap w-kicker">{r.sailingTime}</span>
                <h3 className="serif">{r.name}</h3>
                <p>{r.shortDescription}</p>
              </Link>
            ))}
          </div>
        </WakeSection>
      ) : null}

      <WakeCta clip="ilia-onboard" alt="Ilia on board" title={<>Cruise to<br />{d.name}.</>}>
        <a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">Write on WhatsApp</a>
        <a className="btn o" href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
      </WakeCta>
    </WakePage>
  );
}
