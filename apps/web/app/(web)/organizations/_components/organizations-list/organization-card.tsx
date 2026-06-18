import Link from "next/link"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import type { OrganizationMany } from "~/server/web/organization/payloads"

/**
 * One organization card in the listing grid: name (overlay link), type + member
 * count, and discipline badges. Presentational — every field comes from the
 * already-fetched `organizationManyPayload` (on-the-wire data only).
 */
export function OrganizationCard({ org }: { org: OrganizationMany }) {
  return (
    <Card isRevealed>
      <CardHeader>
        <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
          <Link href={`/organizations/${org.slug}`}>
            <span className="absolute inset-0 z-10" />
            {org.name}
          </Link>
        </H4>
      </CardHeader>

      <CardDescription>
        <Stack size="sm" className="flex-wrap">
          <Badge variant="outline">{org.type}</Badge>
          <span className="text-xs text-muted-foreground">
            {org._count.memberships} member{org._count.memberships !== 1 ? "s" : ""}
          </span>
        </Stack>
      </CardDescription>

      {org.disciplines.length > 0 && (
        <Stack size="sm" className="flex-wrap">
          {org.disciplines.map(od => (
            <Badge key={od.discipline.id} size="sm">
              {od.discipline.name}
            </Badge>
          ))}
        </Stack>
      )}
    </Card>
  )
}
