import Link from "next/link";
import { DayCharterCards, ExtendedCharters } from "@/components/wake/DayCharters";
import { charterFAQ } from "@/data/faq";
import { SITE_CONFIG } from "@/lib/constants";
import { WakePage } from "@/components/wake/WakePage";
import { WakeBand, WakeCta, WakeFaq, WakeHead, WakeHero, WakeList, WakeSection, WakeSplitTitle, WakeSteps } from "@/components/wake/blocks";

const inclusions = [
  "Professional captain & crew",
  "Fuel for the agreed standard Dubai Harbour route",
  "Drinking water",
];

const destinations = [
  { title: "Palm Jumeirah", description: "Cruise along the iconic palm-shaped island and its luxury resorts." },
  { title: "Dubai Marina Skyline", description: "Take in the stunning high-rise views from the water." },
  { title: "Ain Dubai & Bluewaters", description: "Pass the world's largest observation wheel up close." },
  { title: "World Islands", description: "Venture out to the man-made archipelago for open-water views." },
];

const processSteps = [
  { title: "Inquire", description: "Share your dates, group size, and preferences." },
  { title: "Customize", description: "We recommend the perfect yacht and itinerary." },
  { title: "Confirm", description: "Secure your booking with a simple confirmation." },
  { title: "Experience", description: "Board at Dubai Harbour or Marasi Bay and enjoy your cruise." },
];

export function CharterPageContent({ hourlyRates }: { hourlyRates: Record<string, number | null> }) {
  return (
    <WakePage>
      <WakeHero
        clip="moneta-golden"
        alt="Moneta, Monte Carlo 6, at golden hour"
        crumb="Home / Services / Yacht Charter"
        title={<>Unforgettable yacht<br /><i>experiences in Dubai</i></>}
        lead="All-inclusive, crewed luxury yacht charters on our privately owned fleet. Sunset cruises, celebrations, and corporate events departing from Dubai Harbour and Marasi Bay."
      >
        <div className="acts">
          <a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">Book via WhatsApp</a>
          <Link className="btn o" href="/fleet">View Fleet</Link>
        </div>
      </WakeHero>

      <WakeSection>
        <WakeHead title={<>A full day<br />on the water.</>}>Eight hours aboard your own crewed yacht. Choose the boat and we’ll plan the day with you.</WakeHead>
        <DayCharterCards hourlyRates={hourlyRates} />
        <ExtendedCharters />
      </WakeSection>

      <WakeSection tone="light">
        <div className="w-split">
          <WakeSplitTitle ix="01" title={<>What&apos;s<br />included.</>}>
            <p>Your standard eight-hour charter starts and ends at Dubai Harbour.</p>
            <p>We confirm the route, timing and available extras before you book.</p>
          </WakeSplitTitle>
          <WakeList items={inclusions} />
        </div>
      </WakeSection>

      <WakeBand clip="vd40-skyline" alt="Guests on board the Van Dutch 40, Dubai Marina skyline" />

      <WakeSection>
        <WakeHead title={<>Popular<br />routes.</>}>Iconic Dubai destinations accessible from our berths at Dubai Harbour and Marasi Bay.</WakeHead>
        <WakeSteps items={destinations} />
      </WakeSection>

      <WakeSection tone="light">
        <WakeHead title={<>Booking<br />process.</>}>Four simple steps to your dream charter.</WakeHead>
        <WakeSteps items={processSteps} />
      </WakeSection>

      <WakeFaq title={<>Charter<br />FAQ.</>} lead="Common questions about our yacht charter services." items={charterFAQ} />

      <WakeCta clip="harbour-sunset" alt="Dubai Harbour at sunset" title={<>Book your<br />charter today.</>}>
        <a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
        <Link className="btn o" href="/contact">Send Inquiry</Link>
        <p className="sub">
          Whether it&apos;s a sunset cruise or a week-long adventure, our team is ready to plan your perfect experience.
        </p>
        <p className="contacts cap">
          <a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phone}</a>
          <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
        </p>
      </WakeCta>
    </WakePage>
  );
}
