import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { CourseCard } from "~/components/web/courses/course-card"
import { Section } from "~/components/web/ui/section"
import type { CourseDetailView } from "./course-detail-data"

type CourseProgramSiblingsProps = Pick<CourseDetailView, "programData">

/**
 * Below-the-fold "Courses in this program" grid. Lazy-loaded by the orchestrator via
 * `next/dynamic` (SSR kept). The orchestrator guards on a non-empty sibling list, so
 * this always has cards to render. Reuses the shared `CourseCard` — not re-implemented.
 */
export function CourseProgramSiblings({ programData }: CourseProgramSiblingsProps) {
  const singleProgram = programData.programs.length === 1 ? programData.programs[0] : null

  return (
    <Section>
      <Section.Content>
        <Stack direction="column" size="md">
          <H4>Courses in {singleProgram ? singleProgram.name : "this program"}</H4>
          <Note>
            Other courses in the same program
            {singleProgram ? ` — ${singleProgram.name}` : ""}.
          </Note>
          <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
            {programData.courses.map(c => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </Stack>
      </Section.Content>
    </Section>
  )
}
