import { isTruthy } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import type { CoursesTableSchema } from "~/server/admin/courses/schema"
import { db } from "~/services/db"

export const findCourses = async (search: CoursesTableSchema, where?: Prisma.CourseWhereInput) => {
  const { title, sort, page, perPage, from, to, operator } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.CourseWhereInput | undefined)[] = [
    title ? { title: { contains: title, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.CourseWhereInput = {
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [courses, total] = await db.$transaction([
    db.course.findMany({
      where: { ...whereQuery, ...where },
      include: {
        organization: { select: { id: true, name: true } },
        discipline: { select: { id: true, name: true } },
        _count: { select: { curriculumItems: true, enrollments: true } },
      },
      orderBy: [...orderBy, { createdAt: "asc" }],
      take: perPage,
      skip: offset,
    }),

    db.course.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(total / perPage)
  return { courses, total, pageCount }
}

export const findCourseById = async (id: string) => {
  return db.course.findUnique({
    where: { id },
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
    where,
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
      OR: [
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, slug: true, category: true },
    orderBy: { name: "asc" },
    take: 20,
  })
}
