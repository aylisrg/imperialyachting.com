import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { companyInfo } from "@/data/company";
import { isPmsConfigured, listVacancies, type Vacancy } from "@/lib/careers/pms";
import { CareersList } from "./CareersList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Careers — Join the Crew in Dubai",
  description:
    "Work on the water in Dubai with Imperial Yachting — a yacht fleet owner, not a broker. See open positions and apply in five minutes.",
  alternates: { canonical: `${SITE_CONFIG.url}/careers` },
};

export default async function CareersPage() {
  let vacancies: Vacancy[] = [];
  let failed = false;
  if (isPmsConfigured()) {
    try {
      vacancies = await listVacancies();
    } catch {
      failed = true;
    }
  }

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="tag">Careers</span>
          <h1>
            Join the <em>Crew</em>
          </h1>
          <p>
            We are a fleet owner, not a broker — and we are growing. Work on the water in Dubai with a young, hands-on
            team that treats every charter like a private party.
          </p>
          <a className="btn" href="#open">
            See open positions
          </a>
        </div>
      </section>
      <div className="stats">
        <div>
          <b>{companyInfo.stats.fleetSize}</b>
          <span>Owned yachts</span>
        </div>
        <div>
          <b>{companyInfo.stats.happyClients}</b>
          <span>Happy clients</span>
        </div>
        <div>
          <b>{companyInfo.stats.charterHours}</b>
          <span>Charter hours</span>
        </div>
        <div>
          <b>Since {companyInfo.founded}</b>
          <span>Established</span>
        </div>
      </div>
      <section className="sec" id="open">
        <div className="wrap">
          {failed ? (
            <div className="empty">Open positions are temporarily unavailable. Please try again in a minute.</div>
          ) : (
            <CareersList vacancies={vacancies} />
          )}
          <div className="call">
            <h2>
              Don&apos;t see your <em>position?</em>
            </h2>
            <p>
              If you are outrageously good at what you do and believe you can serve the empire — or that the empire
              needs you — leave your details.
            </p>
            <Link className="btn" href="/careers/open">
              Tell us about yourself
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
