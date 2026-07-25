import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Pipeline } from "./_components/pipeline";

/**
 * RDD — `/process`, the public "how we build" page (SESSION_0680, agent-OS showcase).
 *
 * ── Copy provenance + guardrails ─────────────────────────────────────────────────────────────
 * Same rules as `app/page.tsx` (which this page matches in voice and does not import from — every
 * route here stands alone): every claim traces to how this repo actually runs a session
 * (`docs/agents/*.md`, `docs/knowledge/wiki/agent-systems-map.md`, `CLAUDE.md`). No client name
 * except BBL. No invented years, ranks, outcomes, or numbers — see the no-numbers rule in
 * `docs/product/rdd/brand-brief.md` §6. Nothing on this page is aspirational-as-fact: the "your
 * brand gets its own crew" idea is framed as the customization model, not a claim that a specific
 * named crew already ships.
 *
 * This page owns its own `metadata` export (Next.js metadata API) — `layout.tsx` sets the site
 * default + the `%s · Ronin Dojo Design` title template, this page only supplies the per-page
 * title/description/OG/canonical.
 */

const CONTACT_EMAIL = "welcome@ronindojodesign.com";

const ROSTER = [
  {
    name: "Petey",
    role: "Planning",
    body: "Turns a goal into a scoped plan and surfaces the open decisions before anyone builds.",
  },
  {
    name: "Cody",
    role: "Build",
    body: "Implements the change in isolation, on its own branch, and reviews the work before anyone else sees it.",
  },
  {
    name: "Doug",
    role: "Verification",
    body: "Proves the change works — real evidence, not an assumption that it does.",
  },
  {
    name: "Desi",
    role: "Design review",
    body: "Checks the work against the design system before it ships — one visual law, not a pile of one-offs.",
  },
  {
    name: "Giddy",
    role: "Architecture",
    body: "The adversarial pass — structure, boundaries, and what quietly breaks later.",
  },
  {
    name: "Brandon",
    role: "Brand",
    body: "Keeps the voice, the claims, and the public copy honest.",
  },
  {
    name: "Larry",
    role: "Legal review",
    body: "Checks claims and commitments before anything goes public.",
  },
  {
    name: "Iggy",
    role: "Social",
    body: "Shapes how the work gets talked about once it’s out in the world.",
  },
];

const DISCIPLINE = [
  {
    title: "Gated",
    body: "Every change answers to the same gates on the way through — type-checked, tested, reviewed. None of them optional, none of them skipped.",
  },
  {
    title: "Reviewed independently",
    body: "Verification, design, and architecture are separate passes. The agent that built the change is never the one that approves it.",
  },
  {
    title: "Evidence-logged",
    body: "Every session is a written record — what changed, what was checked, and how it was proven, not asserted.",
  },
  {
    title: "Human sign-off",
    body: "Nothing merges, deploys, or ships without a person deciding it should. That decision is never automated away.",
  },
];

export const metadata: Metadata = {
  title: "How we build",
  description:
    "How Ronin Dojo Design ships software: a plan becomes parallel build lanes, every lane passes the same gates, independent review checks the work, and one human decision — not the software — decides what ships.",
  openGraph: {
    title: "How we build — Ronin Dojo Design",
    description:
      "Plan, build, gates, independent review, human approval, ship — the same disciplined process behind every brand on the kernel. Nothing ships without a human decision.",
    url: "https://ronindojodesign.com/process",
    siteName: "Ronin Dojo Design",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How we build — Ronin Dojo Design",
    description:
      "Plan, build, gates, independent review, human approval, ship — the same disciplined process behind every brand on the kernel.",
  },
  alternates: { canonical: "/process" },
};

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

export default function ProcessPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* ── Hero: the one-platform / industry-editions thesis, stated in process terms ────── */}
      <header className="px-5 pb-20 pt-24 sm:px-8 md:pb-28 md:pt-32">
        <div className="mx-auto w-full max-w-5xl">
          <a
            href="/"
            className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-primary"
          >
            &larr; Ronin Dojo Design
          </a>
          <p className="mt-6 font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Process
          </p>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl md:text-7xl">
            One platform.
            <br />
            Many industry editions.
            <br />
            <span className="text-primary">Built the same way.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            A construction crew&rsquo;s edition of the platform and a martial-arts school&rsquo;s
            edition ship through the exact same process. This page is that process — how a change
            gets from an idea to production, and why nothing gets there without a person deciding
            it should.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Starting%20a%20project`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Start a project
            </a>
            <a
              href="#pipeline"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3.5 font-display text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              See the pipeline
            </a>
          </div>
        </div>
      </header>

      {/* ── The pipeline ─────────────────────────────────────────────────────────────────── */}
      <Section
        id="pipeline"
        eyebrow="The pipeline"
        title="Every change follows the same route to production."
      >
        <Pipeline />
        <p className="mx-auto mt-10 max-w-2xl text-center text-[0.95rem] leading-relaxed text-muted">
          A plan becomes parallel build lanes. Every lane passes through the same gates before
          independent review looks at it. Then one human decision — not the software — decides
          what ships.
        </p>
      </Section>

      {/* ── The roster ───────────────────────────────────────────────────────────────────── */}
      <Section id="roster" eyebrow="Who builds it" title="Our senior team, on demand.">
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {ROSTER.map(agent => (
            <div key={agent.name} className="flex flex-col gap-2 bg-surface p-6">
              <h3 className="font-display text-lg font-semibold text-ink">{agent.name}</h3>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                {agent.role}
              </p>
              <p className="text-sm leading-relaxed text-muted">{agent.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-2xl">
          <h3 className="font-display text-xl font-semibold text-ink">
            Your brand gets its own crew.
          </h3>
          <p className="mt-3 leading-relaxed text-muted">
            This roster isn&rsquo;t fixed to one brand. Every brand that runs on the platform can
            carry its own crew, under its own names, tuned to the industry it serves — a
            construction client&rsquo;s crew won&rsquo;t be named Petey and Cody, it&rsquo;ll be
            its own roster, built on the exact same process underneath. The people change. The
            discipline does not.
          </p>
        </div>
      </Section>

      {/* ── Discipline: why this isn't AI slop ───────────────────────────────────────────── */}
      <Section
        id="discipline"
        eyebrow="Why this isn’t AI slop"
        title="Every change is gated, reviewed, and on the record."
      >
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {DISCIPLINE.map(item => (
            <div key={item.title} className="flex flex-col gap-3 bg-surface p-7">
              <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
              <p className="text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>

        {/*
          OPERATOR NUMBERS SLOT (SESSION_0680): the dispatch mentioned showcasing build velocity /
          efficiency — lane counts, review turnaround, token cost. The site's ratified no-numbers
          rule (brand-brief.md §6: "No numbers on-site until ratified") wins here, so this section
          stays qualitative. If/when the operator ratifies specific figures, they slot in as a
          fifth card in the grid above, alongside Gated / Reviewed independently / Evidence-logged /
          Human sign-off — do not add them without explicit operator sign-off.
        */}

        <div className="mt-10 max-w-2xl">
          <p className="leading-relaxed text-muted">
            Every surface answers to the same design system, not a pile of one-off components. The
            standing question on every review is the simplest one there is:{" "}
            <span className="text-ink">what would Apple do?</span>
          </p>
          <p className="mt-4 leading-relaxed text-ink">
            That is the whole method: gated, reviewed by people other than the one who built it,
            logged in a written record, and shipped only after a human approves it.
          </p>
        </div>
      </Section>

      {/* ── Contact ──────────────────────────────────────────────────────────────────────── */}
      <Section
        id="contact"
        eyebrow="Talk to us"
        title="Want to see this process running on your brand?"
      >
        <div className="max-w-2xl">
          <p className="leading-relaxed text-muted">
            This is how every build happens on the platform, no matter whose name is on it. If you
            want to see it running on yours, that conversation starts here.
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
