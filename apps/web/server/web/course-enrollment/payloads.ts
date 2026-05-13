import type { Prisma } from "~/.generated/prisma/client"

export const courseEnrollmentPayload = {
  id: true,
  enrolledAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  courseId: true,
  course: {
    select: {
      id: true,
      brand: true,
      title: true,
      slug: true,
      certificationType: true,
      organizationId: true,
      discipline: { select: { id: true, name: true, slug: true } },
      rank: { select: { id: true, name: true } },
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  _count: { select: { itemCompletions: true } },
} satisfies Prisma.CourseEnrollmentSelect

export type CourseEnrollmentRecord = Prisma.CourseEnrollmentGetPayload<{
  select: typeof courseEnrollmentPayload
}>

export const curriculumItemCompletionPayload = {
  id: true,
  completedAt: true,
  notes: true,
  createdAt: true,
  enrollmentId: true,
  curriculumItemId: true,
  curriculumItem: {
    select: {
      id: true,
      title: true,
      order: true,
    },
  },
  verifiedBy: {
    select: { id: true, name: true },
  },
} satisfies Prisma.CurriculumItemCompletionSelect

export type CurriculumItemCompletionRecord = Prisma.CurriculumItemCompletionGetPayload<{
  select: typeof curriculumItemCompletionPayload
}>
