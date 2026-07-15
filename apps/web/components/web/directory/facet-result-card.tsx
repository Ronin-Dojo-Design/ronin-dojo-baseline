import type { CSSProperties } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import { ListingCard } from "~/components/web/listing/listing-card"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import type { DirectoryFacetResult } from "~/lib/directory/facet-result"

/** BBL faceless gi default — shown when a person has no usable photo (null or broken URL). */
const PERSON_FALLBACK_AVATAR = "/brand/bbl/default-black-belt.png"

/** Validate a `Rank.colorHex` for inline styling; null when missing/malformed. */
function beltTint(hex: string | null) {
  return hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : null
}

/**
 * FacetResultCard — a thin adapter over the ONE catalog card `ListingCard` (doctrine §5, person-tuned
 * per the operator's §5-table ruling; SESSION_0470). Renders the normalized `DirectoryFacetResult`
 * (people / organizations / lineage trees) with a large leading avatar (gi-default fallback for
 * people, no bare initials), a belt-tinted rank chip (`Rank.colorHex`, ADR 0026) + trust/claim badges
 * in the status slot, a location tagline, and the standard View + Save footer (`ListingSaveButton`).
 */
export function FacetResultCard({
  result,
  style,
}: {
  result: DirectoryFacetResult
  /** Optional inline style (e.g. CSS `order`) forwarded by grid consumers like `SchoolList`. */
  style?: CSSProperties
}) {
  const rank = result.tags[0]
  const isPerson = result.type === "person"
  const tint = beltTint(result.rankColorHex)
  const hasStatus = Boolean(
    rank || result.badges.length > 0 || result.trustStatus || result.claimStatus,
  )

  return (
    <ListingCard
      style={style}
      href={result.href}
      name={result.title}
      viewLabel={isPerson ? "View profile" : "View"}
      media={
        <Avatar className="size-14 shrink-0 rounded-2xl shadow-sm ring-2 ring-border transition group-hover:ring-primary/50">
          {result.imageUrl && <AvatarImage src={result.imageUrl} alt={result.title} />}
          {isPerson ? (
            <AvatarFallback className="p-0">
              <img
                src={PERSON_FALLBACK_AVATAR}
                alt=""
                className="size-full object-cover"
                aria-hidden
              />
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-accent to-muted text-lg font-bold text-foreground">
              {result.initials}
            </AvatarFallback>
          )}
        </Avatar>
      }
      tagline={result.subtitle}
      statusBadges={
        hasStatus ? (
          <Stack direction="column" size="sm" className="w-full">
            {(result.trustStatus || result.claimStatus) && (
              <Stack size="xs" className="flex-wrap items-center">
                {result.trustStatus && <LineageTrustBadge status={result.trustStatus} />}
                {result.claimStatus && <LineageClaimBadge status={result.claimStatus} />}
              </Stack>
            )}

            {(rank || result.badges.length > 0) && (
              <Stack size="xs" className="flex-wrap items-center">
                {rank &&
                  (tint ? (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-inset"
                      style={{ backgroundColor: `${tint}24`, borderColor: `${tint}59` }}
                    >
                      <span
                        className="size-2.5 rounded-full ring-1 ring-white/25"
                        style={{ backgroundColor: tint }}
                      />
                      {rank}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                      <span className="size-1.5 rounded-full bg-primary" />
                      {rank}
                    </span>
                  ))}
                {result.badges.map(badge => (
                  <Badge key={badge.label} variant={badge.variant}>
                    {badge.label}
                  </Badge>
                ))}
              </Stack>
            )}
          </Stack>
        ) : undefined
      }
      save={
        <ListingSaveButton
          subjectType={result.save.subjectType}
          subjectId={result.save.subjectId}
        />
      }
    />
  )
}
