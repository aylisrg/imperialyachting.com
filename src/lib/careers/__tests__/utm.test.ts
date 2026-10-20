import { describe, expect, it } from "vitest";
import { cleanUtmValue, pickUtm } from "../utm";

describe("IY-1142: метки объявления вакансии", () => {
  it("четыре ключа ссылки генератора проходят как есть", () => {
    const q = new URLSearchParams("utm_source=facebook&utm_medium=group&utm_campaign=moneta-crew&utm_content=post_19.10");
    expect(pickUtm((k) => q.get(k))).toEqual({
      utm_source: "facebook", utm_medium: "group", utm_campaign: "moneta-crew", utm_content: "post_19.10",
    });
  });
  it("чужие ключи режутся", () => {
    const q = new URLSearchParams("utm_source=fb&utm_term=x&src=y&fbclid=z");
    expect(pickUtm((k) => q.get(k))).toEqual({ utm_source: "fb" });
  });
  it("чужие значения режутся: пробел, HTML, кириллица, длина больше 100", () => {
    expect(cleanUtmValue("a b")).toBe("");
    expect(cleanUtmValue("<script>")).toBe("");
    expect(cleanUtmValue("фейсбук")).toBe("");
    expect(cleanUtmValue("x".repeat(101))).toBe("");
    expect(cleanUtmValue("x".repeat(100))).toBe("x".repeat(100));
    expect(cleanUtmValue(undefined)).toBe("");
  });
});
