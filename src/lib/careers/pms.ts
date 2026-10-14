/**
 * Careers data from the company task tracker (PMS) through its narrow site API
 * https://pms.sazanoff.ru/sayt-iy/ (wiki «Боты/BRO империи/API вакансий сайта IY»).
 * The site holds only SAYT_IY_API_KEY — never a PMS account key.
 *
 * Nothing is copied or cached: every page view asks PMS. The API itself returns only
 * vacancies published on the platform «Сайт imperialyachting.com» whose "until" date
 * has not passed — removed or expired publication, and the vacancy is gone.
 */

const API = (process.env.SAYT_IY_API_URL || "https://pms.sazanoff.ru/sayt-iy").replace(/\/$/, "");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>;

export function isPmsConfigured(): boolean {
  return Boolean(process.env.SAYT_IY_API_KEY);
}

async function call(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: { ...(init.headers || {}), "X-Api-Key": process.env.SAYT_IY_API_KEY as string },
  });
}

export interface Question {
  id: string;
  text: string;
  kind: "rating" | "choice" | "text";
  options: string[];
  required: boolean;
}

export interface Poll {
  id: string;
  name: string;
  prompt: string;
  questions: Question[];
}

export interface Vacancy {
  id: string;
  title: string;
  summary: string;
  location: string;
  salary: string;
  conditions: string[];
  requirements: string[];
  until: string | null;
}

export interface VacancyFull extends Vacancy {
  body: string;
  polls: Poll[];
}

function splitList(s: unknown): string[] {
  const t = String(s ?? "").trim();
  if (!t) return [];
  const sep = t.includes(";") ? ";" : ",";
  return t
    .split(sep)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1));
}

function toQuestion(q: Doc, i: number): Question {
  const options: string[] = Array.isArray(q.varianty) ? q.varianty.map(String) : [];
  const isRating = options.length === 10 && options.every((o, k) => o === String(k + 1));
  return {
    id: String(i),
    text: String(q.vopros ?? "").replace(/^\[[^\]]*\]\s*/, ""),
    kind: q.vid === "option" ? (isRating ? "rating" : "choice") : "text",
    options,
    required: q.obyazatelno !== false,
  };
}

function toVacancy(v: Doc): VacancyFull {
  const ankety = typeof v.ankety === "string" ? JSON.parse(v.ankety || "[]") : v.ankety || [];
  return {
    id: String(v.id),
    title: String(v.nazvanie ?? ""),
    summary: String(v.opisanie ?? ""),
    location: String(v.lokaciya ?? ""),
    salary: String(v.oklad ?? ""),
    conditions: splitList(v.usloviya),
    requirements: splitList(v.obyazatelno),
    until: null,
    body: String(v.polnoe_opisanie ?? ""),
    polls: (Array.isArray(ankety) ? ankety : [])
      .map((a: Doc, k: number) => ({
        id: String(a.id ?? k),
        name: String(a.nazvanie ?? ""),
        prompt: String(a.podskazka ?? ""),
        questions: (Array.isArray(a.voprosy) ? a.voprosy : []).map(toQuestion),
      }))
      .filter((p: Poll) => p.questions.length),
  };
}

export async function listVacancies(): Promise<Vacancy[]> {
  const r = await call("/vakansii");
  if (!r.ok) throw new Error(`PMS site API: HTTP ${r.status}`);
  const j = (await r.json()) as { vakansii?: Doc[] };
  return (j.vakansii || [])
    .map((v): Vacancy => {
      const full = toVacancy(v);
      return { id: full.id, title: full.title, summary: full.summary, location: full.location, salary: full.salary, conditions: full.conditions, requirements: full.requirements, until: full.until };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getVacancy(id: string): Promise<VacancyFull | null> {
  if (!/^[a-z0-9-]{8,40}$/i.test(id)) return null;
  const r = await call(`/vakansii/${id}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`PMS site API: HTTP ${r.status}`);
  const v = (await r.json()) as Doc;
  return toVacancy(v);
}

export interface ApplicationInput {
  vacancyId: string | null; // null — open application («Don't see your position?»)
  name: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  answers: { anketa: string; vopros: string; otvet: string }[];
  cv: File;
}

export async function createApplication(a: ApplicationInput): Promise<string | null> {
  // no vacancy — open application: PMS files it under «Открытая заявка» or as a candidate only
  const parts = a.name.trim().split(/\s+/);
  const form = new FormData();
  if (a.vacancyId) form.set("vakansiya", a.vacancyId);
  form.set("imya", parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0]);
  if (parts.length > 1) form.set("familiya", parts[parts.length - 1]);
  form.set("email", a.email);
  form.set("telefon", a.phone);
  if (a.city) form.set("gorod", a.city);
  form.set("soobshchenie", a.message);
  form.set("otvety", JSON.stringify(a.answers));
  form.set("cv", a.cv, a.cv.name);
  const r = await call("/otklik", { method: "POST", body: form });
  const j = (await r.json().catch(() => ({}))) as Doc;
  if (!r.ok || !j.ok) throw new Error(`PMS site API: HTTP ${r.status} ${j.oshibka ?? ""}`);
  return j.otklik ? String(j.otklik) : j.kandidat ? String(j.kandidat) : null;
}
