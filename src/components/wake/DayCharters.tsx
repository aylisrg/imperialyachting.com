import Image from "next/image";
import Link from "next/link";
import { charterInquiry, fullDayCharters, outingTerms, standardDayIncludes, type FullDayCharter } from "@/lib/day-charters";

const aed = (amount: number) => `AED ${amount.toLocaleString("en-US")}`;

export function FullDayRate({ charter }: { charter: FullDayCharter }) {
  const duration = charter.hours ? `${charter.hours}-hour private charter` : "private day charter";
  const dayInquiry = `the ${duration} on ${charter.name} at ${aed(charter.price)} (VAT included)`;
  const outingsInquiry = `four agreed outings on ${charter.name} within 30 days at ${aed(charter.fourOutings)} (VAT included; non-exclusive, holidays excluded)`;
  return (
    <div className="w-day-rate">
      <div className="cap w-mute">{charter.hours ? `Full day · ${charter.hours} hours` : "Day charter · Duration on request"}</div>
      <div className="w-day-money"><strong>{aed(charter.price)}</strong><span>VAT included · per yacht</span></div>
      <p className="w-day-terms w-mute">Regular non-holiday dates. No hourly promo stacking.</p>
      <a className="btn" href={charterInquiry(dayInquiry)} target="_blank" rel="noopener noreferrer" aria-label={`Check day availability for ${charter.name}`}>Check day availability <span aria-hidden="true">↗</span></a>
      <details>
        <summary>What’s included</summary>
        <p>{charter.hours ? `${standardDayIncludes} Eight hours is the charter window, not continuous sailing.` : "Confirm duration, departure berth, route and inclusions with the team before booking."} Catering, extended cruising, other marina fees and extra time are quoted separately. Alcohol is not included.</p>
        <Link href="/terms">Booking and cancellation terms</Link>
      </details>
      <div className="w-day-bundle">
        <div className="cap w-mute">4 outings · within 30 days</div>
        <div className="w-day-money"><strong>{aed(charter.fourOutings)}</strong><span>VAT included · per yacht</span></div>
        <p className="w-day-terms w-mute">{outingTerms}</p>
        <a className="btn o" href={charterInquiry(outingsInquiry)} target="_blank" rel="noopener noreferrer" aria-label={`Ask about four outings on ${charter.name}`}>Ask about four outings <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  );
}

export function DayCharterCards({ fleetSlugs = {} }: { fleetSlugs?: Record<string, string> }) {
  return (
    <div className="w-day-fleet">
      {fullDayCharters.map((charter) => (
        <article className="w-day-card" key={charter.slug}>
          <Link href={`/fleet/${fleetSlugs[charter.slug] ?? charter.slug}`} className="w-day-photo" aria-label={`View ${charter.name}`}>
            <Image src={charter.image} alt={charter.name} fill sizes="(max-width:850px) 100vw, 25vw" />
          </Link>
          <div className="w-day-body">
            <h3 className="serif">{charter.name}</h3>
            <p className="w-mute">{charter.detail}</p>
            <FullDayRate charter={charter} />
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
    ["7 days", "a 7-day private charter"],
    ["Exclusive 30 days", "an exclusive 30-day private charter"],
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
