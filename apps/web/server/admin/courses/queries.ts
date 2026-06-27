import { Brand, type Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { CoursesTableSchema } from "~/server/admin/courses/schema"
import { db } from "~/services/db"

export const findCourses = async (search: CoursesTableSchema, where?: Prisma.CourseWhereInput) => {
  const { title, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.CourseOrderByWithRelationInput>(search)

  const expressions: (Prisma.CourseWhereInput | undefined)[] = [
    title ? { title: { contains: title, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.CourseWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.CourseWhereInput>({
    baseWhere: { brand: Brand.BBL },
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: courses,
    total,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.course.findMany({
        where: whereQuery,
        include: {
          organization: { select: { id: true, name: true } },
          discipline: { select: { id: true, name: true } },
          _count: { select: { curriculumItems: true, enrollments: true } },
        },
        orderBy: [...orderBy, { createdAt: "asc" }],
        take: perPage,
        skip: offset,
      }),
    count: () => db.course.count({ where: whereQuery }),
  })

  return { courses, total, pageCount }
}

export const findCourseById = async (id: string) => {
  return db.course.findUnique({
    where: { id, brand: Brand.BBL },
    include: {
      organization: { select: { id: true, name: true } },
      discipline: { select: { id: true, name: true } },
      rank: { select: { id: true, name: true } },
      curriculumItems: {
        orderBy: { order: "asc" },
        include: {
          techniqueLinks: {
            include: {
              technique: { select: { id: true, name: true, slug: true, category: true } },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  })
}

export const findCourseList = async (where?: Prisma.CourseWhereInput) => {
  return db.course.findMany({
    where: { brand: Brand.BBL, ...where },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  })
}

export const findCurriculumItems = async (courseId: string) => {
  return db.curriculumItem.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  })
}

export const searchTechniquesForPicker = async (q: string, brand?: string) => {
  const { db } = await import("~/services/db")

  return db.technique.findMany({
    where: {
      ...(brand && { brand: brand as any }),
      isPublished: true,
      OR: [{ name: { contains: q, mode: "insensitive" } }],
    },
    select: { id: true, name: true, slug: true, category: true },
    orderBy: { name: "asc" },
    take: 20,
  })
}
