import type { Prisma } from "~/.generated/prisma/client"

export const courseManyPayload = {
  id: true,
  brand: true,
  title: true,
  slug: true,
  description: true,
  certificationType: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  organization: { select: { id: true, name: true, slug: true } },
  discipline: { select: { id: true, name: true, slug: true } },
  rank: { select: { id: true, name: true } },
  _count: { select: { curriculumItems: true, enrollments: true } },
} satisfies Prisma.CourseSelect

export type CourseMany = Prisma.CourseGetPayload<{
  select: typeof courseManyPayload
}>

export const courseOnePayload = {
  id: true,
  brand: true,
  title: true,
  slug: true,
  description: true,
  certificationType: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  organization: { select: { id: true, name: true, slug: true } },
  discipline: { select: { id: true, name: true, slug: true } },
  rank: { select: { id: true, name: true } },
  curriculumItems: {
    orderBy: { order: "asc" as const },
    select: {
      id: true,
      title: true,
      notes: true,
      order: true,
      mediaUrl: true,
      mediaType: true,
      techniqueLinks: {
        select: {
          technique: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              difficultyLevel: true,
            },
          },
        },
      },
    },
  },
  _count: { select: { enrollments: true } },
} satisfies Prisma.CourseSelect

export type CourseOne = Prisma.CourseGetPayload<{
  select: typeof courseOnePayload
}>
