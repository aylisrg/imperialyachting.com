import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { jsonError } from "@/lib/api/errors";
import { createApplication, getVacancy, isPmsConfigured } from "@/lib/careers/pms";

export const runtime = "nodejs";

const MAX_CV = 5 * 1024 * 1024;
const CV_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const str = (v: FormDataEntryValue | null, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function json<T>(v: FormDataEntryValue | null, fallback: T): T {
  try {
    return typeof v === "string" && v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * POST /api/careers/apply — application form of the Careers section.
 * Rate-limited per IP; the candidate, the application, the answers and the CV go
 * straight to PMS through its site API. Nothing is stored on the site.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`careers:${ip}`, { limit: 5, windowMs: 10 * 60_000 }).ok) {
    return jsonError(429, "rate_limited", "Too many applications. Please try again later.");
  }
  if (!isPmsConfigured()) return jsonError(503, "unavailable", "Applications are temporarily unavailable.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "bad_request", "Invalid form.");
  }
  // Honeypot: bots fill the hidden field — accept silently, store nothing.
  if (str(form.get("website"))) return NextResponse.json({ ok: true });

  const name = str(form.get("n"), 120);
  const email = str(form.get("e"), 200);
  const phone = str(form.get("p"), 40);
  const visa = str(form.get("vs"), 80);
  const vacancyId = str(form.get("vacancy"), 40) || null;
  const field = str(form.get("field"), 80);
  const cv = form.get("cv");

  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || phone.replace(/\D/g, "").length < 7 || !visa) {
    return jsonError(400, "invalid", "Please fill in the required fields.");
  }
  if (!vacancyId && !field) return jsonError(400, "invalid", "Please choose your field.");
  if (!(cv instanceof File) || !cv.size || cv.size > MAX_CV) return jsonError(400, "invalid_cv", "Please attach a CV up to 5 MB.");
  const ext = (cv.name.split(".").pop() || "").toLowerCase();
  if (!CV_TYPES[ext]) return jsonError(400, "invalid_cv", "Use PDF, DOC or DOCX.");

  // answers come keyed by questionnaire id and question index; PMS wants them by name
  const given = json<Record<string, Record<string, string>>>(form.get("answers"), {});
  const answers: { anketa: string; vopros: string; otvet: string }[] = [];
  if (vacancyId) {
    const v = await getVacancy(vacancyId).catch(() => null);
    if (!v) return jsonError(404, "not_found", "This position is no longer open.");
    for (const p of v.polls)
      for (const q of p.questions) {
        const ans = String(given[p.id]?.[q.id] ?? "").trim().slice(0, 3000);
        if (ans) answers.push({ anketa: p.name, vopros: q.text, otvet: ans });
      }
  }
  const openAnswers = json<{ question: string; answer: string }[]>(form.get("openAnswers"), [])
    .slice(0, 5)
    .map((x) => ({ question: String(x?.question ?? "").slice(0, 200), answer: String(x?.answer ?? "").slice(0, 3000) }));

  const start = str(form.get("start"), 60), link = str(form.get("l"), 300);
  const message = [
    `Отклик с сайта imperialyachting.com${vacancyId ? "" : " — без вакансии («Don't see your position?»)"}.`,
    field ? `Направление: ${field}` : "",
    `Виза ОАЭ: ${visa}`,
    start ? `Когда может выйти: ${start}` : "",
    link ? `LinkedIn / портфолио: ${link}` : "",
    ...openAnswers.map((x) => `${x.question}\n${x.answer}`),
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await createApplication({ vacancyId, name, email, phone, city: str(form.get("c"), 120), message, answers, cv });
  } catch (e) {
    console.error("careers/apply: PMS write failed", e);
    return jsonError(502, "pms_failed", "Your application was not sent. Please try again.");
  }
  return NextResponse.json({ ok: true });
}
