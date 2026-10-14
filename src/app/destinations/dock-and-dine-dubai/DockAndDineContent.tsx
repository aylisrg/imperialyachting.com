import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeHead, WakeHero, WakeList, WakeSection, WakeSplitTitle, WakeSteps } from "@/components/wake/blocks";

// Layout: Wake redesign (issue #46, design/pages/destinations-dock-and-dine-dubai
// @ c0f9dc1). General description only (Product PM): no programme dates,
// marina counts, time limits or booking windows, and no marina directory,
// because those change and we cannot keep them verified. The marina or
// restaurant confirms the details for each visit.

export const DMA_CONTACT = { label: "Dubai Maritime Authority", phone: "+971 800 8855", tel: "+9718008855" };

const BENEFITS = [
  "Short-term mooring at participating waterfront marinas while you dine.",
  "Mooring slots are booked directly with the marina or the restaurant.",
  "Tender boats at select marinas to transfer guests from yacht to restaurant jetty.",
  "Common guidelines across participating marinas.",
  "Best enjoyed in Dubai's yacht season, when waterfront dining is at its peak.",
];

const STEPS = [
  { title: "Contact the marina or restaurant", description: "Call or message the marina directly or reach the restaurant to confirm a mooring slot and its conditions." },
  { title: "Moor at the designated berth", description: "Arrive at the participating marina and dock at the allocated berth. Tender boats are available at select locations for guest transfer." },
  { title: "Dine & depart", description: "Walk straight into the waterfront restaurant, enjoy your meal, and return to your yacht. For questions about regulations or marina rules, contact Dubai Maritime Authority." },
];

export function DockAndDineContent() {
  return (
    <WakePage>
      <WakeHero
        clip="route-canal"
        alt="Cruising the Dubai Water Canal"
        crumb="Home / Destinations / Dock & Dine"
        title={<>Dock &amp;<br />Dine.</>}
        lead="Dock & Dine is a yacht-to-table initiative by Dubai Maritime Authority (DMA) and the Department of Economy and Tourism (DET): yachts can moor at participating marinas across the city, so you can step off your charter and straight into a waterfront restaurant."
      />

      <WakeSection>
        <div className="w-split">
          <WakeSplitTitle ix="01" title={<>What<br />it is.</>}>
            <p className="w-prose">A government-backed programme for yacht tourism in Dubai.</p>
          </WakeSplitTitle>
          <WakeList items={BENEFITS} dark />
        </div>
      </WakeSection>

      <WakeSection tone="light">
        <WakeHead title={<>Three<br />steps.</>}>From yacht to table.</WakeHead>
        <WakeSteps items={STEPS} cols={3} />
      </WakeSection>

      <WakeSection tone="sand" id="contacts">
        <WakeHead title="Contacts.">Conditions are set by each marina and can change, so confirm them before you sail. We do this for you on our charters.</WakeHead>
        <div className="w-facts cap">
          <div>{DMA_CONTACT.label}<b><a href={`tel:${DMA_CONTACT.tel}`}>{DMA_CONTACT.phone}</a></b></div>
          <div>Imperial Yachting<b><a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phone}</a></b></div>
          <div>Email<b><a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a></b></div>
        </div>
      </WakeSection>

      <WakeCta clip="evo43-run" alt="Evo 43 under way" title={<>Sail to<br />dinner.</>}>
        <a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">Write on WhatsApp</a>
        <a className="btn o" href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
        <p className="sub">Charter one of our yachts from Dubai Harbour and cruise to a participating marina. We&apos;ll handle the route and the mooring request; you just enjoy the meal.</p>
      </WakeCta>
    </WakePage>
  );
}
