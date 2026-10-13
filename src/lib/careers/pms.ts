import api from "@hcengineering/api-client";

/**
 * Careers data straight from the company task tracker (PMS, recruiting module).
 * Nothing is copied or cached: every page view asks PMS, so a vacancy disappears
 * from the site the moment its publication is removed or its "until" date passes.
 *
 * A vacancy is shown only if PMS has a "Vacancy publication" for it on the
 * platform "Сайт imperialyachting.com" whose "until" date has not passed.
 * Applications land in PMS as candidate + applicant (recruiter: HR bot,
 * stage "Анкета"), questionnaire answers as polls of the applicant, CV attached.
 * Hiring API: wiki «Боты/Имперский PM/API найма».
 */

const PMS_URL = process.env.PMS_URL || "https://pms.sazanoff.ru";
const PMS_WORKSPACE = process.env.PMS_WORKSPACE || "ws-6a730578-eb339c7495-3775e8";

const PUBLICATION = "a62df3643587646bb8022ed1"; // card type «📰 Публикация вакансии»
const PLATFORM = "2c8af2f63586807d9a5400eb"; // card type «📍 Площадка»
const SITE_PLATFORM_TITLE = "Сайт imperialyachting.com";
const HR_BOT = "6ace3cd97bb509c902571d2d"; // «HR империи» — recruiter of every new applicant
// Vacancy polls that are internal to the hiring team and never shown to candidates.
const INTERNAL_POLLS = /^(Навыки|Тест в переписке|Тест на созвоне)/i;

type Client = Awaited<ReturnType<typeof api.connect>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>;

let clientPromise: Promise<Client> | null = null;

export function isPmsConfigured(): boolean {
  return Boolean(process.env.PMS_TOKEN);
}

/** One live connection per server process; dropped and reopened on failure. */
async function client(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = api
      .connect(PMS_URL, { token: process.env.PMS_TOKEN as string, workspace: PMS_WORKSPACE })
      .catch((e: unknown) => {
        clientPromise = null;
        throw e;
      });
  }
  return clientPromise;
}

async function withClient<T>(fn: (c: Client) => Promise<T>): Promise<T> {
  try {
    return await fn(await client());
  } catch {
    // a stale socket fails every call — reconnect once and retry
    const old = clientPromise;
    clientPromise = null;
    old?.then((c) => c.close()).catch(() => {});
    return fn(await client());
  }
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

function startOfTodayUtc(): number {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function toVacancy(v: Doc, until: number | null): Vacancy {
  return {
    id: String(v._id),
    title: String(v.name ?? ""),
    summary: String(v.description ?? ""),
    location: String(v.location ?? ""),
    salary: String(v.oklad ?? ""),
    conditions: splitList(v.usloviya),
    requirements: splitList(v.obyazatelno),
    until: until ? new Date(until).toISOString().slice(0, 10) : null,
  };
}

async function sitePlatformId(c: Client): Promise<string | null> {
  const all = (await c.findAll(PLATFORM as never, {})) as Doc[];
  const p = all.find((x) => x.title === SITE_PLATFORM_TITLE && x.aktivna !== false);
  return p ? String(p._id) : null;
}

/** vacancy id → latest "until" (null = no end date) of its live site publications */
async function livePublications(c: Client): Promise<Map<string, number | null>> {
  const platform = await sitePlatformId(c);
  const live = new Map<string, number | null>();
  if (!platform) return live;
  const today = startOfTodayUtc();
  const pubs = (await c.findAll(PUBLICATION as never, { ploshchadka: platform } as never)) as Doc[];
  for (const p of pubs) {
    if (!p.vakansiya) continue;
    const until = typeof p.do === "number" ? p.do : null;
    if (until !== null && until < today) continue;
    const id = String(p.vakansiya);
    const prev = live.get(id);
    live.set(id, prev === undefined ? until : prev === null || until === null ? null : Math.max(prev, until));
  }
  return live;
}

export async function listVacancies(): Promise<Vacancy[]> {
  return withClient(async (c) => {
    const live = await livePublications(c);
    if (!live.size) return [];
    const vs = (await c.findAll("recruit:class:Vacancy" as never, { _id: { $in: [...live.keys()] } } as never)) as Doc[];
    return vs
      .filter((v) => !v.archived)
      .map((v) => toVacancy(v, live.get(String(v._id)) ?? null))
      .sort((a, b) => a.title.localeCompare(b.title));
  });
}

function toQuestion(q: Doc, i: number): Question {
  const options: string[] = Array.isArray(q.options) ? q.options.map((o: unknown) => String((o as Doc)?.label ?? o)) : [];
  const isRating = options.length === 10 && options.every((o, k) => o === String(k + 1));
  return {
    id: String(i),
    text: String(q.name ?? "").replace(/^\[[^\]]*\]\s*/, ""),
    kind: q.kind === "option" ? (isRating ? "rating" : "choice") : "text",
    options,
    required: q.isMandatory !== false,
  };
}

export async function getVacancy(id: string): Promise<VacancyFull | null> {
  if (!/^[a-z0-9-]{8,40}$/i.test(id)) return null;
  return withClient(async (c) => {
    const live = await livePublications(c);
    if (!live.has(id)) return null;
    const v = (await c.findOne("recruit:class:Vacancy" as never, { _id: id } as never)) as Doc | undefined;
    if (!v || v.archived) return null;
    let body = "";
    if (v.fullDescription) {
      try {
        body = String(await c.fetchMarkup(v._class, v._id, "fullDescription", v.fullDescription, "markdown"));
      } catch {
        body = "";
      }
    }
    const polls = ((await c.findAll("survey:class:Poll" as never, { attachedTo: id } as never)) as Doc[])
      .filter((p) => !INTERNAL_POLLS.test(String(p.name ?? "")))
      .map((p) => ({
        id: String(p._id),
        name: String(p.name ?? ""),
        prompt: String(p.prompt ?? ""),
        questions: (Array.isArray(p.questions) ? p.questions : []).map(toQuestion),
      }))
      .filter((p) => p.questions.length);
    return { ...toVacancy(v, live.get(id) ?? null), body, polls };
  });
}

export interface ApplicationInput {
  vacancyId: string | null; // null — open application, no vacancy
  name: string;
  email: string;
  phone: string;
  city: string;
  visa: string;
  start: string;
  link: string;
  field: string;
  answers: Record<string, Record<string, string>>; // pollId → questionId → answer
  openAnswers: { question: string; answer: string }[];
  cv: { name: string; type: string; data: Buffer };
}

async function uploadFile(name: string, type: string, data: Buffer): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(data)], { type }), name);
  const r = await fetch(`${PMS_URL}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PMS_TOKEN}` },
    body: form,
  });
  if (!r.ok) throw new Error(`PMS upload failed: HTTP ${r.status}`);
  const j = await r.json();
  const blob = Array.isArray(j) ? j[0]?.id : j?.id;
  if (!blob) throw new Error("PMS upload returned no file id");
  return String(blob);
}

function personName(full: string): string {
  // PMS keeps people as "Last,First"
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return full.trim();
  const last = parts.pop() as string;
  return `${last},${parts.join(" ")}`;
}

export async function createApplication(a: ApplicationInput): Promise<{ applicant: string | null; person: string }> {
  return withClient(async (c) => {
    const vacancy = a.vacancyId
      ? ((await c.findOne("recruit:class:Vacancy" as never, { _id: a.vacancyId } as never)) as Doc | undefined)
      : undefined;
    if (a.vacancyId && (!vacancy || !(await livePublications(c)).has(a.vacancyId))) {
      throw new Error("vacancy is not published");
    }
    const platform = await sitePlatformId(c);

    const person = String(
      await c.createDoc("contact:class:Person" as never, "contact:space:Contacts" as never, {
        name: personName(a.name),
        city: a.city,
        avatarType: "color",
        contactType: "Соискатель",
      } as never),
    );
    await c.createMixin(person as never, "contact:class:Person" as never, "contact:space:Contacts" as never, "recruit:mixin:Candidate" as never, {
      title: vacancy ? String(vacancy.name) : a.field || "Open application",
      source: "Сайт imperialyachting.com",
      onsite: true,
      remote: false,
    } as never);
    for (const [provider, value] of [
      ["contact:channelProvider:Email", a.email],
      ["contact:channelProvider:Phone", a.phone],
      ["contact:channelProvider:LinkedIn", a.link],
    ] as const) {
      if (!value) continue;
      await c.addCollection("contact:class:Channel" as never, "contact:space:Contacts" as never, person as never, "contact:class:Person" as never, "channels", {
        provider,
        value,
      } as never);
    }

    const message = [
      `Откликнулся через сайт imperialyachting.com${vacancy ? "" : " — без вакансии («Don't see your position?»)"}.`,
      a.field ? `Направление: ${a.field}` : "",
      `Почта: ${a.email}`,
      `Телефон / WhatsApp: ${a.phone}`,
      a.city ? `Город и страна: ${a.city}` : "",
      `Виза ОАЭ: ${a.visa}`,
      a.start ? `Когда может выйти: ${a.start}` : "",
      a.link ? `LinkedIn / портфолио: ${a.link}` : "",
      ...a.openAnswers.map((x) => `${x.question}\n${x.answer}`),
    ]
      .filter(Boolean)
      .join("\n");

    const blob = await uploadFile(a.cv.name, a.cv.type, a.cv.data);
    const attachment = { name: a.cv.name, file: blob, size: a.cv.data.length, type: a.cv.type, lastModified: Date.now() };

    if (!vacancy) {
      // No vacancy — the person lands in "Talents" with the CV and the answers as a comment.
      await c.addCollection("attachment:class:Attachment" as never, "contact:space:Contacts" as never, person as never, "contact:class:Person" as never, "attachments", attachment as never);
      await c.addCollection("chunter:class:ChatMessage" as never, "contact:space:Contacts" as never, person as never, "contact:class:Person" as never, "comments", {
        message: message.replace(/\n/g, "<br>"),
      } as never);
      return { applicant: null, person };
    }

    const all = (await c.findAll("recruit:class:Applicant" as never, {}, { projection: { number: 1 } } as never)) as Doc[];
    const number = all.reduce((m, x) => Math.max(m, Number(x.number) || 0), 0) + 1;
    const applicant = String(
      await c.addCollection("recruit:class:Applicant" as never, a.vacancyId as never, person as never, "recruit:mixin:Candidate" as never, "applications", {
        status: "recruit:taskTypeStatus:Backlog",
        kind: "recruit:taskTypes:Applicant",
        number,
        identifier: `APP-${number}`,
        assignee: HR_BOT,
        rank: "0|zzz:",
        startDate: null,
        dueDate: null,
        ploshchadka: platform,
        soobshchenie: message,
      } as never),
    );
    await c.addCollection("attachment:class:Attachment" as never, a.vacancyId as never, applicant as never, "recruit:class:Applicant" as never, "attachments", attachment as never);

    // answers: copies of the vacancy polls with the candidate's answers
    const polls = (await c.findAll("survey:class:Poll" as never, { attachedTo: a.vacancyId } as never)) as Doc[];
    for (const p of polls) {
      const given = a.answers[String(p._id)];
      if (!given || INTERNAL_POLLS.test(String(p.name ?? ""))) continue;
      const questions = (Array.isArray(p.questions) ? p.questions : []).map((q: Doc, i: number) => {
        const ans = given[String(i)] ?? "";
        if (q.kind === "option") {
          const opts: string[] = (q.options ?? []).map((o: unknown) => String((o as Doc)?.label ?? o));
          const k = opts.indexOf(ans);
          return { ...q, answer: undefined, answers: k >= 0 ? [k] : [] };
        }
        return { ...q, answers: undefined, answer: ans };
      });
      await c.addCollection("survey:class:Poll" as never, a.vacancyId as never, applicant as never, "recruit:class:Applicant" as never, "polls", {
        name: p.name,
        prompt: "Ответы кандидата (сайт)",
        questions,
        isCompleted: true,
      } as never);
    }
    return { applicant, person };
  });
}
