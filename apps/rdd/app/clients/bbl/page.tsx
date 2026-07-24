import type { Metadata } from "next";
import {
  ClientStatusPage,
  type DeliveredItem,
} from "../_components/client-status-page";

/**
 * `/clients/bbl` — status page for Black Belt Legacy (SESSION_0678).
 *
 * ── Provenance ───────────────────────────────────────────────────────────────────────────────
 * Statuses trace to `docs/knowledge/wiki/goals-ledger.md`:
 *  - **Technique graph** — public at `/techniques/graph` today (not gated), so honestly `Live`;
 *    still carries a `beta` FeatureStatus pending GA promotion (G-022). Noted, not hidden.
 *  - **Curriculum journey** — the motion-only `CurriculumJourney` scrollytelling piece is a Wave 3
 *    item on G-013, not yet landed as of this session — `In review`.
 *  - **Inbox module** — G-024's admin idea-dump/triage; tracked child lanes staged, "no separate
 *    feature-widget component" exists yet per the ledger — `In review`.
 * No documents/previews section: unlike Mammoth, no specific artifacts were named for BBL, and
 * this lane doesn't fabricate ones. The one real, working link is the live State-of-Dojo view,
 * called out below with its actual auth requirement instead of a login flow this page can't grant.
 */

export const metadata: Metadata = {
  title: "Black Belt Legacy",
};

const DELIVERED: DeliveredItem[] = [
  {
    area: "Technique graph",
    status: "Live",
    note: "Public at blackbeltlegacy.com/techniques/graph, still carrying a beta label while the GA pass finishes.",
  },
  {
    area: "Curriculum journey",
    status: "In review",
    note: "The guided, motion-driven walk through the curriculum — next phase of the technique work.",
  },
  {
    area: "Inbox module",
    status: "In review",
    note: "An admin idea-dump-to-triage flow, being built as a reusable module starting on BBL.",
  },
];

export default function BblClientPage() {
  return (
    <ClientStatusPage
      clientLabel="Black Belt Legacy"
      tagline="A running status page for the technique-graph, curriculum, and admin-tooling work on blackbeltlegacy.com."
      phaseSummary="The technique graph is live in production and moving from beta toward a general-
        availability pass. Alongside it: a guided curriculum experience and an admin inbox for
        triaging ideas and fixes, both mid-build. Everything below is an honest snapshot, not a
        promise of a ship date."
      delivered={DELIVERED}
      extraLinks={
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold text-ink">Live views</h2>
          <a
            href="https://blackbeltlegacy.com/app/state"
            target="_blank"
            rel="noreferrer"
            className="group mt-4 block rounded-lg border border-border bg-surface p-6 transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-base font-semibold text-ink">State of the Dojo</h3>
              <span className="shrink-0 rounded-full border border-border px-3 py-1 font-display text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
                BBL sign-in required
              </span>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              The live session/goals/risk projection inside the BBL app itself — this is a real
              link, not a mockup. It requires signing in with your Black Belt Legacy account.
            </p>
            <p className="mt-4 font-display text-xs font-semibold text-primary group-hover:underline">
              blackbeltlegacy.com/app/state &rarr;
            </p>
          </a>
        </section>
      }
    />
  );
}
