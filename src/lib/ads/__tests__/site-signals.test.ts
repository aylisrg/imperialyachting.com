import { describe, it, expect } from "vitest";
import { isMetaSource, hasUtmCampaign } from "../site-signals";

describe("isMetaSource", () => {
  it("matches the sources Meta ads arrive under", () => {
    expect(isMetaSource("facebook")).toBe(true);
    expect(isMetaSource("instagram")).toBe(true);
    expect(isMetaSource("fb")).toBe(true);
    expect(isMetaSource("ig")).toBe(true);
    expect(isMetaSource("an")).toBe(true);
    expect(isMetaSource("meta")).toBe(true);
  });

  it("matches referral hostnames from untagged clicks", () => {
    expect(isMetaSource("l.facebook.com")).toBe(true);
    expect(isMetaSource("m.facebook.com")).toBe(true);
    expect(isMetaSource("lm.instagram.com")).toBe(true);
  });

  it("is case insensitive", () => {
    expect(isMetaSource("Facebook")).toBe(true);
    expect(isMetaSource("INSTAGRAM")).toBe(true);
  });

  it("does not match unrelated sources", () => {
    expect(isMetaSource("google")).toBe(false);
    expect(isMetaSource("(direct)")).toBe(false);
    expect(isMetaSource("bing")).toBe(false);
    expect(isMetaSource("tripadvisor.com")).toBe(false);
  });

  it("does not let short tokens match inside unrelated words", () => {
    // "an" and "fb" must not swallow every source containing those letters
    expect(isMetaSource("analytics")).toBe(false);
    expect(isMetaSource("anghami.com")).toBe(false);
    expect(isMetaSource("fbi.gov")).toBe(false);
  });
});

describe("hasUtmCampaign", () => {
  it("detects a real campaign name", () => {
    expect(hasUtmCampaign("summer_charter_2026")).toBe(true);
  });

  it("treats GA4 placeholders as untagged", () => {
    expect(hasUtmCampaign("(not set)")).toBe(false);
    expect(hasUtmCampaign("(direct)")).toBe(false);
    expect(hasUtmCampaign("(organic)")).toBe(false);
    expect(hasUtmCampaign("(referral)")).toBe(false);
    expect(hasUtmCampaign("")).toBe(false);
    expect(hasUtmCampaign("   ")).toBe(false);
  });
});
