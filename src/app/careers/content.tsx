import { MapPin, Banknote } from "lucide-react";
import type { Vacancy } from "@/lib/careers/pms";

export const FAQ: [string, string][] = [
  [
    "Do I need a UAE visa to apply?",
    "No. We sponsor the residence visa for full-time roles after the interview. If you already hold a UAE visa, tell us in the form and we will speed things up.",
  ],
  [
    "How long does hiring take?",
    "Usually 7–10 days: we read your CV within two working days, call you if it fits, then a short interview and an offer.",
  ],
  [
    "Can I apply for more than one role?",
    "Yes. Send a separate form for each role so the right person reads it. Your CV can be re-used.",
  ],
];

export function Pills({ v }: { v: Vacancy }) {
  return (
    <>
      {v.location && (
        <span className="pill">
          <MapPin />
          {v.location}
        </span>
      )}
      {v.salary && (
        <span className="pill g">
          <Banknote />
          {v.salary}
        </span>
      )}
    </>
  );
}

type Block = { kind: "h" | "p" | "ul"; lines: string[] };

/** Vacancy full text from PMS (markdown or plain lines) → headings, paragraphs, lists. */
export function parseBody(md: string, title: string): Block[] {
  const lines = md.replace(/\r/g, "").split("\n").map((l) => l.trim());
  const isItem = (l: string) => /^(\\?[-*•]|\d+[.)])\s/.test(l);
  const nextText = (i: number) => lines.slice(i + 1).find(Boolean);
  const isHeading = (l: string, i: number) =>
    /^#{1,6}\s/.test(l) || (!isItem(l) && l.length <= 60 && !/[.!?:;,]$/.test(l) && nextText(i) !== undefined);
  const blocks: Block[] = [];
  let cur: string[] = [];
  let afterHeading = false;
  const flush = () => {
    if (!cur.length) return;
    const items = cur.map((l) => l.replace(/^(\\?[-*•]|\d+[.)])\s+/, ""));
    const listy = cur.some(isItem) || (afterHeading && cur.length > 1);
    blocks.push({ kind: listy ? "ul" : "p", lines: items });
    cur = [];
    afterHeading = false;
  };
  lines.forEach((l, i) => {
    if (!l) return flush();
    if (i === 0 && title && l.toLowerCase().includes(title.toLowerCase())) return;
    if (isHeading(l, i)) {
      flush();
      blocks.push({ kind: "h", lines: [l.replace(/^#+\s*/, "")] });
      afterHeading = true;
      return;
    }
    cur.push(l.replace(/\*\*/g, ""));
  });
  flush();
  return blocks;
}

export function Body({ md, title }: { md: string; title: string }) {
  return (
    <div className="body">
      {parseBody(md, title).map((b, i) =>
        b.kind === "h" ? (
          <h3 key={i} style={{ fontSize: 20, margin: "26px 0 12px" }}>
            {b.lines[0]}
          </h3>
        ) : b.kind === "ul" ? (
          <ul key={i}>
            {b.lines.map((l, k) => (
              <li key={k}>{l}</li>
            ))}
          </ul>
        ) : (
          b.lines.map((l, k) => <p key={`${i}-${k}`}>{l}</p>)
        ),
      )}
    </div>
  );
}
