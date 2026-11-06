/**
 * IY-1142: метки объявления вакансии (UTM). У каждого объявления своя ссылка с метками —
 * её даёт генератор ссылок портала; сайт передаёт метки в отклик отдельными полями.
 * Берём только четыре ключа; значение — латиница, цифры, «-», «_», «.», до 100 знаков.
 * Всё прочее (чужие ключи, пробелы, кириллица, HTML) режется: такую метку генератор не даёт.
 */
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;

const VALUE = /^[A-Za-z0-9._-]{1,100}$/;
export const UTM_STORAGE = "iy_vacancy_utm";

export function cleanUtmValue(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  return VALUE.test(s) ? s : "";
}

/** Четыре метки из любых пар ключ → значение; пустые и негодные не попадают. */
export function pickUtm(get: (k: string) => unknown): Utm {
  const out: Utm = {};
  for (const k of UTM_KEYS) {
    const v = cleanUtmValue(get(k));
    if (v) out[k] = v;
  }
  return out;
}
