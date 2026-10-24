import type { Destination } from "@/types/common";

/** The fact strip: only the facts this destination actually has. */
export function destinationFacts(d: Destination): { label: string; value: string }[] {
  const fromHarbour = d.sailingTime?.replace(/\s*from Dubai Harbour\s*$/i, "").trim();
  return [
    fromHarbour ? { label: "From Dubai Harbour", value: fromHarbour } : null,
    d.duration ? { label: "Duration", value: d.duration } : null,
    typeof d.distanceNM === "number" ? { label: "Distance", value: `${d.distanceNM} NM` } : null,
    d.bestFor?.length ? { label: "Best for", value: d.bestFor[d.bestFor.length - 1] } : null,
  ].filter((x): x is { label: string; value: string } => x !== null);
}
