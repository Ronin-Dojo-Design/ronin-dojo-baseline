import type { ReactNode } from "react";

/**
 * RDD — the public marketing surface for `ronindojodesign.com` (SESSION_0625, Slice B3).
 *
 * ── Copy provenance + guardrails ─────────────────────────────────────────────────────────────
 * Every line traces to `docs/product/rdd/brand-brief.md`. That brief marks founder facts as
 * `[operator to fill]` and sets two hard rules, both honored here:
 *   1. **No numbers on-site until ratified** — no pricing, no metrics, no brand counts.
 *   2. **No testimonial / metric / client name without sign-off** — BBL (the operator's own,
 *      `[CONFIRMED live]`) is the ONLY named proof. Mammoth stays off this page until Michael signs off.
 * Nothing here is invented: no years, no ranks, no roles, no outcomes. The founder section is written
 * so it is true without specifics, and gains them when the operator supplies them.
 *
 * The palette is the committed scaffold token set (`app/globals.css`) — the real brand skin is a
 * later design-interview slice, so this spends its effort on composition, not on a new palette.
 */

const CONTACT_EMAIL = "welcome@ronindojodesign.com";

/** `kernel → brand → app` (ADR 0051) — the model the whole studio runs on. */
const MODEL = [
  {
    step: "Kernel",
    body: "One shared technical substrate and a library of feature modules — leads, claims, payments, directories, scheduling. Built once, hardened in production, owned outright.",
  },
  {
    step: "Brand",
    body: "The kernel takes on an identity: your name, your voice, your colors, your language. Not a theme sitting on a template — a brand the software actually belongs to.",
  },
  {
    step: "App",
    body: "Your brand ships as its own product, on its own infrastructure and its own database. Any module can run on any app, so what one brand needs, the next one inherits.",
  },
];

/** Three ways to work with RDD, ordered by leverage. Deliberately no prices — the brief forbids
 * numbers on-site until the operator ratifies them. */
const ENGAGEMENTS = [
  {
    title: "White-label",
    body: "Take a finished platform and make it yours. The fastest route to real software under your own brand — you are not paying to invent what already works.",
  },
  {
    title: "Custom build",
    body: "Something the library does not cover yet. Built on the same kernel, so it arrives on a foundation that has already survived production instead of starting from nothing.",
  },
  {
    title: "Care plan",
    body: "Hosting, marketing, and continued work after launch. Software nobody tends stops being an asset — this is how it keeps earning.",
  },
];

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-border px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-5xl">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* ── Hero: the thesis, stated plainly ─────────────────────────────────────────────── */}
      <header className="px-5 pb-20 pt-24 sm:px-8 md:pb-28 md:pt-32">
        <div className="mx-auto w-full max-w-5xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Ronin Dojo Design
          </p>
          <h1 className="mt-6 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl md:text-7xl">
            One kernel.
            <br />
            Many brands.
            <br />
            <span className="text-primary">Built to last.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            A product studio that builds one durable software kernel and reshapes it into a portfolio
            of brands — so a school, a gym, or a niche business gets a real platform instead of a
            template.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Starting%20a%20project`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Start a project
            </a>
            <a
              href="#proof"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3.5 font-display text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              See what&rsquo;s live
            </a>
          </div>
        </div>
      </header>

      {/* ── The model ────────────────────────────────────────────────────────────────────── */}
      <Section
        id="model"
        eyebrow="How it works"
        title="Most studios rebuild the foundation for every client. We build it once."
      >
        {/* Numbered because this genuinely is a sequence — each stage is built on the one before. */}
        <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {MODEL.map((item, i) => (
            <li key={item.step} className="flex flex-col gap-3 bg-surface p-7">
              <span className="font-display text-xs font-semibold tracking-[0.14em] text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl font-semibold text-ink">{item.step}</h3>
              <p className="text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-2xl text-[0.95rem] leading-relaxed text-muted">
          The practical effect: you are not paying for a foundation to be invented again. You stand on
          one that has already been through production, and the work goes into what makes your business
          different.
        </p>
      </Section>

      {/* ── Engagements — no numbers, per the brief ──────────────────────────────────────── */}
      <Section id="work" eyebrow="Working together" title="Three ways in.">
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {ENGAGEMENTS.map(item => (
            <div key={item.title} className="flex flex-col gap-3 bg-surface p-7">
              <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
              <p className="text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Proof: BBL only. Every other brand needs sign-off before it appears here. ────── */}
      <Section id="proof" eyebrow="Proof of craft" title="Shipped, not slideware.">
        <a
          href="https://blackbeltlegacy.com"
          target="_blank"
          rel="noreferrer"
          className="group block rounded-lg border border-border bg-surface p-8 transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-10"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-2xl font-semibold text-ink">Black Belt Legacy</h3>
            <span className="rounded-full border border-primary/40 px-3 py-1 font-display text-[0.7rem] font-semibold uppercase tracking-wider text-primary">
              Live
            </span>
          </div>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            A verified Brazilian jiu-jitsu lineage platform — member profiles, rank verification, a
            technique library, payments. Built on the kernel, running in production, with real members.
          </p>
          <p className="mt-6 font-display text-sm font-semibold text-primary group-hover:underline">
            blackbeltlegacy.com &rarr;
          </p>
        </a>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          More work is in build. Nothing appears here &mdash; no client name, no outcome, no quote
          &mdash; until that client has approved it.
        </p>
      </Section>

      {/* ── Founder. Zero invented specifics; the brief lists these five domains as CONFIRMED. */}
      <Section
        id="founder"
        eyebrow="Who builds it"
        title="A martial artist who became a systems architect."
      >
        <div className="max-w-2xl space-y-5 leading-relaxed text-muted">
          <p>
            I&rsquo;m Brian. I train, and I build software &mdash; and the overlap is the point. The
            people who preserve a craft usually end up with software written by someone who has never
            practiced one.
          </p>
          <p>
            The work draws on five things that rarely sit together: the martial arts themselves, web
            design and development, software engineering, SEO and marketing, and years as a senior
            developer and systems architect. One person carries a project from understanding the domain
            through the design, the architecture, the shipped product, and the marketing that sells it.
          </p>
          <p className="text-ink">
            That is why the work is different. Nothing gets lost in a handoff, because there isn&rsquo;t
            one.
          </p>
        </div>
      </Section>

      {/* ── Contact ──────────────────────────────────────────────────────────────────────── */}
      {/* `title` is a STRING prop, not JSX text — an HTML entity would render literally here. */}
      <Section id="contact" eyebrow="Get in touch" title="Tell me what you’re trying to build.">
        <div className="max-w-2xl">
          <p className="leading-relaxed text-muted">
            The first conversation is a real one: what you do, where the friction is, and whether a
            platform is honestly the right answer. If it isn&rsquo;t, I&rsquo;ll say so.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Starting%20a%20project`}
            className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </Section>

      <footer className="border-t border-border px-5 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-sm font-semibold text-ink">Ronin Dojo Design</p>
          <p className="text-sm text-muted">One kernel. Many brands. Built to last.</p>
        </div>
      </footer>
    </main>
  );
}
