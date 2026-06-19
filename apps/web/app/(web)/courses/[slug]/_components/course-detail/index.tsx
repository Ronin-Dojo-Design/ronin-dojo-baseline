import dynamic from "next/dynamic"
import { CourseEnrollmentPanel } from "~/components/web/courses/course-enrollment-panel"
import { BrandTypography, bblHeadingScopeClass } from "~/components/web/ui/brand-typography"
import { Section } from "~/components/web/ui/section"
import type { CourseDetailView } from "./course-detail-data"
import { CourseCurriculum } from "./course-curriculum"
import { CourseDetailHeader } from "./course-detail-header"
import { CourseOverview } from "./course-overview"
import { CourseStructuredData } from "./course-structured-data"

// Lazy boundaries: instructors, program siblings, and related courses all sit below
// the overview/curriculum fold, so their chunks only load once reached. SSR is kept
// (no `ssr: false` — illegal in a Server Component anyway) so the content still
// server-renders for SEO — same pattern as the org-detail / BBL-landing orchestrators.
const CourseInstructors = dynamic(() =>
  import("./course-instructors").then(m => m.CourseInstructors),
)
const CourseProgramSiblings = dynamic(() =>
  import("./course-program-siblings").then(m => m.CourseProgramSiblings),
)
const CourseRelated = dynamic(() => import("./course-related").then(m => m.CourseRelated))

/**
 * Public course detail orchestrator — the colocated folder module's barrel and only
 * export (component-launch-sweep recipe). Thin: it wires the extracted sections and
 * lazy-loads the below-fold ones; it owns no section presentation and no data fetching
 * (the route loads the view model via `loadCourseDetail`).
 *
 * Brand seam: the whole visible body renders inside `BrandTypography` with the
 * `bblHeadingScopeClass` container rule, so the title + every `Section`/`Card` heading
 * inherit the BBL type tokens under BBL and degrade to the app fonts off-BBL (the
 * consumer authorizes the tokens; the sections stay brand-agnostic). Colors were
 * already token-correct (semantic tokens, no hex literals); the rank belt color is the
 * data-driven `<BeltSwatch>` (`Rank.colorHex`). The JSON-LD stays a sibling after the
 * scope.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export function CourseDetail({
  course,
  brand,
  isAuthenticated,
  hasActiveMembership,
  hasCourseAccessEntitlement,
  enrollment,
  completions,
  completedItems,
  totalItems,
  instructors,
  programData,
  relatedCourses,
  courseUrl,
  breadcrumbItems,
}: CourseDetailView) {
  return (
    <>
      <BrandTypography brand={brand} className={bblHeadingScopeClass}>
        <CourseDetailHeader course={course} breadcrumbItems={breadcrumbItems} />

        <Section>
          <Section.Content>
            <CourseOverview course={course} />
          </Section.Content>

          <Section.Sidebar>
            <CourseEnrollmentPanel
              courseId={course.id}
              courseSlug={course.slug}
              organizationName={course.organization.name}
              isAuthenticated={isAuthenticated}
              hasActiveMembership={hasActiveMembership}
              hasCourseAccessEntitlement={hasCourseAccessEntitlement}
              enrollment={enrollment}
              completedItems={completedItems}
              totalItems={totalItems}
            />
          </Section.Sidebar>
        </Section>

        {course.curriculumItems.length > 0 && (
          <CourseCurriculum course={course} enrollment={enrollment} completions={completions} />
        )}

        {instructors.length > 0 && <CourseInstructors instructors={instructors} />}

        {programData.courses.length > 0 && <CourseProgramSiblings programData={programData} />}

        {relatedCourses.length > 0 && <CourseRelated relatedCourses={relatedCourses} />}
      </BrandTypography>

      <CourseStructuredData
        course={course}
        breadcrumbItems={breadcrumbItems}
        courseUrl={courseUrl}
      />
    </>
  )
}
