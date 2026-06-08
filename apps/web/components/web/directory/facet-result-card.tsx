import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import type { DirectoryFacetResult } from "~/lib/directory/facet-result"

/**
 * Shared faceted-directory card (SESSION_0350). Renders a normalized
 * `DirectoryFacetResult` for any facet (people / organizations / lineage trees)
 * by composing the existing common primitives + the SESSION_0349 trust badges.
 * Used only inside `/directory`; `/schools` and `/lineage` keep their own cards.
 */
export function FacetResultCard({ result }: { result: DirectoryFacetResult }) {
  const hasMeta =
    result.trustStatus !== null ||
    result.claimStatus !== null ||
    result.tags.length > 0 ||
    result.badges.length > 0

  return (
    <Card>
      <CardHeader>
        <Stack direction="row" className="items-center gap-3">
          <Avatar>
            {result.imageUrl && <AvatarImage src={result.imageUrl} alt={result.title} />}
            <AvatarFallback>{result.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <H4 className="truncate">
              <Link href={result.href}>{result.title}</Link>
            </H4>
            {result.subtitle && (
              <CardDescription className="truncate">{result.subtitle}</CardDescription>
            )}
          </div>
        </Stack>

        {hasMeta && (
          <Stack direction="row" className="mt-2 flex-wrap gap-1">
            {result.trustStatus && <LineageTrustBadge status={result.trustStatus} />}
            {result.claimStatus && <LineageClaimBadge status={result.claimStatus} />}
            {result.tags.map(tag => (
              <Badge key={tag} variant="soft">
                {tag}
              </Badge>
            ))}
            {result.badges.map(badge => (
              <Badge key={badge.label} variant={badge.variant}>
                {badge.label}
              </Badge>
            ))}
          </Stack>
        )}
      </CardHeader>
    </Card>
  )
}
