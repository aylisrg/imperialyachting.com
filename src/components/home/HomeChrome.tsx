"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/lib/constants";

const LINKS = [
  { label: "Fleet", href: "/fleet" },
  { label: "Services", href: "/services" },
  { label: "Destinations", href: "/destinations" },
  { label: "Partners", href: "/#partners" },
  { label: "Journal", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function HomeChrome() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [wa, setWa] = useState(false);

  useEffect(() => {
    const par = document.getElementById("partners");
    const upd = () => {
      setSolid(window.scrollY > window.innerHeight * 0.6);
      let overPar = false;
      if (par) {
        const r = par.getBoundingClientRect();
        overPar = r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4;
      }
      setWa(window.scrollY > window.innerHeight * 0.8 && !overPar);
    };
    upd();
    window.addEventListener("scroll", upd, { passive: true });
    return () => window.removeEventListener("scroll", upd);
  }, []);

  return (
    <>
      <nav className={solid ? "solid" : undefined} aria-label="Main">
        <Link href="/" className="logo" aria-label="Imperial Yachting, home">IMPERIAL</Link>
        <ul className="cap">
          {LINKS.map((l) => (
            <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
          ))}
        </ul>
        <span className="cap">25.09° N &nbsp;55.14° E</span>
        <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <i /><i />
        </button>
      </nav>
      <div className={open ? "ov open" : "ov"} aria-hidden={!open}>
        <button className="x cap" onClick={() => setOpen(false)}>Close</button>
        <div>
          {LINKS.map((l, i) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}>
              <span>0{i + 1}</span>{l.label}
            </Link>
          ))}
          <a className="rt" href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer">Request terms</a>
        </div>
        <div className="cap" style={{ color: "var(--mute)" }}>25.09° N &nbsp;55.14° E &nbsp;/&nbsp; Dubai Harbour</div>
      </div>
      <a className={wa ? "wa on" : "wa"} href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" /></svg>
      </a>
    </>
  );
}
