import { Brand, type Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { ProgramsTableSchema } from "~/server/admin/programs/schema"
import { db } from "~/services/db"

export const findPrograms = async (
  search: ProgramsTableSchema,
  where?: Prisma.ProgramWhereInput,
) => {
  const { name, status, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.ProgramOrderByWithRelationInput>(search)

  const expressions: (Prisma.ProgramWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    status ? { status: status as any } : undefined,
    createdAtRangeExpression<Prisma.ProgramWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.ProgramWhereInput>({
    baseWhere: { brand: Brand.BBL },
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: programs,
    total,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.program.findMany({
        where: whereQuery,
        include: {
          organization: { select: { id: true, name: true } },
          discipline: { select: { id: true, name: true } },
          _count: { select: { programEnrollments: true, courses: true, classSchedules: true } },
        },
        orderBy: [...orderBy, { createdAt: "asc" }],
        take: perPage,
        skip: offset,
      }),
    count: () => db.program.count({ where: whereQuery }),
  })

  return { programs, total, pageCount }
}

export const findProgramById = async (id: string) => {
  return db.program.findUnique({
    where: { id, brand: Brand.BBL },
    include: {
      organization: { select: { id: true, name: true } },
      discipline: { select: { id: true, name: true } },
      ageGroups: {
        include: { ageGroup: { select: { id: true, name: true } } },
      },
      skillLevels: {
        include: { skillLevel: { select: { id: true, name: true } } },
      },
      courses: {
        include: {
          course: { select: { id: true, title: true, slug: true } },
        },
      },
      waivers: {
        include: {
          waiver: { select: { id: true, title: true, type: true } },
        },
      },
    },
  })
}

export const findProgramList = async (where?: Prisma.ProgramWhereInput) => {
  return db.program.findMany({
    where: { brand: Brand.BBL, ...where },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export const findOrganizationOptions = async () => {
  return db.organization.findMany({
    where: { brand: Brand.BBL },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export const findDisciplineOptions = async () => {
  return db.discipline.findMany({
    where: { OR: [{ isSystem: true }, { brand: Brand.BBL }] },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export const findAvailableCourses = async (programId: string) => {
  // Get courses not already linked to this program
  const linkedCourseIds = await db.programCourse.findMany({
    where: { programId },
    select: { courseId: true },
  })

  const excludeIds = linkedCourseIds.map(c => c.courseId)

  return db.course.findMany({
    where: {
      brand: Brand.BBL,
      ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
    },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  })
}

export const findAvailableWaivers = async (programId: string) => {
  const linkedWaiverIds = await db.programWaiver.findMany({
    where: { programId },
    select: { waiverId: true },
  })

  const excludeIds = linkedWaiverIds.map(w => w.waiverId)

  return db.waiver.findMany({
    where: {
      isActive: true,
      OR: [{ brand: Brand.BBL }, { brand: null }],
      ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
    },
    select: { id: true, title: true, type: true },
    orderBy: { title: "asc" },
  })
}
