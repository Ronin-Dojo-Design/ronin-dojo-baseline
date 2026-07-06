import { Badge } from "~/components/common/badge"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import type { DirectoryProfile } from "./directory-profile-data"

/**
 * Ranks & achievements. The full rank history renders for every claimed profile now — free
 * tier included (SESSION_0502; `user.ranks` is the full history, no longer a 1-rank summary) —
 * so the heading is unconditional (the old "Rank Summary" free-tier label was a truncation
 * artifact that no longer applies).
 */
export function RanksSection({ profile }: { profile: DirectoryProfile }) {
  const { user } = profile

  if (user.ranks.length === 0) {
    return null
  }

  return (
    <Section>
      <H4>Ranks &amp; Achievements</H4>
      <Stack size="sm">
        {user.ranks.map(rankAward => (
          <div key={rankAward.awardId} className="flex items-center gap-2">
            <Badge variant="outline">{rankAward.name || "Rank"}</Badge>
            {rankAward.disciplineName && (
              <span className="text-sm text-muted-foreground">{rankAward.disciplineName}</span>
            )}
          </div>
        ))}
      </Stack>
    </Section>
  )
}
