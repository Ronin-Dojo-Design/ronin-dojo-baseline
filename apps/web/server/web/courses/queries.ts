import { cacheLife, cacheTag } from "next/cache"
import type { Brand, Prisma } from "~/.generated/prisma/client"
import { parseSort } from "~/server/web/_shared/sortable"
import { courseManyPayload, courseOnePayload } from "~/server/web/courses/payloads"
import { db } from "~/services/db"

const SORTABLE_COURSE_COLUMNS = ["title"] as const

export const searchCourses = async (
  params: {
    q?: string
    discipline?: string
    sort?: string
    page?: number
    perPage?: number
  },
  brand: Brand,
) => {
  "use cache"

  cacheTag("courses")
  cacheLife("minutes")

  const { q, discipline, sort, page = 1, perPage = 12 } = params
  const skip = (page - 1) * perPage

  const { sortBy, sortOrder } = parseSort(sort, SORTABLE_COURSE_COLUMNS)

  const where: Prisma.CourseWhereInput = {
    brand,
    isPublished: true,
    ...(discipline && { discipline: { slug: discipline } }),
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  }

  const [courses, total] = await db.$transaction([
    db.course.findMany({
      where,
      select: courseManyPayload,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { title: "asc" },
      take: perPage,
      skip,
    }),
    db.course.count({ where }),
  ])

  return { courses, total, page, perPage }
}

export const findCourseBySlug = async (slug: string, brand: Brand) => {
  "use cache"

  cacheTag(`course-${slug}`)
  cacheLife("minutes")

  return db.course.findFirst({
    where: { slug, brand, isPublished: true },
    select: courseOnePayload,
  })
}
