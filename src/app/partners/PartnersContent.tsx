import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeHead, WakeHero, WakeList, WakeMedia, WakeSection, WakeSplitTitle } from "@/components/wake/blocks";
import { NAMED_PARTNERS, type NamedPartner } from "./partners";
import { fleetLines } from "./lines";

// Layout: Wake redesign (issue #46, design/pages/partners @ c0f9dc1). New page.
// No partners are invented: the partners block is hidden entirely until a
// partner agrees to be named (./partners.ts). Fleet lines come from the fleet data.

const WHO = [
  { title: "Travel agents & concierges", text: "Book our own fleet for your clients directly with the operator. One team, one point of contact, from proposal to boarding.", clip: "moneta-golden", alt: "Moneta at golden hour" },
  { title: "Event & production teams", text: "Charter, on-water filming and branding through our Cinematographic Bureau and Brandwave, on the same yachts.", clip: "evo43-run", alt: "Evo 43 under way" },
  { title: "Service providers", text: "Catering, crew, maintenance and marina services. We work with long-term partners on our own fleet.", clip: "vd40-aerial", alt: "Van Dutch 40 from above" },
] as const;

export function PartnersContent({ partners = NAMED_PARTNERS }: { partners?: readonly NamedPartner[] }) {
  return (
    <WakePage>
      <WakeHero
        clip="hero-vd40-speed"
        alt="Van Dutch 40 at speed off Dubai Harbour"
        crumb="Home / Partners"
        title={<>Work<br />with us.</>}
        lead="For agents and service providers. Direct with the fleet owner at Dubai Harbour."
      >
        <div className="acts"><a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">Request terms</a></div>
      </WakeHero>

      <WakeSection>
        <WakeHead title={<>Who we<br />work with.</>}>Owner, not broker: you deal with the company that owns, crews and maintains the yachts.</WakeHead>
        {WHO.map((w, i) => (
          <div className="w-split-media about-person" key={w.title}>
            <div>
              <span className="cap w-kicker">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="serif w-h3">{w.title}</h3>
              <p className="w-prose">{w.text}</p>
            </div>
            <WakeMedia clip={w.clip} alt={w.alt} />
          </div>
        ))}
      </WakeSection>

      <WakeSection tone="light">
        <div className="w-split">
          <WakeSplitTitle ix="01" title={<>Our<br />fleet.</>}>
            <p className="w-prose">Every charter includes crew, fuel for standard cruising routes and standard amenities.</p>
          </WakeSplitTitle>
          <WakeList items={fleetLines()} />
        </div>
      </WakeSection>

      {partners.length ? (
        <WakeSection id="partners-list">
          <WakeHead title={<>Our<br />partners.</>}>Companies we work with, named with their agreement.</WakeHead>
          <WakeList items={partners.map((p) => (p.url ? <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">{p.name}</a> : p.name))} dark />
        </WakeSection>
      ) : null}

      <WakeSection tone="sand">
        <div className="w-facts cap">
          <div>Company<b>Imperial Charter Yachting Services L.L.C</b></div>
          <div>Licence<b>{SITE_CONFIG.license}</b></div>
          <div>Base<b>Dubai Harbour</b></div>
          <div>Services<b>Charter · Management · Cinematography · Brandwave</b></div>
        </div>
      </WakeSection>

      <WakeCta clip="harbour-sunset" alt="Dubai Harbour at sunset" title={<>Let&apos;s talk<br />terms.</>}>
        <a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">Request terms</a>
        <a className="btn o" href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
      </WakeCta>
    </WakePage>
  );
}
