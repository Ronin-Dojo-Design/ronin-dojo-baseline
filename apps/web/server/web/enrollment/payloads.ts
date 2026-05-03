import type { Prisma } from "~/.generated/prisma/client"

export const enrollmentProgramPayload = {
  id: true,
  brand: true,
  organizationId: true,
  disciplineId: true,
  maxEnrollment: true,
  name: true,
  slug: true,
} satisfies Prisma.ProgramSelect

export const programEnrollmentPayload = {
  id: true,
  status: true,
  waitlistPosition: true,
  enrolledAt: true,
  withdrawnAt: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  programId: true,
  program: { select: enrollmentProgramPayload },
} satisfies Prisma.ProgramEnrollmentSelect

export type ProgramEnrollmentRecord = Prisma.ProgramEnrollmentGetPayload<{
  select: typeof programEnrollmentPayload
}>

export type EnrollmentProgram = Prisma.ProgramGetPayload<{
  select: typeof enrollmentProgramPayload
}>
