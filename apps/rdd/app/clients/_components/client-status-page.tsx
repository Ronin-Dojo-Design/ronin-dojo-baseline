import type { ReactNode } from "react";

/**
 * Shared shape for the v0 client-preview status pages (SESSION_0678: `/clients/mammoth`,
 * `/clients/bbl`). Scoped to `app/clients/**` — a new route dir, not a shared app-wide primitive
 * — so it deliberately duplicates a little of the home page's section styling (`app/page.tsx`,
 * SESSION_0625) rather than reaching into files this lane doesn't own.
 *
 * Honest by construction: no numbers, no prices, no fabricated URLs. Statuses are limited to the
 * two values the operator specified — `Live` and `In review` — never invented granularity.
 */

const CONTACT_EMAIL = "welcome@ronindojodesign.com";

export type AreaStatus = "Live" | "In review";

export type DeliveredItem = {
  area: string;
  status: AreaStatus;
  note: string;
};

export type DocumentItem = {
  title: string;
  note: string;
};

function mailtoFor(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

function StatusBadge({ status }: { status: AreaStatus }) {
  const tone = status === "Live" ? "border-primary/40 text-primary" : "border-border text-muted";
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 font-display text-[0.7rem] font-semibold uppercase tracking-wider ${tone}`}
    >
      {status}
    </span>
  );
}

export function ClientStatusPage({
  clientLabel,
  tagline,
  phaseSummary,
  delivered,
  documents = [],
  extraLinks,
}: {
  clientLabel: string;
  tagline: string;
  phaseSummary: string;
  delivered: DeliveredItem[];
  documents?: DocumentItem[];
  extraLinks?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-bg px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto w-full max-w-3xl">
        <a
          href="/clients"
          className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-primary"
        >
          &larr; Client previews
        </a>

        <p className="mt-8 font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Project status
        </p>
        <h1 className="mt-3 max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {clientLabel}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{tagline}</p>

        {/* ── Where things stand ─────────────────────────────────────────────────────────── */}
        <section className="mt-14 rounded-lg border border-border bg-surface p-7 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-ink">Where things stand</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">{phaseSummary}</p>
        </section>

        {/* ── Delivered work ──────────────────────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold text-ink">Delivered work</h2>
          <ul className="mt-4 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {delivered.map(item => (
              <li key={item.area} className="flex flex-col gap-2 bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-sm font-semibold text-ink">{item.area}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm leading-relaxed text-muted">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Documents & previews — real artifacts only, never a fabricated URL ─────────── */}
        {documents.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold text-ink">Documents &amp; previews</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              These aren&rsquo;t hosted online yet — click one to request it and we&rsquo;ll bring it
              to your review meeting, or send it over directly.
            </p>
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
              {documents.map(doc => (
                <li key={doc.title}>
                  <a
                    href={mailtoFor(`Requesting: ${doc.title}`)}
                    className="flex flex-col gap-1 p-5 transition-colors hover:bg-elevated sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-display text-sm font-semibold text-ink">{doc.title}</span>
                    <span className="text-sm text-muted">{doc.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {extraLinks}

        {/* ── Contact ──────────────────────────────────────────────────────────────────────── */}
        <section className="mt-10 rounded-lg border border-border bg-surface p-7 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-ink">Questions?</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">
            This page is a snapshot, not a full portal &mdash; reach out any time for detail on
            anything above.
          </p>
          <a
            href={mailtoFor(`${clientLabel} — question`)}
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {CONTACT_EMAIL}
          </a>
        </section>
      </div>
    </main>
  );
}
