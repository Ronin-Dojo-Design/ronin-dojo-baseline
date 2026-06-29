import { brand } from "@/lib/brand";

/**
 * Baseline — the white-label school landing page.
 *
 * Lean and fully token-driven: every string comes from `lib/brand.ts` and every
 * color from the CSS-variable tokens in `app/globals.css`. There is NO hardcoded
 * school name, copy, or hex here — that's the white-label contract. Swap the two
 * token files and this page is a different school's site, no edits below.
 *
 * Deliberately minimal: a school site is a funnel (hero → programs → inquiry),
 * not a portal. The richer pieces (a real inquiry POST to the `Lead` model, an
 * admin board on the shared AdminKanban kernel) are wired in follow-up sessions;
 * the scaffold proves the shape runs.
 */
const PROGRAMS = [
  { name: "Kids", blurb: "Confidence, focus, and respect — on and off the mat." },
  { name: "Adults", blurb: "Fundamentals to advanced. Train at your own pace." },
  { name: "Competition", blurb: "Structured prep for those who want to test themselves." },
];

export default function LandingPage() {
  return (
    <main>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            {brand.schoolName}
          </span>
          <nav className="hidden gap-6 text-sm text-muted sm:flex">
            {brand.nav.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-ink">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 pt-24 pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-primary">
            {brand.tagline}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-ink sm:text-6xl">
            {brand.hero.headline}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{brand.hero.sub}</p>
          <div className="mt-8">
            <a
              href="#visit"
              className="inline-block rounded-md bg-primary px-7 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {brand.hero.cta}
            </a>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-bold text-ink">Programs</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {PROGRAMS.map((p) => (
              <div
                key={p.name}
                className="rounded-lg border border-border bg-surface p-6 transition-colors hover:bg-elevated"
              >
                <h3 className="font-display text-lg font-semibold text-ink">{p.name}</h3>
                <p className="mt-2 text-sm text-muted">{p.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit / contact */}
      <section id="visit" className="px-5 py-16">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-ink">Come train with us</h2>
          <p className="mt-3 text-muted">
            Email{" "}
            <a href={`mailto:${brand.contact.email}`} className="text-primary hover:underline">
              {brand.contact.email}
            </a>{" "}
            to book a free intro class.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-5 py-8">
        <div className="mx-auto max-w-6xl text-sm text-muted">
          © {new Date().getFullYear()} {brand.schoolName}. Built on Baseline.
        </div>
      </footer>
    </main>
  );
}
