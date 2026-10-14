import { HomeVideo } from "@/components/home/HomeVideo";

/** Building blocks for Wake inner pages (design/pages/pages.css @ c0f9dc1). */

export function WakeHero({ clip, alt, crumb, title, lead, children, short = true }: {
  clip: string; alt: string; crumb: string; title: React.ReactNode; lead?: React.ReactNode; children?: React.ReactNode; short?: boolean;
}) {
  return (
    <header className={short ? "w-hero short" : "w-hero"}>
      <HomeVideo clip={clip} alt={alt} hero />
      <div className="shade" />
      <span className="crumb cap">{crumb}</span>
      <div className="in">
        <h1 className="serif">{title}</h1>
        <div>
          {lead ? <p className="lead">{lead}</p> : null}
          {children}
        </div>
      </div>
    </header>
  );
}

export function WakeHead({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="w-head">
      <h2 className="serif">{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

export function WakeSection({ tone, className, id, children }: {
  tone?: "light" | "sand"; className?: string; id?: string; children: React.ReactNode;
}) {
  return <section id={id} className={["w-sec", tone, className].filter(Boolean).join(" ")}>{children}</section>;
}

export function WakeMedia({ clip, alt, className }: { clip: string; alt: string; className?: string }) {
  return (
    <div className={["w-media", className].filter(Boolean).join(" ")}>
      <HomeVideo clip={clip} alt={alt} sizes="(max-width:768px) 100vw, 50vw" />
    </div>
  );
}

export function WakeCta({ clip, alt, title, children }: { clip: string; alt: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="w-cta">
      <HomeVideo clip={clip} alt={alt} />
      <div className="shade" />
      <div className="in">
        <h2 className="serif">{title}</h2>
        <div className="acts">{children}</div>
      </div>
    </section>
  );
}

export function WakeSteps({ items, cols = 4 }: { items: { title: string; description: string }[]; cols?: 3 | 4 }) {
  return (
    <div className={cols === 3 ? "w-steps s3" : "w-steps"}>
      {items.map((s, i) => (
        <div key={s.title}>
          <span className="ix">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="serif">{s.title}</h3>
          <p>{s.description}</p>
        </div>
      ))}
    </div>
  );
}

export function WakeList({ items, dark = false }: { items: React.ReactNode[]; dark?: boolean }) {
  return (
    <ul className={dark ? "w-list dark" : "w-list"}>
      {items.map((x, i) => (
        <li key={i}><span className="ix">{String(i + 1).padStart(2, "0")}</span><span>{x}</span></li>
      ))}
    </ul>
  );
}

export function WakeFaq({ title = "Questions.", lead, items }: { title?: React.ReactNode; lead?: string; items: { question: string; answer: string }[] }) {
  return (
    <section className="w-sec sand w-faq">
      <WakeHead title={title}>{lead}</WakeHead>
      {items.map((f, i) => (
        <details key={f.question} open={i < 2}>
          <summary className="serif">{f.question}</summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </section>
  );
}

/** Index + serif title split block ("01 / What's included."). */
export function WakeSplitTitle({ ix, title, children }: { ix: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="w-st">
      <span className="ix">{ix}</span>
      <h2 className="serif">{title}</h2>
      {children}
    </div>
  );
}

/** Full-bleed clip between sections. */
export function WakeBand({ clip, alt }: { clip: string; alt: string }) {
  return (
    <div className="w-band">
      <HomeVideo clip={clip} alt={alt} />
    </div>
  );
}
