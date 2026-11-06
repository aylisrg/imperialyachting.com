"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, MapPin } from "lucide-react";
import type { Vacancy } from "@/lib/careers/pms";

export function CareersList({ vacancies }: { vacancies: Vacancy[] }) {
  const [loc, setLoc] = useState("");
  const locations = [...new Set(vacancies.map((v) => v.location).filter(Boolean))].sort();
  const list = vacancies.filter((v) => !loc || v.location === loc);

  return (
    <>
      <div className="sh">
        <h2>
          Open positions <sup>{list.length}</sup>
        </h2>
      </div>
      {locations.length > 1 && (
        <div className="flt" style={{ gridTemplateColumns: "minmax(0,320px) auto" }}>
          <div className="sel">
            <select aria-label="Location" value={loc} onChange={(e) => setLoc(e.target.value)}>
              <option value="">Location</option>
              {locations.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
          <button className="clr" hidden={!loc} onClick={() => setLoc("")}>
            Clear
          </button>
        </div>
      )}
      {list.length ? (
        <div className="grp">
          {list.map((v) => (
            <Link key={v.id} className="row" href={`/careers/${v.id}`}>
              <div>
                <div className="tt">{v.title}</div>
                {v.salary && <span className="sm2">{v.salary}</span>}
              </div>
              <div className="mt">
                {v.location && (
                  <span className="pill">
                    <MapPin />
                    {v.location}
                  </span>
                )}
              </div>
              <ArrowRight className="ar" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty">
          {vacancies.length ? (
            <>
              No open positions match this filter.{" "}
              <button className="clr" style={{ color: "var(--gold)", display: "inline" }} onClick={() => setLoc("")}>
                Clear filter
              </button>
            </>
          ) : (
            "There are no open positions right now — but we are always glad to meet exceptional people."
          )}
        </div>
      )}
    </>
  );
}
