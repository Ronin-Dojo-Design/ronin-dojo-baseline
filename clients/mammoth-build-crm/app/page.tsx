import Link from "next/link";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { MirrorVisual } from "@/components/landing/MirrorVisual";
import { BuildingTypesGrid } from "@/components/landing/BuildingTypesGrid";
import { InquiryForm } from "@/components/landing/InquiryForm";
import { Reveal } from "@/components/Reveal";
import { CONTEXT_BAND, DIFFERENTIATOR, HERO, PROCESS_STEPS } from "@/lib/content";

export default function LandingPage() {
  return (
    <main>
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pt-28 pb-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.2em] text-primary">
              {HERO.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
              {HERO.headline}
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">{HERO.sub}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#start"
                className="rounded-md bg-primary px-6 py-3 font-semibold text-bg transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                {HERO.cta}
              </a>
              <a
                href="#process"
                className="rounded-md border border-border px-6 py-3 font-semibold text-ink transition-colors hover:border-primary"
              >
                See our process
              </a>
            </div>
          </div>
          <MirrorVisual />
        </div>
      </section>

      {/* Differentiator */}
      <Reveal as="section" className="px-5 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-display text-2xl font-semibold leading-snug sm:text-3xl">
            {DIFFERENTIATOR}
          </p>
        </div>
      </Reveal>

      {/* Process */}
      <section id="process" className="border-y border-border bg-surface px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-bold">We stay in the whole project.</h2>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((s, i) => (
              <Reveal key={s.label} delayMs={i * 80}>
                <div className="h-full rounded-lg border border-border bg-bg p-5">
                  <span className="font-display text-3xl font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold">{s.label}</h3>
                  <p className="mt-2 text-sm text-muted">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Industries / building types */}
      <section id="industries" className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 id="buildings" className="font-display text-3xl font-bold">
            What we build
          </h2>
          <p className="mt-2 text-muted">Save the types you're interested in — it pre-fills your inquiry.</p>
          <div className="mt-8">
            <BuildingTypesGrid />
          </div>
        </div>
      </section>

      {/* Context band */}
      <Reveal as="section" className="bg-surface px-5 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-display text-2xl font-semibold sm:text-3xl">{CONTEXT_BAND}</p>
        </div>
      </Reveal>

      {/* Start your build */}
      <section id="start" className="px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-bold">Start your build</h2>
          <p className="mt-2 text-muted">Tell us what you need. We'll take it from there.</p>
          <div className="mt-8 rounded-xl border border-border bg-surface p-6">
            <InquiryForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-bold">
              MAMMOTH<span className="text-primary">.</span>build
            </p>
            <p className="text-sm text-muted">Michael Flores, General Manager</p>
          </div>
          <Link
            href="/app"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary"
          >
            Open the CRM →
          </Link>
        </div>
        <p className="mx-auto mt-6 max-w-6xl text-xs text-muted">
          MVP demo · palette provisional pending brand assets · © {new Date().getFullYear()} Mammoth Metal Buildings
        </p>
      </footer>
    </main>
  );
}
