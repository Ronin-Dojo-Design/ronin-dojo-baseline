import { BeltSwatch } from "~/components/common/belt-swatch"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { formatPromotionDate } from "~/components/web/lineage/lineage-cohort-timeline/promotion-format"
import { Section } from "~/components/web/ui/section"
import type { DirectoryProfile } from "./directory-profile-data"
import { RankStatusBadge } from "./rank-status-badge"

/**
 * Ranks & achievements. The full rank history renders for every claimed profile now — free
 * tier included (SESSION_0502; `user.ranks` is the full history, no longer a 1-rank summary) —
 * so the heading is unconditional (the old "Rank Summary" free-tier label was a truncation
 * artifact that no longer applies).
 *
 * FI-024 H4: each rank reads as a data-driven belt (`BeltSwatch` off `Rank.colorHex`, never a
 * hardcoded map) with its discipline + promoted-on date, ordered highest belt first (the payload's
 * `Rank.sortOrder desc`) — the colorless outline badges were unreadable.
 *
 * WL-P2-45 rider d: the promoted-on date shares the lineage timeline's
 * `formatPromotionDate` (widened to accept `Date`) — the local `formatPromotedOn`
 * duplicate is gone.
 *
 * BBL-RANK-001 / WL-P2-47: each row also renders its own `RankStatusBadge` off
 * `rankAward.status` (the raw `RankEntry.status` — a per-award axis distinct from the profile's
 * aggregate `trustStatus` shown in `HeroBadges`). The badge is a no-op render when the award has
 * no linked `RankEntry` (no orphan).
 */

export function RanksSection({ profile }: { profile: DirectoryProfile }) {
  const { user } = profile

  if (user.ranks.length === 0) {
    return null
  }

  return (
    <Section>
      <H4>Ranks &amp; Achievements</H4>
      <Stack direction="column" size="sm" className="w-full">
        {user.ranks.map(rankAward => {
          const promotedOn = formatPromotionDate(rankAward.awardedAt)
          const meta = [rankAward.disciplineName, promotedOn && `Promoted ${promotedOn}`]
            .filter(Boolean)
            .join(" · ")
          return (
            <div key={rankAward.awardId} className="flex items-start gap-2.5">
              <BeltSwatch
                variant="belt"
                size="sm"
                colorHex={rankAward.colorHex}
                secondaryColorHex={rankAward.secondaryColorHex}
                degree={rankAward.degree}
                beltFamily={rankAward.beltFamily}
              />
              <div className="flex min-w-0 flex-col">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium text-foreground">{rankAward.name || "Rank"}</span>
                  <RankStatusBadge status={rankAward.status} />
                </div>
                {meta && <span className="text-sm text-muted-foreground">{meta}</span>}
              </div>
            </div>
          )
        })}
      </Stack>
    </Section>
  )
}
