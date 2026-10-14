import Link from "next/link";
import { companyInfo } from "@/data/company";
import { HOME_FLEET } from "@/data/home";
import { SITE_CONFIG } from "@/lib/constants";
import { ABOUT_CREW_CLIPS, aboutCrew } from "./crew";
import { WakePage } from "@/components/wake/WakePage";
import { WakeCta, WakeHead, WakeHero, WakeMedia, WakeSection, WakeSteps } from "@/components/wake/blocks";

// Layout: Wake redesign (issue #46, design/pages/about @ c0f9dc1). Copy from
// src/data/company.ts; only verifiable facts. The partner-logo placeholder is
// gone (no partners shown until there are real ones).

export function AboutPageContent() {
  const facts = [
    { label: "Owned yachts", value: String(HOME_FLEET.length) },
    { label: "Established", value: String(companyInfo.founded) },
    { label: "Home berth", value: "Dubai Harbour · Marasi Bay" },
    { label: "Licence", value: SITE_CONFIG.license },
  ];
  const legal = [
    { label: "Legal name", value: "Imperial Charter Yachting Services L.L.C" },
    { label: "Trade licence", value: SITE_CONFIG.license },
    { label: "Registration", value: SITE_CONFIG.companyRegistration },
    { label: "TRN", value: SITE_CONFIG.taxId },
  ];

  return (
    <WakePage>
      <WakeHero
        clip="ilia-harbour"
        alt="Ilia Sergeenko at Dubai Harbour"
        crumb="Home / About"
        title={<>Our<br />story.</>}
        lead={`Founded in ${companyInfo.founded}, Imperial Yachting was born from a passion for the sea. We are a fleet owner, not a broker: every detail, from maintenance to hospitality, is under our direct control.`}
      />

      <WakeSection>
        <div className="w-facts cap">
          {facts.map((f) => <div key={f.label}>{f.label}<b>{f.value}</b></div>)}
        </div>
      </WakeSection>

      <WakeSection>
        <WakeHead title={<>The<br />people.</>}>Owner-operated. The people you write to are the people on board.</WakeHead>
        {aboutCrew.map((m, i) => (
          <div className="w-split-media about-person" key={m.name}>
            <div>
              <span className="cap w-kicker">{String(i + 1).padStart(2, "0")} · {m.role}</span>
              <h3 className="serif w-h3">{m.name}</h3>
              <p className="w-prose">{m.bio}</p>
              {m.linkedin ? <p><a className="cap" href={m.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></p> : null}
            </div>
            <WakeMedia clip={ABOUT_CREW_CLIPS[m.name]} alt={`${m.name} on board`} className="about-crew" eager />
          </div>
        ))}
      </WakeSection>

      <WakeSection tone="light">
        <WakeHead title={<>Our<br />values.</>}>The principles that guide every decision we make.</WakeHead>
        <WakeSteps items={companyInfo.values} />
      </WakeSection>

      <WakeSection tone="sand">
        <div className="w-facts cap">
          {legal.map((f) => <div key={f.label}>{f.label}<b>{f.value}</b></div>)}
        </div>
      </WakeSection>

      <WakeCta clip="moneta-golden" alt="Moneta, Monte Carlo 6, at golden hour" title={<>Come<br />aboard.</>}>
        <a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">Write on WhatsApp</a>
        <a className="btn o" href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
        <p className="contacts cap">
          <Link href="/fleet">Explore the fleet</Link>
          <a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phone}</a>
        </p>
      </WakeCta>
    </WakePage>
  );
}
