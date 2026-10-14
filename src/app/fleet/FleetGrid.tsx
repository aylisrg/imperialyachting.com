"use client";

import Link from "next/link";
import Image from "next/image";
import { trackYachtClick, trackWhatsAppClick } from "@/lib/analytics";
import { WakeMedia } from "@/components/wake/blocks";
import { fleetClips } from "@/components/wake/fleetClips";

interface FleetYachtCard {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  builder: string;
  year: number;
  refit?: number;
  lengthFeet: number;
  lengthMeters: number;
  capacity: number;
  lowestPrice: { amount: number; unit: string } | null;
  heroImage: string;
  images: string[];
}

interface FleetGridProps {
  yachts: FleetYachtCard[];
}

export function FleetGrid({ yachts }: FleetGridProps) {
  if (yachts.length === 0) {
    return (
      <div className="w-empty">
        <p>No yachts available at the moment.</p>
        <p>Please check back soon for our premium fleet offerings.</p>
      </div>
    );
  }

  return (
    <div>
      {yachts.map((y, i) => {
        const clips = fleetClips(y.slug);
        const whatsappUrl = `https://wa.me/971528355939?text=${encodeURIComponent(`Hello, I found your yacht ${y.name} at imperialyachting.com`)}`;
        return (
          <article className="w-yacht" key={y.slug}>
            <Link href={`/fleet/${y.slug}`} className="w-media" onClick={() => trackYachtClick(y.slug, "fleet_card")} aria-label={y.name}>
              {clips ? (
                <WakeMedia clip={clips.card} alt={`${y.name} — Imperial Yachting`} />
              ) : y.heroImage ? (
                <Image src={y.heroImage} alt={`${y.name} — Imperial Yachting`} fill sizes="(max-width:768px) 100vw, 58vw" style={{ objectFit: "cover" }} />
              ) : null}
              {y.lowestPrice?.unit === "/hr" && <span className="promo cap">4+1 FREE</span>}
            </Link>
            <div>
              <span className="ix">{String(i + 1).padStart(2, "0")}</span>{" "}
              <span className="cap" style={{ color: "var(--mute)" }}>{y.builder}</span>
              <h2 className="serif"><Link href={`/fleet/${y.slug}`} onClick={() => trackYachtClick(y.slug, "fleet_card")}>{y.name}</Link></h2>
              <p className="tag">{y.tagline}</p>
              <p className="desc">{y.description}</p>
              <div className="w-spec">
                <div><span className="cap">Length</span><b>{y.lengthFeet}ft / {y.lengthMeters}m</b></div>
                <div><span className="cap">Guests</span><b>{y.capacity} guests</b></div>
                <div><span className="cap">Year</span><b>{y.year}{y.refit ? ` / ${y.refit}` : ""}</b></div>
                <div>
                  {y.lowestPrice ? (
                    <><span className="cap">From</span><b>AED {y.lowestPrice.amount.toLocaleString("en-US")}<small>{y.lowestPrice.unit}</small></b></>
                  ) : (
                    <><span className="cap">Price</span><b>Contact for pricing</b></>
                  )}
                </div>
              </div>
              <div className="w-acts">
                <Link className="btn o" href={`/fleet/${y.slug}`} onClick={() => trackYachtClick(y.slug, "fleet_card")}>View yacht</Link>
                <a className="btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick("fleet_card")}>Book</a>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
