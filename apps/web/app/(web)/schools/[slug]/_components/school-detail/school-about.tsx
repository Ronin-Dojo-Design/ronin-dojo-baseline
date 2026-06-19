import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { PromotionTimeline } from "~/components/web/promotion-events/promotion-timeline"
import type { SchoolDetailView } from "./school-detail-data"

type SchoolAboutProps = Pick<SchoolDetailView, "school" | "formattedAddress" | "promotionTimeline">

/**
 * Primary body block: optional About prose, an optional Address card, the discipline
 * badge row, and the (always-rendered) promotion timeline. Presentational — every
 * field is null-safe from the already-fetched payload (on-the-wire data only).
 */
export function SchoolAbout({ school, formattedAddress, promotionTimeline }: SchoolAboutProps) {
  return (
    <div className="flex flex-col gap-8">
      {school.description && (
        <div className="space-y-2">
          <H4>About</H4>
          <p className="text-sm text-secondary-foreground text-pretty">{school.description}</p>
        </div>
      )}

      {formattedAddress && (
        <Card hover={false}>
          <CardHeader>
            <H4>Address</H4>
          </CardHeader>
          <CardDescription>
            <p className="text-sm">{formattedAddress}</p>
          </CardDescription>
        </Card>
      )}

      {school.disciplines.length > 0 && (
        <div className="space-y-3">
          <H4>Disciplines</H4>
          <Stack size="sm" className="flex-wrap">
            {school.disciplines.map(od => (
              <Link
                key={od.discipline.id}
                href={`/disciplines/${od.discipline.slug}`}
                className="no-underline"
              >
                <Badge variant="soft" size="lg">
                  {od.discipline.name}
                </Badge>
              </Link>
            ))}
          </Stack>
        </div>
      )}

      <PromotionTimeline
        entries={promotionTimeline}
        emptyMessage="No hosted promotion events or awarded ranks are linked to this school yet."
      />
    </div>
  )
}
