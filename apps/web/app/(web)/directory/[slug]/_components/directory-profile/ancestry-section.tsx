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
 */
export function AncestrySection({ ancestry }: { ancestry: LineageAncestryEntry[] }) {
  if (ancestry.length < 2) {
    return null
  }

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
