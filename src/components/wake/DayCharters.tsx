import Image from "next/image";
import Link from "next/link";
import { BONUS_HOURS_EVERY } from "@/lib/booking/constants";
import { charterInquiry, fullDayCharters, fullDayOffer, standardDayIncludes, type FullDayCharter } from "@/lib/day-charters";

export function FullDayRate({ charter, hourlyRate = null }: { charter: FullDayCharter; hourlyRate?: number | null }) {
  const offer = fullDayOffer(charter.price, hourlyRate);
  const total = `AED ${offer.amount.toLocaleString("en-US")}`;
  const inquiry = offer.promotional
    ? `the 8-hour private charter on ${charter.name} and the qualifying ${total} promotion (VAT included)`
    : `the 8-hour private charter on ${charter.name} at the standard ${total} rate (VAT included)`;
  return (
    <div className="w-day-rate">
      <div className="cap w-mute">Full day · 8 hours</div>
      <div className="w-day-money"><strong>{offer.promotional ? `From ${total}` : total}</strong><span>VAT included · per yacht</span></div>
      {offer.promotional && <p className="w-day-promo w-mute">{BONUS_HOURS_EVERY}+1 on qualifying dates · standard AED {offer.standardAmount.toLocaleString("en-US")}</p>}
      <a className="btn" href={charterInquiry(inquiry)} target="_blank" rel="noopener noreferrer" aria-label={`Check availability for ${charter.name}`}>Check availability <span aria-hidden="true">↗</span></a>
      <details>
        <summary>What’s included</summary>
        <p>{standardDayIncludes} Eight hours is the charter window, not continuous sailing. Catering, extended cruising, other marina fees and extra time are quoted separately. Alcohol is not included.</p>
        <Link href="/terms">Booking and cancellation terms</Link>
      </details>
    </div>
  );
}

export function DayCharterCards({ hourlyRates = {} }: { hourlyRates?: Record<string, number | null> }) {
  return (
    <div className="w-day-fleet">
      {fullDayCharters.map((charter) => (
        <article className="w-day-card" key={charter.slug}>
          <Link href={`/fleet/${charter.slug}`} className="w-day-photo" aria-label={`View ${charter.name}`}>
            <Image src={charter.image} alt={charter.name} fill sizes="(max-width:768px) 100vw, 33vw" />
          </Link>
          <div className="w-day-body">
            <h3 className="serif">{charter.name}</h3>
            <p className="w-mute">{charter.detail}</p>
            <FullDayRate charter={charter} hourlyRate={hourlyRates[charter.slug]} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function ExtendedCharters() {
  const formats = [
    ["Moneta overnight", "an overnight charter on Moneta"],
    ["Moneta · 24 hours", "a full 24-hour charter on Moneta"],
    ["7 or 30 days", "a 7- or 30-day private charter"],
  ] as const;
  return (
    <aside className="w-day-extended" aria-label="Tailored charters">
      <div><span className="cap w-mute">Tailored charters</span><h3 className="serif">Stay a little longer.</h3><p>Quoted to your itinerary, sailing time and dates.</p></div>
      <div className="w-day-actions">
        {formats.map(([label, inquiry]) => (
          <a key={label} className="btn o" href={charterInquiry(inquiry)} target="_blank" rel="noopener noreferrer">{label} <span aria-hidden="true">↗</span></a>
        ))}
      </div>
    </aside>
  );
}
