"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Upload, X } from "lucide-react";
import type { Question, VacancyFull } from "@/lib/careers/pms";
import { Pills } from "./content";

const MAX_CV = 5 * 1024 * 1024;
const CV_RE = /\.(pdf|docx?)$/i;

const OPEN_FIELDS = [
  "Marine crew",
  "Guest experience",
  "Sales and partnerships",
  "Marketing and content",
  "Operations and finance",
  "Something else",
];
// Open application: no vacancy in PMS, so the questions live here.
const OPEN_QUESTIONS: Question[] = [
  { id: "0", text: "How good are you at your craft — honestly?", kind: "rating", options: [], required: true },
  {
    id: "1",
    text: "What are you exceptionally good at? Give us proof: a result, a number, a link.",
    kind: "text",
    options: [],
    required: true,
  },
  { id: "2", text: "What would you do for the empire in your first 90 days?", kind: "text", options: [], required: false },
];

type Errors = Record<string, boolean>;

function Rating({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <>
      <div className="rt" role="radiogroup">
        {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => (
          <label key={n}>
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} />
            <span>{n}</span>
          </label>
        ))}
      </div>
      <div className="rl">
        <span>1 — beginner</span>
        <span>10 — expert</span>
      </div>
    </>
  );
}

function Select({ id, value, onChange, options }: { id: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="sel">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown />
    </div>
  );
}

export function ApplyForm({ vacancy: v }: { vacancy: VacancyFull | null }) {
  const open = !v;
  const polls = open ? [{ id: "open", name: "", prompt: "", questions: OPEN_QUESTIONS }] : v.polls;
  const [f, setF] = useState<Record<string, string>>({ start: "Immediately" });
  const [ans, setAns] = useState<Record<string, string>>({});
  const [cv, setCv] = useState<File | null>(null);
  const [cvErr, setCvErr] = useState("Please attach your CV");
  const [agree, setAgree] = useState(false);
  const [bad, setBad] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");
  const [done, setDone] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (k: string) => (val: string) => {
    setF((p) => ({ ...p, [k]: val }));
    setBad((b) => ({ ...b, [k]: false }));
  };
  const setA = (k: string) => (val: string) => {
    setAns((p) => ({ ...p, [k]: val }));
    setBad((b) => ({ ...b, [k]: false }));
  };

  function pick(file: File | undefined) {
    if (!file) return;
    if (!CV_RE.test(file.name) || file.size > MAX_CV) {
      setCvErr("Use PDF, DOC or DOCX up to 5 MB");
      setBad((b) => ({ ...b, cv: true }));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setCv(file);
    setBad((b) => ({ ...b, cv: false }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Errors = {
      n: (f.n ?? "").trim().length < 2,
      e: !/^\S+@\S+\.\S+$/.test(f.e ?? ""),
      p: (f.p ?? "").replace(/\D/g, "").length < 7,
      vs: !f.vs,
      cv: !cv,
      ag: !agree,
    };
    if (open) err.field = !f.field;
    for (const p of polls)
      for (const q of p.questions) {
        const a = (ans[`${p.id}:${q.id}`] ?? "").trim();
        if (q.required) err[`${p.id}:${q.id}`] = q.kind === "text" ? a.length < 10 : !a;
      }
    if (!cv) setCvErr("Please attach your CV");
    setBad(err);
    if (Object.values(err).some(Boolean)) {
      requestAnimationFrame(() => formRef.current?.querySelector(".bad")?.scrollIntoView({ block: "center" }));
      return;
    }

    const body = new FormData();
    body.set("vacancy", v?.id ?? "");
    for (const k of ["n", "e", "p", "c", "vs", "start", "l", "field", "website"]) body.set(k, f[k] ?? "");
    const answers: Record<string, Record<string, string>> = {};
    const openAnswers: { question: string; answer: string }[] = [];
    for (const p of polls)
      for (const q of p.questions) {
        const a = (ans[`${p.id}:${q.id}`] ?? "").trim();
        if (!a) continue;
        if (open) openAnswers.push({ question: q.text, answer: a });
        else (answers[p.id] ??= {})[q.id] = a;
      }
    body.set("answers", JSON.stringify(answers));
    body.set("openAnswers", JSON.stringify(openAnswers));
    body.set("cv", cv as File);

    setBusy(true);
    setFail("");
    try {
      const r = await fetch("/api/careers/apply", { method: "POST", body });
      if (!r.ok) throw new Error(String(r.status));
      setDone(true);
      window.scrollTo(0, 0);
    } catch {
      setFail(`Something went wrong and your application was not sent. Please try again, or write to us on WhatsApp.`);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="wrap">
        <div className="done">
          <div className="ok">
            <Check />
          </div>
          <h1>
            Application <span style={{ color: "var(--gold)" }}>sent</span>
          </h1>
          <p>
            Thank you!{" "}
            {v ? (
              <>
                We received your application for <b style={{ color: "#fff" }}>{v.title}</b>.
              </>
            ) : (
              "We received your details and answers."
            )}{" "}
            We will write to you within two working days.
          </p>
          <div className="steps">
            <div>
              <b>1 · Today</b>
              <span>Application received</span>
            </div>
            <div>
              <b>2 · Next</b>
              <span>We read your CV</span>
            </div>
            <div>
              <b>3 · If it fits</b>
              <span>We contact you</span>
            </div>
          </div>
          <div className="cta" style={{ justifyContent: "center" }}>
            <Link className="btn" href="/careers">
              See other positions
            </Link>
            {v && (
              <Link className="btn o" href={`/careers/${v.id}`}>
                Back to the position
              </Link>
            )}
          </div>
        </div>
      </div>
    );

  const cls = (k: string, w = false) => `fld${w ? " w" : ""}${bad[k] ? " bad" : ""}`;
  const head = open ? (
    <div className="ch">
      <span className="tag">Open application</span>
      <h1>
        If you are <em>truly good</em> — we are ready to consider you
      </h1>
      <p>
        We do not have a role for every talent on our list — and we do not want to lose the exceptional ones. If you are
        outrageously good at what you do and believe you can serve the empire, or that the empire needs you — tell us who
        you are.
      </p>
      <p>No cover letter contest. Just honest answers, proof of what you have done, and your CV.</p>
    </div>
  ) : (
    <>
      <span className="tag">Application</span>
      <h1>
        Apply for <em style={{ fontStyle: "normal", color: "var(--gold)" }}>{v.title}</em>
      </h1>
      <p className="lead">
        Tell us a little about yourself{polls.length ? ", answer a short questionnaire" : ""} and attach your CV. Fields
        marked with a star are required.
      </p>
    </>
  );

  return (
    <div className="wrap">
      <Link className="crumb" style={{ marginTop: 18 }} href={open ? "/careers" : `/careers/${v.id}`}>
        <ArrowLeft />
        {open ? "Back to positions" : "Back to the position"}
      </Link>
      {open && head}
      <div className="fw">
        <div>
          {!open && head}
          <form ref={formRef} onSubmit={submit} noValidate>
            <div className="fg">
              <div className="fh">About you</div>
              <div className={cls("n")}>
                <label htmlFor="n">
                  Full name <i>*</i>
                </label>
                <input id="n" autoComplete="name" placeholder="Jane Smith" value={f.n ?? ""} onChange={(e) => set("n")(e.target.value)} />
                <span className="er">Please enter your name</span>
              </div>
              <div className={cls("e")}>
                <label htmlFor="e">
                  Email <i>*</i>
                </label>
                <input id="e" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={f.e ?? ""} onChange={(e) => set("e")(e.target.value)} />
                <span className="er">Please enter a valid email</span>
              </div>
              <div className={cls("p")}>
                <label htmlFor="p">
                  Phone / WhatsApp <i>*</i>
                </label>
                <input id="p" type="tel" inputMode="tel" autoComplete="tel" placeholder="+971 50 000 0000" value={f.p ?? ""} onChange={(e) => set("p")(e.target.value)} />
                <span className="er">Please enter your phone</span>
              </div>
              <div className="fld">
                <label htmlFor="c">Current city and country</label>
                <input id="c" autoComplete="address-level2" placeholder="Dubai, UAE" value={f.c ?? ""} onChange={(e) => set("c")(e.target.value)} />
              </div>
              <div className={cls("vs")}>
                <label htmlFor="vs">
                  UAE visa status <i>*</i>
                </label>
                <Select
                  id="vs"
                  value={f.vs ?? ""}
                  onChange={set("vs")}
                  options={["I have a UAE residence visa", "I have a visit visa", "I am outside the UAE"]}
                />
                <span className="er">Please choose one</span>
              </div>
              <div className="fld">
                <label htmlFor="av">When can you start?</label>
                <div className="sel">
                  <select id="av" value={f.start} onChange={(e) => set("start")(e.target.value)}>
                    {["Immediately", "Within 2 weeks", "Within a month", "Later"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown />
                </div>
              </div>
              {open && (
                <div className={cls("field", true)}>
                  <label htmlFor="field">
                    Your field <i>*</i>
                  </label>
                  <Select id="field" value={f.field ?? ""} onChange={set("field")} options={OPEN_FIELDS} />
                  <span className="er">Please choose one</span>
                </div>
              )}
              <div className="fld w">
                <label htmlFor="l">LinkedIn or portfolio link</label>
                <input id="l" type="url" inputMode="url" placeholder="Optional" value={f.l ?? ""} onChange={(e) => set("l")(e.target.value)} />
              </div>
              <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website ?? ""} onChange={(e) => set("website")(e.target.value)} />

              {polls.map((p) => (
                <PollFields key={p.id} poll={p} ans={ans} bad={bad} setA={setA} first={p === polls[0]} open={open} />
              ))}

              <div className="fh">Your CV</div>
              <div className={cls("cv", true)}>
                <label
                  className={`up${drag ? " drag" : ""}`}
                  hidden={!!cv}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                  }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    pick(e.dataTransfer.files[0]);
                  }}
                >
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={(e) => pick(e.target.files?.[0])} />
                  <Upload />
                  <div>
                    <b>
                      Upload your CV <i style={{ color: "var(--gold)", fontStyle: "normal" }}>*</i>
                    </b>
                    <span>PDF, DOC or DOCX, up to 5 MB — tap or drop a file here</span>
                  </div>
                </label>
                <div className={`file${cv ? " on" : ""}`}>
                  <Check />
                  <div>
                    <b>{cv?.name}</b>
                    <span>{cv ? (cv.size < 1048576 ? `${Math.max(1, Math.round(cv.size / 1024))} KB` : `${(cv.size / 1048576).toFixed(1)} MB`) : ""}</span>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove file"
                    onClick={() => {
                      setCv(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    <X />
                  </button>
                </div>
                <span className="er">{cvErr}</span>
              </div>
              <div className={cls("ag", true)}>
                <label className="chk">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => {
                      setAgree(e.target.checked);
                      setBad((b) => ({ ...b, ag: false }));
                    }}
                  />
                  <span>
                    I agree that Imperial Yachting processes my data to review this application.{" "}
                    <Link href="/privacy">Privacy Policy</Link>
                  </span>
                </label>
                <span className="er">Please confirm to continue</span>
              </div>
            </div>
            <div className="sub1">
              <button type="submit" className="btn" disabled={busy}>
                {busy ? "Sending…" : "Send application"}
              </button>
              <span style={{ fontSize: 13, color: "var(--mu2)" }}>We reply within two working days.</span>
            </div>
            {fail && <p className="fail">{fail}</p>}
          </form>
        </div>
        {open ? (
          <aside className="side2">
            <div className="k">Open application</div>
            <b>No position yet? No problem.</b>
            <ol>
              <li>We read your answers</li>
              <li>If it fits, we contact you</li>
            </ol>
          </aside>
        ) : (
          <aside className="side2">
            <div className="k">You are applying for</div>
            <b>{v.title}</b>
            <div>
              <Pills v={v} />
            </div>
            <ol>
              <li>We read your CV</li>
              <li>If it fits, we contact you</li>
            </ol>
          </aside>
        )}
      </div>
    </div>
  );
}

function PollFields({
  poll,
  ans,
  bad,
  setA,
  first,
  open,
}: {
  poll: { id: string; name: string; prompt: string; questions: Question[] };
  ans: Record<string, string>;
  bad: Errors;
  setA: (k: string) => (v: string) => void;
  first: boolean;
  open: boolean;
}) {
  return (
    <>
      {first && <div className="fh">Questionnaire</div>}
      {first && (
        <p className="qh">
          {open
            ? "Rate yourself honestly and answer briefly. We read every answer."
            : "Rate yourself honestly from 1 to 10 and answer briefly. We read every answer."}
        </p>
      )}
      {poll.questions.map((q) => {
        const k = `${poll.id}:${q.id}`;
        const star = q.required ? <i style={{ color: "var(--gold)", fontStyle: "normal" }}> *</i> : null;
        const c = `fld w${bad[k] ? " bad" : ""}`;
        if (q.kind === "rating")
          return (
            <div key={k} className={c}>
              <span className="lbl">
                {q.text}
                {star}
              </span>
              <Rating name={k} value={ans[k] ?? ""} onChange={setA(k)} />
              <span className="er">Please choose a number</span>
            </div>
          );
        if (q.kind === "choice")
          return (
            <div key={k} className={c}>
              <label htmlFor={k}>
                {q.text}
                {star}
              </label>
              <Select id={k} value={ans[k] ?? ""} onChange={setA(k)} options={q.options} />
              <span className="er">Please choose one</span>
            </div>
          );
        return (
          <div key={k} className={c}>
            <label htmlFor={k}>
              {q.text}
              {star}
            </label>
            <textarea id={k} placeholder="A few sentences are enough" value={ans[k] ?? ""} onChange={(e) => setA(k)(e.target.value)} />
            {q.required ? <span className="er">Please answer in a few words</span> : <small>Optional</small>}
          </div>
        );
      })}
    </>
  );
}
