import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { ListingCard } from "~/components/web/listing/listing-card"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import type { DirectoryFacetResult } from "~/lib/directory/facet-result"

/**
 * Shared faceted-directory card. SESSION_0396: renders the normalized
 * `DirectoryFacetResult` (people / organizations / lineage trees) through the shared
 * `ListingCard` (Tool→Listing parity) so directory cards match the Tool card — avatar,
 * trust/claim badges, tag badges, and a View + Save footer. Used by `/directory`,
 * `/directory/profiles`, and `/directory/schools`.
 */
export function FacetResultCard({ result }: { result: DirectoryFacetResult }) {
  return (
    <ListingCard
      href={result.href}
      name={result.title}
      media={
        <Avatar className="size-9 shrink-0">
          {result.imageUrl && <AvatarImage src={result.imageUrl} alt={result.title} />}
          <AvatarFallback>{result.initials}</AvatarFallback>
        </Avatar>
      }
      tagline={result.subtitle}
      categories={result.tags.map(tag => ({ name: tag }))}
      headerBadges={
        (result.trustStatus || result.claimStatus) && (
          <Stack direction="row" className="ml-auto flex-wrap gap-1">
            {result.trustStatus && <LineageTrustBadge status={result.trustStatus} />}
            {result.claimStatus && <LineageClaimBadge status={result.claimStatus} />}
          </Stack>
        )
      }
      statusBadges={
        result.badges.length > 0 && (
          <Stack direction="row" className="flex-wrap gap-1">
            {result.badges.map(badge => (
              <Badge key={badge.label} variant={badge.variant}>
                {badge.label}
              </Badge>
            ))}
          </Stack>
        )
      }
      save={<ListingSaveButton />}
    />
  )
}
