import { HOME_FLEET } from "@/data/home";

/** One line per yacht, from the fleet data. */
export function fleetLines(): string[] {
  return HOME_FLEET.map((y) => [y.name, y.model, y.loa, `up to ${y.guests} guests`, y.berth].filter(Boolean).join(" · "));
}
