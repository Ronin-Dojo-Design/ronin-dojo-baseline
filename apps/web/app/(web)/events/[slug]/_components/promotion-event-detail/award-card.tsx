import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Card } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { projectPublicPassport } from "~/server/web/passport/public-projection"
import type { PromotionEventDetail } from "~/server/web/promotion-events/payloads"
import { formatDate, initials } from "./event-detail-format"

type AwardRow = PromotionEventDetail["rankAwards"][number]

/**
 * One linked rank award on the ceremony page: the promotee (Passport-rooted — name
 * + avatar), the discipline, the rank with its belt color, and the
 * "{date} · Promoted by {X} · {org}" provenance line that the lineage timeline and
 * promotion marquee drill down to. The belt color stays data-driven via
 * `Rank.colorHex` through `<BeltSwatch>` — never a hardcoded belt-color map (ADR 0026).
 */
export function AwardCard({ award }: { award: AwardRow }) {
  // Phase 3c / issue #134 surface-D: use the canonical projector for promotee identity.
  const passportDto = projectPublicPassport(award.passport, { showRanks: true })
  const promoteeName = passportDto.displayName
  const promoteeAvatar = passportDto.avatarUrl ?? undefined

  return (
    <Card hover={false} className="p-4">
      <Stack size="md" className="w-full items-start">
        <Avatar className="size-11">
          {promoteeAvatar && <AvatarImage src={promoteeAvatar} alt={promoteeName} />}
          <AvatarFallback>{initials(promoteeName)}</AvatarFallback>
        </Avatar>

        <Stack direction="column" size="xs" className="min-w-0 flex-1">
          <Stack size="sm" wrap>
            <H5>
              {award.passport.lineageNode?.slug ? (
                <Link href={`/lineage?q=${encodeURIComponent(promoteeName)}`}>{promoteeName}</Link>
              ) : (
                promoteeName
              )}
            </H5>
            {award.rank.rankSystem.discipline?.name && (
              <Badge variant="outline" size="sm">
                {award.rank.rankSystem.discipline.name}
              </Badge>
            )}
          </Stack>

          <Stack size="sm" wrap>
            {award.rank.colorHex && (
              <BeltSwatch
                variant="belt"
                colorHex={award.rank.colorHex}
                secondaryColorHex={award.rank.secondaryColorHex}
                degree={award.rank.degree}
                beltFamily={award.rank.beltFamily}
              />
            )}
            <span className="font-medium text-sm">{award.rank.name}</span>
            {award.rank.shortName && (
              <Badge variant="soft" size="sm">
                {award.rank.shortName}
              </Badge>
            )}
          </Stack>

          <Stack size="xs" wrap className="text-sm text-muted-foreground">
            <span>{formatDate(award.awardedAt)}</span>
            {award.awardedBy && (
              <>
                <span aria-hidden>&middot;</span>
                <span>Promoted by {award.awardedBy.name ?? "unknown"}</span>
              </>
            )}
            {award.organization && (
              <>
                <span aria-hidden>&middot;</span>
                <Link href={`/organizations/${award.organization.slug}`}>
                  {award.organization.name}
                </Link>
              </>
            )}
            {!award.organization && award.location && (
              <>
                <span aria-hidden>&middot;</span>
                <span>{award.location}</span>
              </>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  )
}
