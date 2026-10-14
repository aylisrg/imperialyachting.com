import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { getVacancy, isPmsConfigured, listVacancies } from "@/lib/careers/pms";
import { Body, FAQ, Pills } from "../content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const v = isPmsConfigured() ? await getVacancy(id).catch(() => null) : null;
  if (!v) return { title: "Careers", robots: { index: false } };
  return {
    title: `${v.title} — Careers`,
    description: v.summary || `${v.title} at Imperial Yachting, Dubai.`,
    alternates: { canonical: `${SITE_CONFIG.url}/careers/${v.id}` },
  };
}

export default async function VacancyPage({ params }: Props) {
  const { id } = await params;
  if (!isPmsConfigured()) notFound();
  const v = await getVacancy(id);
  if (!v) notFound();
  const others = (await listVacancies().catch(() => [])).filter((x) => x.id !== v.id).slice(0, 3);
  const apply = `/careers/${v.id}/apply`;
  const chips = [
    ["about", "About the role"],
    ...(v.requirements.length ? [["reqs", "What we expect"]] : []),
    ...(v.conditions.length ? [["offer", "What we offer"]] : []),
    ["faq", "Questions"],
  ];

  return (
    <>
      <div className="vh">
        <div className="wrap">
          <Link className="crumb" href="/careers">
            <ArrowLeft />
            All positions
          </Link>
          <h1>{v.title}</h1>
          <div className="meta">
            <Pills v={v} />
          </div>
          <div className="cta">
            <Link className="btn" href={apply}>
              Apply now
            </Link>
            <Link className="btn o" href="/careers">
              All positions
            </Link>
          </div>
        </div>
      </div>
      <div className="wrap">
        <nav className="chips">
          {chips.map(([k, l]) => (
            <a key={k} href={`#${k}`}>
              {l}
            </a>
          ))}
        </nav>
        <div className="vb">
          <div>
            <section id="about">
              <h2>About the role</h2>
              {v.summary && <p>{v.summary}</p>}
              {v.body && <Body md={v.body} title={v.title} />}
            </section>
            {v.requirements.length > 0 && (
              <section id="reqs">
                <h2>What we expect</h2>
                <ul>
                  {v.requirements.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </section>
            )}
            {v.conditions.length > 0 && (
              <section id="offer">
                <h2>What we offer</h2>
                <div className="offer">
                  {v.conditions.map((c) => (
                    <div key={c}>
                      <Check />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section id="faq">
              <h2>Questions</h2>
              <div className="faq">
                {FAQ.map(([q, a]) => (
                  <details key={q}>
                    <summary>
                      {q}
                      <Plus />
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
          <aside>
            <div className="card">
              <div className="k">Salary</div>
              <div className="sal">{v.salary || "Discussed personally"}</div>
              <dl>
                {v.location && (
                  <div>
                    <dt>Location</dt>
                    <dd>{v.location}</dd>
                  </div>
                )}
              </dl>
              <Link className="btn" href={apply}>
                Apply now
              </Link>
            </div>
          </aside>
        </div>
        <div className="ban">
          <h2>
            Still thinking? <span style={{ color: "var(--gold)" }}>Join the crew.</span>
          </h2>
          <p>It takes five minutes. We read every application.</p>
          <Link className="btn" href={apply}>
            Apply now
          </Link>
        </div>
        {others.length > 0 && (
          <>
            <div className="sh">
              <h2>Other positions</h2>
            </div>
            <div className="oth" style={{ marginBottom: 80 }}>
              {others.map((x) => (
                <Link key={x.id} className="oc" href={`/careers/${x.id}`}>
                  <b>{x.title}</b>
                  {x.salary && <span style={{ color: "var(--mu)", fontSize: 14 }}>{x.salary}</span>}
                  <span className="l">
                    Learn more <ArrowRight style={{ width: 16, height: 16 }} />
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
