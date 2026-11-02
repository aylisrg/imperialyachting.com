import type { Yacht, YachtSpec } from "@/types/yacht";

// Public facts verified by the owner. Construction and model year are distinct;
// the actual launch date is not confirmed. Do not publish source certificates.
export const MONETA_BUILD_YEAR = 2018;
export const MONETA_MODEL_YEAR = 2019;
export const MONETA_FLEET_SLUG = "monte-carlo-6";

/** Correct explicit year claims only, never prices, refits or arbitrary numbers. */
export function correctMonetaYearText(text: string): string {
  return text
    .replace(/\b((?:year\s+built|build\s+year|construction\s+year|built)(?:\s+in)?\s*[:·-]?\s*)\d{4}\b/gi, `$1${MONETA_BUILD_YEAR}`)
    .replace(/\b(model\s+year\s*[:·-]?\s*)\d{4}\b/gi, `$1${MONETA_MODEL_YEAR}`)
    .replace(/\b(?:launched(?:\s+in)?|launch(?:\s+year|\s+date)?)\s*[:·-]?\s*\d{4}\b/gi, "launch date unconfirmed");
}

export function correctMonetaYearSpecs(items: YachtSpec[]): YachtSpec[] {
  return items
    .filter(({ label }) => !/^(?:launched|launch(?:\s+year|\s+date)?|date\s+launched)$/i.test(label.trim()))
    .map((item) => {
      const label = item.label.trim();
      if (/^(?:year|year built|build year|construction year|built)$/i.test(label)) {
        return { ...item, value: String(MONETA_BUILD_YEAR) };
      }
      if (/^model\s+year$/i.test(label)) return { ...item, value: String(MONETA_MODEL_YEAR) };
      if (/^(?:year|built)\s*\/\s*refit$/i.test(label)) {
        return { ...item, value: item.value.replace(/^\s*\d{4}/, String(MONETA_BUILD_YEAR)) };
      }
      return { ...item, value: correctMonetaYearText(item.value) };
    });
}

/** Applied at the DB read boundary so cards, detail, SEO, llms and MCP agree. */
export function applyMonetaFleetYears(yacht: Yacht): Yacht {
  if (yacht.slug !== MONETA_FLEET_SLUG) return yacht;
  const specs = correctMonetaYearSpecs(yacht.specs);
  if (!specs.some(({ label }) => /^(?:year|year built|build year|construction year|built)$/i.test(label.trim()))) {
    specs.push({ label: "Year built", value: String(MONETA_BUILD_YEAR) });
  }
  if (!specs.some(({ label }) => /^model\s+year$/i.test(label.trim()))) {
    specs.push({ label: "Model year", value: String(MONETA_MODEL_YEAR) });
  }
  return {
    ...yacht,
    year: MONETA_BUILD_YEAR,
    modelYear: MONETA_MODEL_YEAR,
    tagline: correctMonetaYearText(yacht.tagline),
    description: correctMonetaYearText(yacht.description),
    specs,
  };
}
