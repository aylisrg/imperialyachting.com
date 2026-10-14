import Link from "next/link";
import { SITE_CONFIG, SPEEDBOAT_TRANSFER } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeHead, WakeHero, WakeList, WakeMedia, WakeSection, WakeSplitTitle, WakeSteps } from "@/components/wake/blocks";

// Copy: IY-406 (Copywriter); offer: IY-358 (Lawyer). Layout: Wake redesign (issue #46). Copy unchanged.

const whatItIs = [
  {
    title: "From the water, not the street",
    description: "We collect you where you are on the water: a yacht at anchor, an island beach, a pier.",
  },
  {
    title: "Private, not shared",
    description: "A private transfer by water, not a seat on a shared boat. The whole Van Dutch is yours for the hours you book.",
  },
  {
    title: `Up to ${SPEEDBOAT_TRANSFER.maxGuests} guests`,
    description: "Your party travels together, with up to 10 guests aboard.",
  },
];

const pickupNotes = [
  { title: "Your yacht, an island or a pier", description: "Tell us where you are, and we come alongside." },
  { title: "Burj Al Arab", description: "Closed to boats." },
  { title: "Private hotel waters and port areas", description: "Need approval first; we will contact you and clear it before the trip." },
  { title: "Dubai Harbour", description: "Where we drop you, unless you ask otherwise." },
];

const priceFacts = [
  "From 08:00 to 22:00; the boat leaves no sooner than 45 minutes after you order",
  "Minimum one hour, counted from the moment the boat leaves Dubai Harbour until it is back",
  "You pay in full in advance, by card, Apple Pay or Google Pay",
  "The app shows the exact figure before you pay",
];

const steps = [
  { title: "Open the order", description: "Open the order in Telegram and tap Order a transfer." },
  { title: "Show where you are", description: "Share your location or move the pin to the water." },
  { title: "Choose time and drop-off", description: "Choose the time and the drop-off." },
  { title: "Check and pay", description: "Check the price and pay." },
];

const price = SPEEDBOAT_TRANSFER.pricePerHourAed.toLocaleString("en-US");

export function SpeedboatTransferContent() {
  return (
    <WakePage>
      <WakeHero
        clip="hero-vd40-speed"
        alt="Van Dutch speedboat on the water in Dubai"
        crumb="Water taxi · Dubai"
        short={false}
        title={<>Speedboat Transfer in Dubai: <i>a Van Dutch to your yacht</i></>}
        lead="Van Dutch is the tender you see chosen at superyachts, and you can spot it from the deck far off. We run one as a water taxi. Tell us where you are, and we come alongside your yacht, an island or a beach-club pier, take your party of up to 10 guests to Dubai Harbour, or to another marina you name."
      >
        <div className="acts">
          <a className="btn" href={SPEEDBOAT_TRANSFER.orderUrl} target="_blank" rel="noopener noreferrer">Order in Telegram</a>
          <a className="btn o" href="#how">How to book</a>
        </div>
      </WakeHero>

      <WakeSection id="what">
        <WakeHead title={<>What<br />it is.</>}>A private transfer by water, not a seat on a shared boat.</WakeHead>
        <WakeSteps items={whatItIs} cols={3} />
      </WakeSection>

      <WakeSection tone="light" id="zone">
        <div className="w-split">
          <WakeSplitTitle ix="01" title={<>Where we<br />pick you up.</>}>
            <p>Not every spot is reachable. If your point cannot be used, we offer the nearest one that can.</p>
          </WakeSplitTitle>
          <WakeList items={pickupNotes.map((n) => <><b>{n.title}</b>. {n.description}</>)} />
        </div>
      </WakeSection>

      <WakeSection id="price">
        <div className="w-split-media">
          <div>
            <span className="cap" style={{ color: "var(--copper)" }}>When and how much</span>
            <p className="w-price serif">{price} AED</p>
            <p className="cap" style={{ color: "var(--sand)" }}>per hour · VAT included</p>
            <p style={{ marginTop: 16, color: "var(--mute)" }}>The minimum is one hour.</p>
            <div style={{ marginTop: 40 }}><WakeList dark items={priceFacts} /></div>
          </div>
          <WakeMedia clip="vd40-aerial" alt="Van Dutch 40 from above" className="tall" />
        </div>
      </WakeSection>

      <WakeSection tone="light" id="how">
        <WakeHead title={<>How to<br />book.</>}>
          We confirm the point, or offer the nearest workable one, before the trip. Your booking exists once you
          receive our confirmation. A hard case goes to our duty manager, who contacts you; you pay nothing until
          it is settled.
        </WakeHead>
        <WakeSteps items={steps} />
        <div style={{ marginTop: 56 }}>
          <a className="btn" href={SPEEDBOAT_TRANSFER.orderUrl} target="_blank" rel="noopener noreferrer">Order in Telegram</a>
          <p style={{ marginTop: 16, fontSize: 13 }}>
            Opens the ordering app in Telegram. No Telegram?{" "}
            <a className="lnk" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">Write to the manager on WhatsApp</a>
            {" · "}
            <Link className="lnk" href={SPEEDBOAT_TRANSFER.termsPath}>Terms of Service</Link>
          </p>
        </div>
      </WakeSection>

      <WakeSection tone="sand" id="cancellation">
        <div className="w-split">
          <WakeSplitTitle ix="02" title={<>If plans<br />change.</>} />
          <div>
            <p style={{ fontSize: 17 }}>
              Cancel more than 48 hours before the start and you get everything back. Between 24 and 48 hours, 50%.
              Less than 24 hours, or if you do not show up, nothing, unless we re-sell your slot, in which case we
              refund you in full. If we cancel because of weather, safety or the boat, you choose between a full
              refund and a new date. Refunds go to the card you paid with within 2 business days; your bank may show
              them after 5 to 10.
            </p>
            <p style={{ marginTop: 24 }}>
              Full terms:{" "}
              <Link className="lnk" href={SPEEDBOAT_TRANSFER.termsPath}>Terms of Service</Link>
            </p>
          </div>
        </div>
      </WakeSection>

    </WakePage>
  );
}
