import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { CourseCard } from "~/components/web/courses/course-card"
import { Section } from "~/components/web/ui/section"
import type { CourseDetailView } from "./course-detail-data"

type CourseRelatedProps = Pick<CourseDetailView, "relatedCourses">

/**
 * Below-the-fold "Related courses" grid (same discipline or org, excluding program
 * siblings). Lazy-loaded by the orchestrator via `next/dynamic` (SSR kept). The
 * orchestrator guards on a non-empty list. Reuses the shared `CourseCard`.
 */
export function CourseRelated({ relatedCourses }: CourseRelatedProps) {
  return (
    <Section>
      <Section.Content>
        <Stack direction="column" size="md">
          <H4>Related Courses</H4>
          <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
            {relatedCourses.map(c => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </Stack>
      </Section.Content>
    </Section>
  )
}
