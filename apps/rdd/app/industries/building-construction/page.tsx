import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "../_components/Section";

/**
 * `/industries/building-construction` — Ronin Building Design, the Building &
 * Construction edition of the RDD kernel (SESSION_0648).
 *
 * ── Copy provenance + guardrails ─────────────────────────────────────────────────────────────
 * Structure is patterned on `structurewebworks.com` (hero → pain points → what-we-build → proof
 * → CTA) per the lane brief — copy is original, not borrowed. Same hard rules as `app/page.tsx`:
 *   1. No numbers on-site — no pricing, no metrics, no counts of any kind.
 *   2. No client name beyond BBL, and BBL appears only as engineering proof of the underlying
 *      kernel — never restyled as a construction-industry testimonial. Mammoth stays off this
 *      page (no sign-off).
 * Pain points and capabilities below are generic to the construction-marketing problem space, not
 * claims about specific RDD outcomes — nothing here is invented as something RDD has already done
 * for a construction client.
 */

const CONTACT_EMAIL = "welcome@ronindojodesign.com";

const PAIN_POINTS = [
  {
    title: "The site looks like every other contractor's.",
    body: "Template builders produce interchangeable results — the same layout, the same stock photography, nothing that tells a homeowner why to call this crew instead of the next tab open.",
  },
  {
    title: "Leads land in an inbox nobody checks.",
    body: "A contact form isn't a pipeline. Without somewhere for a lead to go — and something that follows up on its own — most of what the site generates just evaporates.",
  },
  {
    title: "Every fix means a call to whoever built it.",
    body: "Static sites and page builders lock the owner out of their own site. A copy change, a new project photo, a service update — all of it waits on someone else's calendar.",
  },
  {
    title: "Marketing and the jobsite don't talk to each other.",
    body: "The website, the lead pipeline, and the way work actually gets scheduled are separate systems that were never meant to work together, so nothing they learn about a lead makes it back to whoever is bidding the job.",
  },
];

const WHAT_WE_BUILD = [
  {
    title: "Site refresh",
    body: "Built on the kernel, not a theme — fast, mobile-first, and organized around how a homeowner actually decides who to call.",
  },
  {
    title: "Lead capture → CRM",
    body: "Every inquiry lands somewhere real. The same pipeline the kernel already runs elsewhere, reshaped around how a contractor qualifies and follows up on a job.",
  },
  {
    title: "Automation",
    body: "The follow-up that's supposed to happen after a lead comes in — reminders, status updates, the routine work that gets skipped when it depends on someone remembering.",
  },
  {
    title: "SEO",
    body: "Built to be found by the searches that actually turn into jobs, not just built to look good in a portfolio.",
  },
  {
    title: "Social",
    body: "The project photos and finished work turned into the ongoing proof a trade business runs on, without it becoming a second job.",
  },
];

export const metadata: Metadata = {
  title: "Building & Construction — Ronin Building Design",
  description:
    "Ronin Building Design is the building & construction edition of Ronin Dojo Design's platform — a site, a lead pipeline, and the automation that connects them, built on a kernel already running in production.",
  alternates: { canonical: "/industries/building-construction" },
};

export default function BuildingConstructionPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* ── Hero: niche positioning ──────────────────────────────────────────────────────── */}
      <header className="px-5 pb-20 pt-24 sm:px-8 md:pb-28 md:pt-32">
        <div className="mx-auto w-full max-w-5xl">
          <Link
            href="/industries"
            className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-primary"
          >
            &larr; Industries
          </Link>
          <p className="mt-6 font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Ronin Dojo Design &middot; Building &amp; Construction
          </p>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl md:text-7xl">
            Ronin Building Design
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            The building &amp; construction edition of Ronin Dojo Design&rsquo;s platform — the
            same kernel, reshaped for builders, remodelers, and specialty contractors who need a
            site that generates work, not just impressions.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Ronin%20Building%20Design`}
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

      {/* ── Pain points ──────────────────────────────────────────────────────────────────── */}
      <Section
        id="pain-points"
        eyebrow="The problem"
        title="Most contractor sites work against the business behind them."
      >
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
          {PAIN_POINTS.map(item => (
            <div key={item.title} className="flex flex-col gap-3 bg-surface p-7">
              <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
              <p className="text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── What we build ────────────────────────────────────────────────────────────────── */}
      <Section id="work" eyebrow="What ships" title="One platform, doing five jobs at once.">
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {WHAT_WE_BUILD.map(item => (
            <div key={item.title} className="flex flex-col gap-3 bg-surface p-7">
              <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
              <p className="text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Proof: BBL only, reframed as engineering proof — not a construction testimonial ── */}
      <Section
        id="proof"
        eyebrow="Proof of craft"
        title="The kernel underneath this edition already runs in production."
      >
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
            A verified Brazilian jiu-jitsu lineage platform — member profiles, rank
            verification, a technique library, payments. Built on the same kernel Ronin Building
            Design ships on, running in production, with real members.
          </p>
          <p className="mt-6 font-display text-sm font-semibold text-primary group-hover:underline">
            blackbeltlegacy.com &rarr;
          </p>
        </a>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          It isn&rsquo;t a construction site — it&rsquo;s proof the foundation underneath this
          one holds up in production. Building &amp; Construction is a new brand on that same
          foundation, not a fresh build starting from zero.
        </p>
      </Section>

      {/* ── CTA ──────────────────────────────────────────────────────────────────────────── */}
      <Section id="contact" eyebrow="Get in touch" title="Tell me about the trade and the site.">
        <div className="max-w-2xl">
          <p className="leading-relaxed text-muted">
            The first conversation is a real one: what the crew does, where the site and the
            pipeline are failing, and whether Ronin Building Design is honestly the right fit. If
            it isn&rsquo;t, I&rsquo;ll say so.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Ronin%20Building%20Design`}
            className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </Section>

      <footer className="border-t border-border px-5 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-sm font-semibold text-ink">Ronin Building Design</p>
          <p className="text-sm text-muted">
            A Ronin Dojo Design industry edition. &middot;{" "}
            <Link href="/industries" className="hover:text-primary hover:underline">
              All industries
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
