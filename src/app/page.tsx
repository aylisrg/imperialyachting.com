import { Cormorant_Garamond } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import { organizationSchema, localBusinessSchema, websiteSchema } from "@/components/seo/schemas";
import { SITE_CONFIG } from "@/lib/constants";
import { SpeedboatTransferPromo } from "@/components/sections/SpeedboatTransferPromo";
import { FAQSection } from "@/components/sections/FAQSection";
import { HOME_FLEET, HOME_HERO_CLIP, builtRefit } from "@/data/home";
import { HomeVideo } from "@/components/home/HomeVideo";
import { HomeChrome } from "@/components/home/HomeChrome";
import { HomeMotion } from "@/components/home/HomeMotion";
import "@/components/home/tokens.css";
import "@/components/home/home.css";

// Display serif for the home redesign (issue #46). Self-hosted by next/font, scoped to this route.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

function Spec({ k, v }: { k: string; v: string | number | null }) {
  if (v == null) return null;
  return (
    <div>
      <div className="k cap">{k}</div>
      <div className="val">{v}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className={`iyh ${cormorant.variable}`}>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={localBusinessSchema()} />
      <JsonLd data={websiteSchema()} />

      <HomeChrome />
      <main>

      <section className="hero">
        <div className="v">
          <HomeVideo clip={HOME_HERO_CLIP} hero alt="Van Dutch 40 at speed off Dubai Harbour" />
        </div>
        <div className="shade" />
        <div className="tag">A Dubai Harbour yacht house. We own and run every vessel we put to sea.</div>
        <h1 className="serif"><span>Imperial</span></h1>
        <div className="cta">
          <Link className="btn" href="/fleet">Book a charter</Link>
          <a className="btn ghost" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
        <div className="meta cap">
          <span>Van Dutch 40 &nbsp;/&nbsp; at speed</span>
          <span>Dubai Harbour</span>
          <span>Scroll</span>
        </div>
      </section>

      <section className="man">
        <div className="frame"><HomeVideo clip="vd40-aerial" alt="Van Dutch 40 from above" /></div>
        <div className="l serif">Owned.</div>
        <div className="l r serif"><i>Operated.</i></div>
        <div className="sub">Charter, management, film and brand work, run from one berth by the people who own the boats.</div>
      </section>

      <section className="crew">
        <div className="t">
          <h2 className="serif">On board.<br /><i>Every time.</i></h2>
          <p>The people who own the boats are on them. From the berth at Dubai Harbour.</p>
        </div>
        <div>
          <div className="a"><HomeVideo clip="ilia-harbour" alt="Ilia at Dubai Harbour" sizes="(max-width:768px) 100vw, 56vw" /></div>
          <div className="cap s">Ilia &nbsp;/&nbsp; Dubai Harbour</div>
        </div>
        <div>
          <div className="b"><HomeVideo clip="ilia-onboard" alt="Aboard the Evo 43" sizes="(max-width:768px) 100vw, 42vw" /></div>
          <div className="cap s">Aboard the Evo 43</div>
        </div>
        <div>
          <div className="c"><HomeVideo clip="misha-onboard" alt="Misha at Dubai Harbour" sizes="(max-width:768px) 100vw, 26vw" /></div>
          <div className="cap s">Misha &nbsp;/&nbsp; Dubai Harbour</div>
        </div>
      </section>

      <section className="svc">
        <div className="bg">
          <div className="b0"><HomeVideo clip="evo43-run" alt="Evo 43 under way" /></div>
          <div className="b1"><HomeVideo clip="moneta-golden" alt="Moneta at golden hour" /></div>
        </div>
        <div className="shade" />
        <div className="head cap"><span className="ix">02</span>&nbsp;&nbsp; Services</div>
        <div className="list">
          <div className="it"><span className="ix">i</span><h3 className="serif">Charter</h3><p>Day, weekly and monthly charters with crew, from Dubai Harbour.</p></div>
          <div className="it"><span className="ix">ii</span><h3 className="serif">Yacht management</h3><p>Crew, maintenance, charter revenue and accounting for owners.</p></div>
          <div className="it"><span className="ix">iii</span><h3 className="serif">Cinematography</h3><p>Yacht-based film, drone and content production.</p></div>
          <div className="it"><span className="ix">iv</span><h3 className="serif">Brandwave</h3><p>Identity, yacht wrapping and campaigns for marine brands.</p></div>
          <div className="it"><span className="ix">v</span><h3 className="serif">Speedboat transfer</h3><p>A Van Dutch to your yacht, island or pier.</p></div>
        </div>
      </section>

      <div className="iyh-legacy"><SpeedboatTransferPromo /></div>

      <section className="fleet">
        <div className="track">
          <div className="intro">
            <div className="cap"><span className="ix">03</span>&nbsp;&nbsp; The fleet</div>
            <h2 className="serif">Three<br />hulls.<br /><i>One crew.</i></h2>
            <div className="cap" style={{ color: "var(--earth)" }}>Scroll</div>
          </div>
          {HOME_FLEET.map((y) => (
            <div className="panel" key={y.slug} data-slug={y.slug}>
              <div className="v"><HomeVideo clip={y.clip} alt={y.name} sizes="(max-width:768px) 100vw, 78vw" /></div>
              <span className="no cap">Hull {y.hull}</span>
              <div className="info">
                <h3 className="serif">{y.name}</h3>
                {y.model && <div className="cap mdl">{y.model}</div>}
                <Spec k="LOA" v={y.loa} />
                <Spec k="Guests" v={y.guests} />
                <Spec k="Built / Refit" v={builtRefit(y)} />
                <Spec k="Berth" v={y.berth} />
                <Link className="book cap" href={y.href}>Book {y.name}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="par" id="partners">
        <div className="v">
          <HomeVideo clip="harbour-sunset" alt="Dubai Harbour at sunset" />
          <div className="shade" />
        </div>
        <div className="c">
          <div className="cap" style={{ color: "var(--mute)" }}><span className="ix">04</span>&nbsp;&nbsp; For agents and service providers</div>
          <h2 className="serif">Work with<br /><i>the operator.</i></h2>
          <p>Direct access to an owned fleet and in-house crew. Terms for agencies, concierges and service providers on request.</p>
          <a className="btn" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">Request terms</a>
        </div>
      </section>

      <div className="iyh-legacy"><FAQSection /></div>
      </main>
      <footer className="facts">
        <div className="g">
          <div><span className="cap">Legal entity</span><p>Imperial Charter Yachting Services L.L.C</p></div>
          <div><span className="cap">Trade licence</span><p>No. 960574</p></div>
          <div><span className="cap">Berth</span><p>Dubai Harbour Yacht Club</p></div>
          <div><span className="cap">Desk</span><p><a href={`tel:${SITE_CONFIG.phone}`}>+971 52 835 5939</a> &nbsp;/&nbsp; <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a></p></div>
        </div>
        <div className="big serif" aria-hidden="true">IMPERIAL</div>
      </footer>

      <HomeMotion />
    </div>
  );
}
