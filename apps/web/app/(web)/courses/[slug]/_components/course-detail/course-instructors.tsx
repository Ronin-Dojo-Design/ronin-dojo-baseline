import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Card, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import type { CourseDetailView } from "./course-detail-data"

type CourseInstructorsProps = Pick<CourseDetailView, "instructors">

/**
 * Below-the-fold "Instructors" grid. Lazy-loaded by the orchestrator via
 * `next/dynamic` (SSR kept) so its chunk only loads once reached. The orchestrator
 * guards on a non-empty list, so this always has instructors to render. The rank chip
 * carries the data-driven `<BeltSwatch>` (`Rank.colorHex`) — same belt-color seam as
 * the overview, never a hardcoded palette (ADR 0022).
 */
export function CourseInstructors({ instructors }: CourseInstructorsProps) {
  return (
    <Section>
      <Section.Content>
        <H4>Instructors</H4>
        <div className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3 mt-4">
          {instructors.map(instructor => (
            <Card key={instructor.id} hover={false}>
              <CardHeader>
                <Stack size="sm" wrap={false}>
                  <Avatar>
                    {instructor.user.image && (
                      <AvatarImage src={instructor.user.image} alt={instructor.user.name ?? ""} />
                    )}
                    <AvatarFallback>
                      {(instructor.user.name ?? "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Stack direction="column" size="xs">
                    <span className="font-medium">{instructor.user.name ?? "Instructor"}</span>
                    <Stack size="xs" className="flex-wrap">
                      {instructor.roleAssignments.map(ra => (
                        <Badge key={ra.role.code} variant="soft" size="sm">
                          {ra.role.displayTitle ?? ra.role.code}
                        </Badge>
                      ))}
                      {instructor.rank && (
                        <Badge
                          variant="outline"
                          size="sm"
                          prefix={<BeltSwatch colorHex={instructor.rank.colorHex} />}
                        >
                          {instructor.rank.name}
                        </Badge>
                      )}
                      {instructor.discipline && (
                        <Badge variant="outline" size="sm">
                          {instructor.discipline.name}
                        </Badge>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section.Content>
    </Section>
  )
}
