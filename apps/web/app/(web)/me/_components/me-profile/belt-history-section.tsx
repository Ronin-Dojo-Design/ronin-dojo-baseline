import dynamic from "next/dynamic"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import { Section } from "~/components/web/ui/section"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"

/**
 * Lazy boundary: `LineageRankHistoryTab` is the heaviest, below-the-fold client
 * sub-module on this page (it pulls in `LineageRankProgressionPanel`). `next/dynamic`
 * splits its chunk off the initial bundle; SSR is kept (no `ssr: false`) so the dated
 * timeline still server-renders. Same component the lineage drawer lazy-loads — reused,
 * never re-implemented (recipe worked example). Section heading + empty-state Note stay
 * eager server markup.
 */
const LineageRankHistoryTab = dynamic(() =>
  import("~/components/web/lineage/lineage-rank-history-tab").then(m => m.LineageRankHistoryTab),
)

/** "Belt history" panel — the dated, attributed promotion timeline (or an empty state). */
export function BeltHistorySection({
  lineageProfile,
}: {
  lineageProfile: LineageNodeProfile | null
}) {
  return (
    <Section>
      <H4 className={bblHeadingFontClass}>Belt history</H4>
      {lineageProfile ? (
        <LineageRankHistoryTab profile={lineageProfile} />
      ) : (
        <Note>
          No promotions recorded yet. Once an instructor logs a promotion it appears here as a
          dated, attributed timeline.
        </Note>
      )}
    </Section>
  )
}
