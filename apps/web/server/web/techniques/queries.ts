import { performance } from "node:perf_hooks"
import { cacheLife, cacheTag } from "next/cache"
import { type Brand, type Prisma } from "~/.generated/prisma/client"
import { techniqueManyPayload, techniqueOnePayload } from "~/server/web/techniques/payloads"
import type { TechniqueFilterParams } from "~/server/web/techniques/schema"
import { db } from "~/services/db"

export const searchTechniques = async (
  search: TechniqueFilterParams,
  brand: Brand,
  where?: Prisma.TechniqueWhereInput,
) => {
  "use cache"

  cacheTag("techniques")
  cacheLife("minutes")

  const { q, category, position, discipline, sort, page, perPage } = search
  const start = performance.now()
  const skip = (page - 1) * perPage
  const take = perPage
  const [sortBy, sortOrder] = sort.split(".")

  const whereQuery: Prisma.TechniqueWhereInput = {
    brand,
    isPublished: true,
    ...(category && { category: category as any }),
    ...(position && { position: position as any }),
    ...(discipline && { discipline: { slug: discipline } }),
  }

  if (q) {
    whereQuery.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  }

  const [techniques, total] = await db.$transaction([
    db.technique.findMany({
      orderBy: sortBy
        ? { [sortBy]: sortOrder }
        : [{ isFoundational: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      where: { ...whereQuery, ...where },
      select: techniqueManyPayload,
      take,
      skip,
    }),

    db.technique.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  console.log(`Techniques search: ${Math.round(performance.now() - start)}ms`)

  return { techniques, total, page, perPage }
}

export const findTechniqueBySlug = async (slug: string, brand: Brand) => {
  "use cache"

  cacheTag(`technique-${slug}`)
  cacheLife("minutes")

  return db.technique.findFirst({
    where: { slug, brand, isPublished: true },
    select: techniqueOnePayload,
  })
}
