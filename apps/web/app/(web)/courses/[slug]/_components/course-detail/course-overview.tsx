import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Card } from "~/components/common/card"
import { H4, H5 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import type { CourseDetailView } from "./course-detail-data"
import { formatCertificationType } from "./course-detail-data"

type CourseOverviewProps = {
  course: CourseDetailView["course"]
}

/**
 * Above-the-fold overview: the discipline / rank / certification / enrollment-count
 * chips plus the "Offered by" org card. The rank chip now renders the data-driven
 * `<BeltSwatch>` (from `Rank.colorHex`, on-the-wire) next to the rank name instead of
 * a plain text badge — never a hardcoded belt-color map (ADR 0022). Heading-into-`h2`
 * render override preserved verbatim so the document outline is unchanged.
 */
export function CourseOverview({ course }: CourseOverviewProps) {
  return (
    <>
      <Stack size="sm" className="flex-wrap">
        {course.discipline && <Badge variant="soft">{course.discipline.name}</Badge>}
        {course.rank && (
          <Badge variant="outline" prefix={<BeltSwatch colorHex={course.rank.colorHex} />}>
            {course.rank.name}
          </Badge>
        )}
        <Badge variant="outline">{formatCertificationType(course.certificationType)}</Badge>
        <Badge variant="soft">{course._count.enrollments} enrolled</Badge>
      </Stack>

      <Card hover={false}>
        <Stack direction="column" size="sm">
          <H5 render={props => <h2 {...props}>{props.children}</h2>}>Offered by</H5>
          <H4>{course.organization.name}</H4>
        </Stack>
      </Card>
    </>
  )
}
