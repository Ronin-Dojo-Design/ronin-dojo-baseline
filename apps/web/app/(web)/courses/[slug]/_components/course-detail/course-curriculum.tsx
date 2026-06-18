import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { CurriculumCompletionList } from "~/components/web/courses/curriculum-completion-list"
import { Section } from "~/components/web/ui/section"
import type { CourseDetailView } from "./course-detail-data"

type CourseCurriculumProps = Pick<CourseDetailView, "course" | "enrollment" | "completions">

/**
 * The curriculum section: the reused `CurriculumCompletionList` client island
 * (per-item completion toggles) under its own `Section`. The orchestrator only
 * renders this when the course has curriculum items, so the list is always non-empty.
 */
export function CourseCurriculum({ course, enrollment, completions }: CourseCurriculumProps) {
  return (
    <Section>
      <Section.Content>
        <Stack direction="column" size="md">
          <H4>Curriculum</H4>
          <CurriculumCompletionList
            enrollmentId={enrollment?.id}
            items={course.curriculumItems}
            completions={completions}
          />
        </Stack>
      </Section.Content>
    </Section>
  )
}
