import { HomeChrome } from "@/components/home/HomeChrome";
import { SITE_CONFIG } from "@/lib/constants";
import { cormorant } from "./font";
import "@/components/home/tokens.css";
import "@/components/home/home.css";
import "./wake.css";

/** Page frame for redesigned inner pages: home nav + menu + WhatsApp button, facts footer. */
export function WakePage({ children }: { children: React.ReactNode }) {
  return (
    <div className={`iyh iyp ${cormorant.variable}`}>
      <HomeChrome />
      <main>{children}</main>
      <footer className="w-foot">
        <div className="g">
          <div><span className="cap">Legal entity</span><p>Imperial Charter Yachting Services L.L.C</p></div>
          <div><span className="cap">Trade licence</span><p>No. 960574</p></div>
          <div><span className="cap">Berth</span><p>Dubai Harbour Yacht Club</p></div>
          <div><span className="cap">Desk</span><p><a href={`tel:${SITE_CONFIG.phone}`}>+971 52 835 5939</a> &nbsp;/&nbsp; <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a></p></div>
        </div>
      </footer>
    </div>
  );
}
