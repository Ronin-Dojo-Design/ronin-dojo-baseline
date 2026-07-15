import { BeltSwatch } from "~/components/common/belt-swatch"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import type { DirectoryProfile } from "./directory-profile-data"

/**
 * Ranks & achievements. The full rank history renders for every claimed profile now — free
 * tier included (SESSION_0502; `user.ranks` is the full history, no longer a 1-rank summary) —
 * so the heading is unconditional (the old "Rank Summary" free-tier label was a truncation
 * artifact that no longer applies).
 *
 * FI-024 H4: each rank reads as a data-driven belt (`BeltSwatch` off `Rank.colorHex`, never a
 * hardcoded map) with its discipline + promoted-on date, ordered highest belt first (the payload's
 * `Rank.sortOrder desc`) — the colorless outline badges were unreadable.
 */
function formatPromotedOn(date: Date | string | null): string | null {
  if (!date) return null
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" })
}

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
          const promotedOn = formatPromotedOn(rankAward.awardedAt)
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
                <span className="font-medium text-foreground">{rankAward.name || "Rank"}</span>
                {meta && <span className="text-sm text-muted-foreground">{meta}</span>}
              </div>
            </div>
          )
        })}
      </Stack>
    </Section>
  )
}
