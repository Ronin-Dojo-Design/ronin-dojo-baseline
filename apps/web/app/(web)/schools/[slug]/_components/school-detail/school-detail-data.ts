import type { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPromotionTimelineForOrganization } from "~/server/web/promotion-events/queries"
import type { SchoolDetail, SchoolMany } from "~/server/web/schools/payloads"
import { findRelatedSchools, findSchoolBySlug } from "~/server/web/schools/queries"

// Role codes that surface a membership as an "instructor" on the school page.
// Today only INSTRUCTOR is seeded; HEAD_INSTRUCTOR is forward-compatible
// (per SESSION_0238_TASK_02 spec) and simply won't match until that role
// code is introduced.
const INSTRUCTOR_ROLE_CODES = new Set(["INSTRUCTOR", "HEAD_INSTRUCTOR"])

type Membership = SchoolDetail["memberships"][number]
type PromotionTimeline = Awaited<ReturnType<typeof getPromotionTimelineForOrganization>>

export type BreadcrumbItem = { url: string; title: string }

/**
 * The resolved view model the school detail orchestrator renders. The route loads it
 * once (`loadSchoolDetail`) and threads it down; the orchestrator owns no fetching or
 * derivation, only composition + lazy boundaries (component-launch-sweep step 1).
 */
export type SchoolDetailView = {
  school: SchoolDetail
  brand: Brand
  instructors: Membership[]
  classesPerWeek: number
  schoolInitials: string
  formattedAddress: string | null
  relatedSchools: SchoolMany[]
  promotionTimeline: PromotionTimeline
  isSignedIn: boolean
  isUnclaimed: boolean
  schoolUrl: string
  breadcrumbItems: BreadcrumbItem[]
  instructorRoleCodes: Set<string>
}

/** Join the expanded address fields into a single display line (null when empty). */
function formatSchoolAddress(school: SchoolDetail): string | null {
  const parts = [
    school.addressLine1,
    school.addressLine2,
    school.city,
    school.state,
    school.zip,
    school.country,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : null
}

/** Active memberships whose role assignments include an instructor role code. */
function deriveInstructors(memberships: Membership[]): Membership[] {
  return memberships.filter(
    m =>
      m.status === "ACTIVE" &&
      m.roleAssignments.some(ra => INSTRUCTOR_ROLE_CODES.has(ra.role.code)),
  )
}

/** Total weekly class slots across all ACTIVE schedules (sum of their days). */
function deriveClassesPerWeek(school: SchoolDetail): number {
  return school.classSchedules
    .filter(cs => cs.status === "ACTIVE")
    .reduce((acc, cs) => acc + cs.daysOfWeek.length, 0)
}

/** Up-to-3-letter uppercase initials for the avatar fallback ("?" when empty). */
function deriveSchoolInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "?"
  )
}

/**
 * Load + derive everything the public school detail surface needs. Mirrors the prior
 * inline route body verbatim (same queries, same `Promise.all` batching, same
 * derivations) — relocated into the module so `page.tsx` stays a thin route shell.
 * Returns `null` when the school is missing so the route can `notFound()`.
 */
export async function loadSchoolDetail(slug: string): Promise<SchoolDetailView | null> {
  const brand = await getRequestBrand()
  const school = await findSchoolBySlug({ brand, slug })

  if (!school) return null

  const [relatedSchools, promotionTimeline, session] = await Promise.all([
    findRelatedSchools({
      schoolId: school.id,
      brand,
      city: school.city,
      state: school.state,
    }),
    getPromotionTimelineForOrganization(school.id),
    getServerSession(),
  ])

  const schoolUrl = `/schools/${school.slug}`

  return {
    school,
    brand,
    instructors: deriveInstructors(school.memberships),
    classesPerWeek: deriveClassesPerWeek(school),
    schoolInitials: deriveSchoolInitials(school.name),
    formattedAddress: formatSchoolAddress(school),
    relatedSchools,
    promotionTimeline,
    isSignedIn: Boolean(session?.user),
    isUnclaimed: !school.ownerId,
    schoolUrl,
    breadcrumbItems: [
      { url: "/schools", title: "Schools" },
      { url: schoolUrl, title: school.name },
    ],
    instructorRoleCodes: INSTRUCTOR_ROLE_CODES,
  }
}
