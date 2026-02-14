import { destinations } from "@/data/destinations";
import { adventures } from "@/data/adventures";
import type { Destination, TimeOfDay, DestinationCategory } from "@/types/common";
import { DEPARTURE_POINT_SLUG } from "@/lib/constants";

/** All items: destinations + adventures, merged and deduplicated by slug, excluding departure point */
export function getAllAdventures(): Destination[] {
  const map = new Map<string, Destination>();
  for (const d of destinations) {
    if (d.slug !== DEPARTURE_POINT_SLUG) {
      map.set(d.slug, d);
    }
  }
  for (const a of adventures) {
    map.set(a.slug, a);
  }
  return Array.from(map.values());
}

/** Merge server-fetched destinations with static adventures */
export function mergeWithAdventures(serverDestinations: Destination[]): Destination[] {
  const map = new Map<string, Destination>();
  for (const d of serverDestinations) {
    if (d.slug !== DEPARTURE_POINT_SLUG) {
      // Enrich server data with static map positions if missing
      const staticMatch = destinations.find((s) => s.slug === d.slug);
      map.set(d.slug, {
        ...d,
        mapPosition: d.mapPosition ?? staticMatch?.mapPosition,
        distanceNM: d.distanceNM ?? staticMatch?.distanceNM,
        cruisingTimeMinutes: d.cruisingTimeMinutes ?? staticMatch?.cruisingTimeMinutes,
        timeOfDay: d.timeOfDay ?? staticMatch?.timeOfDay,
        specialLabel: d.specialLabel ?? staticMatch?.specialLabel,
        area: d.area ?? staticMatch?.area,
      });
    }
  }
  for (const a of adventures) {
    if (!map.has(a.slug)) {
      map.set(a.slug, a);
    }
  }
  return Array.from(map.values());
}

/** Filter by time of day */
export function filterByTimeOfDay(items: Destination[], time: TimeOfDay): Destination[] {
  if (time === "anytime") return items;
  return items.filter(
    (d) => d.timeOfDay?.includes(time) || d.timeOfDay?.includes("anytime")
  );
}

/** Filter by category */
export function filterByCategory(items: Destination[], category: DestinationCategory): Destination[] {
  return items.filter((d) => d.category === category);
}
