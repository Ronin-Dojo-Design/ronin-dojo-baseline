import { MedalIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import { Section } from "~/components/web/ui/section"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"
import { MeSectionEmpty } from "./me-section-empty"

/**
 * Lazy boundary: `LineageRankHistoryTab` is the heaviest, below-the-fold client
 * sub-module on this page (it pulls in `LineageRankProgressionPanel`). `next/dynamic`
 * splits its chunk off the initial bundle; SSR is kept (no `ssr: false`) so the dated
 * timeline still server-renders. Same component the lineage drawer lazy-loads — reused,
 * never re-implemented (recipe worked example). Section heading + empty-state stay
 * eager server markup.
 */
const LineageRankHistoryTab = dynamic(() =>
  import("~/components/web/lineage/lineage-rank-history-tab").then(m => m.LineageRankHistoryTab),
)

/** "Belt history" panel — the dated, attributed promotion timeline (or an inviting empty state). */
export function BeltHistorySection({
  lineageProfile,
}: {
  lineageProfile: LineageNodeProfile | null
}) {
  if (!lineageProfile) {
    return (
      <div className="flex w-full flex-col gap-4">
        <H4 className={bblHeadingFontClass}>Belt history</H4>
        <MeSectionEmpty
          icon={<MedalIcon />}
          title="Your belt journey starts here"
          description="When an instructor logs a promotion it appears here as a dated, attributed timeline. Set your current belt now so your Passport shows your rank."
          action={
            <Button variant="secondary" size="md" render={<Link href="/app/profile" />}>
              Set your current belt
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <Section>
      <H4 className={bblHeadingFontClass}>Belt history</H4>
      <LineageRankHistoryTab profile={lineageProfile} />
    </Section>
  )
}
