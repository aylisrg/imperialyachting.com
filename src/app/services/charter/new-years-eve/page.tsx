import type { Metadata } from "next";
import Link from "next/link";
import { WakePage } from "@/components/wake/WakePage";
import { WakeHead, WakeHero, WakeList, WakeSection } from "@/components/wake/blocks";
import { SITE_CONFIG } from "@/lib/constants";
import { newYearsEveDate, newYearsEveInquiry, newYearsEveOffers, newYearsEvePath, showNewYearsEveInquiry } from "@/lib/new-year-charters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Year’s Eve 2026 Yacht Charter Dubai | Imperial Yachting",
  description: "Five-hour private New Year’s Eve yacht charters in Dubai. Enquire for a confirmed slot, berth and route. Prices include VAT.",
  alternates: { canonical: `${SITE_CONFIG.url}${newYearsEvePath}` },
};

export default function NewYearsEveCharterPage() {
  const showInquiry = showNewYearsEveInquiry();
  return (
    <WakePage>
      <WakeHero
        clip="harbour-sunset"
        alt="Dubai Harbour at sunset"
        crumb="Home / Services / Yacht Charter / New Year’s Eve"
        title={<>New Year’s Eve<br />on the water.</>}
        lead={`${newYearsEveDate} · Dubai · One private five-hour charter slot per booking`}
      />
      {showInquiry ? (
        <>
          <WakeSection>
            <WakeHead title="Five hours. Your yacht.">
              Enquiry only. We confirm availability, start time, departure berth, route and licensed guest capacity before you commit. No specific fireworks view is guaranteed.
            </WakeHead>
            <div className="w-day-fleet">
              {newYearsEveOffers.map((offer) => (
                <article className="w-day-card w-day-body" key={offer.name}>
                  <h3 className="serif">{offer.name}</h3>
                  <div className="w-day-money"><strong>AED {offer.amount.toLocaleString("en-US")}</strong><span>VAT included · per yacht</span></div>
                  <a className="btn" href={newYearsEveInquiry(offer)} target="_blank" rel="noopener noreferrer" aria-label={`Enquire about New Year’s Eve on ${offer.name}`}>Enquire <span aria-hidden="true">↗</span></a>
                </article>
              ))}
            </div>
          </WakeSection>
          <WakeSection tone="light">
            <WakeHead title="What’s included.">The ordinary 4+1 hourly promotion does not apply.</WakeHead>
            <WakeList items={["Captain and crew", "Fuel for the agreed route", "Drinks and light snacks", "Dinner and decorations quoted separately"]} />
          </WakeSection>
        </>
      ) : (
        <WakeSection><WakeHead title="Enquiries closed.">The 2026 New Year’s Eve offer has ended.</WakeHead></WakeSection>
      )}
      <WakeSection><Link className="btn o" href="/services/charter">View regular charter options</Link></WakeSection>
    </WakePage>
  );
}
