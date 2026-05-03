import type { Prisma } from "~/.generated/prisma/client"

export const scheduleProgramPayload = {
  id: true,
  brand: true,
  name: true,
  slug: true,
  organizationId: true,
  organization: {
    select: {
      id: true,
      name: true,
      slug: true,
      ownerId: true,
    },
  },
} satisfies Prisma.ProgramSelect

export const scheduleInstructorPayload = {
  id: true,
  isPrimary: true,
  displayTitle: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  },
} satisfies Prisma.ClassInstructorAssignmentSelect

export const scheduleSessionPayload = {
  id: true,
  date: true,
  startTime: true,
  endTime: true,
  status: true,
  notes: true,
  substituteInstructorId: true,
} satisfies Prisma.ClassSessionSelect

export const scheduleManyPayload = {
  id: true,
  brand: true,
  name: true,
  description: true,
  status: true,
  daysOfWeek: true,
  startTime: true,
  endTime: true,
  timezone: true,
  effectiveFrom: true,
  effectiveTo: true,
  capacity: true,
  locationName: true,
  organizationId: true,
  programId: true,
  disciplineId: true,
  createdAt: true,
  updatedAt: true,
  program: { select: scheduleProgramPayload },
  discipline: { select: { id: true, name: true, slug: true } },
  _count: { select: { sessions: true, instructorAssignments: true } },
} satisfies Prisma.ClassScheduleSelect

export const scheduleDetailPayload = {
  ...scheduleManyPayload,
  instructorAssignments: {
    select: scheduleInstructorPayload,
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
  },
  sessions: {
    select: scheduleSessionPayload,
    orderBy: { date: "asc" as const },
  },
} satisfies Prisma.ClassScheduleSelect

export type ScheduleMany = Prisma.ClassScheduleGetPayload<{
  select: typeof scheduleManyPayload
}>

export type ScheduleDetail = Prisma.ClassScheduleGetPayload<{
  select: typeof scheduleDetailPayload
}>
