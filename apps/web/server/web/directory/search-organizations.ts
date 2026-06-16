import { performance } from "node:perf_hooks"
import { cacheLife, cacheTag } from "next/cache"
import type { Brand } from "~/.generated/prisma/client"
import { parseSort } from "~/server/web/_shared/sortable"
import type { SchoolFilterParams } from "~/server/web/directory/school-schema"
import { organizationManyPayload } from "~/server/web/organization/payloads"
import { db } from "~/services/db"

const SORTABLE_ORGANIZATION_COLUMNS = ["name"] as const

/**
 * Paginated organization/school search, brand-scoped.
 */
export const searchOrganizations = async (search: SchoolFilterParams, brand: Brand) => {
  "use cache"

  cacheTag("organizations")
  cacheLife("minutes")

  const { q, type, discipline, city, region, sort, page, perPage } = search
  const start = performance.now()
  const skip = (page - 1) * perPage
  const take = perPage
  const { sortBy, sortOrder } = parseSort(sort, SORTABLE_ORGANIZATION_COLUMNS)

  // brand is always server-derived; filters only narrow within the brand.
  const where: Record<string, unknown> = { brand }

  if (type) {
    where.type = type
  }
  if (discipline) {
    where.disciplines = { some: { discipline: { slug: discipline } } }
  }
  if (city) {
    where.city = { contains: city, mode: "insensitive" }
  }
  if (region) {
    // Organizations store region in the `state` column.
    where.state = { contains: region, mode: "insensitive" }
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
    // @added SESSION_0397 — org id for the polymorphic Bookmark subject (school = Organization).
    id: org.id,
    slug: org.slug,
    name: org.name,
    description: org.description,
    city: org.city,
    region: org.state,
    type: org.type,
    phoneE164: org.phoneE164,
    email: org.email,
    websiteUrl: org.websiteUrl,
    disciplines: org.disciplines,
  }))

  return { schools: mappedSchools, total, page, perPage }
}
