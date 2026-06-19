import type { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getCurrentCourseEnrollmentState } from "~/server/web/course-enrollment/queries"
import type { CourseMany, CourseOne } from "~/server/web/courses/payloads"
import {
  findCourseBySlug,
  type CourseInstructor,
  findCourseInstructors,
  findProgramSiblingCourses,
  findRelatedCourses,
} from "~/server/web/courses/queries"

export type BreadcrumbItem = { url: string; title: string }

/** Serialized enrollment for the client island (Dates → ISO strings). */
type EnrollmentForClient = {
  id: string
  enrolledAt: string
  completedAt: string | null
} | null

/** Serialized item completions for the client curriculum list. */
type CompletionForClient = {
  id: string
  curriculumItemId: string
  completedAt: string
}

type ProgramData = Awaited<ReturnType<typeof findProgramSiblingCourses>>

/**
 * The resolved view model the detail orchestrator renders. The route loads it once
 * (`loadCourseDetail`) and threads it down; the orchestrator owns no fetching or
 * derivation, only composition + lazy boundaries (component-launch-sweep step 1).
 */
export type CourseDetailView = {
  course: CourseOne
  brand: Brand
  isAuthenticated: boolean
  hasActiveMembership: boolean
  hasCourseAccessEntitlement: boolean
  enrollment: EnrollmentForClient
  completions: CompletionForClient[]
  completedItems: number
  totalItems: number
  instructors: CourseInstructor[]
  programData: ProgramData
  relatedCourses: CourseMany[]
  courseUrl: string
  breadcrumbItems: BreadcrumbItem[]
}

/** Replace underscores so an enum-cased certification type reads as prose. */
export const formatCertificationType = (value: string) => value.replace(/_/g, " ")

/**
 * Load + derive everything the public course detail surface needs. Mirrors the prior
 * inline route body verbatim (same queries, same `Promise.all` batching, same
 * enrollment/completion serialization) — relocated into the module so `page.tsx`
 * stays a thin route shell. Returns `null` when the course is missing so the route
 * can `notFound()`.
 */
export async function loadCourseDetail(slug: string): Promise<CourseDetailView | null> {
  const brand = await getRequestBrand()
  const course = await findCourseBySlug(slug, brand)

  if (!course) return null

  const session = await getServerSession()
  const enrollmentState = session?.user
    ? await getCurrentCourseEnrollmentState({
        brand,
        courseId: course.id,
        organizationId: course.organization.id,
        userId: session.user.id,
      })
    : { enrollment: null, hasActiveMembership: false, hasCourseAccessEntitlement: false }

  const [instructors, programData] = await Promise.all([
    findCourseInstructors(course.organization.id, brand),
    findProgramSiblingCourses(course.id, brand),
  ])

  const programSiblingIds = programData.courses.map(c => c.id)
  const relatedCourses = await findRelatedCourses({
    courseId: course.id,
    brand,
    disciplineId: course.discipline?.id ?? null,
    organizationId: course.organization.id,
    excludeIds: programSiblingIds,
  })

  const enrollment: EnrollmentForClient = enrollmentState.enrollment
    ? {
        id: enrollmentState.enrollment.id,
        enrolledAt: enrollmentState.enrollment.enrolledAt.toISOString(),
        completedAt: enrollmentState.enrollment.completedAt?.toISOString() ?? null,
      }
    : null
  const completions: CompletionForClient[] =
    enrollmentState.enrollment?.itemCompletions.map(completion => ({
      id: completion.id,
      curriculumItemId: completion.curriculumItemId,
      completedAt: completion.completedAt.toISOString(),
    })) ?? []

  const courseUrl = `/courses/${course.slug}`

  return {
    course,
    brand,
    isAuthenticated: Boolean(session?.user),
    hasActiveMembership: enrollmentState.hasActiveMembership,
    hasCourseAccessEntitlement: enrollmentState.hasCourseAccessEntitlement,
    enrollment,
    completions,
    completedItems: enrollmentState.enrollment?.itemCompletions.length ?? 0,
    totalItems: course.curriculumItems.length,
    instructors,
    programData,
    relatedCourses,
    courseUrl,
    breadcrumbItems: [
      { url: "/courses", title: "Courses" },
      { url: courseUrl, title: course.title },
    ],
  }
}
