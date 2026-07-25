import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "./_components/Section";

/**
 * `/industries` — the index of RDD's industry editions (SESSION_0648).
 *
 * ── Copy provenance + guardrails ─────────────────────────────────────────────────────────────
 * Same rules as `app/page.tsx` (`docs/product/rdd/brand-brief.md`): no pricing/metrics/counts
 * anywhere on this page, no client name beyond BBL (and BBL only appears here as a link back to
 * the home page's existing proof section, not restated), nothing invented. Every industry beyond
 * Building & Construction is listed as "coming soon" with a name only — no service detail, no
 * timeline, no fabricated scope.
 */

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Ronin Dojo Design builds industry editions of one proven platform — the same kernel, reshaped for how a specific trade actually works.",
  alternates: { canonical: "/industries" },
};

const LIVE_INDUSTRY = {
  slug: "building-construction",
  name: "Building & Construction",
  edition: "Ronin Building Design",
  body: "A site, a lead pipeline, and the automation that connects them — reshaped around how builders, remodelers, and specialty contractors actually win work.",
};

/** Named, not detailed. Per the lane brief: operator-confirmed family, no invented scope. */
const COMING_SOON = ["Plumbing", "Landscape"];

export default function IndustriesIndexPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* ── Intro: the niche-variant strategy, stated once ──────────────────────────────── */}
      <header className="px-5 pb-16 pt-24 sm:px-8 md:pb-20 md:pt-32">
        <div className="mx-auto w-full max-w-5xl">
          <Link
            href="/"
            className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-primary"
          >
            &larr; Ronin Dojo Design
          </Link>
          <p className="mt-6 font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Industries
          </p>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
            One platform. <span className="text-primary">An edition per trade.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
            Ronin Dojo Design builds industry editions of one proven platform — the same kernel
            that already runs in production, reshaped around how a specific trade actually works.
            Not a template with a new logo. A brand of its own, standing on a foundation that has
            already shipped.
          </p>
        </div>
      </header>

      {/* ── Live edition ─────────────────────────────────────────────────────────────────── */}
      <Section id="live" eyebrow="Live now" title="The first edition.">
        <Link
          href={`/industries/${LIVE_INDUSTRY.slug}`}
          className="group block rounded-lg border border-border bg-surface p-8 transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-10"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-2xl font-semibold text-ink">
              {LIVE_INDUSTRY.name}
            </h3>
            <span className="rounded-full border border-primary/40 px-3 py-1 font-display text-[0.7rem] font-semibold uppercase tracking-wider text-primary">
              Live
            </span>
          </div>
          <p className="mt-2 font-display text-sm font-semibold text-muted">
            {LIVE_INDUSTRY.edition}
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">{LIVE_INDUSTRY.body}</p>
          <p className="mt-6 font-display text-sm font-semibold text-primary group-hover:underline">
            See the edition &rarr;
          </p>
        </Link>
      </Section>

      {/* ── Coming soon — names only, per the lane brief ────────────────────────────────── */}
      <Section id="coming-soon" eyebrow="In the family" title="More editions are in build.">
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {COMING_SOON.map(name => (
            <div key={name} className="flex items-center justify-between gap-3 bg-surface p-7">
              <h3 className="font-display text-xl font-semibold text-ink">{name}</h3>
              <span className="rounded-full border border-border px-3 py-1 font-display text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
                Coming soon
              </span>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-[0.95rem] leading-relaxed text-muted">
          Each one is the same kernel, reshaped again. Nothing ships here until it&rsquo;s live.
        </p>
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
