import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export const getCurrentCourseEnrollmentState = async ({
  brand,
  courseId,
  organizationId,
  userId,
}: {
  brand: Brand
  courseId: string
  organizationId: string
  userId: string
}) => {
  const [enrollment, membership, entitlement] = await db.$transaction([
    db.courseEnrollment.findFirst({
      where: {
        userId,
        courseId,
        course: {
          brand,
          organizationId,
        },
      },
      select: {
        id: true,
        enrolledAt: true,
        completedAt: true,
        itemCompletions: {
          select: {
            id: true,
            curriculumItemId: true,
            completedAt: true,
          },
          orderBy: { completedAt: "asc" },
        },
      },
    }),
    db.membership.findFirst({
      where: {
        brand,
        organizationId,
        userId,
        status: "ACTIVE",
      },
      select: { id: true },
    }),
    db.userEntitlement.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        entitlement: { key: "COURSE_ACCESS", brand },
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      select: { id: true },
    }),
  ])

  return {
    enrollment,
    hasActiveMembership: Boolean(membership),
    hasCourseAccessEntitlement: Boolean(entitlement),
  }
}

