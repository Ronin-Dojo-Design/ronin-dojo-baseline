import { Badge } from "~/components/common/badge"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import type { DirectoryProfile } from "./directory-profile-data"

/** Ranks & achievements (full profile) or rank summary (listing preview). */
export function RanksSection({ profile }: { profile: DirectoryProfile }) {
  const { user } = profile

  if (user.ranks.length === 0) {
    return null
  }

  return (
    <Section>
      <H4>{profile.canRenderFullProfile ? "Ranks & Achievements" : "Rank Summary"}</H4>
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
