import { MARINAS } from "@/data/dockAndDine";
import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeHead, WakeHero, WakeList, WakeSection, WakeSplitTitle, WakeSteps } from "@/components/wake/blocks";

// Layout: Wake redesign (issue #46, design/pages/destinations-dock-and-dine-dubai
// @ c0f9dc1). Copy and the marina directory are the live page's.

const BENEFITS = [
  "Complimentary berth for up to one hour at any participating marina while you dine.",
  "Book your mooring slot in as little as 5 minutes, with windows up to 60 minutes before arrival.",
  "Tender boats at select marinas to transfer guests from yacht to restaurant jetty.",
  "Uniform guidelines across all 20 marinas ensure a smooth, hassle-free experience every time.",
  "Designed for Dubai's yacht season (October–April) when demand for waterfront dining is highest.",
];

const STEPS = [
  { title: "Contact the marina or restaurant", description: "Call or message the marina directly (see contacts below) or reach the restaurant to confirm a mooring slot. Booking windows range from 5 to 60 minutes." },
  { title: "Moor at the designated berth", description: "Arrive at the participating marina and dock at the allocated berth. Mooring is complimentary for up to one hour. Tender boats are available at select locations for guest transfer." },
  { title: "Dine & depart", description: "Walk straight into the waterfront restaurant, enjoy your meal, and return to your yacht. For questions about regulations or marina rules, call the DMA Coastguard line at +971 800 8855." },
];

export function DockAndDineContent() {
  return (
    <WakePage>
      <WakeHero
        clip="route-canal"
        alt="Cruising the Dubai Water Canal"
        crumb="Home / Destinations / Dock & Dine"
        title={<>Dock &amp;<br />Dine.</>}
        lead="Since September 2025, the Dock & Dine initiative by Dubai Maritime Authority (DMA) and the Department of Economy and Tourism (DET) lets yachts moor for free at 20 marinas across the city, so you can step off your charter and straight into a waterfront restaurant."
      />

      <WakeSection>
        <div className="w-split">
          <WakeSplitTitle ix="01" title={<>What<br />it is.</>}>
            <p className="w-prose">A government-backed programme turning Dubai into the world&apos;s leading yacht-tourism hub.</p>
          </WakeSplitTitle>
          <WakeList items={BENEFITS} dark />
        </div>
      </WakeSection>

      <WakeSection tone="light">
        <WakeHead title={<>Three<br />steps.</>}>Three simple steps from yacht to table.</WakeHead>
        <WakeSteps items={STEPS} cols={3} />
      </WakeSection>

      <WakeSection tone="sand" id="marinas">
        <WakeHead title={<>All {MARINAS.length}<br />marinas.</>}>
          The complete directory of participating marinas, waterfront restaurants, and contact details.
        </WakeHead>
        <div className="w-table-wrap">
          <table className="w-table">
            <thead>
              <tr><th scope="col">Marina</th><th scope="col">Location</th><th scope="col">Restaurants</th><th scope="col">Contact</th></tr>
            </thead>
            <tbody>
              {MARINAS.map((m) => (
                <tr key={m.name}><td>{m.name}</td><td>{m.location}</td><td>{m.restaurants}</td><td>{m.contact}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="cap">DMA general contact: <a href="tel:+9718008855">+971 800 8855</a> (Coastguard / Marine Operations)</p>
      </WakeSection>

      <WakeCta clip="evo43-run" alt="Evo 43 under way" title={<>Sail to<br />dinner.</>}>
        <a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">Write on WhatsApp</a>
        <a className="btn o" href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
        <p className="sub">Charter one of our yachts from Dubai Harbour and cruise to any of the 20 Dock &amp; Dine marinas. We&apos;ll handle the route, the mooring, and the reservation; you just enjoy the meal.</p>
      </WakeCta>
    </WakePage>
  );
}
