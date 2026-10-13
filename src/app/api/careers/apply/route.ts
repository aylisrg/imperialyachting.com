import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/api/rateLimit";
import { jsonError } from "@/lib/api/errors";
import { createApplication, isPmsConfigured } from "@/lib/careers/pms";

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
 * straight to PMS (recruiting). Nothing is stored on the site.
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

  const answers = json<Record<string, Record<string, string>>>(form.get("answers"), {});
  const clean: Record<string, Record<string, string>> = {};
  for (const [p, qs] of Object.entries(answers).slice(0, 10)) {
    if (!/^[a-z0-9-]{8,40}$/i.test(p) || typeof qs !== "object" || !qs) continue;
    clean[p] = {};
    for (const [q, a] of Object.entries(qs).slice(0, 30)) if (/^\d{1,2}$/.test(q)) clean[p][q] = String(a).slice(0, 3000);
  }
  const openAnswers = json<{ question: string; answer: string }[]>(form.get("openAnswers"), [])
    .slice(0, 5)
    .map((x) => ({ question: String(x?.question ?? "").slice(0, 200), answer: String(x?.answer ?? "").slice(0, 3000) }));

  try {
    await createApplication({
      vacancyId,
      name,
      email,
      phone,
      city: str(form.get("c"), 120),
      visa,
      start: str(form.get("start"), 60),
      link: str(form.get("l"), 300),
      field,
      answers: clean,
      openAnswers,
      cv: { name: cv.name.slice(0, 150), type: CV_TYPES[ext], data: Buffer.from(await cv.arrayBuffer()) },
    });
  } catch (e) {
    console.error("careers/apply: PMS write failed", e);
    return jsonError(502, "pms_failed", "Your application was not sent. Please try again.");
  }
  return NextResponse.json({ ok: true });
}
