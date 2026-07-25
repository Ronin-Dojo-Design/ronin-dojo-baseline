import type { Metadata } from "next";
import {
  ClientStatusPage,
  type DeliveredItem,
  type DocumentItem,
} from "../_components/client-status-page";

/**
 * `/clients/mammoth` — status page for Mammoth Build × Ronin Building Design (SESSION_0678).
 *
 * ── Provenance ───────────────────────────────────────────────────────────────────────────────
 * Areas below mirror the State-of-the-Building AREAS the dispatching lane specified (CRM, site,
 * SEO, automations research, deck, 3D prototype). Everything under `docs/product/mammoth-build/`
 * was read for tone/status context, but none of it states a definitive Live/In-review split for
 * these six areas, and the public Mammoth landing was taken OFF `blackbeltlegacy.com` prod per
 * the goals-ledger (G-019: "was briefly live on BBL prod"). Rather than guess and risk
 * overclaiming to the actual client, every area here defaults to `In review` — the conservative,
 * defensible read. **This needs an operator pass before Michael sees it** (see SESSION_0678
 * "Residual for AM merge").
 *
 * No numbers, no prices, per the brief's hard rule (also honored on the public `/` page).
 */

export const metadata: Metadata = {
  title: "Mammoth Build",
};

const DELIVERED: DeliveredItem[] = [
  {
    area: "CRM",
    status: "In review",
    note: "The lead-to-project workspace being built for the team's day-to-day pipeline.",
  },
  {
    area: "Site",
    status: "In review",
    note: "The public-facing Mammoth Build site.",
  },
  {
    area: "SEO",
    status: "In review",
    note: "Search visibility and content-structure work.",
  },
  {
    area: "Automations research",
    status: "In review",
    note: "Scoping what can be safely automated without losing the human next step.",
  },
  {
    area: "Deck",
    status: "In review",
    note: "The overview deck for the build.",
  },
  {
    area: "3D prototype",
    status: "In review",
    note: "A visual prototype of the building concept.",
  },
];

const DOCUMENTS: DocumentItem[] = [
  { title: "State of the Building", note: "Available at your review meeting" },
  { title: "Pitch deck", note: "Available at your review meeting" },
  { title: "Pricing one-pager", note: "Available at your review meeting" },
];

export default function MammothClientPage() {
  return (
    <ClientStatusPage
      clientLabel="Mammoth Build × Ronin Building Design"
      tagline="A running status page for the CRM, site, and supporting work RDD is building with Michael."
      phaseSummary="Active build across a few fronts at once — the CRM workspace, the site, and the
        supporting research and materials. Everything below is an honest snapshot, not a promise of
        a ship date; it updates as things move, and the details are always worth confirming live."
      delivered={DELIVERED}
      documents={DOCUMENTS}
    />
  );
}
