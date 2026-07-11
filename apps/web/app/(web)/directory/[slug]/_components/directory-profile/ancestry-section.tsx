import { H4 } from "~/components/common/heading"
import { LineageAncestryTimeline } from "~/components/web/lineage/lineage-ancestry-timeline"
import { Section } from "~/components/web/ui/section"
import type { LineageAncestryEntry } from "~/server/web/lineage/ancestry"

/**
 * Lineage ancestry timeline (SESSION_0493 TASK_05) — founder → … → this member,
 * fed by the PUBLIC-only ancestry walk (`getLineageAncestryForPassport` via
 * `loadDirectoryProfile`). Funnel-first: renders logged-out, no tier gate (the
 * lineage chain is already public on the tree surfaces). Renders nothing without
 * a real up-chain — no empty shell.
 *
 * Epic A2-v1 (SESSION_0498): when the chain carries ≥ 1 enabled story scene, the
 * scroll-driven Lineage Journey sequence renders instead — data-gated rollout
 * (founders' descendants get the story; every other chain keeps this timeline
 * EXACTLY as it was). The story wrapper defines `--font-bbl-heading` via the
 * shared `bblHeadingFont.variable` (server-side, so the client motion slice never
 * bundles the font loader) — the landing-page display-type parity seam. This is
 * intentionally NOT a `BrandTypography` wrapper: `/directory` is multi-brand; the
 * BBL type only mounts with BBL lineage story data (see the directory profile
 * orchestrator note).
 */
export function AncestrySection({ ancestry }: { ancestry: LineageAncestryEntry[] }) {
  if (ancestry.length < 2) {
    return null
  }

  // Basic vertical timeline on the profile (operator, SESSION_0525): the scroll-driven Lineage
  // Journey scrollytelling stays in beta (`/app/beta/lineage-journey`) until its kinks are worked
  // out; the public profile always renders the plain timeline.
  return (
    <Section>
      <H4>Lineage</H4>
      {/* Section is md:grid-cols-3 — without the span the timeline auto-places into ONE
          narrow column next to the heading (Desi P1). Heading keeps col 1; timeline 2–3. */}
      <div className="md:col-span-2">
        <LineageAncestryTimeline entries={ancestry} />
      </div>
    </Section>
  )
}
