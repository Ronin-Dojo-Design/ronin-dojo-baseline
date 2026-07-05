import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Stack } from "~/components/common/stack"
import { memberInitials } from "~/lib/lineage/canvas-model"
import { cx } from "~/lib/utils"
import type { LineageAncestryEntry } from "~/server/web/lineage/ancestry"

/**
 * Shared per-entry rendering atoms for `LineageAncestryEntry` surfaces
 * (SESSION_0499 fallow dup-kill): the vertical ancestry timeline
 * (`lineage-ancestry-timeline.tsx`) and the Lineage Journey scenes
 * (`lineage-story/lineage-story-scene.tsx`) rendered byte-identical avatar and
 * rank/discipline blocks. Homed as a lineage-family SIBLING (not inside
 * `lineage-story/`) so the older generic timeline never imports from the newer
 * story module — the dependency stays one-way: both consume this file.
 *
 * @added   SESSION_0499 (2026-07-05)
 * @why     Dup-kill — one source for the avatar + rank byline both ancestry surfaces rendered verbatim
 * @wired   lineage-ancestry-timeline.tsx, lineage-story/lineage-story-scene.tsx
 */

/** Entry avatar — image when present, `memberInitials` fallback. Ring/size styling is the caller's. */
export function AncestryAvatar({
  entry,
  className,
}: {
  entry: Pick<LineageAncestryEntry, "avatarUrl" | "displayName">
  className?: string
}) {
  return (
    <Avatar className={className}>
      {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />}
      <AvatarFallback>{memberInitials(entry.displayName)}</AvatarFallback>
    </Avatar>
  )
}

/**
 * Rank/belt + discipline byline — the timeline-node vocabulary. Belt color is
 * `Rank.colorHex` DATA (ADR 0022/0035), never a hardcoded palette. `mutedClass`
 * carries the surface's muted-text token: `text-muted-foreground` on the
 * timeline, the scene palette's `tokens.muted` in the story scenes.
 */
export function RankByline({
  entry,
  mutedClass,
}: {
  entry: Pick<LineageAncestryEntry, "rank" | "disciplineLabel">
  mutedClass: string
}) {
  return (
    <>
      {entry.rank && (
        <Stack size="sm" direction="row" wrap={false} className="items-center">
          <BeltSwatch
            variant="flat-bar"
            colorHex={entry.rank.colorHex}
            secondaryColorHex={entry.rank.secondaryColorHex}
            degree={entry.rank.degree}
          />
          <span className={cx("truncate text-xs", mutedClass)}>{entry.rank.name}</span>
        </Stack>
      )}

      {entry.disciplineLabel && (
        <span className={cx("truncate text-xs", mutedClass)}>{entry.disciplineLabel}</span>
      )}
    </>
  )
}
