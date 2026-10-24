import { companyInfo } from "@/data/company";
import type { ClipId } from "@/data/clips";

/** The people on board shown on /about, each with their own clip (design/pages/about). */
export const ABOUT_CREW_CLIPS: Record<string, ClipId> = {
  "Ilia Sergeenko": "ilia-onboard",
  "Mikhail Sazanov": "misha-onboard",
};

export const aboutCrew = companyInfo.team.filter((m) => m.name in ABOUT_CREW_CLIPS);
