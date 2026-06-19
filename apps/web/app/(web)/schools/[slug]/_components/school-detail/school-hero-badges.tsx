import { Badge } from "~/components/common/badge"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import type { SchoolDetailView } from "./school-detail-data"

type SchoolHeroBadgesProps = Pick<SchoolDetailView, "school">

/**
 * Hero badge cluster shown inline after the school title in the `ListingDetail` hero:
 * the org type plus a linked badge per discipline. Presentational — every value comes
 * from the already-fetched payload (on-the-wire data only).
 */
export function SchoolHeroBadges({ school }: SchoolHeroBadgesProps) {
  return (
    <Stack size="sm" className="flex-wrap">
      <Badge variant="outline">{school.type.replace(/_/g, " ")}</Badge>
      {school.disciplines.map(od => (
        <Badge key={od.discipline.id}>
          <Link href={`/disciplines/${od.discipline.slug}`}>{od.discipline.name}</Link>
        </Badge>
      ))}
    </Stack>
  )
}
