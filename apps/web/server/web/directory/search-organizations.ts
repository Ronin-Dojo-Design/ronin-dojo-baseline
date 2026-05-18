import { performance } from "node:perf_hooks"
import { cacheLife, cacheTag } from "next/cache"
import type { Brand } from "~/.generated/prisma/client"
import type { SchoolFilterParams } from "~/server/web/directory/school-schema"
import { organizationManyPayload } from "~/server/web/organization/payloads"
import { db } from "~/services/db"

/**
 * Paginated organization/school search, brand-scoped.
 */
export const searchOrganizations = async (search: SchoolFilterParams, brand: Brand) => {
  "use cache"

  cacheTag("organizations")
  cacheLife("minutes")

  const { q, type, discipline, sort, page, perPage } = search
  const start = performance.now()
  const skip = (page - 1) * perPage
  const take = perPage
  const [sortBy, sortOrder] = sort ? sort.split(".") : [undefined, undefined]

  const where: Record<string, unknown> = { brand }

  if (type) {
    where.type = type
  }
  if (discipline) {
    where.disciplines = { some: { discipline: { slug: discipline } } }
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ]
  }

  const [schools, total] = await db.$transaction([
    db.organization.findMany({
      where: where as any,
      select: {
        ...organizationManyPayload,
      },
      orderBy: sortBy ? { [sortBy]: sortOrder } : { name: "asc" },
      take,
      skip,
    }),
    db.organization.count({ where: where as any }),
  ])

  console.log(`Organizations search: ${Math.round(performance.now() - start)}ms`)

  // Map to school card data shape
  const mappedSchools = schools.map(org => ({
    slug: org.slug,
    name: org.name,
    description: org.description,
    city: org.city,
    region: org.state,
    type: org.type,
    disciplines: org.disciplines,
  }))

  return { schools: mappedSchools, total, page, perPage }
}
