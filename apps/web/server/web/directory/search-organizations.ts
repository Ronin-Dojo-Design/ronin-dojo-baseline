import { performance } from "node:perf_hooks"
import { cacheLife, cacheTag } from "next/cache"
import { parseSort } from "~/server/web/_shared/sortable"
import type { SchoolFilterParams } from "~/server/web/directory/school-schema"
import { organizationManyPayload } from "~/server/web/organization/payloads"
import { db } from "~/services/db"

const SORTABLE_ORGANIZATION_COLUMNS = ["name"] as const

/**
 * Paginated organization/school search.
 *
 * Single-brand simplification (SESSION_0415): the brand scope is collapsed — every
 * Organization in this deployment belongs to the one live brand, so the read no longer
 * pins `brand` (which previously hid the roster on any non-default host). Filters only
 * narrow the result set; they never widen it across a brand boundary because there is none.
 */
export const searchOrganizations = async (search: SchoolFilterParams) => {
  "use cache"

  cacheTag("organizations")
  cacheLife("minutes")

  const { q, type, discipline, city, region, sort, page, perPage } = search
  const start = performance.now()
  const skip = (page - 1) * perPage
  const take = perPage
  const { sortBy, sortOrder } = parseSort(sort, SORTABLE_ORGANIZATION_COLUMNS)

  const where: Record<string, unknown> = {}

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
